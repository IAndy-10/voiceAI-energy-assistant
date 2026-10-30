from energy_tools.voice_sessions import VoiceSessionAuthority


def test_voice_session_authority_rejects_unapproved_ai_and_consumes_grants_once():
    authority = VoiceSessionAuthority(ttl_seconds=15)
    try:
        authority.issue("ai", ai_allowed=False)
        assert False, "AI grant should require the global server permission"
    except PermissionError:
        pass
    grant = authority.issue("minimal", ai_allowed=False)
    assert authority.consume(grant.token, "minimal") == "minimal"
    assert authority.consume(grant.token, "minimal") is None


def test_voice_session_authority_rejects_mode_changes_and_expired_grants():
    authority = VoiceSessionAuthority(ttl_seconds=15)
    grant = authority.issue("ai", ai_allowed=True)
    assert authority.consume(grant.token, "minimal") is None
    expired = authority.issue("minimal", ai_allowed=False)
    authority._grants[expired.token] = type(expired)(expired.token, expired.mode, 0)
    assert authority.consume(expired.token, "minimal") is None


def test_voice_session_authority_keeps_minimal_grants_available_without_ai_permission():
    authority = VoiceSessionAuthority(ttl_seconds=15)
    grant = authority.issue("minimal", ai_allowed=False)
    assert authority.consume(grant.token, "minimal") == "minimal"
