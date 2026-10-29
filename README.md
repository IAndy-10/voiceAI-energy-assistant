# Vesta 2.0 · asistente de inteligencia energética

Vesta 2.0 es una demostración local de inteligencia energética para retail. Conserva el dashboard original de Ítalo, que procesa Excel privados en el navegador, y agrega una API FastAPI con consultas deterministas sobre el snapshot generado por ese dashboard.

La telefonía Twilio/Pipecat sigue fuera de alcance. La capa de agentes queda preparada para una integración posterior sin alterar el dashboard ni sus cálculos.

## Arquitectura

    Excel privados locales → dashboard/dashboard.html → snapshot JSON validado
                                                    ↓
                                         FastAPI Energy Tools
                                          ├─ consultas locales
                                          └─ agente OpenAI opcional

El backend sólo consulta valores ya calculados por el dashboard: no lee Excel, no crea una base de datos y no deriva indicadores.

## Requisitos

- Docker Desktop con Docker Compose, o Python 3.11.
- Un token local para la API (ENERGY_TOOLS_API_TOKEN).
- Excel y snapshots privados en Datos/, fuera de Git.
- OpenAI opcional: configure OPENAI_API_KEY sólo en .env local y sólo cuando esté autorizado.

## Inicio rápido

1. Cree .env desde .env.example y defina un token local único. No lo suba a Git.
2. Mantenga OPENAI_ENABLED=false para una demo sin proveedor.
3. Inicie los servicios:

       docker compose up -d --build

4. Abra el dashboard en http://127.0.0.1:8766/dashboard.html y la demo en http://127.0.0.1:8000/demo.
5. En **Datos y accesos**, ingrese el token, elija el JSON descargado desde el dashboard y pulse **Cargar snapshot**.

El snapshot vive sólo en memoria: tras recrear energy-api debe cargarse otra vez. El volumen agent-usage conserva sólo contadores de uso y costo.

## Modos de consulta

- **Consultas locales · Sin OpenAI**: usa un intérprete determinista y Energy Tools; no envía datos a proveedores externos.
- **Usar OpenAI**: requiere servidor configurado y activación voluntaria en **Asistente IA**. Sólo se permiten seis tools con Pydantic y allowlist.

Las tools son get_overview, get_store, rank_stores, get_solar, get_chiller y get_data_info.

## Variables y pruebas

.env.example contiene sólo nombres y valores seguros. Las variables principales son ENERGY_TOOLS_API_TOKEN, OPENAI_ENABLED, OPENAI_API_KEY, OPENAI_MODEL, OPENAI_BUDGET_USD y límites de tokens, timeout, rondas y tarifas.

No comparta salida de docker compose config con una configuración real: Compose puede expandir variables.

    .\.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider
    .\.venv\Scripts\python.exe -m compileall -q energy_tools tests

Las pruebas usan OpenAI simulado y no consumen tokens.

## Privacidad y estado

- No versionar .env, Datos/, data/, Excel, snapshots ni claves API.
- No enviar Excel completos ni snapshots completos a un LLM.
- Los servicios se exponen sólo en 127.0.0.1.
- El presupuesto local es preventivo, no una garantía contractual de facturación.
- Antes de uso real, confirme autorización sobre los datos y rote cualquier clave expuesta.

Consulte [seguridad y UX M03.7](docs/M03.7-SECURITY-UX.md), el [contrato del snapshot](docs/INTEGRATION-CONTRACT.md), la [cobertura de datos](docs/M03.5-DATA-COVERAGE.md) y la especificación original en [docs/multicentro_energy_manager_demo_spec.md](docs/multicentro_energy_manager_demo_spec.md).
