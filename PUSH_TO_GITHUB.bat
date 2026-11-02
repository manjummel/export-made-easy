@echo off
setlocal enabledelayedexpansion
title ExportEase — Push to GitHub

echo ========================================================
echo   ExportEase AI — Push Project to GitHub
echo ========================================================
echo.

set "DEFAULT_REPO=https://github.com/pbaveena7/exportease.git"

echo Target GitHub Account: https://github.com/pbaveena7
echo.
set /p REPO_URL="Enter your GitHub Repository URL (or press ENTER for default %DEFAULT_REPO%): "
if "%REPO_URL%"=="" set "REPO_URL=%DEFAULT_REPO%"

echo.
echo Initializing Git repository...
cd /d "%~dp0"

if not exist ".git" (
    git init
    git branch -M main
)

echo Adding files...
git add .

echo Committing changes...
git commit -m "feat: ExportEase AI - Full platform with 3D Earth and Executive Dashboard modules"

echo Setting remote URL to %REPO_URL%...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo Pushing to GitHub (main branch)...
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   SUCCESSFULLY PUSHED TO GITHUB!
    echo   Repository: %REPO_URL%
    echo ========================================================
) else (
    echo --------------------------------------------------------
    echo If push failed, please make sure:
    echo 1. You created the repository on https://github.com/new
    echo 2. You are signed into Git or have provided your GitHub Token.
    echo --------------------------------------------------------
)

echo.
pause
