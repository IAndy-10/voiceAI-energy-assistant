import { PipecatClient } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";

// Exported only for the future authenticated signaling endpoint.
export function createVestaVoiceClient(callbacks = {}) {
  return new PipecatClient({ transport: new SmallWebRTCTransport(), enableMic: true, callbacks });
}
