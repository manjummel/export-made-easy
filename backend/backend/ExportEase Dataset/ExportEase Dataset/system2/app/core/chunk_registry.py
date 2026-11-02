"""
chunk_registry.py — In-memory registry for logging generated chunks.
"""
from typing import List, Dict, Any

class ChunkRegistry:
    def __init__(self):
        self._chunks: Dict[str, Dict[str, Any]] = {}

    def log_chunks(self, document_id: str, chunks: List[Dict[str, Any]]):
        for chunk in chunks:
            self._chunks[chunk["chunk_id"]] = chunk
            
    def get_chunk(self, chunk_id: str) -> Dict[str, Any]:
        return self._chunks.get(chunk_id)

    def get_all(self) -> List[Dict[str, Any]]:
        return list(self._chunks.values())

# Singleton
_chunk_registry = ChunkRegistry()

def get_chunk_registry() -> ChunkRegistry:
    return _chunk_registry
