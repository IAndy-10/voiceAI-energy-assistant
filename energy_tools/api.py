"""FastAPI adapter for local, authenticated snapshot queries."""

from __future__ import annotations

import os
import secrets
import json
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.responses import HTMLResponse
from pydantic import ValidationError

from .agent import AgentProviderError, AgentUnavailable, VestaAgent
from .agent_models import AgentChatRequest
from .agent_usage import BudgetExceeded
from .local_agent import LocalChatUnavailable, LocalEnergyAssistant
from .snapshot import SnapshotRepository
from .tools import EnergyTools


repository = SnapshotRepository()
tools = EnergyTools(repository)
agent = VestaAgent(repository)
local_agent = LocalEnergyAssistant(repository)
app = FastAPI(title="Vesta Energy Tools", version="0.1.0", docs_url="/docs", redoc_url=None)


def _configured_token() -> str | None:
    return os.getenv("ENERGY_TOOLS_API_TOKEN") or os.getenv("SNAPSHOT_API_TOKEN")


def _snapshot_max_bytes() -> int:
    return int(os.getenv("SNAPSHOT_MAX_BYTES", str(5 * 1024 * 1024)))


def _public_snapshot_metadata() -> dict[str, Any] | None:
    metadata = repository.metadata()
    if metadata is None:
        return None
    return {key: value for key, value in metadata.items() if key != "snapshot_id"}


def require_data_token(authorization: str | None = Header(default=None)) -> None:
    token = _configured_token()
    if not token:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="API token is not configured")
    if not authorization or not authorization.startswith("Bearer ") or not secrets.compare_digest(authorization[7:], token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


@app.get("/health")
def health() -> dict[str, Any]:
    return {"status": "ok", "snapshot_loaded": repository.get() is not None}


@app.get("/tools")
def list_tools() -> dict[str, Any]:
    return {"tools": ["get_overview", "get_store", "rank_stores", "get_solar", "get_chiller", "get_data_info"]}


@app.post("/snapshot", dependencies=[Depends(require_data_token)])
async def upload_snapshot(request: Request) -> dict[str, Any]:
    try:
        raw = await request.body()
        if len(raw) > _snapshot_max_bytes():
            raise HTTPException(status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                                detail="El snapshot supera el tamaño máximo permitido.")
        payload = json.loads(raw)
        if not isinstance(payload, dict):
            raise ValueError("Snapshot must be a JSON object")
        repository.replace(payload)
    except HTTPException:
        raise
    except (ValueError, ValidationError) as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Invalid snapshot") from exc
    return {"status": "accepted", **(_public_snapshot_metadata() or {})}


@app.get("/snapshot/status", dependencies=[Depends(require_data_token)])
def snapshot_status() -> dict[str, Any]:
    metadata = _public_snapshot_metadata()
    return {"status": "loaded" if metadata else "empty", "snapshot": metadata}


@app.get("/energy/overview", dependencies=[Depends(require_data_token)])
def overview(year: int) -> dict[str, Any]:
    return tools.get_overview(year)


@app.get("/energy/stores/ranking", dependencies=[Depends(require_data_token)])
def stores_ranking(metric: str, order: str = "desc", top_n: int = 10) -> dict[str, Any]:
    return tools.rank_stores(metric, order, top_n)


@app.get("/energy/stores/{name}", dependencies=[Depends(require_data_token)])
def store(name: str, year: int) -> dict[str, Any]:
    return tools.get_store(name, year)


@app.get("/energy/solar", dependencies=[Depends(require_data_token)])
def solar(plant: str | None = None) -> dict[str, Any]:
    return tools.get_solar(plant)


@app.get("/energy/chiller", dependencies=[Depends(require_data_token)])
def chiller(year: int | None = None) -> dict[str, Any]:
    return tools.get_chiller(year)


@app.get("/energy/data-info", dependencies=[Depends(require_data_token)])
def data_info() -> dict[str, Any]:
    return tools.get_data_info()


@app.get("/agent/status", dependencies=[Depends(require_data_token)])
def agent_status() -> dict[str, Any]:
    return agent.status()


@app.post("/agent/chat", dependencies=[Depends(require_data_token)])
def agent_chat(request: AgentChatRequest) -> dict[str, Any]:
    try:
        return agent.chat(request.question)
    except BudgetExceeded as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc)) from exc
    except AgentUnavailable as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except AgentProviderError as exc:
        response_status = {
            "timeout": status.HTTP_504_GATEWAY_TIMEOUT,
            "connection": status.HTTP_503_SERVICE_UNAVAILABLE,
            "rate_limit": status.HTTP_429_TOO_MANY_REQUESTS,
        }.get(exc.category, status.HTTP_502_BAD_GATEWAY)
        detail = {"code": f"openai_{exc.category}", "message": str(exc)}
        if exc.request_id:
            detail["request_id"] = exc.request_id
        raise HTTPException(status_code=response_status, detail=detail) from exc


@app.post("/agent/local-chat", dependencies=[Depends(require_data_token)])
def local_chat(request: AgentChatRequest) -> dict[str, Any]:
    try:
        return local_agent.chat(request.question)
    except LocalChatUnavailable as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.get("/demo", response_class=HTMLResponse)
def demo() -> HTMLResponse:
    """A local-only query launcher. Figures are fetched after the user supplies a token."""
    return HTMLResponse(
        content=(Path(__file__).with_name("demo.html")).read_text(encoding="utf-8"),
        headers={"Cache-Control": "no-store"},
    )
