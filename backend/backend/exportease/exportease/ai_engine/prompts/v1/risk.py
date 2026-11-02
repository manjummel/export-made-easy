"""
ai_engine/prompts/v1/risk.py
Risk Agent prompt — v1
"""
from ai_engine.prompts.system_prompt import SYSTEM_PROMPT
from ai_engine.prompts.registry import register_prompt


@register_prompt("risk_agent", "v1")
def build_risk_prompt(product_info: dict, hs_result: dict, target_country: str, evidence: str, language: str = "en") -> str:
    product_name = product_info.get("product_name", "unknown")
    return f"""{SYSTEM_PROMPT}

TASK: Risk Assessment Agent
Assess the export risk for an Indian MSME exporting this product.

PRODUCT: {product_name}
TARGET COUNTRY: {target_country}

{evidence}

INSTRUCTIONS:
- Identify key risk factors (regulatory, logistics, market, financial, quality).
- For each risk: name, severity (LOW/MEDIUM/HIGH/CRITICAL), description, mitigation.
- Compute an overall risk_score (0.0=no risk, 1.0=maximum risk).
- Base risk assessments on verified evidence; flag speculative risks as warnings.
- Respond in {language} where possible; JSON keys must be in English.

OUTPUT (valid JSON only):
{{
  "overall_risk_level": "MEDIUM",
  "risk_score": 0.0,
  "risk_factors": [
    {{"risk_name": "...", "severity": "...", "description": "...", "mitigation": "..."}}
  ],
  "confidence": 0.0,
  "sources": [],
  "warnings": []
}}"""
