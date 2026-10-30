"""Temporary coturn REST credentials for the local WebRTC diagnostic."""

from __future__ import annotations

import base64
import hashlib
import hmac
import time


def build_turn_ice_server(
    shared_secret: str,
    host: str,
    *,
    ttl_seconds: int = 600,
    now: int | None = None,
) -> dict[str, str | list[str]]:
    """Return a coturn REST-auth ICE server with a bounded credential lifetime.

    ``host`` may list several comma-separated hosts for the same TURN server, as
    seen from each peer. aiortc (the bot) uses only the first TURN URL, so the
    container-side host goes first; the browser tries every URL.
    """
    if not shared_secret:
        raise ValueError("TURN_SHARED_SECRET is required")
    hosts = [item.strip() for item in host.split(",") if item.strip()]
    if not hosts:
        raise ValueError("PIPECAT_TURN_HOST is required")
    if ttl_seconds <= 0:
        raise ValueError("TURN credential TTL must be positive")

    expiry = (int(time.time()) if now is None else now) + ttl_seconds
    username = f"{expiry}:vesta-local"
    credential = base64.b64encode(
        hmac.new(shared_secret.encode("utf-8"), username.encode("utf-8"), hashlib.sha1).digest()
    ).decode("ascii")
    urls = [f"turn:{item}:3478?transport=udp" for item in hosts]
    return {
        "urls": urls[0] if len(urls) == 1 else urls,
        "username": username,
        "credential": credential,
    }
