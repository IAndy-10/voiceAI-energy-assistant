# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vesta 2.0: an energy-intelligence demo for Multicentro (a Chilean retail chain). It adds a read-only FastAPI "Energy Tools" API, an optional OpenAI agent and a Pipecat voice agent on top of the browser dashboard. Docs in `docs/`, UI strings, prompts and tool warnings are in Spanish (es-CL); keep new user-facing text in Spanish. `README.md` is in English; quote UI labels in it as they appear on screen.

The parent directory (`../`) holds the original dashboard project with its own CLAUDE.md. `dashboard/dashboard.html` here is a **diverged copy**: it adds `buildSnapshot()`, monthly totals in the snapshot (`by_month`) and the 💬 assistant panel (chat and 🎙 voice), which sends the snapshot to the API when served from `/app`. It has no snapshot download or standalone sync button any more. Don't overwrite one with the other. It uses CRLF line endings; keep them when editing it with scripts.

## Data flow and the core invariant

```
private .xlsx → dashboard/dashboard.html (/app) → snapshot JSON (schema 1.0)
                                              ↓  POST /snapshot from the 💬 panel (Bearer token)
                      energy_tools (FastAPI, in-memory SnapshotRepository)
                        ├─ /energy/* deterministic tools (EnergyTools)
                        ├─ /agent/local-chat  (regex interpreter, no provider)
                        └─ /agent/chat        (OpenAI Responses API, opt-in)
                                              ↑  authenticated HTTP GET
                      voice_agent (Pipecat SmallWebRTC, separate container)
```

**The dashboard is the only authority for calculations.** The backend never reads Excel, never recomputes KPIs and never derives indicators. It only returns fields that are already in the snapshot. `rank_stores` follows the precomputed `rankings` arrays instead of sorting. If a figure is missing, add it to the dashboard's `snapshot*()` functions (`buildSnapshot()` reuses the same `compute*()` functions as the screen), then to `energy_tools/models.py`. Never compute it in Python. See `docs/INTEGRATION-CONTRACT.md`.

## Architecture

- **`energy_contracts/`**: the single definition of the eight tools (name, description, strict Pydantic argument models, `parameters_schema()`, `validate_arguments()`). It depends only on Pydantic and is copied into both images. Add or change a tool here, not in the agents.
- **`energy_tools/`**: the API container (Python 3.11).
  - `models.py`: Pydantic schema for the snapshot. It tolerates extra keys and rejects a `schema_version` other than `1.0`, incoherent years, months outside 1–12, and a year marked both complete and partial.
  - `snapshot.py`: `SnapshotRepository` holds a single snapshot **in memory only**, so it is lost on restart. It classifies the snapshot as `demo` only when the canonical-JSON SHA-256 matches `VESTA_DEMO_SNAPSHOT_SHA256` and the metadata looks synthetic. Otherwise the mode is `unverified`.
  - `tools.py`: `EnergyTools`, the eight tools `get_overview` (a year, or one month with `month`), `get_store`, `rank_stores`, `get_solar`, `get_chiller`, `get_equipment`, `get_indicators` and `get_data_info`. Every result has the shape `{status, data, period, unit, source, warnings}`. A year in `partial_years` must always add a warning.
  - `agent.py`, `agent_models.py`, `agent_usage.py`: the OpenAI agent. `energy_contracts` allowlists the tools and validates their arguments, rounds and tool calls are capped, and a persistent `UsageLedger` reserves the budget before each call.
  - `local_agent.py`: a keyword-matching assistant with no provider calls.
  - `voice.py` and `api.py`: the `/voice/config` endpoint, which serves the browser voice client bundle, the `/demo` page (`demo.html`), and `/app`, which serves the dashboard from the API origin. There the "💬 Asistente" panel keeps the token in `sessionStorage`, sends `buildSnapshot()` to `POST /snapshot` and chats over `/agent/*`, so no snapshot export is needed.
