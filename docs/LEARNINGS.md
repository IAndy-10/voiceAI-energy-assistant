# Aprendizajes: voz, contenedores y WebRTC

Lo que aprendimos al levantar el asistente de voz de punta a punta (2026-10-29), en un Mac con Docker Desktop. Complementa `docs/plan.md` y `docs/M04.2B-PIPECAT-WEBRTC.md`.

## Voz (Pipecat + OpenAI)

- **Un error del LLM cierra la sesión entera.** Si `OpenAILLMService` recibe un error del proveedor, Pipecat lo marca como «no longer usable», detiene el pipeline y cierra la conexión WebRTC. En el navegador se ve como una conexión que se corta sola apenas después de «Conectar». La causa real solo aparece en `docker compose --profile voice logs voice-agent`.
- **`gpt-6-luna` en Chat Completions necesita `reasoning_effort="none"` para usar herramientas.** Sin eso responde `400 - Function tools with reasoning_effort are not supported for gpt-6-luna in /v1/chat/completions`. `OpenAILLMService` usa Chat Completions y no envía `reasoning_effort` por su cuenta, así que lo pasamos con `Settings(extra={"reasoning_effort": "none"})`, que Pipecat agrega a cada request. El agente de texto (`/agent/chat`) no tiene el problema porque usa la Responses API.
- **Probar el modelo directo antes de tocar el pipeline.** Una llamada mínima con una herramienta de prueba, desde el contenedor `voice-agent`, confirmó el error y la solución en segundos y por una fracción de centavo.
- **El smoke test solo importa módulos.** `python -m voice_agent.smoke_test` no crea clientes ni llama a proveedores, así que no detecta errores de configuración del modelo. Para eso hay que abrir una sesión real.
- **El bot necesita un snapshot cargado.** La API guarda el snapshot solo en memoria: al reconstruir o reiniciar `energy-api` se pierde y hay que volver a hacer `POST /snapshot`. El demo ahora bloquea «Conectar» si no hay snapshot.
- **Los logs de depuración muestran cada etapa:** `Transcription: [...]` (STT), `Generating LLM response` (LLM), `Generating TTS [...]` y `Bot started speaking` (TTS y salida). Si aparece `Bot started speaking` y aun así no se escucha nada, el problema está en el navegador, no en el servidor.

## Navegador (cliente de voz)

- **`SmallWebRTCTransport` entrega el audio del bot pero no lo reproduce.** Sin un elemento `<audio>`, el usuario ve su transcripción y la respuesta escrita, pero no oye nada. `voice_agent/web/src/main.js` ahora conecta la pista de audio remota (`onTrackStarted`, participante no local) a un `Audio` propio y la limpia al desconectar.
- **Reproducir dentro del gesto del usuario.** La sesión parte con el clic en «Conectar», así que Chrome permite el autoplay. Igual se ignora el rechazo de `audio.play()` para no romper la sesión.
- **El bundle es un archivo commiteado y lo sirve `energy-api`.** Después de editar `src/` hay que reconstruir `dist/vesta-voice-client.js`, reconstruir la imagen `energy-api` (que copia `dist/`) y recargar el demo sin caché (Cmd+Shift+R), porque el módulo se importa dinámicamente y el navegador lo cachea.

## WebRTC en Docker Desktop (macOS)

- **El navegador no alcanza las IP de los contenedores.** En Docker Desktop los contenedores viven en una VM, y aiortc anuncia candidatos `172.x` en puertos aleatorios que el host no puede rutear. Por eso usamos un TURN local (coturn, servicio `turn-local` del perfil `voice`).
- **Solo se publica 3478 (UDP y TCP) en `127.0.0.1`.** Los puertos de relay (49160–49169) quedan dentro de la red de Compose, donde el bot llega a coturn directamente. En los logs, el par que funciona es un candidato `typ relay` con IP de la red de Compose.
- **Un host distinto según quién mira.** `PIPECAT_TURN_HOST=turn-local,127.0.0.1`: aiortc usa solo la primera URL TURN (el nombre del servicio dentro de la red de Docker) y el navegador prueba todas, así que usa `127.0.0.1`. El orden importa.
- **Credenciales TURN temporales.** `turn_credentials.py` genera credenciales REST de coturn (HMAC-SHA1 de `<expiración>:vesta-local` con `TURN_SHARED_SECRET`), válidas `VOICE_TURN_TTL_SECONDS` (24 h por defecto). El secreto vive solo en `.env`, que está en `.gitignore`.
- **Diagnóstico.** En los logs del bot, buscar `ICE connection state is completed` y `Peer connection established`. Si ICE queda colgado, el problema es la red y no el modelo. En el navegador, `chrome://webrtc-internals` muestra el par de candidatos seleccionado.
- **Un error de audio después de colgar es normal.** `timed out after 10.0s writing audio to the transport; the peer has stopped reading` aparece cuando el navegador ya cerró, no es la causa del corte.

## Contenedores y flujo de trabajo

- **Levantar todo:** `docker compose --profile voice up -d --build`. Para reconstruir solo un servicio: `docker compose --profile voice up -d --build voice-agent` (o `energy-api`). Reconstruir `energy-api` borra el snapshot en memoria.
- **Las pruebas se corren en la imagen que tiene las dependencias.** Los tests `tests/test_voice_*` que importan `pipecat` corren en la imagen `voice-agent`. Los de API y configuración necesitan `fastapi` y corren en la imagen `energy-api`. Montar `tests/` como volumen de solo lectura e instalar `pytest` al vuelo, sin agregarlo a los requirements de runtime.
- **El bundle web se compila sin Node local:** `docker run --rm -v "$PWD/voice_agent/web:/app" -w /app node:22-alpine npm run build`. `node_modules/` queda en `.gitignore`.
- **Con `OPENAI_ENABLED=true` la voz también se activa**, porque `VOICE_PIPELINE_ENABLED` hereda ese valor salvo que se fije explícitamente. Cada sesión reserva `VOICE_SESSION_BUDGET_USD` (0,20 USD) antes de crear los servicios, con un tope total de `VOICE_BUDGET_USD` (2 USD).
- **Secretos:** al revisar `.env` hay que mostrar solo nombres o largos de las variables, nunca sus valores. No ejecutar `docker compose config` donde su salida se comparta, porque expande los secretos. Antes de commitear, comprobar que ningún valor real de `.env` aparezca en el diff.
