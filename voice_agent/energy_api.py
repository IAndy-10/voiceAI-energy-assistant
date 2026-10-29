"""Authenticated, read-only client for the existing Energy Tools HTTP API.

The adapter is intentionally provider-neutral: Pipecat (or any other voice
orchestrator) can call its six methods without importing dashboard internals or
sharing the in-memory snapshot repository.
"""

from __future__ import annotations

import json
import os
import socket
from dataclasses import dataclass
from typing import Any, Callable, Mapping
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen


Result = dict[str, Any]
Opener = Callable[..., Any]


@dataclass(frozen=True)
class EnergyAPISettings:
    """Local-only configuration; the token is never logged or returned."""

    base_url: str
    token: str | None
    timeout_seconds: float

    @classmethod
    def from_env(cls) -> "EnergyAPISettings":
        raw_timeout = os.getenv("VOICE_ENERGY_API_TIMEOUT_SECONDS", "10")
        try:
            timeout = float(raw_timeout)
        except ValueError:
            timeout = 10.0
        return cls(
            base_url=os.getenv("VOICE_ENERGY_API_BASE_URL", "http://127.0.0.1:8000").rstrip("/"),
            token=os.getenv("VOICE_ENERGY_API_TOKEN"),
            timeout_seconds=timeout if timeout > 0 else 10.0,
        )


class VoiceEnergyAdapter:
    """Maps the six published Energy Tools contracts to authenticated GET calls.

    Errors are returned as safe Energy Tools-shaped results so a future voice
    handler can explain a local failure without leaking token, snapshot or HTTP
    response content.
    """

    _allowed_tools = {
        "get_overview",
        "get_store",
        "rank_stores",
        "get_solar",
        "get_chiller",
        "get_data_info",
    }

    def __init__(self, settings: EnergyAPISettings | None = None, *, opener: Opener = urlopen) -> None:
        self.settings = settings or EnergyAPISettings.from_env()
        self._opener = opener

    @staticmethod
    def _error(status: str, warning: str) -> Result:
        return {
            "status": status,
            "data": None,
            "period": None,
            "unit": None,
            "source": [],
            "warnings": [warning],
        }

    @staticmethod
    def _normalise(payload: Any) -> Result:
        if not isinstance(payload, Mapping) or not isinstance(payload.get("status"), str):
            return VoiceEnergyAdapter._error("protocol_error", "La API energética devolvió una respuesta no compatible.")
        result = dict(payload)
        result.setdefault("data", None)
        result.setdefault("period", None)
        result.setdefault("unit", None)
        result.setdefault("source", [])
        result.setdefault("warnings", [])
        if not isinstance(result["source"], list) or not isinstance(result["warnings"], list):
            return VoiceEnergyAdapter._error("protocol_error", "La API energética devolvió metadatos no compatibles.")
        return result

    def _get(self, path: str, query: Mapping[str, Any] | None = None) -> Result:
        if not self.settings.token:
            return self._error("configuration_error", "No hay token configurado para la API energética.")
        query_text = urlencode({key: value for key, value in (query or {}).items() if value is not None})
        url = f"{self.settings.base_url}{path}" + (f"?{query_text}" if query_text else "")
        request = Request(url, headers={"Authorization": f"Bearer {self.settings.token}", "Accept": "application/json"})
        try:
            with self._opener(request, timeout=self.settings.timeout_seconds) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            return self._error("http_error", f"La API energética rechazó la consulta (HTTP {exc.code}).")
        except (TimeoutError, socket.timeout):
            return self._error("timeout", "La API energética agotó el tiempo de espera.")
        except URLError:
            return self._error("connection_error", "No fue posible conectar con la API energética local.")
        except (OSError, UnicodeDecodeError, json.JSONDecodeError):
            return self._error("protocol_error", "La API energética devolvió una respuesta no compatible.")
        return self._normalise(payload)

    def get_overview(self, year: int) -> Result:
        return self._get("/energy/overview", {"year": year})

    def get_store(self, name: str, year: int) -> Result:
        return self._get(f"/energy/stores/{quote(name, safe='')}", {"year": year})

    def rank_stores(self, metric: str, order: str = "desc", top_n: int = 10) -> Result:
        return self._get("/energy/stores/ranking", {"metric": metric, "order": order, "top_n": top_n})

    def get_solar(self, plant: str | None = None) -> Result:
        return self._get("/energy/solar", {"plant": plant})

    def get_chiller(self, year: int | None = None) -> Result:
        return self._get("/energy/chiller", {"year": year})

    def get_data_info(self) -> Result:
        return self._get("/energy/data-info")

    def call(self, tool_name: str, **arguments: Any) -> Result:
        """Dispatch a pre-authorized tool name for a future function handler."""
        if tool_name not in self._allowed_tools:
            return self._error("invalid_request", "Herramienta energética no autorizada.")
        return getattr(self, tool_name)(**arguments)
