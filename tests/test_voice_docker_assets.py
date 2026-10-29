from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_voice_runtime_is_isolated_and_pinned():
    requirements = (ROOT / "voice_agent" / "requirements-voice.txt").read_text(encoding="utf-8")
    dockerfile = (ROOT / "voice_agent" / "Dockerfile").read_text(encoding="utf-8")
    assert "pipecat-ai[webrtc,openai,runner]==1.14.0" in requirements
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
    assert 'command: ["python", "-m", "voice_agent.webrtc_runner", "-t", "webrtc"' in compose
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
