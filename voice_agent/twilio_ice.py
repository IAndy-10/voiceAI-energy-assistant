"""Twilio Network Traversal Service (TURN) credentials for remote voice sessions.

The browser of a remote user cannot reach the local coturn relay, so in
``VOICE_TURN_MODE=twilio`` both peers relay media through Twilio. Twilio only
forwards the encrypted SRTP stream; it cannot listen to the session.

Credentials expire after their ``ttl``. ``IceServerRefresher`` keeps one shared
list up to date in place and pushes each new set to registered WebRTC handlers,
so the runner never has to restart. Nothing here logs or raises with the
account SID, the auth token or the TURN credentials.
"""

from __future__ import annotations

import base64
import json
import threading
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Callable
from typing import Any

from loguru import logger

TWILIO_TOKENS_URL = "https://api.twilio.com/2010-04-01/Accounts/{sid}/Tokens.json"
MIN_REFRESH_SECONDS = 60
MAX_RETRY_SECONDS = 900

IceServers = list[dict[str, Any]]
Fetch = Callable[[], tuple[IceServers, int]]


class TwilioIceError(RuntimeError):
    """A Twilio credential request failed. The message never contains secrets."""


def _is_turn_udp(urls: str | list[str]) -> bool:
    first = urls if isinstance(urls, str) else (urls[0] if urls else "")
    return first.startswith("turn:") and "transport=tcp" not in first


def _rank(server: dict[str, Any]) -> int:
    urls = server["urls"]
    first = urls if isinstance(urls, str) else (urls[0] if urls else "")
    if first.startswith("stun:"):
        return 0
    return 1 if _is_turn_udp(urls) else 2


def normalize_ice_servers(raw: Any) -> IceServers:
    """Keep only the keys Pipecat accepts and put TURN over UDP first.

    Twilio also returns a legacy ``url`` key, which Pipecat 1.14 rejects.
    aiortc (the bot) uses only the first TURN URL, so UDP goes first; the
    browser still tries every entry. The sort is stable, so Twilio's order is
    otherwise preserved.
    """
    if not isinstance(raw, list):
        raise TwilioIceError("Twilio response has no ice_servers list")
    servers: IceServers = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        urls = item.get("urls") or item.get("url")
        if not urls or not isinstance(urls, (str, list)):
            continue
        entry: dict[str, Any] = {"urls": urls}
        if item.get("username") and item.get("credential"):
            entry["username"] = item["username"]
            entry["credential"] = item["credential"]
        servers.append(entry)
    servers.sort(key=_rank)
    if not any(_rank(s) > 0 and "credential" in s for s in servers):
        raise TwilioIceError("Twilio response has no TURN server with credentials")
    return servers


def fetch_twilio_ice_servers(
    account_sid: str,
    auth_token: str,
    *,
    ttl_seconds: int = 86400,
    timeout: float = 10.0,
    opener: Callable[..., Any] = urllib.request.urlopen,
) -> tuple[IceServers, int]:
    """Request short-lived ICE servers from Twilio. Returns ``(servers, ttl)``."""
    if not account_sid or not auth_token:
        raise TwilioIceError("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required")
    if not account_sid.startswith("AC"):
        raise TwilioIceError("TWILIO_ACCOUNT_SID must be an account SID (it starts with AC)")
    if ttl_seconds <= 0:
        raise TwilioIceError("TURN credential TTL must be positive")

    basic = base64.b64encode(f"{account_sid}:{auth_token}".encode("utf-8")).decode("ascii")
    request = urllib.request.Request(
        TWILIO_TOKENS_URL.format(sid=urllib.parse.quote(account_sid, safe="")),
        data=urllib.parse.urlencode({"Ttl": str(ttl_seconds)}).encode("ascii"),
        method="POST",
        headers={"Authorization": f"Basic {basic}", "Accept": "application/json"},
    )
    try:
        with opener(request, timeout=timeout) as response:
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        # HTTPError carries the request URL (with the SID); keep only the status.
        raise TwilioIceError(f"Twilio rejected the TURN credential request (HTTP {exc.code})") from None
    except (urllib.error.URLError, TimeoutError, OSError):
        raise TwilioIceError("Could not reach Twilio for TURN credentials") from None
    except (ValueError, UnicodeDecodeError):
        raise TwilioIceError("Twilio returned an invalid TURN credential response") from None

    if not isinstance(body, dict):
        raise TwilioIceError("Twilio returned an invalid TURN credential response")
    servers = normalize_ice_servers(body.get("ice_servers"))
    try:
        ttl = int(body.get("ttl", ttl_seconds))
    except (TypeError, ValueError):
        ttl = ttl_seconds
    return servers, ttl if ttl > 0 else ttl_seconds


def refresh_delay(ttl_seconds: int) -> int:
    """Renew at 80 % of the lifetime, so a 5-minute session never outlives it."""
    return max(MIN_REFRESH_SECONDS, int(ttl_seconds * 0.8))


class IceServerRefresher:
    """Keeps ``servers`` (one shared list) and registered handlers current.

    ``servers`` is mutated in place: the Pipecat runner reads it on every
    ``/start`` to hand the browser its ICE configuration. Handlers are the
    runner's ``SmallWebRTCRequestHandler`` instances, which build the bot's own
    peer connections; they get each new set through ``update_ice_servers``.
    """

    def __init__(
        self,
        fetch: Fetch,
        *,
        to_handler_servers: Callable[[IceServers], Any] | None = None,
    ) -> None:
        self.servers: IceServers = []
        self._fetch = fetch
        self._to_handler_servers = to_handler_servers or (lambda servers: list(servers))
        self._handlers: list[Any] = []
        self._lock = threading.Lock()
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def register(self, handler: Any) -> None:
        with self._lock:
            self._handlers.append(handler)
            if self.servers:
                handler.update_ice_servers(self._to_handler_servers(list(self.servers)))

    def refresh(self) -> int:
        """Fetch a new set and publish it. Returns its TTL in seconds."""
        servers, ttl = self._fetch()
        with self._lock:
            self.servers[:] = servers
            for handler in self._handlers:
                handler.update_ice_servers(self._to_handler_servers(list(servers)))
        logger.info(f"Twilio TURN credentials ready ({len(servers)} ICE servers, valid for {ttl} s)")
        return ttl

    def try_refresh(self) -> int | None:
        try:
            return self.refresh()
        except TwilioIceError as exc:
            logger.error(f"Twilio TURN credentials unavailable: {exc}")
            return None

    def next_wait(self, ttl: int | None, previous_retry: int) -> tuple[int, int]:
        """Return ``(wait, retry)``: renew before expiry, or back off after a failure."""
        if ttl is not None:
            return refresh_delay(ttl), MIN_REFRESH_SECONDS
        retry = min(MAX_RETRY_SECONDS, max(MIN_REFRESH_SECONDS, previous_retry))
        return retry, min(MAX_RETRY_SECONDS, retry * 2)

    def start(self, initial_ttl: int | None) -> None:
        """Run the renewal loop in a daemon thread."""

        def loop() -> None:
            wait, retry = self.next_wait(initial_ttl, MIN_REFRESH_SECONDS)
            while not self._stop.wait(wait):
                wait, retry = self.next_wait(self.try_refresh(), retry)

        self._thread = threading.Thread(target=loop, name="twilio-ice-refresher", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
