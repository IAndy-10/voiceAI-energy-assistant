# Contrato de integración — snapshot energético

## Autoridad de los datos

`dashboard/dashboard.html` es la única autoridad de cálculo. El backend no lee Excel, no recalcula KPI ni deriva indicadores: recibe el JSON que produce `buildSnapshot()` (esquema `1.0`) y consulta sus valores precomputados.

El dashboard crea el snapshot desde `snapshotExec`, `snapshotSolar`, `snapshotChiller`, `snapshotEquip` y `snapshotIndic`; estas funciones reutilizan `computeExec`, `computeSolar`, `computeChiller`, `computeEquip` y `computeIndic` usados por la pantalla.

## Forma mínima aceptada

```json
{
  "schema_version": "1.0",
  "generator": "dashboard.html",
  "generated_at": "2026-10-25T10:00:00-03:00",
  "sources": [{"key": "costos", "file": "analisis-costos.xlsx", "rows": 583}],
  "periods": {"years": [2025, 2026], "complete_years": [2025], "partial_years": {"2026": [1, 2]}},
  "exec": {"year": 2025, "years": {"2025": {"complete": true, "months": [1], "kwh": 1, "cost_sfv": {"clp": 1, "display": "$1"}, "gd_discount": {"clp": 0, "display": "$0"}, "cost_cfv": {"clp": 1, "display": "$1"}}}},
  "stores": [],
  "rankings": {"metric_year": 2025}
}
```

Las secciones `solar`, `chiller`, `equipment` e `indicators` son opcionales, porque el dashboard las omite si no se cargó su archivo fuente. Las claves extra son toleradas para compatibilidad futura; versión distinta de `1.0`, años incoherentes, meses fuera de 1–12 y un año marcado completo/parcial a la vez se rechazan.

## Semántica de consulta

Todas las herramientas devuelven `status`, `data`, `period`, `unit`, `source` y `warnings`. Un año incluido en `partial_years` siempre agrega una advertencia explícita y no se presenta como comparable con un año completo. `rank_stores` sigue los arreglos precomputados de `rankings`; no ordena usando cálculos propios.

Las fuentes se devuelven solo como metadatos del snapshot (nombre y estructura), nunca como archivos Excel ni contenido de filas.
