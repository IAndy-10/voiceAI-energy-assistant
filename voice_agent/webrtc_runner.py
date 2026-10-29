"""SmallWebRTC runner with an opt-in, budget-guarded voice pipeline."""
from __future__ import annotations

from loguru import logger
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineParams, PipelineWorker, ProcessorUnusablePolicy
from pipecat.runner.types import RunnerArguments
from pipecat.transports.base_transport import BaseTransport, TransportParams
from pipecat.transports.smallwebrtc.connection import SmallWebRTCConnection
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport
from pipecat.workers.runner import WorkerRunner

from voice_agent.energy_api import EnergyAPISettings, VoiceEnergyAdapter
from voice_agent.voice_budget import VoiceBudgetExceeded, VoiceUsageLedger
from voice_agent.voice_pipeline import VoicePipelineSettings, VoiceSession, build_pipeline


async def run_bot(transport: BaseTransport, runner_args: RunnerArguments) -> None:
    settings = VoicePipelineSettings.from_env()
    ledger = VoiceUsageLedger(settings.usage_file)
    reserved = False
    settled = False

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
            pipeline = build_pipeline(transport, session, settings)
        except VoiceBudgetExceeded as exc:
            logger.warning("voice_pipeline_not_started reason=budget_or_configuration")
            pipeline = Pipeline([transport.input(), transport.output()])
    else:
        pipeline = Pipeline([transport.input(), transport.output()])

    worker = PipelineWorker(pipeline, params=PipelineParams(), processor_unusable_policy=ProcessorUnusablePolicy.END,
                            idle_timeout_secs=settings.idle_timeout_seconds)
    runner = WorkerRunner(handle_sigint=runner_args.handle_sigint)
    await runner.add_workers(worker)

    @transport.event_handler("on_client_connected")
    async def on_client_connected(_transport, _client):
        logger.info("SmallWebRTC client connected")

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(_transport, _client):
        logger.info("SmallWebRTC client disconnected")
        settle_budget()
        await runner.cancel()

    try:
        await runner.run()
    finally:
        settle_budget()


async def bot(runner_args: RunnerArguments) -> None:
    connection: SmallWebRTCConnection = runner_args.webrtc_connection
    transport = SmallWebRTCTransport(connection, TransportParams(audio_in_enabled=True, audio_out_enabled=True))
    await run_bot(transport, runner_args)


if __name__ == "__main__":
    from pipecat.runner.run import main
    main()
