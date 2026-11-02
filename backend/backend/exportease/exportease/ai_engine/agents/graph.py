"""
ai_engine/agents/graph.py

LangGraph orchestration graph for the 8-agent export workflow.

Flow:
  product → hs → compliance → document → certification → market → risk → planner

Each node is an async function that receives and returns ExportWorkflowState.
The graph preserves request_id, project_id, and agent_run_id across all nodes.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from langgraph.graph import StateGraph, END

from ai_engine.agents.state import ExportWorkflowState, make_initial_state
from ai_engine.agents.tracer import AgentTracer
from ai_engine.agents.product_agent import run_product_agent
from ai_engine.agents.hs_agent import run_hs_agent
from ai_engine.agents.compliance_agent import run_compliance_agent
from ai_engine.agents.document_agent import run_document_agent
from ai_engine.agents.certification_agent import run_certification_agent
from ai_engine.agents.market_agent import run_market_agent
from ai_engine.agents.risk_agent import run_risk_agent
from ai_engine.agents.planner_agent import run_planner_agent
from ai_engine.clients.knowledge.interface import KnowledgeClientInterface
from ai_engine.model.inference import InferenceEngine
from ai_engine.safety.grounding import GroundingChecker, grounding_checker

logger = logging.getLogger(__name__)


def build_export_graph(
    inference: InferenceEngine,
    knowledge: KnowledgeClientInterface,
    tracer: AgentTracer,
    grounding: GroundingChecker = grounding_checker,
) -> StateGraph:
    """
    Build and compile the LangGraph StateGraph for the export workflow.

    Each node is a closure that binds inference, knowledge, tracer, and grounding.
    Returns a compiled graph ready to invoke.
    """

    # -----------------------------------------------------------------------
    # Node factory — creates an async node function with bound dependencies
    # -----------------------------------------------------------------------
    def make_node(agent_fn):
        async def node(state: ExportWorkflowState) -> ExportWorkflowState:
            return await agent_fn(
                state=state,
                inference=inference,
                knowledge=knowledge,
                tracer=tracer,
                grounding=grounding,
            )
        node.__name__ = agent_fn.__name__
        return node

    # -----------------------------------------------------------------------
    # Build graph
    # -----------------------------------------------------------------------
    graph = StateGraph(ExportWorkflowState)

    # Add nodes
    graph.add_node("product", make_node(run_product_agent))
    graph.add_node("hs", make_node(run_hs_agent))
    graph.add_node("compliance", make_node(run_compliance_agent))
    graph.add_node("document", make_node(run_document_agent))
    graph.add_node("certification", make_node(run_certification_agent))
    graph.add_node("market", make_node(run_market_agent))
    graph.add_node("risk", make_node(run_risk_agent))
    graph.add_node("planner", make_node(run_planner_agent))

    # Sequential edges
    graph.add_edge("product", "hs")
    graph.add_edge("hs", "compliance")
    graph.add_edge("compliance", "document")
    graph.add_edge("document", "certification")
    graph.add_edge("certification", "market")
    graph.add_edge("market", "risk")
    graph.add_edge("risk", "planner")
    graph.add_edge("planner", END)

    # Entry point
    graph.set_entry_point("product")

    return graph.compile()


class ExportWorkflowOrchestrator:
    """
    High-level orchestrator that wraps the LangGraph compiled graph.

    Usage:
        orchestrator = ExportWorkflowOrchestrator(inference, knowledge, backend)
        result = await orchestrator.run(request_id, agent_run_id, query, target_country)
    """

    def __init__(
        self,
        inference: InferenceEngine,
        knowledge: KnowledgeClientInterface,
        backend_client=None,
        grounding: GroundingChecker = grounding_checker,
    ):
        self._inference = inference
        self._knowledge = knowledge
        self._grounding = grounding
        self._tracer = AgentTracer(backend_client)
        self._graph = build_export_graph(inference, knowledge, self._tracer, grounding)

    async def run(
        self,
        request_id: str,
        agent_run_id: str,
        query: str,
        target_country: str = "",
        language: str = "en",
        project_id: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> ExportWorkflowState:
        """
        Execute the full 8-agent export workflow.

        Returns:
            Final ExportWorkflowState with all agent outputs, events, and metadata.
        """
        logger.info(
            f"Starting export workflow: request_id={request_id} "
            f"agent_run_id={agent_run_id} query='{query[:80]}'"
        )

        initial_state = make_initial_state(
            request_id=request_id,
            agent_run_id=agent_run_id,
            query=query,
            language=language,
            target_country=target_country,
            project_id=project_id,
            user_id=user_id,
        )

        # Emit initial event
        self._tracer.emit_request_received(initial_state)

        # Execute graph
        try:
            final_state = await self._graph.ainvoke(initial_state)
        except Exception as e:
            logger.error(f"Workflow graph error: {e}", exc_info=True)
            initial_state["errors"].append(f"Workflow error: {e}")
            initial_state["workflow_status"] = "ERROR"
            return initial_state

        logger.info(
            f"Workflow complete: request_id={request_id} "
            f"status={final_state.get('workflow_status')} "
            f"confidence={final_state.get('overall_confidence', 0.0):.3f}"
        )
        return final_state

    def state_to_response_data(self, state: ExportWorkflowState) -> Dict[str, Any]:
        """
        Convert final workflow state to the data payload for ResponseEnvelope.
        """
        return {
            "product": state.get("product_info", {}),
            "hs_classification": state.get("hs_result", {}),
            "compliance": state.get("compliance_result", {}),
            "documents": state.get("document_result", {}),
            "certifications": state.get("certification_result", {}),
            "market": state.get("market_result", {}),
            "risk": state.get("risk_result", {}),
            "export_plan": state.get("export_plan", {}),
            "agent_events": [e.model_dump(mode="json") for e in state.get("events", [])],
            "agent_run_id": state.get("agent_run_id"),
            "workflow_status": state.get("workflow_status", "UNKNOWN"),
        }
