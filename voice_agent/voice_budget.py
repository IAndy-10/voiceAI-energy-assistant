"""Conservative, persistent budget guard for the Pipecat voice pipeline.

The providers used by a cascaded voice pipeline do not report a single shared
price in real time.  A session therefore reserves its full configured maximum
up front and that reservation is charged on close, including failed sessions.
This deliberately over-estimates cost, but it makes the configured budget a
hard upper bound instead of a cosmetic indicator.
"""

from __future__ import annotations

import json
import threading
from pathlib import Path


class VoiceBudgetExceeded(Exception):
    """A session or turn was rejected before a provider request is made."""


class VoiceUsageLedger:
    """Persists only aggregate counters and USD reservations; never audio or text."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)
        self.lock = threading.Lock()

    @staticmethod
    def _defaults() -> dict[str, float | int]:
        return {"completed_sessions": 0, "pending_sessions": 0, "spent_usd": 0.0, "reserved_usd": 0.0}

    def _read(self) -> dict[str, float | int]:
        if not self.path.exists():
            return self._defaults()
        try:
            raw = json.loads(self.path.read_text(encoding="utf-8"))
            return {key: raw.get(key, value) for key, value in self._defaults().items()}
        except (OSError, TypeError, ValueError):
            return self._defaults()

    def _write(self, values: dict[str, float | int]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.path.with_suffix(".tmp")
        temporary.write_text(json.dumps(values, sort_keys=True), encoding="utf-8")
        temporary.replace(self.path)

    def reserve_session(self, amount_usd: float, budget_usd: float, max_sessions: int) -> None:
        if amount_usd <= 0 or budget_usd <= 0 or max_sessions <= 0:
            raise VoiceBudgetExceeded("La configuración de presupuesto de voz no es válida.")
        with self.lock:
            data = self._read()
            if int(data["completed_sessions"]) + int(data["pending_sessions"]) >= max_sessions:
                raise VoiceBudgetExceeded("Se alcanzó el límite local de sesiones de voz.")
            if float(data["spent_usd"]) + float(data["reserved_usd"]) + amount_usd > budget_usd:
                raise VoiceBudgetExceeded("Se alcanzó el presupuesto local de voz.")
            data["pending_sessions"] = int(data["pending_sessions"]) + 1
            data["reserved_usd"] = round(float(data["reserved_usd"]) + amount_usd, 8)
            self._write(data)

    def settle_session(self, reserved_usd: float) -> None:
        """Charge the full reservation: a failed request may still be billable."""
        with self.lock:
            data = self._read()
            data["pending_sessions"] = max(0, int(data["pending_sessions"]) - 1)
            data["reserved_usd"] = round(max(0.0, float(data["reserved_usd"]) - reserved_usd), 8)
            data["spent_usd"] = round(float(data["spent_usd"]) + reserved_usd, 8)
            data["completed_sessions"] = int(data["completed_sessions"]) + 1
            self._write(data)

    def status(self, budget_usd: float) -> dict[str, float | int]:
        with self.lock:
            data = self._read()
        committed = float(data["spent_usd"]) + float(data["reserved_usd"])
        return {**data, "budget_usd": budget_usd, "remaining_usd": round(max(0.0, budget_usd - committed), 8)}
