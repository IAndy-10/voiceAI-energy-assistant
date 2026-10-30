"""Runner-side validation of an opaque, API-issued voice session grant."""
from __future__ import annotations

import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from voice_agent.energy_api import EnergyAPISettings


def validate_voice_session(token: object, mode: object, settings: EnergyAPISettings | None = None) -> str | None:
    if not isinstance(token, str) or not isinstance(mode, str):
        return None
    api = settings or EnergyAPISettings.from_env()
    if not api.token:
        return None
    request = Request(
        f"{api.base_url}/voice/sessions/validate",
        data=json.dumps({"session_token": token, "mode": mode}).encode("utf-8"),
        headers={"Authorization": f"Bearer {api.token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=api.timeout_seconds) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, OSError, ValueError, UnicodeDecodeError):
        return None
    accepted_mode = payload.get("mode") if isinstance(payload, dict) else None
    return accepted_mode if accepted_mode in {"minimal", "ai"} else None
