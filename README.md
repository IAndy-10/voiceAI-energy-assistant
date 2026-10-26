# voiceAI-energy-assistant

Demo of an energy dashboard plus a phone voice assistant for a retail
chain. The dashboard turns the client's Excel files into charts, and the
assistant answers questions about the same numbers over a phone call.

## How it works

1. Open `dashboard/dashboard.html` in a browser (no install, no server).
2. Drag in the `.xlsx` files. The dashboard parses them in the browser.
3. Click **Sincronizar asistente** to send the computed figures
   (`agent_snapshot.json`) to the voice server, or **Descargar snapshot**
   to save the file.
4. Call the assistant's phone number. It answers only from the snapshot,
   so its numbers match what the screen shows.

```
Phone ─► Twilio ─webhook─► POST /twilio/voice  (signature + caller allowlist → TwiML <Connect><Stream>)
              ═══ Media Stream WS ═══► /twilio/stream → Pipecat:
                   STT (Deepgram/Azure) → Claude + 6 read-only tools → TTS (Azure es-CL/ElevenLabs)
dashboard.html ─POST /snapshot (Bearer passcode)─► validated, saved to /data, pinned per call
```

## Repository layout

| Path | Contents |
|---|---|
| `dashboard/dashboard.html` | Single-file dashboard (Chart.js, SheetJS) with snapshot export/sync |
| `voice_server/app.py` | FastAPI: `/snapshot`, `/status`, Twilio webhook and Media Stream WebSocket |
| `voice_server/bot.py` | Per-call Pipecat pipeline (STT → LLM with tools → TTS) |
| `voice_server/tools.py` | The six tools the agent calls, over the snapshot |
| `voice_server/snapshot.py` | Snapshot schema check (`1.0`) and storage |
| `voice_server/prompts.py` | Greeting and system prompt (spec §7.2) |
| `voice_server/harness.py` | Text test harness for the scripted questions |
| `docs/multicentro_energy_manager_demo_spec.md` | Demo specification and implementation plan |
| `data/` | Source `.xlsx` files: **not in the repo** (client data, gitignored) |

## Voice server

### Run locally

```bash
python3.11 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
cp .env.example .env        # fill in the keys
set -a; source .env; set +a
SNAPSHOT_PATH=./agent_snapshot.json .venv/bin/uvicorn --factory voice_server.app:create_app --port 8080
```

Twilio needs a public `https` URL, so for a local phone test expose the
port (e.g. `ngrok http 8080`) and set `PUBLIC_HOST` to that host.

### Deploy (Fly.io)

```bash
fly launch --no-deploy --copy-config          # keeps fly.toml; change `app` and PUBLIC_HOST if the name is taken
fly volumes create snapshot_data --size 1 --region iad
fly secrets set VOICE_PASSCODE=… ANTHROPIC_API_KEY=… TWILIO_ACCOUNT_SID=… TWILIO_AUTH_TOKEN=… \
  ALLOWED_CALLERS=+569…,+569… DEEPGRAM_API_KEY=… AZURE_SPEECH_KEY=…
fly deploy
curl https://multicentro-voz.fly.dev/status
```

### Twilio

On the number's **Voice configuration**: *A call comes in* → Webhook →
`https://<PUBLIC_HOST>/twilio/voice` (HTTP POST). Leave recording off.
Callers not in `ALLOWED_CALLERS` hear a short message and the call ends.

### Checks

```bash
.venv/bin/python -m pytest -q                 # unit tests (synthetic data)
.venv/bin/ruff check voice_server tests
# With the real snapshot (never commit it): tool results behind each scripted question
.venv/bin/python -m voice_server.harness tools --snapshot agent_snapshot.json
# Same questions through Claude, 10 runs each; exit code 1 on any failure
.venv/bin/python -m voice_server.harness llm --snapshot agent_snapshot.json --runs 10
REAL_SNAPSHOT=agent_snapshot.json .venv/bin/python -m pytest -q tests/test_tools.py
```

`GET /status` shows the loaded snapshot and the last provider errors
(`recent_call_errors`). A provider that fails to connect leaves the caller
in silence, so check it after every test call on demo day.

## Status

*Updated 2026-10-23.*

- [x] Dashboard with snapshot export and sync
- [x] Voice server code: Twilio → Pipecat (STT → LLM with tools → TTS), 96 offline tests passing
- [x] Tools checked against a real snapshot: they return the spec §8 answer key
- [ ] Accounts and keys: Twilio, Deepgram, Azure Speech, ElevenLabs, Anthropic, Fly.io
- [ ] Docker image built and deployed to Fly.io
- [ ] Twilio number bought, webhook set to `/twilio/voice`, caller allowlist set
- [ ] Speech provider test on a real phone line (spec §7.4)
- [ ] Text harness 10/10 per question with the real snapshot and an API key
- [ ] End-to-end phone rehearsal
- [ ] Repo made private (the spec contains client figures)

See the spec for architecture, scripted questions and the plan.
