import base64
import hashlib
import hmac
import sys
import types

import pytest
from pipecat.runner.run import _get_bot_module

from voice_agent.turn_credentials import build_turn_ice_server
from voice_agent.webrtc_runner import bot as minimal_pipeline_bot
from voice_agent.webrtc_turn_runner import bot as turn_runner_bot


def test_turn_credentials_are_time_bounded_and_rest_hmac_compatible():
    result = build_turn_ice_server("local-secret", "host.docker.internal", ttl_seconds=600, now=1_000)

    assert result["urls"] == "turn:host.docker.internal:3478?transport=udp"
    assert result["username"] == "1600:vesta-local"
    assert result["credential"] == base64.b64encode(
        hmac.new(b"local-secret", b"1600:vesta-local", hashlib.sha1).digest()
    ).decode("ascii")


def test_turn_runner_reexports_bot_for_pipecat_main_module_discovery():
    """Regression: ``python -m voice_agent.webrtc_turn_runner`` must expose bot."""
    assert turn_runner_bot is minimal_pipeline_bot

    main_module = types.ModuleType("__main__")
    main_module.bot = turn_runner_bot
    previous = sys.modules.get("__main__")
    sys.modules["__main__"] = main_module
    try:
        assert _get_bot_module() is main_module
    finally:
        if previous is not None:
            sys.modules["__main__"] = previous


@pytest.mark.parametrize("secret,host,ttl", [("", "host", 1), ("secret", "", 1), ("secret", "host", 0)])
def test_turn_credentials_require_complete_bounded_configuration(secret, host, ttl):
    with pytest.raises(ValueError):
        build_turn_ice_server(secret, host, ttl_seconds=ttl)
