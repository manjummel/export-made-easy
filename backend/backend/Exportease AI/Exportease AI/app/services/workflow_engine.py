# ============================================================
# ExportEase AI - Workflow Engine
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
The Procedure Engine / Workflow State Machine.
System 3 owns the canonical MSME export workflow.
System 1 performs AI reasoning. System 2 provides verified evidence.
System 4 displays the result.

SAFETY: Never invent regulatory facts. If System 1/System 2 reports
INSUFFICIENT_EVIDENCE, preserve that state.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.export_project import ExportProject
from app.models.project_step import ProjectStep
from app.models.project_compliance import ProjectCompliance
from app.models.project_document import ProjectDocument
from app.models.project_certification import ProjectCertification
from app.models.market_analysis import MarketAnalysis
from app.models.project_risk import ProjectRisk
from app.models.export_plan import ExportPlan
from app.models.agent_run import AgentRun
from app.models.agent_event import AgentEvent
from app.models.citation import Citation
from app.mcp.client import MCPClient
from app.mcp.registry import MCPRegistry
from app.utils.validators import generate_uuid, utc_now_iso
from app.utils.constants import (
    WorkflowStep,
    WORKFLOW_ORDER,
    StepStatus,
    ProjectStatus,
    AgentRunStatus,
    WSEventType,
)

logger = logging.getLogger(__name__)


