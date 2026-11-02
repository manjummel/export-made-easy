# ExportEase — Start All Services
# Double-click this file or right-click > Run with PowerShell

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root "backend\llm"
$frontendPath = if (Test-Path (Join-Path $root "frontend")) { Join-Path $root "frontend" } else { Join-Path $root "backend\ExportEase UI (2)\ExportEase UI\ExportEase UI" }

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ExportEase — Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "[1/2] Starting Backend (FastAPI on :8000)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$backendPath`" && call venv\Scripts\activate.bat && uvicorn server:app --host 0.0.0.0 --port 8000 --reload" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting Frontend (Vite on :5173)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$frontendPath`" && npm run dev -- --strictPort false" -WindowStyle Normal

Write-Host ""
Write-Host "Both services are launching in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
