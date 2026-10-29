from energy_tools.voice import VoiceSettings


def test_invalid_voice_provider_fails_closed_to_pipecat(monkeypatch):
    monkeypatch.setenv("VOICE_PROVIDER", "unknown-provider")
    settings = VoiceSettings.from_env()
    assert settings.provider == "pipecat"
    assert settings.public()["capabilities"]["connect"] is True


def test_voice_limits_are_positive_and_do_not_expose_private_stt_tts_settings(monkeypatch):
    monkeypatch.setenv("VOICE_MAX_SESSION_SECONDS", "0")
    monkeypatch.setenv("VOICE_MAX_RECORDING_SECONDS", "bad")
    payload = VoiceSettings.from_env().public()
    assert payload["max_session_seconds"] == 60
    assert payload["max_recording_seconds"] == 30
    assert "stt_provider" not in payload
    assert "tts_provider" not in payload
