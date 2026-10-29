"""Deterministic, read-only tools over fields already computed by the dashboard."""

from __future__ import annotations

import unicodedata
from typing import Any

from .models import EnergySnapshot, Store
from .snapshot import SnapshotRepository


def _normalise(value: str) -> str:
    return " ".join(
        "".join(
            char for char in unicodedata.normalize("NFD", value.casefold())
            if unicodedata.category(char) != "Mn"
        ).split()
    )


class EnergyTools:
    """Query interface intended for an AI agent or the local FastAPI adapter."""

    def __init__(self, repository: SnapshotRepository) -> None:
        self.repository = repository

    def _snapshot(self) -> EnergySnapshot | None:
        return self.repository.get()

    @staticmethod
    def _result(
        status: str, data: Any, period: str | int | None, unit: str | None,
        source: list[str], warnings: list[str] | None = None,
    ) -> dict[str, Any]:
        return {
            "status": status,
            "data": data,
            "period": period,
            "unit": unit,
            "source": source,
            "warnings": warnings or [],
        }

    def _unavailable(self) -> dict[str, Any]:
        return self._result("no_snapshot", None, None, None, [], ["No hay snapshot cargado."])

    @staticmethod
    def _sources(snapshot: EnergySnapshot) -> list[str]:
        return [source.file for source in snapshot.sources]

    @staticmethod
    def _period_warning(snapshot: EnergySnapshot, year: int) -> list[str]:
        months = snapshot.periods.partial_years.get(year)
        if months:
            return [
                f"{year} es un año parcial ({len(months)} meses: {', '.join(map(str, months))}); "
                "no debe compararse con un año completo."
            ]
        return []

    def get_overview(self, year: int) -> dict[str, Any]:
        snapshot = self._snapshot()
        if snapshot is None:
            return self._unavailable()
        totals = snapshot.exec.years.get(year)
        if totals is None:
            return self._result("not_found", None, year, None, self._sources(snapshot), ["No hay resumen para el año solicitado."])
        data = totals.model_dump(mode="json")
        official_price = snapshot.official_price_clp_kwh.get(str(year))
        if official_price is not None:
            data["official_price_clp_kwh"] = {
                "value": official_price,
                "source": snapshot.official_price_clp_kwh.get("source"),
                "note": snapshot.official_price_clp_kwh.get("note"),
            }
        if year == snapshot.exec.year:
            data["change"] = snapshot.exec.change
            data["solar_discount_accumulated"] = snapshot.exec.solar_discount_accumulated
        return self._result("ok", data, year, "CLP y kWh", self._sources(snapshot), self._period_warning(snapshot, year))

    def _find_store(self, snapshot: EnergySnapshot, name: str) -> Store | None:
        target = _normalise(name)
        for store in snapshot.stores:
            if target in {_normalise(store.name), *(_normalise(alias) for alias in store.aliases)}:
                return store
        return None

    def get_store(self, name: str, year: int) -> dict[str, Any]:
        snapshot = self._snapshot()
        if snapshot is None:
            return self._unavailable()
        store = self._find_store(snapshot, name)
        if store is None:
            return self._result("not_found", None, year, "CLP y kWh", self._sources(snapshot), ["Sucursal no encontrada en el snapshot."])
        if store.year != year:
            return self._result("not_found", None, year, "CLP y kWh", self._sources(snapshot), [f"La sucursal solo dispone de datos para {store.year} en este snapshot."])
        warnings = [*store.notes, *self._period_warning(snapshot, year)]
        if "nueva" in store.flags:
            warnings.append("Sucursal nueva: no hay comparación interanual calculada.")
        return self._result("ok", store.model_dump(mode="json"), year, "CLP y kWh", self._sources(snapshot), warnings)

    def rank_stores(self, metric: str, order: str = "desc", top_n: int = 10) -> dict[str, Any]:
        snapshot = self._snapshot()
        if snapshot is None:
            return self._unavailable()
        rankings = {
            "cost": snapshot.rankings.cost_cfv_desc,
            "kwh": snapshot.rankings.kwh_desc,
            "increase_abs": snapshot.rankings.increase_abs_desc,
            "increase_pct": snapshot.rankings.increase_pct_desc,
        }
        if metric not in rankings or order not in {"asc", "desc"} or not 1 <= top_n <= 100:
            return self._result("invalid_request", None, snapshot.rankings.metric_year, None, self._sources(snapshot), ["metric debe ser cost, kwh, increase_abs o increase_pct; order asc/desc; top_n entre 1 y 100."])
        names = rankings[metric]
        if order == "asc":
            names = list(reversed(names))
        stores = [self._find_store(snapshot, name).model_dump(mode="json") for name in names if self._find_store(snapshot, name)]
        unit = {"cost": "CLP", "kwh": "kWh", "increase_abs": "CLP", "increase_pct": "%"}[metric]
        return self._result("ok", stores[:top_n], snapshot.rankings.metric_year, unit, self._sources(snapshot), self._period_warning(snapshot, snapshot.rankings.metric_year))

    def get_solar(self, plant: str | None = None) -> dict[str, Any]:
        snapshot = self._snapshot()
        if snapshot is None:
            return self._unavailable()
        if snapshot.solar is None:
            return self._result("not_found", None, None, None, self._sources(snapshot), ["El snapshot no contiene datos solares."])
        if plant is None:
            return self._result("ok", snapshot.solar.model_dump(mode="json"), snapshot.solar.year, "kWp, kWh y CLP", self._sources(snapshot))
        target = _normalise(plant)
        for item in snapshot.solar.plants:
            candidates = [str(item.get("name", "")), *(str(alias) for alias in item.get("aliases", []))]
            if target in {_normalise(candidate) for candidate in candidates}:
                warnings = [str(item["consistency"])] if item.get("consistency") == "REVISAR" else []
                return self._result("ok", item, snapshot.solar.year, "kWp, kWh y CLP", self._sources(snapshot), warnings)
        return self._result("not_found", None, snapshot.solar.year, None, self._sources(snapshot), ["Planta solar no encontrada."])

    def get_chiller(self, year: int | None = None) -> dict[str, Any]:
        snapshot = self._snapshot()
        if snapshot is None:
            return self._unavailable()
        if snapshot.chiller is None:
            return self._result("not_found", None, year, None, self._sources(snapshot), ["El snapshot no contiene datos de chiller."])
        if year is None:
            data: Any = snapshot.chiller.model_dump(mode="json")
            period: int | str | None = "todos los años disponibles"
        else:
            data = snapshot.chiller.by_year.get(year)
            period = year
            if data is None:
                return self._result("not_found", None, year, "CLP y BTU", self._sources(snapshot), ["No hay datos de chiller para el año solicitado."])
        warnings = [snapshot.chiller.note] if snapshot.chiller.note else []
        return self._result("ok", data, period, "CLP y BTU", self._sources(snapshot), warnings)

    def get_data_info(self) -> dict[str, Any]:
        snapshot = self._snapshot()
        if snapshot is None:
            return self._unavailable()
        data = {
            "schema_version": snapshot.schema_version,
            "generated_at": snapshot.generated_at.isoformat(),
            "sources": [source.model_dump(mode="json") for source in snapshot.sources],
            "periods": snapshot.periods.model_dump(mode="json"),
            "modules": {"solar": snapshot.solar is not None, "chiller": snapshot.chiller is not None,
                        "equipment": snapshot.equipment is not None, "indicators": snapshot.indicators is not None},
        }
        return self._result("ok", data, "snapshot", None, self._sources(snapshot), snapshot.known_gaps)
