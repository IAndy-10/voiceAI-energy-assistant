from pathlib import Path
import shutil
import subprocess


ROOT = Path(__file__).resolve().parents[1]


def test_windows_launcher_keeps_secrets_in_central_env_only():
    script = (ROOT / "scripts" / "start-voice-windows.ps1").read_text(encoding="utf-8")
    template = (ROOT / ".env.windows.example").read_text(encoding="utf-8")

    assert "Invoke-Expression" not in script
    assert "VOICE_ENERGY_API_TOKEN" not in template
    assert "OPENAI_API_KEY" not in template
    assert "VOICE_PIPELINE_ENABLED" not in template
    assert "ENERGY_TOOLS_API_TOKEN" in script
    assert "VOICE_ENERGY_API_TOKEN" in script


def test_windows_local_env_is_ignored_but_template_is_tracked():
    gitignore = (ROOT / ".gitignore").read_text(encoding="utf-8")

    assert ".env.*" in gitignore
    assert "!.env.windows.example" in gitignore


def test_windows_launcher_check_only_uses_central_values_and_rejects_conflicts(tmp_path):
    powershell = shutil.which("powershell")
    if powershell is None:
        return
    central = tmp_path / "central.env"
    windows = tmp_path / "windows.env"
    central.write_text(
        "ENERGY_TOOLS_API_TOKEN=central token with spaces\n"
        "VOICE_PIPELINE_ENABLED=false\n"
        "VOICE_SESSION_BUDGET_USD=0.20\n",
        encoding="utf-8",
    )
    windows.write_text(
        "VOICE_WINDOWS_PORT=51999\nVOICE_ENERGY_API_BASE_URL=http://127.0.0.1:8000\n",
        encoding="utf-8",
    )
    command = [
        powershell, "-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
        str(ROOT / "scripts" / "start-voice-windows.ps1"), "-CheckOnly",
        "-CentralEnvPath", str(central), "-WindowsEnvPath", str(windows),
    ]
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
    assert result.returncode == 0, result.stderr
    assert "Runner Windows: 127.0.0.1:51999" in result.stdout
    assert "central token" not in result.stdout

    windows.write_text("OPENAI_API_KEY=not-allowed\n", encoding="utf-8")
    rejected = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
    assert rejected.returncode != 0
    assert "no esta permitida" in (rejected.stderr + rejected.stdout)

    central.write_text(
        central.read_text(encoding="utf-8") + "VOICE_ENERGY_API_BASE_URL=http://central.invalid\n",
        encoding="utf-8",
    )
    windows.write_text("VOICE_ENERGY_API_BASE_URL=http://windows.invalid\n", encoding="utf-8")
    conflict = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
    assert conflict.returncode != 0
    assert "Conflicto" in (conflict.stderr + conflict.stdout)