- **`voice_agent/`**: an isolated container (Python 3.12, `pipecat-ai==1.14.0`). Never add its dependencies to the API's requirements.
  - `energy_api.py`: `VoiceEnergyAdapter` calls the same eight tools over authenticated HTTP. It never shares the repository or loads snapshots.
  - `voice_pipeline.py`: a cascaded OpenAI STT → LLM (with the eight tools) → TTS pipeline. Tool arguments are validated before dispatch. `create_tts()` picks the TTS from `VOICE_TTS_PROVIDER`: `openai` (default) or `elevenlabs` (`eleven_flash_v2_5`, premade voice George by default, key `ELEVENLABS_API_KEY` passed to `voice-agent` only). ElevenLabs credits are not tracked by the local voice budget, and when ElevenLabs rejects a voice Pipecat only logs `TTS context ... completed with no audio`.
  - `webrtc_runner.py`: `run_bot()`/`bot()`, and the entry point of the Windows launcher (no TURN). With `VOICE_PIPELINE_ENABLED=false` (the default), it runs a passthrough pipeline that makes no provider calls.
  - `voice_budget.py`: before any provider service is built, it reserves the full `VOICE_SESSION_BUDGET_USD` for the session. The reservation is charged on close, even after an error.
  - `webrtc_turn_runner.py`: the Docker entry point. `VOICE_TURN_MODE` picks coturn (`turn_credentials.py`, local) or Twilio (`twilio_ice.py`, remote voice; see `docs/M04.9-REMOTE-VOICE.md`).
  - `start_guard.py`: both entry points require an API-issued session grant on `POST /start` (checked, not consumed, via `/voice/sessions/check`) and refuse direct `/api/offer`.
- **`voice_agent/web/`**: the browser client (`src/main.js`), bundled with esbuild into the committed file `dist/vesta-voice-client.js`. The `energy-api` image copies `dist/`, so rebuild it after editing `src/`.

## Commands

```bash
# Full stack: dashboard on :8766, API + /demo + /app (dashboard with the assistant panel) on :8000. Requires ENERGY_TOOLS_API_TOKEN in .env (copy .env.example)
docker compose up -d --build
docker compose --profile voice up -d voice-agent          # voice agent on :7860
docker compose --profile voice run --rm voice-agent python -m voice_agent.smoke_test

# Tests (pytest; OpenAI and Pipecat services are stubbed, so they cost no tokens)
python -m pytest -q -p no:cacheprovider
python -m pytest -q tests/test_api.py::test_name           # single test
python -m compileall -q energy_tools tests

# Validate a real snapshot (in the browser console with the .xlsx loaded: copy(JSON.stringify(buildSnapshot())), save as agent_snapshot.json)
python scripts/validate_real_snapshot.py path/to/agent_snapshot.json

# Per-service TTFB (Pipecat metrics) from recent voice sessions
docker compose logs --since 30m voice-agent | python scripts/voice_latency.py

# Rebuild the voice web bundle
docker run --rm -v "$PWD/voice_agent/web:/app" -w /app node:22-alpine npm run build

# Dashboard JS syntax check
node --check <(sed -n '/<script>/,/<\/script>/p' dashboard/dashboard.html | sed '1d;$d')
```

- `requirements.txt` is the dev/test set and `requirements-runtime.txt` the API image set.
- The `tests/test_voice_*` and `tests/test_turn_credentials.py` tests import `pipecat`, so they also need `voice_agent/requirements-voice.txt`.
- The README and docs show Windows paths (`.\.venv\Scripts\python.exe`). The local `.venv/` may not be usable on macOS.

## Safety constraints (enforced by design and tests)

- Every provider is off by default (`OPENAI_ENABLED=false`, `VOICE_PIPELINE_ENABLED=false`). Keep it that way, and keep budget reservations ahead of any provider call.
- The repo is public. `data/`, `Datos/`, `*.xlsx`, `agent_snapshot*.json`, `.env*` and `voice_agent/turnserver.local.conf` are gitignored. Never commit them, and never send whole Excel files or snapshots to an LLM.
- Tool output is untrusted data. The system prompts say so; keep that wording when editing prompts.
- Errors and ledgers must never contain the token, snapshot content, prompts, transcripts or audio. Only aggregate counters are persisted.
- Services bind to `127.0.0.1` only.
- Don't run `docker compose config` where its output will be shared, because it expands secrets.
- Milestone design notes are in `docs/M0*.md`. Read the relevant one before changing that subsystem.
