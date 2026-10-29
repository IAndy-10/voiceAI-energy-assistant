"""Disabled-by-default local host for the future Pipecat browser pipeline."""

from __future__ import annotations

import os

from fastapi import FastAPI

app = FastAPI(title="Vesta Voice Agent", docs_url=None, redoc_url=None)


@app.get("/health")
def health() -> dict[str, object]:
    """No provider client, microphone, or snapshot access is created here."""
    return {
        "status": "ok",
        "voice_enabled": os.getenv("VOICE_AGENT_ENABLED", "false").lower() == "true",
        "pipeline": "not_started",
        "pipecat_version": "1.14.0",
    }
