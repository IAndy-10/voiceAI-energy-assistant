import io
import json
import urllib.error
import urllib.parse

import pytest

from voice_agent.twilio_ice import (
    MAX_RETRY_SECONDS,
    MIN_REFRESH_SECONDS,
    IceServerRefresher,
    TwilioIceError,
    fetch_twilio_ice_servers,
    normalize_ice_servers,
    refresh_delay,
)

SID = "AC" + "0" * 32
TOKEN = "fake-auth-token-value-0123456789"
TURN_USER = "fake-turn-username"
TURN_PASS = "fake-turn-credential"

TWILIO_BODY = {
    "ttl": "86400",
    "ice_servers": [
        {"url": "stun:global.stun.twilio.com:3478", "urls": "stun:global.stun.twilio.com:3478"},
        {"url": "turn:global.turn.twilio.com:3478?transport=tcp", "urls": "turn:global.turn.twilio.com:3478?transport=tcp",
         "username": TURN_USER, "credential": TURN_PASS},
        {"url": "turn:global.turn.twilio.com:3478?transport=udp", "urls": "turn:global.turn.twilio.com:3478?transport=udp",
         "username": TURN_USER, "credential": TURN_PASS},
        {"url": "turn:global.turn.twilio.com:443?transport=tcp", "urls": "turn:global.turn.twilio.com:443?transport=tcp",
         "username": TURN_USER, "credential": TURN_PASS},
    ],
}


class FakeOpener:
    def __init__(self, body=None, error=None):
        self.body = body
        self.error = error
        self.requests = []

    def __call__(self, request, timeout):
        self.requests.append((request, timeout))
        if self.error is not None:
            raise self.error
        return io.BytesIO(json.dumps(self.body).encode("utf-8"))


def test_fetch_posts_ttl_with_basic_auth_and_normalizes_for_pipecat():
    opener = FakeOpener(TWILIO_BODY)
    servers, ttl = fetch_twilio_ice_servers(SID, TOKEN, ttl_seconds=3600, opener=opener)

    request, timeout = opener.requests[0]
    assert request.get_method() == "POST"
    assert request.full_url == f"https://api.twilio.com/2010-04-01/Accounts/{SID}/Tokens.json"
    assert urllib.parse.parse_qs(request.data.decode()) == {"Ttl": ["3600"]}
    assert request.get_header("Authorization").startswith("Basic ")
    assert timeout == 10.0
    assert ttl == 86400
    # Pipecat 1.14 rejects any key other than urls/username/credential.
    assert all(set(server) <= {"urls", "username", "credential"} for server in servers)
    # STUN first, then TURN over UDP: aiortc uses only the first TURN URL.
    assert [server["urls"] for server in servers] == [
        "stun:global.stun.twilio.com:3478",
        "turn:global.turn.twilio.com:3478?transport=udp",
        "turn:global.turn.twilio.com:3478?transport=tcp",
        "turn:global.turn.twilio.com:443?transport=tcp",
    ]
    assert servers[1]["username"] == TURN_USER and servers[1]["credential"] == TURN_PASS


def test_normalize_accepts_the_legacy_url_key_and_requires_a_credentialed_turn():
    servers = normalize_ice_servers([{"url": "turn:t:3478", "username": "u", "credential": "c"}])
    assert servers == [{"urls": "turn:t:3478", "username": "u", "credential": "c"}]
    with pytest.raises(TwilioIceError):
        normalize_ice_servers([{"urls": "stun:s:3478"}])
    with pytest.raises(TwilioIceError):
        normalize_ice_servers(None)


@pytest.mark.parametrize(
    "error",
    [
        urllib.error.HTTPError(f"https://api.twilio.com/2010-04-01/Accounts/{SID}/Tokens.json", 401,
                               f"Unauthorized {TOKEN}", {}, None),
        urllib.error.URLError(f"connection refused {SID}"),
        TimeoutError(),
    ],
)
def test_errors_never_carry_the_account_sid_or_token(error):
    with pytest.raises(TwilioIceError) as caught:
        fetch_twilio_ice_servers(SID, TOKEN, opener=FakeOpener(error=error))
    message = str(caught.value)
    assert SID not in message and TOKEN not in message
    # The original exception (with the URL) is not chained into the traceback.
    assert caught.value.__cause__ is None


