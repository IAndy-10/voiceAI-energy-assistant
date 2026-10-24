from datetime import UTC, datetime, timedelta, timezone

from voice_server.prompts import greeting, system_prompt

CHILE_SUMMER = timezone(timedelta(hours=-3))


def test_greeting_says_today_when_synced_today(snap):
    now = datetime(2026, 10, 30, 11, 0, tzinfo=CHILE_SUMMER)
    assert "sincronizados hoy a las 09:15" in greeting(snap, now)


def test_greeting_names_the_date_when_synced_earlier(snap):
    now = datetime(2026, 10, 31, 8, 0, tzinfo=CHILE_SUMMER)
    assert "sincronizados el 30 de octubre a las 09:15" in greeting(snap, now)


def test_today_is_judged_in_the_dashboard_offset_not_the_server(snap):
    # 01:00 UTC on the 31st is still the 30th in Chile
    server_now = datetime(2026, 10, 31, 1, 0, tzinfo=UTC)
    assert "hoy" in greeting(snap, server_now)


def test_system_prompt_mentions_period_and_rules(snap):
    p = system_prompt(snap)
    assert "2024, 2025" in p and "2026: solo enero, febrero y marzo" in p
    assert '"say"' in p and "No tengo ese dato" in p and "chiller" in p
