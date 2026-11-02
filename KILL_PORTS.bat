@echo off
title ExportEase - Free Ports 5173 & 8000
echo ================================================
echo   Stopping any processes running on 5173 / 8000
echo ================================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Terminating process on port 5173 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Terminating process on port 8000 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo Ports are now cleared!
pause
