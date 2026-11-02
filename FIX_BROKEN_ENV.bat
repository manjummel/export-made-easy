@echo off
echo Fixing corrupted Python virtual environment...
cd "backend\backend\exportease\exportease"
rmdir /s /q ".venv"
echo Fix applied! The broken folder has been deleted.
echo Now you can run START_ALL.bat again!
pause
