# Multicentro Energy Manager Demo

## Technical Specification & Implementation Plan

**Version:** 0.3\
**Scope:** Demo / proof of concept\
**Purpose:** Internal planning for a board presentation\
**Demo date:** Friday 30 October 2026 · **Presenter:** Pablo\
**Data owner:** analyst who built the dashboard (technical check) ·
**Sign-off:** Pablo (Tuesday 27 Oct, see §9)

> **Purpose:** Show Realiza's board that its own Excel files can become
> a live energy dashboard **and** a phone assistant that gives the same
> answers, then close a paid pilot for monthly energy management. This
> is a proof of concept, not a production system.

**Changes from v0.2:**
- `dashboard.html` is now the single source of truth. The voice agent
  reads a snapshot exported **from the dashboard**, so the two can't
  disagree.
- The phone call (Twilio) is back as the centrepiece.
- The official price basis is fixed at 131,6 / 159,9 CLP/kWh.
- The Next.js rebuild is dropped.
- The answer key now uses the values the dashboard displays.
- An implementation plan, a go/no-go gate and a run-of-show were added.

**Conventions:**
- All UI text and voice are in **Chilean Spanish**, with Chilean number
  format (`1.234,56`; `$427,6 M`).
- Figures come from the current XLSX files, computed the way
  `dashboard.html` computes them (2026-10-23). They are **pending
  data sign-off**.

------------------------------------------------------------------------

## 1. The demo in one paragraph

Pablo opens `dashboard.html` and drags in Multicentro's Excel files, and
the dashboard appears. One click, **"Sincronizar asistente"**, sends the
numbers the dashboard just calculated to the voice agent. Pablo then
calls a phone number from his own cellphone and asks three questions.
While the agent answers, the board can check every number against the
chart on the screen. The agent never calculates on its own: it reads the
same figures the dashboard shows, and it says so when it doesn't have a
figure.

## 2. Goals and success criteria

### Goals

-   Show that existing files become a management dashboard in seconds
    (no IT project needed to start).
-   Show a voice agent that is **verifiably consistent** with the screen.
-   Show honesty: the agent states the period, the metric and any gaps,
    and refuses to invent.
-   End with a defined paid pilot: monthly data, alerts and a phone line
    for management.

### Success criteria

-   Every spoken number for the 3 scripted questions matches what is on
    screen, at the same rounding, on 10 rehearsal calls in a row.
-   The agent starts speaking within 1,5 s after Pablo stops talking.
-   Pablo can run the whole flow alone: open, load, sync, call.
-   The agent answers an out-of-scope question with "no tengo ese dato"
    plus what would be needed.
-   A recorded fallback video of the full flow exists.

## 3. Scope

### In scope

-   `dashboard.html` (existing): XLSX loading, 5 tabs, plus a new
    **snapshot export/sync** module and number-format fixes.
-   Voice server: Twilio phone number → Pipecat pipeline (STT → LLM with
    tools → TTS) reading the latest snapshot.
-   Allowlist of caller numbers (Pablo + backup).
-   Optional: live transcript panel inside the dashboard.

### Out of scope

-   A rebuilt web app, a database or user accounts.
-   Automatic data ingestion (utility, ERP, BMS, PV inverters).
-   The MMEE efficiency-measure calculations inside the agent. They are
    mentioned in the pilot proposal, not demoed. They go into the agent
    only after their paybacks are reconciled (see v0.2 issue D5).
-   Call recording or storing audio.
-   Any write action by the agent.

## 4. Architecture

```
 ┌──────────────── Laptop (screen-shared) ────────────────┐
 │ dashboard.html                                         │
 │  1. drag XLSX files → SheetJS parses in browser        │
 │  2. compute*() functions → charts + KPI cards          │
 │  3. buildSnapshot() → agent_snapshot.json              │
 │  4. "Sincronizar asistente" → POST /snapshot ──────────┼──┐
 └────────────────────────────────────────────────────────┘  │ HTTPS + passcode
                                                             ▼
 Pablo's phone ──call──► Twilio number ──Media Stream──► Voice server (Python)
                                                         Pipecat pipeline:
                                                          STT (es-CL, streaming)
                                                          → LLM + tools over snapshot
                                                          → TTS (Spanish voice)
                                                         GET /status · (opt.) SSE /transcript
```

