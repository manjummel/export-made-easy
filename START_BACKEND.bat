@echo off
title ExportEase — Backend (FastAPI :8000)
echo ================================================
echo  ExportEase AI Backend — FastAPI on port 8000
echo ================================================
cd /d "%~dp0backend\llm"
call venv\Scripts\activate.bat
echo Starting uvicorn server...
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
pause
