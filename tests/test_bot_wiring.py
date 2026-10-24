"""Checks the Pipecat side without network: what the LLM service would send to Anthropic,
how tool calls reach the snapshot, and that every service builds for both provider choices."""

import asyncio
import json
from types import SimpleNamespace

import pytest
from pipecat.frames.frames import EndFrame, LLMContextFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineWorker
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.workers.runner import WorkerRunner

from voice_server import bot
from voice_server.config import Config

CFG = Config(anthropic_api_key="sk-test", deepgram_api_key="dg", azure_speech_key="az",
             elevenlabs_api_key="el", elevenlabs_voice_id="voice", twilio_account_sid="AC1",
             twilio_auth_token="tok")


def _captured_request(cfg: Config, snap) -> dict:
    """Run the real AnthropicLLMService once and capture the request parameters it builds."""
    llm = bot.make_llm(cfg, snap)
    captured: dict = {}

    async def fake_stream(_api_call, params):
        captured.update(params)

        async def empty():
            return
            yield  # pragma: no cover

        return empty()

    llm._create_message_stream = fake_stream
    context = LLMContext(messages=[{"role": "user", "content": "¿Cuánto pagamos?"}], tools=bot.build_tools(snap))

    async def go():
        worker = PipelineWorker(Pipeline([llm]), enable_rtvi=False, idle_timeout_secs=None)
        await worker.queue_frames([LLMContextFrame(context), EndFrame()])
        runner = WorkerRunner(handle_sigint=False)
        await runner.add_workers(worker)
        await asyncio.wait_for(runner.run(), timeout=20)

    asyncio.run(go())
    return captured


def test_llm_request_settings(snap):
    params = _captured_request(CFG, snap)
    assert params["model"] == "claude-sonnet-5-5"
    assert params["thinking"] == {"type": "adaptive"}
    assert params["output_config"] == {"effort": "low"}
    assert params["fallbacks"] == "default"
    assert "server-side-fallback-2026-07-01" in params["extra_headers"]["anthropic-beta"]
    assert "interleaved-thinking-2025-05-14" in params["extra_headers"]["anthropic-beta"]
    # Sampling params return a 400 on current models: never sent
    body = json.dumps(params, default=str)
    for banned in ("temperature", "top_p", "top_k"):
        assert banned not in body
    assert {t["name"] for t in params["tools"]} == {
        "get_overview", "get_store", "rank_stores", "get_solar", "get_chiller", "get_data_info"}
    system = json.dumps(params["system"], ensure_ascii=False)
    assert "09:15" in system and "say" in system


def test_llm_between_tools_and_no_fallback(snap):
    cfg = Config(**{**CFG.__dict__, "llm_thinking": "between_tools", "llm_server_fallback": False})
    params = _captured_request(cfg, snap)
    assert params["thinking"] == {"type": "between_tools"}
    assert "fallbacks" not in params


def test_tool_handler_reads_pinned_snapshot(snap):
    tools = bot.build_tools(snap)
    handler = tools.standard_tools[0].handler
    results = []

    async def cb(result, **_kw):
        results.append(result)

    params = SimpleNamespace(function_name="get_store", arguments={"name": "Kurepto"}, result_callback=cb)
    asyncio.run(handler(params))
    assert results[0]["store"] == "Curepto"


@pytest.mark.parametrize(("stt", "tts"), [("deepgram", "azure"), ("deepgram", "elevenlabs"), ("azure", "azure")])
def test_services_build_for_every_provider_combination(snap, stt, tts):
    cfg = Config(**{**CFG.__dict__, "stt_provider": stt, "tts_provider": tts, "deepgram_keyterms": True})
    assert bot.make_stt(cfg, snap).sample_rate in (0, bot.TWILIO_SAMPLE_RATE)
    assert bot.make_tts(cfg) is not None