| Component | Technology | Notes |
|---|---|---|
| Dashboard | Existing `dashboard.html` (Chart.js, SheetJS) | Opened locally (`file://`) or hosted as a static, password-protected page |
| Snapshot | `agent_snapshot.json`, produced by the dashboard | The only data the agent can see |
| Voice server | Python 3.11, **one** FastAPI + Pipecat service (`/snapshot`, `/status`, Twilio webhook + Media Stream WebSocket) | Hosted on **Fly.io** (or Railway): a single always-on instance with a small volume so the snapshot survives a restart. US-East region, close to the speech and LLM APIs |
| Telephony | Twilio Programmable Voice + Media Streams | US number from day 1; Chilean number only if the regulatory bundle is approved in time (§7.3); caller allowlist; recording **off** |
| STT | **Deepgram** (streaming, Spanish), first choice · Azure Speech `es-CL`, backup | Both have Pipecat integrations; pick after the Monday test (§7.4) |
| TTS | **Azure Speech `es-CL` neural voice** (Catalina or Lorenzo), first choice · ElevenLabs, backup | A Chilean accent for a Chilean board; ElevenLabs if Azure sounds too robotic |
| LLM | Claude Sonnet 5.5 (`claude-sonnet-5-5`) with tool use | Chosen for latency; confirm in testing |

**Why not Pipecat Cloud:** it is a good managed option for the bot
itself, but the bot still needs somewhere to receive and keep the
snapshot. One self-hosted service that does both is one deploy, one log
and one thing to restart on demo morning.

**Why not a speech-to-speech model** (e.g., Gemini Live): fewer hops,
but less control over reading exact `display` values and over tool
calls. Keep STT → LLM → TTS for this demo.

**Why the dashboard produces the data:** the voice agent never parses
the Excel files itself. If Pablo loads new files and syncs, both the
screen and the phone change together. This is also the pilot story:
*"cargue el Excel del mes y el asistente ya lo sabe."*

## 5. Dashboard changes (`dashboard.html`)

### 5.1 Refactor: compute separately from render

Today each `render*()` function computes and draws in the same place.
Split each one into `computeExec()`, `computeSolar()`,
`computeChiller()`, `computeIndic()` and `computeEquip()`, which return
plain objects, plus the existing `render*()`, which draws from those
objects. `buildSnapshot()` calls the same `compute*()` functions, so the
snapshot is by construction what the charts show.

### 5.2 Snapshot export / sync

-   Button **"Sincronizar asistente"** in the header, enabled once files
    are loaded.
-   On click: `buildSnapshot()` → `POST {VOICE_URL}/snapshot` with
    `Authorization: Bearer <passcode>` → the header shows
    **"Asistente actualizado ✓ 15:42 · 5 archivos"**.
