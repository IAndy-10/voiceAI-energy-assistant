"""FastAPI service: snapshot sync from the dashboard plus the Twilio call endpoints.

Run with:  uvicorn --factory voice_server.app:create_app --host 0.0.0.0 --port 8080

    POST /snapshot       dashboard → server (Bearer passcode), validated and saved to the volume
    GET  /status         health + which snapshot is loaded (no business figures)
    POST /twilio/voice   Twilio webhook: signature + caller allowlist → TwiML <Connect><Stream>
    WS   /twilio/stream  Twilio Media Stream → Pipecat pipeline (voice_server.bot)
"""

import hashlib
import hmac
import secrets
import sys
import time
from collections.abc import Awaitable, Callable
from typing import Any
from xml.sax.saxutils import escape, quoteattr

from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from loguru import logger
from twilio.request_validator import RequestValidator

from voice_server.config import Config
from voice_server.snapshot import MAX_SNAPSHOT_BYTES, Snapshot, SnapshotError, SnapshotStore, parse_snapshot

CallRunner = Callable[[WebSocket, Any, Snapshot, Config], Awaitable[None]]
NoDataRunner = Callable[[WebSocket, Any, Config], Awaitable[None]]

REJECT_MESSAGE = "Este número es privado. La llamada terminará."


def _mask(number: str) -> str:
    """Log callers without storing full phone numbers."""
    return f"…{number[-4:]}" if len(number) > 4 else "?"


def _twiml(body: str) -> Response:
    return Response(f'<?xml version="1.0" encoding="UTF-8"?><Response>{body}</Response>',
                    media_type="application/xml")


def recent_errors() -> list[dict[str, str]]:
    # Read only if a call already imported the bot (importing it loads all of Pipecat)
    bot = sys.modules.get("voice_server.bot")
    return list(bot.RECENT_ERRORS) if bot else []


async def _default_run_call(ws: WebSocket, call: Any, snap: Snapshot, cfg: Config) -> None:
    from voice_server.bot import run_call

    await run_call(ws, call, snap, cfg)


async def _default_no_data(ws: WebSocket, call: Any, cfg: Config) -> None:
    from voice_server.bot import run_no_data_call

    await run_no_data_call(ws, call, cfg)


