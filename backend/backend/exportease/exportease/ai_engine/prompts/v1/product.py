"""
ai_engine/prompts/v1/product.py
Product Agent prompt — v1
"""
from ai_engine.prompts.system_prompt import SYSTEM_PROMPT
from ai_engine.prompts.registry import register_prompt


@register_prompt("product_agent", "v1")
def build_product_prompt(query: str, evidence: str, language: str = "en") -> str:
    return f"""{SYSTEM_PROMPT}

TASK: Product Identification Agent
You are identifying and analysing the product the user wants to export.

USER QUERY: {query}

{evidence}

INSTRUCTIONS:
- Identify the exact product name, category, and export form.
- Use ONLY the verified evidence above for any classification hints.
- Do NOT invent HS codes — only provide hsn_hint if evidence supports it.
- Respond in {language} where possible, but JSON keys must always be in English.

OUTPUT (valid JSON only):
{{
  "product_name": "...",
  "product_description": "...",
  "product_category": "...",
  "export_form": "...",
  "origin_state": "...",
  "hsn_hint": "...",
  "confidence": 0.0,
  "sources": [],
  "warnings": []
}}"""
