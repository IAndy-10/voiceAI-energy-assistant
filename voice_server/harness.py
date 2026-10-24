"""Text test harness for the scripted demo questions (spec §8, §11 Wed).

    python -m voice_server.harness tools --snapshot agent_snapshot.json
        Prints the tool results behind each scripted question (no API key needed).
        Use it for the data check: every value must match the dashboard screen.

    python -m voice_server.harness llm --snapshot agent_snapshot.json --runs 10
        Asks each question as text through Claude with the same system prompt,
        tools and model settings as the phone bot, and checks the answer:
        required numbers present, no number that didn't come from a tool,
        no "$"/"%" symbols, length. Exit code 1 if any run fails.

Expected values are read from the snapshot itself, so the key stays correct
when Pablo loads new files, and no client figures live in this repository.
"""

import argparse
import json
import re
import sys
import time
import unicodedata
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from voice_server.config import Config
from voice_server.prompts import system_prompt
from voice_server.snapshot import Snapshot, SnapshotError, parse_snapshot
from voice_server.tools import anthropic_tool_definitions, run_tool

NUMBER_RE = re.compile(r"\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?")
MAX_WORDS = 60  # prompt asks for ≤ 40; flag clear overruns only
MAX_TOOL_ROUNDS = 6


def _fold(text: str) -> str:
    text = unicodedata.normalize("NFD", text)
    return "".join(c for c in text if unicodedata.category(c) != "Mn").lower()


def _first_number(say: str) -> str:
    m = NUMBER_RE.search(say)
    if not m:
        raise ValueError(f"no number in '{say}'")
    return m.group(0)


@dataclass
class Question:
    qid: str
    text: str
    tool_calls: list[tuple[str, dict[str, Any]]]
    required: list[str] = field(default_factory=list)  # substrings (accent/case-insensitive)
    optional: list[str] = field(default_factory=list)
    any_of: list[list[str]] = field(default_factory=list)  # at least one per group


def build_questions(snap: Snapshot) -> list[Question]:
    """The scripted questions and their expected content, taken from the snapshot."""
    ex, rk = snap["exec"], snap["rankings"]
    by_name = {s["name"]: s for s in snap["stores"]}
    qs: list[Question] = []

    ch = ex.get("change", {})
    qs.append(Question(
        "Q1", f"¿Cuánto pagamos de electricidad en {ex['year']} y cómo se compara con {ex.get('prev_year')}?",
        [("get_overview", {})],
        required=[_first_number(ex["cost_cfv"]["say"]), _first_number(ex["prev_cost_cfv"]["say"]),
                  _first_number(ch["cost_pct"]["say"])],
        optional=[_first_number(ch["kwh_pct"]["say"]), _first_number(ch["price_pct"]["say"])],
    ))

    top_abs = by_name[rk["increase_abs_desc"][0]]
    q2 = Question(
        "Q2", "¿Qué tienda tuvo el mayor aumento de costo?",
        [("rank_stores", {"metric": "increase_abs"}), ("rank_stores", {"metric": "increase_pct"})],
        required=[_first_number(top_abs["change_abs"]["say"])],
        any_of=[[top_abs["name"], *top_abs.get("aliases", [])]],
    )
    if top_abs["name"] == "Portal Centro Talca":
        q2.required.append("chiller")
    top_pct = by_name[rk["increase_pct_desc"][0]]
    if top_pct["name"] != top_abs["name"]:
        q2.optional += [top_pct["name"], _first_number(top_pct["change_pct"]["say"])]
    qs.append(q2)

    disc = ex.get("solar_discount_accumulated")
    if disc:
        q3 = Question("Q3", "¿Cuánto nos ha ahorrado la energía solar?", [("get_solar", {})],
                      required=[_first_number(disc["say"])])
        gen = next((k["value"] for k in (snap.get("solar") or {}).get("kpi_cards", [])
                    if k["label"].startswith("Generación ") and "Acum" not in k["label"]), None)
        if gen:
            q3.optional.append(_first_number(gen))
        qs.append(q3)

    qs.append(Question("Q4", "¿Cuánto consume cada tienda por cliente?", [("get_data_info", {})],
                       required=["no tengo ese dato"]))

    solar = snap.get("solar")
    if solar and solar.get("rankings", {}).get("payback_longest_first"):
        p = next(x for x in solar["plants"] if x["name"] == solar["rankings"]["payback_longest_first"][0])
        qs.append(Question("B1", "¿Qué planta solar tarda más en pagarse?", [("get_solar", {})],
                           required=[f"{p['payback_total_years']:.1f}".replace(".", ",")],
                           any_of=[[p["name"], *p.get("aliases", [])]]))
        qs.append(Question("B2", "¿Cuántos kWp solares tenemos?", [("get_solar", {})],
                           required=[f"{solar['kwp_total']:.1f}".replace(".", ",")]))
    chiller = snap.get("chiller")
    if chiller and chiller.get("total_accumulated"):
        total = chiller["total_accumulated"]
        kpi_total = chiller["kpi_cards"][0]["value"] if chiller.get("kpi_cards") else ""
        qs.append(Question("B3", "¿Cuánto cuesta el chiller de Portal Centro?", [("get_chiller", {})],
                           any_of=[[_first_number(total["say"]), *NUMBER_RE.findall(kpi_total)[:1]]]))
    return qs


