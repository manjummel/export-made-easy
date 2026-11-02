@echo off
title Push Frontend to manjummel/export-made-easy
echo ========================================================
echo   Pushing Frontend to https://github.com/manjummel/export-made-easy
echo ========================================================
echo.
cd /d "%~dp0"
git remote set-url origin https://github.com/manjummel/export-made-easy.git
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   SUCCESSFULLY PUSHED ALL COMMITS TO GITHUB!
    echo ========================================================
) else (
    echo --------------------------------------------------------
    echo If the push failed with "Repository not found":
    echo 1. Open https://github.com/new in your browser
    echo 2. Create a new repository named: export-made-easy
    echo 3. Run this script again!
    echo --------------------------------------------------------
)
pause
