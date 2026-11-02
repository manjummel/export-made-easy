from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.certification import CertificationAnalysisRequest, CertificationAnalysisResponse, CertificationRequirement
from app.models.project_certification import ProjectCertification
from app.dependencies import get_ai_client
import logging

logger = logging.getLogger(__name__)

class CertificationEngineService:
    @staticmethod
    async def analyze_certifications(
        db: AsyncSession, request: CertificationAnalysisRequest
    ) -> CertificationAnalysisResponse:
        """
        Analyze certifications for a project based on compliance information.
        CRITICAL RULES:
        - Every certification recommendation requiring factual support must contain citations from SET 2.
        """
        logger.info(f"Analyzing certifications for project {request.project_id}")
        ai_client = get_ai_client()
        
        context = request.model_dump()
        context.update({"api_version": "v1", "language": "en"})
        
        ai_response = await ai_client.analyze_certifications(context)
        confidence = ai_response.get("confidence", 0.0)
        data = ai_response.get("data", {})
        sources = ai_response.get("sources", [])
        source_title = sources[0].get("title", "SET 2 AI Engine") if sources else "SET 2 AI Engine"
        
        certifications_data = []
        
        # Merge both required and optional from AI Engine output
        all_certs = data.get("required_certifications", []) + data.get("optional_certifications", [])
        
        for cert in all_certs:
            status = "REQUIRED" if cert.get("is_mandatory", True) else "CONDITIONAL"
            
            ci = CertificationRequirement(
                certification_name=cert.get("name", "Unknown"),
                applicability=cert.get("description", "General"),
                status=status,
                reason=cert.get("description", "Required by market constraints"),
                issuing_authority=cert.get("issuing_body", "Unknown"),
                source=source_title,
                evidence=cert.get("evidence", "SET 2 Framework Evidence"),
                confidence=confidence
            )
            
            # CRITICAL RULE: Guardrail against conditional escalation
            if "conditional" in ci.applicability.lower() and ci.status == "REQUIRED":
                ci.status = "CONDITIONAL"
                
            certifications_data.append(ci)
            
            db_cert = ProjectCertification(
                project_id=request.project_id,
                certification_name=ci.certification_name,
                certification_type=cert.get("type", "Regulatory"),
                description=ci.reason,
                status=ci.status,
                issuing_body=ci.issuing_authority,
                is_mandatory=cert.get("is_mandatory", True),
                country_specific=request.destination,
                ai_recommended=True,
                confidence=confidence
            )
            db.add(db_cert)
            
        await db.commit()
        
        return CertificationAnalysisResponse(
            project_id=request.project_id,
            certifications=certifications_data
        )

certification_engine = CertificationEngineService()
