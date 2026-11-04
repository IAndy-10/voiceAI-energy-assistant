"""The shared tool contracts drive the API, the text agent and the voice agent alike."""
from energy_contracts import TOOL_NAMES, TOOLS, parameters_schema, validate_arguments
from energy_tools.tools import EnergyTools


def test_every_contract_matches_an_energy_tools_method_and_its_arguments():
    import inspect

    for name, tool in TOOLS.items():
        # The tools are wrapped by _needs_snapshot; compare against the wrapped signature.
        parameters = inspect.signature(getattr(EnergyTools, name).__wrapped__).parameters
        assert set(tool.args.model_fields) == set(parameters) - {"self", "snapshot"}, name


def test_schemas_are_compact_and_require_every_property():
    for tool in TOOLS.values():
        schema = parameters_schema(tool.args)
        assert schema["required"] == list(schema.get("properties", {}))
        text = str(schema)
        assert "title" not in text and "anyOf" not in text and "default" not in text
    month = parameters_schema(TOOLS["get_overview"].args)["properties"]["month"]
    assert month == {"maximum": 12, "minimum": 1, "type": ["integer", "null"]}


def test_validation_rejects_coercion_and_trims_text():
    assert validate_arguments("get_store", {"name": "  Parral ", "year": 2025}) == {"name": "Parral", "year": 2025}
    for bad in ({"name": "x", "year": True}, {"name": "", "year": 2025}, {"name": "x" * 121, "year": 2025}):
        try:
            validate_arguments("get_store", bad)
            raise AssertionError(bad)
        except ValueError:
            pass


def test_api_lists_the_contract_tools_in_order():
    from fastapi.testclient import TestClient
    from energy_tools import api

    assert TestClient(api.app).get("/tools").json() == {"tools": list(TOOL_NAMES)}
    assert TOOL_NAMES == ("get_overview", "get_store", "rank_stores", "get_solar", "get_chiller",
                          "get_equipment", "get_indicators", "get_data_info")
