"""
ai_engine/safety/output_validator.py

Validates final agent outputs before sending them back in the response envelope.
"""

from ai_engine.safety.hallucination_guard import HallucinationGuard

class OutputValidator:
    
    @staticmethod
    def validate(text: str) -> bool:
        """
        Validates the text output.
        Returns False if the output fails safety/hallucination checks.
        """
        if not text or len(text.strip()) == 0:
            return False
            
        if HallucinationGuard.is_hallucinating(text):
            return False
            
        return True
