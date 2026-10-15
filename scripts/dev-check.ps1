#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$composeEnvironmentKeys = @(
    'APP_PORT'
    'MKTPLACE_DOCKER_INSTANCE_ID'
    'POSTGRES_DB'
    'POSTGRES_USER'
    'POSTGRES_PASSWORD'
    'TEST_POSTGRES_DB'
    'TEST_POSTGRES_USER'
    'TEST_POSTGRES_PASSWORD'
    'WATCHPACK_POLLING'
    'CHOKIDAR_USEPOLLING'
    'COMPOSE_PROFILES'
    'COMPOSE_PROJECT_NAME'
)
$previousComposeEnvironment = @{}
foreach ($key in $composeEnvironmentKeys) {
    $previousComposeEnvironment[$key] = [System.Environment]::GetEnvironmentVariable($key, 'Process')
}
$previousLockfileHash = [System.Environment]::GetEnvironmentVariable('MKTPLACE_DEV_LOCKFILE_HASH', 'Process')
$composeArgs = $null
$composeConfigured = $false
Push-Location $repoRoot
try {
    $lockfileHash = (Get-FileHash -LiteralPath (Join-Path $repoRoot 'package-lock.json') -Algorithm SHA256).Hash.Substring(0, 12).ToLowerInvariant()
    [System.Environment]::SetEnvironmentVariable('MKTPLACE_DEV_LOCKFILE_HASH', $lockfileHash, 'Process')

    if (-not (Test-Path -LiteralPath '.env.docker.local')) {
        throw 'Missing .env.docker.local. Run .\scripts\dev-init.ps1 first.'
    }

    foreach ($key in $composeEnvironmentKeys) { Remove-Item -LiteralPath ("Env:\" + $key) -ErrorAction SilentlyContinue }
    # A unique Compose ID keeps concurrent checks isolated from each other and the persistent dev stack.
    $instanceBytes = [byte[]]::new(6)
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($instanceBytes) }
    finally { $rng.Dispose() }
    $testInstanceId = [System.BitConverter]::ToString($instanceBytes).Replace('-', '').ToLowerInvariant()
    [System.Environment]::SetEnvironmentVariable('MKTPLACE_DOCKER_INSTANCE_ID', $testInstanceId, 'Process')
    $composeProjectName = "mktplace-wo-blg001-$testInstanceId"
    [System.Environment]::SetEnvironmentVariable('COMPOSE_PROJECT_NAME', $composeProjectName, 'Process')

    $composeArgs = @('-p', $composeProjectName, '-f', 'compose.dev.yaml', '--env-file', (Join-Path $repoRoot '.env.docker.local'), '--profile', 'test')
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
    if ($null -eq $previousLockfileHash) { Remove-Item -LiteralPath 'Env:\MKTPLACE_DEV_LOCKFILE_HASH' -ErrorAction SilentlyContinue }
    else { [System.Environment]::SetEnvironmentVariable('MKTPLACE_DEV_LOCKFILE_HASH', $previousLockfileHash, 'Process') }
    foreach ($key in $composeEnvironmentKeys) {
        $previousValue = $previousComposeEnvironment[$key]
        if ($null -eq $previousValue) { Remove-Item -LiteralPath ("Env:\" + $key) -ErrorAction SilentlyContinue }
        else { [System.Environment]::SetEnvironmentVariable($key, $previousValue, 'Process') }
    }
    Pop-Location
}
