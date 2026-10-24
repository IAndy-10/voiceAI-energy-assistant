"""One phone call: Twilio Media Stream → Pipecat (STT → LLM with tools → TTS) → Twilio.

    transport.input()  μ-law 8 kHz → PCM (TwilioFrameSerializer)
    → stt              Deepgram or Azure, Spanish
    → user aggregator  Silero VAD + turn detection close the user turn
    → llm              Claude with the six read-only tools over the pinned snapshot
    → tts              Azure es-CL or ElevenLabs, symbols rewritten as words
    → transport.output()  PCM → μ-law; "clear" to Twilio on barge-in
    → assistant aggregator  stores what was actually spoken
"""

import json
import time
from collections import deque
from dataclasses import dataclass

from fastapi import WebSocket
from loguru import logger
from pipecat.adapters.llm.schemas.function_schema import FunctionSchema
from pipecat.adapters.llm.schemas.tools_schema import ToolsSchema
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.frames.frames import EndFrame, TTSSpeakFrame
from pipecat.observers.user_bot_latency_observer import UserBotLatencyObserver
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineParams, PipelineWorker
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.serializers.twilio import TwilioFrameSerializer
from pipecat.services.anthropic.llm import AnthropicLLMService, AnthropicThinkingConfig
from pipecat.services.llm_service import FunctionCallParams
from pipecat.services.stt_service import STTService
from pipecat.services.tts_service import TTSService
from pipecat.transcriptions.language import Language
from pipecat.transports.websocket.fastapi import FastAPIWebsocketParams, FastAPIWebsocketTransport
from pipecat.utils.text.transforms import strip_markdown
from pipecat.workers.runner import WorkerRunner

from voice_server.config import Config
from voice_server.prompts import NO_SNAPSHOT_MESSAGE, greeting, system_prompt
from voice_server.snapshot import Snapshot
from voice_server.spoken import spoken_transform
from voice_server.tools import TOOL_SPECS, run_tool

TWILIO_SAMPLE_RATE = 8000
# Provider errors from recent calls, shown on GET /status. A provider that fails to
# connect (bad key, outage) blocks the pipeline start, so the caller only hears silence
RECENT_ERRORS: deque[dict[str, str]] = deque(maxlen=10)
# Pipecat sends this beta on every Anthropic request and overwrites `betas`,
# so the fallback beta goes in a header that keeps both
PIPECAT_ANTHROPIC_BETA = "interleaved-thinking-2025-05-14"


@dataclass(frozen=True)
class CallInfo:
    stream_sid: str
    call_sid: str


def build_tools(snap: Snapshot) -> ToolsSchema:
    """FunctionSchemas whose handlers read only this call's pinned snapshot."""

    async def handle(params: FunctionCallParams) -> None:
        result = run_tool(snap, params.function_name, dict(params.arguments or {}))
        summary = json.dumps(result, ensure_ascii=False)[:300]
        logger.debug(f"[Tools] {params.function_name}({params.arguments}) → {summary}")
        await params.result_callback(result)

    return ToolsSchema(standard_tools=[
        FunctionSchema(name=s["name"], description=s["description"], properties=s["properties"],
                       required=s["required"], handler=handle)
        for s in TOOL_SPECS
    ])


def make_llm(cfg: Config, snap: Snapshot) -> AnthropicLLMService:
    opts = cfg.llm_request_options()
    extra: dict = {}
    if "fallbacks" in opts:
        extra["fallbacks"] = opts["fallbacks"]
        extra["extra_headers"] = {"anthropic-beta": ",".join([PIPECAT_ANTHROPIC_BETA, *cfg.llm_betas()])}
    return AnthropicLLMService(
        api_key=cfg.anthropic_api_key,
        settings=AnthropicLLMService.Settings(
            model=cfg.llm_model,
            system_instruction=system_prompt(snap),
            max_tokens=cfg.llm_max_tokens,
            thinking=AnthropicThinkingConfig(type=opts["thinking"]["type"]),
            effort=opts["output_config"]["effort"],
            enable_prompt_caching=True,
            extra=extra,
        ),
    )


def make_stt(cfg: Config, snap: Snapshot) -> STTService:
    if cfg.stt_provider == "azure":
        from pipecat.services.azure.stt import AzureSTTService

        return AzureSTTService(api_key=cfg.azure_speech_key, region=cfg.azure_speech_region,
                               sample_rate=TWILIO_SAMPLE_RATE,
                               settings=AzureSTTService.Settings(language=Language.ES_CL))

    from pipecat.services.deepgram.stt import DeepgramSTTService

    settings = DeepgramSTTService.Settings(
        model=cfg.deepgram_model, language=Language.ES,
        smart_format=False, numerals=False, interim_results=True, punctuate=True,
    )
    if cfg.deepgram_keyterms:
        # Boost the store names; aliases and fuzzy matching in the tools cover the rest
        settings.keyterm = [s["name"] for s in snap["stores"]]
    return DeepgramSTTService(api_key=cfg.deepgram_api_key, sample_rate=TWILIO_SAMPLE_RATE, settings=settings)


