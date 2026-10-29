from __future__ import annotations

import asyncio

import pytest
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor

from voice_agent.voice_budget import VoiceBudgetExceeded, VoiceUsageLedger
from voice_agent.voice_pipeline import (
    VoicePipelineSettings,
    VoiceServices,
    VoiceSession,
    build_pipeline,
    energy_tool_schemas,
    validate_tool_arguments,
)


class StubProcessor(FrameProcessor):
    async def process_frame(self, frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
        await self.push_frame(frame, direction)


class StubLLM(StubProcessor):
    def __init__(self):
        super().__init__()
        self.registrations = []

    def register_function(self, name, handler, **kwargs):
        self.registrations.append((name, handler, kwargs))


class StubTransport:
    def __init__(self):
        self.input_processor = StubProcessor()
        self.output_processor = StubProcessor()

    def input(self):
        return self.input_processor

    def output(self):
        return self.output_processor


class StubAdapter:
    def __init__(self):
        self.calls = []

    def call(self, name, **arguments):
        self.calls.append((name, arguments))
        return {"status": "ok", "data": {"safe": True}, "period": 2025, "unit": "CLP", "source": [], "warnings": []}


class StubCall:
    def __init__(self, name, arguments):
        self.function_name = name
        self.arguments = arguments
        self.results = []

    async def result_callback(self, value, **_kwargs):
        self.results.append(value)


def voice_settings() -> VoicePipelineSettings:
    return VoicePipelineSettings(True, "not-a-real-key", "gpt-transcribe", "gpt-6-luna", "gpt-4o-mini-tts", "alloy", 3, 2, 45, 0.2, 2, 10, "ignored.json")


def test_pipeline_registers_exactly_the_six_authorized_tools_without_provider_requests():
    transport, llm = StubTransport(), StubLLM()
    pipeline = build_pipeline(transport, VoiceSession(StubAdapter(), 3), voice_settings(), VoiceServices(StubProcessor(), llm, StubProcessor()))
    assert pipeline is not None
    assert [name for name, _, _ in llm.registrations] == [
        "get_overview", "get_store", "rank_stores", "get_solar", "get_chiller", "get_data_info",
    ]
    assert all(item[2]["timeout_secs"] == 2 for item in llm.registrations)


def test_tool_schemas_and_argument_validation_follow_public_energy_contracts():
    assert [schema.name for schema in energy_tool_schemas().standard_tools] == [
        "get_overview", "get_store", "rank_stores", "get_solar", "get_chiller", "get_data_info",
    ]
    assert validate_tool_arguments("get_overview", {"year": 2025}) == {"year": 2025}
    assert validate_tool_arguments("rank_stores", {"metric": "cost", "order": "asc", "top_n": 3})["order"] == "asc"
    with pytest.raises(ValueError):
        validate_tool_arguments("get_store", {"name": "Centro"})
    with pytest.raises(ValueError):
        validate_tool_arguments("rank_stores", {"metric": "unknown", "order": "desc", "top_n": 3})


def test_tool_handler_uses_adapter_and_returns_safe_invalid_argument_result():
    adapter = StubAdapter()
    session = VoiceSession(adapter, 2)
    call = StubCall("get_overview", {"year": 2025})
    asyncio.run(session.handle_tool_call(call))
    assert adapter.calls == [("get_overview", {"year": 2025})]
    assert call.results[0]["status"] == "ok"
    invalid = StubCall("get_overview", {"year": "not-a-year"})
    asyncio.run(session.handle_tool_call(invalid))
    assert invalid.results == [{"status": "invalid_request", "warnings": ["Argumentos de herramienta inválidos."]}]


def test_session_turn_limit_blocks_additional_tool_calls_before_adapter():
    adapter = StubAdapter()
    session = VoiceSession(adapter, 1)
    asyncio.run(session.handle_tool_call(StubCall("get_data_info", {})))
    limited = StubCall("get_data_info", {})
    asyncio.run(session.handle_tool_call(limited))
    assert len(adapter.calls) == 1
    assert limited.results[0]["status"] == "limit_reached"


def test_conservative_voice_ledger_persists_reservation_and_charges_failed_session(tmp_path):
    ledger = VoiceUsageLedger(tmp_path / "voice-usage.json")
    ledger.reserve_session(0.2, 0.4, 2)
    assert ledger.status(0.4)["reserved_usd"] == 0.2
    ledger.settle_session(0.2)
    restarted = VoiceUsageLedger(tmp_path / "voice-usage.json")
    assert restarted.status(0.4)["spent_usd"] == 0.2
    restarted.reserve_session(0.2, 0.4, 2)
    with pytest.raises(VoiceBudgetExceeded):
        restarted.reserve_session(0.2, 0.4, 2)


def test_voice_pipeline_requires_opt_in_key_and_valid_reservation(monkeypatch):
    monkeypatch.setenv("VOICE_PIPELINE_ENABLED", "false")
    with pytest.raises(VoiceBudgetExceeded):
        VoicePipelineSettings.from_env().validate_for_real_use()
    monkeypatch.setenv("VOICE_PIPELINE_ENABLED", "true")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    with pytest.raises(VoiceBudgetExceeded):
        VoicePipelineSettings.from_env().validate_for_real_use()
