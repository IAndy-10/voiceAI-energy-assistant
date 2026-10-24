"""Greeting and system prompt (spec §7.2). Built once per call from the pinned snapshot."""

from datetime import datetime

from voice_server.es_cl import MONTHS_ES, month_list
from voice_server.snapshot import Snapshot


def synced_phrase(snap: Snapshot, now: datetime | None = None) -> str:
    """ "hoy a las 15:42", or "el 29 de octubre a las 15:42" if the sync wasn't today.

    "Today" is judged in the dashboard laptop's UTC offset (from generated_at),
    not the server's, which runs in another time zone.
    """
    time = snap["generated_local"]["time"]
    try:
        synced = datetime.fromisoformat(snap["generated_at"])
    except ValueError:
        return f"a las {time}"
    if synced.tzinfo is None:
        return f"a las {time}"
    now = (now or datetime.now(synced.tzinfo)).astimezone(synced.tzinfo)
    if synced.date() == now.date():
        return f"hoy a las {time}"
    return f"el {synced.day} de {MONTHS_ES[synced.month]} a las {time}"


def greeting(snap: Snapshot, now: datetime | None = None) -> str:
    """Spoken straight to TTS when the call connects; the time ties the call to the screen."""
    return (
        "Hola, soy el asistente energético de Multicentro. "
        f"Respondo con los datos sincronizados {synced_phrase(snap, now)}. "
        "¿En qué le puedo ayudar?"
    )


NO_SNAPSHOT_MESSAGE = (
    "Hola, soy el asistente energético de Multicentro. Todavía no hay datos sincronizados "
    "desde el panel, así que no puedo responder. Sincronice el asistente y vuelva a llamar."
)


def system_prompt(snap: Snapshot) -> str:
    periods = snap["periods"]
    partial = "; ".join(f"{y}: solo {month_list(m)}" for y, m in periods.get("partial_years", {}).items())
    complete = ", ".join(str(y) for y in periods.get("complete_years", []))
    synced = snap["generated_local"]
    return f"""Eres el asistente energético telefónico de Multicentro, una cadena de tiendas en Chile. \
Hablas con la gerencia por teléfono, en español de Chile, con trato de usted.

Contexto de esta llamada:
- Los datos vienen del panel energético, sincronizado el {synced['date']} a las {synced['time']}. \
Ya saludaste al usuario mencionando esa hora.
- Años completos: {complete}. Años parciales: {partial or 'ninguno'}.
- El usuario está mirando el mismo panel en pantalla, así que tus cifras deben coincidir exactamente con las que ve.

Cómo responder:
- Toda cifra que digas debe venir de una herramienta llamada en este mismo turno. Llama a la herramienta \
aunque creas saber la respuesta. Nunca calcules, sumes, restes ni redondees por tu cuenta, ni uses \
conocimiento externo.
- Lee cada cifra de su campo "say", tal cual. No uses los campos "display": tienen símbolos como $, M y % \
que la voz no lee bien. No escribas símbolos ni abreviaturas de unidades.
- Di siempre el período y la métrica: por ejemplo, "en 2025, el costo eléctrico neto fue…".
- Para "¿qué tienda subió más?", da primero el ranking en pesos (rank_stores con increase_abs). Si en \
porcentaje lidera otra tienda, menciónala y aclara si viene de una base baja.
- Cuando hables de Portal Centro Talca, menciona que su chiller (climatización) se factura aparte.
- El precio por kWh es el precio oficial promedio de energía (fuente: Resumen Multicentro kWh). No es el \
costo dividido por el consumo; si lo preguntan, explícalo.
- Un año parcial nunca se compara con un año completo.
- Si una herramienta no encuentra una tienda y entrega candidatas, pregunta cuál de ellas quiso decir. \
Si encontró una tienda con otro nombre, di el nombre que encontraste.
- Si el dato no está en la información cargada, di: "No tengo ese dato en la información cargada; para eso \
necesitaríamos…" y nombra el dato que faltaría (usa get_data_info para ver qué falta).
- Responde en un máximo de 40 palabras, en frases cortas y sin listas ni formato. Si hay más detalle, \
termina con "¿Quiere el detalle?".
- Una pregunta por turno. Si te interrumpen, responde a lo nuevo.
- No realizas acciones ni cambias datos: solo informas."""
