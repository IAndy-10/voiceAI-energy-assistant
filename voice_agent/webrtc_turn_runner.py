"""Start the Pipecat Development Runner with TURN relay credentials.

Docker Desktop on macOS cannot route browser media to the container's own
address, so the browser always relays through a TURN server:

- ``VOICE_TURN_MODE=local`` (default): coturn (``turn-local``, published on
  127.0.0.1:3478). Only a browser on this machine can reach it.
- ``VOICE_TURN_MODE=twilio``: Twilio's Network Traversal Service, for a remote
  browser behind an HTTPS tunnel. Credentials renew before they expire.

``VOICE_ALLOWED_ORIGINS`` lists the dashboard origins allowed to open sessions.
That is CORS only, so ``POST /start`` also requires an API-issued session grant
(``voice_agent.start_guard``) before it returns any ICE server.
"""

from __future__ import annotations

import json
import os
from collections.abc import Callable, Mapping
from urllib.parse import urlsplit

from loguru import logger

from voice_agent.start_guard import install_start_guard
from voice_agent.turn_credentials import build_turn_ice_server
from voice_agent.twilio_ice import IceServerRefresher, TwilioIceError, fetch_twilio_ice_servers
from voice_agent.webrtc_runner import bot

# Pipecat 1.14's Development Runner discovers ``bot`` on ``__main__``. This
# module is executed with ``python -m`` for the TURN experiment, so re-export
# the existing minimal pipeline entry point rather than duplicating it here.
__all__ = [
    "allowed_origins_from_env",
    "bot",
    "configure_allowed_origins",
    "configure_turn_ice_environment",
    "install_pipecat_ice_hooks",
    "turn_mode_from_env",
]

DEFAULT_ALLOWED_ORIGINS = "http://127.0.0.1:8000,http://localhost:8000"
TURN_MODES = ("local", "twilio")


def turn_mode_from_env(env: Mapping[str, str] = os.environ) -> str:
    mode = env.get("VOICE_TURN_MODE", "local").strip().lower() or "local"
    if mode not in TURN_MODES:
        raise ValueError(f"VOICE_TURN_MODE must be one of {', '.join(TURN_MODES)}")
    return mode


def allowed_origins_from_env(env: Mapping[str, str] = os.environ) -> list[str]:
    """Parse ``VOICE_ALLOWED_ORIGINS`` (comma-separated) into exact origins.

    Pipecat treats an empty list as "allow every origin", so an empty value is
    an error instead of a silent opening. Each entry must be a bare
    ``http(s)://host[:port]`` origin, with no wildcard, path or query.
    """
    raw = env.get("VOICE_ALLOWED_ORIGINS")
    if raw is None:
        raw = DEFAULT_ALLOWED_ORIGINS
    origins: list[str] = []
    for item in (part.strip() for part in raw.split(",")):
        if not item:
            continue
        candidate = item.rstrip("/")
        parts = urlsplit(candidate)
        if (
            "*" in candidate
            or parts.scheme not in ("http", "https")
            or not parts.hostname
            or parts.path
            or parts.query
            or parts.fragment
            or parts.username
            or parts.password
        ):
            raise ValueError(f"VOICE_ALLOWED_ORIGINS has an invalid origin: {item!r}")
        if candidate not in origins:
            origins.append(candidate)
    if not origins:
        raise ValueError("VOICE_ALLOWED_ORIGINS must list at least one origin; an empty list allows every origin")
    return origins


def configure_allowed_origins(env: Mapping[str, str] = os.environ) -> list[str]:
    """Hand the validated origins to the runner (``PIPECAT_ALLOWED_ORIGINS``)."""
    origins = allowed_origins_from_env(env)
    os.environ["PIPECAT_ALLOWED_ORIGINS"] = ",".join(origins)
    logger.info(f"Voice sessions allowed from: {', '.join(origins)}")
    return origins


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


def install_pipecat_ice_hooks(refresher: IceServerRefresher) -> Callable[[], None]:
    """Let ``refresher`` renew the runner's ICE servers without a restart.

    Pipecat 1.14 keeps the parsed servers on ``args.ice_servers`` (read on every
    ``/start`` for the browser) and copies them once into the
    ``SmallWebRTCRequestHandler`` that builds the bot's peer connections. The
    parser hook makes ``args.ice_servers`` the refresher's shared list; the
    handler subclass registers each instance so it receives every new set via
    its public ``update_ice_servers``. The runner imports the handler inside
    ``_setup_webrtc_routes``, so replacing the module attribute is enough.
    Returns a function that undoes both patches.
    """
    import pipecat.runner.run as run_module
    from pipecat.transports.smallwebrtc import request_handler as handler_module

    original_parse = run_module._parse_ice_servers
    original_handler = handler_module.SmallWebRTCRequestHandler

    def parse_ice_servers(value):
        parsed = original_parse(value)
        if parsed and not refresher.servers:
            refresher.servers[:] = parsed
        return refresher.servers

    class RefreshingRequestHandler(original_handler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            refresher.register(self)

    run_module._parse_ice_servers = parse_ice_servers
    handler_module.SmallWebRTCRequestHandler = RefreshingRequestHandler

    def undo() -> None:
        run_module._parse_ice_servers = original_parse
        handler_module.SmallWebRTCRequestHandler = original_handler

    return undo


def _pipecat_ice_servers(servers):
    from pipecat.transports.smallwebrtc.connection import IceServer

    return [IceServer(**server) for server in servers]


def configure_twilio_ice() -> IceServerRefresher:
    ttl_seconds = int(os.getenv("VOICE_TURN_TTL_SECONDS", "86400"))
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    # A missing or malformed credential is a configuration error, not a transient
    # one: fail at startup instead of retrying forever.
    if not account_sid or not auth_token:
        raise TwilioIceError("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required in VOICE_TURN_MODE=twilio")
    if not account_sid.startswith("AC"):
        raise TwilioIceError("TWILIO_ACCOUNT_SID must be an account SID (it starts with AC)")
    if ttl_seconds <= 0:
        raise TwilioIceError("VOICE_TURN_TTL_SECONDS must be positive")
    refresher = IceServerRefresher(
        lambda: fetch_twilio_ice_servers(account_sid, auth_token, ttl_seconds=ttl_seconds),
        to_handler_servers=_pipecat_ice_servers,
    )
    install_pipecat_ice_hooks(refresher)
    # Never log the servers: they contain TURN credentials for the browser.
    os.environ.pop("PIPECAT_ICE_SERVERS", None)
    initial_ttl = refresher.try_refresh()
    if initial_ttl is None:
        logger.error("Starting without TURN; remote browsers will not connect until a retry succeeds")
    refresher.start(initial_ttl)
    return refresher


if __name__ == "__main__":
    try:
        configure_allowed_origins()
        mode = turn_mode_from_env()
    except ValueError as exc:
        raise SystemExit(f"Invalid voice runner configuration: {exc}") from None

    if mode == "twilio":
        try:
            configure_twilio_ice()
        except TwilioIceError as exc:
            raise SystemExit(f"Invalid Twilio TURN configuration: {exc}") from None
    else:
        try:
            configure_turn_ice_environment()
        except ValueError as exc:
            # Without TURN the bot offers only container addresses, which a macOS
            # browser cannot reach; start anyway so the failure is visible in the UI.
            logger.error(f"TURN not configured ({exc}); WebRTC media will likely fail on Docker Desktop")
    install_start_guard()
    from pipecat.runner.run import main

    main()