# ── tools mode ──────────────────────────────────────────────────────


def cmd_tools(snap: Snapshot, only: set[str] | None) -> int:
    for q in build_questions(snap):
        if only and q.qid not in only:
            continue
        print(f"\n=== {q.qid}: {q.text}")
        print(f"    expected: required={q.required} any_of={q.any_of} optional={q.optional}")
        for name, args in q.tool_calls:
            print(f"--- {name}({args})")
            print(json.dumps(run_tool(snap, name, args), ensure_ascii=False, indent=2))
    return 0


# ── llm mode ────────────────────────────────────────────────────────


@dataclass
class RunResult:
    answer: str
    tools_called: list[str]
    tool_text: str
    seconds: float
    error: str | None = None


def ask(client: Any, cfg: Config, snap: Snapshot, question: str) -> RunResult:
    """One question through the same model settings as the phone bot (manual tool loop)."""
    import anthropic

    messages: list[dict[str, Any]] = [{"role": "user", "content": question}]
    tools_called: list[str] = []
    tool_text: list[str] = []
    kwargs: dict[str, Any] = dict(cfg.llm_request_options())
    if cfg.llm_betas():
        kwargs["betas"] = cfg.llm_betas()
    t0 = time.monotonic()
    try:
        for _ in range(MAX_TOOL_ROUNDS):
            resp = client.beta.messages.create(
                model=cfg.llm_model, max_tokens=cfg.llm_max_tokens, system=system_prompt(snap),
                tools=anthropic_tool_definitions(), messages=messages, **kwargs,
            )
            if resp.stop_reason == "refusal":
                return RunResult("", tools_called, "", time.monotonic() - t0,
                                 error=f"refusal: {getattr(resp, 'stop_details', None)}")
            if resp.stop_reason == "tool_use":
                messages.append({"role": "assistant", "content": resp.content})
                results = []
                for block in resp.content:
                    if block.type == "tool_use":
                        tools_called.append(block.name)
                        out = json.dumps(run_tool(snap, block.name, dict(block.input or {})), ensure_ascii=False)
                        tool_text.append(out)
                        results.append({"type": "tool_result", "tool_use_id": block.id, "content": out})
                messages.append({"role": "user", "content": results})
                continue
            answer = "".join(b.text for b in resp.content if b.type == "text").strip()
            if resp.stop_reason == "max_tokens":
                return RunResult(answer, tools_called, "\n".join(tool_text), time.monotonic() - t0,
                                 error="max_tokens reached")
            return RunResult(answer, tools_called, "\n".join(tool_text), time.monotonic() - t0)
        return RunResult("", tools_called, "", time.monotonic() - t0, error="too many tool rounds")
    except anthropic.RateLimitError as e:
        return RunResult("", tools_called, "", time.monotonic() - t0, error=f"rate limited: {e}")
    except anthropic.APIStatusError as e:
        return RunResult("", tools_called, "", time.monotonic() - t0, error=f"API {e.status_code}: {e.message}")
    except anthropic.APIConnectionError as e:
        return RunResult("", tools_called, "", time.monotonic() - t0, error=f"connection: {e}")


