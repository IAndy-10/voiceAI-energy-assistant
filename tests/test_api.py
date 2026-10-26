from __future__ import annotations

import copy

from fastapi.testclient import TestClient

from energy_tools import api
from energy_tools.agent import AgentProviderError
from energy_tools.snapshot import SnapshotRepository


def _synthetic(snapshot: dict) -> dict:
    payload = copy.deepcopy(snapshot)
    payload["generator"] = "vesta-synthetic-demo-generator"
    for source in payload["sources"]:
        source["file"] = "demo-" + source["file"]
    return payload


def test_sensitive_endpoints_require_token(monkeypatch):
    monkeypatch.delenv("ENERGY_TOOLS_API_TOKEN", raising=False)
    monkeypatch.delenv("SNAPSHOT_API_TOKEN", raising=False)
    client = TestClient(api.app)
    assert client.get("/health").status_code == 200
    assert client.get("/tools").status_code == 200
    assert client.get("/energy/overview", params={"year": 2025}).status_code == 503


def test_snapshot_upload_and_queries_are_authenticated(monkeypatch, valid_snapshot):
    monkeypatch.setenv("ENERGY_TOOLS_API_TOKEN", "test-token")
    api.repository._snapshot = None
    client = TestClient(api.app)
    assert client.post("/snapshot", json=valid_snapshot).status_code == 401
    response = client.post("/snapshot", json=valid_snapshot, headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    response = client.get("/energy/stores/ranking", params={"metric": "cost"}, headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    assert response.json()["data"][0]["name"] == "Portal Centro Talca"


def test_all_tool_endpoints_are_authenticated_and_connected(monkeypatch, valid_snapshot):
    monkeypatch.setenv("ENERGY_TOOLS_API_TOKEN", "test-token")
    api.repository._snapshot = None
    client = TestClient(api.app)
    headers = {"Authorization": "Bearer test-token"}
    assert client.post("/snapshot", json=valid_snapshot, headers=headers).status_code == 200
    responses = [
        client.get("/energy/stores/Portal%20Centro", params={"year": 2025}, headers=headers),
        client.get("/energy/solar", headers=headers),
        client.get("/energy/chiller", params={"year": 2025}, headers=headers),
        client.get("/energy/data-info", headers=headers),
    ]
    assert all(response.status_code == 200 and response.json()["status"] == "ok" for response in responses)


def test_demo_contains_no_embedded_client_figures():
    client = TestClient(api.app)
    response = client.get("/demo")
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert "/energy/overview" in response.text
    assert "427,6" not in response.text
    assert "Ver respuesta técnica JSON" in response.text
    assert "Resumen anual" in response.text
    assert 'id="snapshot-file"' in response.text
    assert "Cargar snapshot" in response.text
    assert "DEMO · Datos ficticios" in response.text
    assert 'id="use-openai"' in response.text
    assert "Verifica que tienes autorización para compartirlos" in response.text
    assert "Bloqueado por datos reales" not in response.text
    assert "OPENAI_API_KEY" not in response.text
    assert "chat.length=0;renderChat()" in response.text
    assert response.text.index("Datos y accesos") < response.text.index("Indicadores") < response.text.index("Asistente IA")
    assert 'class="panel active" id="access"' in response.text
    assert "/agent/local-chat" in response.text
    assert "Consultas locales · Sin OpenAI" in response.text
    assert 'id="header-auth"' in response.text
    assert 'id="agent-details"' in response.text
    assert response.text.index('id="use-openai"') > response.text.index('id="assistant"')
    assert "function safeMarkdown" in response.text
    assert "const inline=esc(value)" in response.text
    assert "grid-auto-rows:min-content" in response.text
    assert "min-height:0" in response.text


def test_openapi_docs_are_available_without_client_data():
    client = TestClient(api.app)
    assert client.get("/docs").status_code == 200


def test_agent_endpoints_require_token_and_remain_disabled_by_default(monkeypatch, valid_snapshot):
    monkeypatch.setenv("ENERGY_TOOLS_API_TOKEN", "test-token")
    monkeypatch.setenv("OPENAI_ENABLED", "false")
    api.repository.replace(valid_snapshot)
    client = TestClient(api.app)
    assert client.get("/agent/status").status_code == 401
    headers = {"Authorization": "Bearer test-token"}
    assert client.get("/agent/status", headers=headers).json()["status"] == "disabled"
    assert client.post("/agent/chat", json={"question": "hola"}, headers=headers).status_code == 503


def test_approved_demo_snapshot_exposes_mode_and_all_tools(monkeypatch, valid_snapshot):
    payload = _synthetic(valid_snapshot)
    monkeypatch.setenv("ENERGY_TOOLS_API_TOKEN", "test-token")
    monkeypatch.setenv("VESTA_DEMO_SNAPSHOT_SHA256", SnapshotRepository.canonical_digest(payload))
    api.repository._snapshot = None
    client = TestClient(api.app); headers = {"Authorization": "Bearer test-token"}
    accepted = client.post("/snapshot", json=payload, headers=headers)
    assert accepted.status_code == 200
    assert accepted.json()["mode"] == "demo"
    assert accepted.json()["demo_verified"] is True
    status = client.get("/snapshot/status", headers=headers).json()
    assert status["snapshot"]["mode"] == "demo"
    responses = [
        client.get("/energy/overview", params={"year": 2025}, headers=headers),
        client.get("/energy/stores/Portal%20Centro", params={"year": 2025}, headers=headers),
        client.get("/energy/stores/ranking", params={"metric": "cost"}, headers=headers),
        client.get("/energy/solar", headers=headers), client.get("/energy/chiller", headers=headers),
        client.get("/energy/data-info", headers=headers),
    ]
    assert all(response.status_code == 200 and response.json()["status"] == "ok" for response in responses)


def test_unverified_snapshot_is_not_demo_but_does_not_block_configured_openai(monkeypatch, valid_snapshot):
    approved = _synthetic(valid_snapshot)
    monkeypatch.setenv("ENERGY_TOOLS_API_TOKEN", "test-token")
    monkeypatch.setenv("OPENAI_ENABLED", "true")
    monkeypatch.setenv("OPENAI_API_KEY", "not-a-real-key")
    monkeypatch.setenv("VESTA_DEMO_SNAPSHOT_SHA256", SnapshotRepository.canonical_digest(approved))
    # Looks like DEMO in metadata, but its content differs from the approved dataset.
    forged = copy.deepcopy(approved); forged["stores"][0]["name"] = "demo-renamed-real-store"
    client = TestClient(api.app); headers = {"Authorization": "Bearer test-token"}
    accepted = client.post("/snapshot", json=forged, headers=headers)
    assert accepted.status_code == 200 and accepted.json()["mode"] == "unverified"
    assert client.get("/agent/status", headers=headers).json()["status"] == "available"


def test_snapshot_replacement_and_invalid_or_large_payloads(monkeypatch, valid_snapshot):
    demo = _synthetic(valid_snapshot)
    monkeypatch.setenv("ENERGY_TOOLS_API_TOKEN", "test-token")
    monkeypatch.setenv("VESTA_DEMO_SNAPSHOT_SHA256", SnapshotRepository.canonical_digest(demo))
    client = TestClient(api.app); headers = {"Authorization": "Bearer test-token"}
    assert client.post("/snapshot", json=valid_snapshot, headers=headers).json()["mode"] == "unverified"
    assert client.post("/snapshot", json=demo, headers=headers).json()["mode"] == "demo"
    assert client.post("/snapshot", json=valid_snapshot, headers=headers).json()["mode"] == "unverified"
    assert client.post("/snapshot", content=b"not-json", headers=headers).status_code == 422
    incompatible = copy.deepcopy(valid_snapshot); incompatible["schema_version"] = "9.9"
    assert client.post("/snapshot", json=incompatible, headers=headers).status_code == 422
    monkeypatch.setenv("SNAPSHOT_MAX_BYTES", "12")
    assert client.post("/snapshot", json=valid_snapshot, headers=headers).status_code == 413
    assert client.post("/snapshot", json=valid_snapshot).status_code == 401


def test_queries_use_the_current_snapshot_after_replacement(monkeypatch, valid_snapshot):
    monkeypatch.setenv("ENERGY_TOOLS_API_TOKEN", "test-token")
    client = TestClient(api.app); headers = {"Authorization": "Bearer test-token"}
    assert client.post("/snapshot", json=valid_snapshot, headers=headers).status_code == 200
    first = client.get("/energy/overview", params={"year": 2025}, headers=headers).json()
    replacement = copy.deepcopy(valid_snapshot)
    replacement["exec"]["years"]["2025"]["cost_cfv"]["clp"] = 4321
    assert client.post("/snapshot", json=replacement, headers=headers).status_code == 200
    second = client.get("/energy/overview", params={"year": 2025}, headers=headers).json()
    assert first["data"]["cost_cfv"]["clp"] == 1000
    assert second["data"]["cost_cfv"]["clp"] == 4321


def test_local_chat_uses_snapshot_without_openai(monkeypatch, valid_snapshot):
    monkeypatch.setenv("ENERGY_TOOLS_API_TOKEN", "test-token")
    monkeypatch.setenv("OPENAI_ENABLED", "false")
    client = TestClient(api.app); headers = {"Authorization": "Bearer test-token"}
    assert client.post("/snapshot", json=valid_snapshot, headers=headers).status_code == 200
    response = client.post("/agent/local-chat", json={"question": "¿Cuánto gastamos en electricidad durante 2025?"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["mode"] == "local"
    assert response.json()["tools_used"] == ["get_overview"]
    unknown = client.post("/agent/local-chat", json={"question": "pregunta libre no cubierta"}, headers=headers).json()
    assert unknown["tools_used"] == []


def test_agent_provider_errors_have_safe_http_codes(monkeypatch):
    monkeypatch.setenv("ENERGY_TOOLS_API_TOKEN", "test-token")
    def timeout(_: str):
        raise AgentProviderError("OpenAI agotó el tiempo de espera.", category="timeout", request_id="req_safe")
    monkeypatch.setattr(api.agent, "chat", timeout)
    client = TestClient(api.app)
    response = client.post("/agent/chat", json={"question": "consulta"}, headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 504
    assert response.json()["detail"] == {"code": "openai_timeout", "message": "OpenAI agotó el tiempo de espera.", "request_id": "req_safe"}
