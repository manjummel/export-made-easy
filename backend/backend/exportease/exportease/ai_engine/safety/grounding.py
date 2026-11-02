"""
ai_engine/safety/grounding.py

Grounding checker — enforces the core safety rule:

    NO VERIFIED EVIDENCE = NO VERIFIED REGULATORY CLAIM

This module is called by every agent before generating output.
If evidence is insufficient, the agent MUST return INSUFFICIENT_GROUNDING.

Never invent:
- DGFT regulations
- HS codes
- certification requirements
- government procedures
- source URLs
- legal requirements
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from enum import Enum
from typing import List, Optional

from ai_engine.schemas.knowledge import KnowledgeResult
from ai_engine.schemas.common import VerificationStatus

logger = logging.getLogger(__name__)

# Minimum number of VERIFIED chunks required to support a regulatory claim
MIN_VERIFIED_CHUNKS = 1

# Minimum relevance score for a chunk to count as evidence
MIN_EVIDENCE_SCORE = 0.50


class GroundingState(str, Enum):
    """Result of the grounding check."""
    SUFFICIENT = "SUFFICIENT"                        # ≥ 1 VERIFIED chunk above threshold
    INSUFFICIENT_GROUNDING = "INSUFFICIENT_GROUNDING"  # No verified evidence
    LOW_CONFIDENCE = "LOW_CONFIDENCE"                # Evidence exists but score is low
    UNVERIFIED_ONLY = "UNVERIFIED_ONLY"              # Only UNVERIFIED chunks returned


@dataclass
class GroundingResult:
    """Full result of a grounding check."""
    state: GroundingState
    verified_count: int
    total_count: int
    best_score: float
    reason: str
    chunk_ids: List[str]

    @property
    def is_sufficient(self) -> bool:
        return self.state == GroundingState.SUFFICIENT

    @property
    def status_string(self) -> str:
        return self.state.value


class GroundingChecker:
    """
    Checks whether retrieved evidence is sufficient to support
    regulatory/compliance claims in agent output.

    CRITICAL RULE: If this returns INSUFFICIENT_GROUNDING,
    the agent MUST NOT make any regulatory claim.
    """

    def __init__(
        self,
        min_verified_chunks: int = MIN_VERIFIED_CHUNKS,
        min_score: float = MIN_EVIDENCE_SCORE,
    ):
        self.min_verified_chunks = min_verified_chunks
        self.min_score = min_score

    def check(
        self,
        results: List[KnowledgeResult],
        agent_name: str = "unknown",
    ) -> GroundingResult:
        """
        Check the grounding sufficiency of the retrieved results.

        Args:
            results: List of KnowledgeResult objects from the Knowledge service.
            agent_name: Name of the calling agent (for logging).

        Returns:
            GroundingResult with state and details.
        """
        total = len(results)

        if total == 0:
            logger.warning(
                f"[{agent_name}] INSUFFICIENT_GROUNDING: no evidence retrieved."
            )
            return GroundingResult(
                state=GroundingState.INSUFFICIENT_GROUNDING,
                verified_count=0,
                total_count=0,
                best_score=0.0,
                reason="No knowledge chunks were retrieved.",
                chunk_ids=[],
            )

        # Filter to verified chunks above score threshold
        verified = [
            r for r in results
            if r.verification_status == VerificationStatus.VERIFIED
            and r.score >= self.min_score
        ]

        all_verified = [
            r for r in results
            if r.verification_status == VerificationStatus.VERIFIED
        ]

        best_score = max((r.score for r in results), default=0.0)
        chunk_ids = [r.chunk_id for r in results]

        if len(verified) >= self.min_verified_chunks:
            logger.debug(
                f"[{agent_name}] SUFFICIENT: {len(verified)} verified chunks "
                f"(best score: {best_score:.3f})"
            )
            return GroundingResult(
                state=GroundingState.SUFFICIENT,
                verified_count=len(verified),
                total_count=total,
                best_score=best_score,
                reason=f"{len(verified)} verified chunk(s) found with score ≥ {self.min_score}.",
                chunk_ids=chunk_ids,
            )

        if len(all_verified) > 0:
            # Verified chunks exist but below score threshold
            logger.warning(
                f"[{agent_name}] LOW_CONFIDENCE: {len(all_verified)} verified chunks "
                f"below score threshold {self.min_score}."
            )
            return GroundingResult(
                state=GroundingState.LOW_CONFIDENCE,
                verified_count=len(all_verified),
                total_count=total,
                best_score=best_score,
                reason=f"Verified chunks found but relevance score ({best_score:.3f}) is below threshold.",
                chunk_ids=chunk_ids,
            )

        if total > 0:
            # Chunks exist but none are VERIFIED
            logger.warning(
                f"[{agent_name}] UNVERIFIED_ONLY: {total} chunk(s) returned "
                "but none have VERIFIED status."
            )
            return GroundingResult(
                state=GroundingState.UNVERIFIED_ONLY,
                verified_count=0,
                total_count=total,
                best_score=best_score,
                reason="Retrieved chunks are not verified. Cannot support regulatory claims.",
                chunk_ids=chunk_ids,
            )

        return GroundingResult(
            state=GroundingState.INSUFFICIENT_GROUNDING,
            verified_count=0,
            total_count=total,
            best_score=0.0,
            reason="No verified evidence available.",
            chunk_ids=[],
        )

    def build_evidence_context(
        self,
        results: List[KnowledgeResult],
        max_chars: int = 3000,
    ) -> str:
        """
        Build an evidence context string for injection into prompts.
        Only includes VERIFIED chunks.

        Args:
            results: Retrieved knowledge results.
            max_chars: Approximate character limit for the context block.

        Returns:
            Formatted evidence string for prompt injection.
        """
        verified = [r for r in results if r.verification_status == VerificationStatus.VERIFIED]
        if not verified:
            return "EVIDENCE: None available. Do not make regulatory claims."

        parts = ["VERIFIED EVIDENCE:"]
        total_chars = 0

        for i, chunk in enumerate(verified, 1):
            authority = chunk.authority or "Unknown authority"
            title = chunk.title or "Untitled document"
            chunk_text = (
                f"\n[{i}] Source: {authority} — {title}\n"
                f"    ID: {chunk.chunk_id}\n"
                f"    Text: {chunk.text}\n"
            )
            if total_chars + len(chunk_text) > max_chars:
                parts.append(f"\n[...{len(verified) - i + 1} more verified chunks available]")
                break
            parts.append(chunk_text)
            total_chars += len(chunk_text)

        return "".join(parts)


# Module-level singleton
grounding_checker = GroundingChecker()
