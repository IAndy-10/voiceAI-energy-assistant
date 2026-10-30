"""Start the Pipecat Development Runner with temporary local TURN credentials.

Docker Desktop on macOS cannot route browser media to the container's own
address, so the browser relays through coturn (published on 127.0.0.1:3478)
while the bot reaches coturn and is reached by it on the Compose network.
"""

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
    # The runner builds the credential once at startup and reuses it for every
    # session, so its lifetime bounds how long the container can accept sessions.
    ttl_seconds = int(os.getenv("VOICE_TURN_TTL_SECONDS", "86400"))
    ice_server = build_turn_ice_server(
        os.getenv("TURN_SHARED_SECRET", ""),
        os.getenv("PIPECAT_TURN_HOST", ""),
        ttl_seconds=ttl_seconds,
    )
    # The Development Runner forwards this configuration to both peers. Never log it:
    # it contains a short-lived TURN credential intended for the browser session.
    os.environ["PIPECAT_ICE_SERVERS"] = json.dumps([ice_server], separators=(",", ":"))
    logger.info(f"Configured one temporary local TURN ICE server (valid for {ttl_seconds} s)")


if __name__ == "__main__":
    try:
        configure_turn_ice_environment()
    except ValueError as exc:
        # Without TURN the bot offers only container addresses, which a macOS
        # browser cannot reach; start anyway so the failure is visible in the UI.
        logger.error(f"TURN not configured ({exc}); WebRTC media will likely fail on Docker Desktop")
    from pipecat.runner.run import main

    main()
