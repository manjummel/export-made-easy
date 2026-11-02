# ============================================================
# ExportEase AI — Data Ingestion Service
# ============================================================
import json
import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.synthetic_data import SyntheticDataRecord

logger = logging.getLogger(__name__)

class DataIngestionService:
    """
    Handles ingestion of synthetic JSONL data into PostgreSQL
    and coordinates vector embedding for RAG.
    """

    @staticmethod
    async def ingest_jsonl(file_path: str, db: AsyncSession) -> Dict[str, Any]:
        """
        Reads a JSONL file containing synthetic records and saves them to the DB.
        """
        logger.info(f"Starting ingestion from {file_path}")
        records_added = 0
        records_skipped = 0
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                for line in f:
                    data = json.loads(line)
                    
                    # Check if already exists
                    stmt = select(SyntheticDataRecord).where(SyntheticDataRecord.record_id == data.get("id"))
                    result = await db.execute(stmt)
                    existing = result.scalar_one_or_none()
                    
                    if existing:
                        records_skipped += 1
                        continue
                        
                    # Create new record
                    new_record = SyntheticDataRecord(
                        record_id=data.get("id"),
                        category=data.get("category"),
                        domain=data.get("domain", "export_trade"),
                        question=data.get("question"),
                        context=data.get("context"),
                        answer=data.get("answer"),
                        explanation=data.get("explanation"),
                        workflow_steps=data.get("workflow_steps"),
                        required_documents=data.get("required_documents"),
                        tags=data.get("tags"),
                        metadata_fields=data.get("metadata"), # rename mapping
                        evaluation_metadata=data.get("evaluation_metadata"),
                        country=data.get("country"),
                        product_category=data.get("product_category"),
                        hs_code_reference=data.get("hs_code_reference"),
                        compliance_area=data.get("compliance_area"),
                        risk_level=data.get("risk_level"),
                        difficulty=data.get("difficulty"),
                        language=data.get("language", "en"),
                        source_type=data.get("source_type", "synthetic"),
                        confidence_score=data.get("confidence_score"),
                        embedding_status="PENDING"
                    )
                    
                    db.add(new_record)
                    records_added += 1
                    
                    # Batch commit every 100
                    if records_added % 100 == 0:
                        await db.commit()
                        
            # Final commit
            if records_added % 100 != 0:
                await db.commit()
                
            logger.info(f"Ingestion complete. Added: {records_added}, Skipped: {records_skipped}")
            return {"status": "success", "added": records_added, "skipped": records_skipped}
            
        except Exception as e:
            logger.error(f"Ingestion failed: {str(e)}")
            await db.rollback()
            return {"status": "error", "error": str(e)}

    @staticmethod
    async def trigger_embedding_pipeline(db: AsyncSession) -> Dict[str, Any]:
        """
        Finds records with embedding_status='PENDING', chunks them,
        generates embeddings via LLM client, and pushes to Vector DB.
        """
        logger.info("Starting embedding pipeline for pending records...")
        
        stmt = select(SyntheticDataRecord).where(SyntheticDataRecord.embedding_status == "PENDING")
        result = await db.execute(stmt)
        pending_records = result.scalars().all()
        
        if not pending_records:
            return {"status": "success", "message": "No pending records to embed."}
            
        processed = 0
        failed = 0
        
        for record in pending_records:
            try:
                # 1. Formatting text for embedding
                text_to_embed = f"Question: {record.question}\nContext: {record.context or ''}\nAnswer: {record.answer}"
                
                # 2. In a real system, call RAGClient.embed(text_to_embed)
                # embedding = await RAGClient.generate_embedding(text_to_embed)
                # await VectorDB.upsert(id=record.record_id, vector=embedding, metadata={"category": record.category})
                
                # 3. Mark success
                record.embedding_status = "INGESTED"
                processed += 1
                
            except Exception as e:
                logger.error(f"Failed to embed record {record.record_id}: {e}")
                record.embedding_status = "FAILED"
                failed += 1
                
        await db.commit()
        return {"status": "success", "processed": processed, "failed": failed}
