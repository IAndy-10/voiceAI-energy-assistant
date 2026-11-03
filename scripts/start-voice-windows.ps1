[CmdletBinding()]
param(
    [switch]$CheckOnly,
    [string]$CentralEnvPath,
    [string]$WindowsEnvPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Read-DotenvFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    $values = [ordered]@{}
    $lineNumber = 0
    foreach ($line in [System.IO.File]::ReadLines($Path)) {
        $lineNumber++
        $trimmed = $line.Trim()
        if ($trimmed.Length -eq 0 -or $trimmed.StartsWith('#')) { continue }
        $match = [regex]::Match($line, '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$')
        if (-not $match.Success) {
            throw "Formato dotenv no admitido en $Path linea $lineNumber."
        }
        $name = $match.Groups[1].Value
        if ($values.Contains($name)) { throw "Variable duplicada en ${Path}: $name." }
        $value = $match.Groups[2].Value
        if ($value.Length -ge 2 -and (($value[0] -eq '"' -and $value[$value.Length - 1] -eq '"') -or ($value[0] -eq "'" -and $value[$value.Length - 1] -eq "'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        # Values are data, not PowerShell: no expansion or code evaluation occurs.
        $values[$name] = $value
    }
    return $values
}

function Get-RequiredValue {
    param([System.Collections.IDictionary]$Values, [string]$Name)
    if (-not $Values.Contains($Name) -or [string]::IsNullOrWhiteSpace([string]$Values[$Name])) {
        throw "Falta la variable requerida $Name en .env."
    }
    return [string]$Values[$Name]
}

function Get-OptionalValue {
    param([System.Collections.IDictionary]$Values, [string]$Name, [string]$Default)
    if (-not $Values.Contains($Name) -or [string]::IsNullOrWhiteSpace([string]$Values[$Name])) { return $Default }
    return [string]$Values[$Name]
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if ([string]::IsNullOrWhiteSpace($CentralEnvPath)) { $CentralEnvPath = Join-Path $repoRoot '.env' }
if ([string]::IsNullOrWhiteSpace($WindowsEnvPath)) { $WindowsEnvPath = Join-Path $repoRoot '.env.windows.local' }
$CentralEnvPath = [System.IO.Path]::GetFullPath($CentralEnvPath)
$WindowsEnvPath = [System.IO.Path]::GetFullPath($WindowsEnvPath)

if (-not (Test-Path -LiteralPath $CentralEnvPath -PathType Leaf)) {
    throw "No se encontro .env central. Creelo desde .env.example sin publicar credenciales."
}

$central = Read-DotenvFile -Path $CentralEnvPath
$effective = [ordered]@{}
foreach ($entry in $central.GetEnumerator()) { $effective[$entry.Key] = $entry.Value }

$allowedWindows = @(
    'VOICE_ENERGY_API_BASE_URL',
    'VOICE_WINDOWS_HOST',
    'VOICE_WINDOWS_PORT',
    'VOICE_WINDOWS_ALLOWED_ORIGINS'
)
$windowsFound = Test-Path -LiteralPath $WindowsEnvPath -PathType Leaf
if ($windowsFound) {
    $windows = Read-DotenvFile -Path $WindowsEnvPath
    foreach ($entry in $windows.GetEnumerator()) {
        if ($allowedWindows -notcontains $entry.Key) {
            throw "La variable $($entry.Key) no esta permitida en .env.windows.local."
        }
        if ($effective.Contains($entry.Key) -and $effective[$entry.Key] -ne $entry.Value) {
            throw "Conflicto para $($entry.Key): definala una sola vez, no como override Windows."
        }
        $effective[$entry.Key] = $entry.Value
    }
}

# Defaults are intentionally limited to Windows transport paths, never credentials.
if (-not $effective.Contains('VOICE_ENERGY_API_BASE_URL')) { $effective['VOICE_ENERGY_API_BASE_URL'] = 'http://127.0.0.1:8000' }
if (-not $effective.Contains('VOICE_WINDOWS_HOST')) { $effective['VOICE_WINDOWS_HOST'] = '127.0.0.1' }
if (-not $effective.Contains('VOICE_WINDOWS_PORT')) { $effective['VOICE_WINDOWS_PORT'] = '7861' }
if (-not $effective.Contains('VOICE_WINDOWS_ALLOWED_ORIGINS')) { $effective['VOICE_WINDOWS_ALLOWED_ORIGINS'] = 'http://127.0.0.1:8000' }

$pipelineEnabled = (Get-OptionalValue -Values $effective -Name 'VOICE_PIPELINE_ENABLED' -Default 'false').Trim().ToLowerInvariant() -eq 'true'
[void](Get-RequiredValue -Values $effective -Name 'ENERGY_TOOLS_API_TOKEN')
if ($pipelineEnabled) { [void](Get-RequiredValue -Values $effective -Name 'OPENAI_API_KEY') }

$python = Join-Path $repoRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $python -PathType Leaf)) { throw "No se encontro $python." }
try { $port = [int]$effective['VOICE_WINDOWS_PORT'] } catch { throw 'VOICE_WINDOWS_PORT debe ser un entero.' }
if ($port -lt 1 -or $port -gt 65535) { throw 'VOICE_WINDOWS_PORT debe estar entre 1 y 65535.' }
$listeners = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
if ($listeners.Port -contains $port) { throw "El puerto $port ya esta en uso; detenga el runner anterior o elija otro puerto Windows." }

Write-Host 'Configuracion central: encontrada'
if ($windowsFound) { Write-Host 'Configuracion Windows: encontrada' } else { Write-Host 'Configuracion Windows: no requerida (se usan valores locales seguros)' }
Write-Host "Runner Windows: $($effective['VOICE_WINDOWS_HOST']):$port"
Write-Host "Energy API: $($effective['VOICE_ENERGY_API_BASE_URL'])"
if ($pipelineEnabled) { Write-Host 'Pipeline de voz OpenAI: permitido; credencial presente' } else { Write-Host 'Pipeline de voz OpenAI: bloqueado; no se requiere clave OpenAI' }
Write-Host "Presupuesto por sesion: $(Get-OptionalValue -Values $effective -Name 'VOICE_SESSION_BUDGET_USD' -Default '0.20') USD"
if ($CheckOnly) { return }

# Explicitly replace every runner-controlled inherited value while this script runs,
# then restore the caller process when the child runner exits.
$managedNames = @($effective.Keys) + @('VOICE_ENERGY_API_TOKEN')
$before = @{}
foreach ($name in $managedNames) {
    $previous = [Environment]::GetEnvironmentVariable($name, 'Process')
    $before[$name] = $previous
    [Environment]::SetEnvironmentVariable($name, $null, 'Process')
}
try {
    foreach ($entry in $effective.GetEnumerator()) {
        [Environment]::SetEnvironmentVariable($entry.Key, [string]$entry.Value, 'Process')
    }
    # FastAPI uses ENERGY_TOOLS_API_TOKEN; Pipecat uses this explicit process-only alias.
    [Environment]::SetEnvironmentVariable('VOICE_ENERGY_API_TOKEN', [string]$effective['ENERGY_TOOLS_API_TOKEN'], 'Process')
    $origins = @(([string]$effective['VOICE_WINDOWS_ALLOWED_ORIGINS']).Split(',', [System.StringSplitOptions]::RemoveEmptyEntries) | ForEach-Object { $_.Trim() })
    if ($origins.Count -eq 0) { throw 'VOICE_WINDOWS_ALLOWED_ORIGINS no puede estar vacio.' }
    & $python -m voice_agent.webrtc_runner -t webrtc --host $effective['VOICE_WINDOWS_HOST'] --port $port --allowed-origins $origins
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    foreach ($name in $managedNames) {
        [Environment]::SetEnvironmentVariable($name, $before[$name], 'Process')
    }
}
