# Plan — Voz remota para un colega (túnel + Twilio TURN)

Actualizado: 2026-11-04. El plan anterior (modelo local y voz, 28–29 oct.) está en
`docs/plan-2026-10-voz-local.md` como registro.

## Estado al 2026-11-04 — demo cerrado

**El demo está completo.** Lo que sigue es probarlo con usuarios y reunir feedback (ver README,
"Pruebas y feedback").

- **PR #9 (fusionado):** voz remota con Cloudflare Tunnel y TURN de Twilio (`VOICE_TURN_MODE`,
  `VOICE_ALLOWED_ORIGINS`, credenciales que se renuevan solas) y `/start` protegido por el grant de
  sesión (`voice_agent/start_guard.py`). Validado desde un celular con datos móviles.
- **PR #10 (fusionado):** limpieza tras una auditoría. Se borraron el experimento WebRTC/coturn
  anterior, `voice_agent/server.py` y el botón "⟳ Sincronizar"; `tools.py` quedó sin repetición; las 8
  herramientas se definen una vez en `energy_contracts/`, y el panel ya no consulta `/health` antes de
  cada pregunta.
- **Rama `fix/mobile-assistant-panel`:** el panel 💬 usa la altura visible del celular (los botones
  ya no quedan bajo la barra del navegador) y se quitó el botón "⬇ Descargar snapshot".
- Ledger de voz reiniciado el 2026-11-04: `VOICE_BUDGET_USD=3.00` alcanza para 15 sesiones de 0,20 USD.

### Pendientes

1. Repetir la prueba remota desde un celular con la protección de `/start` (solo se probó en local).
2. Una sesión de voz en Windows con `scripts/start-voice-windows.ps1`: ese runner ahora también exige
   el grant en `/start`.
3. Fase 4: prueba con el colega y feedback. Revisar después `scripts/voice_latency.py` y el ledger.
4. Opcional: ajustar el silencio de fin de turno (el STT cortó una pregunta con pausa), pasar los 48
   `toFixed()` del dashboard al formato chileno y evaluar STT en streaming para bajar la latencia
   (STT ~1,1 s es el tramo más lento).

### Historial de la voz remota (fases 1–3)

- **Fase 1 ✅** Cuenta de Twilio; `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` en `.env`.
- **Fase 2 ✅** Probada desde el celular con datos móviles: ICE `completed` con candidatos `relay` de
  Twilio, `get_overview` correcto y audio con TTS OpenAI y ElevenLabs. TTFB mediano: STT ~1,1 s,
  LLM ~0,7–1,3 s, TTS ElevenLabs ~0,2 s (OpenAI ~1,3 s).
- **Fase 3 ✅** `voice_agent/twilio_ice.py` (ICE de Twilio normalizado para Pipecat y renovado al
  80 % del TTL), `VOICE_TURN_MODE` y `VOICE_ALLOWED_ORIGINS`, y la protección de `/start`.

### Cómo levantar la demo remota (resumen de M04.9)

1. Dos túneles: `cloudflared tunnel --no-autoupdate --url http://127.0.0.1:8000` y otro para `:7860`.
2. En `.env`: `VOICE_TURN_MODE=twilio`, la URL del túnel de `:8000` agregada a `VOICE_ALLOWED_ORIGINS`,
   y `VOICE_PIPECAT_URL` = URL del túnel de `:7860`.
3. `docker compose --profile voice up -d --build`. Recargar los `.xlsx` (el snapshot vive en memoria).
4. Al terminar: Ctrl+C en los túneles y volver `.env` a los valores locales.

---

*Lo que sigue es el plan original del 2026-11-03, conservado como registro.*

## Qué cambió desde el plan anterior

