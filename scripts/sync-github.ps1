#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$expectedBranch = 'feat/WO-BLG-001-secure-oauth'
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Push-Location $repoRoot
try {
    $root = (& git rev-parse --show-toplevel 2>$null)
    if ($LASTEXITCODE -ne 0 -or [System.IO.Path]::GetFullPath($root.Trim()) -ine $repoRoot) {
        throw 'This directory is not the expected Git worktree.'
    }

    $originUrl = (& git remote get-url origin 2>$null)
    if ($LASTEXITCODE -ne 0 -or $originUrl.Trim() -notmatch '^(https://github\.com/KayzenRoot/mktplace(?:\.git)?|git@github\.com:KayzenRoot/mktplace(?:\.git)?|ssh://git@github\.com/KayzenRoot/mktplace(?:\.git)?)$') {
        throw 'origin does not point to KayzenRoot/mktplace; no Git changes were made.'
    }

    $branch = (& git branch --show-current).Trim()
    if ($LASTEXITCODE -ne 0 -or $branch -ne $expectedBranch) {
        throw "Expected branch $expectedBranch; found '$branch'. No Git changes were made."
    }

    $upstream = (& git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>$null)
    if ($LASTEXITCODE -ne 0 -or $upstream.Trim() -ne "origin/$expectedBranch") {
        throw "Expected upstream origin/$expectedBranch; found '$($upstream.Trim())'. No Git changes were made."
    }

    $dirty = (& git status --porcelain --untracked-files=normal)
    if ($LASTEXITCODE -ne 0) { throw 'Could not inspect the Git working tree.' }
    if ($dirty) { throw 'Working tree has tracked or untracked changes; commit or resolve them before syncing.' }

    & git fetch origin
    if ($LASTEXITCODE -ne 0) { throw "git fetch origin failed with exit code $LASTEXITCODE." }

    $counts = (& git rev-list --left-right --count "HEAD...$($upstream.Trim())")
    if ($LASTEXITCODE -ne 0) { throw 'Could not compare HEAD with its upstream after fetch.' }
    $parts = $counts.Trim() -split '\s+'
    if ($parts.Count -ne 2) { throw 'Could not parse the upstream ahead/behind counts.' }
    $ahead = [int]$parts[0]
    $behind = [int]$parts[1]
    Write-Output "Upstream status for $expectedBranch - ahead=$ahead, behind=$behind."

    & git pull --ff-only
    if ($LASTEXITCODE -ne 0) { throw "git pull --ff-only failed with exit code $LASTEXITCODE." }
    Write-Output 'Git sync completed. Local edits reach GitHub only after explicit commit and git push.'
}
finally {
    Pop-Location
}