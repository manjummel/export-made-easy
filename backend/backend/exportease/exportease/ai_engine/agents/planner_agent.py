"""
ai_engine/agents/planner_agent.py
Export Planner Agent — Step 8 (final agent).
Synthesizes all prior agent outputs into a comprehensive export plan.
"""
from __future__ import annotations
import json
import logging
from typing import Any, Dict

from ai_engine.agents.state import ExportWorkflowState
from ai_engine.agents.tracer import AgentTracer
from ai_engine.clients.knowledge.interface import KnowledgeClientInterface
from ai_engine.model.inference import InferenceEngine
from ai_engine.prompts.registry import get_prompt_builder
from ai_engine.safety.grounding import GroundingChecker
from ai_engine.safety.confidence import ConfidenceEvaluator

logger = logging.getLogger(__name__)
AGENT_NAME = "planner_agent"


async def run_planner_agent(
    state: ExportWorkflowState,
    inference: InferenceEngine,
    knowledge: KnowledgeClientInterface,
    tracer: AgentTracer,
    grounding: GroundingChecker,
) -> ExportWorkflowState:
    """Export Planner Agent — final synthesis node."""
    tracer.emit_started(state, AGENT_NAME)
    try:
        product_info = state.get("product_info", {})
        hs_result = state.get("hs_result", {})
        compliance_result = state.get("compliance_result", {})
        document_result = state.get("document_result", {})
        certification_result = state.get("certification_result", {})
        market_result = state.get("market_result", {})
        risk_result = state.get("risk_result", {})
        target_country = state.get("target_country", "")
        product_name = product_info.get("product_name", "product")

        query = f"Export plan step by step {product_name} to {target_country} MSME first exporter"
        results = await knowledge.retrieve(query=query, top_k=3, request_id=state["request_id"])
        chunk_ids = [r.chunk_id for r in results]
        tracer.emit_source_retrieved(state, AGENT_NAME, len(results), chunk_ids)

        evidence_context = grounding.build_evidence_context(results)

        # Build compact summaries of prior agents for the prompt
        compliance_summary = _summarize(compliance_result, ["requirements", "export_restrictions"])
        document_summary = _summarize(document_result, ["required_documents"])
        cert_summary = _summarize(certification_result, ["certifications"])
        risk_summary = risk_result.get("overall_risk_level", "MEDIUM")

        prompt_builder = get_prompt_builder(AGENT_NAME, "v1")
        prompt = prompt_builder(
            product_info=product_info,
            hs_result=hs_result,
            target_country=target_country,
            compliance_summary=compliance_summary,
            document_summary=document_summary,
            cert_summary=cert_summary,
            risk_summary=risk_summary,
            evidence=evidence_context,
            language=state.get("language", "en"),
        )

        tracer.emit_processing(state, AGENT_NAME, "Generating comprehensive export plan.")
        output: Dict[str, Any] = inference.generate_structured(prompt)

        sources = list(set(chunk_ids + output.get("sources", [])))
        confidence = float(output.get("confidence", 0.0))
        state["export_plan"] = output
        state["all_sources"] = list(set(state.get("all_sources", []) + sources))
        state["agent_confidences"][AGENT_NAME] = confidence

        # Compute final aggregate confidence
        all_confidences = list(state.get("agent_confidences", {}).values())
        state["overall_confidence"] = ConfidenceEvaluator.aggregate_confidence(all_confidences)

        # Set final workflow status
        if state.get("grounding_failed"):
            state["workflow_status"] = "PARTIAL_SUCCESS"
        elif state.get("errors"):
            state["workflow_status"] = "PARTIAL_SUCCESS"
        else:
            state["workflow_status"] = "SUCCESS"

        for w in output.get("warnings", []):
            state["warnings"].append(f"[{AGENT_NAME}] {w}")

        tracer.emit_completed(state, AGENT_NAME, confidence=confidence, sources=sources)
        tracer.emit_final_result(state, state["overall_confidence"], state["all_sources"])

    except Exception as e:
        logger.error(f"{AGENT_NAME} error: {e}", exc_info=True)
        tracer.emit_failed(state, AGENT_NAME, str(e))
        state["errors"].append(f"{AGENT_NAME}: {e}")
        state["export_plan"] = {"error": str(e), "confidence": 0.0}
        state["workflow_status"] = "ERROR"

    return state


def _summarize(result: Dict, keys: list, max_items: int = 3) -> str:
    """Create a compact text summary of an agent result for planner prompt."""
    parts = []
    for key in keys:
        items = result.get(key, [])
        if isinstance(items, list):
            for item in items[:max_items]:
                if isinstance(item, dict):
                    name = item.get("document_name") or item.get("regulation_name") or item.get("certification_name") or str(item)
                    parts.append(name)
                else:
                    parts.append(str(item))
        elif items:
            parts.append(str(items)[:100])
    return "; ".join(parts) if parts else "None identified"
