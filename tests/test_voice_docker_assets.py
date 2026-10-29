from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_voice_runtime_is_isolated_and_pinned():
    requirements = (ROOT / "voice_agent" / "requirements-voice.txt").read_text(encoding="utf-8")
    dockerfile = (ROOT / "voice_agent" / "Dockerfile").read_text(encoding="utf-8")
    assert "pipecat-ai[webrtc,silero,openai,runner]==1.14.0" in requirements
    for local_only in ("whisper", "piper", "ollama"):
        assert local_only not in requirements.split("pipecat-ai[")[1].split("]")[0]
    assert "python:3.12-slim" in dockerfile
    assert "python -m voice_agent.smoke_test" in dockerfile


def test_voice_service_is_opt_in_local_and_internal_to_energy_api():
    compose = (ROOT / "compose.yaml").read_text(encoding="utf-8")
    assert "voice-agent:" in compose
    assert 'profiles: ["voice"]' in compose
    assert "VOICE_AGENT_ENABLED: ${VOICE_AGENT_ENABLED:-false}" in compose
    assert "VOICE_ENERGY_API_BASE_URL: http://energy-api:8000" in compose
    assert "127.0.0.1:7860:7860" in compose


def test_voice_command_keeps_python_executable_before_runner_arguments():
    compose = (ROOT / "compose.yaml").read_text(encoding="utf-8")
    assert 'command: ["python", "-m", "voice_agent.webrtc_turn_runner", "-t", "webrtc"' in compose
    assert 'command: ["-t", "webrtc"' not in compose


def test_voice_virtual_environment_is_ignored():
    ignored = (ROOT / ".gitignore").read_text(encoding="utf-8")
    docker_ignored = (ROOT / ".dockerignore").read_text(encoding="utf-8")
    assert "/voice_agent/.venv/" in ignored
    assert "voice_agent/.venv/" in docker_ignored


def test_webrtc_local_diagnostic_keeps_signaling_and_udp_loopback_only():
    diagnostic = (ROOT / "compose.webrtc-local.yaml").read_text(encoding="utf-8")
    assert 'profiles: ["webrtc-local"]' in diagnostic
    assert 'net.ipv4.ip_local_port_range: "40000 40100"' in diagnostic
    assert '"127.0.0.1:7861:7861/tcp"' in diagnostic
    assert '"127.0.0.1:40000-40100:40000-40100/udp"' in diagnostic
    assert '"python", "-m", "voice_agent.webrtc_runner", "-t", "webrtc"' in diagnostic


def test_turn_diagnostic_uses_pinned_image_and_private_runtime_configuration():
    diagnostic = (ROOT / "compose.webrtc-turn.yaml").read_text(encoding="utf-8")
    assert "coturn/coturn:4.6.3-r3-alpine" in diagnostic
    assert ".env.turn.local" in diagnostic
    assert "turnserver.local.conf" in diagnostic
    assert '"127.0.0.1:3478:3478/udp"' in diagnostic
    assert '"127.0.0.1:49160-49169:49160-49169/udp"' in diagnostic
    assert "voice_agent.webrtc_turn_runner" in diagnostic
    assert "TURN_SHARED_SECRET" not in diagnostic


def test_voice_profile_relays_media_through_loopback_turn_and_shares_openai_switch():
    compose = (ROOT / "compose.yaml").read_text(encoding="utf-8")
    assert "turn-local:" in compose
    assert "coturn/coturn:4.6.3-r3-alpine" in compose
    assert '"127.0.0.1:3478:3478/udp"' in compose
    # Relay ports stay on the Compose network; publishing them is not needed.
    assert "49160-49169:49160-49169" not in compose
    # The bot (aiortc) uses the first TURN host, so the Compose service name goes first.
    assert "PIPECAT_TURN_HOST: turn-local,127.0.0.1" in compose
    assert "TURN_SHARED_SECRET: ${TURN_SHARED_SECRET:-}" in compose
    assert compose.count("VOICE_PIPELINE_ENABLED: ${VOICE_PIPELINE_ENABLED:-${OPENAI_ENABLED:-false}}") == 2
    assert "VOICE_PIPECAT_URL: ${VOICE_PIPECAT_URL:-http://127.0.0.1:7860}" in compose
