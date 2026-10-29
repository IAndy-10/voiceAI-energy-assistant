# VESTA 2.0 — M01: herramientas de datos energéticos

## Alcance

Este módulo implementa consultas locales de solo lectura sobre el snapshot que exporta el dashboard. No modifica `dashboard/dashboard.html`, no procesa Excel en el servidor, no incorpora Pipecat/Twilio, no persiste datos y no llama a OpenAI.

Los archivos privados de `Datos/` permanecen ignorados por Git mediante `/Datos/`, `*.xlsx` y `*.xls`. Genere el snapshot en el navegador con **Descargar snapshot**; no lo agregue al repositorio (`agent_snapshot*.json` también está ignorado).

## Auditoría de fuentes (solo estructura)

Se inspeccionaron los cinco libros sin copiar ni registrar sus filas. El dashboard usa las siguientes hojas como entradas:

| Libro | Hojas detectadas | Hojas que consume el dashboard |
|---|---:|---|
| `analisis-costos.xlsx` | 2 | primera hoja (`Sheet1`) |
| `analisis-equipos.xlsx` | 4 | primera hoja (`bbdd`) |
| `analisis-proyectos-solares.xlsx` | 6 | `proyectos_solares`, `inyeccion_anual`, `inversion_payback` |
| `analisis-costos-chiller.xlsx` | 1 | primera hoja (`Sheet1`) |
| `analisis-indicadores-globales.xlsx` | 5 | `tiendas`, `indicadores` |

El contrato real se produce en `buildSnapshot()` y declara proveniencia como `sources[].file`, `sources[].sheets` y `sources[].rows`; no contiene los Excel originales. La guía de arquitectura anterior muestra un ejemplo histórico distinto, por lo que el contrato vigente es [`INTEGRATION-CONTRACT.md`](INTEGRATION-CONTRACT.md).

## Instalación y ejecución (Windows PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:ENERGY_TOOLS_API_TOKEN = "cambie-esta-clave-por-una-segura"
python -m uvicorn energy_tools.api:app --host 127.0.0.1 --port 8000
```

El servicio mantiene el snapshot solo en memoria: reiniciarlo borra la copia cargada. El token es obligatorio por defecto para `/snapshot` y endpoints que devuelven datos; `/health` y `/tools` no exponen cifras.

## Cargar y consultar

```powershell
$headers = @{ Authorization = "Bearer $env:ENERGY_TOOLS_API_TOKEN" }
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/snapshot -Headers $headers -ContentType "application/json" -InFile .\agent_snapshot.json
Invoke-RestMethod -Uri "http://127.0.0.1:8000/energy/overview?year=2025" -Headers $headers
Invoke-RestMethod -Uri "http://127.0.0.1:8000/energy/stores/ranking?metric=cost&order=desc&top_n=5" -Headers $headers
```

Las seis herramientas Python para un futuro agente son:

- `get_overview(year)`
- `get_store(name, year)`
- `rank_stores(metric, order, top_n)`
- `get_solar(plant)`
- `get_chiller(year)`
- `get_data_info()`

Los endpoints disponibles son `GET /health`, `GET /tools`, `POST /snapshot`, `GET /energy/overview`, `GET /energy/stores/ranking`, `GET /energy/stores/{name}`, `GET /energy/solar`, `GET /energy/chiller`, `GET /energy/data-info` y `GET /demo`. La demostración web no contiene cifras: pide el token local y consulta esos endpoints.

## Pruebas

```powershell
python -m pytest -q
```

Las pruebas usan snapshots sintéticos; no leen ni muestran datos privados. Cubren validación, años parciales, alias/sucursal inexistente, datos opcionales, rankings deterministas y autenticación.
