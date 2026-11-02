"""
scripts/evaluate_baseline.py

Baseline evaluation system for the base Qwen model.
Runs 10 export-domain test queries and records the baseline performance metrics.
Saves results to evaluation/baseline_results.json.
"""

import asyncio
import json
import time
from uuid import uuid4
from pathlib import Path

# In a real environment, this would hit the API or invoke the model directly.
# Since we might not have a running server during script execution, we'll hit the API.
API_URL = "http://localhost:8001/api/v1/ai/analyze"
MODEL_STATUS_URL = "http://localhost:8001/api/v1/model/status"

QUERIES = [
    # 1. Product
    "I want to export basmati rice. What is the product classification?",
    # 2. HS
    "What is the HS code for generic black tea?",
    # 3. Compliance
    "What are the compliance requirements for exporting pharmaceuticals to the US?",
    # 4. Documents
    "What documents do I need to export textiles to the UK?",
    # 5. Certification
    "What certifications are required to export organic honey to the EU?",
    # 6. Market
    "Is there a good market for Indian spices in Germany?",
    # 7. Risk
    "What are the risks of exporting electronics to Brazil?",
    # 8. Planning
    "Give me a step-by-step plan to export leather goods to Australia.",
    # 9. Multilingual
    "Me turmeric powder Germany ko export karna chahta hu, kya process hai?",
    # 10. Structured output
    "Provide a structured JSON output of the exact HS code and duty rate for exporting mangoes to the UAE."
]

async def run_evaluation():
    import httpx
    print("=" * 50)
    print("ExportEase Baseline Evaluation")
    print("=" * 50)
    
    # 1. Get model status to record versions
    model_version = "unknown"
    tokenizer_version = "unknown"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(MODEL_STATUS_URL, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                model_version = data.get("model_version", "unknown")
                tokenizer_version = data.get("tokenizer_version", "unknown")
    except Exception as e:
        print(f"Warning: Could not fetch model status: {e}")

    results = []

    async with httpx.AsyncClient() as client:
        for i, q in enumerate(QUERIES, 1):
            print(f"Running query {i}/{len(QUERIES)}: {q[:50]}...")
            
            request_id = str(uuid4())
            payload = {
                "request_id": request_id,
                "project_id": "eval-baseline",
                "language": "en",
                "query": q,
                "target_country": "Unknown" # will be inferred or prompted
            }
            
            start_time = time.time()
            try:
                resp = await client.post(API_URL, json=payload, timeout=30.0)
                latency = time.time() - start_time
                
                # Mock token counts since we can't easily extract them from the common envelope without modifying it
                # In a real environment with the real model, these would be returned in the trace
                input_tokens = len(q.split()) * 2
                output_tokens = len(resp.text.split()) * 2 if resp.status_code == 200 else 0
                
                res_data = {
                    "query": q,
                    "request_id": request_id,
                    "model_version": model_version,
                    "tokenizer_version": tokenizer_version,
                    "latency_seconds": round(latency, 3),
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "http_status": resp.status_code,
                    "result": resp.json() if resp.status_code == 200 else resp.text
                }
            except Exception as e:
                res_data = {
                    "query": q,
                    "request_id": request_id,
                    "model_version": model_version,
                    "tokenizer_version": tokenizer_version,
                    "latency_seconds": round(time.time() - start_time, 3),
                    "error": str(e)
                }
            
            results.append(res_data)
            
    # Save results
    out_dir = Path("evaluation")
    out_dir.mkdir(exist_ok=True)
    out_file = out_dir / "baseline_results.json"
    
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
        
    print(f"\n[SUCCESS] Baseline evaluation complete. Results saved to {out_file}")


if __name__ == "__main__":
    asyncio.run(run_evaluation())
