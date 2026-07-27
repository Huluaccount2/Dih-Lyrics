@echo off
cd /d "%~dp0"

where wt >nul 2>nul
if %errorlevel%==0 (
    where pwsh >nul 2>nul && (
        wt -w 0 new-tab --title "Lyric Status" pwsh -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
    ) || (
        wt -w 0 new-tab --title "Lyric Status" powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
    )
    exit /b
)

where pwsh >nul 2>nul && (
    pwsh -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
) || (
    powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
)
