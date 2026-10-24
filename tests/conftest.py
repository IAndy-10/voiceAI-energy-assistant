"""Synthetic snapshot in the exact shape dashboard.html's buildSnapshot() produces.

All figures are invented (the repository is public). Store names are real
places so name matching is exercised realistically.
"""

import copy
import sys
from pathlib import Path
from typing import Any

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def _money(clp: float, display: str, say: str) -> dict[str, Any]:
    return {"clp": clp, "display": display, "say": say}


def _pct(v: float, display: str, say: str) -> dict[str, Any]:
    return {"value": v, "display": display, "say": say}


def _store(name, aliases, rank, kwh, kwh_d, cost, prev, chg, chg_abs, flags=(), notes=(), disc=None):
    return {
        "name": name, "aliases": list(aliases), "year": 2025, "rank_cost": rank,
        "kwh": kwh, "kwh_display": kwh_d,
        "cost_cfv": cost, "cost_sfv": cost, "gd_discount": disc or _money(0, "$0,0 M", "0 millones de pesos"),
        "prev_year": 2024, "prev_cost_cfv": prev, "change_pct": chg, "change_abs": chg_abs,
        "flags": list(flags), "notes": list(notes),
    }


SYNTHETIC: dict[str, Any] = {
    "schema_version": "1.0",
    "generator": "dashboard.html",
    "generated_at": "2026-10-30T09:15:00-03:00",
    "generated_local": {"date": "30-10-2026", "time": "09:15"},
    "locale": "es-CL",
    "sources": [{"key": "costos", "file": "analisis-costos.xlsx", "sheets": ["Hoja1"], "rows": 100}],
    "official_price_clp_kwh": {"2024": 100.5, "2025": 120.0, "source": "Resumen Multicentro kWh", "note": "oficial"},
    "periods": {"years": [2024, 2025, 2026], "complete_years": [2024, 2025],
                "partial_years": {"2026": [1, 2, 3]}, "last_complete_year": 2025, "previous_year": 2024},
    "exec": {
        "year": 2025, "prev_year": 2024,
        "cost_cfv": _money(222_300_000, "$222,3 M", "222,3 millones de pesos"),
        "prev_cost_cfv": _money(200_100_000, "$200,1 M", "200,1 millones de pesos"),
        "kwh": {"value": 1_234_567, "display": "1.235 MWh"},
        "prev_kwh": {"value": 1_300_000, "display": "1.300 MWh"},
        "change": {"cost_pct": _pct(11.1, "+11,1%", "más 11,1 por ciento"),
                   "kwh_pct": _pct(-5.0, "-5,0%", "menos 5,0 por ciento"),
                   "price_pct": _pct(19.4, "+19,4%", "más 19,4 por ciento")},
        "solar_discount_accumulated": {"clp": 44_000_000, "display": "$44 M", "say": "44 millones de pesos",
                                       "years": [2024, 2025, 2026], "sites": 3},
        "kpi_cards": [{"label": "Costo Eléctrico Total", "value": "$222,3 M"}],
        "years": {
            "2024": {"complete": True, "months": list(range(1, 13)), "kwh": 1_300_000,
                     "cost_sfv": _money(1, "$210,0 M", "210 millones de pesos"),
                     "gd_discount": _money(1, "$9,9 M", "9,9 millones de pesos"),
                     "cost_cfv": _money(200_100_000, "$200,1 M", "200,1 millones de pesos"), "kwh_display": "1.300 MWh"},
            "2025": {"complete": True, "months": list(range(1, 13)), "kwh": 1_234_567,
                     "cost_sfv": _money(1, "$240,0 M", "240 millones de pesos"),
                     "gd_discount": _money(1, "$17,7 M", "17,7 millones de pesos"),
                     "cost_cfv": _money(222_300_000, "$222,3 M", "222,3 millones de pesos"), "kwh_display": "1.235 MWh"},
            "2026": {"complete": False, "months": [1, 2, 3], "kwh": 300_000,
                     "cost_sfv": _money(1, "$60,0 M", "60 millones de pesos"),
                     "gd_discount": _money(1, "$5,5 M", "5,5 millones de pesos"),
                     "cost_cfv": _money(54_500_000, "$54,5 M", "54,5 millones de pesos"), "kwh_display": "300 MWh"},
        },
    },
    "stores": [
        _store("Portal Centro Talca", ["Portal Centro", "Talca Portal"], 1, 300_000, "300 MWh",
               _money(50_000_000, "$50,0 M", "50 millones de pesos"),
               _money(42_000_000, "$42,0 M", "42 millones de pesos"),
               _pct(19.0, "+19,0%", "más 19,0 por ciento"),
               {"clp": 8_000_000, "display": "+$8,0 M", "say": "aumento de 8 millones de pesos"},
               notes=["El chiller (climatización) se factura aparte y no está incluido."]),
        _store("Go Florida Talca", ["Go Florida", "Florida"], 2, 200_000, "200 MWh",
               _money(30_000_000, "$30,0 M", "30 millones de pesos"),
               _money(29_000_000, "$29,0 M", "29 millones de pesos"),
               _pct(3.4, "+3,4%", "más 3,4 por ciento"),
               {"clp": 1_000_000, "display": "+$1,0 M", "say": "aumento de 1 millones de pesos"}),
        _store("Curepto", [], 3, 10_000, "10 MWh",
               _money(3_300_000, "$3,3 M", "3,3 millones de pesos"),
               _money(1_100_000, "$1,1 M", "1,1 millones de pesos"),
               _pct(200.0, "+200,0%", "más 200,0 por ciento"),
               {"clp": 2_200_000, "display": "+$2,2 M", "say": "aumento de 2,2 millones de pesos"},
               flags=["base_baja"], disc=_money(900_000, "$0,9 M", "0,9 millones de pesos")),
        _store("Pichilemu", [], 4, 5_000, "5 MWh",
               _money(2_000_000, "$2,0 M", "2 millones de pesos"), None, None, None,
               flags=["nueva"], notes=["Sin datos de 2024; no se calcula variación."]),
        _store("Centro de Distribución 1", ["Centro de Distribucion 1", "CD Talca", "CD 1"], 5, 20_000, "20 MWh",
               _money(-400_000, "$-0,4 M", "-0,4 millones de pesos"),
               _money(500_000, "$0,5 M", "0,5 millones de pesos"),
               _pct(-180.0, "-180,0%", "menos 180,0 por ciento"),
               {"clp": -900_000, "display": "-$0,9 M", "say": "reducción de 0,9 millones de pesos"},
               flags=["costo_neto_negativo_por_solar", "base_baja"]),
        _store("Centro de Distribución 2", ["Centro de Distribucion 2", "CD 2"], 6, 15_000, "15 MWh",
               _money(1_000_000, "$1,0 M", "1 millones de pesos"),
               _money(900_000, "$0,9 M", "0,9 millones de pesos"),
               _pct(11.1, "+11,1%", "más 11,1 por ciento"),
               {"clp": 100_000, "display": "+$0,1 M", "say": "aumento de 0,1 millones de pesos"}),
    ],
    "rankings": {
        "metric_year": 2025,
        "cost_cfv_desc": ["Portal Centro Talca", "Go Florida Talca", "Curepto", "Pichilemu",
                          "Centro de Distribución 2", "Centro de Distribución 1"],
        "kwh_desc": ["Portal Centro Talca", "Go Florida Talca", "Centro de Distribución 1",
                     "Centro de Distribución 2", "Curepto", "Pichilemu"],
        "increase_abs_desc": ["Portal Centro Talca", "Curepto", "Go Florida Talca",
                              "Centro de Distribución 2", "Centro de Distribución 1"],
        "increase_pct_desc": ["Curepto", "Portal Centro Talca", "Centro de Distribución 2", "Go Florida Talca"],
        "increase_pct_desc_excluding_small_base": ["Portal Centro Talca", "Centro de Distribución 2", "Go Florida Talca"],
    },
    "solar": {
        "year": 2025, "plants_count": 2, "kwp_total": 150.5, "panels_total": 400,
        "generation_kwh": 200_000, "self_consumption_kwh": 150_000, "injection_kwh": 50_000,
        "investment_total": _money(1, "$200,0 M", "200 millones de pesos"),
        "generation_accumulated": _money(1, "$90,0 M", "90 millones de pesos"),
        "pct_recovered_avg": 45.0, "annual_return_avg_pct": 12.0,
        "kpi_cards": [{"label": "Total kWp Instalados", "value": "150,5 kWp", "detail": "2 proyectos en operación"},
                      {"label": "Generación 2025", "value": "200,0 MWh", "detail": "Producción real monitoreo PFV"},
                      {"label": "Autoconsumo 2025", "value": "150,0 MWh", "detail": "75% autoconsumo · 25% inyección"}],
        "plants": [
            {"name": "Multicentro Parral", "aliases": ["Parral"], "localidad": "Parral", "owner": "Acme",
             "contract": "Leasing", "status": "En operación", "kwp": 65, "panels": 200, "year": 2025,
             "generation_kwh": 75_200, "injection_kwh": 17_400, "self_consumption_kwh": 57_800,
             "pct_injected": 23.2, "pct_savings_injection": 5.0, "pct_savings_total": 40.0, "consistency": "OK",
             "investment": _money(100_000_000, "$100,0 M", "100 millones de pesos"), "installer": "Acme",
             "years_active": 6.7, "payback_total_years": 12.5, "pct_recovered": 50.0, "annual_return_pct": 8.0},
            {"name": "Multicentro Curepto", "aliases": ["Curepto"], "localidad": "Curepto", "owner": "Propio",
             "contract": "Compra", "status": "En operación", "kwp": 85.5, "panels": 200, "year": 2025,
             "generation_kwh": 124_800, "injection_kwh": 32_600, "self_consumption_kwh": 92_200,
             "pct_injected": 26.1, "pct_savings_injection": 6.0, "pct_savings_total": 50.0, "consistency": "REVISAR",
             "investment": _money(100_000_000, "$100,0 M", "100 millones de pesos"), "installer": "Otro",
             "years_active": 3.0, "payback_total_years": 6.1, "pct_recovered": 40.0, "annual_return_pct": 16.0},
        ],
        "rankings": {"payback_longest_first": ["Multicentro Parral", "Multicentro Curepto"],
                     "generation_desc": ["Multicentro Curepto", "Multicentro Parral"]},
        "flagged_review": ["Multicentro Curepto"],
    },
    "chiller": {
        "site": "Portal Centro Talca", "note": "Climatización distrital facturada por BTU.",
        "total_accumulated": _money(12_345_678, "$12,3 M", "12,3 millones de pesos"),
        "btu_avg_month": 10_000, "active_months": 3, "participation_avg_pct": 15.0,
        "kpi_cards": [{"label": "Costo Total Acumulado", "value": "$12.345.678", "detail": "Portal Centro Talca · 3 meses"}],
        "by_year": {"2025": {"total_clp": 12_345_678, "btu": 30_000, "months": 3,
                             "total": _money(12_345_678, "$12,3 M", "12,3 millones de pesos")}},
        "months": [],
    },
    "equipment": None,
    "indicators": {
        "default_year": 2026, "note": "kWh total = red + autoconsumo solar.",
        "by_year": {
            "2025": {"partial": False, "kpi_cards": [],
                     "sites": [{"name": "Portal Centro Talca", "kwh_per_m2": 113.2},
                               {"name": "Curepto", "kwh_per_m2": 95.0},
                               {"name": "Go Florida Talca", "kwh_per_m2": None}],
                     "missing_m2": ["Go Florida Talca", "Pichilemu"]},
            "2026": {"partial": True, "kpi_cards": [],
                     "sites": [{"name": "Curepto", "kwh_per_m2": 30.0}], "missing_m2": []},
        },
    },
    "known_gaps": ["No hay datos de ventas, flujo de clientes ni horas reales de operación por tienda.",
                   "2026 es un año parcial (3 meses: Ene, Feb, Mar); no se compara con años completos."],
}


@pytest.fixture
def snap() -> dict[str, Any]:
    return copy.deepcopy(SYNTHETIC)
