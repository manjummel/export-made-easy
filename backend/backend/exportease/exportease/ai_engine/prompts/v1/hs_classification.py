"""
ai_engine/prompts/v1/hs_classification.py
HS Classification Agent prompt — v1
"""
from ai_engine.prompts.system_prompt import SYSTEM_PROMPT
from ai_engine.prompts.registry import register_prompt


@register_prompt("hs_agent", "v1")
def build_hs_prompt(product_info: dict, evidence: str, language: str = "en") -> str:
    product_name = product_info.get("product_name", "unknown product")
    product_desc = product_info.get("product_description", "")
    return f"""{SYSTEM_PROMPT}

TASK: HS Code Classification Agent
Classify the following product under the Harmonized System (HS) nomenclature.

PRODUCT: {product_name}
DESCRIPTION: {product_desc}

{evidence}

INSTRUCTIONS:
- Use ONLY the verified evidence above to determine the HS code.
- If evidence does not support a specific code, state LOW_CONFIDENCE in warnings.
- Do NOT invent HS codes. Provide alternative_codes only when evidence supports them.
- Output chapter (2-digit), heading (4-digit), and subheading (6-digit) separately.
- Respond in {language} where possible; JSON keys must be in English.

OUTPUT (valid JSON only):
{{
  "hs_code": "...",
  "hs_description": "...",
  "chapter": "...",
  "heading": "...",
  "subheading": "...",
  "confidence": 0.0,
  "sources": [],
  "warnings": [],
  "alternative_codes": []
}}"""
