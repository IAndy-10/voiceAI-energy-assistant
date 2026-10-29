from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_docker_context_excludes_private_data_and_secrets():
    ignored = (ROOT / ".dockerignore").read_text(encoding="utf-8")
    for pattern in ("Datos/", "data/", "*.xlsx", "*.xls", "agent_snapshot*.json", ".env", ".env.*", ".git/", ".venv/", "__pycache__/", ".pytest_cache/"):
        assert pattern in ignored


def test_compose_binds_only_loopback_and_has_only_usage_volume():
    compose = (ROOT / "compose.yaml").read_text(encoding="utf-8")
    assert "127.0.0.1:8766:80" in compose
    assert "127.0.0.1:8000:8000" in compose
    assert "agent-usage:/var/lib/vesta-agent" in compose
    assert "Datos" not in compose
    assert "ENERGY_TOOLS_API_TOKEN" in compose
    for setting in ("OPENAI_BUDGET_USD", "OPENAI_MAX_QUERIES", "OPENAI_TIMEOUT_SECONDS", "OPENAI_MAX_TOOL_ROUNDS", "OPENAI_INPUT_USD_PER_MILLION"):
        assert setting in compose


def test_dockerfile_has_isolated_dashboard_and_api_targets():
    dockerfile = (ROOT / "Dockerfile").read_text(encoding="utf-8")
    assert "FROM nginx:1.27-alpine AS dashboard" in dockerfile
    assert "COPY dashboard/dashboard.html" in dockerfile
    assert "FROM python:3.11-slim AS energy-api" in dockerfile
    assert "requirements-runtime.txt" in dockerfile
    assert "COPY energy_tools ./energy_tools" in dockerfile
    assert "Vesta 2.0" in (ROOT / "energy_tools" / "demo.html").read_text(encoding="utf-8")
