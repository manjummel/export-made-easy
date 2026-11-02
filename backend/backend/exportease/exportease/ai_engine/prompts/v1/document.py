"""
ai_engine/prompts/v1/document.py
Document Agent prompt — v1
"""
from ai_engine.prompts.system_prompt import SYSTEM_PROMPT
from ai_engine.prompts.registry import register_prompt


@register_prompt("document_agent", "v1")
def build_document_prompt(product_info: dict, hs_result: dict, target_country: str, evidence: str, language: str = "en") -> str:
    product_name = product_info.get("product_name", "unknown")
    hs_code = hs_result.get("hs_code", "unknown")
    return f"""{SYSTEM_PROMPT}

TASK: Document Agent
List all required export documents for the following shipment.

PRODUCT: {product_name}
HS CODE: {hs_code}
DESTINATION: {target_country}

{evidence}

INSTRUCTIONS:
- Separate required_documents (mandatory) from optional_documents.
- For each document: name, issuing authority, description, estimated processing days.
- Only list documents backed by verified evidence.
- Do NOT invent government procedures or document types.
- Respond in {language} where possible; JSON keys must be in English.

OUTPUT (valid JSON only):
{{
  "required_documents": [
    {{"document_name": "...", "issuing_authority": "...", "mandatory": true, "description": "...", "estimated_processing_days": 0}}
  ],
  "optional_documents": [],
  "confidence": 0.0,
  "sources": [],
  "warnings": []
}}"""