def make_tts(cfg: Config) -> TTSService:
    transforms = [("*", strip_markdown), ("*", spoken_transform)]
    if cfg.tts_provider == "elevenlabs":
        from pipecat.services.elevenlabs.tts import ElevenLabsTTSService

        return ElevenLabsTTSService(
            api_key=cfg.elevenlabs_api_key, sample_rate=TWILIO_SAMPLE_RATE, text_transforms=transforms,
            settings=ElevenLabsTTSService.Settings(voice=cfg.elevenlabs_voice_id, model=cfg.elevenlabs_model,
                                                   language=Language.ES),
        )

    from pipecat.services.azure.tts import AzureTTSService

    return AzureTTSService(
        api_key=cfg.azure_speech_key, region=cfg.azure_speech_region, sample_rate=TWILIO_SAMPLE_RATE,
        text_transforms=transforms,
        settings=AzureTTSService.Settings(voice=cfg.azure_tts_voice, language=Language.ES_CL),
    )


def _transport(websocket: WebSocket, call: CallInfo, cfg: Config) -> FastAPIWebsocketTransport:
    serializer = TwilioFrameSerializer(
        stream_sid=call.stream_sid, call_sid=call.call_sid,
        account_sid=cfg.twilio_account_sid, auth_token=cfg.twilio_auth_token,
    )
    return FastAPIWebsocketTransport(websocket, FastAPIWebsocketParams(
        audio_in_enabled=True, audio_out_enabled=True, add_wav_header=False,
        serializer=serializer, session_timeout=cfg.max_call_secs,
    ))


async def _run(worker: PipelineWorker, call: CallInfo) -> None:
    @worker.event_handler("on_pipeline_error")
    async def _on_error(_w: PipelineWorker, frame) -> None:  # noqa: ANN001
        source = type(frame.processor).__name__ if getattr(frame, "processor", None) else "pipeline"
        RECENT_ERRORS.append({"at": time.strftime("%Y-%m-%d %H:%M:%S"), "call": call.call_sid,
                              "source": source, "error": str(frame.error)[:200]})

    # handle_sigint=False: uvicorn owns the signals; each call is its own runner
    runner = WorkerRunner(handle_sigint=False)
    await runner.add_workers(worker)
    await runner.run()


async def run_no_data_call(websocket: WebSocket, call: CallInfo, cfg: Config) -> None:
    """No snapshot synced yet: say so and hang up."""
    transport = _transport(websocket, call, cfg)
    pipeline = Pipeline([make_tts(cfg), transport.output()])
    worker = PipelineWorker(pipeline, enable_rtvi=False, params=PipelineParams(
        audio_in_sample_rate=TWILIO_SAMPLE_RATE, audio_out_sample_rate=TWILIO_SAMPLE_RATE))

    @transport.event_handler("on_client_connected")
    async def _on_connected(_t: FastAPIWebsocketTransport, _ws: WebSocket) -> None:
        await worker.queue_frames([TTSSpeakFrame(NO_SNAPSHOT_MESSAGE, append_to_context=False), EndFrame()])

    await _run(worker, call)


async def run_call(websocket: WebSocket, call: CallInfo, snap: Snapshot, cfg: Config) -> None:
    """Run the full pipeline for one call until the caller hangs up or the session times out."""
    transport = _transport(websocket, call, cfg)
    context = LLMContext(tools=build_tools(snap))
    aggregators = LLMContextAggregatorPair(
        context, user_params=LLMUserAggregatorParams(vad_analyzer=SileroVADAnalyzer()),
    )
    pipeline = Pipeline([
        transport.input(),
        make_stt(cfg, snap),
        aggregators.user(),
        make_llm(cfg, snap),
        make_tts(cfg),
        transport.output(),
        aggregators.assistant(),
    ])

    latency = UserBotLatencyObserver()

    @latency.event_handler("on_latency_breakdown")
    async def _on_breakdown(_o: UserBotLatencyObserver, breakdown) -> None:  # noqa: ANN001
        for line in breakdown.turn_contribution_lines():
            logger.info(f"[Latency] {call.call_sid} {line}")

    worker = PipelineWorker(
        pipeline,
        enable_rtvi=False,
        observers=[latency],
        params=PipelineParams(
            audio_in_sample_rate=TWILIO_SAMPLE_RATE, audio_out_sample_rate=TWILIO_SAMPLE_RATE,
            enable_metrics=True,
        ),
    )

    @transport.event_handler("on_client_connected")
    async def _on_connected(_t: FastAPIWebsocketTransport, _ws: WebSocket) -> None:
        logger.info(f"[Call] {call.call_sid} connected, snapshot {snap['generated_at']}")
        # Fixed text, straight to TTS: instant and always the same. Kept out of the
        # context (the system prompt says the greeting was given) so the first message is the user's
        await worker.queue_frames([TTSSpeakFrame(greeting(snap), append_to_context=False)])

    @transport.event_handler("on_client_disconnected")
    async def _on_disconnected(_t: FastAPIWebsocketTransport, _ws: WebSocket) -> None:
        logger.info(f"[Call] {call.call_sid} disconnected")
        await worker.cancel(reason="caller hung up")

    @transport.event_handler("on_session_timeout")
    async def _on_timeout(_t: FastAPIWebsocketTransport, _ws: WebSocket) -> None:
        logger.warning(f"[Call] {call.call_sid} reached MAX_CALL_SECS={cfg.max_call_secs}, ending")
        await worker.queue_frames([EndFrame()])

    await _run(worker, call)
