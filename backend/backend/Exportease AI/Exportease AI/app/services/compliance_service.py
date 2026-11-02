# ============================================================
# ExportEase AI - Compliance Service
# EXPORT-EASE-BACKEND-V1
# ============================================================

import json
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.project_compliance import ProjectCompliance
from app.models.export_project import ExportProject
from app.models.citation import Citation
from app.schemas.compliance import ComplianceAnalyzeRequest, ComplianceRequirement, ComplianceAnalyzeResponse
from app.utils.validators import generate_uuid
from app.clients.ai_client import AIServiceClient
from app.clients.knowledge_client import KnowledgeServiceClient

class ComplianceService:
    @staticmethod
    async def analyze_compliance(
        db: AsyncSession,
        request: ComplianceAnalyzeRequest,
        ai_client: AIServiceClient,
        knowledge_client: KnowledgeServiceClient,
        user_id: str
    ) -> ComplianceAnalyzeResponse:
        
        # Verify ownership
        project = (await db.execute(select(ExportProject).where(ExportProject.id == request.project_id))).scalar_one_or_none()
        if not project:
            raise ValueError("Export project not found")

        # 1. RAG Retrieval via System 2
        rag_query = f"Export compliance requirements for {request.product_name} HS code {request.hs_code} to {request.destination}"
        rag_res = await knowledge_client.search_sources(
            query=rag_query,
            project_id=request.project_id
        )
        sources = rag_res.get("data", []) if "data" in rag_res else rag_res.get("sources", [])

        # 2. Call Compliance Agent
        ai_payload = {
            "project_id": request.project_id,
            "product": request.product_name,
            "hs_code": request.hs_code,
            "destination": request.destination,
            "business_context": request.business_context,
            "rag_context": sources
        }
        
        ai_response = await ai_client.analyze_compliance(ai_payload)

        # 3. Extract core requirements
        # Safety rule: if low confidence, fallback appropriately
        confidence = float(ai_response.get("confidence", 0.0))
        data = ai_response.get("data", {})
        
        status = ai_response.get("status", "INSUFFICIENT_EVIDENCE")
        if confidence < 0.6:
            status = "INSUFFICIENT_EVIDENCE"
            data = {}  # Drop hallucinated data safely

        # Translate into model structures
        response_model = ComplianceAnalyzeResponse(
            status=status,
            confidence=confidence,
            restrictions=data.get("restrictions", []),
            licenses=data.get("licenses", []),
            conditions=data.get("conditions", []),
            exceptions=data.get("exceptions", []),
            authorities=data.get("authorities", [])
        )
        
        # Extract requirements iteratively
        for req in data.get("requirements", []):
            req_model = ComplianceRequirement(
                name=req.get("name", "Unknown Req"),
                mandatory_or_conditional=req.get("mandatory_or_conditional", "Unknown"),
                reason=req.get("reason"),
                authority=req.get("authority"),
                evidence=req.get("evidence")
            )
            response_model.requirements.append(req_model)

            # Map into database
            db_record = ProjectCompliance(
                id=generate_uuid(),
                project_id=request.project_id,
                requirement_name=req_model.name,
                requirement_type="COMPLIANCE",
                description=req_model.reason,
                status=status,
                regulatory_body=req_model.authority,
                ai_assessment=req_model.evidence,
                confidence=confidence,
                evidence_status=status
            )
            db.add(db_record)

        # Store Citations
        if status != "INSUFFICIENT_EVIDENCE":
            for s in sources:
                citation = Citation(
                    id=generate_uuid(),
                    project_id=request.project_id,
                    source_id=s.get("source_id", ""),
                    source_title=s.get("title", s.get("source_title", "Unknown Authority Rule")),
                    source_url=s.get("url", s.get("source_url")),
                    excerpt=s.get("excerpt"),
                    workflow_step="COMPLIANCE"
                )
                db.add(citation)

                response_model.citations.append({
                    "source_title": citation.source_title,
                    "source_url": citation.source_url,
                    "excerpt": citation.excerpt
                })

        await db.flush()
        return response_model
