"""Request model of the text assistant. Tool arguments live in ``energy_contracts``."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class AgentChatRequest(StrictModel):
    question: str = Field(min_length=1, max_length=2_000)
