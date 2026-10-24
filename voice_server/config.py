"""Server configuration, read once from environment variables (see .env.example)."""

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def _env_bool(name: str, default: bool) -> bool:
    raw = _env(name)
    return default if not raw else raw.lower() in ("1", "true", "yes", "on")


def _env_list(name: str, default: str = "") -> list[str]:
    return [x.strip() for x in _env(name, default).split(",") if x.strip()]


@dataclass(frozen=True)
class Config:
    # Dashboard → server
    voice_passcode: str = ""
    snapshot_path: Path = Path("/data/agent_snapshot.json")
    # "null" is the Origin a browser sends for a page opened from file://
    cors_origins: list[str] = field(default_factory=lambda: ["null"])

    # Twilio
    public_host: str = ""
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    validate_twilio_signature: bool = True
    allowed_callers: list[str] = field(default_factory=list)
    max_call_secs: int = 600

    # LLM
    anthropic_api_key: str = ""
    llm_model: str = "claude-sonnet-5-5"
    llm_effort: str = "low"
    llm_thinking: str = "adaptive"
    llm_max_tokens: int = 1024
    llm_server_fallback: bool = True

    # Speech
    stt_provider: str = "deepgram"
    tts_provider: str = "azure"
    deepgram_api_key: str = ""
    deepgram_model: str = "nova-3-general"
    deepgram_keyterms: bool = False
    azure_speech_key: str = ""
    azure_speech_region: str = "eastus"
    azure_tts_voice: str = "es-CL-CatalinaNeural"
    elevenlabs_api_key: str = ""
    elevenlabs_voice_id: str = ""
    elevenlabs_model: str = "eleven_flash_v2_5"

    @classmethod
    def from_env(cls) -> "Config":
        return cls(
            voice_passcode=_env("VOICE_PASSCODE"),
            snapshot_path=Path(_env("SNAPSHOT_PATH", "/data/agent_snapshot.json")),
            cors_origins=_env_list("CORS_ORIGINS", "null"),
            public_host=_env("PUBLIC_HOST"),
            twilio_account_sid=_env("TWILIO_ACCOUNT_SID"),
            twilio_auth_token=_env("TWILIO_AUTH_TOKEN"),
            validate_twilio_signature=_env_bool("TWILIO_VALIDATE_SIGNATURE", True),
            allowed_callers=_env_list("ALLOWED_CALLERS"),
            max_call_secs=int(_env("MAX_CALL_SECS", "600")),
            anthropic_api_key=_env("ANTHROPIC_API_KEY"),
            llm_model=_env("LLM_MODEL", "claude-sonnet-5-5"),
            llm_effort=_env("LLM_EFFORT", "low"),
            llm_thinking=_env("LLM_THINKING", "adaptive"),
            llm_max_tokens=int(_env("LLM_MAX_TOKENS", "1024")),
            llm_server_fallback=_env_bool("LLM_SERVER_FALLBACK", True),
            stt_provider=_env("STT_PROVIDER", "deepgram").lower(),
            tts_provider=_env("TTS_PROVIDER", "azure").lower(),
            deepgram_api_key=_env("DEEPGRAM_API_KEY"),
            deepgram_model=_env("DEEPGRAM_MODEL", "nova-3-general"),
            deepgram_keyterms=_env_bool("DEEPGRAM_KEYTERMS", False),
            azure_speech_key=_env("AZURE_SPEECH_KEY"),
            azure_speech_region=_env("AZURE_SPEECH_REGION", "eastus"),
            azure_tts_voice=_env("AZURE_TTS_VOICE", "es-CL-CatalinaNeural"),
            elevenlabs_api_key=_env("ELEVENLABS_API_KEY"),
            elevenlabs_voice_id=_env("ELEVENLABS_VOICE_ID"),
            elevenlabs_model=_env("ELEVENLABS_MODEL", "eleven_flash_v2_5"),
        )

    def llm_request_options(self) -> dict[str, Any]:
        """Thinking/effort/fallback fields shared by the phone bot and the text harness.

        Claude Sonnet 5.5 rejects ``thinking: disabled``; for low latency the
        default is adaptive thinking at ``low`` effort (it skips thinking on
        simple turns). ``LLM_THINKING=between_tools`` is the lowest setting if
        measured latency is still too high. Server-side fallback
        (``fallbacks: "default"``) retries a safety decline on another model.
        No temperature/top_p/top_k: they return a 400 on current models.
        """
        opts: dict[str, Any] = {"output_config": {"effort": self.llm_effort}}
        if self.llm_thinking == "between_tools":
            opts["thinking"] = {"type": "between_tools"}
        else:
            opts["thinking"] = {"type": "adaptive"}
        if self.llm_server_fallback:
            opts["fallbacks"] = "default"
        return opts

    def llm_betas(self) -> list[str]:
        return ["server-side-fallback-2026-07-01"] if self.llm_server_fallback else []

    def missing_for_calls(self) -> list[str]:
        """Settings a phone call can't work without, for /status and startup logs."""
        missing = []
        if not self.anthropic_api_key:
            missing.append("ANTHROPIC_API_KEY")
        if not (self.twilio_account_sid and self.twilio_auth_token):
            missing.append("TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN")
        if not self.public_host:
            missing.append("PUBLIC_HOST")
        if not self.allowed_callers:
            missing.append("ALLOWED_CALLERS")
        if self.stt_provider == "deepgram" and not self.deepgram_api_key:
            missing.append("DEEPGRAM_API_KEY")
        if "azure" in (self.stt_provider, self.tts_provider) and not self.azure_speech_key:
            missing.append("AZURE_SPEECH_KEY")
        if self.tts_provider == "elevenlabs" and not (self.elevenlabs_api_key and self.elevenlabs_voice_id):
            missing.append("ELEVENLABS_API_KEY/ELEVENLABS_VOICE_ID")
        return missing
