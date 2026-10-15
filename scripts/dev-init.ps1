#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$envPath = Join-Path $repoRoot '.env.docker.local'
if (Test-Path -LiteralPath $envPath) {
    throw '.env.docker.local already exists; it was left unchanged.'
}

function New-RandomHexSecret {
    $bytes = [byte[]]::new(32)
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
    }
    finally {
        $rng.Dispose()
    }
    return [System.BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
}

$lines = @(
    '# Generated locally by scripts/dev-init.ps1; do not commit or share.'
    'APP_PORT=3000'
    ('MKTPLACE_DOCKER_INSTANCE_ID=' + (New-RandomHexSecret).Substring(0, 12))
    'POSTGRES_DB=mktplace_dev'
    'POSTGRES_USER=mktplace_dev'
    ('POSTGRES_PASSWORD=' + (New-RandomHexSecret))
    'TEST_POSTGRES_DB=mktplace_test'
    'TEST_POSTGRES_USER=mktplace_test'
    ('TEST_POSTGRES_PASSWORD=' + (New-RandomHexSecret))
    'WATCHPACK_POLLING=false'
    'CHOKIDAR_USEPOLLING=false'
)
$content = ($lines -join [System.Environment]::NewLine) + [System.Environment]::NewLine
$encoding = [System.Text.UTF8Encoding]::new($false)
$stream = $null
$created = $false
try {
    $stream = [System.IO.File]::Open(
        $envPath,
        [System.IO.FileMode]::CreateNew,
        [System.IO.FileAccess]::Write,
        [System.IO.FileShare]::None
    )
    $created = $true
    $writer = [System.IO.StreamWriter]::new($stream, $encoding)
    try {
        $writer.Write($content)
    }
    finally {
        $writer.Dispose()
        $stream = $null
    }
}
catch {
    if ($null -ne $stream) { $stream.Dispose() }
    if ($created -and (Test-Path -LiteralPath $envPath)) { [System.IO.File]::Delete($envPath) }
    throw
}

Write-Output 'Created .env.docker.local with random local database credentials. Values were not displayed.'