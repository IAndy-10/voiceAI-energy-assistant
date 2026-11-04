# Plan — Modelo local y Asistente de voz

Rama: `feat/local-model-and-voice` (desde `main`). Cada subcambio va en su propio commit.

## Objetivo

1. **Asistente de voz (prioridad):** habilitar la pestaña con la arquitectura de `reference/`: SmallWebRTC → STT → LLM → TTS, **todo con OpenAI** y la misma `OPENAI_API_KEY` y el mismo `OPENAI_ENABLED` del Asistente IA.
2. **Asistente IA con modelo local:** pospuesto. La parte 1 queda como referencia y no se implementa por ahora.

**Cambio de rumbo (2026-10-29):** se descartan por ahora Ollama, Whisper y Piper. La voz usa `gpt-transcribe` (STT), `OPENAI_MODEL` (LLM) y `gpt-4o-mini-tts` (TTS). La imagen de voz queda liviana (sin modelos locales), lo que también evita el problema de disco.

Restricciones:
- Todo corre en Docker.
- Se mantiene la UI actual y el flujo actual: abrir dashboard → descargar snapshot → cargarlo en `/demo` → consultar.
- El dashboard sigue siendo la única autoridad de cálculo. Ni el modelo local ni la voz calculan cifras; solo usan las seis Energy Tools.

## Estado al 2026-10-29

Implementado (sin commits todavía); 78 tests pasan con el venv de `reference/server` (Pipecat 1.14):
- `voice_agent/voice_pipeline.py`: servicios OpenAI configurados con `Service.Settings(...)`, prompt de voz que obliga a usar herramientas, sugerencia de vocabulario para STT, instrucciones de TTS en español de Chile y `TextTransform` `to_spoken()` (`voice_agent/spoken.py`) antes del TTS.
- `VoicePipelineSettings`: `VOICE_PIPELINE_ENABLED` vale por defecto `OPENAI_ENABLED`; `VOICE_LLM_MODEL` vale por defecto `OPENAI_MODEL`. Nuevos `VOICE_LLM_MAX_TOKENS` y `VOICE_SESSION_MAX_SECONDS`. `VOICE_MAX_TURNS` sube de 3 a 8 llamadas de herramienta por sesión.
- `webrtc_runner.py`: saludo en `on_client_connected` con `LLMRunFrame`, tope de duración, idle timeout, `ProcessorUnusablePolicy.END` y métricas. La reserva del ledger se mantiene antes de crear servicios.
- WebRTC: coturn (`turn-local`) dentro del perfil `voice` de `compose.yaml`, solo `127.0.0.1:3478` publicado; `PIPECAT_TURN_HOST=turn-local,127.0.0.1`; credencial TURN válida 24 h. Puertos alineados en `7860`; orígenes `127.0.0.1:8000` y `localhost:8000`.
- `demo.html`: conectar exige snapshot cargado; textos actualizados; la respuesta del bot se acumula por turno.
- `requirements-voice.txt`: `pipecat-ai[webrtc,silero,openai,runner]==1.14.0`.
- `.env`: se agregó `TURN_SHARED_SECRET` generado.

Pendiente: la prueba en Docker. Docker Desktop no respondía (`docker info` colgado) con el disco al 98 % (5,5 GB libres).

## Estado al 2026-10-28

- La rama está creada y no tiene commits.
- Cambios sin confirmar:
  - `CLAUDE.md`: nuevo y completo. Se puede subir aparte con `docs: add CLAUDE.md`.
  - `voice_agent/requirements-voice.txt`: agrega `silero,ollama,whisper,piper`. Hace fallar `tests/test_voice_docker_assets.py::test_voice_runtime_is_isolated_and_pinned` hasta actualizar ese test.
- El trabajo se detuvo porque el disco del Mac se llenó durante el build de la imagen de voz.

### Antes de retomar

1. Liberar espacio. Mirar `df -h /System/Volumes/Data` y `docker system df`, y luego correr `docker builder prune -f`.
2. Dejar al menos unos 15 GB libres: la imagen de voz con Whisper y Piper pesa varios GB.
3. Confirmar que no quede un build colgado (`docker ps`, `pgrep -f "docker build"`).

## Hechos verificados (2026-10-28)

**Equipo:** Mac M1 con 8 GB. Docker Desktop tiene 4 GB, 8 CPU y corre linux/aarch64.

