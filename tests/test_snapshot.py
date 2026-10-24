import json

import pytest

from voice_server.snapshot import (
    MAX_SNAPSHOT_BYTES,
    SnapshotError,
    SnapshotStore,
    parse_snapshot,
    validate_snapshot,
)


def test_valid_snapshot_passes(snap):
    assert validate_snapshot(snap) is snap


@pytest.mark.parametrize("version", ["0.9", "2.0", None, 1.0])
def test_unknown_schema_version_rejected(snap, version):
    snap["schema_version"] = version
    with pytest.raises(SnapshotError, match="Unsupported schema_version"):
        validate_snapshot(snap)


@pytest.mark.parametrize("path", ["generated_local", "exec", "stores", "rankings", "known_gaps", "periods"])
def test_missing_required_section_rejected(snap, path):
    del snap[path]
    with pytest.raises(SnapshotError, match="Missing field"):
        validate_snapshot(snap)


def test_optional_section_must_be_object_or_null(snap):
    snap["solar"] = None
    validate_snapshot(snap)
    snap["solar"] = ["not", "an", "object"]
    with pytest.raises(SnapshotError, match="solar"):
        validate_snapshot(snap)


def test_parse_rejects_bad_json_and_oversize():
    with pytest.raises(SnapshotError, match="not valid JSON"):
        parse_snapshot(b"{nope")
    with pytest.raises(SnapshotError, match="larger than"):
        parse_snapshot(b" " * (MAX_SNAPSHOT_BYTES + 1))


def test_store_save_and_reload(tmp_path, snap):
    path = tmp_path / "vol" / "agent_snapshot.json"
    store = SnapshotStore(path)
    store.save(snap)
    assert store.current is snap
    assert json.loads(path.read_text())["generated_at"] == snap["generated_at"]
    assert not list(path.parent.glob(".snapshot-*"))  # temp file renamed away

    reloaded = SnapshotStore(path)
    reloaded.load()
    assert reloaded.current["generated_local"]["time"] == "09:15"


def test_store_ignores_corrupt_file(tmp_path):
    path = tmp_path / "agent_snapshot.json"
    path.write_text('{"schema_version": "9.9"}')
    store = SnapshotStore(path)
    store.load()
    assert store.current is None
