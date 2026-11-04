"""Deterministic, read-only tools over fields already computed by the dashboard."""

from __future__ import annotations

import functools
import unicodedata
from collections.abc import Callable, Iterable, Mapping
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


def _named(name: object, aliases: Iterable[object] = ()) -> set[str]:
    """Normalised forms of a name and its aliases, for matching user input."""
    return {_normalise(str(name)), *(_normalise(str(alias)) for alias in aliases)}


def _find_item(items: Iterable[Mapping[str, Any]], query: str) -> Mapping[str, Any] | None:
    """First snapshot item (a dict with ``name`` and optional ``aliases``) matching ``query``."""
    target = _normalise(query)
    return next((item for item in items if target in _named(item.get("name", ""), item.get("aliases", []))), None)


def _needs_snapshot(method: Callable[..., dict[str, Any]]) -> Callable[..., dict[str, Any]]:
    """Run ``method(self, snapshot, ...)`` or answer ``no_snapshot`` when none is loaded."""
    @functools.wraps(method)
    def wrapper(self: "EnergyTools", *args: Any, **kwargs: Any) -> dict[str, Any]:
        snapshot = self.repository.get()
        if snapshot is None:
            return self._result("no_snapshot", None, None, None, None, ["No hay snapshot cargado."])
        return method(self, snapshot, *args, **kwargs)
    return wrapper


