"""Safe, provider-selected configuration for the browser voice surface.

This module deliberately contains no provider SDK client and no credentials.  It
lets the UI describe the locally configured transport without allowing a
browser to choose or reconfigure that transport.
"""

from __future__ import annotations

import os
from urllib.error import URLError
from urllib.request import urlopen
from dataclasses import dataclass
from typing import Literal


VoiceProvider = Literal["pipecat", "openai_direct"]
_PROVIDERS = {"pipecat", "openai_direct"}


def _positive_int(name: str, default: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
    except ValueError:
        return default
    return value if value > 0 else default


@dataclass(frozen=True)
class VoiceSettings:
    enabled: bool
    provider: VoiceProvider
    pipecat_url: str
    runner_health_url: str
    max_session_seconds: int
    max_recording_seconds: int
    pipeline_enabled: bool

    def runner_available(self) -> bool:
        """HTTP reachability only; it deliberately does not claim ICE success."""
        if not (self.enabled and self.provider == "pipecat"):
            return False
        try:
            with urlopen(f"{self.runner_health_url}/client/", timeout=1.0) as response:
                return 200 <= response.status < 400
        except (OSError, URLError):
            return False

    @classmethod
    def from_env(cls) -> "VoiceSettings":
        provider = os.getenv("VOICE_PROVIDER", "pipecat").strip().lower()
        if provider not in _PROVIDERS:
            # Fail closed: an unknown value must never select a provider.
            provider = "pipecat"
        return cls(
            enabled=os.getenv("VOICE_ENABLED", "true").strip().lower() == "true",
            provider=provider,  # type: ignore[arg-type]
            pipecat_url=os.getenv("VOICE_PIPECAT_URL", "http://127.0.0.1:7860").rstrip("/"),
            runner_health_url=os.getenv("VOICE_RUNNER_HEALTH_URL", os.getenv("VOICE_PIPECAT_URL", "http://127.0.0.1:7860")).rstrip("/"),
            max_session_seconds=_positive_int("VOICE_MAX_SESSION_SECONDS", 60),
            max_recording_seconds=_positive_int("VOICE_MAX_RECORDING_SECONDS", 30),
            # Audio providers require their own explicit opt-in.  The text
            # assistant's setting must never turn on microphone/audio flows.
            pipeline_enabled=os.getenv("VOICE_PIPELINE_ENABLED", "false").strip().lower() == "true",
        )

    def public(self) -> dict[str, object]:
        """Return only browser-safe state; never include tokens, keys or URLs of APIs."""
        configured = self.enabled and self.provider == "pipecat"
        pipeline = configured and self.pipeline_enabled
        return {
            "enabled": self.enabled,
            "provider": self.provider,
            "pipecat_url": self.pipecat_url if configured else None,
            "max_session_seconds": self.max_session_seconds,
            "max_recording_seconds": self.max_recording_seconds,
            "pipeline_enabled": pipeline,
            "runner_available": self.runner_available(),
            "ice_verified": False,
            "capabilities": {
                "connect": configured,
                "voice_ai_allowed": pipeline,
                "transcription": pipeline,
                "assistant_audio": pipeline,
                "openai_direct": False,
            },
        }
