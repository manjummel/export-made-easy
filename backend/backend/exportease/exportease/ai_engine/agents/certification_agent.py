"""
ai_engine/agents/certification_agent.py
Certification Agent — Step 5.
"""
from __future__ import annotations
import logging
from typing import Any, Dict

from ai_engine.agents.state import ExportWorkflowState
from ai_engine.agents.tracer import AgentTracer
from ai_engine.clients.knowledge.interface import KnowledgeClientInterface
from ai_engine.model.inference import InferenceEngine
from ai_engine.prompts.registry import get_prompt_builder
from ai_engine.safety.grounding import GroundingChecker

logger = logging.getLogger(__name__)
AGENT_NAME = "certification_agent"


async def run_certification_agent(
    state: ExportWorkflowState,
    inference: InferenceEngine,
    knowledge: KnowledgeClientInterface,
    tracer: AgentTracer,
    grounding: GroundingChecker,
) -> ExportWorkflowState:
    tracer.emit_started(state, AGENT_NAME)
    try:
        product_info = state.get("product_info", {})
        hs_result = state.get("hs_result", {})
        target_country = state.get("target_country", "")
        product_name = product_info.get("product_name", "product")
        hs_code = hs_result.get("hs_code", "")

        query = f"Certifications required for exporting {product_name} HS {hs_code} from India to {target_country}"
        results = await knowledge.get_evidence(query=query, request_id=state["request_id"])
        chunk_ids = [r.chunk_id for r in results]
        tracer.emit_source_retrieved(state, AGENT_NAME, len(results), chunk_ids)

        grounding_result = grounding.check(results, AGENT_NAME)
        evidence_context = grounding.build_evidence_context(results)

        prompt_builder = get_prompt_builder(AGENT_NAME, "v1")
        prompt = prompt_builder(
            product_info=product_info, hs_result=hs_result,
            target_country=target_country, evidence=evidence_context,
            language=state.get("language", "en"),
        )

        tracer.emit_processing(state, AGENT_NAME, "Identifying required certifications.")
        output: Dict[str, Any] = inference.generate_structured(prompt)

        sources = list(set(chunk_ids + output.get("sources", [])))
        confidence = float(output.get("confidence", 0.0))
        state["certification_result"] = output
        state["all_sources"] = list(set(state.get("all_sources", []) + sources))
        state["agent_confidences"][AGENT_NAME] = confidence
        for w in output.get("warnings", []):
            state["warnings"].append(f"[{AGENT_NAME}] {w}")
        tracer.emit_completed(state, AGENT_NAME, confidence=confidence, sources=sources)
    except Exception as e:
        logger.error(f"{AGENT_NAME} error: {e}", exc_info=True)
        tracer.emit_failed(state, AGENT_NAME, str(e))
        state["errors"].append(f"{AGENT_NAME}: {e}")
        state["certification_result"] = {"error": str(e), "confidence": 0.0}
    return state
