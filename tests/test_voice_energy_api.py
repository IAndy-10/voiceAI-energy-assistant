from __future__ import annotations

import json
import socket
from urllib.error import HTTPError, URLError

from voice_agent.energy_api import EnergyAPISettings, VoiceEnergyAdapter


class FakeResponse:
    def __init__(self, payload: dict):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


def settings() -> EnergyAPISettings:
    return EnergyAPISettings("http://energy-api:8000", "test-voice-token", 2.5)


def test_adapter_preserves_energy_metadata_and_authenticates():
    observed = {}

    def opener(request, timeout):
        observed["url"] = request.full_url
        observed["authorization"] = request.get_header("Authorization")
        observed["timeout"] = timeout
        return FakeResponse({"status": "ok", "data": {"value": 12}, "period": 2025,
                             "unit": "kWh", "source": ["demo-costos.xlsx"], "warnings": ["Dato parcial"]})

    result = VoiceEnergyAdapter(settings(), opener=opener).get_overview(2025)

    assert observed == {"url": "http://energy-api:8000/energy/overview?year=2025",
                        "authorization": "Bearer test-voice-token", "timeout": 2.5}
    assert result["period"] == 2025
    assert result["unit"] == "kWh"
    assert result["source"] == ["demo-costos.xlsx"]
    assert result["warnings"] == ["Dato parcial"]


def test_adapter_handles_http_timeout_and_unapproved_tools_without_response_content():
    http = VoiceEnergyAdapter(settings(), opener=lambda *_args, **_kwargs: (_ for _ in ()).throw(HTTPError("http://x", 401, "", {}, None)))
    timeout = VoiceEnergyAdapter(settings(), opener=lambda *_args, **_kwargs: (_ for _ in ()).throw(socket.timeout()))

    assert http.get_data_info() == {"status": "http_error", "data": None, "period": None, "unit": None,
                                    "source": [], "warnings": ["La API energética rechazó la consulta (HTTP 401)."]}
    assert timeout.get_solar() == {"status": "timeout", "data": None, "period": None, "unit": None,
                                   "source": [], "warnings": ["La API energética agotó el tiempo de espera."]}
    assert timeout.call("not_allowed") ["status"] == "invalid_request"


def test_adapter_handles_connection_and_missing_token_without_logging_payloads():
    connection = VoiceEnergyAdapter(settings(), opener=lambda *_args, **_kwargs: (_ for _ in ()).throw(URLError("offline")))
    no_token = VoiceEnergyAdapter(EnergyAPISettings("http://energy-api:8000", None, 1))

    assert connection.get_chiller(2025)["status"] == "connection_error"
    assert no_token.get_store("Centro Demo", 2025)["status"] == "configuration_error"


def test_adapter_builds_all_six_real_contract_routes():
    urls = []

    def opener(request, timeout):
        urls.append(request.full_url)
        return FakeResponse({"status": "ok", "data": None, "period": None, "unit": None, "source": [], "warnings": []})

    adapter = VoiceEnergyAdapter(settings(), opener=opener)
    adapter.get_overview(2025)
    adapter.get_store("Centro Demo", 2025)
    adapter.rank_stores("cost", "asc", 3)
    adapter.get_solar("Planta Demo")
    adapter.get_chiller(2025)
    adapter.get_data_info()

    assert urls == [
        "http://energy-api:8000/energy/overview?year=2025",
        "http://energy-api:8000/energy/stores/Centro%20Demo?year=2025",
        "http://energy-api:8000/energy/stores/ranking?metric=cost&order=asc&top_n=3",
        "http://energy-api:8000/energy/solar?plant=Planta+Demo",
        "http://energy-api:8000/energy/chiller?year=2025",
        "http://energy-api:8000/energy/data-info",
    ]
