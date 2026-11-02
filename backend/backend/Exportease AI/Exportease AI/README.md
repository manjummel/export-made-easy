# ExportEase AI - System 3 (Backend Orchestrator)

The central business orchestration layer for the **ExportEase AI** platform. It manages MSME profiles, coordinates export workflows, handles authentication, and acts as the bridge between the Frontend (System 4), AI Engine (System 1), and Knowledge Service (System 2).

## System Identifier
`EXPORT-EASE-BACKEND-V1`

## Features
- **FastAPI** robust API backend
- **PostgreSQL / SQLAlchemy** async data access footprint
- **Alembic** migrations
- **Workflow Engine** enforcing safety-first status tracking
- **Real/Mock Service Clients** to connect to AI engine and RAG systems
- **WebSocket Streaming** for live AI agent traces
- **Pydantic** schema contracts matching global standards

## Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose (optional for simple dev setup)

## Setup

1. **Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configuration**
   ```bash
   cp .env.example .env
   # Edit .env and supply your DB credentials and Service URLs.
   ```

3. **Database Setup**
   ```bash
   # Make sure PostgreSQL is running and you created the DB: exportease_db
   alembic upgrade head
   
   # Optional: Seed the database with the Turmeric to Germany scenario
   python scripts/seed_data.py
   ```

4. **Run Server**
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000/api/v1`. 
   Swagger UI available at: `http://localhost:8000/docs`.

## Running with Docker
```bash
docker compose up -d
```
Runs the backend and the PostgreSQL database.

## Architecture & Workflows

System 3 owns the **Business Workflow**, advancing through:
1. `MSME_PROFILE`
2. `PRODUCT`
3. `HS_CLASSIFICATION`
4. `EXPORT_ELIGIBILITY`
5. `COMPLIANCE`
6. `DOCUMENTS`
7. `CERTIFICATIONS`
8. `DESTINATION_MARKET`
9. `RISK`
10. `EXPORT_PLAN`

If the AI services report `INSUFFICIENT_EVIDENCE`, the workflow properly preserves this state without hallucinating regulatory assurances.

## Testing
Run the comprehensive Pytest suite (requires `pytest` and `httpx`):
```bash
pytest tests/
```
