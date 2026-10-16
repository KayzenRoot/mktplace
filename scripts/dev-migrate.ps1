#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'dev-compose-context.ps1')
$composeContext = Enter-DevComposeContext -ScriptRoot $PSScriptRoot
$composeArgs = $composeContext.ComposeArgs
try {
    $migrationLines = @(
        'import { readFileSync } from "node:fs";'
        'import pg from "pg";'
        'const target = new URL(process.env.DATABASE_URL);'
        'if (target.hostname !== "postgres" || target.port !== "5432" || target.pathname !== "/mktplace_dev") {'
        '  throw new Error("Migration refused: expected the isolated mktplace_dev Compose database.");'
        '}'
        'const pool = new pg.Pool({ connectionString: target.toString() });'
        'try {'
        '  await pool.query(readFileSync("db/migrations/001_oauth_identity.sql", "utf8"));'
        '  const result = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = ''public'' ORDER BY tablename");'
        '  console.log("Migration applied. Public tables: " + result.rows.length);'
        '  for (const row of result.rows) console.log(row.tablename);'
        '} finally {'
        '  await pool.end();'
        '}'
    )
    $migrationCode = [string]::Join([System.Environment]::NewLine, $migrationLines)
    & docker compose @composeArgs run --build --rm app node --input-type=module -e $migrationCode
    if ($LASTEXITCODE -ne 0) { throw "Local migration failed with exit code $LASTEXITCODE." }
}
finally {
    Exit-DevComposeContext -Context $composeContext
}
