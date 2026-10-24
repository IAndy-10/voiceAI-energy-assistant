from types import SimpleNamespace

from voice_server.config import Config
from voice_server.harness import RunResult, ask, build_questions, check


def test_questions_take_expected_values_from_snapshot(snap):
    qs = {q.qid: q for q in build_questions(snap)}
    assert qs["Q1"].required == ["222,3", "200,1", "11,1"]
    assert qs["Q2"].required == ["8", "chiller"] and "Curepto" in qs["Q2"].optional
    assert qs["Q3"].required == ["44"]
    assert qs["B1"].required == ["12,5"]
    assert qs["B2"].required == ["150,5"]


def _result(answer, tool_text='{"say": "222,3 millones de pesos", "b": "200,1", "c": "11,1", "year": 2025}'):
    return RunResult(answer=answer, tools_called=["get_overview"], tool_text=tool_text, seconds=1.0)


def test_check_passes_good_answer(snap):
    q1 = build_questions(snap)[0]
    ok = "En 2025 el costo eléctrico neto fue 222,3 millones de pesos, frente a 200,1 en 2024: más 11,1 por ciento."
    assert check(q1, _result(ok)) == []


def test_check_catches_invented_numbers_symbols_and_missing_values(snap):
    q1 = build_questions(snap)[0]
    problems = check(q1, _result("Fue $222,3 M, un 15% más."))
    assert any("missing '200,1'" in p for p in problems)
    assert any("not from a tool" in p and "15" in p for p in problems)
    assert any("symbols" in p for p in problems)


def test_ask_runs_tool_loop_with_bot_settings(snap):
    """Fake client: first response asks for a tool, second answers."""
    calls = []

    def create(**kwargs):
        calls.append(kwargs)
        if len(calls) == 1:
            block = SimpleNamespace(type="tool_use", id="t1", name="get_overview", input={})
            return SimpleNamespace(stop_reason="tool_use", content=[block])
        return SimpleNamespace(stop_reason="end_turn", content=[SimpleNamespace(type="text", text="Listo.")])

    client = SimpleNamespace(beta=SimpleNamespace(messages=SimpleNamespace(create=create)))
    r = ask(client, Config(), snap, "¿Cuánto pagamos?")
    assert r.answer == "Listo." and r.tools_called == ["get_overview"]
    assert calls[0]["thinking"] == {"type": "adaptive"} and calls[0]["output_config"] == {"effort": "low"}
    assert calls[0]["fallbacks"] == "default" and calls[0]["betas"] == ["server-side-fallback-2026-07-01"]
    tool_result = calls[1]["messages"][2]["content"][0]
    assert tool_result["type"] == "tool_result" and "222,3 millones" in tool_result["content"]


def test_ask_reports_refusal(snap):
    def create(**_kw):
        return SimpleNamespace(stop_reason="refusal", stop_details={"category": "cyber"}, content=[])

    client = SimpleNamespace(beta=SimpleNamespace(messages=SimpleNamespace(create=create)))
    assert "refusal" in ask(client, Config(), snap, "x").error
