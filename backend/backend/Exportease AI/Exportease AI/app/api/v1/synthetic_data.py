# ============================================================
# ExportEase AI - Synthetic Data Admin API
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict, Any, List

from app.database import get_db
from app.models.synthetic_data import SyntheticDataRecord
from app.services.data_ingestion import DataIngestionService

router = APIRouter()

@router.get("/stats")
async def get_synthetic_data_stats(db: AsyncSession = Depends(get_db)):
    """Get statistics for the admin dashboard"""
    # Total count
    total_result = await db.execute(select(func.count(SyntheticDataRecord.id)))
    total = total_result.scalar_one()
    
    # Status counts
    status_stmt = select(SyntheticDataRecord.embedding_status, func.count(SyntheticDataRecord.id)).group_by(SyntheticDataRecord.embedding_status)
    status_result = await db.execute(status_stmt)
    statuses = {row[0]: row[1] for row in status_result.all()}
    
    # Category counts
    cat_stmt = select(SyntheticDataRecord.category, func.count(SyntheticDataRecord.id)).group_by(SyntheticDataRecord.category)
    cat_result = await db.execute(cat_stmt)
    categories = {row[0]: row[1] for row in cat_result.all()}
    
    return {
        "total_records": total,
        "embedding_status": statuses,
        "categories": categories
    }


@router.post("/ingest")
async def trigger_ingestion(
    background_tasks: BackgroundTasks, 
    file_path: str = "data/synthetic_dataset.jsonl",
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger ingestion of JSONL dataset into the DB.
    Runs asynchronously in the background.
    """
    # Ideally, we should pass a fresh DB session to background tasks to avoid session sharing issues,
    # but for this simplified endpoint we'll await directly or handle session properly.
    # To keep it simple and safe for this demonstration:
    result = await DataIngestionService.ingest_jsonl(file_path, db)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["error"])
    
    return {"message": "Ingestion completed", "details": result}


@router.post("/embed")
async def trigger_embeddings(db: AsyncSession = Depends(get_db)):
    """
    Trigger the embedding pipeline to process all PENDING records.
    """
    result = await DataIngestionService.trigger_embedding_pipeline(db)
    return {"message": "Embedding pipeline completed", "details": result}
    
@router.get("/records")
async def get_records(
    category: str = None, 
    status: str = None, 
    limit: int = 50, 
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Fetch paginated synthetic data records"""
    stmt = select(SyntheticDataRecord)
    
    if category:
        stmt = stmt.where(SyntheticDataRecord.category == category)
    if status:
        stmt = stmt.where(SyntheticDataRecord.embedding_status == status)
        
    stmt = stmt.limit(limit).offset(offset)
    result = await db.execute(stmt)
    records = result.scalars().all()
    
    return {"records": records, "limit": limit, "offset": offset}
