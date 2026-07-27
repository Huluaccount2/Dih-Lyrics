$Host.UI.RawUI.WindowTitle = "Lyric Status"
Set-Location -LiteralPath $PSScriptRoot

if (-not (Test-Path -LiteralPath "node_modules")) {
    Write-Host "First run detected - installing dependencies, this can take a minute..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "npm install failed. Check the error above."
        Read-Host "Press Enter to close"
        exit 1
    }
    Clear-Host
}

if (-not (Test-Path -LiteralPath "dist\index.js")) {
    Write-Host "No build found - compiling..."
    npx tsc
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "TypeScript build failed. Check the error above."
        Read-Host "Press Enter to close"
        exit 1
    }
    Clear-Host
}

while ($true) {
    node dist\index.js
    $exitCode = $LASTEXITCODE

    Write-Host ""
    Write-Host "----------------------------------------"
    Write-Host "Lyric Status stopped (exit code $exitCode)."
    Write-Host "Restarting automatically in 1 second. Close this terminal to stop."
    Write-Host "----------------------------------------"
    Write-Host ""
    Start-Sleep -Seconds 1
    Clear-Host
}
