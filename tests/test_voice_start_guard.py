import json

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

from voice_agent import start_guard
from voice_agent.start_guard import VoiceStartGuard

ORIGIN = "https://demo-x.trycloudflare.com"
GRANT = {"voice_session_token": "live-grant", "mode": "ai"}


def _app(checked):
    """Mimic the runner: guard inside CORS, /start returning ICE servers."""
    app = FastAPI()

    def check(token, mode):
        checked.append((token, mode))
        return mode if token == "live-grant" else None

    @app.post("/start")
    async def start(request: Request):
        data = await request.json()
        return {"sessionId": "s1", "body": data.get("body"), "iceConfig": {"iceServers": [{"urls": "turn:x"}]}}

    @app.post("/api/offer")
    async def offer():
        return {"sdp": "answer"}

    @app.post("/sessions/{session_id}/api/offer")
    async def session_offer(session_id: str):
        return {"sdp": "answer", "session": session_id}

    @app.get("/status")
    async def status():
        return {"ok": True}

    app.add_middleware(VoiceStartGuard, check=check)
    app.add_middleware(CORSMiddleware, allow_origins=[ORIGIN], allow_methods=["*"], allow_headers=["*"])
    return TestClient(app)


def test_start_without_a_grant_never_returns_ice_servers():
    checked = []
    client = _app(checked)
    for payload in ({}, {"body": {}}, {"body": {"mode": "ai"}}, {"body": "x"}, {"body": {**GRANT, "voice_session_token": "stolen"}}):
        response = client.post("/start", json=payload)
        assert response.status_code == 401
        assert "iceConfig" not in response.text
    assert client.post("/start", content=b"not json").status_code == 401
    # Only the forged token reached the API check; empty tokens are refused locally.
    assert checked == [("stolen", "ai")]


def test_start_with_a_live_grant_reaches_pipecat_with_the_body_intact():
    checked = []
    client = _app(checked)
    response = client.post("/start", json={"transport": "webrtc", "body": GRANT}, headers={"Origin": ORIGIN})
    assert response.status_code == 200
    assert response.json()["body"] == GRANT
    assert response.json()["iceConfig"]["iceServers"]
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert checked == [("live-grant", "ai")]


def test_refusals_carry_cors_headers_and_preflight_is_not_blocked():
    client = _app([])
    refused = client.post("/start", json={}, headers={"Origin": ORIGIN})
    assert refused.status_code == 401
    assert refused.headers["access-control-allow-origin"] == ORIGIN
    assert "Autorización de voz" in refused.json()["detail"]
    preflight = client.options("/start", headers={"Origin": ORIGIN, "Access-Control-Request-Method": "POST"})
    assert preflight.status_code == 200


def test_direct_offer_is_refused_but_session_scoped_offer_and_other_routes_pass():
    client = _app([])
    assert client.post("/api/offer", json={"sdp": "x", "type": "offer"}).status_code == 403
    assert client.patch("/api/offer", json={"pc_id": "x", "candidates": []}).status_code == 403
    assert client.post("/sessions/s1/api/offer", json={"sdp": "x"}).status_code == 200
    assert client.get("/status").json() == {"ok": True}


def test_oversized_start_body_is_refused_without_checking_the_grant():
    checked = []
    client = _app(checked)
    payload = json.dumps({"body": {**GRANT, "pad": "x" * start_guard.MAX_START_BODY_BYTES}})
    assert client.post("/start", content=payload, headers={"Content-Type": "application/json"}).status_code == 413
    assert checked == []


def test_refusal_logs_never_contain_the_token():
    from loguru import logger

    sink = []
    handler = logger.add(sink.append, format="{message}")
    try:
        _app([]).post("/start", json={"body": {"voice_session_token": "secret-grant-value", "mode": "ai"}})
    finally:
        logger.remove(handler)
    assert sink and not any("secret-grant-value" in str(line) for line in sink)


def test_install_wraps_the_pipecat_runner_app(monkeypatch):
    import pipecat.runner.run as run_module

    fresh = FastAPI()
    monkeypatch.setattr(run_module, "app", fresh)
    start_guard.install_start_guard(check=lambda token, mode: None)
    assert any(m.cls is VoiceStartGuard for m in fresh.user_middleware)


def test_runner_installs_the_guard_before_starting_pipecat():
    from pathlib import Path

    source = (Path(__file__).resolve().parents[1] / "voice_agent" / "webrtc_turn_runner.py").read_text(encoding="utf-8")
    main_block = source.split('if __name__ == "__main__":', 1)[1]
    assert main_block.index("install_start_guard()") < main_block.index("main()")


def test_check_voice_session_skips_the_api_for_missing_values(monkeypatch):
    from voice_agent import voice_session_api

    def boom(*_args, **_kwargs):
        raise AssertionError("no HTTP call expected")

    monkeypatch.setattr(voice_session_api, "urlopen", boom)
    for token, mode in ((None, "ai"), ("", "ai"), ("t", None), (1, "ai")):
        assert voice_session_api.check_voice_session(token, mode) is None
