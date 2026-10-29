"""Safe, provider-selected configuration for the browser voice surface.

This module deliberately contains no provider SDK client and no credentials.  It
lets the UI describe the locally configured transport without allowing a
browser to choose or reconfigure that transport.
"""

from __future__ import annotations

import os
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
    max_session_seconds: int
    max_recording_seconds: int
    pipeline_enabled: bool

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
            max_session_seconds=_positive_int("VOICE_MAX_SESSION_SECONDS", 60),
            max_recording_seconds=_positive_int("VOICE_MAX_RECORDING_SECONDS", 30),
            # Same rule as voice_agent: follow the AI assistant's OpenAI switch unless overridden.
            pipeline_enabled=(os.getenv("VOICE_PIPELINE_ENABLED") or os.getenv("OPENAI_ENABLED", "false")).strip().lower() == "true",
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
            "capabilities": {
                "connect": configured,
                "transcription": pipeline,
                "assistant_audio": pipeline,
                "openai_direct": False,
            },
        }
