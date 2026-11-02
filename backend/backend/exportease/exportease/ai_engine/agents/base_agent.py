"""
ai_engine/agents/base_agent.py

Defines the shared BaseAgent framework for all ExportEase agents.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from uuid import uuid4

from ai_engine.model.inference import InferenceEngine
from ai_engine.clients.knowledge.interface import KnowledgeClientInterface
from ai_engine.agents.tracer import AgentTracer
from ai_engine.schemas.agent_trace import AgentEvent

class BaseAgent(ABC):
    """
    Abstract base class that all System 1 agents inherit from.
    Encapsulates core requirements for configuration, output validation, retries, and tracing.
    """
    
    def __init__(
        self,
        agent_name: str,
        role: str,
        system_prompt: str,
        input_schema: Any,
        output_schema: Any,
        tools: List[Any],
        model: InferenceEngine,
        retrieval_client: Optional[KnowledgeClientInterface] = None,
        tracer: Optional[AgentTracer] = None
    ):
        self.agent_name = agent_name
        self.role = role
        self.system_prompt = system_prompt
        self.input_schema = input_schema
        self.output_schema = output_schema
        self.tools = tools
        self.model = model
        self.retrieval_client = retrieval_client
        self.tracer = tracer
        self.confidence = 0.0

    @abstractmethod
    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the agent logic.
        Must preserve request_id, project_id, and agent_run_id in the workflow state.
        """
        pass

    def validate_output(self, output: Dict[str, Any]) -> bool:
        """
        Validates the generated output against the agent's output schema.
        """
        try:
            self.output_schema.model_validate(output)
            return True
        except Exception:
            return False

    async def retry(self, state: Dict[str, Any], attempt: int = 1, max_attempts: int = 3) -> Dict[str, Any]:
        """
        Retry logic wrapper if output validation fails.
        """
        if attempt > max_attempts:
            raise ValueError(f"Agent {self.agent_name} failed to generate valid output after {max_attempts} attempts.")
        self.trace_event(state, "warning", f"Retry attempt {attempt} due to invalid output format.")
        return await self.execute(state)

    def trace_event(self, state: Dict[str, Any], event_type: str, message: str = ""):
        """
        Emits structured agent events conforming strictly to the agent_event contract.
        Emits: REQUEST_RECEIVED, AGENT_STARTED, SOURCE_RETRIEVED, AGENT_PROCESSING,
        AGENT_COMPLETED, AGENT_FAILED, WARNING, FINAL_RESULT
        """
        if not self.tracer:
            return
            
        # Ensure ID tracking
        request_id = state.get("request_id")
        project_id = state.get("project_id")
        agent_run_id = state.get("agent_run_id") or str(uuid4())
        
        # Build state snapshot to preserve ids
        state_meta = {
            "request_id": request_id,
            "project_id": project_id,
            "agent_run_id": agent_run_id
        }
        
        if event_type == "started":
            self.tracer.emit_started(state_meta, self.agent_name)
        elif event_type == "completed":
            self.tracer.emit_completed(state_meta, self.agent_name, confidence=self.confidence)
        elif event_type == "failed":
            self.tracer.emit_failed(state_meta, self.agent_name, message)
        elif event_type == "warning":
            self.tracer.emit_warning(state_meta, self.agent_name, message)
        elif event_type == "processing":
            self.tracer.emit_processing(state_meta, self.agent_name, message)
