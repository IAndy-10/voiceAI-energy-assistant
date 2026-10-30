"""Ephemeral, one-use authorizations for Pipecat voice sessions."""
from __future__ import annotations

import secrets
import threading
import time
from dataclasses import dataclass
from typing import Literal

VoiceMode = Literal["minimal", "ai"]


@dataclass(frozen=True)
class VoiceGrant:
    token: str
    mode: VoiceMode
    expires_at: int


class VoiceSessionAuthority:
    def __init__(self, ttl_seconds: int = 90) -> None:
        self.ttl_seconds = max(15, ttl_seconds)
        self._grants: dict[str, VoiceGrant] = {}
        self._lock = threading.Lock()

    def issue(self, mode: VoiceMode, *, ai_allowed: bool) -> VoiceGrant:
        if mode == "ai" and not ai_allowed:
            raise PermissionError("La IA de voz no está autorizada por el servidor.")
        grant = VoiceGrant(secrets.token_urlsafe(32), mode, int(time.time()) + self.ttl_seconds)
        with self._lock:
            self._purge()
            self._grants[grant.token] = grant
        return grant

    def consume(self, token: str, mode: str) -> VoiceMode | None:
        with self._lock:
            self._purge()
            grant = self._grants.pop(token, None)
        if grant is None or grant.mode != mode:
            return None
        return grant.mode

    def _purge(self) -> None:
        now = int(time.time())
        self._grants = {token: grant for token, grant in self._grants.items() if grant.expires_at > now}