def check(q: Question, r: RunResult) -> list[str]:
    """Problems with one answer; an empty list means the run passed."""
    if r.error:
        return [r.error]
    problems = []
    folded = _fold(r.answer)
    problems += [f"missing '{x}'" for x in q.required if _fold(x) not in folded]
    problems += [f"missing one of {g}" for g in q.any_of if not any(_fold(x) in folded for x in g)]
    if not r.tools_called:
        problems.append("answered without calling a tool")
    # Every number spoken must come from a tool result (or the question, e.g. the year)
    allowed = set(NUMBER_RE.findall(r.tool_text)) | set(NUMBER_RE.findall(q.text))
    invented = [n for n in NUMBER_RE.findall(r.answer) if n not in allowed]
    if invented:
        problems.append(f"numbers not from a tool: {invented}")
    if re.search(r"[$%]|\bM\b", r.answer):
        problems.append("symbols for TTS ($, %, M)")
    if len(r.answer.split()) > MAX_WORDS:
        problems.append(f"{len(r.answer.split())} words")
    return problems


def cmd_llm(snap: Snapshot, cfg: Config, runs: int, only: set[str] | None, verbose: bool) -> int:
    import anthropic

    # No key in the env: the SDK falls back to an `ant auth login` profile
    client = anthropic.Anthropic(api_key=cfg.anthropic_api_key or None, max_retries=2)
    print(f"model={cfg.llm_model} {json.dumps(cfg.llm_request_options())} runs={runs}")
    failures = 0
    for q in build_questions(snap):
        if only and q.qid not in only:
            continue
        print(f"\n=== {q.qid}: {q.text}")
        passed, times = 0, []
        for i in range(runs):
            r = ask(client, cfg, snap, q.text)
            problems = check(q, r)
            times.append(r.seconds)
            missing_optional = [x for x in q.optional if _fold(x) not in _fold(r.answer)]
            status = "PASS" if not problems else "FAIL"
            passed += not problems
            if problems or verbose:
                print(f"  [{i + 1}] {status} {r.seconds:.1f}s tools={r.tools_called} {problems}")
                print(f"      «{r.answer}»")
                if missing_optional:
                    print(f"      (optional not mentioned: {missing_optional})")
        failures += runs - passed
        times.sort()
        print(f"  {q.qid}: {passed}/{runs} passed · median {times[len(times) // 2]:.1f}s (text, no audio)")
    return 1 if failures else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="mode", required=True)
    for mode in ("tools", "llm"):
        p = sub.add_parser(mode)
        p.add_argument("--snapshot", type=Path, required=True, help="agent_snapshot.json from the dashboard")
        p.add_argument("--only", help="comma-separated question ids, e.g. Q1,Q3")
        if mode == "llm":
            p.add_argument("--runs", type=int, default=10)
            p.add_argument("--verbose", action="store_true", help="print every answer, not only failures")
    args = parser.parse_args(argv)

    try:
        snap = parse_snapshot(args.snapshot.read_bytes())
    except (OSError, SnapshotError) as e:
        print(f"Cannot use snapshot {args.snapshot}: {e}", file=sys.stderr)
        return 2
    only = {x.strip().upper() for x in args.only.split(",")} if args.only else None
    handlers: dict[str, Callable[[], int]] = {
        "tools": lambda: cmd_tools(snap, only),
        "llm": lambda: cmd_llm(snap, Config.from_env(), args.runs, only, args.verbose),
    }
    return handlers[args.mode]()


if __name__ == "__main__":
    sys.exit(main())
