"""Import-only smoke test: never creates clients or contacts providers."""

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.services.openai.llm import OpenAILLMService
from pipecat.services.openai.stt import OpenAISTTService
from pipecat.services.openai.tts import OpenAITTSService
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport


def main() -> None:
    assert all((SmallWebRTCTransport, OpenAISTTService, OpenAITTSService, OpenAILLMService, SileroVADAnalyzer))
    # Imports the runner modules too, so a broken pipeline fails the image build.
    from voice_agent.webrtc_turn_runner import bot

    assert bot
    print("Pipecat import smoke test passed")


if __name__ == "__main__":
    main()
