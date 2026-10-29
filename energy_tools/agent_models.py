"""Validated contracts for the Vesta AI function-calling boundary."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class AgentChatRequest(StrictModel):
    question: str = Field(min_length=1, max_length=2_000)


class OverviewArgs(StrictModel):
    year: int = Field(ge=2000, le=2100)


class StoreArgs(OverviewArgs):
    name: str = Field(min_length=1, max_length=120)


class RankingArgs(StrictModel):
    metric: Literal["cost", "kwh", "increase_abs", "increase_pct"]
    order: Literal["asc", "desc"] = "desc"
    top_n: int = Field(default=5, ge=1, le=20)


class SolarArgs(StrictModel):
    plant: str | None = Field(default=None, max_length=120)


class ChillerArgs(StrictModel):
    year: int | None = Field(default=None, ge=2000, le=2100)


class DataInfoArgs(StrictModel):
    pass
