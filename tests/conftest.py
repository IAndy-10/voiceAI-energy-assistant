from __future__ import annotations

import copy

import pytest


@pytest.fixture
def valid_snapshot() -> dict:
    return {
        "schema_version": "1.0", "generator": "dashboard.html", "generated_at": "2026-10-25T10:00:00-03:00",
        "sources": [{"key": "costos", "file": "analisis-costos.xlsx", "sheets": ["Datos"], "rows": 10}],
        "periods": {"years": [2025, 2026], "complete_years": [2025], "partial_years": {"2026": [1, 2]}, "last_complete_year": 2025, "previous_year": 2024},
        "exec": {"year": 2025, "prev_year": 2024, "cost_cfv": {"clp": 1000, "display": "$0,0 M"}, "kwh": {"value": 100, "display": "0 MWh"}, "change": {"cost_pct": {"value": 5}}, "years": {
            "2025": {"complete": True, "months": list(range(1, 13)), "kwh": 100, "cost_sfv": {"clp": 1200, "display": "$0,0 M"}, "gd_discount": {"clp": 200, "display": "$0,0 M"}, "cost_cfv": {"clp": 1000, "display": "$0,0 M"}},
            "2026": {"complete": False, "months": [1, 2], "kwh": 20, "cost_sfv": {"clp": 250, "display": "$0,0 M"}, "gd_discount": {"clp": 25, "display": "$0,0 M"}, "cost_cfv": {"clp": 225, "display": "$0,0 M"}}
        }},
        "stores": [
            {"name": "Portal Centro Talca", "aliases": ["Portal Centro"], "year": 2025, "rank_cost": 1, "kwh": 50, "cost_cfv": {"clp": 800, "display": "$0,0 M"}, "notes": ["Chiller aparte"]},
            {"name": "Curepto", "aliases": [], "year": 2025, "rank_cost": 2, "kwh": 30, "cost_cfv": {"clp": 200, "display": "$0,0 M"}, "flags": ["base_baja"]}
        ],
        "rankings": {"metric_year": 2025, "cost_cfv_desc": ["Portal Centro Talca", "Curepto"], "kwh_desc": ["Portal Centro Talca", "Curepto"], "increase_abs_desc": ["Portal Centro Talca"], "increase_pct_desc": ["Curepto", "Portal Centro Talca"]},
        "solar": {"year": 2025, "plants_count": 1, "plants": [{"name": "Talca Solar", "aliases": ["Talca"], "kwp": 12, "generation_kwh": 42, "consistency": "REVISAR"}]},
        "chiller": {"site": "Portal Centro Talca", "note": "Facturado aparte", "by_year": {"2025": {"total_clp": 500, "btu": 100, "months": 12}}, "months": []},
        "known_gaps": ["Dato de prueba incompleto"]
    }


@pytest.fixture
def snapshot_copy(valid_snapshot):
    return copy.deepcopy(valid_snapshot)
