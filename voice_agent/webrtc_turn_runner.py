"""Start the Pipecat Development Runner with temporary local TURN credentials."""

from __future__ import annotations

import json
import os

from loguru import logger

from voice_agent.turn_credentials import build_turn_ice_server
from voice_agent.webrtc_runner import bot

# Pipecat 1.14's Development Runner discovers ``bot`` on ``__main__``. This
# module is executed with ``python -m`` for the TURN experiment, so re-export
# the existing minimal pipeline entry point rather than duplicating it here.
__all__ = ["bot", "configure_turn_ice_environment"]


def configure_turn_ice_environment() -> None:
    ttl_seconds = int(os.getenv("VOICE_TURN_TTL_SECONDS", "600"))
    ice_server = build_turn_ice_server(
        os.getenv("TURN_SHARED_SECRET", ""),
        os.getenv("PIPECAT_TURN_HOST", ""),
        ttl_seconds=ttl_seconds,
    )
    # The Development Runner forwards this configuration to both peers. Never log it:
    # it contains a short-lived TURN credential intended for the browser session.
    os.environ["PIPECAT_ICE_SERVERS"] = json.dumps([ice_server], separators=(",", ":"))
    logger.info("Configured one temporary local TURN ICE server")


if __name__ == "__main__":
    configure_turn_ice_environment()
    from pipecat.runner.run import main

    main()
