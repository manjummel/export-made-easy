"""
ai_engine/agents/compliance_agent.py

Compliance Agent — Step 3.
Checks export/import regulations for the product and target country.
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

AGENT_NAME = "compliance_agent"


async def run_compliance_agent(
    state: ExportWorkflowState,
    inference: InferenceEngine,
    knowledge: KnowledgeClientInterface,
    tracer: AgentTracer,
    grounding: GroundingChecker,
) -> ExportWorkflowState:
    """Compliance Agent node."""
    tracer.emit_started(state, AGENT_NAME)

    try:
        product_info = state.get("product_info", {})
        hs_result = state.get("hs_result", {})
        target_country = state.get("target_country", "")
        hs_code = hs_result.get("hs_code", "")
        product_name = product_info.get("product_name", state.get("query", ""))

        query = (
            f"Export compliance regulations for {product_name} "
            f"HS code {hs_code} to {target_country}"
        )
        filters = KnowledgeFilters(country=_country_code(target_country))
        if hs_code:
            filters.hs_code = hs_code

        results = await knowledge.get_evidence(
            query=query,
            context={"product": product_name, "country": target_country, "hs_code": hs_code},
            request_id=state["request_id"],
        )
        chunk_ids = [r.chunk_id for r in results]
        tracer.emit_source_retrieved(state, AGENT_NAME, len(results), chunk_ids)

        grounding_result = grounding.check(results, AGENT_NAME)
        evidence_context = grounding.build_evidence_context(results)

        if grounding_result.state == GroundingState.INSUFFICIENT_GROUNDING:
            tracer.emit_warning(
                state, AGENT_NAME,
                f"INSUFFICIENT_GROUNDING: No verified compliance evidence for {target_country}.",
            )
            state["grounding_failed"] = True

        prompt_builder = get_prompt_builder(AGENT_NAME, "v1")
        prompt = prompt_builder(
            product_info=product_info,
            hs_result=hs_result,
            target_country=target_country,
            evidence=evidence_context,
            language=state.get("language", "en"),
        )

        tracer.emit_processing(state, AGENT_NAME, "Checking compliance requirements.")
        output: Dict[str, Any] = inference.generate_structured(prompt)

        # Preserve grounding status in output
        if grounding_result.state == GroundingState.INSUFFICIENT_GROUNDING:
            output["grounding_status"] = "INSUFFICIENT_GROUNDING"

        sources = list(set(chunk_ids + output.get("sources", [])))
        confidence = float(output.get("confidence", 0.0))

        state["compliance_result"] = output
        state["all_sources"] = list(set(state.get("all_sources", []) + sources))
        state["agent_confidences"][AGENT_NAME] = confidence

        for w in output.get("warnings", []):
            state["warnings"].append(f"[{AGENT_NAME}] {w}")

        tracer.emit_completed(state, AGENT_NAME, confidence=confidence, sources=sources)

    except Exception as e:
        logger.error(f"{AGENT_NAME} error: {e}", exc_info=True)
        tracer.emit_failed(state, AGENT_NAME, str(e))
        state["errors"].append(f"{AGENT_NAME}: {e}")
        state["compliance_result"] = {"error": str(e), "confidence": 0.0}

    return state


def _country_code(country_name: str) -> str:
    """Simple country name → ISO code mapping for filter hints."""
    mapping = {
        "germany": "DE", "france": "FR", "uk": "GB",
        "united kingdom": "GB", "usa": "US", "united states": "US",
        "japan": "JP", "china": "CN", "uae": "AE",
    }
    return mapping.get(country_name.lower(), country_name.upper()[:2])
