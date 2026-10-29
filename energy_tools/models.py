"""Pydantic models for the JSON contract emitted by dashboard/dashboard.html.

The dashboard is the calculation authority.  These models deliberately retain
unknown fields so a dashboard can add display-oriented fields without breaking
the query service.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ContractModel(BaseModel):
    model_config = ConfigDict(extra="allow")


class Money(ContractModel):
    clp: int | float
    display: str
    say: str | None = None


class Source(ContractModel):
    key: str
    file: str
    sheets: list[str] | None = None
    rows: int | None = None


class Periods(ContractModel):
    years: list[int] = Field(min_length=1)
    complete_years: list[int] = Field(default_factory=list)
    partial_years: dict[int, list[int]] = Field(default_factory=dict)
    last_complete_year: int | None = None
    previous_year: int | None = None

    @model_validator(mode="after")
    def validate_periods(self) -> "Periods":
        known = set(self.years)
        if not set(self.complete_years).issubset(known):
            raise ValueError("complete_years contains a year absent from years")
        if not set(self.partial_years).issubset(known):
            raise ValueError("partial_years contains a year absent from years")
        if set(self.complete_years) & set(self.partial_years):
            raise ValueError("a year cannot be both complete and partial")
        for year, months in self.partial_years.items():
            if not months or any(month < 1 or month > 12 for month in months):
                raise ValueError(f"partial_years[{year}] must contain months from 1 to 12")
        return self


class YearTotals(ContractModel):
    complete: bool
    months: list[int]
    kwh: int | float
    cost_sfv: Money
    gd_discount: Money
    cost_cfv: Money
    kwh_display: str | None = None


class ExecData(ContractModel):
    year: int
    prev_year: int | None = None
    cost_cfv: Money
    kwh: dict[str, Any]
    years: dict[int, YearTotals]
    change: dict[str, Any] = Field(default_factory=dict)
    solar_discount_accumulated: dict[str, Any] | None = None


class Store(ContractModel):
    name: str
    aliases: list[str] = Field(default_factory=list)
    year: int
    rank_cost: int | None = None
    kwh: int | float | None = None
    kwh_display: str | None = None
    cost_cfv: Money | None = None
    cost_sfv: Money | None = None
    gd_discount: Money | None = None
    prev_year: int | None = None
    prev_cost_cfv: Money | None = None
    change_pct: dict[str, Any] | None = None
    change_abs: dict[str, Any] | None = None
    flags: list[str] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)


class Rankings(ContractModel):
    metric_year: int
    cost_cfv_desc: list[str] = Field(default_factory=list)
    kwh_desc: list[str] = Field(default_factory=list)
    increase_abs_desc: list[str] = Field(default_factory=list)
    increase_pct_desc: list[str] = Field(default_factory=list)
    increase_pct_desc_excluding_small_base: list[str] = Field(default_factory=list)


class Solar(ContractModel):
    year: int
    plants: list[dict[str, Any]] = Field(default_factory=list)
    plants_count: int | None = None


class Chiller(ContractModel):
    site: str
    note: str | None = None
    by_year: dict[int, dict[str, Any]] = Field(default_factory=dict)
    months: list[dict[str, Any]] = Field(default_factory=list)


class EnergySnapshot(ContractModel):
    schema_version: Literal["1.0"]
    generator: str
    generated_at: datetime
    locale: str = "es-CL"
    sources: list[Source] = Field(min_length=1)
    official_price_clp_kwh: dict[str, Any] = Field(default_factory=dict)
    periods: Periods
    exec: ExecData
    stores: list[Store]
    rankings: Rankings
    solar: Solar | None = None
    chiller: Chiller | None = None
    equipment: dict[str, Any] | None = None
    indicators: dict[str, Any] | None = None
    known_gaps: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_cross_references(self) -> "EnergySnapshot":
        if self.exec.year not in self.exec.years:
            raise ValueError("exec.year must be present in exec.years")
        if self.rankings.metric_year != self.exec.year:
            raise ValueError("rankings.metric_year must equal exec.year")
        return self