**Ollama**
- La versión 0.40.11 corre nativa en el host, en `localhost:11434`, con `qwen3:4b-instruct` y `gemma3:1b`.
- Un contenedor lo alcanza en `http://host.docker.internal:11434`: se probó con `curlimages/curl` y respondió `/api/version`.
- La Responses API (`/v1/responses`) funciona con el SDK `openai` usando `base_url=http://…:11434/v1` y `api_key="ollama"`.
- El ida y vuelta completo funciona: `function_call` → `function_call_output` → respuesta final con la cifra de la herramienta.

**Fiabilidad de `qwen3:4b-instruct`**
- Con el `SYSTEM_INSTRUCTIONS` actual responde **sin llamar herramientas** en 2 de 3 preguntas, lo que arriesga cifras inventadas.
- Ollama **ignora** `tool_choice: "required"`.
- Funciona con un prompt explícito más `temperature: 0`. El prompt probado fue: «No conoces ninguna cifra de la empresa: SIEMPRE debes llamar una herramienta antes de responder…». Así llamó `get_overview(2025)` y `get_solar(null)`.
- Latencia: unos 50 s en la primera carga del modelo, luego 4–9 s por ronda. Una pregunta con herramienta toma 2 rondas, o sea unos 10–15 s.

**WebRTC en Docker:** aún no está validado en macOS. Es el principal riesgo de la parte 2 (ver `docs/M04.2B-PIPECAT-WEBRTC.md` y la investigación en el commit 5 de la parte 2).

## Parte 1 — Modelo local en Asistente IA (pospuesta)

Diseño:
- Ollama corre en el host porque usa Metal y Docker tiene poca memoria.
- `energy-api` lo llama con la misma Responses API y el mismo bucle de herramientas que OpenAI.
- El modelo local no usa presupuesto en USD, porque no tiene costo. Sí mantiene límites de rondas, llamadas, tokens y timeout.

Commits:

1. **`refactor: share the tool loop between agent providers`**
   - En `energy_tools/agent.py`, extraer de `VestaAgent.chat()` un `_run_tools(client, question, usage, *, model, instructions, max_tool_rounds, max_tool_calls, max_output_tokens, max_input_tokens, provider="OpenAI", require_tool=False, options=None)`.
   - Acumular tokens en un `_Usage` (dataclass con `add`, `cost(settings)` y `public(settings)`), para conservar el uso aunque falle una ronda posterior.
   - `_usage(response)` devuelve solo tokens; el costo lo calcula quien llama.
   - `_provider_error(exc, provider="OpenAI")` usa `{provider}` en los mensajes.
   - `chat()` de OpenAI queda igual por fuera: reserva, llamada a `_run_tools` y `settle` en el `finally`.
   - Todos los tests actuales de `tests/test_agent.py` deben pasar sin cambios.

2. **`feat: add local Ollama model agent`**
   - Nuevo módulo `energy_tools/local_model.py` con `LocalModelSettings.from_env()`:

     | Variable | Valor por defecto |
     |---|---|
     | `LOCAL_LLM_ENABLED` | `false` |
     | `LOCAL_LLM_BASE_URL` | `http://host.docker.internal:11434/v1` |
     | `LOCAL_LLM_MODEL` | `qwen3:4b-instruct` |
     | `LOCAL_LLM_TIMEOUT_SECONDS` | `120` |
     | `LOCAL_LLM_MAX_OUTPUT_TOKENS` | `300` |
     | `LOCAL_LLM_MAX_INPUT_TOKENS` | `4000` |
     | `LOCAL_LLM_MAX_TOOL_ROUNDS` | `2` |
     | `LOCAL_LLM_MAX_TOOL_CALLS` | `6` |

   - Crear `LocalModelAgent(VestaAgent)`:
     - Prompt `LOCAL_SYSTEM_INSTRUCTIONS`: el prompt base más la regla de llamar siempre una herramienta.
     - `options={"temperature": 0}`.
     - `require_tool=True`: si contesta sin herramienta, recibe un único aviso; si insiste, la respuesta se descarta con la categoría `no_evidence`.
     - En errores, `provider="Ollama"` y mensajes útiles: conexión → «inicie Ollama en el host»; 404 → «`ollama pull <modelo>`».
   - `status()` hace un sondeo corto (unos 2 s) a `GET /v1/models` y devuelve `disabled`, `unreachable`, `model_missing` o `available`.
   - En `api.py`:
     - Nuevo `POST /agent/local-model-chat`, con token, devolviendo `mode: "local_model"` y tokens sin costo.
     - `/agent/status` agrega la clave `local_model`.
   - Probar si Ollama respeta `keep_alive` vía `extra_body` (revisar `ollama ps`). Si no, documentar `OLLAMA_KEEP_ALIVE=30m` en el host.
   - Tests con cliente falso:
     - El bucle usa herramientas.
     - Una respuesta sin herramienta se descarta.
     - Clasificación de errores.
     - Estados del sondeo.
     - El endpoint exige token y responde 503 si está desactivado.

