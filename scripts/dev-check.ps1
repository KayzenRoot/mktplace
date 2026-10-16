#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$instanceBytes = [byte[]]::new(6)
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($instanceBytes) }
finally { $rng.Dispose() }
$testInstanceId = [System.BitConverter]::ToString($instanceBytes).Replace('-', '').ToLowerInvariant()

. (Join-Path $PSScriptRoot 'dev-compose-context.ps1')
$composeContext = Enter-DevComposeContext -ScriptRoot $PSScriptRoot -InstanceId $testInstanceId -TestProfile
$composeArgs = $composeContext.ComposeArgs
$composeConfigured = $false
try {
    try {
        & docker compose @composeArgs build test
        if ($LASTEXITCODE -ne 0) { throw "docker compose build test failed with exit code $LASTEXITCODE." }
        $composeConfigured = $true

        & docker compose @composeArgs up --detach --wait postgres-test
        if ($LASTEXITCODE -ne 0) { throw "Could not start isolated test PostgreSQL (exit code $LASTEXITCODE)." }

        & docker compose @composeArgs run --rm --no-deps test
        $testExitCode = $LASTEXITCODE
        if ($testExitCode -ne 0) { throw "Container checks failed with exit code $testExitCode." }
    }
    finally {
        if ($composeConfigured) {
            & docker compose @composeArgs down --rmi local --remove-orphans
            if ($LASTEXITCODE -ne 0) { throw "Could not clean up this isolated test Compose project (exit code $LASTEXITCODE)." }
        }
    }
}
finally {
    Exit-DevComposeContext -Context $composeContext
}
