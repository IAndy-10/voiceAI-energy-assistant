"""Offline validation for a locally exported dashboard snapshot.

Usage: python scripts/validate_real_snapshot.py C:\\Users\\...\\agent_snapshot.json
The script prints only counts and status; it never prints client figures.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from energy_tools.snapshot import SnapshotRepository
from energy_tools.tools import EnergyTools


def main(snapshot_path: str) -> int:
    payload = json.loads(Path(snapshot_path).read_text(encoding="utf-8"))
    repository = SnapshotRepository()
    snapshot = repository.replace(payload)
    tools = EnergyTools(repository)

    latest_year = snapshot.exec.year
    checks = [
        tools.get_overview(latest_year)["status"] == "ok",
        tools.get_store(snapshot.stores[0].name, latest_year)["status"] == "ok",
        tools.rank_stores("cost", "desc", 5)["status"] == "ok",
        tools.get_solar()["status"] == "ok" if snapshot.solar else True,
        tools.get_chiller()["status"] == "ok" if snapshot.chiller else True,
        tools.get_data_info()["status"] == "ok",
    ]

    overview = tools.get_overview(latest_year)["data"]
    expected = snapshot.exec.years[latest_year]
    checks.extend([
        overview["cost_cfv"]["display"] == expected.cost_cfv.display,
        overview["cost_sfv"]["display"] == expected.cost_sfv.display,
        overview["gd_discount"]["display"] == expected.gd_discount.display,
        overview["kwh"] == expected.kwh,
    ])
    if snapshot.exec.change:
        checks.extend([
            overview.get("change", {}).get("cost_pct") == snapshot.exec.change.get("cost_pct"),
            overview.get("change", {}).get("kwh_pct") == snapshot.exec.change.get("kwh_pct"),
            overview.get("change", {}).get("price_pct") == snapshot.exec.change.get("price_pct"),
        ])
    if str(latest_year) in snapshot.official_price_clp_kwh:
        checks.append(
            overview.get("official_price_clp_kwh", {}).get("value")
            == snapshot.official_price_clp_kwh[str(latest_year)]
        )
    if snapshot.exec.prev_year in snapshot.exec.years:
        previous = tools.get_overview(snapshot.exec.prev_year)["data"]
        expected_previous = snapshot.exec.years[snapshot.exec.prev_year]
        checks.extend([
            previous["cost_cfv"]["display"] == expected_previous.cost_cfv.display,
            previous["cost_sfv"]["display"] == expected_previous.cost_sfv.display,
            previous["gd_discount"]["display"] == expected_previous.gd_discount.display,
            previous["kwh"] == expected_previous.kwh,
        ])

    if not all(checks):
        print(f"FAILED: {sum(checks)}/{len(checks)} checks passed")
        return 1
    print(f"OK: snapshot schema 1.0 validated; 6 tools and {len(checks) - 6} dashboard-derived indicators verified")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/validate_real_snapshot.py PATH_TO_AGENT_SNAPSHOT")
    raise SystemExit(main(sys.argv[1]))