3. **`feat: add local model option to the AI assistant tab`**
   - En `energy_tools/demo.html`, junto al checkbox «Usar OpenAI», agregar un selector de motor con tres opciones: «Consultas locales · Sin IA» (el intérprete actual), «Modelo local · Ollama» y «OpenAI».
   - Mantener los estilos actuales, el estado en el encabezado (`header-query`), la limpieza de contexto al cambiar de modo y los avisos.
   - El modelo local muestra el modelo y la latencia; el aviso de privacidad aclara que los datos no salen del equipo.
   - Actualizar `tests/test_api.py::test_demo_*`.

4. **`chore: wire the local model into Docker Compose`**
   - En `compose.yaml`, pasar las `LOCAL_LLM_*` a `energy-api` y agregar `extra_hosts: ["host.docker.internal:host-gateway"]`. No hace falta en Docker Desktop, pero lo hace explícito.
   - Actualizar `.env.example` y `tests/test_docker_assets.py`.

5. **`docs: document the local model mode`**
   - Agregar un `docs/M05.1-LOCAL-MODEL.md` y actualizar el README: requisitos (`ollama pull qwen3:4b-instruct`), latencia, limitaciones del modelo de 4B y el aviso de memoria en equipos de 8 GB.

## Parte 2 — Asistente de voz (arquitectura de `reference/`)

> **Actualización 2026-10-29:** la cadena es STT, LLM y TTS de OpenAI. Las menciones a Whisper, Piper y Ollama de esta sección quedan como alternativa futura. Los commits 1 a 4 quedan así: (1) `build`: imagen solo con `silero` y `openai`; (2) configuración: el interruptor y la clave se comparten con el Asistente IA, sin `voice_config.py` nuevo; (3) y (4) como se describen, con servicios OpenAI.

Qué se toma de `reference/server`:
- `config.py` concentra los proveedores y valida el `.env`.
- `create_llm()` se arma por proveedor.
- Precarga de Ollama con `keep_alive` largo, para que el primer turno no espere más de 20 s.
- Saludo al conectar, con un mensaje de rol `user`, porque Ollama ignora `developer`.
- `idle_timeout_secs`, `MAX_SESSION_SECS` y `ProcessorUnusablePolicy.END`.
- Un prompt pensado para voz: frases cortas, sin markdown ni símbolos.
- Servicios configurados con `Service.Settings(...)` en lugar de los argumentos de constructor ya obsoletos.
- Idioma por sesión vía `runner_args.body`, si se decide exponerlo.

Qué cambia por correr en Docker y Linux:
- STT con `WhisperSTTService` (faster-whisper en CPU, modelo `small` o `base` int8) en lugar de MLX, que requiere Metal y no corre en el contenedor.
- TTS con Piper (`es_MX-claude-high`), que corre bien en CPU.
- El LLM es el Ollama del host vía `host.docker.internal`, con OpenAI como opción.
- Los modelos de Whisper y la voz de Piper se descargan en el build, para que la primera sesión no espere descargas.

Se mantiene:
- `VoiceEnergyAdapter`: llamadas HTTP autenticadas a `energy-api`, que usan el snapshot cargado en `/demo`.
- `validate_tool_arguments`, `energy_tool_schemas` y el límite de turnos de `VoiceSession`.
- `VoiceUsageLedger`, aplicado solo cuando algún servicio de la cadena es de pago.

Commits:

1. **`build: bundle local speech models in the voice image`**
   - `requirements-voice.txt` con `pipecat-ai[webrtc,silero,openai,ollama,whisper,piper,runner]==1.14.0`, que ya está editado.
   - En `voice_agent/Dockerfile`, un paso que precarga el modelo de Whisper y la voz de Piper.
   - `smoke_test.py` solo verifica imports, también de Whisper y Piper.
   - Actualizar `tests/test_voice_docker_assets.py`.
   - Antes de seguir, inspeccionar en la imagen las firmas reales de 1.14: `WhisperSTTService.Settings`, `PiperTTSService.Settings` y `OLLamaLLMService.Settings`. No confiar en la memoria.

