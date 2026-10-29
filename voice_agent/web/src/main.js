import { PipecatClient } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";

// SmallWebRTC delivers the bot's audio as a track but never plays it, so the
// client attaches it to its own <audio> element.
function botAudioPlayer() {
  const audio = new Audio();
  audio.autoplay = true;
  return {
    play(track) {
      audio.srcObject = new MediaStream([track]);
      audio.play().catch(() => {});
    },
    stop() {
      audio.srcObject = null;
    },
  };
}

// Exported only for the future authenticated signaling endpoint.
export function createVestaVoiceClient(callbacks = {}) {
  const player = botAudioPlayer();
  return new PipecatClient({
    transport: new SmallWebRTCTransport(),
    enableMic: true,
    callbacks: {
      ...callbacks,
      onTrackStarted: (track, participant) => {
        if (track.kind === "audio" && !participant?.local) player.play(track);
        callbacks.onTrackStarted?.(track, participant);
      },
      onDisconnected: () => {
        player.stop();
        callbacks.onDisconnected?.();
      },
    },
  });
}
