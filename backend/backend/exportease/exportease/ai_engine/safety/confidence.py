"""
ai_engine/safety/confidence.py

Confidence evaluator — maps evidence scores and grounding state
to named confidence tiers used in responses.

Thresholds:
  HIGH        > 0.85
  MEDIUM      > 0.65
  LOW         > 0.40
  INSUFFICIENT ≤ 0.40
"""

from __future__ import annotations

import logging
from typing import List, Optional

from ai_engine.schemas.common import ConfidenceState, ResponseStatus
from ai_engine.schemas.knowledge import KnowledgeResult
from ai_engine.safety.grounding import GroundingResult, GroundingState

logger = logging.getLogger(__name__)

# Thresholds
THRESHOLD_HIGH = 0.85
THRESHOLD_MEDIUM = 0.65
THRESHOLD_LOW = 0.40


class ConfidenceEvaluator:
    """
    Maps numeric scores and grounding state to confidence tiers.
    Used by agents to determine response status.
    """

    @staticmethod
    def score_to_state(score: float) -> ConfidenceState:
        """Map a numeric score (0.0–1.0) to a ConfidenceState."""
        if score > THRESHOLD_HIGH:
            return ConfidenceState.HIGH
        elif score > THRESHOLD_MEDIUM:
            return ConfidenceState.MEDIUM
        elif score > THRESHOLD_LOW:
            return ConfidenceState.LOW
        else:
            return ConfidenceState.INSUFFICIENT

    @staticmethod
    def grounding_to_response_status(
        grounding: GroundingResult,
        score: float,
    ) -> ResponseStatus:
        """
        Map grounding result + score to a ResponseStatus.

        This is used by the orchestrator to set the top-level response status.
        """
        if grounding.state == GroundingState.INSUFFICIENT_GROUNDING:
            return ResponseStatus.INSUFFICIENT_GROUNDING
        if grounding.state == GroundingState.UNVERIFIED_ONLY:
            return ResponseStatus.INSUFFICIENT_GROUNDING
        if grounding.state == GroundingState.LOW_CONFIDENCE:
            return ResponseStatus.LOW_CONFIDENCE
        # SUFFICIENT grounding — check score
        if score > THRESHOLD_HIGH:
            return ResponseStatus.SUCCESS
        if score > THRESHOLD_MEDIUM:
            return ResponseStatus.SUCCESS
        if score > THRESHOLD_LOW:
            return ResponseStatus.LOW_CONFIDENCE
        return ResponseStatus.REVIEW_REQUIRED

    @staticmethod
    def aggregate_confidence(scores: List[float]) -> float:
        """
        Aggregate multiple agent confidence scores into a single value.
        Uses weighted harmonic mean to penalize low-confidence agents.
        """
        if not scores:
            return 0.0
        valid = [s for s in scores if 0.0 <= s <= 1.0]
        if not valid:
            return 0.0
        # Harmonic mean (penalizes very low values)
        try:
            harmonic = len(valid) / sum(1.0 / s for s in valid if s > 0)
        except ZeroDivisionError:
            return 0.0
        return round(harmonic, 4)

    @staticmethod
    def from_knowledge_results(results: List[KnowledgeResult]) -> float:
        """
        Derive a confidence score from retrieved knowledge results.
        Only VERIFIED chunks contribute.
        """
        verified = [r for r in results if r.verification_status.value == "VERIFIED"]
        if not verified:
            return 0.0
        return round(sum(r.score for r in verified) / len(verified), 4)


# Module-level singleton
confidence_evaluator = ConfidenceEvaluator()
