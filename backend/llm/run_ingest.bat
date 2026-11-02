@echo off
call venv\Scripts\activate
echo Running ingest.py to load documents into ChromaDB...
python ingest.py
pause
