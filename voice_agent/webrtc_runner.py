"""SmallWebRTC runner with an opt-in, budget-guarded voice pipeline.

The session lifecycle follows ``reference/server/bot.py``: greet on connect,
end after an idle period or a total duration, and end when a provider service
becomes unusable (for example a rejected API key).
"""
from __future__ import annotations

import asyncio

from loguru import logger
from pipecat.frames.frames import LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineParams, PipelineWorker, ProcessorUnusablePolicy
from pipecat.runner.types import RunnerArguments
from pipecat.transports.base_transport import BaseTransport, TransportParams
from pipecat.transports.smallwebrtc.connection import SmallWebRTCConnection
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport
from pipecat.workers.runner import WorkerRunner

from voice_agent.energy_api import EnergyAPISettings, VoiceEnergyAdapter
from voice_agent.voice_budget import VoiceBudgetExceeded, VoiceUsageLedger
from voice_agent.voice_pipeline import GREETING, VoicePipelineSettings, VoiceSession, build_pipeline, create_context


async def run_bot(transport: BaseTransport, runner_args: RunnerArguments) -> None:
    settings = VoicePipelineSettings.from_env()
    ledger = VoiceUsageLedger(settings.usage_file)
    reserved = False
    settled = False
    context = None

    def settle_budget() -> None:
        nonlocal settled
        if reserved and not settled:
            ledger.settle_session(settings.session_budget_usd)
            settled = True

    # Services are not constructed until the client connects and the persistent
    # reservation succeeds. Default mode retains the zero-provider test pipeline.
    if settings.enabled:
        try:
            settings.validate_for_real_use()
            ledger.reserve_session(settings.session_budget_usd, settings.budget_usd, settings.max_sessions)
            reserved = True
            session = VoiceSession(VoiceEnergyAdapter(EnergyAPISettings.from_env()), settings.max_turns)
            context = create_context()
            pipeline = build_pipeline(transport, session, settings, context=context)
            logger.info(f"voice_pipeline_started stt={settings.stt_model} llm={settings.llm_model} tts={settings.tts_model}")
        except VoiceBudgetExceeded:
            logger.warning("voice_pipeline_not_started reason=budget_or_configuration")
            pipeline = Pipeline([transport.input(), transport.output()])
    else:
        pipeline = Pipeline([transport.input(), transport.output()])

    worker = PipelineWorker(pipeline, params=PipelineParams(enable_metrics=True, enable_usage_metrics=True),
                            processor_unusable_policy=ProcessorUnusablePolicy.END,
                            idle_timeout_secs=settings.idle_timeout_seconds)
    runner = WorkerRunner(handle_sigint=runner_args.handle_sigint)
    await runner.add_workers(worker)

    async def end_after_max_duration() -> None:
        await asyncio.sleep(settings.session_max_seconds)
        logger.info(f"voice_session_max_duration_reached seconds={settings.session_max_seconds}")
        await worker.stop_when_done()

    @transport.event_handler("on_client_connected")
    async def on_client_connected(_transport, _client):
        logger.info("SmallWebRTC client connected")
        if context is not None:
            context.add_message({"role": "user", "content": GREETING})
            await worker.queue_frames([LLMRunFrame()])

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(_transport, _client):
        logger.info("SmallWebRTC client disconnected")
        settle_budget()
        await runner.cancel()

    max_duration = asyncio.create_task(end_after_max_duration())
    try:
        await runner.run()
    finally:
        max_duration.cancel()
        settle_budget()


async def bot(runner_args: RunnerArguments) -> None:
    connection: SmallWebRTCConnection = runner_args.webrtc_connection
    transport = SmallWebRTCTransport(connection, TransportParams(audio_in_enabled=True, audio_out_enabled=True))
    await run_bot(transport, runner_args)


if __name__ == "__main__":
    from pipecat.runner.run import main
    main()