class WorkflowEngine:
    """
    Central workflow engine that orchestrates the export journey.
    Manages step transitions, AI execution, result storage, and event tracking.
    """

    def __init__(self, ai_client, knowledge_client):
        self.ai_client = ai_client
        self.knowledge_client = knowledge_client
        
        # Initialize MCP Subsystem
        self.mcp_registry = MCPRegistry()
        # In a real app, we would await load_registry() somewhere else, 
        # but the MCPClient handles the execution context.
        self.mcp_client = MCPClient(registry=self.mcp_registry)

    # ── Workflow Initialization ───────────────────────────────

    async def initialize_workflow(
        self, db: AsyncSession, project_id: str
    ) -> dict[str, Any]:
        """
        Bootstrap all 10 workflow steps for a new export project.
        Sets STEP 1 (MSME_PROFILE) to IN_PROGRESS and the rest to PENDING.
        Transitions project status from DRAFT → ANALYZING.
        """
        from app.workflows.export_steps import STEP_DEFINITIONS

        result = await db.execute(
            select(ExportProject).where(ExportProject.id == project_id)
        )
        project = result.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project {project_id} not found")

        # Check if steps already exist
        existing = await db.execute(
            select(ProjectStep).where(ProjectStep.project_id == project_id)
        )
        if list(existing.scalars().all()):
            raise ValueError("Workflow already initialized for this project")

        # Create all steps
        for step_def in STEP_DEFINITIONS:
            step = ProjectStep(
                id=generate_uuid(),
                project_id=project_id,
                step_name=step_def.name,
                step_order=step_def.order,
                status=StepStatus.IN_PROGRESS.value if step_def.order == 0 else StepStatus.PENDING.value,
            )
            db.add(step)

        # Transition project
        project.status = ProjectStatus.ANALYZING.value
        project.current_step = WorkflowStep.MSME_PROFILE.value
        await db.flush()

        logger.info(f"Workflow initialized for project {project_id} — 10 steps created")
        return {
            "project_id": project_id,
            "status": project.status,
            "current_step": project.current_step,
            "total_steps": len(STEP_DEFINITIONS),
            "message": "Workflow initialized successfully",
        }

    async def get_workflow_status(
        self, db: AsyncSession, project_id: str
    ) -> dict[str, Any]:
        """Get complete workflow status for a project."""
        result = await db.execute(
            select(ExportProject).where(ExportProject.id == project_id)
        )
        project = result.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project {project_id} not found")

        steps_result = await db.execute(
            select(ProjectStep)
            .where(ProjectStep.project_id == project_id)
            .order_by(ProjectStep.step_order)
        )
        steps = list(steps_result.scalars().all())

        completed = sum(1 for s in steps if s.status == StepStatus.COMPLETED.value)
        total = len(steps)
        progress = (completed / total * 100) if total > 0 else 0.0

        return {
            "project_id": project_id,
            "current_step": project.current_step,
            "overall_status": project.status,
            "progress_percentage": round(progress, 1),
            "steps": [
                {
                    "step_name": s.step_name,
                    "step_order": s.step_order,
                    "status": s.status,
                    "is_current": s.step_name == project.current_step,
                    "confidence": s.confidence,
                    "result_summary": s.result_summary,
                }
                for s in steps
            ],
        }

    # ── Step Advancement ──────────────────────────────────────

    async def advance_step(
        self,
        db: AsyncSession,
        project_id: str,
        force: bool = False,
    ) -> dict[str, Any]:
        """Advance the workflow to the next step."""
        result = await db.execute(
            select(ExportProject).where(ExportProject.id == project_id)
        )
        project = result.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project {project_id} not found")

        current_step = project.current_step
        current_idx = next(
            (i for i, s in enumerate(WORKFLOW_ORDER) if s.value == current_step),
            None,
        )
        if current_idx is None:
            raise ValueError(f"Unknown current step: {current_step}")

        # Check if current step is completed (unless forced)
        if not force:
            step_result = await db.execute(
                select(ProjectStep).where(
                    ProjectStep.project_id == project_id,
                    ProjectStep.step_name == current_step,
                )
            )
            current_step_obj = step_result.scalar_one_or_none()
            if current_step_obj and current_step_obj.status not in (
                StepStatus.COMPLETED.value,
                StepStatus.SKIPPED.value,
            ):
                raise ValueError(
                    f"Step '{current_step}' is not completed (status: {current_step_obj.status}). "
                    f"Use force=true to advance anyway."
                )

        # Advance
        if current_idx >= len(WORKFLOW_ORDER) - 1:
            project.status = ProjectStatus.COMPLETED.value
            project.completed_at = datetime.now(timezone.utc)
            await db.flush()
            return {
                "project_id": project_id,
                "previous_step": current_step,
                "current_step": current_step,
                "status": "COMPLETED",
                "message": "Workflow completed — all steps finished.",
            }

        next_step = WORKFLOW_ORDER[current_idx + 1]
        project.current_step = next_step.value
        project.status = ProjectStatus.IN_PROGRESS.value
        await db.flush()

        logger.info(
            f"Workflow advanced: {project_id} from {current_step} → {next_step.value}"
        )
        return {
            "project_id": project_id,
            "previous_step": current_step,
            "current_step": next_step.value,
            "status": "IN_PROGRESS",
            "message": f"Advanced from {current_step} to {next_step.value}",
        }

    # ── Reset Step ────────────────────────────────────────────

    async def reset_to_step(
        self, db: AsyncSession, project_id: str, target_step: str
    ) -> dict[str, Any]:
        """Reset workflow back to a specific step."""
        result = await db.execute(
            select(ExportProject).where(ExportProject.id == project_id)
        )
        project = result.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project {project_id} not found")

        target_idx = next(
            (i for i, s in enumerate(WORKFLOW_ORDER) if s.value == target_step),
            None,
        )
        if target_idx is None:
            raise ValueError(f"Unknown step: {target_step}")

        project.current_step = target_step
        project.status = ProjectStatus.IN_PROGRESS.value

        # Reset steps from target onward
        steps_result = await db.execute(
            select(ProjectStep)
            .where(ProjectStep.project_id == project_id)
            .order_by(ProjectStep.step_order)
        )
        for step in steps_result.scalars():
            if step.step_order >= target_idx:
                step.status = StepStatus.PENDING.value
                step.result_summary = None
                step.result_data = None
                step.confidence = None
                step.started_at = None
                step.completed_at = None

        await db.flush()
        return {
            "project_id": project_id,
            "current_step": target_step,
            "status": "IN_PROGRESS",
            "message": f"Workflow reset to step: {target_step}",
        }

    # ── Execute Step (AI Orchestration) ───────────────────────

    async def execute_step(
        self,
        db: AsyncSession,
        project_id: str,
        step_name: str,
        context: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Execute a workflow step by calling the AI Engine.
        Creates an agent_run record, calls AI, stores results.
        SAFETY: preserves INSUFFICIENT_EVIDENCE from AI/Knowledge.
        """
        request_id = generate_uuid()

        # Create agent run
        agent_run = AgentRun(
            id=generate_uuid(),
            project_id=project_id,
            request_id=request_id,
            agent_type=step_name,
            agent_name=f"{step_name}_agent",
            workflow_step=step_name,
            status=AgentRunStatus.RUNNING.value,
            input_data=json.dumps(context),
            started_at=datetime.now(timezone.utc),
        )
        db.add(agent_run)

        # Update step status
        step_result = await db.execute(
            select(ProjectStep).where(
                ProjectStep.project_id == project_id,
                ProjectStep.step_name == step_name,
            )
        )
        step_obj = step_result.scalar_one_or_none()
        if step_obj:
            step_obj.status = StepStatus.IN_PROGRESS.value
            step_obj.started_at = datetime.now(timezone.utc)
            step_obj.agent_run_id = agent_run.id

        await db.flush()

        # Build request data
        request_data = {
            "request_id": request_id,
            "user_id": context.get("user_id", ""),
            "project_id": project_id,
            "timestamp": utc_now_iso(),
            "language": "en",
            "api_version": "v1",
            **context,
        }

        try:
            # Call appropriate AI endpoint
            ai_response = await self._call_ai_for_step(step_name, request_data)

            # SAFETY: Check for INSUFFICIENT_EVIDENCE
            response_status = ai_response.get("status", "")
            if response_status == "INSUFFICIENT_EVIDENCE":
                logger.warning(
                    f"[SAFETY] Step {step_name} returned INSUFFICIENT_EVIDENCE for project {project_id}"
                )
                if step_obj:
                    step_obj.status = StepStatus.INSUFFICIENT_EVIDENCE.value
                    step_obj.result_summary = "Insufficient evidence — cannot determine with confidence"
                agent_run.status = AgentRunStatus.COMPLETED.value
                agent_run.output_data = json.dumps(ai_response)
                agent_run.completed_at = datetime.now(timezone.utc)
                await db.flush()
                return ai_response

            # Store results
            ai_data = ai_response.get("data", {})
            confidence = ai_response.get("confidence")

            if step_obj:
                step_obj.status = StepStatus.COMPLETED.value
                step_obj.result_summary = self._extract_summary(step_name, ai_data)
                step_obj.result_data = json.dumps(ai_data)
                step_obj.confidence = confidence
                step_obj.completed_at = datetime.now(timezone.utc)

            agent_run.status = AgentRunStatus.COMPLETED.value
            agent_run.output_data = json.dumps(ai_response)
            agent_run.confidence = confidence
            agent_run.completed_at = datetime.now(timezone.utc)

            # Store domain-specific results
            await self._store_step_results(
                db, project_id, step_name, ai_data, agent_run.id, confidence
            )

            # Store citations
            for source in ai_response.get("sources", []):
                citation = Citation(
                    id=generate_uuid(),
                    project_id=project_id,
                    source_id=source.get("source_id"),
                    chunk_id=source.get("chunk_id"),
                    source_title=source.get("title"),
                    source_type=source.get("type"),
                    source_url=source.get("url"),
                    excerpt=source.get("excerpt"),
                    agent_run_id=agent_run.id,
                    workflow_step=step_name,
                    relevance_score=source.get("relevance_score"),
                )
                db.add(citation)

            await db.flush()
            logger.info(
                f"Step {step_name} completed for project {project_id} — "
                f"confidence: {confidence}"
            )
            return ai_response

        except Exception as e:
            logger.error(f"Step {step_name} failed for project {project_id}: {e}")
            if step_obj:
                step_obj.status = StepStatus.FAILED.value
            agent_run.status = AgentRunStatus.FAILED.value
            agent_run.error_message = str(e)
            agent_run.completed_at = datetime.now(timezone.utc)
            await db.flush()
            raise

    async def _call_ai_for_step(
        self, step_name: str, request_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Route to the correct AI endpoint based on step."""
        step_map = {
            WorkflowStep.HS_CLASSIFICATION.value: self.ai_client.classify_hs,
            WorkflowStep.COMPLIANCE.value: self.ai_client.analyze_compliance,
            WorkflowStep.DOCUMENTS.value: self.ai_client.analyze_documents,
            WorkflowStep.CERTIFICATIONS.value: self.ai_client.analyze_certifications,
            WorkflowStep.DESTINATION_MARKET.value: self.ai_client.analyze_market,
            WorkflowStep.RISK.value: self.ai_client.analyze_risk,
            WorkflowStep.EXPORT_PLAN.value: self.ai_client.generate_export_plan,
        }

        handler = step_map.get(step_name)
        
        # If the step requires government/compliance data, inject MCP tools 
        # into the AI request context so the AI can use them.
        if step_name in [WorkflowStep.HS_CLASSIFICATION.value, WorkflowStep.COMPLIANCE.value, WorkflowStep.DOCUMENTS.value]:
            request_data["mcp_tools_available"] = True
            request_data["mcp_servers"] = ["dgft", "icegate", "cbic", "rbi"]
            
        if handler:
            # Let the AI orchestrator call the MCP tools via the MCP client
            return await handler(request_data)
        else:
            return await self.ai_client.general_analysis(request_data)

    def _extract_summary(self, step_name: str, data: Any) -> str:
        """Extract a human-readable summary from AI response data."""
        if isinstance(data, dict):
            if "summary" in data:
                return str(data["summary"])
            if "hs_code" in data:
                return f"HS Code: {data['hs_code']} — {data.get('hs_description', '')}"
            if "overall_status" in data:
                return f"Status: {data['overall_status']}"
            if "plan_title" in data:
                return str(data["plan_title"])
            if "overall_risk_level" in data:
                return f"Risk Level: {data['overall_risk_level']}"
        return f"Step {step_name} completed"

    async def _store_step_results(
        self,
        db: AsyncSession,
        project_id: str,
        step_name: str,
        data: dict[str, Any],
        agent_run_id: str,
        confidence: float | None,
    ):
        """Store domain-specific results from AI responses."""
        if not data:
            return

        if step_name == WorkflowStep.COMPLIANCE.value:
            for req in data.get("requirements", []):
                compliance = ProjectCompliance(
                    id=generate_uuid(),
                    project_id=project_id,
                    requirement_name=req.get("name", "Unknown"),
                    requirement_type=req.get("type"),
                    description=req.get("description"),
                    status=req.get("status", "PENDING_REVIEW"),
                    regulatory_body=req.get("regulatory_body"),
                    regulation_reference=req.get("regulation_reference"),
                    is_mandatory=req.get("is_mandatory", True),
                    ai_assessment=req.get("description"),
                    confidence=confidence,
                    agent_run_id=agent_run_id,
                    evidence_status=req.get("status", "PENDING_REVIEW"),
                )
                db.add(compliance)

        elif step_name == WorkflowStep.DOCUMENTS.value:
            for doc in data.get("required_documents", []) + data.get("optional_documents", []):
                document = ProjectDocument(
                    id=generate_uuid(),
                    project_id=project_id,
                    document_name=doc.get("name", "Unknown"),
                    document_type=doc.get("type"),
                    description=doc.get("description"),
                    status="REQUIRED" if doc.get("is_mandatory", True) else "OPTIONAL",
                    issuing_authority=doc.get("issuing_authority"),
                    is_mandatory=doc.get("is_mandatory", True),
                    ai_recommended=True,
                    agent_run_id=agent_run_id,
                    confidence=confidence,
                )
                db.add(document)

        elif step_name == WorkflowStep.CERTIFICATIONS.value:
            for cert in data.get("required_certifications", []) + data.get("optional_certifications", []):
                certification = ProjectCertification(
                    id=generate_uuid(),
                    project_id=project_id,
                    certification_name=cert.get("name", "Unknown"),
                    certification_type=cert.get("type"),
                    description=cert.get("description"),
                    status="REQUIRED" if cert.get("is_mandatory", True) else "NOT_REQUIRED",
                    issuing_body=cert.get("issuing_body"),
                    validity_period=cert.get("validity_period"),
                    estimated_cost=cert.get("estimated_cost"),
                    estimated_time=cert.get("estimated_time"),
                    application_process=cert.get("application_process"),
                    is_mandatory=cert.get("is_mandatory", True),
                    ai_recommended=True,
                    confidence=confidence,
                    agent_run_id=agent_run_id,
                )
                db.add(certification)

        elif step_name == WorkflowStep.DESTINATION_MARKET.value:
            market = MarketAnalysis(
                id=generate_uuid(),
                project_id=project_id,
                target_country=data.get("target_country", "Unknown"),
                target_country_code=data.get("target_country_code"),
                market_size_usd=data.get("market_size_usd"),
                growth_rate=data.get("growth_rate"),
                market_potential=data.get("market_potential"),
                import_duty_rate=data.get("import_duty_rate"),
                trade_agreements=json.dumps(data.get("trade_agreements", [])),
                tariff_details=data.get("tariff_details"),
                non_tariff_barriers=data.get("non_tariff_barriers"),
                key_competitors=json.dumps(data.get("key_competitors", [])),
                market_entry_strategy=data.get("market_entry_strategy"),
                ai_analysis=json.dumps(data),
                confidence=confidence,
                agent_run_id=agent_run_id,
            )
            db.add(market)

        elif step_name == WorkflowStep.RISK.value:
            for risk in data.get("risks", []):
                risk_obj = ProjectRisk(
                    id=generate_uuid(),
                    project_id=project_id,
                    risk_title=risk.get("title", "Unknown Risk"),
                    risk_category=risk.get("category", "UNKNOWN"),
                    description=risk.get("description"),
                    risk_level=risk.get("level", "UNKNOWN"),
                    probability=risk.get("probability"),
                    impact=risk.get("impact"),
                    risk_score=risk.get("risk_score"),
                    mitigation_strategy=risk.get("mitigation"),
                    contingency_plan=risk.get("contingency"),
                    confidence=confidence,
                    agent_run_id=agent_run_id,
                )
                db.add(risk_obj)

        elif step_name == WorkflowStep.EXPORT_PLAN.value:
            plan = ExportPlan(
                id=generate_uuid(),
                project_id=project_id,
                plan_title=data.get("plan_title", "Export Plan"),
                phase_a_readiness=json.dumps(data.get("phase_a_readiness", [])),
                phase_b_hs_classification=json.dumps(data.get("phase_b_hs_classification", [])),
                phase_c_compliance=json.dumps(data.get("phase_c_compliance", [])),
                phase_d_documents=json.dumps(data.get("phase_d_documents", [])),
                phase_e_certifications=json.dumps(data.get("phase_e_certifications", [])),
                phase_f_destination_market=json.dumps(data.get("phase_f_destination_market", [])),
                phase_g_risk_mitigation=json.dumps(data.get("phase_g_risk_mitigation", [])),
                phase_h_execution_checklist=json.dumps(data.get("phase_h_execution_checklist", [])),
                confidence=confidence,
            )
            db.add(plan)
