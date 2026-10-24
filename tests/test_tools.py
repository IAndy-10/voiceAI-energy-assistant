import json
import os
from pathlib import Path

import pytest

from voice_server.snapshot import parse_snapshot
from voice_server.tools import TOOL_SPECS, anthropic_tool_definitions, match_entity, run_tool


def _no_raw_money(result) -> None:
    """Tool results carry display/say strings only, never raw CLP the model could do math on."""
    assert '"clp"' not in json.dumps(result)


# ── name matching ───────────────────────────────────────────────────


@pytest.mark.parametrize(("query", "expected"), [
    ("Portal Centro", "Portal Centro Talca"),
    ("portal centro talca", "Portal Centro Talca"),
    ("Kurepto", "Curepto"),                      # STT misspelling
    ("CD 1", "Centro de Distribución 1"),
    ("centro de distribución uno", "Centro de Distribución 1"),  # number word
    ("la tienda de Go Florida", "Go Florida Talca"),
])
def test_store_matching(snap, query, expected):
    store, _ = match_entity(query, snap["stores"])
    assert store and store["name"] == expected


@pytest.mark.parametrize("query", ["Talca", "centro de distribución"])
def test_ambiguous_names_return_candidates(snap, query):
    store, candidates = match_entity(query, snap["stores"])
    assert store is None
    assert len(candidates) >= 2


def test_unknown_store(snap):
    r = run_tool(snap, "get_store", {"name": "Antofagasta"})
    assert r["found"] is False


# ── get_overview ────────────────────────────────────────────────────


def test_overview_last_complete_year(snap):
    r = run_tool(snap, "get_overview", {})
    assert r["year"] == 2025
    assert r["cost"] == {"display": "$222,3 M", "say": "222,3 millones de pesos"}
    assert r["comparison"]["cost_change"]["say"] == "más 11,1 por ciento"
    assert r["comparison"]["grid_consumption_change"]["display"] == "-5,0%"
    assert r["official_price"]["say"] == "120,0 pesos por kilowatt hora"
    assert r["comparison"]["prev_official_price"]["display"] == "$100,5 por kWh"
    assert r["solar_discount_accumulated"]["say"] == "44 millones de pesos"
    assert any("chiller" in n for n in r["notes"])
    _no_raw_money(r)


def test_overview_partial_year_has_no_comparison(snap):
    r = run_tool(snap, "get_overview", {"year": 2026})
    assert r["complete_year"] is False
    assert r["partial_months"] == "enero, febrero y marzo"
    assert "comparison" not in r
    assert any("parcial" in n for n in r["notes"])


def test_overview_unknown_year(snap):
    r = run_tool(snap, "get_overview", {"year": 2019})
    assert r["found"] is False and r["available_years"] == [2024, 2025, 2026]


def test_year_given_as_string_is_coerced(snap):
    assert run_tool(snap, "get_overview", {"year": "2026"})["year"] == 2026


# ── get_store ───────────────────────────────────────────────────────


def test_store_with_change_and_chiller_note(snap):
    r = run_tool(snap, "get_store", {"name": "Portal Centro"})
    assert r["store"] == "Portal Centro Talca"
    assert r["rank_by_cost"] == "1 de 6"
    assert r["comparison"]["change"]["say"] == "aumento de 8 millones de pesos"
    assert any("chiller" in n for n in r["notes"])
    _no_raw_money(r)


def test_new_store_has_no_comparison(snap):
    r = run_tool(snap, "get_store", {"name": "Pichilemu"})
    assert "comparison" not in r
    assert any("sin datos del año anterior" in f.lower() for f in r["flags"])


def test_negative_cost_is_spoken_with_words(snap):
    r = run_tool(snap, "get_store", {"name": "CD 1"})
    assert r["cost"]["say"] == "menos 0,4 millones de pesos"
    assert any("negativo" in f for f in r["flags"])


def test_store_previous_year_and_unavailable_year(snap):
    assert run_tool(snap, "get_store", {"name": "Curepto", "year": 2024})["cost"]["display"] == "$1,1 M"
    assert run_tool(snap, "get_store", {"name": "Curepto", "year": 2023})["found"] is False


# ── rank_stores ─────────────────────────────────────────────────────


def test_rank_increase_abs(snap):
    r = run_tool(snap, "rank_stores", {"metric": "increase_abs", "top_n": 2})
    assert [i["store"] for i in r["items"]] == ["Portal Centro Talca", "Curepto"]
    assert r["items"][0]["change"]["display"] == "+$8,0 M"
    assert any("Pichilemu" in n for n in r["notes"])
    _no_raw_money(r)


def test_rank_increase_pct_flags_small_base(snap):
    r = run_tool(snap, "rank_stores", {"metric": "increase_pct", "top_n": 1})
    assert r["items"][0]["store"] == "Curepto"
    assert any("Base baja" in f for f in r["items"][0]["flags"])