-   Fallback: **"Descargar snapshot"** saves `agent_snapshot.json` for
    manual upload (`scp` or the server's upload form).
-   The passcode is typed once per session (prompt field), never
    hard-coded in the HTML.

### 5.3 Number and label fixes

-   Replace `toFixed()` displays with `toLocaleString('es-CL', …)` so
    the screen shows `$427,6 M` and `$159,9`, not `$427.6 M` / `$159.9`.
    The agent must say the same rounding.
-   Rename the KPI "Precio Promedio $/kWh" to **"Precio oficial promedio
    energía"** with the source in the detail line ("Resumen Multicentro
    kWh"). Dividing cost by kWh on the dashboard gives ~$253 (C/FV), not
    $159,9, and someone will try it.
-   In the store ranking, annotate % changes on small bases (e.g.,
    Curepto +217,8% on $1,3 M → $4,0 M) so the chart and the agent tell
    the same nuanced story.

### 5.4 Optional: live transcript panel

A collapsible side panel that subscribes to `GET /transcript` (SSE)
and shows what the agent heard, what it answered and a
**"📊 Ver: pestaña Resumen"** link that switches the tab. The board then
watches one screen. Build it only after §5.2 works.

## 6. Snapshot format (`agent_snapshot.json`)

```json
{
  "schema_version": "1.0",
  "generated_at": "2026-10-23T15:42:00-03:00",
  "sources": [{"file": "analisis-costos.xlsx", "rows": 583}],
  "official_price_clp_kwh": {"2024": 131.6, "2025": 159.9,
                             "source": "Resumen Multicentro kWh"},
  "periods": {"complete_years": [2024, 2025], "partial": {"2026": [1, 2, 3, 4]}},
  "exec": {
    "2025": {"cost_cfv_clp": 427573230, "kwh": 1692818, "display": {"cost": "$427,6 M", "kwh": "1.693 MWh"}},
    "2024": {"cost_cfv_clp": 394101340, "kwh": 1898580},
    "change": {"cost_pct": 8.5, "kwh_pct": -10.8, "price_pct": 21.5},
    "solar_discount_accumulated_clp": 89526022, "solar_sites": 11
  },
  "stores": [{"name": "Portal Centro Talca", "aliases": ["Portal Centro", "Talca Portal"],
              "year": 2025, "cost_cfv_clp": 75025003, "change_pct": 19.1,
              "change_abs_clp": 12025815, "rank_cost": 1, "notes": ["Chiller facturado aparte"]}],
  "rankings": {"cost_2025": ["..."], "increase_abs": ["..."], "increase_pct": ["..."]},
  "solar": {"kwp_total": 805.3, "plants": ["..."], "2025": {"generation_kwh": 1010502, "self_consumption_pct": 62}},
  "chiller": {"months": ["..."]},
  "indicators": {"kwh_per_m2": ["..."], "missing_m2": ["Go Florida Talca", "OnTop Talca", "Pichilemu"]},
  "known_gaps": ["Sin datos de ventas, clientes ni horas reales por tienda", "2026 parcial: ene–abr"]
}
```

Rules:
- Every value the agent may speak carries a `display` string with the
  exact rounding shown on screen.
- Rankings and % changes are **precomputed**. The LLM never does
  arithmetic.
- `aliases` absorb transcription errors ("Kurepto", "Portal Centro").
- The voice server rejects any snapshot whose `schema_version` it
  doesn't recognise, with a clear error.

## 7. Voice agent

### 7.1 Tools (read-only, over the in-memory snapshot)

| Tool | Returns |
|---|---|
| `get_overview(year)` | Cost, kWh, price, % changes, solar savings, with `display` strings |
| `get_store(name, year)` | One store's figures (fuzzy match on name + aliases) |
| `rank_stores(metric, order, top_n)` | `cost`, `increase_abs`, `increase_pct`, `kwh_per_m2` |
| `get_solar(plant?)` | Totals or one plant: kWp, generation, self-consumption, payback |
| `get_chiller(year?)` | Portal Centro chiller cost and BTU |
| `get_data_info()` | Sync time, sources, periods, known gaps |

### 7.2 Behaviour rules (system prompt)

-   Greeting (≤ 10 s): *"Hola, soy el asistente energético de
    Multicentro. Respondo con los datos sincronizados hoy a las 15:42."*
    The timestamp ties the call to the screen.
-   Every number comes from a tool result in this turn, read from its
    `display` value. No mental math, no outside knowledge.
-   Always say the period and the metric. For "mayor aumento" questions,
    give pesos first and mention % if the leader differs, flagging small
    bases.
-   Mention the separately billed chiller whenever Portal Centro Talca's
    costs come up.
-   Not in the snapshot → *"No tengo ese dato en la información cargada;
    para eso necesitaríamos…"*
-   Spoken answers ≤ 40 words, then offer: *"¿Quiere el detalle?"*
-   Say amounts as words-friendly text ("cuatrocientos veintisiete coma
    seis millones de pesos") and avoid "M" or "$" symbols in TTS input.
-   Support interruptions (barge-in) and keep it to one question per turn.

### 7.3 Telephony and privacy

-   Only allowlisted caller numbers are answered; other callers hear a
    short message and the call ends.
-   Twilio recording is disabled; audio is not stored. Transcripts are
    held in memory only for the live panel, and cleared on restart.
-   **Chilean number:** Twilio requires a regulatory bundle. For a
    business, that means a commercial register excerpt and proof of a
    local business address (individuals: ID plus proof of a Chile
    address). Approval can take days, so submit it Monday morning and
    **don't depend on it**.
-   **US number** bought on Monday as the working number. Pablo's phone
    must allow international calls; check his plan and the per-minute
    cost.

### 7.4 Speech provider test (Monday)

Call the bare pipeline with each combination and score it:

| Check | Pass |
|---|---|
| The 20 store names, spoken by Pablo or a Chilean speaker | ≥ 18/20 correctly transcribed (aliases cover the rest) |
| Amounts: "cuatrocientos veintisiete coma seis millones" | Spoken naturally, no "M" or "$" read aloud |
| Latency: end of question → first audio | < 1,5 s median over 10 turns |
| Voice quality on a phone line (8 kHz) | Pablo prefers it in a blind A/B |

Combinations to test: Deepgram + Azure `es-CL`; Deepgram + ElevenLabs;
Azure `es-CL` + Azure `es-CL`. Keep the best one and don't revisit it.

## 8. Scripted questions and answer key

Values as `dashboard.html` displays them with the current files
(2025 vs 2024). The agent's spoken numbers must match exactly.

| # | Pablo asks | Expected answer (core) | Where on screen |
|---|---|---|---|
| Q1 | *"¿Cuánto pagamos de electricidad en 2025 y cómo se compara con 2024?"* | $427,6 M vs $394,1 M (+8,5%), even though grid consumption fell 10,8% (1.899 → 1.693 MWh). Official energy price rose from $131,6 to $159,9 per kWh (+21,5%). | Resumen → 4 KPI cards |
| Q2 | *"¿Qué tienda tuvo el mayor aumento de costo?"* | In pesos: **Portal Centro Talca**, +$12,0 M (+19,1%), $75,0 M in 2025, plus the chiller billed separately. In %, Curepto rose 217,8%, but from a small base (~$4,0 M in 2025). | Resumen → store ranking chart |
| Q3 | *"¿Cuánto nos ha ahorrado la energía solar?"* | $90 M accumulated in distributed-generation discounts (2024, 2025 and 2026 partial) across 11 sites; in 2025 the plants generated 1.010,5 MWh, 62% self-consumed. | Resumen KPI + Solar tab |
| Q4 *(optional)* | *"¿Cuánto consume cada tienda por cliente?"* | "No tengo ese dato; necesitaría el flujo de clientes o las ventas por tienda." | — |

**Backup questions** (if the board asks for more):
- *"¿Qué planta solar tarda más en pagarse?"* → Parral, 13,6 years
  projected.
- *"¿Cuántos kWp solares tenemos?"* → 805,3 kWp in 12 plants.
- *"¿Cuánto cuesta el chiller de Portal Centro?"* → value from the
  Chiller tab KPI.

## 9. Data sign-off

**What it means:** before the board sees a number, someone accountable
confirms it is correct and agrees to stand behind it. If a board member
challenges a figure on Friday, the answer must be "this was checked
against the bills", not "the software calculated it".

**Two steps (lightweight):**

1. **Technical check, Monday 26, data owner.** Every number in the
   answer key (§8) matches the source Excel files and the dashboard
   screen. Resolve notes N2–N6 below.
2. **Sign-off, Tuesday 27, Pablo (15 minutes).** One page with ≈ 10
   headline numbers, their source and the notes. Pablo approves the
   numbers and the wording ("precio oficial", "ahorro acumulado").
   After that, no figure changes without telling him.

**Optional:** if there is a trusted contact on the client side who
handles the electricity bills, ask them to confirm the 3 headline totals
(2025 cost, 2024 cost, solar discount). If not, the dashboard footer
says *"Datos según archivos entregados por Multicentro"*.

### Data notes to confirm

| # | Note | Status / action |
|---|---|---|
| N1 | Official energy price: 131,6 (2024) · 159,9 (2025) CLP/kWh, source "Resumen Multicentro kWh" | **Closed.** Label it as official; never derive it from billing |
| N2 | 2026 is partial: January–April (4 months in the cost file) | Confirm; the agent never compares 2026 with a full year |
| N3 | Pichilemu appears only from 2025 ("nueva" in the ranking) | Excluded from % change; the agent says so |
| N4 | Curepto +217,8% and Centro de Distribución 1 with negative net cost (solar discounts > cost) | Annotate on screen; the agent gives context |
| N5 | m² missing for Go Florida Talca, OnTop Talca and Pichilemu; Portal Centro m² differs between files (2.640,78 vs 3.057) | Confirm the value used by the Indicadores tab |
| N6 | Total PV capacity: 805,3 kWp (dashboard sum) vs 795 kWp in older documents | Use 805,3 |

## 10. Run-of-show (≈ 12 minutes)

| Min | Action | Message |
|---|---|---|
| 0–1 | Open `dashboard.html`, drag the Excel files | "Estos son sus archivos de siempre." |
| 1–4 | Resumen: cost vs consumption vs price; store ranking | "Consumimos menos, pagamos más." |
| 4–5 | Click **Sincronizar asistente** → ✓ 15:42 | "El asistente ahora sabe exactamente lo mismo que esta pantalla." |
| 5–9 | Pablo calls on speaker (audio routed to the room); Q1 → Q2 → Q3, pointing at the matching chart after each answer | "Compárenlo ustedes mismos." |
| 9–10 | Q4, the out-of-scope question | "No inventa. Dice qué dato falta." |
| 10–12 | Pilot proposal slide | See §13 |

**Room setup:** phone audio goes to the room speakers (Bluetooth or
cable), not the handset speaker. The laptop is on a wired connection
or tethered hotspot as backup. Use a second phone as the backup caller
(allowlisted).

## 11. Implementation plan

Four build days, then the demo on Friday 30 October. Monday starts with
the riskiest part (telephony, speech, latency). Anything that slips past
Thursday's go/no-go is cut, not squeezed in.

### Mon 26: voice skeleton + speech test (de-risk first)

- [ ] 09:00: submit the Twilio Chile regulatory bundle; buy a US
      number and use it from now on; recording off; caller allowlist.
- [ ] Create accounts and keys: Twilio, Deepgram, Azure Speech,
      ElevenLabs, Anthropic, Fly.io.
- [ ] Deploy a minimal FastAPI + Pipecat service on Fly.io: Twilio →
      STT → LLM → TTS, Spanish greeting, no tools.
- [ ] Run the speech provider test (§7.4) and choose the combination.
- [ ] Data owner: technical check of the answer key and notes N2–N6.
- [ ] **Check:** a call from Pablo's phone gets a natural Spanish
      greeting and replies in < 1,5 s.

### Tue 27: dashboard snapshot + sign-off

- [ ] Refactor `dashboard.html` into `compute*()` + `render*()` (§5.1),
      no visual change.
- [ ] Implement `buildSnapshot()` with `display` strings, precomputed
      rankings and aliases (§6); "Descargar snapshot" button.
- [ ] Number format and label fixes (§5.3).
- [ ] **Sign-off with Pablo (15 min)**: the one-page sheet (§9).
- [ ] **Check:** every number in the snapshot equals the number on
      screen (4 Resumen KPIs, top 5 of the ranking, Solar KPIs).

### Wed 28: agent tools + sync

- [ ] Voice server: `POST /snapshot` (passcode, schema check, saved to
      the volume), `GET /status`; the tools from §7.1.
- [ ] System prompt with the rules from §7.2; fuzzy store-name matching.
- [ ] "Sincronizar asistente" button + ✓ timestamp in the dashboard
      header (CORS for the dashboard origin).
- [ ] Text test harness: Q1–Q4 + backup questions as text, numbers
      compared with the answer key.
- [ ] Record the fallback video at the end of the day (it can be
      re-recorded Thursday if the flow improves).
- [ ] **Check:** the harness passes 10/10 runs per question.

### Thu 29: end-to-end, rehearsal, go/no-go

- [ ] Morning: full phone runs (load → sync → call → Q1–Q4); fix wording,
      pacing and pronunciation.
- [ ] Single-source proof: change one value in a test copy of the Excel
      → reload → sync → call → the agent says the new value.
- [ ] Optional: live transcript panel (§5.4), **only** if all of the
      above passed by 12:00.
- [ ] 15:00: rehearsal with Pablo in the room setup (§10), including
      audio routing and the backup phone.
- [ ] **17:00 go/no-go:** 10 consecutive clean phone runs today?
      **Go** = live call. **No-go** = the agent over text on screen, or
      the video.
- [ ] Pilot proposal slide final (§13). **Code freeze** after the last
      clean run.

### Fri 30: demo day

- [ ] 2 h before: voice server `/status` OK; load files and sync;
      snapshot timestamp is today.
- [ ] One test call from each allowlisted phone.
- [ ] Laptop: dashboard open, files at hand, fallback video on the
      desktop, audio routing tested, hotspot ready.
- [ ] After the demo: disable the number or allowlist, and wipe the
      snapshot unless the pilot goes ahead.

## 12. Risks and mitigations

| Risk | Mitigation |
|---|---|
| The agent says a number different from the screen | Snapshot built by the same `compute*()` code; `display` strings; 10/10 harness |
| STT mishears store names | Aliases + fuzzy match; agent repeats the store it understood |
| Slow or broken call (network, Twilio, provider) | Persistent host near the providers; latency test on Monday; Thursday go/no-go; video fallback |
| Board divides cost by kWh and gets a different "price" | Label "Precio oficial promedio energía" with its source; agent explains if asked |
| Misleading % on small bases (Curepto) | On-screen annotation + agent rule (pesos first) |
| A stranger calls the number | Caller allowlist |
| Client data exposure | Snapshot holds aggregates only; passcode on sync; no recordings; server wiped after the demo unless the pilot is signed |

## 13. Pilot proposal (closing slide)

**"Gestión energética mensual, 3–6 meses"** (scope and price TBD):

-   Each month: billing loaded and validated for all 20 sites; dashboard
    and assistant updated the same day.
-   A monthly alerts report: tariff anomalies, cost spikes, solar plant
    performance, chiller trend.
-   A phone assistant for management and store managers, available any
    time.
-   An efficiency roadmap: start with the no-cost measures (tariff and
    contracted-power review, energy governance), then track savings from
    estimate to verified.
-   A monthly review meeting with a short list of decisions.

## 14. Costs (demo, order of magnitude)

-   Twilio: phone number (monthly fee) + per-minute voice. Negligible
    for rehearsals.
-   STT/TTS + LLM: a few dollars for all rehearsals combined.
-   Hosting: one small always-on Fly.io machine + 1 GB volume.
-   Azure Speech / Deepgram / ElevenLabs: check free or trial credits
    when creating the accounts; rehearsal volume is small.

Confirm current prices when buying. None of these are commitments for
the pilot.

## 15. Open decisions

-   Final STT/TTS combination (Monday test, §7.4).
-   Chilean number: only if Twilio approves the bundle before Thursday;
    otherwise US.
-   Live transcript panel: Thursday 12:00 decision.
-   Optional client-side confirmation of the headline totals (§9).
-   Pilot price and duration (commercial).

------------------------------------------------------------------------

*Prepared as a demo specification. All figures are derived from the
source files as computed by `dashboard.html` and must be validated
before the presentation.*
