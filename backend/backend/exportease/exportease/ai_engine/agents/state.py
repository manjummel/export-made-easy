"""
ai_engine/agents/state.py

LangGraph shared workflow state.
All 8 agents read from and write to this TypedDict.

Critical identifiers that MUST be preserved across the entire workflow:
  - request_id
  - project_id
  - agent_run_id
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict

from ai_engine.schemas.agent_trace import AgentEvent


class ExportWorkflowState(TypedDict, total=False):
    """
    Shared state for the 8-agent export workflow.

    Populated incrementally as agents complete.
    All agents must preserve request_id, project_id, agent_run_id.
    """

    # -----------------------------------------------------------------------
    # Critical identifiers — NEVER dropped
    # -----------------------------------------------------------------------
    request_id: str
    project_id: Optional[str]
    agent_run_id: str
    user_id: Optional[str]

    # -----------------------------------------------------------------------
    # Request context
    # -----------------------------------------------------------------------
    query: str
    language: str
    target_country: str

    # -----------------------------------------------------------------------
    # Agent outputs (set progressively)
    # -----------------------------------------------------------------------
    product_info: Dict[str, Any]
    hs_result: Dict[str, Any]
    compliance_result: Dict[str, Any]
    document_result: Dict[str, Any]
    certification_result: Dict[str, Any]
    market_result: Dict[str, Any]
    risk_result: Dict[str, Any]
    export_plan: Dict[str, Any]

    # -----------------------------------------------------------------------
    # Workflow metadata
    # -----------------------------------------------------------------------
    events: List[AgentEvent]
    errors: List[str]
    warnings: List[str]
    all_sources: List[str]
    agent_confidences: Dict[str, float]  # agent_name -> confidence
    overall_confidence: float
    workflow_status: str  # SUCCESS / PARTIAL_SUCCESS / INSUFFICIENT_GROUNDING / ERROR

    # -----------------------------------------------------------------------
    # Grounding state (updated per agent)
    # -----------------------------------------------------------------------
    grounding_failed: bool


def make_initial_state(
    request_id: str,
    agent_run_id: str,
    query: str,
    language: str = "en",
    target_country: str = "",
    project_id: Optional[str] = None,
    user_id: Optional[str] = None,
) -> ExportWorkflowState:
    """Create a fresh workflow state from an incoming request."""
    return ExportWorkflowState(
        request_id=request_id,
        project_id=project_id,
        agent_run_id=agent_run_id,
        user_id=user_id,
        query=query,
        language=language,
        target_country=target_country,
        product_info={},
        hs_result={},
        compliance_result={},
        document_result={},
        certification_result={},
        market_result={},
        risk_result={},
        export_plan={},
        events=[],
        errors=[],
        warnings=[],
        all_sources=[],
        agent_confidences={},
        overall_confidence=0.0,
        workflow_status="RUNNING",
        grounding_failed=False,
    )
