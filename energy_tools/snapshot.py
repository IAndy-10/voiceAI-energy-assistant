"""In-memory snapshot lifecycle and validation."""

from __future__ import annotations

from collections.abc import Mapping
import hashlib
import json
import os
import secrets

from pydantic import ValidationError

from .models import EnergySnapshot


class SnapshotRepository:
    """Stores one validated dashboard snapshot without writing client data to disk."""

    def __init__(self) -> None:
        self._snapshot: EnergySnapshot | None = None
        self._digest: str | None = None
        self._mode = "none"

    @staticmethod
    def canonical_digest(payload: Mapping[str, object]) -> str:
        """Digest canonical JSON, so browser formatting never affects approval."""
        canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    @staticmethod
    def _approved_demo(snapshot: EnergySnapshot, digest: str) -> bool:
        approved = os.getenv(
            "VESTA_DEMO_SNAPSHOT_SHA256",
            "4fb95b36721ba61d7f8221b2b686b9a8ea731267078025059eba78433aa06882",
        ).strip().lower()
        # Metadata is only a second check. The digest classifies the approved DEMO.
        return bool(approved) and secrets.compare_digest(digest, approved) and (
            snapshot.generator == "vesta-synthetic-demo-generator"
            and all(source.file.startswith("demo-") for source in snapshot.sources)
        )

    def replace(self, payload: Mapping[str, object]) -> EnergySnapshot:
        snapshot = EnergySnapshot.model_validate(payload)
        digest = self.canonical_digest(payload)
        self._snapshot = snapshot
        self._digest = digest
        self._mode = "demo" if self._approved_demo(snapshot, digest) else "unverified"
        return self._snapshot

    def get(self) -> EnergySnapshot | None:
        return self._snapshot

    def metadata(self) -> dict[str, object] | None:
        snapshot = self.get()
        if snapshot is None:
            return None
        return {
            "schema_version": snapshot.schema_version,
            "generated_at": snapshot.generated_at.isoformat(),
            "source_count": len(snapshot.sources),
            "years": snapshot.periods.years,
            "mode": self._mode,
            "demo_verified": self._mode == "demo",
            "snapshot_id": self._digest,
        }


__all__ = ["SnapshotRepository", "ValidationError"]