- Voz implementada y fusionada (PR #2–#7): Pipecat 1.14, `gpt-transcribe` → `OPENAI_MODEL` → TTS
  OpenAI o ElevenLabs (`VOICE_TTS_PROVIDER`), coturn local en el perfil `voice`.
- Flujo nuevo: `/app` sirve el dashboard con el panel 💬 (chat) y 🎙 (voz). Ya no se exporta el snapshot.
- Ocho Energy Tools (se sumaron `get_equipment` y `get_indicators`, y `get_overview` por mes).
- Dashboard con luminarias/m² y vista mensual de indicadores (PR #8).
- Descartados por ahora: Whisper y Piper.

## Qué falta

- ✅ **Voz fuera de `127.0.0.1`** (resuelto con el PR #9). Antes solo funcionaba en el mismo Mac: el
  navegador llegaba al runner por `127.0.0.1:7860` y al TURN por `127.0.0.1:3478`.
- Pospuesto: modelo local con Ollama (parte 1 del plan anterior).

## Qué sigue: voz remota

Objetivo: el colega abre un enlace `https://`, arrastra los `.xlsx`, ingresa la clave y habla con Vesta.

```
Navegador del colega ──HTTPS── Cloudflare Tunnel ──► 127.0.0.1:8000 (/app, API)
                     ──HTTPS── Cloudflare Tunnel ──► 127.0.0.1:7860 (señalización Pipecat)
                     ══audio══ Twilio TURN ════════► voice-agent (aiortc)
```

- El túnel da HTTPS (requisito del micrófono) y no abre puertos: `cloudflared` corre en el Mac y se
  conecta a `127.0.0.1`, así que los servicios siguen enlazados solo a loopback.
- Twilio TURN (Network Traversal Service) reemplaza a `turn-local` para el audio. Reenvía SRTP cifrado,
  así que no puede escuchar las sesiones.

### Fase 1 — Cuenta de Twilio (usuario, ~30 min)

1. Crear la cuenta en twilio.com (la prueba trae crédito).
2. Copiar el **Account SID** y el **Auth Token**. Van solo en `.env` como `TWILIO_ACCOUNT_SID` y
   `TWILIO_AUTH_TOKEN`. Nunca en el chat ni en el repo.

### Fase 2 — Prueba de factibilidad, sin cambiar código (~1–2 h)

1. `brew install cloudflared`. Abrir dos túneles rápidos: `cloudflared tunnel --url http://127.0.0.1:8000`
   y otro para `:7860`. Cada uno entrega una URL `https://…trycloudflare.com`, que cambia en cada inicio.
2. Pedir credenciales a Twilio: `POST /2010-04-01/Accounts/{SID}/Tokens.json` (Basic auth). La
   respuesta trae `ice_servers` (STUN y TURN por UDP, TCP y TLS en 443) y su `ttl`.
3. Override local, sin commitear:
   - Iniciar el runner con `PIPECAT_ICE_SERVERS` = esos `ice_servers`, en vez de la credencial de coturn.
   - Agregar la URL del túnel de `:8000` a `--allowed-origins`.
   - En `energy-api`, `VOICE_PIPECAT_URL` = la URL del túnel de `:7860`.
4. Probar desde el **celular con datos móviles** (otra red): `/app` → 💬 → 🎙. En
   `chrome://webrtc-internals`, el par ICE seleccionado debe ser de tipo `relay`.
5. Resultado: si funciona, pasar a la fase 3. Si no, ver "Alternativas".

### Fase 3 — Implementación (~3–4 h)

- **`VOICE_TURN_MODE`:** `local` (coturn, el valor por defecto actual) o `twilio`. En modo `twilio`, el
  runner pide `ice_servers` a Twilio y los renueva antes de que venza el `ttl`. Hoy la credencial se crea
  una sola vez al arrancar (`webrtc_turn_runner.py`).
- **Orígenes y URL del runner por variable:** `VOICE_ALLOWED_ORIGINS` reemplaza los valores fijos de
  `compose.yaml`, y `VOICE_PIPECAT_URL` se mantiene.
- **Seguridad del acceso público:** token nuevo y largo solo para la demo, rotarlo al terminar, y mantener
  los topes de presupuesto.
- **Tests:** sin red, con un cliente de Twilio simulado. Las credenciales no aparecen en logs ni errores.
- **Docs:** `docs/M04.9-REMOTE-VOICE.md`, README y `.env.example`.
- **Opcional:** URL fija con un túnel con nombre (cuenta de Cloudflare y dominio propio, ~USD 10 al año).

### Fase 4 — Prueba con el colega (~30 min)

Enviarle la URL de `/app` y la clave por canales separados. Revisar después
`scripts/voice_latency.py` y el ledger de voz.

## Riesgos y alternativas

- **ICE no conecta por Twilio:** forzar `iceTransportPolicy: "relay"` en el navegador. Revisar el orden de
  URLs, porque aiortc usa solo la primera URL TURN.
- **Plan B2:** transporte WebSocket de Pipecat. Usa un solo puerto, pasa por el túnel y no necesita TURN,
  pero el audio se traba más.
- **Plan C:** un servidor en AWS Lightsail con coturn propio y puertos UDP abiertos. Es permanente, pero
  requiere más configuración.
- **Límites conocidos:** un solo snapshot en memoria, compartido por todos los usuarios; los túneles
  rápidos cambian de URL; el Mac debe quedar encendido con Docker corriendo.

## Estimación

Entre 1 y 1,5 días en total, más 2–4 h de margen para depurar ICE. La fase 2 decide si se sigue.
