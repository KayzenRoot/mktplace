#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Test-LoopbackPortAvailable {
    param([Parameter(Mandatory = $true)][int]$Port)

    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    try {
        $listener.Start()
        return $true
    }
    catch [System.Net.Sockets.SocketException] {
        return $false
    }
    finally {
        $listener.Stop()
    }
}

. (Join-Path $PSScriptRoot 'dev-compose-context.ps1')
$composeContext = Enter-DevComposeContext -ScriptRoot $PSScriptRoot
$repoRoot = $composeContext.RepoRoot
$composeArgs = $composeContext.ComposeArgs
try {
    $existingComposePort = $null
    $existingAppIds = & docker compose @composeArgs ps --quiet app
    if ($LASTEXITCODE -ne 0) { throw "Could not inspect the existing development app (exit code $LASTEXITCODE)." }
    foreach ($containerId in $existingAppIds) {
        $publishedPorts = & docker port $containerId.Trim() '3000/tcp' 2>$null
        if ($LASTEXITCODE -eq 0) {
            foreach ($publishedPort in $publishedPorts) {
                $existingPortMatch = [regex]::Match(([string]$publishedPort).Trim(), '^127\.0\.0\.1:([0-9]{1,5})$')
                if ($existingPortMatch.Success) {
                    $candidatePort = [int]$existingPortMatch.Groups[1].Value
                    if ($candidatePort -ge 1 -and $candidatePort -le 65535) {
                        $existingComposePort = $candidatePort
                        break
                    }
                }
            }
        }
        if ($null -ne $existingComposePort) { break }
    }

    $portLine = Get-Content -LiteralPath '.env.docker.local' | Where-Object { $_ -match '^APP_PORT=' } | Select-Object -First 1
    $portMatch = [regex]::Match([string]$portLine, '^APP_PORT=([0-9]{1,5})$')
    if (-not $portMatch.Success -or [int]$portMatch.Groups[1].Value -lt 1 -or [int]$portMatch.Groups[1].Value -gt 65535) {
        throw 'APP_PORT in .env.docker.local must be a TCP port from 1 to 65535.'
    }

    $requestedPort = [int]$portMatch.Groups[1].Value
    $selectedPort = $requestedPort
    if ($null -ne $existingComposePort) {
        $selectedPort = $existingComposePort
        if ($selectedPort -ne $requestedPort) {
            Write-Output "Configured APP_PORT is $requestedPort; reusing this project's current loopback port $selectedPort."
        }
    }
    elseif (-not (Test-LoopbackPortAvailable -Port $requestedPort)) {
        $selectedPort = 0
        $lastCandidate = [Math]::Min($requestedPort + 10, 65535)
        for ($candidate = $requestedPort + 1; $candidate -le $lastCandidate; $candidate++) {
            if (Test-LoopbackPortAvailable -Port $candidate) {
                $selectedPort = $candidate
                break
            }
        }
        if ($selectedPort -eq 0) {
            throw "Configured APP_PORT $requestedPort is occupied and no port through $lastCandidate is available. Set APP_PORT in .env.docker.local to an available port."
        }
        Write-Output "Configured APP_PORT $requestedPort is occupied; using loopback port $selectedPort for this run. .env.docker.local was not changed."
    }

    $composeExitCode = 1
    $composeOutput = @()
    for ($attempt = 0; $attempt -le 10; $attempt++) {
        [System.Environment]::SetEnvironmentVariable('APP_PORT', [string]$selectedPort, 'Process')
        $composeOutput = @(& docker compose @composeArgs up --build --detach --wait 2>&1)
        $composeExitCode = $LASTEXITCODE
        $composeOutput | ForEach-Object { Write-Output ([string]$_) }
        if ($composeExitCode -eq 0) { break }

        $portConflict = [regex]::IsMatch(($composeOutput | Out-String), ('Bind for 127\.0\.0\.1:' + [regex]::Escape([string]$selectedPort) + ' failed: port is already allocated'), [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        if (-not $portConflict -or $attempt -ge 10) { break }

        $lastCandidate = [Math]::Min($selectedPort + 10, 65535)
        $nextPort = 0
        for ($candidate = $selectedPort + 1; $candidate -le $lastCandidate; $candidate++) {
            if (Test-LoopbackPortAvailable -Port $candidate) {
                $nextPort = $candidate
                break
            }
        }
        if ($nextPort -eq 0) { break }
        Write-Output "Docker reported loopback port $selectedPort as allocated; retrying with $nextPort."
        $selectedPort = $nextPort
    }
    if ($composeExitCode -ne 0) { throw "docker compose up failed with exit code $composeExitCode." }
    & docker compose @composeArgs ps
    if ($LASTEXITCODE -ne 0) { throw "docker compose ps failed with exit code $LASTEXITCODE." }
    Write-Output "Development app: http://127.0.0.1:$selectedPort (loopback only)."
}
finally {
    Exit-DevComposeContext -Context $composeContext
}
