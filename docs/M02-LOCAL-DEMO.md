# VESTA 2.0 — M02: demostración local

## Procedimiento reproducible

1. Abra `http://127.0.0.1:8766/dashboard/dashboard.html` desde un servidor local y cargue los cinco Excel de `Datos/`.
2. Confirme los cinco indicadores ✓ y pulse **Ver Dashboard**.
3. Revise los KPI en el dashboard y pulse **Descargar snapshot**. El archivo resultante (`agent_snapshot.json`) permanece local e ignorado por Git.
4. Valide el archivo y sus seis herramientas sin enviarlo a ningún servicio:

```powershell
.\.venv\Scripts\python.exe .\scripts\validate_real_snapshot.py "$env:USERPROFILE\Downloads\agent_snapshot.json"
```

5. En otra consola, inicie la API, cargue ese snapshot y abra `http://127.0.0.1:8000/demo`.

La interfaz muestra indicadores amigables por consulta, advertencias destacadas y una sección colapsable **Ver respuesta técnica JSON** para revisión técnica. El token se mantiene sólo en memoria de la pestaña.

### PowerShell

```powershell
# Terminal 1: servir sólo el dashboard local
.\.venv\Scripts\python.exe -m http.server 8766 --bind 127.0.0.1
# Abrir http://127.0.0.1:8766/dashboard/dashboard.html
```

Después de cargar los cinco libros y descargar el snapshot:

```powershell
# Terminal 2: API local (no usar una clave de producción en esta demo)
$env:ENERGY_TOOLS_API_TOKEN = "una-clave-local-larga"
.\.venv\Scripts\python.exe -m uvicorn energy_tools.api:app --host 127.0.0.1 --port 8000
```

```powershell
# Terminal 3: importar y validar el archivo descargado
$headers = @{ Authorization = "Bearer $env:ENERGY_TOOLS_API_TOKEN" }
$snapshot = "$env:USERPROFILE\Downloads\agent_snapshot.json"
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/snapshot -Headers $headers -ContentType "application/json" -InFile $snapshot
.\.venv\Scripts\python.exe .\scripts\validate_real_snapshot.py $snapshot
# Abrir http://127.0.0.1:8000/demo e ingresar la misma clave local.
```

## Contraste de pantalla

El contraste se limita a los textos visibles que entrega el dashboard y a los campos precomputados que exporta. Para la corrida M02 se verifican como mínimo: costo C/FV actual y previo, costo S/FV actual y previo, descuento GD actual y previo, consumo actual y previo, variación de costo, variación de consumo, precio oficial actual y variación de precio. Los valores no se registran en este documento porque son confidenciales; el script reporta sólo el conteo de verificaciones.

## Hallazgos que requieren aprobación

- Los períodos indicados como parciales no son comparables con un año completo; la API devuelve advertencia.
- El dashboard declara que el chiller de Portal Centro Talca se factura aparte de la electricidad.
- Los datos de ventas, flujo de clientes y horas reales de operación no están disponibles.
- Plantas solares marcadas `REVISAR`, bases pequeñas y superficies faltantes deben conservar sus advertencias del snapshot y requerir validación del dueño de datos.
