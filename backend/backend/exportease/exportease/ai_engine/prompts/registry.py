"""
ai_engine/prompts/registry.py

Prompt version registry.
Each agent has a versioned prompt template.
Templates are selected by agent name and version.
"""

from __future__ import annotations

import logging
from typing import Callable, Dict, Optional

logger = logging.getLogger(__name__)

# Registry: (agent_name, version) -> prompt builder function
_REGISTRY: Dict[tuple, Callable] = {}


def register_prompt(agent_name: str, version: str = "v1"):
    """Decorator to register a prompt builder function."""
    def decorator(fn: Callable) -> Callable:
        key = (agent_name, version)
        _REGISTRY[key] = fn
        logger.debug(f"Registered prompt: agent={agent_name} version={version}")
        return fn
    return decorator


def get_prompt_builder(agent_name: str, version: str = "v1") -> Optional[Callable]:
    """Get a registered prompt builder by agent name and version."""
    key = (agent_name, version)
    builder = _REGISTRY.get(key)
    if not builder:
        logger.warning(f"No prompt found for agent={agent_name} version={version}")
    return builder


def list_registered_prompts() -> Dict[str, str]:
    """List all registered prompts."""
    return {f"{k[0]}@{k[1]}": str(fn.__module__) for k, fn in _REGISTRY.items()}


# ---------------------------------------------------------------------------
# Auto-register all v1 prompts at import time
# ---------------------------------------------------------------------------

def _auto_register():
    """Import all v1 prompt modules to trigger @register_prompt decorators."""
    from ai_engine.prompts.v1 import (
        product,
        hs_classification,
        compliance,
        document,
        certification,
        market,
        risk,
        export_planner,
    )
    logger.debug(f"Auto-registered {len(_REGISTRY)} prompt templates.")


_auto_register()
