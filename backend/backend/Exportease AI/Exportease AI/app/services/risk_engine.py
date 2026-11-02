import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlalchemy.future import select
from app.schemas.risk import RiskAssessmentRequest, RiskAssessmentResponse, RiskFactor, Citation
from app.models.project_risk import ProjectRisk
from app.models.export_project import ExportProject
from app.dependencies import get_ai_client

logger = logging.getLogger(__name__)

class RiskAssessmentEngineService:
    @staticmethod
    async def analyze_risks(
        db: AsyncSession, request: RiskAssessmentRequest
    ) -> RiskAssessmentResponse:
        logger.info(f"Analyzing risks for project {request.project_id}")
        
        project = await db.get(ExportProject, request.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        ai_client = get_ai_client()
        context = request.model_dump()
        context.update({"api_version": "v1", "language": "en"})
        
        ai_response = await ai_client.analyze_risk(context)
        data = ai_response.get("data", {})
        confidence = ai_response.get("confidence", 0.0)
        sources = ai_response.get("sources", [])

        # Validate that sources only contains dictionaries with required fields before unpacking
        valid_citations = []
        for s in sources:
            if isinstance(s, dict) and "source" in s:
                valid_citations.append(Citation(**s))
            elif isinstance(s, dict) and "title" in s:
                 valid_citations.append(Citation(source=s["title"], link=s.get("url")))
            elif isinstance(s, str):
                valid_citations.append(Citation(source=s))

        factors = []
        for f in data.get("risks", []):
            factors.append(RiskFactor(
                category=f.get("category", "UNKNOWN"),
                factor=f.get("title", "Risk"),
                explanation=f.get("description", "")
            ))

        response = RiskAssessmentResponse(
            risk_score=data.get("overall_risk_score", 50),
            risk_level=data.get("overall_risk_level", "AMBER"),
            risk_categories=list({f.category for f in factors}) if factors else ["UNKNOWN"],
            risk_factors=factors,
            mitigation_actions=[m.get("mitigation", "") for m in data.get("risks", []) if "mitigation" in m],
            confidence=confidence,
            citations=valid_citations
        )
        
        # Check for existing risk profile (implement recalculation by overwriting)
        result = await db.execute(select(ProjectRisk).where(ProjectRisk.project_id == request.project_id))
        existing_risk = result.scalars().first()
        
        factors_dump = [f.model_dump() for f in response.risk_factors]
        citations_dump = [c.model_dump() for c in response.citations]

        if existing_risk:
            existing_risk.risk_score = response.risk_score
            existing_risk.risk_level = response.risk_level
            existing_risk.risk_categories = json.dumps(response.risk_categories)
            existing_risk.risk_factors = json.dumps(factors_dump)
            existing_risk.mitigation_actions = json.dumps(response.mitigation_actions)
            existing_risk.citations = json.dumps(citations_dump)
            existing_risk.confidence = response.confidence
        else:
            db_risk = ProjectRisk(
                project_id=request.project_id,
                risk_score=response.risk_score,
                risk_level=response.risk_level,
                risk_categories=json.dumps(response.risk_categories),
                risk_factors=json.dumps(factors_dump),
                mitigation_actions=json.dumps(response.mitigation_actions),
                citations=json.dumps(citations_dump),
                confidence=response.confidence
            )
            db.add(db_risk)
        
        await db.commit()
        return response

risk_engine = RiskAssessmentEngineService()
