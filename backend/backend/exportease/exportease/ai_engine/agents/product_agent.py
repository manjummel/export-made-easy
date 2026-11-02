"""
ai_engine/agents/product_agent.py

Product Agent — Step 1 of the export workflow.
Identifies and validates the product from the user's natural language query.

Flow:
  AGENT_STARTED → SOURCE_RETRIEVED → AGENT_PROCESSING → AGENT_COMPLETED/FAILED
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
from ai_engine.safety.confidence import ConfidenceEvaluator

logger = logging.getLogger(__name__)

AGENT_NAME = "product_agent"


async def run_product_agent(
    state: ExportWorkflowState,
    inference: InferenceEngine,
    knowledge: KnowledgeClientInterface,
    tracer: AgentTracer,
    grounding: GroundingChecker,
) -> ExportWorkflowState:
    """
    Product Agent node for the LangGraph workflow.
    Identifies product details from the user query.
    """
    tracer.emit_started(state, AGENT_NAME)

    try:
        # 1. Retrieve evidence
        results = await knowledge.retrieve(
            query=state.get("query", ""),
            top_k=5,
            language=state.get("language", "en"),
            request_id=state["request_id"],
        )
        chunk_ids = [r.chunk_id for r in results]
        tracer.emit_source_retrieved(state, AGENT_NAME, len(results), chunk_ids)

        # 2. Grounding check
        grounding_result = grounding.check(results, AGENT_NAME)
        evidence_context = grounding.build_evidence_context(results)

        if grounding_result.state == GroundingState.INSUFFICIENT_GROUNDING:
            tracer.emit_warning(
                state, AGENT_NAME,
                "Insufficient grounding for product identification. Proceeding with query only."
            )

        # 3. Build prompt
        prompt_builder = get_prompt_builder(AGENT_NAME, "v1")
        prompt = prompt_builder(
            query=state.get("query", ""),
            evidence=evidence_context,
            language=state.get("language", "en"),
        )

        # 4. Inference
        tracer.emit_processing(state, AGENT_NAME, "Identifying product details.")
        output: Dict[str, Any] = inference.generate_structured(prompt)

        # 5. Merge sources
        sources = list(set(chunk_ids + output.get("sources", [])))
        confidence = float(output.get("confidence", 0.0))

        # 6. Update state
        state["product_info"] = output
        state["all_sources"] = list(set(state.get("all_sources", []) + sources))
        state["agent_confidences"][AGENT_NAME] = confidence

        # Propagate target country hint from product info if not yet set
        if not state.get("target_country") and "target_country" in output:
            state["target_country"] = output["target_country"]

        for w in output.get("warnings", []):
            state["warnings"].append(f"[{AGENT_NAME}] {w}")

        tracer.emit_completed(state, AGENT_NAME, confidence=confidence, sources=sources)

    except Exception as e:
        logger.error(f"{AGENT_NAME} error: {e}", exc_info=True)
        tracer.emit_failed(state, AGENT_NAME, str(e))
        state["errors"].append(f"{AGENT_NAME}: {e}")
        state["product_info"] = {"error": str(e), "confidence": 0.0}

    return state
