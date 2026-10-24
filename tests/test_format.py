import pytest

from voice_server.es_cl import fmt_dec, fmt_mwh, month_list
from voice_server.spoken import to_spoken


@pytest.mark.parametrize(("value", "decimals", "expected"), [
    (1234.0, 0, "1.234"),          # es-CL groups 4-digit numbers
    (2345.6, 1, "2.345,6"),
    (150.3, 1, "150,3"),
    (100.5, 1, "100,5"),
    (0.25, 1, "0,3"),              # half up, like toLocaleString
    (-0.4, 1, "-0,4"),
    (12345678, 0, "12.345.678"),
    (117, 1, "117,0"),
])
def test_fmt_dec_matches_dashboard(value, decimals, expected):
    assert fmt_dec(value, decimals) == expected


def test_fmt_mwh_and_months():
    assert fmt_mwh(2345649) == "2.345,6 MWh"
    assert month_list([1, 2, 3, 4]) == "enero, febrero, marzo y abril"
    assert month_list([5]) == "mayo"


@pytest.mark.parametrize(("text", "expected"), [
    ("Costó $123,4 M en 2025.", "Costó 123,4 millones de pesos en 2025."),
    ("Subió +$4,5 M.", "Subió más 4,5 millones de pesos."),
    ("Neto $-0,4 M", "Neto menos 0,4 millones de pesos"),
    ("Creció +7,5% y bajó -3,2%", "Creció más 7,5 por ciento y bajó menos 3,2 por ciento"),
    ("Consumo 1.234 MWh", "Consumo 1.234 megawatts hora"),
    ("Precio $100,5 por kWh", "Precio 100,5 pesos por kilowatts hora"),
    ("150,3 kWp", "150,3 kilowatts peak"),
    ("98,7 kWh/m²", "98,7 kilowatts hora por metro cuadrado"),
    ("El total fue $12.345.678", "El total fue 12.345.678 pesos"),
    ("periodo 2024-2025", "periodo 2024-2025"),
])
def test_to_spoken(text, expected):
    assert to_spoken(text) == expected


def test_to_spoken_leaves_plain_say_strings_alone():
    say = "123,4 millones de pesos, más 7,5 por ciento"
    assert to_spoken(say) == say
