"""
ai_engine/safety/hallucination_guard.py

Detects hallucinated patterns, urls, or unverified claims in model responses.
"""

import re
from typing import List

class HallucinationGuard:
    """
    Inspects generated text to detect attempts to guess HS codes or invent DGFT rules.
    """
    
    ADVERSARIAL_PATTERNS = [
        r"guess.*hs code",
        r"invent.*dgft",
        r"make up.*rule",
        r"fake.*regulation",
        r"claim.*without evidence"
    ]

    @staticmethod
    def is_hallucinating(text: str) -> bool:
        """
        Returns True if the output text seems to contain hallucinated or guessed claims.
        """
        # If output claims to guess an HS code
        if "guessing the hs code" in text.lower() or "invented rule" in text.lower():
            return True
            
        # Detect fake URLs
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text)
        for url in urls:
            if "example.com" in url or "fakeurl" in url:
                return True
                
        return False
