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

## Repository layout

| Path | Contents |
|---|---|
| `dashboard/dashboard.html` | Single-file dashboard (Chart.js, SheetJS) with snapshot export/sync |
| `docs/multicentro_energy_manager_demo_spec.md` | Demo specification and implementation plan |
| `data/` | Source `.xlsx` files: **not in the repo** (client data, gitignored) |

## Status

- [x] Dashboard with snapshot export and sync
- [ ] Voice server: Twilio → Pipecat (STT → LLM with tools → TTS)
- [ ] End-to-end phone rehearsal

See the spec for architecture, scripted questions and the plan.
