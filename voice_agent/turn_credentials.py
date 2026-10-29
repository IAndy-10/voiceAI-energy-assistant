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
) -> dict[str, str]:
    """Return a coturn REST-auth ICE server with a bounded credential lifetime."""
    if not shared_secret:
        raise ValueError("TURN_SHARED_SECRET is required")
    if not host:
        raise ValueError("PIPECAT_TURN_HOST is required")
    if ttl_seconds <= 0:
        raise ValueError("TURN credential TTL must be positive")

    expiry = (int(time.time()) if now is None else now) + ttl_seconds
    username = f"{expiry}:vesta-local"
    credential = base64.b64encode(
        hmac.new(shared_secret.encode("utf-8"), username.encode("utf-8"), hashlib.sha1).digest()
    ).decode("ascii")
    return {
        "urls": f"turn:{host}:3478?transport=udp",
        "username": username,
        "credential": credential,
    }
