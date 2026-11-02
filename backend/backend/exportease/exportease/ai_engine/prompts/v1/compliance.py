"""
ai_engine/prompts/v1/compliance.py
Compliance Agent prompt — v1
"""
from ai_engine.prompts.system_prompt import SYSTEM_PROMPT
from ai_engine.prompts.registry import register_prompt


@register_prompt("compliance_agent", "v1")
def build_compliance_prompt(product_info: dict, hs_result: dict, target_country: str, evidence: str, language: str = "en") -> str:
    product_name = product_info.get("product_name", "unknown")
    hs_code = hs_result.get("hs_code", "unknown")
    return f"""{SYSTEM_PROMPT}

TASK: Compliance Agent
Identify all export compliance requirements for exporting this product from India to the target country.

PRODUCT: {product_name}
HS CODE: {hs_code}
TARGET COUNTRY: {target_country}

{evidence}

INSTRUCTIONS:
- List ALL mandatory compliance requirements backed by verified evidence.
- Separately list export restrictions (India side) and import restrictions (target country side).
- Set grounding_status to "INSUFFICIENT_GROUNDING" if verified evidence is absent.
- NEVER invent regulations. If no verified regulation is found, say so in warnings.
- Each requirement must reference its source_id from the evidence above.
- Respond in {language} where possible; JSON keys must be in English.

OUTPUT (valid JSON only):
{{
  "target_country": "{target_country}",
  "requirements": [
    {{"regulation_name": "...", "authority": "...", "description": "...", "mandatory": true, "source_id": "..."}}
  ],
  "export_restrictions": [],
  "import_restrictions": [],
  "confidence": 0.0,
  "sources": [],
  "warnings": [],
  "grounding_status": "SUFFICIENT"
}}"""
