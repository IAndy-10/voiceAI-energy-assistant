"""Storage and validation for ``agent_snapshot.json``, produced by dashboard.html.

The snapshot is the only data the voice agent can see. It is validated on
upload (schema version plus the sections the tools read), written atomically
to the volume, and kept in memory. Each call pins the snapshot that was
current when it started, so a sync mid-call never changes its numbers.
"""

import json
import os
import tempfile
from pathlib import Path
from typing import Any

from loguru import logger

# Must match SNAPSHOT_SCHEMA_VERSION in dashboard/dashboard.html
SUPPORTED_SCHEMA_VERSION = "1.0"
MAX_SNAPSHOT_BYTES = 2_000_000

Snapshot = dict[str, Any]


class SnapshotError(ValueError):
    """The uploaded snapshot can't be used by the agent."""


def _require(data: Any, path: str, kind: type | tuple[type, ...]) -> Any:
    cur = data
    for key in path.split("."):
        if not isinstance(cur, dict) or key not in cur:
            raise SnapshotError(f"Missing field '{path}' in snapshot.")
        cur = cur[key]
    if not isinstance(cur, kind):
        raise SnapshotError(f"Field '{path}' has the wrong type ({type(cur).__name__}).")
    return cur


def validate_snapshot(data: Any) -> Snapshot:
    """Check the schema version and the fields the tools rely on."""
    if not isinstance(data, dict):
        raise SnapshotError("Snapshot must be a JSON object.")
    version = data.get("schema_version")
    if version != SUPPORTED_SCHEMA_VERSION:
        raise SnapshotError(
            f"Unsupported schema_version '{version}'. Expected '{SUPPORTED_SCHEMA_VERSION}'. "
            "Update the voice server or the dashboard so both use the same version."
        )
    _require(data, "generated_at", str)
    _require(data, "generated_local.time", str)
    _require(data, "generated_local.date", str)
    _require(data, "sources", list)
    _require(data, "official_price_clp_kwh", dict)
    _require(data, "periods.last_complete_year", int)
    _require(data, "periods.complete_years", list)
    _require(data, "exec.cost_cfv.say", str)
    _require(data, "exec.years", dict)
    _require(data, "exec.kpi_cards", list)
    stores = _require(data, "stores", list)
    _require(data, "rankings.cost_cfv_desc", list)
    _require(data, "known_gaps", list)
    for i, store in enumerate(stores):
        if not isinstance(store, dict) or not isinstance(store.get("name"), str):
            raise SnapshotError(f"stores[{i}] has no name.")
    # Optional sections are null when their file wasn't loaded; when present they must be objects
    for section in ("solar", "chiller", "equipment", "indicators"):
        if data.get(section) is not None and not isinstance(data[section], dict):
            raise SnapshotError(f"Section '{section}' must be an object or null.")
    return data


def parse_snapshot(raw: bytes) -> Snapshot:
    """Decode and validate an uploaded snapshot body."""
    if len(raw) > MAX_SNAPSHOT_BYTES:
        raise SnapshotError(f"Snapshot is larger than {MAX_SNAPSHOT_BYTES} bytes.")
    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        raise SnapshotError(f"Snapshot is not valid JSON: {e}") from e
    return validate_snapshot(data)


class SnapshotStore:
    """Holds the current snapshot in memory and on the volume."""

    def __init__(self, path: Path):
        self.path = path
        self.current: Snapshot | None = None

    def load(self) -> None:
        """Load the last saved snapshot at startup, if there is a valid one."""
        if not self.path.exists():
            logger.info(f"[Snapshot] none saved yet at {self.path}")
            return
        try:
            self.current = parse_snapshot(self.path.read_bytes())
        except (OSError, SnapshotError) as e:
            # Keep serving (status shows no snapshot) so the dashboard can re-sync
            logger.error(f"[Snapshot] saved file {self.path} is unusable, ignoring it: {e}")
            return
        logger.info(f"[Snapshot] loaded {self.path} generated_at={self.current['generated_at']}")

    def save(self, snapshot: Snapshot) -> None:
        """Write atomically (temp file + rename), then swap the in-memory copy."""
        self.path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp = tempfile.mkstemp(dir=self.path.parent, prefix=".snapshot-", suffix=".json")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                json.dump(snapshot, f, ensure_ascii=False)
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp, self.path)
        except OSError:
            Path(tmp).unlink(missing_ok=True)
            raise
        self.current = snapshot
        logger.info(f"[Snapshot] saved generated_at={snapshot['generated_at']}")