2. **`feat: add voice provider configuration`**
   - Nuevo `voice_agent/voice_config.py`, al estilo de `reference/server/config.py`:

     | Variable | Valores | Defecto |
     |---|---|---|
     | `VOICE_STT_PROVIDER` | `whisper`, `openai` | `whisper` |
     | `VOICE_LLM_PROVIDER` | `ollama`, `openai` | `ollama` |
     | `VOICE_TTS_PROVIDER` | `piper`, `openai` | `piper` |

     Además: `VOICE_WHISPER_MODEL`, `VOICE_PIPER_VOICE`, `VOICE_OLLAMA_MODEL`, `VOICE_OLLAMA_BASE_URL`, `VOICE_OLLAMA_KEEP_ALIVE`, `VOICE_IDLE_TIMEOUT_SECONDS` y `VOICE_SESSION_MAX_SECONDS`.
   - El campo `paid` es verdadero si algún proveedor es OpenAI.
   - `validate_for_real_use()` exige `OPENAI_API_KEY` solo cuando `paid` es verdadero.

3. **`feat: build the local voice pipeline`**
   - En `voice_pipeline.py`, una función `create_services(config)` con imports diferidos, como `create_llm()` de reference.
   - Un `SYSTEM_INSTRUCTIONS` de voz que obligue a usar herramientas (por lo aprendido en la parte 1), sin markdown y escribiendo los números como se pronuncian.
   - Un `TextTransform` antes del TTS con `to_spoken()`, adaptado de `voice_server/spoken.py` de la rama `feat/voice-server`: «$427,6 M» se lee «427,6 millones de pesos», «%» se lee «por ciento» y «MWh» se lee «megawatts hora».
   - Ajustar los tests de `tests/test_voice_pipeline.py`.

4. **`feat: run the voice session lifecycle like the reference bot`**
   - En `webrtc_runner.py`:
     - Precarga de Ollama al iniciar (`/api/generate` con `keep_alive`).
     - Saludo en `on_client_connected` con `LLMRunFrame`.
     - Tope de duración de sesión e idle timeout.
     - La reserva del ledger solo si `paid`.
     - Mantener el pipeline de paso sin proveedores cuando `VOICE_PIPELINE_ENABLED=false`.

