"""
rejected_registry.py — In-memory log of rejected records.
"""
from typing import List, Dict, Any

class RejectedRegistry:
    def __init__(self):
        self._rejected: List[Dict[str, Any]] = []

    def log_rejected(self, document_id: str, records: List[Dict[str, Any]]):
        self._rejected.extend(records)
        
    def get_all(self) -> List[Dict[str, Any]]:
        return self._rejected

# Singleton
_rejected_registry = RejectedRegistry()

def get_rejected_registry() -> RejectedRegistry:
    return _rejected_registry
