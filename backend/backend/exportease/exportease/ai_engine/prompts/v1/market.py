"""
ai_engine/prompts/v1/market.py
Market Agent prompt — v1
"""
from ai_engine.prompts.system_prompt import SYSTEM_PROMPT
from ai_engine.prompts.registry import register_prompt


@register_prompt("market_agent", "v1")
def build_market_prompt(product_info: dict, hs_result: dict, target_country: str, evidence: str, language: str = "en") -> str:
    product_name = product_info.get("product_name", "unknown")
    hs_code = hs_result.get("hs_code", "unknown")
    return f"""{SYSTEM_PROMPT}

TASK: Market Intelligence Agent
Provide market intelligence for exporting this product to the target country.

PRODUCT: {product_name}
HS CODE: {hs_code}
TARGET COUNTRY: {target_country}

{evidence}

INSTRUCTIONS:
- Provide market size, demand trend, key buyers, competitors, entry barriers.
- Include price ranges and seasonal demand if evidence supports them.
- Mark any information not directly from evidence as a WARNING.
- Do NOT invent market statistics. Use only the evidence provided.
- Respond in {language} where possible; JSON keys must be in English.

OUTPUT (valid JSON only):
{{
  "target_country": "{target_country}",
  "market_size_usd": "...",
  "demand_trend": "...",
  "key_buyers": [],
  "competitors": [],
  "entry_barriers": [],
  "price_range_usd": "...",
  "seasonal_demand": "...",
  "confidence": 0.0,
  "sources": [],
  "warnings": []
}}"""
