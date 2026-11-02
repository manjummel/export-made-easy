"""
ai_engine/agents/orchestrator.py

LangGraph orchestrator matching the final Step 20 specification.
Implements conditional routing and the shared ExportState.
"""

from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, END

from ai_engine.agents.state import ExportWorkflowState
from ai_engine.schemas.agent_trace import AgentEvent
from ai_engine.agents.graph import build_export_graph

class ExportState(TypedDict, total=False):
    """
    ExportState as defined by Prompt 20.
    Directly compatible with ExportWorkflowState.
    """
    user_query: str
    language: str
    product_info: Dict[str, Any]
    hs_info: Dict[str, Any]
    compliance_info: Dict[str, Any]
    document_info: Dict[str, Any]
    certification_info: Dict[str, Any]
    market_info: Dict[str, Any]
    risk_info: Dict[str, Any]
    export_plan: Dict[str, Any]
    retrieved_sources: List[str]
    confidence: float
    errors: List[str]
    trace_events: List[AgentEvent]
    request_id: str
    project_id: str
    agent_run_id: str
    
    # Control variable for routing
    workflow_type: str  # hs_only, compliance_only, document_only, complete_export
    requires_certification: bool

# Simple wrapper to route conditionally in LangGraph
def build_production_orchestrator(inference, knowledge, tracer, grounding):
    """
    Builds the state graph mapping target routing conditions.
    """
    # Nodes are mapped directly from existing implementations
    from ai_engine.agents.product_agent import run_product_agent
    from ai_engine.agents.hs_agent import run_hs_agent
    from ai_engine.agents.compliance_agent import run_compliance_agent
    from ai_engine.agents.document_agent import run_document_agent
    from ai_engine.agents.certification_agent import run_certification_agent
    from ai_engine.agents.market_agent import run_market_agent
    from ai_engine.agents.risk_agent import run_risk_agent
    from ai_engine.agents.planner_agent import run_planner_agent

    def make_node(agent_fn):
        async def node(state: ExportState) -> ExportState:
            # Sync key mappings to comply with both schemas
            state["query"] = state.get("user_query", "")
            state["events"] = state.get("trace_events", [])
            state["all_sources"] = state.get("retrieved_sources", [])
            
            res = await agent_fn(
                state=state,
                inference=inference,
                knowledge=knowledge,
                tracer=tracer,
                grounding=grounding,
            )
            
            # Map back
            res["user_query"] = res.get("query", "")
            res["trace_events"] = res.get("events", [])
            res["retrieved_sources"] = res.get("all_sources", [])
            return res
        node.__name__ = agent_fn.__name__
        return node

    graph = StateGraph(ExportState)

    graph.add_node("product", make_node(run_product_agent))
    graph.add_node("hs", make_node(run_hs_agent))
    graph.add_node("compliance", make_node(run_compliance_agent))
    graph.add_node("document", make_node(run_document_agent))
    graph.add_node("certification", make_node(run_certification_agent))
    graph.add_node("market", make_node(run_market_agent))
    graph.add_node("risk", make_node(run_risk_agent))
    graph.add_node("planner", make_node(run_planner_agent))

    # Conditional Routing Edges
    def after_product_router(state: ExportState):
        return "hs"

    def after_hs_router(state: ExportState):
        w_type = state.get("workflow_type", "complete_export")
        if w_type == "hs_only":
            return END
        return "compliance"

    def after_compliance_router(state: ExportState):
        w_type = state.get("workflow_type", "complete_export")
        if w_type == "compliance_only":
            return END
        return "document"

    def after_document_router(state: ExportState):
        w_type = state.get("workflow_type", "complete_export")
        if w_type == "document_only":
            return END
            
        # Conditional certification routing
        if state.get("requires_certification", True):
            return "certification"
        return "market"

    graph.set_entry_point("product")
    graph.add_conditional_edges("product", after_product_router, {"hs": "hs"})
    graph.add_conditional_edges("hs", after_hs_router, {"compliance": "compliance", END: END})
    graph.add_conditional_edges("compliance", after_compliance_router, {"document": "document", END: END})
    graph.add_conditional_edges("document", after_document_router, {"certification": "certification", "market": "market", END: END})
    
    graph.add_edge("certification", "market")
    graph.add_edge("market", "risk")
    graph.add_edge("risk", "planner")
    graph.add_edge("planner", END)

    return graph.compile()
