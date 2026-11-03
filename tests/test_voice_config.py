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


def test_pipeline_capabilities_are_exposed_only_when_explicitly_enabled(monkeypatch):
    monkeypatch.setenv("VOICE_PIPELINE_ENABLED", "true")
    payload = VoiceSettings.from_env().public()
    assert payload["pipeline_enabled"] is True
    assert payload["capabilities"]["transcription"] is True
    assert payload["capabilities"]["assistant_audio"] is True


def test_openai_switch_does_not_enable_voice_pipeline(monkeypatch):
    monkeypatch.delenv("VOICE_PIPELINE_ENABLED", raising=False)
    monkeypatch.setenv("OPENAI_ENABLED", "true")
    assert VoiceSettings.from_env().public()["pipeline_enabled"] is False


def test_windows_runner_uses_public_browser_url_and_distinct_container_health_url(monkeypatch):
    monkeypatch.setenv("VOICE_PIPECAT_URL", "http://127.0.0.1:7861")
    monkeypatch.setenv("VOICE_RUNNER_HEALTH_URL", "http://host.docker.internal:7861")
    settings = VoiceSettings.from_env()
    assert settings.pipecat_url == "http://127.0.0.1:7861"
    assert settings.runner_health_url == "http://host.docker.internal:7861"
    assert "health" not in settings.public()
