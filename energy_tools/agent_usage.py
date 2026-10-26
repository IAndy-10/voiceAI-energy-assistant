"""Small, lock-protected, non-sensitive usage ledger for the local demo."""

from __future__ import annotations

import json
import threading
from pathlib import Path


class BudgetExceeded(Exception):
    pass


class UsageLedger:
    """Persists counts and USD aggregates only; never questions, answers, keys or tool data."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)
        self.lock = threading.Lock()

    def _read(self) -> dict[str, float | int]:
        if not self.path.exists():
            return {"completed_queries": 0, "pending_queries": 0, "spent_usd": 0.0, "reserved_usd": 0.0,
                    "input_tokens": 0, "output_tokens": 0}
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
            return {key: data.get(key, default) for key, default in {
                "completed_queries": 0, "pending_queries": 0, "spent_usd": 0.0, "reserved_usd": 0.0,
                "input_tokens": 0, "output_tokens": 0}.items()}
        except (OSError, ValueError, TypeError):
            # A damaged local counter must not reveal or recover any request content.
            return {"completed_queries": 0, "pending_queries": 0, "spent_usd": 0.0, "reserved_usd": 0.0,
                    "input_tokens": 0, "output_tokens": 0}

    def _write(self, data: dict[str, float | int]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.path.with_suffix(".tmp")
        temporary.write_text(json.dumps(data, sort_keys=True), encoding="utf-8")
        temporary.replace(self.path)

    def reserve(self, amount_usd: float, budget_usd: float, max_queries: int) -> None:
        with self.lock:
            data = self._read()
            if int(data["completed_queries"]) + int(data["pending_queries"]) >= max_queries:
                raise BudgetExceeded("Se alcanzó el límite local de consultas.")
            if float(data["spent_usd"]) + float(data["reserved_usd"]) + amount_usd > budget_usd:
                raise BudgetExceeded("Se alcanzó el presupuesto local reservado.")
            data["pending_queries"] = int(data["pending_queries"]) + 1
            data["reserved_usd"] = round(float(data["reserved_usd"]) + amount_usd, 8)
            self._write(data)

    def settle(self, reserved_usd: float, actual_usd: float, input_tokens: int, output_tokens: int, completed: bool) -> None:
        with self.lock:
            data = self._read()
            data["pending_queries"] = max(0, int(data["pending_queries"]) - 1)
            data["reserved_usd"] = round(max(0.0, float(data["reserved_usd"]) - reserved_usd), 8)
            # A provider failure can happen after one or more billable responses.
            # Preserve their aggregate usage while counting only successful chats.
            data["spent_usd"] = round(float(data["spent_usd"]) + actual_usd, 8)
            data["input_tokens"] = int(data["input_tokens"]) + input_tokens
            data["output_tokens"] = int(data["output_tokens"]) + output_tokens
            if completed:
                data["completed_queries"] = int(data["completed_queries"]) + 1
            self._write(data)

    def status(self, budget_usd: float) -> dict[str, float | int]:
        with self.lock:
            data = self._read()
        committed = float(data["spent_usd"]) + float(data["reserved_usd"])
        return {**data, "budget_usd": budget_usd, "remaining_usd": round(max(0.0, budget_usd - committed), 8)}
