# ============================================================
# ExportEase AI — Chatbot Intent Classifier
# ============================================================
"""
Classifies user messages into intent categories to determine
whether to use Generic Knowledge Mode or Agentic Intelligence Mode.
This is a pure rule-based + keyword classifier (no external LLM call needed).
Lightweight and fast — runs before every message.
"""
from __future__ import annotations

import re
from enum import Enum
from typing import List, Optional, Tuple


class ChatIntent(str, Enum):
    GENERAL_INFO    = "general_info"       # "What is an HS Code?"
    REGULATORY      = "regulatory"         # "What are India's export regulations?"
    PERSONALIZED    = "personalized"       # "I want to export rice to UAE"
    DOCUMENT        = "document"           # "Generate commercial invoice"
    GREETING        = "greeting"           # "Hi", "Hello"
    CLARIFICATION   = "clarification"      # Ambiguous — needs follow-up questions
    EXPERT_TOGGLE   = "expert_toggle"      # "Switch to expert mode"
    BEGINNER_TOGGLE = "beginner_toggle"    # "Explain simply / beginner mode"


# ── Keyword Rules ─────────────────────────────────────────────────────────────

_GREETING_PATTERNS = [
    r"^(hi|hello|hey|good\s+\w+|namaste|hola|bonjour|salut)[\s!?.]*$"
]

_GENERAL_INFO_KEYWORDS = [
    "what is", "what are", "explain", "define", "tell me about",
    "how does", "how do", "difference between", "meaning of",
    "describe", "overview", "basics", "beginner", "introduction",
    "incoterms", "fob", "cif", "exw", "ddp", "dap", "fca",
    "bill of lading", "air waybill", "certificate of origin",
    "shipping bill", "commercial invoice", "packing list",
    "letter of credit", "advance payment", "open account",
    "freight", "container", "customs clearance", "warehousing",
    "hs code", "tariff", "fta", "trade agreement",
    "export process", "how to export", "benefits of export",
    "export business", "export challenges",
]

_REGULATORY_KEYWORDS = [
    "regulation", "policy", "rule", "law", "compliance",
    "dgft", "icegate", "cbic", "rbi", "apeda", "fssai",
    "restriction", "ban", "prohibited", "license", "permit",
    "certificate", "standard", "notification", "circular",
    "rodtep", "meis", "epcg", "advance authorization",
    "customs duty", "import duty", "gst", "fema", "forex",
    "country requirements", "india export", "export from india",
]

_PERSONALIZED_KEYWORDS = [
    "i want to export", "i manufacture", "i produce", "i sell",
    "my product", "my company", "our product", "we export",
    "help me export", "start exporting", "export my",
    "which country should", "best market for", "suggest market",
    "export plan for", "export strategy for",
]

_DOCUMENT_KEYWORDS = [
    "generate", "create", "draft", "write", "fill",
    "invoice", "packing list", "document", "certificate",
    "form", "template", "download", "format",
    "shipping bill", "declaration", "letter of credit",
]

_EXPERT_PATTERNS = [
    r"expert mode", r"advanced mode", r"technical", r"switch to expert",
]

_BEGINNER_PATTERNS = [
    r"beginner mode", r"simple", r"simply", r"easy", r"layman",
    r"explain simply", r"explain in simple", r"switch to beginner",
]


class IntentClassifier:
    """
    Rule-based intent classifier for export chatbot messages.
    Returns (ChatIntent, confidence, reasoning).
    """

    def classify(
        self, message: str, conversation_history: Optional[List[dict]] = None
    ) -> Tuple[ChatIntent, float, str]:
        """
        Classify a user message.
        Returns (intent, confidence_0_to_1, reasoning_string).
        """
        text = message.lower().strip()

        # Greeting
        for pattern in _GREETING_PATTERNS:
            if re.match(pattern, text):
                return (ChatIntent.GREETING, 1.0, "Greeting detected")

        # Mode toggles
        for p in _EXPERT_PATTERNS:
            if re.search(p, text):
                return (ChatIntent.EXPERT_TOGGLE, 0.95, "Expert mode toggle")
        for p in _BEGINNER_PATTERNS:
            if re.search(p, text):
                return (ChatIntent.BEGINNER_TOGGLE, 0.95, "Beginner mode toggle")

        # Score each category
        scores = {
            ChatIntent.GENERAL_INFO:  self._score(text, _GENERAL_INFO_KEYWORDS),
            ChatIntent.REGULATORY:    self._score(text, _REGULATORY_KEYWORDS),
            ChatIntent.PERSONALIZED:  self._score(text, _PERSONALIZED_KEYWORDS),
            ChatIntent.DOCUMENT:      self._score(text, _DOCUMENT_KEYWORDS),
        }

        best_intent = max(scores, key=scores.__getitem__)
        best_score  = scores[best_intent]

        # If no strong signal, check if it's too short/vague → clarification
        if best_score < 0.15 or (len(text.split()) < 4 and best_score < 0.3):
            return (ChatIntent.CLARIFICATION, 0.6, "Message too vague — follow-up needed")

        confidence = min(1.0, best_score * 2)  # normalize to ~0-1 range
        reasoning  = f"Matched {best_intent.value} keywords (score={best_score:.2f})"
        return (best_intent, confidence, reasoning)

    def _score(self, text: str, keywords: List[str]) -> float:
        """Compute keyword match score (0–1)."""
        hits = sum(1 for kw in keywords if kw in text)
        return hits / max(len(keywords), 1)

    def needs_clarification(self, message: str) -> List[str]:
        """Return smart follow-up questions for vague export messages."""
        text = message.lower()
        questions = []
        if "export" in text and len(message.split()) < 6:
            if "product" not in text and "what" not in text:
                questions.append("What product are you planning to export?")
            if "country" not in text and "where" not in text:
                questions.append("Which country are you targeting?")
            if not questions:
                questions.append("Are you a beginner exporter or do you already export?")
        return questions or [
            "Could you provide more details about your export query?",
            "What specific aspect of exporting would you like help with?",
        ]


# Language detection (lightweight)
def detect_language(text: str) -> str:
    """Detect language from text. Returns ISO 639-1 code."""
    # Simple heuristic — detect Devanagari, Arabic, CJK, Latin scripts
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"   # Hindi / Devanagari
    if re.search(r'[\u0600-\u06FF]', text):
        return "ar"   # Arabic
    if re.search(r'[\u4E00-\u9FFF]', text):
        return "zh"   # Chinese
    if re.search(r'[\u0B80-\u0BFF]', text):
        return "ta"   # Tamil
    if re.search(r'[\u0C00-\u0C7F]', text):
        return "te"   # Telugu
    if re.search(r'[\u0C80-\u0CFF]', text):
        return "kn"   # Kannada
    if re.search(r'[\u0D00-\u0D7F]', text):
        return "ml"   # Malayalam
    return "en"       # Default English


# Singleton
_classifier: Optional[IntentClassifier] = None

def get_intent_classifier() -> IntentClassifier:
    global _classifier
    if _classifier is None:
        _classifier = IntentClassifier()
    return _classifier
