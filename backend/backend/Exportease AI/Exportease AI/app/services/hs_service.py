# ============================================================
# ExportEase AI - HS Classification Service
# EXPORT-EASE-BACKEND-V1
# ============================================================
import json
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.hs_classification import HSClassification
from app.models.export_project import ExportProject
from app.models.citation import Citation
from app.schemas.hs_classification import HSClassificationRequest
from app.utils.validators import generate_uuid
from app.clients.ai_client import AIServiceClient
from app.clients.knowledge_client import KnowledgeServiceClient


class HSClassificationService:
    @staticmethod
    async def classify(
        db: AsyncSession,
        request: HSClassificationRequest,
        ai_client: AIServiceClient,
        knowledge_client: KnowledgeServiceClient,
        user_id: str
    ) -> HSClassification:
        # Validate project ownership
        project = (await db.execute(select(ExportProject).where(
            ExportProject.id == request.export_project_id
        ))).scalar_one_or_none()

        if not project:
            raise ValueError("Export project not found")

        # Create history record
        record_id = generate_uuid()
        hs_record = HSClassification(
            id=record_id,
            project_id=request.export_project_id,
            product_description=request.product_description,
            destination=request.destination,
            status="ANALYZING", 
        )
        db.add(hs_record)
        await db.flush()

        # Step 1: Query Knowledge Service (RAG)
        rag_res = await knowledge_client.search_sources(
            query=f"HS code classification for {request.product_description} to {request.destination}",
            project_id=request.export_project_id
        )

        sources = rag_res.get("data", []) if "data" in rag_res else rag_res.get("sources", [])

        # Step 2: Call AI Agent
        ai_request_data = {
            "project_id": request.export_project_id,
            "product_description": request.product_description,
            "destination": request.destination,
            "optional_existing_hs_code": request.optional_existing_hs_code,
            "rag_context": sources,
        }

        ai_response = await ai_client.classify_hs(ai_request_data)

        # Parse AI response
        ai_status = ai_response.get("status", "INSUFFICIENT_EVIDENCE")
        confidence = float(ai_response.get("confidence", 0.0))
        data = ai_response.get("data", {})
        
        # Fallback based on confidence
        if confidence < 0.6:
            ai_status = "INSUFFICIENT_EVIDENCE"
            data["selected_code"] = None

        hs_record.status = ai_status
        hs_record.selected_code = data.get("selected_code")
        hs_record.reasoning = ai_response.get("reasoning", data.get("reasoning", ""))
        hs_record.confidence = confidence

        # Write citations if evidence-backed
        for s in sources:
            citation = Citation(
                id=generate_uuid(),
                project_id=request.export_project_id,
                source_id=s.get("source_id", ""),
                source_title=s.get("title", s.get("source_title", "Unknown Source")),
                source_url=s.get("url", s.get("source_url")),
                excerpt=s.get("excerpt"),
                workflow_step="HS_CLASSIFICATION"
            )
            db.add(citation)
        
        await db.flush()
        return hs_record

    @staticmethod
    async def get_project_classifications(
        db: AsyncSession, project_id: str, user_id: str
    ) -> List[HSClassification]:
        project = (await db.execute(select(ExportProject).where(
            ExportProject.id == project_id
        ))).scalar_one_or_none()

        if not project:
            raise ValueError("Export project not found")

        stmt = select(HSClassification).where(
            HSClassification.project_id == project_id
        ).order_by(HSClassification.created_at.desc())
        
        return list((await db.execute(stmt)).scalars().all())
