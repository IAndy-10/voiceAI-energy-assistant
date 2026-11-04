"""The eight Energy Tools contracts, shared by the API, the text agent and the voice agent.

One definition of each tool's name, description and arguments, so the OpenAI
text agent, the Pipecat voice agent and the HTTP adapter cannot drift apart.
It depends only on Pydantic, which both images already install, and is copied
into both of them.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field

Year = Annotated[int, Field(ge=2000, le=2100)]
Name = Annotated[str, Field(min_length=1, max_length=120)]


class ToolArgs(BaseModel):
    # strict: no coercion ("7" or True are not a month); arguments come from an LLM.
    model_config = ConfigDict(extra="forbid", strict=True, str_strip_whitespace=True)


class OverviewArgs(ToolArgs):
    year: Year
    month: Annotated[int, Field(ge=1, le=12)] | None = None


class StoreArgs(ToolArgs):
    name: Name
    year: Year


class RankingArgs(ToolArgs):
    metric: Literal["cost", "kwh", "increase_abs", "increase_pct"]
    order: Literal["asc", "desc"] = "desc"
    top_n: Annotated[int, Field(ge=1, le=20)] = 5


class SolarArgs(ToolArgs):
    plant: Name | None = None


class ChillerArgs(ToolArgs):
    year: Year | None = None


class EquipmentArgs(ToolArgs):
    store: Name | None = None


class IndicatorsArgs(ToolArgs):
    year: Year
    site: Name | None = None


class DataInfoArgs(ToolArgs):
    pass


@dataclass(frozen=True)
class ToolContract:
    name: str
    description: str
    args: type[ToolArgs]


TOOLS: dict[str, ToolContract] = {tool.name: tool for tool in (
    ToolContract("get_overview", "Costo y consumo de la cadena: total anual, o de un mes si month es 1-12.", OverviewArgs),
    ToolContract("get_store", "Datos de una sucursal y año.", StoreArgs),
    ToolContract("rank_stores", "Ranking precomputado de sucursales.", RankingArgs),
    ToolContract("get_solar", "Datos solares globales o de una planta.", SolarArgs),
    ToolContract("get_chiller", "Costos de chiller por año o globales.", ChillerArgs),
    ToolContract("get_equipment",
                 "Auditoría de equipos (consumo estimado, categorías, top equipos, lm/W), global o de una tienda.",
                 EquipmentArgs),
    ToolContract("get_indicators",
                 "Indicadores por localidad de un año: kWh/m², kWh/hora, CLP/m², tCO₂e; global o de una localidad.",
                 IndicatorsArgs),
    ToolContract("get_data_info", "Fuentes, período y brechas del snapshot activo.", DataInfoArgs),
)}
TOOL_NAMES: tuple[str, ...] = tuple(TOOLS)


def _compact(node: Any) -> Any:
    """Drop titles and defaults; write ``anyOf: [T, null]`` as ``type: [T, "null"]``."""
    if isinstance(node, list):
        return [_compact(item) for item in node]
    if not isinstance(node, dict):
        return node
    options = node.get("anyOf")
    if isinstance(options, list) and len(options) == 2 and {"type": "null"} in options:
        (inner,) = [option for option in options if option != {"type": "null"}]
        if isinstance(inner.get("type"), str):
            rest = {key: value for key, value in node.items() if key != "anyOf"}
            node = {**inner, **rest, "type": [inner["type"], "null"]}
    return {key: _compact(value) for key, value in node.items() if key not in {"title", "default"}}


def parameters_schema(args: type[ToolArgs]) -> dict[str, Any]:
    """JSON schema for an LLM: every property is required (null stands for "not given")."""
    schema = _compact(args.model_json_schema())
    schema["required"] = list(schema.get("properties", {}))
    return schema


def validate_arguments(name: str, arguments: Any) -> dict[str, Any]:
    """Validate an LLM tool call. Raises ``ValueError`` for an unknown tool or bad arguments.

    A missing optional argument takes its default (``None`` means "not given").
    """
    tool = TOOLS.get(name)
    if tool is None or not isinstance(arguments, dict):
        raise ValueError("Los argumentos de la herramienta no son compatibles.")
    # pydantic.ValidationError is a ValueError.
    return tool.args.model_validate(arguments).model_dump()
