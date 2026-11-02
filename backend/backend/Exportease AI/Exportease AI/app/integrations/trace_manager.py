# ============================================================
# ExportEase AI - Trace Manager
# EXPORT-EASE-BACKEND-V1
# ============================================================

import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.agent_run import AgentRun
from app.models.agent_event import AgentEvent
from app.utils.validators import generate_uuid, utc_now_iso

class TraceManager:
    """Records real-time agent execution events to the persistence layer."""
    
    def __init__(self, db: AsyncSession, project_id: str, request_id: str):
        self.db = db
        self.project_id = project_id
        self.request_id = request_id
        self.run_id = generate_uuid()
        self.event_order_counter = 0

    async def initialize_run(self, agent_type: str, input_data: str):
        """Creates the root AgentRun tracking object."""
        run = AgentRun(
            id=self.run_id,
            project_id=self.project_id,
            request_id=self.request_id,
            agent_type=agent_type,
            agent_name="ExportEase Orchestrator",
            status="RUNNING",
            input_data=input_data
        )
        self.db.add(run)
        await self.db.commit()

    async def log_event(self, event_type: str, agent: str, status: str, partial_output: str, confidence: float = 0.0, sources: list = None):
        """Appends a trace event directly linked to the current AgentRun."""
        if sources is None:
            sources = []
            
        self.event_order_counter += 1
        
        evt = AgentEvent(
            agent_run_id=self.run_id,
            event_type=event_type,
            event_order=self.event_order_counter,
            request_id=self.request_id,
            project_id=self.project_id,
            agent=agent,
            status=status,
            partial_output=partial_output,
            confidence=confidence,
            sources=json.dumps(sources)
        )
        self.db.add(evt)
        await self.db.commit()
    
    async def complete_run(self, final_output: str, error_message: str = None):
        """Closes out the AgentRun with final status."""
        run = await self.db.get(AgentRun, self.run_id)
        if run:
            run.status = "COMPLETED" if not error_message else "ERROR"
            run.output_data = final_output
            run.error_message = error_message
            await self.db.commit()
