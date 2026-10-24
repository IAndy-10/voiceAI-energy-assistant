import json
import re

import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect
from twilio.request_validator import RequestValidator

from voice_server.app import create_app
from voice_server.config import Config
from voice_server.snapshot import SnapshotStore

HOST = "voz.example.test"
TOKEN = "twilio-auth-token"
PASS = "clave-demo"
PABLO = "+56911112222"


@pytest.fixture
def calls():
    return []


@pytest.fixture
def client(tmp_path, calls):
    cfg = Config(voice_passcode=PASS, snapshot_path=tmp_path / "agent_snapshot.json", public_host=HOST,
                 twilio_account_sid="AC123", twilio_auth_token=TOKEN, allowed_callers=[PABLO],
                 cors_origins=["null", "https://panel.example.test"])
    store = SnapshotStore(cfg.snapshot_path)

    async def fake_call(ws, call, snap, _cfg):
        calls.append(("call", call.call_sid, snap["generated_at"]))

    async def fake_no_data(ws, call, _cfg):
        calls.append(("no_data", call.call_sid))

    app = create_app(cfg, store, run_call=fake_call, run_no_data_call=fake_no_data)
    return TestClient(app)


def _post_snapshot(client, body, passcode=PASS):
    return client.post("/snapshot", content=json.dumps(body),
                       headers={"Authorization": f"Bearer {passcode}", "Content-Type": "application/json"})


# ── snapshot sync ───────────────────────────────────────────────────


def test_status_without_snapshot(client):
    r = client.get("/status").json()
    assert r["ok"] and r["snapshot"] is None


def test_snapshot_upload_requires_passcode(client, snap):
    assert _post_snapshot(client, snap, passcode="wrong").status_code == 401
    assert client.post("/snapshot", content=json.dumps(snap)).status_code == 401


def test_snapshot_schema_mismatch_is_422(client, snap):
    snap["schema_version"] = "2.0"
    r = _post_snapshot(client, snap)
    assert r.status_code == 422 and "schema_version" in r.json()["error"]


def test_snapshot_upload_saves_and_status_reports_it(client, snap, tmp_path):
    r = _post_snapshot(client, snap)
    assert r.status_code == 200 and r.json()["generated_local"]["time"] == "09:15"
    assert (tmp_path / "agent_snapshot.json").exists()
    status = client.get("/status").json()
    assert status["snapshot"]["generated_at"] == snap["generated_at"]
    assert "exec" not in json.dumps(status)  # no business figures in /status


def test_snapshot_disabled_without_passcode(tmp_path, snap):
    app = create_app(Config(snapshot_path=tmp_path / "s.json"), SnapshotStore(tmp_path / "s.json"))
    assert _post_snapshot(TestClient(app), snap, passcode="").status_code == 503


@pytest.mark.parametrize("origin", ["null", "https://panel.example.test"])
def test_cors_preflight_allows_dashboard_origins(client, origin):
    r = client.options("/snapshot", headers={
        "Origin": origin, "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type"})
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == origin


def test_cors_rejects_other_origins(client):
    r = client.options("/snapshot", headers={"Origin": "https://evil.test", "Access-Control-Request-Method": "POST"})
    assert "access-control-allow-origin" not in r.headers


# ── Twilio webhook ──────────────────────────────────────────────────


def _twilio_post(client, form, sign=True):
    url = f"https://{HOST}/twilio/voice"
    sig = RequestValidator(TOKEN).compute_signature(url, form) if sign else "bad"
    return client.post("/twilio/voice", data=form, headers={"X-Twilio-Signature": sig})


def test_webhook_rejects_bad_signature(client):
    assert _twilio_post(client, {"From": PABLO, "CallSid": "CA1"}, sign=False).status_code == 403


def test_webhook_hangs_up_on_unknown_caller(client):
    r = _twilio_post(client, {"From": "+15550001111", "CallSid": "CA2"})
    assert r.status_code == 200
    assert "<Hangup/>" in r.text and "<Stream" not in r.text


def test_webhook_connects_allowed_caller(client):
    r = _twilio_post(client, {"From": PABLO, "CallSid": "CA3"})
    assert r.headers["content-type"].startswith("application/xml")
    assert f'<Stream url="wss://{HOST}/twilio/stream">' in r.text
    assert re.search(r'<Parameter name="token" value="[0-9a-f]{64}"/>', r.text)


# ── Media Stream WebSocket ──────────────────────────────────────────


def _token_for(client, call_sid):
    r = _twilio_post(client, {"From": PABLO, "CallSid": call_sid})
    return re.search(r'name="token" value="([0-9a-f]+)"', r.text).group(1)


def _handshake(ws, call_sid, token):
    ws.send_text(json.dumps({"event": "connected", "protocol": "Call", "version": "1.0.0"}))
    ws.send_text(json.dumps({"event": "start", "streamSid": "MZ1", "start": {
        "streamSid": "MZ1", "callSid": call_sid, "accountSid": "AC123",
        "mediaFormat": {"encoding": "audio/x-mulaw", "sampleRate": 8000, "channels": 1},
        "customParameters": {"token": token}}}))


def test_stream_with_valid_token_runs_call_on_pinned_snapshot(client, calls, snap):
    _post_snapshot(client, snap)
    token = _token_for(client, "CA4")
    with client.websocket_connect("/twilio/stream") as ws:
        _handshake(ws, "CA4", token)
    assert calls == [("call", "CA4", snap["generated_at"])]


def test_stream_without_snapshot_uses_no_data_call(client, calls):
    token = _token_for(client, "CA5")
    with client.websocket_connect("/twilio/stream") as ws:
        _handshake(ws, "CA5", token)
    assert calls == [("no_data", "CA5")]


def test_stream_with_forged_token_is_closed(client, calls, snap):
    _post_snapshot(client, snap)
    with client.websocket_connect("/twilio/stream") as ws:
        _handshake(ws, "CA6", "0" * 64)
        with pytest.raises(WebSocketDisconnect) as exc:
            ws.receive_text()
    assert exc.value.code == 1008
    assert calls == []
