"""Read-only tools the LLM calls over the pinned snapshot (spec §7.1).

Rules:
- Every value the agent may speak comes back as ``{"display", "say"}``:
  ``display`` is the on-screen string, ``say`` is what goes to TTS. Raw
  numbers (CLP, kWh) are left out, so the model has nothing to do math on.
- Rankings and % changes come precomputed from the dashboard. Code here
  only picks, orders and formats values that are already in the snapshot.
- Unknown names or years return ``found: false`` with candidates or the
  available options, so the agent can ask or say "no tengo ese dato".
"""

import re
import unicodedata
from collections.abc import Callable
from typing import Any

from loguru import logger
from rapidfuzz import fuzz, process

from voice_server.es_cl import fmt_dec, fmt_mwh, month_list
from voice_server.snapshot import Snapshot
from voice_server.spoken import to_spoken

ToolResult = dict[str, Any]

# Fuzzy store/plant matching: accept the best match only if it is good and
# clearly ahead of the next store ("Talca" alone matches four stores)
MATCH_CUTOFF = 80
AMBIGUITY_MARGIN = 6
MAX_TOP_N = 5
NUMBER_WORDS = {"uno": "1", "una": "1", "dos": "2", "tres": "3", "cuatro": "4"}

METRIC_COST = "Costo eléctrico C/FV: costo neto después de los descuentos por generación solar"
FLAG_TEXT = {
    "nueva": "Tienda sin datos del año anterior: no se calcula variación.",
    "base_baja": "Base baja: el porcentaje es alto porque el costo del año anterior era pequeño; "
    "destaque el monto en pesos.",
    "costo_neto_negativo_por_solar": "Costo neto negativo: los descuentos solares superaron el costo de la energía.",
}


# ── formatting helpers ──────────────────────────────────────────────


def _val(display: str) -> dict[str, str]:
    return {"display": display, "say": to_spoken(display)}


def _money(m: dict[str, Any] | None) -> dict[str, str] | None:
    # to_spoken spells a leading minus ("-0,4 millones" → "menos 0,4 millones")
    return {"display": m["display"], "say": to_spoken(m["say"])} if m else None


def _pct(p: dict[str, Any] | None) -> dict[str, str] | None:
    return {"display": p["display"], "say": p["say"]} if p else None


def _price(snap: Snapshot, year: int | None) -> dict[str, str] | None:
    value = snap["official_price_clp_kwh"].get(str(year))
    if value is None:
        return None
    num = fmt_dec(value, 1)
    return {"display": f"${num} por kWh", "say": f"{num} pesos por kilowatt hora"}


def _solar_discount(snap: Snapshot) -> ToolResult | None:
    d = snap["exec"].get("solar_discount_accumulated")
    if not d:
        return None
    return {
        "display": d["display"], "say": d["say"], "years": d.get("years"), "sites": d.get("sites"),
        "note": "Descuentos por inyección (generación distribuida) en las facturas; "
        "no incluye el ahorro por autoconsumo.",
    }


def _clean(d: ToolResult) -> ToolResult:
    """Drop empty values so the model only sees what exists."""
    return {k: v for k, v in d.items() if v not in (None, [], {}, "")}


# ── name matching ───────────────────────────────────────────────────


