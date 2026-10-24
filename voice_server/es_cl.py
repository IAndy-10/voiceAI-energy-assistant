"""Chilean number formatting, matching what dashboard.html shows on screen.

The dashboard formats with ``toLocaleString('es-CL', ...)``: "." groups
thousands (also for 4-digit numbers) and "," is the decimal separator.
These helpers only format values that are already in the snapshot. They
never compute new figures.
"""

from decimal import ROUND_HALF_UP, Decimal

MONTHS_ES = [
    "", "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]


def fmt_dec(value: float, decimals: int = 0) -> str:
    """Format like ``toLocaleString('es-CL', {min/maxFractionDigits: decimals})``."""
    q = Decimal(1).scaleb(-decimals)
    d = Decimal(repr(float(value))).quantize(q, rounding=ROUND_HALF_UP)
    sign = "-" if d < 0 else ""
    int_part, _, frac = f"{abs(d):f}".partition(".")
    grouped = f"{int(int_part):,}".replace(",", ".")
    return f"{sign}{grouped},{frac}" if decimals else f"{sign}{grouped}"


def fmt_mwh(kwh: float, decimals: int = 1) -> str:
    """kWh → "2.345,6 MWh" (dashboard's ``fMWh``)."""
    return f"{fmt_dec(kwh / 1000, decimals)} MWh"


def month_list(months: list[int]) -> str:
    """[1, 2, 3, 4] → "enero, febrero, marzo y abril"."""
    names = [MONTHS_ES[m] for m in months if 1 <= m <= 12]
    if len(names) <= 1:
        return "".join(names)
    return ", ".join(names[:-1]) + " y " + names[-1]
