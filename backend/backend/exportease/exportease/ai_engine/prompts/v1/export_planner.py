"""
ai_engine/prompts/v1/export_planner.py
Export Planner Agent prompt — v1
"""
from ai_engine.prompts.system_prompt import SYSTEM_PROMPT
from ai_engine.prompts.registry import register_prompt


@register_prompt("planner_agent", "v1")
def build_planner_prompt(
    product_info: dict,
    hs_result: dict,
    target_country: str,
    compliance_summary: str,
    document_summary: str,
    cert_summary: str,
    risk_summary: str,
    evidence: str,
    language: str = "en",
) -> str:
    product_name = product_info.get("product_name", "unknown")
    hs_code = hs_result.get("hs_code", "unknown")
    return f"""{SYSTEM_PROMPT}

TASK: Export Planner Agent
Generate a comprehensive, step-by-step export plan for an Indian MSME.

PRODUCT: {product_name} (HS: {hs_code})
DESTINATION: {target_country}
COMPLIANCE SUMMARY: {compliance_summary}
DOCUMENTS NEEDED: {document_summary}
CERTIFICATIONS: {cert_summary}
RISK LEVEL: {risk_summary}

{evidence}

INSTRUCTIONS:
- Create a numbered, sequenced export action plan.
- Each step: number, title, description, estimated_days, estimated_cost_inr, dependencies (step numbers).
- Recommend Incoterms and payment terms appropriate for an MSME first-time exporter.
- Total estimated days and total cost must be calculated from steps.
- Include ONLY guidance backed by verified evidence or standard trade practice.
- Flag any recommendations that need expert verification as warnings.
- Respond in {language} where possible; JSON keys must be in English.

OUTPUT (valid JSON only):
{{
  "export_plan_summary": "...",
  "steps": [
    {{"step_number": 1, "title": "...", "description": "...", "estimated_days": 0, "estimated_cost_inr": 0, "dependencies": []}}
  ],
  "total_estimated_days": 0,
  "total_estimated_cost_inr": 0,
  "recommended_incoterms": "...",
  "recommended_payment_terms": "...",
  "confidence": 0.0,
  "sources": [],
  "warnings": []
}}"""