5. **`feat: make WebRTC media reachable from the voice container`**
   - Es el mayor riesgo y hay que validarlo antes de los commits 2 a 4 si es posible.
   - Prueba primero sin navegador: un cliente `aiortc` en el host hace `POST /start` y la oferta, y verifica ICE `connected`.
   - **Investigación (2026-10-29): partir por TURN (opción B), no por A.** La tabla de compatibilidad de Pipecat indica que «Docker on macOS (no `--network=host`)» necesita STUN y TURN.
   - Por qué A es frágil en macOS:
     - aioice enlaza cada socket al puerto 0 y anuncia la IP del contenedor (`172.x`). No tiene opción de rango de puertos ni de IP anunciada. En Docker Desktop esa IP vive en una VM que el navegador no alcanza.
     - El sysctl `ip_local_port_range` solo acota los puertos para poder publicarlos; no arregla la dirección.
     - Chrome oculta su IP local con nombres mDNS (`xxxx.local`), que no se resuelven desde la red de Docker.
     - A puede conectar por casualidad, que es lo peor para una demo.
   - Opción A: el workaround ya documentado, con `net.ipv4.ip_local_port_range: "40000 40100"` y `127.0.0.1:40000-40100:40000-40100/udp`, movido al servicio `voice-agent` de `compose.yaml`. Queda como prueba secundaria.
   - Opción B (primera opción): TURN local con coturn, que ya existe en `compose.webrtc-turn.yaml`, integrado al perfil `voice`. Buenas prácticas:
     - coturn en la misma red de Compose que `voice-agent`. El navegador lo alcanza en `127.0.0.1:3478` (publicado) y el bot en `turn-local:3478` (nombre del servicio).
     - El navegador fuerza relay (`iceTransportPolicy: "relay"`) y el bot conserva sus candidatos de contenedor, que coturn alcanza dentro de la red de Docker. Así bastaría publicar 3478/udp+tcp, sin el rango de relay. Esto es un razonamiento propio que hay que probar.
     - Pasar los ICE servers al runner (`--ice-servers` o `PIPECAT_ICE_SERVERS`), no desde `bot()`, porque el runner de desarrollo crea la conexión. Sin ellos el bot solo ofrece candidatos host.
     - Si se publica un rango UDP, que sea chico, porque los rangos grandes son lentos de publicar y pueden hacer que el daemon de Docker agote el tiempo.
     - Credenciales TURN de corta duración y bind a `127.0.0.1`. En `chrome://webrtc-internals` el par seleccionado debe ser de tipo `relay`. Si el data channel se traba, probar `PIPECAT_SCTP_MAX_CHUNK_SIZE=1100`.
     - Corregir el setup actual: hoy el bot llega a TURN vía `host.docker.internal` (sale al host y vuelve a entrar, lo que es frágil) y `turnserver.local.conf.example` usa `external-ip=host.docker.internal`. Hasta donde se sabe, coturn espera una IP literal en `external-ip`. Usar el nombre del servicio y quitar `external-ip`.
   - Opción B2, si B falla: transporte WebSocket de Pipecat. Usa un solo puerto TCP y no tiene problemas de red, pero Pipecat lo desaconseja para voz desde el navegador: TCP hace que el audio se trabe en vez de saltar un trozo perdido, y se pierde la cancelación de eco del navegador. En localhost el efecto casi no se nota; sirve para una demo local con audífonos.
   - Opción C, último recurso y fuera de la restricción de Docker: correr el bot nativo en el host como `reference/`.
   - Descartadas:
     - Host networking de Docker Desktop (4.34+, opcional): en Mac solo reenvía puertos TCP/UDP, así que el bot probablemente siga anunciando direcciones de la VM. Se puede probar porque es barato.
     - LiveKit en Docker: usa un puerto de media fijo (7882/udp) y `--node-ip`, pero hay reportes del mismo problema en Mac con bots y obliga a cambiar el cliente y la UI.
     - Daily (hospedado): el audio sale del equipo, lo que va contra el objetivo local.
   - Fuentes: [Pipecat SmallWebRTC](https://docs.pipecat.ai/api-reference/server/services/transport/small-webrtc.md), [Pipecat: elegir transporte](https://docs.pipecat.ai/client/concepts/choosing-a-transport), [aioice `ice.py`](https://github.com/aiortc/aioice/blob/main/src/aioice/ice.py), [Docker host network driver](https://docs.docker.com/engine/network/drivers/host/), [coturn Docker README](https://github.com/coturn/coturn/blob/master/docker/coturn/README.md), [ex_webrtc: puertos ICE en Docker](https://ex-webrtc.hexdocs.pm/bare.html).
   - Alinear puertos y orígenes:
     - Hoy `VOICE_PIPECAT_URL` es `7861` y `voice-agent` publica `7860`; deben coincidir.
     - `--allowed-origins http://127.0.0.1:8000` debe coincidir con `/demo`.

6. **`feat: enable the voice assistant tab`**
   - En `demo.html` se mantiene la UI actual (estados, transcripción, respuesta, conectar, desconectar y silenciar).
   - Solo se ajustan los textos que hoy dicen «pipeline no configurado».
   - Requiere snapshot cargado antes de conectar, el mismo flujo que el Asistente IA.
   - `VoiceSettings.public()` agrega los proveedores activos (whisper, ollama y piper), que no son secretos.
   - Reconstruir `voice_agent/web/dist` solo si cambia `src/main.js`.

7. **`docs: document the local voice assistant`**
   - Agregar `docs/M05.2-LOCAL-VOICE.md` y actualizar el README con:
     - Cómo levantar todo: `docker compose --profile voice up -d --build`.
     - La prueba manual con Chrome y `chrome://webrtc-internals`.
     - Latencia esperada.
     - Licencia GPL-3.0 de `piper-tts`.
     - Memoria en 8 GB: Whisper en el contenedor y Ollama en el host compiten por RAM.

## Verificación final

- `python -m pytest -q -p no:cacheprovider`. Los tests de voz requieren Pipecat, así que hay que correrlos dentro de la imagen de voz o en un venv con `requirements-voice.txt`.
- `node --check` del script de `dashboard/dashboard.html` (sin cambios esperados).
- Flujo manual completo:
  1. `docker compose --profile voice up -d --build`.
  2. Abrir el dashboard en `:8766`, cargar los 5 `.xlsx` y descargar el snapshot.
  3. En `/demo` (`:8000`), ingresar el token y cargar el snapshot.
  4. En Asistente IA, probar «Modelo local» con las 5 sugerencias.
  5. En Asistente de voz, conectar, preguntar «¿Cuál fue el costo eléctrico de 2025?» y verificar la transcripción, la llamada `get_overview(2025)`, el audio y la desconexión.
- Al terminar, `docker compose down`.

## Decisiones abiertas

- **Resueltas (2026-10-29):** LLM de voz fijado por `.env` (OpenAI, `OPENAI_MODEL`); Whisper no aplica.
- **Idioma de voz:** solo español (recomendado, porque el dominio es es-CL) o también el selector es/en de `reference/`. Agregar el selector cambia la UI.
- **LLM de voz:** fijarlo por `.env` (recomendado) o reutilizar la elección de motor de la pestaña Asistente IA.
- **Modelo de Whisper:** `small` tiene mejor español y es más lento; `base` es más rápido. Hay que medir la latencia en el contenedor.
