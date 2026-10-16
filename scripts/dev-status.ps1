#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'dev-compose-context.ps1')
$composeContext = Enter-DevComposeContext -ScriptRoot $PSScriptRoot
$composeArgs = $composeContext.ComposeArgs
try {
    & docker compose @composeArgs ps --all
    if ($LASTEXITCODE -ne 0) { throw "docker compose ps failed with exit code $LASTEXITCODE." }
}
finally {
    Exit-DevComposeContext -Context $composeContext
}
