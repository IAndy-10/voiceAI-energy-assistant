from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_demo_sends_the_pipecat_request_data_property_not_an_ignored_body_property():
    demo = (ROOT / "energy_tools" / "demo.html").read_text(encoding="utf-8")

    assert "requestData:{voice_session_token:grant.session_token,mode:grant.mode}" in demo
    assert "startBotAndConnect({endpoint:voiceConfig.pipecat_url+'/start',body:" not in demo


def test_demo_waits_for_runner_authorization_ack_before_reporting_voice_ai_active():
    demo = (ROOT / "energy_tools" / "demo.html").read_text(encoding="utf-8")

    assert "onServerMessage:data=>" in demo
    assert "voiceAiAuthorized=true" in demo
    assert "esperando validación del runner" in demo
    assert "La autorización de IA de voz fue rechazada o venció" in demo