def normalize_name(text: str) -> str:
    """Lowercase, strip accents and the "Multicentro" prefix, collapse punctuation."""
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn").lower()
    text = re.sub(r"\bmulticentro\b", " ", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    # STT writes "centro de distribución uno" for "Centro de Distribución 1"
    return " ".join(NUMBER_WORDS.get(w, w) for w in text.split())


def match_entity(query: str, entities: list[dict[str, Any]]) -> tuple[dict[str, Any] | None, list[str]]:
    """Find a store or plant by name or alias; returns (match, candidates)."""
    q = normalize_name(query)
    labels: dict[str, int] = {}
    for i, e in enumerate(entities):
        for label in [e["name"], *e.get("aliases", [])]:
            labels.setdefault(normalize_name(label), i)
    if not q:
        return None, []
    if q in labels:
        return entities[labels[q]], []

    best: dict[int, float] = {}
    for label, score, _ in process.extract(q, list(labels), scorer=fuzz.WRatio, limit=12):
        i = labels[label]
        best[i] = max(best.get(i, 0.0), score)
    ranked = sorted(best.items(), key=lambda kv: -kv[1])
    if ranked and ranked[0][1] >= MATCH_CUTOFF and (
        len(ranked) == 1 or ranked[0][1] - ranked[1][1] >= AMBIGUITY_MARGIN
    ):
        return entities[ranked[0][0]], []
    return None, [entities[i]["name"] for i, score in ranked[:3] if score >= 50]


def _not_found(kind: str, query: str, candidates: list[str]) -> ToolResult:
    if candidates:
        hint = f"No está claro a qué {kind} se refiere: pregunte si es alguna de las candidatas."
    else:
        hint = f"No hay {kind} con ese nombre en los datos cargados."
    return _clean({"found": False, "query": query, "candidates": candidates, "hint": hint})


# ── tools ───────────────────────────────────────────────────────────


def get_overview(snap: Snapshot, year: int | None = None) -> ToolResult:
    """Chain totals for one year, with the comparison when it is the last complete year."""
    periods, ex = snap["periods"], snap["exec"]
    y = year or periods["last_complete_year"]
    notes = ["El chiller de Portal Centro Talca se factura aparte y no está incluido."]

    if y == ex["year"]:
        ch = ex.get("change") or {}
        comparison = None
        if ex.get("prev_cost_cfv"):
            comparison = _clean({
                "vs_year": ex.get("prev_year"),
                "prev_cost": _money(ex["prev_cost_cfv"]),
                "prev_grid_consumption": _val(ex["prev_kwh"]["display"]) if ex.get("prev_kwh") else None,
                "prev_official_price": _price(snap, ex.get("prev_year")),
                "cost_change": _pct(ch.get("cost_pct")),
                "grid_consumption_change": _pct(ch.get("kwh_pct")),
                "official_price_change": _pct(ch.get("price_pct")),
            })
        return _clean({
            "found": True, "year": y, "complete_year": True, "metric": METRIC_COST,
            "cost": _money(ex["cost_cfv"]),
            "grid_consumption": _val(ex["kwh"]["display"]),
            "official_price": _price(snap, y),
            "official_price_note": "Precio oficial promedio de energía (fuente: "
            f"{snap['official_price_clp_kwh'].get('source', 'Resumen Multicentro kWh')}). "
            "No es costo dividido por kWh.",
            "comparison": comparison,
            "solar_discount_accumulated": _solar_discount(snap),
            "notes": notes,
        })

    yd = ex["years"].get(str(y))
    if not yd:
        return {"found": False, "year": y, "available_years": periods.get("years", []),
                "hint": f"No hay datos de {y} en la información cargada."}
    if not yd.get("complete"):
        notes.append(f"{y} es un año parcial ({month_list(yd.get('months', []))}); no se compara con un año completo.")
    return _clean({
        "found": True, "year": y, "complete_year": bool(yd.get("complete")),
        "partial_months": None if yd.get("complete") else month_list(yd.get("months", [])),
        "metric": METRIC_COST,
        "cost": _money(yd["cost_cfv"]),
        "grid_consumption": _val(yd["kwh_display"]),
        "solar_discount_this_year": _money(yd.get("gd_discount")),
        "official_price": _price(snap, y),
        "notes": notes,
    })


def get_store(snap: Snapshot, name: str, year: int | None = None) -> ToolResult:
    """One store's cost, consumption, rank and change vs the previous year."""
    store, candidates = match_entity(name, snap["stores"])
    if not store:
        return _not_found("tienda", name, candidates)
    y = year or store["year"]
    base: ToolResult = {"found": True, "store": store["name"], "metric": METRIC_COST,
                        "flags": [FLAG_TEXT.get(f, f) for f in store.get("flags", [])],
                        "notes": store.get("notes", [])}

    if y == store["year"]:
        comparison = None
        if store.get("change_abs"):
            comparison = _clean({
                "vs_year": store.get("prev_year"),
                "prev_cost": _money(store.get("prev_cost_cfv")),
                "change": _money(store["change_abs"]),
                "change_pct": _pct(store.get("change_pct")),
            })
        disc = store.get("gd_discount")
        return _clean({
            **base, "year": y,
            "cost": _money(store["cost_cfv"]),
            "grid_consumption": _val(store["kwh_display"]),
            "rank_by_cost": f"{store['rank_cost']} de {len(snap['stores'])}",
            "solar_discount_this_year": _money(disc) if disc and disc.get("clp", 0) > 0 else None,
            "comparison": comparison,
        })
    if y == store.get("prev_year") and store.get("prev_cost_cfv"):
        return _clean({**base, "year": y, "cost": _money(store["prev_cost_cfv"])})
    return {"found": False, "store": store["name"], "year": y,
            "hint": f"Por tienda solo hay datos de {store['year']} y {store.get('prev_year')}."}


RANK_METRICS = {
    "cost": ("cost_cfv_desc", "Costo eléctrico C/FV del año"),
    "kwh": ("kwh_desc", "Consumo de red del año"),
    "increase_abs": ("increase_abs_desc", "Aumento de costo en pesos vs el año anterior"),
    "increase_pct": ("increase_pct_desc", "Aumento de costo en porcentaje vs el año anterior"),
    "increase_pct_excluding_small_base": (
        "increase_pct_desc_excluding_small_base",
        "Aumento de costo en porcentaje, sin tiendas de base baja",
    ),
}


def _rank_kwh_per_m2(snap: Snapshot, order: str, top_n: int) -> ToolResult:
    ind = snap.get("indicators")
    if not ind:
        return {"found": False, "hint": "No se cargó el archivo de indicadores (m²)."}
    # by_year's default_year can be the partial year; rankings use the last complete one
    y = snap["periods"]["last_complete_year"]
    yd = ind["by_year"].get(str(y)) or ind["by_year"].get(str(ind.get("default_year")))
    if not yd:
        return {"found": False, "hint": "No hay indicadores por m² para un año completo."}
    sites = [s for s in yd["sites"] if s.get("kwh_per_m2") is not None]
    sites.sort(key=lambda s: s["kwh_per_m2"], reverse=(order == "desc"))
    return _clean({
        "found": True, "metric": "Consumo total por metro cuadrado (kWh/m²)", "year": y, "order": order,
        "items": [{"position": i + 1, "store": s["name"],
                   "value": _val(f"{fmt_dec(s['kwh_per_m2'], 1)} kWh/m²")}
                  for i, s in enumerate(sites[:top_n])],
        "ranked_count": len(sites),
        "missing_m2": yd.get("missing_m2", []),
        "notes": [ind.get("note", "kWh total = red + autoconsumo solar.")],
    })


def rank_stores(snap: Snapshot, metric: str, order: str = "desc", top_n: int = 3) -> ToolResult:
    """Top stores for a metric, from the dashboard's precomputed rankings."""
    order = "asc" if order == "asc" else "desc"
    top_n = max(1, min(int(top_n), MAX_TOP_N))
    if metric == "kwh_per_m2":
        return _rank_kwh_per_m2(snap, order, top_n)
    if metric not in RANK_METRICS:
        return {"found": False, "hint": f"Métrica desconocida '{metric}'.",
                "available_metrics": [*RANK_METRICS, "kwh_per_m2"]}

    key, label = RANK_METRICS[metric]
    names = list(snap["rankings"].get(key, []))
    if order == "asc":
        names.reverse()
    by_name = {s["name"]: s for s in snap["stores"]}

    items = []
    for i, n in enumerate(names[:top_n]):
        s = by_name.get(n)
        if not s:
            logger.warning(f"[Tools] ranking '{key}' names unknown store '{n}'")
            continue
        item: ToolResult = {"position": i + 1, "store": n,
                            "flags": [FLAG_TEXT.get(f, f) for f in s.get("flags", [])]}
        if metric == "cost":
            item["value"] = _money(s["cost_cfv"])
        elif metric == "kwh":
            item["value"] = _val(s["kwh_display"])
        else:
            item.update(change=_money(s.get("change_abs")), change_pct=_pct(s.get("change_pct")),
                        cost=_money(s["cost_cfv"]), prev_cost=_money(s.get("prev_cost_cfv")))
        items.append(_clean(item))

    notes: list[str] = []
    if metric.startswith("increase"):
        prev = snap["periods"].get("previous_year")
        new = [s["name"] for s in snap["stores"] if "nueva" in s.get("flags", [])]
        if new:
            notes.append(f"Sin datos de {prev} para {', '.join(new)}: no entran en la variación.")
    if metric == "increase_pct":
        notes.append("En porcentaje, una tienda de base baja sube mucho con montos pequeños; "
                     "dé primero el ranking en pesos (increase_abs).")
    return _clean({"found": True, "metric": label, "year": snap["rankings"].get("metric_year"),
                   "order": order, "items": items, "ranked_count": len(names), "notes": notes})


def _plant_summary(p: dict[str, Any]) -> ToolResult:
    def num(key: str, unit: str, decimals: int = 1) -> dict[str, str] | None:
        v = p.get(key)
        return _val(f"{fmt_dec(v, decimals)}{unit}") if v is not None else None

    def energy(key: str) -> dict[str, str] | None:
        return _val(fmt_mwh(p[key])) if p.get(key) is not None else None

    return _clean({
        "plant": p["name"], "location": p.get("localidad"), "owner": p.get("owner"),
        "contract": p.get("contract"), "status": p.get("status"),
        "capacity": num("kwp", " kWp"), "panels": num("panels", " paneles", 0),
        "year": p.get("year"),
        "generation": energy("generation_kwh"),
        "self_consumption": energy("self_consumption_kwh"),
        "injected_share": num("pct_injected", "% inyectado a la red"),
        "total_solar_savings_share": num("pct_savings_total", "% de ahorro total por energía solar"),
        "investment": _money(p.get("investment")),
        "years_active": num("years_active", " años"),
        "payback_projected": num("payback_total_years", " años"),
        "investment_recovered": num("pct_recovered", "%"),
        "annual_return": num("annual_return_pct", "%"),
        "data_status": "Datos en revisión (consistencia REVISAR)." if p.get("consistency") == "REVISAR" else None,
    })


def get_solar(snap: Snapshot, plant: str | None = None) -> ToolResult:
    """Solar totals, or one plant's figures."""
    solar = snap.get("solar")
    if not solar:
        return {"found": False, "hint": "No se cargó el archivo de proyectos solares."}
    if plant:
        p, candidates = match_entity(plant, solar["plants"])
        if not p:
            return _not_found("planta solar", plant, candidates)
        return {"found": True, **_plant_summary(p)}

    by_name = {p["name"]: p for p in solar["plants"]}

    def top(key: str, field: str, fmt: Callable[[Any], str]) -> list[ToolResult]:
        names = solar.get("rankings", {}).get(key, [])[:3]
        return [{"plant": n, "value": _val(fmt(by_name[n][field]))}
                for n in names if n in by_name and by_name[n].get(field) is not None]

    return _clean({
        "found": True, "year": solar.get("year"), "plants_count": solar.get("plants_count"),
        "kpis": [_clean({"label": k["label"], **_val(k["value"]), "detail": k.get("detail")})
                 for k in solar.get("kpi_cards", [])],
        "solar_discount_accumulated": _solar_discount(snap),
        "longest_payback": top("payback_longest_first", "payback_total_years", lambda v: f"{fmt_dec(v, 1)} años"),
        "highest_generation": top("generation_desc", "generation_kwh", fmt_mwh),
        "plants_in_review": solar.get("flagged_review", []),
    })


def get_chiller(snap: Snapshot, year: int | None = None) -> ToolResult:
    """Portal Centro Talca's district chiller, billed by BTU outside the electricity bill."""
    ch = snap.get("chiller")
    if not ch:
        return {"found": False, "hint": "No se cargó el archivo de costos del chiller."}
    base = {"found": True, "site": ch.get("site"), "note": ch.get("note")}
    if year is None:
        return _clean({
            **base,
            "total_accumulated": _money(ch.get("total_accumulated")),
            "kpis": [_clean({"label": k["label"], **_val(k["value"]), "detail": k.get("detail")})
                     for k in ch.get("kpi_cards", [])],
            "by_year": [{"year": int(y), "total": _money(v.get("total")), "billed_months": v.get("months")}
                        for y, v in sorted(ch.get("by_year", {}).items())],
        })
    yd = ch.get("by_year", {}).get(str(year))
    if not yd:
        return {"found": False, "year": year, "available_years": sorted(int(y) for y in ch.get("by_year", {})),
                "hint": f"No hay datos del chiller para {year}."}
    return _clean({**base, "year": year, "total": _money(yd.get("total")),
                   "consumption": _val(f"{fmt_dec(yd.get('btu', 0))} BTU"), "billed_months": yd.get("months")})


def get_data_info(snap: Snapshot) -> ToolResult:
    """Sync time, files loaded, periods covered and known gaps."""
    periods = snap["periods"]
    gl = snap["generated_local"]
    return _clean({
        "synced_at": f"{gl['date']} {gl['time']}",
        "synced_time": gl["time"],
        "sources": [{"file": s.get("file"), "rows": s.get("rows")} for s in snap.get("sources", [])],
        "complete_years": periods.get("complete_years"),
        "partial_years": {y: month_list(m) for y, m in periods.get("partial_years", {}).items()},
        "sections_not_loaded": [k for k in ("solar", "chiller", "equipment", "indicators") if not snap.get(k)],
        "known_gaps": snap.get("known_gaps", []),
    })


# ── registry: JSON schemas + dispatch ───────────────────────────────

_YEAR = {"type": "integer", "description": "Año, p. ej. 2025. Omitir para el último año completo."}

TOOL_SPECS: list[dict[str, Any]] = [
    {
        "name": "get_overview",
        "description": "Totales de la cadena para un año: costo eléctrico, consumo de red, precio oficial, "
        "variación vs el año anterior y ahorro solar acumulado. Úsala para preguntas generales de costo o consumo.",
        "properties": {"year": _YEAR},
        "required": [],
    },
    {
        "name": "get_store",
        "description": "Cifras de una tienda o sede: costo, consumo, lugar en el ranking y variación vs el año "
        "anterior. Acepta nombres aproximados (los nombres vienen de una transcripción de voz).",
        "properties": {"name": {"type": "string", "description": "Nombre de la tienda tal como lo dijo el usuario."},
                       "year": _YEAR},
        "required": ["name"],
    },
    {
        "name": "rank_stores",
        "description": "Ranking de tiendas por una métrica. Para '¿qué tienda subió más?' use increase_abs "
        "(pesos) y luego increase_pct para comparar.",
        "properties": {
            "metric": {"type": "string", "enum": [*RANK_METRICS, "kwh_per_m2"]},
            "order": {"type": "string", "enum": ["desc", "asc"], "description": "desc = mayor primero."},
            "top_n": {"type": "integer", "minimum": 1, "maximum": MAX_TOP_N},
        },
        "required": ["metric"],
    },
    {
        "name": "get_solar",
        "description": "Energía solar: sin 'plant' devuelve totales (kWp, generación, autoconsumo, ahorro "
        "acumulado, paybacks más largos); con 'plant' devuelve una planta.",
        "properties": {"plant": {"type": "string", "description": "Nombre de la planta o de su localidad."}},
        "required": [],
    },
    {
        "name": "get_chiller",
        "description": "Costo y consumo (BTU) del chiller de Portal Centro Talca, facturado aparte de la electricidad.",
        "properties": {"year": {"type": "integer", "description": "Año; omitir para el total acumulado."}},
        "required": [],
    },
    {
        "name": "get_data_info",
        "description": "Hora de sincronización, archivos cargados, períodos cubiertos y datos que faltan. "
        "Úsala cuando pidan algo que quizá no está en los datos.",
        "properties": {},
        "required": [],
    },
]

_HANDLERS: dict[str, Callable[..., ToolResult]] = {
    "get_overview": get_overview,
    "get_store": get_store,
    "rank_stores": rank_stores,
    "get_solar": get_solar,
    "get_chiller": get_chiller,
    "get_data_info": get_data_info,
}


def _coerce_args(name: str, args: dict[str, Any]) -> dict[str, Any]:
    allowed = next(s["properties"] for s in TOOL_SPECS if s["name"] == name)
    out: dict[str, Any] = {}
    for k, v in (args or {}).items():
        if k not in allowed or v in (None, ""):
            continue
        out[k] = int(v) if allowed[k].get("type") == "integer" else v
    return out


def run_tool(snap: Snapshot, name: str, args: dict[str, Any] | None) -> ToolResult:
    """Dispatch a tool call; bad arguments come back as an error the model can read."""
    handler = _HANDLERS.get(name)
    if handler is None:
        return {"error": f"Herramienta desconocida '{name}'. Disponibles: {', '.join(_HANDLERS)}."}
    try:
        return handler(snap, **_coerce_args(name, args or {}))
    except (TypeError, ValueError) as e:
        logger.warning(f"[Tools] {name}({args}) rejected: {e}")
        return {"error": f"Argumentos inválidos para {name}: {e}"}
    except KeyError as e:
        # A section missing a field: tell the model the figure isn't available instead of failing the turn
        logger.error(f"[Tools] {name}({args}) hit a snapshot without field {e}")
        return {"found": False, "hint": "Ese dato no está disponible en la información cargada."}


def anthropic_tool_definitions() -> list[dict[str, Any]]:
    """Tool list for the Anthropic Messages API (used by the text harness)."""
    return [{"name": s["name"], "description": s["description"],
             "input_schema": {"type": "object", "properties": s["properties"], "required": s["required"],
                              "additionalProperties": False}}
            for s in TOOL_SPECS]
