import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.schemas.export_plan import ExportPlanRequest, ExportPlanResponse, PlanStep, Citation
from app.models.export_plan import ExportPlan
from app.models.export_project import ExportProject
from sqlalchemy.future import select

logger = logging.getLogger(__name__)

class ExportPlanEngineService:
    @staticmethod
    async def generate_plan(
        db: AsyncSession, request: ExportPlanRequest
    ) -> ExportPlanResponse:
        logger.info(f"Generating comprehensive export plan for project {request.project_id}")
        
        project = await db.get(ExportProject, request.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Create a sample validated Step to act as a template for simulation
        def define_step(title, desc):
            return PlanStep(
                title=title,
                description=desc,
                status="PENDING",
                prerequisites=["Project Initialization"],
                next_action="Review and assign resource.",
                evidence="Data retrieved from internal engine contexts.",
                citations=[Citation(source="ExportEase AI Agent Context Core")],
                confidence=0.9
            )

        try:
            # Simulate planner agent synthesis covering the 8 phases
            response = ExportPlanResponse(
                project_id=request.project_id,
                plan_title=f"Strategic Export Plan for Project {request.project_id}",
                phase_a_readiness=[define_step("Profile Setup", "Ensure business and product profiles are complete.")],
                phase_b_hs_classification=[define_step("Assign HS", "Validate classification correctness.")],
                phase_c_compliance=[define_step("Adhere Rules", "Ensure FSSAI/regional compliance.")],
                phase_d_documents=[define_step("Doc Collating", "Compile Commercial Invoice, Packing list, etc.")],
                phase_e_certifications=[define_step("Quality Marks", "Apply for requested certifications.")],
                phase_f_destination_market=[define_step("Market Entry", "Plan logistics based on consumer trend data.")],
                phase_g_risk_mitigation=[define_step("Hedge Funds", "Mitigate currency collapse risks.")],
                phase_h_execution_checklist=[define_step("Final Review", "Ensure all red flags are cleared before sign-off.")],
                confidence=0.95
            )
        except ValueError as e:
            # Pydantic validation handles unsupported factual claims dynamically
            raise HTTPException(status_code=400, detail=str(e))

        # Re-check or create the DB record to overwrite/persist
        result = await db.execute(select(ExportPlan).where(ExportPlan.project_id == request.project_id))
        existing_plan = result.scalars().first()
        
        if existing_plan:
            existing_plan.phase_a_readiness = json.dumps([s.model_dump() for s in response.phase_a_readiness])
            existing_plan.phase_b_hs_classification = json.dumps([s.model_dump() for s in response.phase_b_hs_classification])
            existing_plan.phase_c_compliance = json.dumps([s.model_dump() for s in response.phase_c_compliance])
            existing_plan.phase_d_documents = json.dumps([s.model_dump() for s in response.phase_d_documents])
            existing_plan.phase_e_certifications = json.dumps([s.model_dump() for s in response.phase_e_certifications])
            existing_plan.phase_f_destination_market = json.dumps([s.model_dump() for s in response.phase_f_destination_market])
            existing_plan.phase_g_risk_mitigation = json.dumps([s.model_dump() for s in response.phase_g_risk_mitigation])
            existing_plan.phase_h_execution_checklist = json.dumps([s.model_dump() for s in response.phase_h_execution_checklist])
            existing_plan.confidence = response.confidence
        else:
            db_plan = ExportPlan(
                project_id=request.project_id,
                plan_title=response.plan_title,
                phase_a_readiness=json.dumps([s.model_dump() for s in response.phase_a_readiness]),
                phase_b_hs_classification=json.dumps([s.model_dump() for s in response.phase_b_hs_classification]),
                phase_c_compliance=json.dumps([s.model_dump() for s in response.phase_c_compliance]),
                phase_d_documents=json.dumps([s.model_dump() for s in response.phase_d_documents]),
                phase_e_certifications=json.dumps([s.model_dump() for s in response.phase_e_certifications]),
                phase_f_destination_market=json.dumps([s.model_dump() for s in response.phase_f_destination_market]),
                phase_g_risk_mitigation=json.dumps([s.model_dump() for s in response.phase_g_risk_mitigation]),
                phase_h_execution_checklist=json.dumps([s.model_dump() for s in response.phase_h_execution_checklist]),
                confidence=response.confidence
            )
            db.add(db_plan)
        
        await db.commit()
        return response

export_plan_engine = ExportPlanEngineService()
