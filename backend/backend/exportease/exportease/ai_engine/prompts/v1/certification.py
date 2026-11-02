"""
ai_engine/prompts/v1/certification.py
Certification Agent prompt — v1
"""
from ai_engine.prompts.system_prompt import SYSTEM_PROMPT
from ai_engine.prompts.registry import register_prompt


@register_prompt("certification_agent", "v1")
def build_certification_prompt(product_info: dict, hs_result: dict, target_country: str, evidence: str, language: str = "en") -> str:
    product_name = product_info.get("product_name", "unknown")
    hs_code = hs_result.get("hs_code", "unknown")
    return f"""{SYSTEM_PROMPT}

TASK: Certification Agent
Identify all certifications required or recommended to export this product from India.

PRODUCT: {product_name}
HS CODE: {hs_code}
TARGET COUNTRY: {target_country}

{evidence}

INSTRUCTIONS:
- List mandatory certifications separately from recommended/optional ones.
- For each: certification name, issuing body, description, estimated cost (INR), validity months.
- Only reference certifications backed by verified evidence.
- Do NOT invent certification bodies or requirements.
- Respond in {language} where possible; JSON keys must be in English.

OUTPUT (valid JSON only):
{{
  "certifications": [
    {{"certification_name": "...", "issuing_body": "...", "mandatory": true, "description": "...", "estimated_cost_inr": 0, "validity_months": null}}
  ],
  "confidence": 0.0,
  "sources": [],
  "warnings": []
}}"""