def test_http_errors_keep_only_the_status_code():
    error = urllib.error.HTTPError("https://example.invalid", 401, "Unauthorized", {}, None)
    with pytest.raises(TwilioIceError, match=r"HTTP 401"):
        fetch_twilio_ice_servers(SID, TOKEN, opener=FakeOpener(error=error))


@pytest.mark.parametrize("sid,token,ttl", [("", TOKEN, 60), (SID, "", 60), ("XX123", TOKEN, 60), (SID, TOKEN, 0)])
def test_fetch_rejects_incomplete_configuration_without_calling_twilio(sid, token, ttl):
    opener = FakeOpener(TWILIO_BODY)
    with pytest.raises(TwilioIceError):
        fetch_twilio_ice_servers(sid, token, ttl_seconds=ttl, opener=opener)
    assert opener.requests == []


def test_invalid_json_is_reported_without_content():
    class BadOpener(FakeOpener):
        def __call__(self, request, timeout):
            return io.BytesIO(b"<html>not json</html>")

    with pytest.raises(TwilioIceError, match="invalid"):
        fetch_twilio_ice_servers(SID, TOKEN, opener=BadOpener())


def test_refresh_delay_renews_well_before_expiry():
    assert refresh_delay(86400) == 69120
    # Leaves far more than a 300 s session before the credential expires.
    assert 86400 - refresh_delay(86400) > 300
    assert refresh_delay(10) == MIN_REFRESH_SECONDS


class FakeHandler:
    def __init__(self):
        self.updates = []

    def update_ice_servers(self, servers):
        self.updates.append(servers)


def test_refresher_updates_the_shared_list_in_place_and_every_handler():
    sets = iter([([{"urls": "turn:a", "username": "u1", "credential": "c1"}], 600),
                 ([{"urls": "turn:b", "username": "u2", "credential": "c2"}], 900)])
    refresher = IceServerRefresher(lambda: next(sets), to_handler_servers=lambda s: ("converted", s))
    shared = refresher.servers
    handler = FakeHandler()
    refresher.register(handler)
    assert handler.updates == []  # nothing to push before the first fetch

    assert refresher.refresh() == 600
    late = FakeHandler()
    refresher.register(late)  # a handler created after a fetch gets the current set
    assert refresher.refresh() == 900

    assert refresher.servers is shared
    assert shared == [{"urls": "turn:b", "username": "u2", "credential": "c2"}]
    assert [u[1][0]["urls"] for u in handler.updates] == ["turn:a", "turn:b"]
    assert [u[1][0]["urls"] for u in late.updates] == ["turn:a", "turn:b"]
    assert all(u[0] == "converted" for u in handler.updates)


def test_failed_refresh_keeps_the_previous_set_and_backs_off():
    calls = {"n": 0}

    def fetch():
        calls["n"] += 1
        if calls["n"] == 1:
            return [{"urls": "turn:a", "username": "u", "credential": "c"}], 600
        raise TwilioIceError("Could not reach Twilio for TURN credentials")

    refresher = IceServerRefresher(fetch)
    assert refresher.try_refresh() == 600
    assert refresher.try_refresh() is None
    assert refresher.servers == [{"urls": "turn:a", "username": "u", "credential": "c"}]

    assert refresher.next_wait(600, MIN_REFRESH_SECONDS) == (480, MIN_REFRESH_SECONDS)
    wait, retry = refresher.next_wait(None, MIN_REFRESH_SECONDS)
    assert (wait, retry) == (60, 120)
    for _ in range(10):
        wait, retry = refresher.next_wait(None, retry)
    assert wait == MAX_RETRY_SECONDS and retry == MAX_RETRY_SECONDS


def test_refresher_log_lines_do_not_contain_credentials():
    from loguru import logger

    lines = []
    sink = logger.add(lines.append, format="{message}")
    try:
        refresher = IceServerRefresher(
            lambda: ([{"urls": "turn:a", "username": TURN_USER, "credential": TURN_PASS}], 600))
        refresher.refresh()
    finally:
        logger.remove(sink)
    text = "".join(str(line) for line in lines)
    assert "valid for 600 s" in text
    assert TURN_USER not in text and TURN_PASS not in text
