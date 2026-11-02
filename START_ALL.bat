@echo off
title ExportEase Launcher
echo ================================================
echo   ExportEase - Starting All Services
echo ================================================

echo [1/2] Starting Backend (FastAPI on port 8000)...
start "ExportEase Backend" "%~dp0START_BACKEND.bat"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend (Vite UI on port 5173)...
start "ExportEase Frontend" "%~dp0START_FRONTEND.bat"

echo.
echo ================================================
echo  Services launched in separate windows!
echo  - Frontend App: http://localhost:5173
echo  - Backend API:  http://localhost:8000
echo  - API Docs:     http://localhost:8000/docs
echo ================================================
echo.
pause
