"""
ai_engine/agents/hs_agent.py

HS Classification Agent — Step 2 of the export workflow.
Classifies the product under the Harmonized System (HS) nomenclature.
"""

from __future__ import annotations

import logging
from typing import Any, Dict

from ai_engine.agents.state import ExportWorkflowState
from ai_engine.agents.tracer import AgentTracer
from ai_engine.clients.knowledge.interface import KnowledgeClientInterface
from ai_engine.model.inference import InferenceEngine
from ai_engine.prompts.registry import get_prompt_builder
from ai_engine.safety.grounding import GroundingChecker, GroundingState
from ai_engine.schemas.knowledge import KnowledgeFilters

logger = logging.getLogger(__name__)

AGENT_NAME = "hs_agent"


async def run_hs_agent(
    state: ExportWorkflowState,
    inference: InferenceEngine,
    knowledge: KnowledgeClientInterface,
    tracer: AgentTracer,
    grounding: GroundingChecker,
) -> ExportWorkflowState:
    """HS Classification Agent node."""
    tracer.emit_started(state, AGENT_NAME)

    try:
        product_info = state.get("product_info", {})
        product_name = product_info.get("product_name", state.get("query", ""))
        hsn_hint = product_info.get("hsn_hint", "")

        # Targeted retrieval using product name + HS hint
        query = f"HS code classification for {product_name}"
        if hsn_hint:
            query += f" HS {hsn_hint}"

        filters = KnowledgeFilters()
        if hsn_hint:
            filters.hs_code = hsn_hint

        results = await knowledge.retrieve_with_filters(
            query=query,
            filters=filters,
            top_k=5,
            request_id=state["request_id"],
        )
        chunk_ids = [r.chunk_id for r in results]
        tracer.emit_source_retrieved(state, AGENT_NAME, len(results), chunk_ids)

        grounding_result = grounding.check(results, AGENT_NAME)
        evidence_context = grounding.build_evidence_context(results)

        if grounding_result.state == GroundingState.INSUFFICIENT_GROUNDING:
            tracer.emit_warning(state, AGENT_NAME, "No verified HS classification evidence found.")

        prompt_builder = get_prompt_builder(AGENT_NAME, "v1")
        prompt = prompt_builder(
            product_info=product_info,
            evidence=evidence_context,
            language=state.get("language", "en"),
        )

        tracer.emit_processing(state, AGENT_NAME, "Classifying under Harmonized System.")
        output: Dict[str, Any] = inference.generate_structured(prompt)

        sources = list(set(chunk_ids + output.get("sources", [])))
        confidence = float(output.get("confidence", 0.0))

        state["hs_result"] = output
        state["all_sources"] = list(set(state.get("all_sources", []) + sources))
        state["agent_confidences"][AGENT_NAME] = confidence

        for w in output.get("warnings", []):
            state["warnings"].append(f"[{AGENT_NAME}] {w}")

        tracer.emit_completed(state, AGENT_NAME, confidence=confidence, sources=sources)

    except Exception as e:
        logger.error(f"{AGENT_NAME} error: {e}", exc_info=True)
        tracer.emit_failed(state, AGENT_NAME, str(e))
        state["errors"].append(f"{AGENT_NAME}: {e}")
        state["hs_result"] = {"error": str(e), "confidence": 0.0}

    return state
