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
