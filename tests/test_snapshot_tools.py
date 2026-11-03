from __future__ import annotations

from energy_tools.snapshot import SnapshotRepository
from energy_tools.tools import EnergyTools


def test_snapshot_validation_rejects_partial_complete_overlap(snapshot_copy):
    snapshot_copy["periods"]["complete_years"].append(2026)
    repository = SnapshotRepository()
    try:
        repository.replace(snapshot_copy)
    except ValueError as exc:
        assert "both complete and partial" in str(exc)
    else:
        raise AssertionError("expected validation error")


def test_overview_marks_partial_year(snapshot_copy):
    repository = SnapshotRepository(); repository.replace(snapshot_copy)
    result = EnergyTools(repository).get_overview(2026)
    assert result["status"] == "ok"
    assert result["data"]["cost_cfv"]["clp"] == 225
    assert "año parcial" in result["warnings"][0]


def test_store_alias_and_missing_store(snapshot_copy):
    repository = SnapshotRepository(); repository.replace(snapshot_copy)
    tools = EnergyTools(repository)
    assert tools.get_store("portal centro", 2025)["data"]["name"] == "Portal Centro Talca"
    assert tools.get_store("inexistente", 2025)["status"] == "not_found"


def test_precomputed_ranking_is_deterministic(snapshot_copy):
    repository = SnapshotRepository(); repository.replace(snapshot_copy)
    tools = EnergyTools(repository)
    desc = tools.rank_stores("increase_pct", "desc", 2)
    asc = tools.rank_stores("increase_pct", "asc", 2)
    assert [item["name"] for item in desc["data"]] == ["Curepto", "Portal Centro Talca"]
    assert [item["name"] for item in asc["data"]] == ["Portal Centro Talca", "Curepto"]


def test_solar_and_chiller_expose_snapshot_data(snapshot_copy):
    repository = SnapshotRepository(); repository.replace(snapshot_copy)
    tools = EnergyTools(repository)
    assert tools.get_solar("Talca")["warnings"] == ["REVISAR"]
    assert tools.get_chiller(2025)["data"]["btu"] == 100


def _money(clp):
    return {"clp": clp, "display": f"${clp}"}


def test_overview_month_returns_the_dashboard_monthly_totals(snapshot_copy):
    snapshot_copy["exec"]["years"]["2025"]["by_month"] = [
        {"month": 7, "month_name": "Jul", "kwh": 9, "cost_sfv": _money(110), "gd_discount": _money(10), "cost_cfv": _money(100)},
    ]
    repository = SnapshotRepository(); repository.replace(snapshot_copy)
    tools = EnergyTools(repository)
    july = tools.get_overview(2025, 7)
    assert july["status"] == "ok" and july["period"] == "2025-07"
    assert july["data"]["cost_cfv"]["clp"] == 100
    assert tools.get_overview(2025, 8)["status"] == "not_found"
    # The annual view still works and carries the monthly breakdown.
    assert tools.get_overview(2025)["data"]["by_month"][0]["month"] == 7


def test_overview_month_explains_snapshots_without_monthly_breakdown(snapshot_copy):
    repository = SnapshotRepository(); repository.replace(snapshot_copy)
    result = EnergyTools(repository).get_overview(2025, 7)
    assert result["status"] == "not_found"
    assert "desglose mensual" in result["warnings"][0]


def test_month_of_a_partial_year_keeps_the_partial_warning(snapshot_copy):
    snapshot_copy["exec"]["years"]["2026"]["by_month"] = [
        {"month": 1, "kwh": 10, "cost_sfv": _money(120), "gd_discount": _money(10), "cost_cfv": _money(110)},
    ]
    repository = SnapshotRepository(); repository.replace(snapshot_copy)
    result = EnergyTools(repository).get_overview(2026, 1)
    assert any("año parcial" in warning for warning in result["warnings"])


def test_equipment_exposes_the_audit_globally_and_per_store(snapshot_copy):
    snapshot_copy["equipment"] = {
        "note": "Consumo anual ESTIMADO por auditoría.", "total_kwh": 900,
        "stores": [{"name": "Talca Portal Centro", "aliases": ["Portal Centro Talca"], "kwh": 500}, {"name": "Parral", "aliases": [], "kwh": 400}],
    }
    repository = SnapshotRepository(); repository.replace(snapshot_copy)
    tools = EnergyTools(repository)
    overall = tools.get_equipment()
    assert overall["status"] == "ok" and overall["data"]["total_kwh"] == 900
    assert overall["warnings"] == ["Consumo anual ESTIMADO por auditoría."]
    assert tools.get_equipment("portal centro talca")["data"]["kwh"] == 500
    missing = tools.get_equipment("Curepto")
    assert missing["status"] == "not_found" and "Parral" in missing["warnings"][0]


def test_equipment_is_not_found_without_the_audit_file(snapshot_copy):
    repository = SnapshotRepository(); repository.replace(snapshot_copy)
    assert EnergyTools(repository).get_equipment()["status"] == "not_found"


def test_indicators_by_year_and_site_with_partial_warning(snapshot_copy):
    snapshot_copy["indicators"] = {"default_year": 2026, "note": "kWh total = red + autoconsumo solar.", "by_year": {
        "2025": {"partial": False, "sites": [{"name": "Curicó", "kwh_per_m2": 120.5}]},
        "2026": {"partial": True, "sites": [{"name": "Curicó", "kwh_per_m2": 30.1}]},
    }}
    repository = SnapshotRepository(); repository.replace(snapshot_copy)
    tools = EnergyTools(repository)
    assert tools.get_indicators(2025, "curico")["data"]["kwh_per_m2"] == 120.5
    partial = tools.get_indicators(2026)
    assert partial["status"] == "ok" and any("parciales" in w for w in partial["warnings"])
    assert any("año parcial" in w for w in partial["warnings"])
    assert tools.get_indicators(2024)["status"] == "not_found"
    assert tools.get_indicators(2025, "Talca")["status"] == "not_found"
