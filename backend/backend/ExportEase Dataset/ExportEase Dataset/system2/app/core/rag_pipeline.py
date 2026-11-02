"""
rag_pipeline.py — Full RAG orchestration for EXPORT-EASE-KNOWLEDGE-V1

Orchestrates the end-to-end pipeline:
  1. Receive natural language query
  2. Embed the query
  3. Retrieve relevant chunks from Qdrant
  4. Build grounded answer (source-cited)
  5. Return QueryResponse with sources

System 1 (LLM + Multi-Agent) calls POST /v1/knowledge/query which invokes
this pipeline. System 2 handles all Qdrant interaction; System 1 never
touches Qdrant.
"""

from __future__ import annotations

import logging
import time
import uuid
from typing import List, Optional

from app.core.embeddings import EmbeddingProvider, get_embedding_provider
from app.core.retriever import QdrantRetriever, RetrievalConfig, get_retriever
from app.models.requests import MetadataFilters, QueryRequest, SearchRequest
from app.models.responses import QueryResponse, SearchResponse, NormalizedRecord

logger = logging.getLogger(__name__)


class RAGPipeline:
    """
    Full Retrieval-Augmented Generation pipeline.

    In the current implementation, the "generation" step is handled by
    System 1 (which has access to LLMs). System 2's role is:
      1. Embed the query
      2. Retrieve relevant chunks (with source citations)
      3. Return the grounded context to System 1

    When System 1 is not involved (direct /v1/knowledge/query call),
    System 2 returns a structured answer built from the retrieved context
    without an external LLM call.
    """

    def __init__(
        self,
        retriever: Optional[QdrantRetriever] = None,
        embedding_provider: Optional[EmbeddingProvider] = None,
    ) -> None:
        self._retriever = retriever or get_retriever()
        self._embedder = embedding_provider or get_embedding_provider()

    # ── Public API ────────────────────────────────────────────────────────────

    async def query(self, request: QueryRequest) -> QueryResponse:
        """
        Full RAG query pipeline.
        Returns a grounded answer with source citations.
        """
        start_time = time.perf_counter()
        query_id = uuid.uuid4()

        logger.info("RAG query started — id=%s query='%s...'", query_id, request.query[:60])

        # Step 1: Embed query
        query_vector = self._embedder.embed_text(request.query)

        # Step 2: Retrieve relevant chunks
        config = RetrievalConfig(
            collection=request.collection,
            top_k=request.top_k,
            score_threshold=request.score_threshold,
            retrieval_mode=request.retrieval_mode,
            filters=request.filters,
        )
        sources = self._retriever.retrieve(query_vector=query_vector, config=config)

        # Step 3: Build grounded answer from retrieved context
        answer = self._build_answer(request.query, sources)

        latency_ms = (time.perf_counter() - start_time) * 1000
        logger.info(
            "RAG query complete — id=%s retrieved=%d latency=%.1fms",
            query_id, len(sources), latency_ms,
        )

        return QueryResponse(
            query_id=query_id,
            answer=answer,
            sources=sources if request.include_sources else [],
            retrieval_count=len(sources),
            latency_ms=round(latency_ms, 2),
            model_used=self._embedder.model_name,
        )

    async def search(self, request: SearchRequest) -> SearchResponse:
        """
        Pure semantic search — retrieves chunks without generation.
        Used by System 1 when it wants raw context chunks for its own LLM.
        """
        start_time = time.perf_counter()

        query_vector = self._embedder.embed_text(request.query)
        config = RetrievalConfig(
            collection=request.collection,
            top_k=request.top_k,
            score_threshold=request.score_threshold,
            retrieval_mode="hybrid",
            filters=request.filters,
        )
        results = self._retriever.retrieve(query_vector=query_vector, config=config)
        latency_ms = (time.perf_counter() - start_time) * 1000

        return SearchResponse(
            query=request.query,
            results=results,
            total_results=len(results),
            latency_ms=round(latency_ms, 2),
        )

    # ── Ingestion helpers ─────────────────────────────────────────────────────

    def embed_and_prepare_chunks(
        self,
        chunks: List[str],
        document_id: str,
        metadata: dict,
        collection: str,
    ) -> List[dict]:
        """
        Embed a list of text chunks and prepare them for Qdrant upsert.
        Returns a list of {id, vector, payload} dicts.
        """
        vectors = self._embedder.embed_batch(chunks)
        prepared = []
        for i, (chunk_text, vector) in enumerate(zip(chunks, vectors)):
            chunk_id = f"{document_id}-chunk-{i:04d}"
            prepared.append({
                "id": abs(hash(chunk_id)) % (2**63),  # Qdrant requires uint64
                "vector": vector,
                "payload": {
                    "document_id": document_id,
                    "chunk_id": chunk_id,
                    "chunk_index": i,
                    "content": chunk_text,
                    **metadata,
                },
            })
        return prepared

    # ── Answer builder ────────────────────────────────────────────────────────

    def _build_answer(self, query: str, sources: List[NormalizedRecord]) -> str:
        """
        Build a structured, source-cited answer from retrieved chunks.
        This is a lightweight template-based answer used when no external
        LLM is available. System 1 will augment this with full LLM generation.
        """
        if not sources:
            return (
                f"No relevant export compliance information found for: '{query}'. "
                "Please try refining your query or ingesting more documents."
            )

        # Build answer from top-scoring sources
        context_parts = []
        for i, src in enumerate(sources[:3], 1):
            score_pct = int(src.score * 100) if src.score else 0
            doc_type = "document"
            jurisdiction = ", ".join(src.country) if src.country else ""
            
            context_parts.append(
                f"[{i}] ({doc_type.upper()}"
                + (f" | {jurisdiction}" if jurisdiction else "")
                + f" | relevance: {score_pct}%)\n{src.text}"
            )

        context = "\n\n".join(context_parts)
        return (
            f"Based on {len(sources)} retrieved export compliance document(s), "
            f"here is the relevant information for your query:\n\n{context}\n\n"
            f"Sources: {len(sources)} document chunk(s) retrieved from the ExportEase Knowledge Base."
        )


# ── Singleton ─────────────────────────────────────────────────────────────────
_pipeline_instance: Optional[RAGPipeline] = None


def get_rag_pipeline() -> RAGPipeline:
    """Return the process-level RAGPipeline singleton."""
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = RAGPipeline()
    return _pipeline_instance
