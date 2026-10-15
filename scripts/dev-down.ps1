#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'dev-compose-context.ps1')
$composeContext = Enter-DevComposeContext -ScriptRoot $PSScriptRoot
$composeArgs = $composeContext.ComposeArgs
try {
    & docker compose @composeArgs stop
    if ($LASTEXITCODE -ne 0) { throw "docker compose stop failed with exit code $LASTEXITCODE." }
    Write-Output 'Development services stopped. Containers and named development volumes were preserved.'
}
finally {
    Exit-DevComposeContext -Context $composeContext
}
