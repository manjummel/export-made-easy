"""
ai_engine/safety/grounding_policy.py

Enforces the core rule:
NO VERIFIED EVIDENCE = NO VERIFIED REGULATORY CLAIM

Translates "INSUFFICIENT_GROUNDING" into "INSUFFICIENT_EVIDENCE".
"""

from ai_engine.safety.grounding import GroundingState, GroundingResult

class GroundingPolicy:
    
    @staticmethod
    def enforce(result: GroundingResult) -> str:
        """
        Translates grounding states to final contract-approved safety statuses.
        """
        if result.state == GroundingState.INSUFFICIENT_GROUNDING:
            # Map contract-approved status
            return "INSUFFICIENT_EVIDENCE"
        elif result.state == GroundingState.LOW_CONFIDENCE:
            return "LOW_CONFIDENCE"
        elif result.state == GroundingState.UNVERIFIED_ONLY:
            return "UNVERIFIED_ONLY"
        return "SUFFICIENT"
