"""Require an API-issued voice grant before the runner hands out ICE servers.

Pipecat's ``allowed_origins`` is CORS only: a client outside a browser that
knows the runner URL could call ``POST /start`` and receive ``iceConfig``,
which in ``VOICE_TURN_MODE=twilio`` holds billable Twilio TURN credentials.

This ASGI middleware closes that gap:

- ``POST /start`` must carry ``body.voice_session_token`` and ``body.mode``
  from ``energy-api``'s ``POST /voice/sessions``. The grant is checked without
  being consumed; the bot consumes it when the WebRTC offer starts the session.
- ``/api/offer`` called directly is refused. The browser client always posts
  its offer to ``/sessions/{session_id}/api/offer``, which only exists after an
  authorized ``/start``, so the bot (and its own TURN allocation) never starts
  without one.

Nothing from the request (token, body, SDP) is logged.
"""
from __future__ import annotations

import asyncio
import json
from collections.abc import Awaitable, Callable
from typing import Any

from loguru import logger

from voice_agent.voice_session_api import check_voice_session

GrantCheck = Callable[[object, object], str | None]
Scope = dict[str, Any]
Receive = Callable[[], Awaitable[dict[str, Any]]]
Send = Callable[[dict[str, Any]], Awaitable[None]]

MAX_START_BODY_BYTES = 64 * 1024
DIRECT_OFFER_PATH = "/api/offer"


async def _send_json(send: Send, status: int, detail: str) -> None:
    body = json.dumps({"detail": detail}, ensure_ascii=False).encode("utf-8")
    await send({
        "type": "http.response.start",
        "status": status,
        "headers": [(b"content-type", b"application/json; charset=utf-8"),
                    (b"content-length", str(len(body)).encode("ascii"))],
    })
    await send({"type": "http.response.body", "body": body})


def _grant_from(raw: bytes) -> tuple[object, object]:
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (ValueError, UnicodeDecodeError):
        return None, None
    body = payload.get("body") if isinstance(payload, dict) else None
    if not isinstance(body, dict):
        return None, None
    return body.get("voice_session_token"), body.get("mode")


class VoiceStartGuard:
    def __init__(self, app: Callable[[Scope, Receive, Send], Awaitable[None]], check: GrantCheck = check_voice_session) -> None:
        self.app = app
        self.check = check

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope.get("type") != "http":
            await self.app(scope, receive, send)
            return
        method = scope.get("method", "")
        path = (scope.get("path") or "").rstrip("/") or "/"

        if path == DIRECT_OFFER_PATH and method in {"POST", "PATCH"}:
            logger.warning("voice_start_refused reason=direct_offer")
            await _send_json(send, 403, "Use /start con una autorización de voz.")
            return
        if path != "/start" or method != "POST":
            await self.app(scope, receive, send)
            return

        chunks: list[bytes] = []
        size = 0
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            chunk = message.get("body", b"")
            size += len(chunk)
            if size > MAX_START_BODY_BYTES:
                await _send_json(send, 413, "Solicitud demasiado grande.")
                return
            chunks.append(chunk)
            if not message.get("more_body", False):
                break
        raw = b"".join(chunks)

        token, mode = _grant_from(raw)
        accepted = await asyncio.to_thread(self.check, token, mode) if token else None
        if accepted is None:
            logger.warning("voice_start_refused reason=missing_or_invalid_session_grant")
            await _send_json(send, 401, "Autorización de voz inválida o vencida. Vuelva a conectar desde el asistente.")
            return

        replayed = False

        async def replay() -> dict[str, Any]:
            nonlocal replayed
            if not replayed:
                replayed = True
                return {"type": "http.request", "body": raw, "more_body": False}
            return await receive()

        await self.app(scope, replay, send)


def install_start_guard(check: GrantCheck = check_voice_session) -> None:
    """Add the guard to Pipecat's module-level app before the runner starts.

    Added before ``pipecat.runner.run.main`` adds its CORS middleware, so CORS
    stays outermost: preflights are answered and refusals carry CORS headers
    the browser can read.
    """
    from pipecat.runner.run import app

    app.add_middleware(VoiceStartGuard, check=check)
    logger.info("Voice /start requires an API-issued session grant")
