# VESTA 2.0 — M03: agente conversacional OpenAI

## Alcance y arquitectura

`POST /agent/chat` usa la Responses API con **solamente** seis funciones locales permitidas. El modelo solicita una función; Vesta valida sus argumentos con Pydantic, ejecuta `EnergyTools` y devuelve un `function_call_output` compacto al modelo. No existen herramientas web, de archivos, código ni MCP. El snapshot y los Excel nunca se envían completos al proveedor.

Las respuestas se crean con `store=false`. La secuencia sigue el flujo de function calling oficial: solicitud, llamada de función, ejecución local, entrega de resultado y respuesta final. [OpenAI Function Calling](https://developers.openai.com/api/docs/guides/function-calling) documenta ese flujo; [OpenAI Responses](https://developers.openai.com/api/docs/guides/conversation-state) documenta que `store=false` evita el almacenamiento predeterminado de respuestas.

## Endpoint

```json
POST /agent/chat
Authorization: Bearer <ENERGY_TOOLS_API_TOKEN>
{"question": "¿Cuál fue el costo eléctrico en 2025?"}
```

La respuesta devuelve `answer`, `sources`, `periods`, `warnings`, `tools_used` y uso de tokens/costo estimado. `GET /agent/status` muestra activación, modelo y contador local, pero no preguntas ni contenidos de herramientas.

## Activación manual

Por defecto el agente está desactivado y ninguna prueba llama a OpenAI.

```powershell
$env:OPENAI_ENABLED = "true"
$env:OPENAI_API_KEY = "<clave-creada-en-la-plataforma>"
$env:OPENAI_MODEL = "gpt-6-luna"
$env:OPENAI_BUDGET_USD = "2.00"
$env:OPENAI_MAX_QUERIES = "20"
$env:ENERGY_TOOLS_API_TOKEN = "<clave-local>"
docker compose up -d --build
```

`gpt-6-luna` es el valor por defecto configurable, elegido por su perfil actual de costo/alto volumen y soporte de funciones. Sus tarifas por defecto (US$0,10 entrada y US$0,50 salida por millón de tokens) están expuestas como variables para que se revisen antes de activar. Consulte las [tarifas oficiales](https://developers.openai.com/api/docs/pricing) al activar: cambian con el tiempo.

## Límites y privacidad

- Máximo 20 consultas, 300 tokens de salida, dos rondas de herramientas y seis llamadas por solicitud de forma predeterminada.
- Antes de la solicitud se reserva conservadoramente presupuesto local; un lock evita excederlo por concurrencia. Se persisten sólo contadores/tokens/USD en el volumen `agent-usage`.
- El proveedor puede facturar una cantidad distinta de la estimación (por tokens internos o cambios de tarifa). Por ello el ledger es una barrera local conservadora, no una garantía contractual frente a la facturación externa.
- La clave nunca llega al frontend, y no se registran preguntas, respuestas ni datos del cliente.

## Pruebas e integración futura

Las pruebas mockean el cliente OpenAI para cubrir allowlist, validación, ausencia de snapshot, desactivación, clave ausente, límites, timeout, concurrencia y persistencia. Pipecat/Twilio puede llamar más adelante a `VestaAgent.chat()` sin modificar sus herramientas energéticas.

## Configuración y comandos adicionales

Antes de activar, cree una clave de proyecto restringida en OpenAI Platform y defina allí un límite de gasto acorde al presupuesto operativo. Guarde la clave sólo en la sesión de PowerShell o en un `.env` local ignorado por Git; nunca en `compose.yaml`, código, HTML ni snapshot.

| Variable | Valor inicial | Propósito |
| --- | --- | --- |
| `OPENAI_ENABLED` | `false` | Bloquea cualquier llamada hasta activación explícita. |
| `OPENAI_API_KEY` | — | Clave de servidor; no se expone al navegador. |
| `OPENAI_MODEL` | `gpt-6-luna` | Modelo configurable compatible con function calling. |
| `OPENAI_BUDGET_USD` | `2.00` | Tope local inicial de M03. |
| `OPENAI_MAX_QUERIES` | `20` | Máximo de chats completados. |
| `OPENAI_MAX_OUTPUT_TOKENS` | `300` | Límite de salida por respuesta. |
| `OPENAI_MAX_INPUT_TOKENS` | `4000` | Acota entrada y salida de herramienta. |
| `OPENAI_TIMEOUT_SECONDS` | `20` | Timeout del SDK. |
| `OPENAI_MAX_TOOL_ROUNDS` / `OPENAI_MAX_TOOL_CALLS` | `2` / `6` | Límites de orquestación local. |
| `OPENAI_*_USD_PER_MILLION` | `0.10` / `0.50` | Tarifas configurables para estimar costo. |

Para desarrollo sin Docker:

```powershell
$env:ENERGY_TOOLS_API_TOKEN = "<clave-local>"
$env:OPENAI_ENABLED = "false"
.\.venv\Scripts\uvicorn.exe energy_tools.api:app --host 127.0.0.1 --port 8000
```

Después de cargar un snapshot autenticado, abra `http://127.0.0.1:8000/demo`, ingrese el token y active el agente sólo cuando haya configurado conscientemente las variables anteriores.

## Pruebas

```powershell
.\.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider
```

La suite usa un cliente OpenAI simulado: no requiere clave ni crea solicitudes al proveedor. Cubre selección/allowlist, argumentos inválidos, snapshot ausente, autenticación, apagado, clave ausente, presupuesto, concurrencia, timeout, error de cuota simulado, contador persistente, regresiones y texto malicioso dentro de la salida de herramientas.

## Despliegue local M03.2

`compose.yaml` entrega a `energy-api` todas las variables de límite, presupuesto, timeout, rondas y tarifas. Docker Compose lee `.env` para interpolarlas, pero `.env` está ignorado y debe contener manualmente `ENERGY_TOOLS_API_TOKEN` y `OPENAI_API_KEY`; nunca se debe copiar una clave a este documento o al código.

El modelo inicial es `gpt-6-luna`. Sus tarifas estándar configuradas son US$0,10/M de entrada y US$0,50/M de salida. Para cambiar de modelo deben definirse explícitamente ambas variables de tarifa: el backend marca la configuración como inválida si el modelo no tiene tarifa conocida, evitando estimaciones artificialmente bajas.

Para actualizar sólo la API, sin tocar el contenedor del dashboard:

```powershell
docker compose up -d --build --no-deps energy-api
```

La imagen copia todo `energy_tools/`, incluido `demo.html`. `/demo` responde `Cache-Control: no-store`, por lo que tras reconstruir no debería mostrarse HTML anterior. La recreación de `energy-api` preserva el volumen del ledger, pero pierde el snapshot en memoria: cárguelo nuevamente desde la interfaz.
