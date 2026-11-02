"""
scripts/check_environment.py

Verifies the ML environment as required by PROMPT 02:
1. Python version
2. PyTorch version & CUDA availability
3. GPU model
4. VRAM
5. Transformers
6. PEFT
7. TRL
8. BitsAndBytes
9. LangGraph
10. Shared contracts
11. Knowledge service connectivity
12. Backend connectivity
"""

import sys
import importlib
import asyncio
from pathlib import Path

def print_section(title):
    print(f"\n{'='*50}\n{title}\n{'-'*50}")

def check_module(module_name: str, display_name: str = None) -> bool:
    name = display_name or module_name
    try:
        mod = importlib.import_module(module_name)
        version = getattr(mod, '__version__', 'unknown')
        print(f"[OK] {name:<20} : {version}")
        return True
    except ImportError:
        print(f"[FAIL] {name:<20} : NOT FOUND")
        return False

async def verify_connectivity():
    import httpx
    # Using the mock URLs configured in .env.example
    services = {
        "AI Engine Local": "http://localhost:8001/health",
        "Knowledge Service": "http://localhost:8002/health",
        "Backend Service": "http://localhost:8003/health"
    }
    
    for name, url in services.items():
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, timeout=3.0)
                status = "REACHABLE" if resp.status_code == 200 else f"UNAVAILABLE (HTTP {resp.status_code})"
                print(f"{name:<25} : {status}")
        except Exception as e:
            print(f"{name:<25} : UNAVAILABLE ({type(e).__name__})")

def main():
    print_section("1. Python Environment")
    print(f"Python Version: {sys.version.split()[0]}")

    print_section("2. PyTorch & CUDA")
    if check_module("torch", "PyTorch"):
        import torch
        cuda_available = torch.cuda.is_available()
        print(f"CUDA Available: {cuda_available}")
        
        print_section("3 & 4. GPU & VRAM")
        if cuda_available:
            for i in range(torch.cuda.device_count()):
                props = torch.cuda.get_device_properties(i)
                vram_gb = props.total_memory / (1024**3)
                print(f"GPU {i}: {props.name} | VRAM: {vram_gb:.2f} GB")
        else:
            print("No CUDA GPUs found.")

    print_section("ML Libraries (5-10)")
    check_module("transformers", "Transformers")
    check_module("peft", "PEFT")
    check_module("trl", "TRL")
    check_module("bitsandbytes", "BitsAndBytes")
    check_module("langgraph", "LangGraph")
    check_module("pydantic", "Pydantic")

    print_section("11. Shared Contracts")
    contracts_dir = Path("contracts")
    if contracts_dir.exists() and (contracts_dir / "VERSION").exists():
        ver = (contracts_dir / "VERSION").read_text().strip()
        print(f"[OK] Contracts loaded. Version: {ver}")
    else:
        print("[FAIL] Shared contracts directory not found or invalid.")

    print_section("12 & 13. Service Connectivity")
    asyncio.run(verify_connectivity())
    print("="*50)


if __name__ == "__main__":
    main()
