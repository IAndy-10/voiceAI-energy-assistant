"""Turn on-screen notation into words a Spanish TTS voice reads naturally.

The prompt already asks the LLM to write numbers as they are pronounced, so this
is a safety net that runs on every text chunk right before TTS: if the model
copies a ``display`` value ("$427,6 M", "+7,5%", "1.234 MWh"), the user still
hears words and not symbols.  Adapted from ``voice_server/spoken.py`` on the
``feat/voice-server`` branch.
"""

from __future__ import annotations

import re

_NUM = r"-?\d{1,3}(?:\.\d{3})*(?:,\d+)?|-?\d+(?:,\d+)?"

_RULES: list[tuple[re.Pattern[str], str]] = [
    # $427,6 M / +$4,5 M / $-0,4 M → "427,6 millones de pesos"
    (re.compile(rf"([+-]?)\$\s?({_NUM})\s?M\b"), r"\1\2 millones de pesos"),
    # $12.345.678 / $100,5 → "12.345.678 pesos"
    (re.compile(rf"([+-]?)\$\s?({_NUM})"), r"\1\2 pesos"),
    (re.compile(r"\s?%"), " por ciento"),
    (re.compile(r"\s?kWh/m²"), " kilowatts hora por metro cuadrado"),
    (re.compile(r"\s?MWh\b"), " megawatts hora"),
    (re.compile(r"\s?kWh\b"), " kilowatts hora"),
    (re.compile(r"\s?kWp\b"), " kilowatts peak"),
    (re.compile(r"\s?tCO₂e|\s?tCO2e"), " toneladas de CO2 equivalente"),
    (re.compile(r"\s?m²"), " metros cuadrados"),
    (re.compile(r"\s?lm/W\b"), " lúmenes por watt"),
    (re.compile(r"\bBTU\b"), "be te u"),
    (re.compile(r"\bCLP\b"), "pesos"),
    (re.compile(r"\s?→\s?"), " a "),
    # Markdown the prompt forbids but a model may still emit
    (re.compile(r"[*_#`]+"), ""),
]
# Leading signs read badly ("+8,5"), so spell them before a number
_SIGN = re.compile(rf"(?<![\w,.])([+-])({_NUM})")


def to_spoken(text: str) -> str:
    """Rewrite symbols and units as words; numbers stay in Chilean format."""
    for pattern, repl in _RULES:
        text = pattern.sub(repl, text)
    text = _SIGN.sub(lambda m: ("más " if m.group(1) == "+" else "menos ") + m.group(2), text)
    return re.sub(r"[ \t]{2,}", " ", text)


async def spoken_transform(text: str, _text_type: object) -> str:
    """Pipecat ``TextTransform`` wrapper around :func:`to_spoken`."""
    return to_spoken(text)
