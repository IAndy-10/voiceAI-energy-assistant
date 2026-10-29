param(
    [switch]$Force
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot '.env.turn.local'
$configPath = Join-Path $projectRoot 'voice_agent/turnserver.local.conf'

if ((Test-Path -LiteralPath $envPath) -or (Test-Path -LiteralPath $configPath)) {
    if (-not $Force) {
        throw 'TURN local configuration already exists. Use -Force only to rotate the local development secret.'
    }
}

$randomBytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($randomBytes)
$turnSecret = [Convert]::ToBase64String($randomBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')

Set-Content -LiteralPath $envPath -NoNewline -Value "TURN_SHARED_SECRET=$turnSecret`n"
Set-Content -LiteralPath $configPath -NoNewline -Value @"
listening-port=3478
listening-ip=0.0.0.0
relay-ip=0.0.0.0
external-ip=host.docker.internal
min-port=49160
max-port=49169
realm=vesta.local
use-auth-secret
static-auth-secret=$turnSecret
fingerprint
no-tls
no-dtls
no-cli
no-multicast-peers
log-file=stdout
simple-log
"@

Write-Output 'Created local TURN configuration. The shared secret was not displayed.'