def create_app(
    cfg: Config | None = None,
    store: SnapshotStore | None = None,
    run_call: CallRunner = _default_run_call,
    run_no_data_call: NoDataRunner = _default_no_data,
) -> FastAPI:
    cfg = cfg or Config.from_env()
    if store is None:
        store = SnapshotStore(cfg.snapshot_path)
        store.load()
    started = time.time()
    state = {"active_calls": 0}
    # Signs the per-call token in the TwiML so /twilio/stream only serves calls the webhook accepted
    token_key = (cfg.twilio_auth_token or cfg.voice_passcode or secrets.token_hex(32)).encode()

    def call_token(call_sid: str) -> str:
        return hmac.new(token_key, call_sid.encode(), hashlib.sha256).hexdigest()

    missing = cfg.missing_for_calls()
    if missing:
        logger.warning(f"[Config] phone calls won't work until these are set: {', '.join(missing)}")
    if not cfg.voice_passcode:
        logger.warning("[Config] VOICE_PASSCODE is not set: POST /snapshot is disabled")

    app = FastAPI(title="Multicentro voice assistant", docs_url=None, redoc_url=None)
    app.state.store = store
    # Bearer header, no cookies: allowing the file:// origin ("null") is safe here
    app.add_middleware(CORSMiddleware, allow_origins=cfg.cors_origins, allow_methods=["GET", "POST"],
                       allow_headers=["Authorization", "Content-Type"], allow_credentials=False)

    # ── dashboard ───────────────────────────────────────────────────

    @app.get("/status")
    async def status() -> dict[str, Any]:
        snap = store.current
        return {
            "ok": True,
            "uptime_s": round(time.time() - started),
            "active_calls": state["active_calls"],
            "snapshot": None if snap is None else {
                "schema_version": snap["schema_version"],
                "generated_at": snap["generated_at"],
                "generated_local": snap["generated_local"],
                "sources": [s.get("file") for s in snap["sources"]],
            },
            "providers": {"stt": cfg.stt_provider, "tts": cfg.tts_provider, "llm": cfg.llm_model},
            "missing_config": missing,
            "recent_call_errors": recent_errors(),
        }

    @app.post("/snapshot")
    async def post_snapshot(request: Request) -> JSONResponse:
        if not cfg.voice_passcode:
            return JSONResponse({"error": "VOICE_PASSCODE no está configurado en el servidor."}, status_code=503)
        auth = request.headers.get("authorization", "")
        given = auth[7:] if auth.lower().startswith("bearer ") else ""
        if not hmac.compare_digest(given.encode(), cfg.voice_passcode.encode()):
            logger.warning("[Snapshot] upload rejected: wrong passcode")
            return JSONResponse({"error": "Clave incorrecta."}, status_code=401)
        length = request.headers.get("content-length")
        if length and length.isdigit() and int(length) > MAX_SNAPSHOT_BYTES:
            return JSONResponse({"error": "Snapshot demasiado grande."}, status_code=413)
        try:
            snap = parse_snapshot(await request.body())
        except SnapshotError as e:
            logger.warning(f"[Snapshot] upload rejected: {e}")
            return JSONResponse({"error": str(e)}, status_code=422)
        try:
            store.save(snap)
        except OSError as e:
            logger.error(f"[Snapshot] could not write {store.path}: {e}")
            return JSONResponse({"error": "No se pudo guardar el snapshot en el servidor."}, status_code=500)
        return JSONResponse({"ok": True, "generated_at": snap["generated_at"],
                             "generated_local": snap["generated_local"],
                             "sources": [s.get("file") for s in snap["sources"]]})

    # ── Twilio ──────────────────────────────────────────────────────

    def public_host(request: Request) -> str:
        return cfg.public_host or request.headers.get("host", "")

    @app.post("/twilio/voice")
    async def twilio_voice(request: Request) -> Response:
        form = {k: str(v) for k, v in (await request.form()).items()}
        host = public_host(request)
        if cfg.validate_twilio_signature:
            # Twilio signs the public https URL it called, not the proxied one we see
            url = f"https://{host}{request.url.path}" + (f"?{request.url.query}" if request.url.query else "")
            signature = request.headers.get("x-twilio-signature", "")
            if not cfg.twilio_auth_token or not RequestValidator(cfg.twilio_auth_token).validate(url, form, signature):
                logger.warning(f"[Twilio] webhook rejected: invalid signature for {url}")
                return Response("Forbidden", status_code=403)

        caller, call_sid = form.get("From", ""), form.get("CallSid", "")
        if caller not in cfg.allowed_callers:
            logger.warning(f"[Twilio] call {call_sid} from {_mask(caller)} not on the allowlist")
            return _twiml(f'<Say language="es-MX">{escape(REJECT_MESSAGE)}</Say><Hangup/>')

        logger.info(f"[Twilio] call {call_sid} from {_mask(caller)} accepted")
        stream_url = f"wss://{host}/twilio/stream"
        return _twiml(
            f"<Connect><Stream url={quoteattr(stream_url)}>"
            f'<Parameter name="token" value={quoteattr(call_token(call_sid))}/>'
            "</Stream></Connect>"
        )

    @app.websocket("/twilio/stream")
    async def twilio_stream(ws: WebSocket) -> None:
        from pipecat.runner.utils import parse_telephony_websocket

        from voice_server.bot import CallInfo

        await ws.accept()
        try:
            transport_type, call_data = await parse_telephony_websocket(ws)
        except ValueError as e:
            logger.warning(f"[Twilio] stream closed before the handshake: {e}")
            return
        call_sid = call_data.call_id or ""
        token = str(call_data.body.get("token", ""))
        if transport_type != "twilio" or not call_sid or not hmac.compare_digest(token, call_token(call_sid)):
            logger.warning(f"[Twilio] stream rejected: type={transport_type} call={call_sid or '?'} bad token")
            await ws.close(code=1008)
            return

        call = CallInfo(stream_sid=call_data.stream_id or "", call_sid=call_sid)
        snap = store.current  # pinned for the whole call
        state["active_calls"] += 1
        try:
            if snap is None:
                logger.warning(f"[Call] {call_sid}: no snapshot synced yet")
                await run_no_data_call(ws, call, cfg)
            else:
                await run_call(ws, call, snap, cfg)
        except Exception:
            # One broken call must not take the server down; the traceback goes to the log
            logger.exception(f"[Call] {call_sid} failed")
        finally:
            state["active_calls"] -= 1
            logger.info(f"[Call] {call_sid} ended")

    return app
