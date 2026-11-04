import importlib.util
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "voice_latency.py"
spec = importlib.util.spec_from_file_location("voice_latency", SCRIPT)
voice_latency = importlib.util.module_from_spec(spec)
spec.loader.exec_module(voice_latency)


def test_latency_summary_groups_ttfb_by_service_and_ignores_other_lines():
    lines = [
        "voice-agent  | 2026-11-04 01:48:02.366 | DEBUG | ...:stop_ttfb_metrics:175 - OpenAILLMService#0 TTFB: 1.574s",
        "voice-agent  | ... - OpenAILLMService#0 processing time: 1.779s",
        "voice-agent  | ... - ElevenLabsTTSService#0 TTFB: 0.250s",
        "voice-agent  | ... - ElevenLabsTTSService#1 TTFB: 0.350s",
        "voice-agent  | ... - user said: TTFB: 9.9s",
    ]
    samples = voice_latency.collect(lines)
    assert samples == {"OpenAILLMService": [1.574], "ElevenLabsTTSService": [0.25, 0.35]}
    table = voice_latency.summarise(samples)
    assert "ElevenLabsTTSService" in table and "0.300s" in table
    assert "Sin métricas" in voice_latency.summarise({})
