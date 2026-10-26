# VESTA 2.0 — M02.1: demostración local con Docker

## Seguridad del entorno

Los servicios se publican únicamente en `127.0.0.1`. No hay bind mounts y las reglas de `.dockerignore` excluyen Excel, `Datos/`, snapshots, secretos, Git y entornos locales. El dashboard se incorpora desde `dashboard/dashboard.html`; la API incorpora sólo `energy_tools/` y sus dependencias. Por tanto, los contenedores no contienen datos privados antes de que una persona importe un snapshot en memoria.

El snapshot se mantiene sólo en memoria de `energy-api`; se pierde al reiniciar o detener el contenedor. Nunca copie un token real a `compose.yaml`, `Dockerfile` ni Git.

## Levantar la demo (PowerShell)

```powershell
# Desde la raíz del repositorio
$env:ENERGY_TOOLS_API_TOKEN = "use-una-clave-local-larga-y-unica"
docker compose config
docker compose up -d --build
docker compose ps
```

Si su instalación sólo expone el binario clásico, reemplace `docker compose` por `docker-compose` en esos comandos.

Abra:

- Dashboard: `http://127.0.0.1:8766/dashboard.html`
- Estado: `http://127.0.0.1:8000/health`
- OpenAPI local: `http://127.0.0.1:8000/docs`
- Lanzador de consultas: `http://127.0.0.1:8000/demo`

## Flujo de demostración

1. Abra el dashboard y seleccione manualmente los cinco archivos `.xlsx` de `Datos/`. Los archivos se procesan en el navegador y nunca se montan ni suben a los contenedores.
2. Pulse **Ver Dashboard** y revise los KPI.
3. Pulse **Descargar snapshot**. El archivo `agent_snapshot.json` queda en su carpeta local de descargas y está ignorado por Git.
4. Importe el snapshot en la API local:

```powershell
$headers = @{ Authorization = "Bearer $env:ENERGY_TOOLS_API_TOKEN" }
$snapshot = "$env:USERPROFILE\Downloads\agent_snapshot.json"
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/snapshot `
  -Headers $headers -ContentType "application/json" -InFile $snapshot
```

5. Abra `/demo`, escriba la misma clave en **Token Bearer** y ejecute las consultas predefinidas. Las cifras se solicitan a la API con `Authorization: Bearer`; la página no contiene datos del cliente.
6. Para validar localmente el contrato y las seis herramientas sin imprimir cifras:

```powershell
.\.venv\Scripts\python.exe .\scripts\validate_real_snapshot.py $snapshot
```

7. Al finalizar, elimine el estado en memoria deteniendo los contenedores:

```powershell
docker compose down
```

## Validación esperada

```powershell
docker compose config
docker compose build
docker compose up -d
docker compose ps
Invoke-WebRequest http://127.0.0.1:8766/dashboard.html
Invoke-WebRequest http://127.0.0.1:8000/health
Invoke-WebRequest http://127.0.0.1:8000/docs
Invoke-WebRequest http://127.0.0.1:8000/demo
python -m pytest -q
```