def test_rank_ascending_and_top_n_clamped(snap):
    r = run_tool(snap, "rank_stores", {"metric": "cost", "order": "asc", "top_n": 99})
    assert r["items"][0]["store"] == "Centro de Distribución 1"
    assert len(r["items"]) == 5


def test_rank_kwh_per_m2_uses_last_complete_year(snap):
    # default_year is the partial 2026; the ranking must use 2025
    r = run_tool(snap, "rank_stores", {"metric": "kwh_per_m2"})
    assert r["year"] == 2025
    assert r["items"][0]["value"]["display"] == "113,2 kWh/m²"
    assert r["missing_m2"] == ["Go Florida Talca", "Pichilemu"]


def test_rank_unknown_metric(snap):
    r = run_tool(snap, "rank_stores", {"metric": "ventas"})
    assert r["found"] is False and "kwh_per_m2" in r["available_metrics"]


# ── solar / chiller / data info ─────────────────────────────────────


def test_solar_totals(snap):
    r = run_tool(snap, "get_solar", {})
    labels = {k["label"]: k for k in r["kpis"]}
    assert labels["Total kWp Instalados"]["say"] == "150,5 kilowatts peak"
    assert r["longest_payback"][0] == {"plant": "Multicentro Parral",
                                       "value": {"display": "12,5 años", "say": "12,5 años"}}
    assert r["solar_discount_accumulated"]["display"] == "$44 M"
    assert r["plants_in_review"] == ["Multicentro Curepto"]


def test_solar_plant_by_locality(snap):
    r = run_tool(snap, "get_solar", {"plant": "Parral"})
    assert r["plant"] == "Multicentro Parral"
    assert r["capacity"]["display"] == "65,0 kWp"
    assert r["generation"]["display"] == "75,2 MWh"
    assert r["payback_projected"]["say"] == "12,5 años"
    _no_raw_money(r)


def test_solar_plant_in_review_is_flagged(snap):
    assert "REVISAR" in run_tool(snap, "get_solar", {"plant": "Curepto"})["data_status"]


def test_chiller(snap):
    r = run_tool(snap, "get_chiller", {})
    assert r["total_accumulated"]["say"] == "12,3 millones de pesos"
    assert r["by_year"][0]["year"] == 2025
    missing = run_tool(snap, "get_chiller", {"year": 2024})
    assert missing["found"] is False and missing["available_years"] == [2025]


def test_data_info(snap):
    r = run_tool(snap, "get_data_info", {})
    assert r["synced_time"] == "09:15"
    assert r["partial_years"] == {"2026": "enero, febrero y marzo"}
    assert "equipment" in r["sections_not_loaded"]
    assert any("ventas" in g for g in r["known_gaps"])


def test_missing_sections(snap):
    snap["solar"] = snap["chiller"] = snap["indicators"] = None
    assert run_tool(snap, "get_solar", {})["found"] is False
    assert run_tool(snap, "get_chiller", {})["found"] is False
    assert run_tool(snap, "rank_stores", {"metric": "kwh_per_m2"})["found"] is False


# ── dispatch and schemas ────────────────────────────────────────────


def test_unknown_tool_and_bad_args(snap):
    assert "error" in run_tool(snap, "delete_everything", {})
    assert "error" in run_tool(snap, "get_overview", {"year": "dos mil"})
    # Unknown arguments are dropped, not passed through
    assert run_tool(snap, "get_data_info", {"evil": 1})["synced_time"] == "09:15"


def test_malformed_section_does_not_raise(snap):
    del snap["solar"]["plants"]
    assert run_tool(snap, "get_solar", {"plant": "Parral"})["found"] is False


def test_tool_definitions_are_valid_anthropic_tools():
    defs = anthropic_tool_definitions()
    assert [d["name"] for d in defs] == [s["name"] for s in TOOL_SPECS]
    for d in defs:
        assert d["input_schema"]["type"] == "object"
        assert set(d["input_schema"]["required"]) <= set(d["input_schema"]["properties"])


# ── optional: the real snapshot exported from the dashboard (never committed) ──

REAL = os.environ.get("REAL_SNAPSHOT")


@pytest.mark.skipif(not REAL, reason="set REAL_SNAPSHOT=/path/agent_snapshot.json")
def test_real_snapshot_every_store_and_plant_resolves():
    real = parse_snapshot(Path(REAL).read_bytes())
    for s in real["stores"]:
        for label in [s["name"], *s["aliases"]]:
            assert run_tool(real, "get_store", {"name": label})["store"] == s["name"], label
    for p in (real.get("solar") or {}).get("plants", []):
        for label in [p["name"], *p["aliases"]]:
            assert run_tool(real, "get_solar", {"plant": label})["plant"] == p["name"], label
    for metric in ("cost", "kwh", "increase_abs", "increase_pct", "increase_pct_excluding_small_base", "kwh_per_m2"):
        r = run_tool(real, "rank_stores", {"metric": metric, "top_n": 5})
        assert r["found"] and r["items"], metric
        _no_raw_money(r)
