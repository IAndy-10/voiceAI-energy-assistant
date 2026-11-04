import inspect
import json
import os

import pytest
import pipecat.runner.run as run_module
from pipecat.transports.smallwebrtc import request_handler as handler_module
from pipecat.transports.smallwebrtc.connection import IceServer

from voice_agent import webrtc_turn_runner as runner
from voice_agent.twilio_ice import IceServerRefresher, TwilioIceError


def test_allowed_origins_default_to_the_local_dashboard():
    assert runner.allowed_origins_from_env({}) == ["http://127.0.0.1:8000", "http://localhost:8000"]


def test_allowed_origins_accept_an_https_tunnel_and_normalize_trailing_slashes():
    env = {"VOICE_ALLOWED_ORIGINS": " http://127.0.0.1:8000 , https://demo-x.trycloudflare.com/ ,"}
    assert runner.allowed_origins_from_env(env) == ["http://127.0.0.1:8000", "https://demo-x.trycloudflare.com"]


@pytest.mark.parametrize("value", ["", " , ", "*", "https://*.trycloudflare.com", "https://x.com/app",
                                   "ftp://x.com", "x.com", "https://x.com?a=1", "https://user:pw@x.com"])
def test_allowed_origins_never_fall_open(value):
    # Pipecat allows every origin when the list is empty, so these must fail.
    with pytest.raises(ValueError):
        runner.allowed_origins_from_env({"VOICE_ALLOWED_ORIGINS": value})


def test_configure_allowed_origins_sets_the_pipecat_variable(monkeypatch):
    monkeypatch.delenv("PIPECAT_ALLOWED_ORIGINS", raising=False)
    runner.configure_allowed_origins({"VOICE_ALLOWED_ORIGINS": "https://a.example,http://localhost:8000"})
    assert os.environ["PIPECAT_ALLOWED_ORIGINS"] == "https://a.example,http://localhost:8000"


@pytest.mark.parametrize("value,expected", [(None, "local"), ("", "local"), ("TWILIO", "twilio"), (" local ", "local")])
def test_turn_mode_defaults_to_local(value, expected):
    env = {} if value is None else {"VOICE_TURN_MODE": value}
    assert runner.turn_mode_from_env(env) == expected


def test_unknown_turn_mode_is_rejected():
    with pytest.raises(ValueError):
        runner.turn_mode_from_env({"VOICE_TURN_MODE": "coturn"})


def test_pipecat_still_imports_the_handler_inside_route_setup():
    """Regression guard for a Pipecat upgrade: the handler hook relies on this."""
    source = inspect.getsource(run_module._setup_webrtc_routes)
    assert "from pipecat.transports.smallwebrtc.request_handler import" in source
    assert "SmallWebRTCRequestHandler(" in source
    assert "args.ice_servers" in inspect.getsource(run_module._setup_unified_start_route)
    assert hasattr(handler_module.SmallWebRTCRequestHandler, "update_ice_servers")


def test_hooks_renew_the_runner_list_and_the_bot_handler_without_restart():
    sets = iter([
        ([{"urls": "turn:first:3478?transport=udp", "username": "u1", "credential": "c1"}], 600),
        ([{"urls": "turn:second:3478?transport=udp", "username": "u2", "credential": "c2"}], 600),
    ])
    refresher = IceServerRefresher(lambda: next(sets), to_handler_servers=runner._pipecat_ice_servers)
    undo = runner.install_pipecat_ice_hooks(refresher)
    try:
        refresher.refresh()
        # main() parses PIPECAT_ICE_SERVERS (unset in twilio mode) into args.ice_servers.
        args_ice_servers = run_module._parse_ice_servers(None)
        assert args_ice_servers is refresher.servers

        handler = handler_module.SmallWebRTCRequestHandler(
            ice_servers=[IceServer(**server) for server in args_ice_servers])
        assert [s.urls for s in handler._ice_servers] == ["turn:first:3478?transport=udp"]

        refresher.refresh()
        assert args_ice_servers[0]["urls"] == "turn:second:3478?transport=udp"
        assert [s.urls for s in handler._ice_servers] == ["turn:second:3478?transport=udp"]
        assert handler._ice_servers[0].credential == "c2"
    finally:
        undo()
    assert run_module._parse_ice_servers(None) == []
    assert handler_module.SmallWebRTCRequestHandler.__name__ == "SmallWebRTCRequestHandler"


def test_hooks_still_validate_ice_server_input():
    undo = runner.install_pipecat_ice_hooks(IceServerRefresher(lambda: ([], 1)))
    try:
        with pytest.raises(ValueError):
            run_module._parse_ice_servers(json.dumps([{"urls": "turn:x", "url": "turn:x"}]))
    finally:
        undo()


@pytest.mark.parametrize("env", [
    {},
    {"TWILIO_ACCOUNT_SID": "AC" + "0" * 32},
    {"TWILIO_AUTH_TOKEN": "token"},
    {"TWILIO_ACCOUNT_SID": "SK123", "TWILIO_AUTH_TOKEN": "token"},
])
def test_twilio_mode_fails_at_startup_without_valid_credentials(monkeypatch, env):
    for key in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"):
        monkeypatch.delenv(key, raising=False)
    for key, value in env.items():
        monkeypatch.setenv(key, value)
    original = run_module._parse_ice_servers
    with pytest.raises(TwilioIceError):
        runner.configure_twilio_ice()
    # Fails before patching Pipecat or starting the renewal thread.
    assert run_module._parse_ice_servers is original
