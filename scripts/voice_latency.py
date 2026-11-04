"""Summarise Pipecat TTFB metrics from voice-agent logs, per service.

The runner enables Pipecat metrics, which log one DEBUG line per measurement:
``OpenAITTSService#0 TTFB: 0.950s``.  This reads those lines and prints the count,
median, p90 and range for each service, so TTS providers can be compared.

    docker compose logs --since 30m voice-agent | python scripts/voice_latency.py

Only service names and timings are read; transcripts and other lines are ignored.
"""
from __future__ import annotations

import re
import statistics
import sys
from collections import defaultdict
from typing import Iterable

TTFB_LINE = re.compile(r"\b([A-Za-z]+Service)#\d+ TTFB: ([0-9.]+)s\b")


def collect(lines: Iterable[str]) -> dict[str, list[float]]:
    samples: dict[str, list[float]] = defaultdict(list)
    for line in lines:
        match = TTFB_LINE.search(line)
        if match:
            samples[match.group(1)].append(float(match.group(2)))
    return dict(samples)


def p90(values: list[float]) -> float:
    ordered = sorted(values)
    return ordered[min(len(ordered) - 1, round(0.9 * (len(ordered) - 1)))]


def summarise(samples: dict[str, list[float]]) -> str:
    if not samples:
        return "Sin métricas TTFB en la entrada (¿hubo una sesión de voz con IA en ese período?)."
    rows = [f"{'Servicio':<28}{'n':>4}{'mediana':>10}{'p90':>8}{'mín':>8}{'máx':>8}"]
    for service in sorted(samples):
        values = samples[service]
        rows.append(f"{service:<28}{len(values):>4}{statistics.median(values):>9.3f}s"
                    f"{p90(values):>7.3f}s{min(values):>7.3f}s{max(values):>7.3f}s")
    return "\n".join(rows)


if __name__ == "__main__":
    print(summarise(collect(sys.stdin)))