class EnergyTools:
    """Query interface intended for an AI agent or the local FastAPI adapter."""

    def __init__(self, repository: SnapshotRepository) -> None:
        self.repository = repository

    @staticmethod
    def _result(
        status: str, data: Any, period: str | int | None, unit: str | None,
        snapshot: EnergySnapshot | None, warnings: list[str] | None = None,
    ) -> dict[str, Any]:
        return {
            "status": status,
            "data": data,
            "period": period,
            "unit": unit,
            "source": [source.file for source in snapshot.sources] if snapshot else [],
            "warnings": warnings or [],
        }

    @staticmethod
    def _period_warning(snapshot: EnergySnapshot, year: int) -> list[str]:
        months = snapshot.periods.partial_years.get(year)
        if months:
            return [
                f"{year} es un año parcial ({len(months)} meses: {', '.join(map(str, months))}); "
                "no debe compararse con un año completo."
            ]
        return []

    @staticmethod
    def _find_store(snapshot: EnergySnapshot, name: str) -> Store | None:
        target = _normalise(name)
        return next((store for store in snapshot.stores if target in _named(store.name, store.aliases)), None)

    @_needs_snapshot
    def get_overview(self, snapshot: EnergySnapshot, year: int, month: int | None = None) -> dict[str, Any]:
        totals = snapshot.exec.years.get(year)
        if totals is None:
            return self._result("not_found", None, year, None, snapshot, ["No hay resumen para el año solicitado."])
        if month is not None:
            return self._month_overview(snapshot, year, month)
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
        return self._result("ok", data, year, "CLP y kWh", snapshot, self._period_warning(snapshot, year))

    def _month_overview(self, snapshot: EnergySnapshot, year: int, month: int) -> dict[str, Any]:
        totals = snapshot.exec.years[year]
        period = f"{year}-{month:02d}"
        if not totals.by_month:
            return self._result("not_found", None, period, None, snapshot,
                                ["Este snapshot no trae el desglose mensual; vuelva a sincronizar desde el dashboard."])
        for item in totals.by_month:
            if item.month == month:
                warnings = ["Totales de la cadena para el mes, según la facturación cargada."]
                return self._result("ok", item.model_dump(mode="json"), period, "CLP y kWh", snapshot,
                                    [*warnings, *self._period_warning(snapshot, year)])
        return self._result("not_found", None, period, None, snapshot, [f"No hay facturación de {year} para el mes {month}."])

    @_needs_snapshot
    def get_store(self, snapshot: EnergySnapshot, name: str, year: int) -> dict[str, Any]:
        store = self._find_store(snapshot, name)
        if store is None:
            return self._result("not_found", None, year, "CLP y kWh", snapshot, ["Sucursal no encontrada en el snapshot."])
        if store.year != year:
            return self._result("not_found", None, year, "CLP y kWh", snapshot,
                                [f"La sucursal solo dispone de datos para {store.year} en este snapshot."])
        warnings = [*store.notes, *self._period_warning(snapshot, year)]
        if "nueva" in store.flags:
            warnings.append("Sucursal nueva: no hay comparación interanual calculada.")
        return self._result("ok", store.model_dump(mode="json"), year, "CLP y kWh", snapshot, warnings)

    @_needs_snapshot
    def rank_stores(self, snapshot: EnergySnapshot, metric: str, order: str = "desc", top_n: int = 10) -> dict[str, Any]:
        rankings = snapshot.rankings
        by_metric = {
            "cost": (rankings.cost_cfv_desc, "CLP"),
            "kwh": (rankings.kwh_desc, "kWh"),
            "increase_abs": (rankings.increase_abs_desc, "CLP"),
            "increase_pct": (rankings.increase_pct_desc, "%"),
        }
        if metric not in by_metric or order not in {"asc", "desc"} or not 1 <= top_n <= 100:
            return self._result("invalid_request", None, rankings.metric_year, None, snapshot,
                                ["metric debe ser cost, kwh, increase_abs o increase_pct; order asc/desc; top_n entre 1 y 100."])
        names, unit = by_metric[metric]
        if order == "asc":
            names = list(reversed(names))
        # The dashboard precomputed the order; only look the stores up, never re-sort.
        found = (self._find_store(snapshot, name) for name in names)
        stores = [store.model_dump(mode="json") for store in found if store is not None]
        return self._result("ok", stores[:top_n], rankings.metric_year, unit, snapshot,
                            self._period_warning(snapshot, rankings.metric_year))

    @_needs_snapshot
    def get_solar(self, snapshot: EnergySnapshot, plant: str | None = None) -> dict[str, Any]:
        solar = snapshot.solar
        if solar is None:
            return self._result("not_found", None, None, None, snapshot, ["El snapshot no contiene datos solares."])
        if plant is None:
            return self._result("ok", solar.model_dump(mode="json"), solar.year, "kWp, kWh y CLP", snapshot)
        item = _find_item(solar.plants, plant)
        if item is None:
            return self._result("not_found", None, solar.year, None, snapshot, ["Planta solar no encontrada."])
        warnings = [str(item["consistency"])] if item.get("consistency") == "REVISAR" else []
        return self._result("ok", item, solar.year, "kWp, kWh y CLP", snapshot, warnings)

    @_needs_snapshot
    def get_chiller(self, snapshot: EnergySnapshot, year: int | None = None) -> dict[str, Any]:
        chiller = snapshot.chiller
        if chiller is None:
            return self._result("not_found", None, year, None, snapshot, ["El snapshot no contiene datos de chiller."])
        if year is None:
            data: Any = chiller.model_dump(mode="json")
            period: int | str = "todos los años disponibles"
        else:
            data = chiller.by_year.get(year)
            period = year
            if data is None:
                return self._result("not_found", None, year, "CLP y BTU", snapshot, ["No hay datos de chiller para el año solicitado."])
        warnings = [chiller.note] if chiller.note else []
        return self._result("ok", data, period, "CLP y BTU", snapshot, warnings)

    @_needs_snapshot
    def get_equipment(self, snapshot: EnergySnapshot, store: str | None = None) -> dict[str, Any]:
        equipment = snapshot.equipment
        period = "auditoría de equipos"
        if equipment is None:
            return self._result("not_found", None, None, None, snapshot, ["El snapshot no contiene la auditoría de equipos."])
        warnings = [str(equipment["note"])] if equipment.get("note") else []
        unit = "kWh anuales estimados, unidades y lm/W"
        if store is None:
            return self._result("ok", equipment, period, unit, snapshot, warnings)
        audited_stores = equipment.get("stores", [])
        item = _find_item(audited_stores, store)
        if item is not None:
            return self._result("ok", item, period, unit, snapshot, warnings)
        audited = ", ".join(str(item.get("name")) for item in audited_stores)
        return self._result("not_found", None, period, None, snapshot, [f"Tienda no auditada. Tiendas con auditoría: {audited}."])

    @_needs_snapshot
    def get_indicators(self, snapshot: EnergySnapshot, year: int, site: str | None = None) -> dict[str, Any]:
        indicators = snapshot.indicators
        if indicators is None:
            return self._result("not_found", None, year, None, snapshot, ["El snapshot no contiene indicadores."])
        by_year = indicators.get("by_year", {})
        data = by_year.get(str(year), by_year.get(year))
        if data is None:
            return self._result("not_found", None, year, None, snapshot, ["No hay indicadores para el año solicitado."])
        warnings = [str(indicators["note"])] if indicators.get("note") else []
        if data.get("partial"):
            warnings.append(f"Indicadores de {year} con datos parciales: no están anualizados.")
        warnings += self._period_warning(snapshot, year)
        unit = "kWh/m², kWh/hora, CLP/m² y tCO₂e"
        if site is None:
            return self._result("ok", data, year, unit, snapshot, warnings)
        # Sites match on name only (no aliases), as the dashboard exports them.
        target = _normalise(site)
        item = next((item for item in data.get("sites", []) if _normalise(str(item.get("name", ""))) == target), None)
        if item is None:
            return self._result("not_found", None, year, None, snapshot, ["Localidad sin indicadores para ese año."])
        return self._result("ok", item, year, unit, snapshot, warnings)

    @_needs_snapshot
    def get_data_info(self, snapshot: EnergySnapshot) -> dict[str, Any]:
        data = {
            "schema_version": snapshot.schema_version,
            "generated_at": snapshot.generated_at.isoformat(),
            "sources": [source.model_dump(mode="json") for source in snapshot.sources],
            "periods": snapshot.periods.model_dump(mode="json"),
            "modules": {"solar": snapshot.solar is not None, "chiller": snapshot.chiller is not None,
                        "equipment": snapshot.equipment is not None, "indicators": snapshot.indicators is not None},
        }
        return self._result("ok", data, "snapshot", None, snapshot, snapshot.known_gaps)
