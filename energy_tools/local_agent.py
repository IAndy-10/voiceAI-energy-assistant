"""Small deterministic interpreter for local demo questions; no provider calls."""

from __future__ import annotations

import re
from typing import Any

from .snapshot import SnapshotRepository
from .tools import EnergyTools


class LocalChatUnavailable(Exception):
    pass


class LocalEnergyAssistant:
    def __init__(self, repository: SnapshotRepository) -> None:
        self.repository = repository
        self.tools = EnergyTools(repository)

    def _result(self, answer: str, tool: str, result: dict[str, Any]) -> dict[str, Any]:
        return {"answer": answer, "mode": "local", "tools_used": [tool],
                "sources": result.get("source", []), "periods": [result.get("period")] if result.get("period") else [],
                "warnings": result.get("warnings", [])}

    def chat(self, question: str) -> dict[str, Any]:
        if self.repository.get() is None:
            raise LocalChatUnavailable("Carga un snapshot válido antes de consultar.")
        text = question.casefold()
        year_match = re.search(r"\b(20\d{2})\b", text)
        snapshot = self.repository.get()
        year = int(year_match.group(1)) if year_match else snapshot.exec.year
        if any(word in text for word in ("mayor gasto", "mayor costo", "ranking", "sucursal")):
            result = self.tools.rank_stores("cost", "desc", 1)
            if result["status"] == "ok" and result["data"]:
                item = result["data"][0]
                return self._result(f"La sucursal con mayor costo en el ranking disponible es {item['name']}: {item['cost_cfv']['display']}.", "rank_stores", result)
        if "solar" in text or "ahorr" in text or "fotovolta" in text:
            result = self.tools.get_solar()
            data = result.get("data") or {}
            return self._result(f"El snapshot reporta {data.get('kwp_total', '—')} kWp instalados y {data.get('generation_kwh', '—')} kWh de generación solar.", "get_solar", result)
        if "chiller" in text:
            result = self.tools.get_chiller(year)
            data = result.get("data") or {}
            return self._result(f"El chiller se factura aparte. Para {year}, el snapshot informa {data.get('total_clp', '—')} CLP y {data.get('btu', '—')} BTU.", "get_chiller", result)
        if any(word in text for word in ("falta", "brecha", "cliente", "información")):
            result = self.tools.get_data_info()
            gaps = (result.get("data") or {}).get("known_gaps", [])
            answer = "Brechas registradas: " + ("; ".join(gaps) if gaps else "no hay brechas declaradas en el snapshot.")
            return self._result(answer, "get_data_info", result)
        if any(word in text for word in ("consumo", "gastamos", "gasto", "costo", "electricidad")):
            result = self.tools.get_overview(year)
            data = result.get("data") or {}
            if result["status"] != "ok":
                return self._result("No existe un resumen para el período solicitado.", "get_overview", result)
            if "consumo" in text:
                answer = f"El consumo de red para {year} es {data.get('kwh_display', data.get('kwh', '—'))}."
            else:
                answer = f"El costo eléctrico con FV para {year} es {data.get('cost_cfv', {}).get('display', '—')}."
            return self._result(answer, "get_overview", result)
        return {"answer": "Consulta local no reconocida. Puedes preguntar por costo o consumo anual, sucursal de mayor gasto, energía solar, chiller o brechas de información.", "mode": "local", "tools_used": [], "sources": [], "periods": [], "warnings": []}
