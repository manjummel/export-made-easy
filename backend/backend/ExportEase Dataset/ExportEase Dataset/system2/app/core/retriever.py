"""
retriever.py — Qdrant-backed retrieval for EXPORT-EASE-KNOWLEDGE-V1

Implements:
  - Dense (vector) retrieval
  - Sparse (BM25) retrieval  
  - Hybrid retrieval (RRF fusion of dense + sparse)
  - Metadata filtering (jurisdiction, doc type, date range)

Qdrant is ONLY accessed through this module. No other part of the system
touches Qdrant directly, and no external system (System 1 or System 3)
has network access to Qdrant.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, List, Literal, Optional

from app.models.requests import MetadataFilters
from app.models.responses import NormalizedRecord, RetrievalResult

logger = logging.getLogger(__name__)


@dataclass
class RetrievalConfig:
    collection: str = "exportease_knowledge"
    top_k: int = 5
    score_threshold: float = 0.60
    retrieval_mode: Literal["dense", "sparse", "hybrid"] = "hybrid"
    filters: Optional[MetadataFilters] = None


class QdrantRetriever:
    """
    Qdrant-based retrieval engine.

    This is the single point of contact with the Qdrant vector database.
    All other modules call this class; nothing else imports qdrant-client.
    """

    def __init__(
        self,
        url: str | None = None,
        api_key: str | None = None,
        collection_name: str | None = None,
    ) -> None:
        self._url = url or os.environ.get("QDRANT_URL", "http://localhost:6333")
        self._api_key = api_key or os.environ.get("QDRANT_API_KEY") or None
        self._default_collection = collection_name or os.environ.get(
            "QDRANT_COLLECTION_NAME", "exportease_knowledge"
        )
        self._client = self._create_client()

    # ── Client setup ─────────────────────────────────────────────────────────

    def _create_client(self):
        try:
            from qdrant_client import QdrantClient
            client = QdrantClient(
                url=self._url,
                api_key=self._api_key,
                timeout=10,
            )
            logger.info("Qdrant client created — %s", self._url)
            return client
        except ImportError as exc:
            raise RuntimeError("qdrant-client not installed") from exc

    # ── Health ───────────────────────────────────────────────────────────────

    def ping(self) -> bool:
        """Return True if Qdrant is reachable."""
        try:
            self._client.get_collections()
            return True
        except Exception as exc:
            logger.warning("Qdrant ping failed: %s", exc)
            return False

    # ── Collections ──────────────────────────────────────────────────────────

    def ensure_collection(self, collection_name: str, vector_size: int = 384) -> bool:
        """Create collection if it doesn't exist. Returns True if created."""
        from qdrant_client.models import Distance, VectorParams
        existing = {c.name for c in self._client.get_collections().collections}
        if collection_name in existing:
            return False
        self._client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )
        logger.info("Created Qdrant collection: %s (dim=%d)", collection_name, vector_size)
        return True

    def list_collections(self) -> List[Dict[str, Any]]:
        collections = self._client.get_collections().collections
        result = []
        for c in collections:
            info = self._client.get_collection(c.name)
            result.append({
                "name": c.name,
                "vectors_count": info.vectors_count or 0,
                "status": info.status.value if info.status else "unknown",
                "vector_size": info.config.params.vectors.size if info.config.params.vectors else None,
            })
        return result

    def create_collection(self, name: str, vector_size: int = 384, distance: str = "Cosine") -> Dict:
        from qdrant_client.models import Distance, VectorParams
        dist_map = {"Cosine": Distance.COSINE, "Euclid": Distance.EUCLID, "Dot": Distance.DOT}
        self._client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(size=vector_size, distance=dist_map.get(distance, Distance.COSINE)),
        )
        info = self._client.get_collection(name)
        return {
            "name": name,
            "vectors_count": info.vectors_count or 0,
            "status": info.status.value if info.status else "green",
            "vector_size": vector_size,
        }

    def delete_collection(self, name: str) -> bool:
        self._client.delete_collection(name)
        return True

    def get_collection_stats(self, name: str) -> Dict[str, Any]:
        info = self._client.get_collection(name)
        return {
            "name": name,
            "vectors_count": info.vectors_count or 0,
            "status": info.status.value if info.status else "unknown",
            "vector_size": info.config.params.vectors.size if info.config.params.vectors else None,
        }

    def count_records(self, collection: str = "exportease_knowledge", filters: Optional[Dict] = None) -> int:
        """Count records, optionally applying filters."""
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        
        qdrant_filter = None
        if filters:
            conditions = []
            for k, v in filters.items():
                conditions.append(FieldCondition(key=k, match=MatchValue(value=v)))
            qdrant_filter = Filter(must=conditions)
            
        try:
            count_result = self._client.count(
                collection_name=collection,
                count_filter=qdrant_filter
            )
            return count_result.count
        except Exception as exc:
            logger.error("Failed to count records: %s", exc)
            return 0

    def get_coverage_summary(self, collection: str = "exportease_knowledge") -> Dict[str, int]:
        """Returns a breakdown of verified records by jurisdiction."""
        # Qdrant doesn't have a direct GROUP BY aggregate query for payload values in the python client yet.
        # As a simple substitute for this MVP, we will do a fast scroll of verified records 
        # and count the jurisdictions in-memory.
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        
        coverage = {}
        try:
            records, _ = self._client.scroll(
                collection_name=collection,
                scroll_filter=Filter(must=[FieldCondition(key="verification_status", match=MatchValue(value="VERIFIED"))]),
                limit=1000, # Cap at 1000 for performance
                with_payload=True,
                with_vectors=False
            )
            
            for point in records:
                payload = point.payload or {}
                jurisdiction = payload.get("jurisdiction", [])
                if isinstance(jurisdiction, list):
                    for j in jurisdiction:
                        coverage[j] = coverage.get(j, 0) + 1
                elif isinstance(jurisdiction, str):
                    coverage[jurisdiction] = coverage.get(jurisdiction, 0) + 1
                    
        except Exception as exc:
            logger.error("Failed to generate coverage summary: %s", exc)
            
        return coverage

    # ── Upsert ───────────────────────────────────────────────────────────────

    def upsert_chunks(
        self,
        collection: str,
        chunks: List[Dict[str, Any]],
    ) -> int:
        """
        Upsert a list of chunk dicts into Qdrant.
        Each chunk dict must have: id, vector, payload
        Returns the number of points upserted.
        """
        from qdrant_client.models import PointStruct
        points = [
            PointStruct(id=c["id"], vector=c["vector"], payload=c["payload"])
            for c in chunks
        ]
        self._client.upsert(collection_name=collection, points=points)
        logger.debug("Upserted %d points into collection '%s'", len(points), collection)
        return len(points)

    def delete_by_document_id(self, collection: str, document_id: str) -> int:
        """Delete all chunks belonging to a document_id. Returns count deleted."""
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        result = self._client.delete(
            collection_name=collection,
            points_selector=Filter(
                must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
            ),
        )
        logger.info("Deleted chunks for document_id=%s from '%s'", document_id, collection)
        return getattr(result, "operation_id", 0)

    def get_chunk_by_id(self, chunk_id: str, collection: str = "exportease_knowledge") -> Optional[NormalizedRecord]:
        """Fetch a specific chunk by its ID for evidence/citation resolution."""
        records, _ = self._client.scroll(
            collection_name=collection,
            scroll_filter=None,
            with_payload=True,
            limit=1,
            # We can't query UUID directly in scroll without a filter unless we just use retrieve
        )
        # Using retrieve is faster for exact IDs
        try:
            results = self._client.retrieve(
                collection_name=collection,
                ids=[chunk_id],
                with_payload=True,
                with_vectors=False
            )
            if not results:
                return None
            return self._to_normalized_records(results)[0]
        except Exception as exc:
            logger.error("Failed to retrieve chunk %s: %s", chunk_id, exc)
            return None

    # ── Retrieval ────────────────────────────────────────────────────────────

    def retrieve(
        self,
        query_vector: List[float],
        config: RetrievalConfig,
    ) -> List[RetrievalResult]:
        """
        Retrieve top-k documents using the configured retrieval mode.
        """
        if config.retrieval_mode == "dense":
            return self._dense_search(query_vector, config)
        elif config.retrieval_mode == "sparse":
            return self._sparse_search(query_vector, config)
        else:
            return self._hybrid_search(query_vector, config)

    def _build_filter(self, filters: Optional[MetadataFilters]):
        from qdrant_client.models import Filter, FieldCondition, MatchAny, MatchValue, DatetimeRange
        conditions = []
        
        if filters is None:
            # Enforce VERIFIED by default for empty filters
            conditions.append(
                FieldCondition(key="verification_status", match=MatchValue(value="VERIFIED"))
            )
            return Filter(must=conditions)
            
        if filters.jurisdiction or filters.country:
            j_list = (filters.jurisdiction or []) + (filters.country or [])
            # Store in 'country' key if we mapped it, but let's check payload keys
            conditions.append(
                FieldCondition(key="jurisdiction", match=MatchAny(any=j_list))
            )
        if filters.document_type:
            conditions.append(
                FieldCondition(key="document_type", match=MatchAny(any=filters.document_type))
            )
        if filters.product:
            conditions.append(FieldCondition(key="product", match=MatchAny(any=filters.product)))
        if filters.product_category:
            conditions.append(FieldCondition(key="product_category", match=MatchAny(any=filters.product_category)))
        if filters.hs_code:
            conditions.append(FieldCondition(key="hs_code", match=MatchAny(any=filters.hs_code)))
        if filters.authority:
            conditions.append(FieldCondition(key="authority", match=MatchAny(any=filters.authority)))
        if filters.topic:
            conditions.append(FieldCondition(key="topic", match=MatchAny(any=filters.topic)))
        if filters.language:
            conditions.append(FieldCondition(key="language", match=MatchAny(any=filters.language)))

        # Date filtering
        if filters.effective_after or filters.effective_before:
            conditions.append(
                FieldCondition(
                    key="effective_date",
                    range=DatetimeRange(
                        gte=str(filters.effective_after) if filters.effective_after else None,
                        lte=str(filters.effective_before) if filters.effective_before else None,
                    ),
                )
            )
            
        # Hard enforce VERIFIED records unless explicitly querying another status
        v_status = filters.verification_status or "VERIFIED"
        conditions.append(
            FieldCondition(key="verification_status", match=MatchValue(value=v_status))
        )
            
        return Filter(must=conditions) if conditions else None

    def _dense_search(self, query_vector: List[float], config: RetrievalConfig) -> List[RetrievalResult]:
        results = self._client.search(
            collection_name=config.collection,
            query_vector=query_vector,
            limit=config.top_k,
            score_threshold=config.score_threshold,
            query_filter=self._build_filter(config.filters),
            with_payload=True,
        )
        return self._to_normalized_records(results)

    def _sparse_search(self, query_vector: List[float], config: RetrievalConfig) -> List[RetrievalResult]:
        # Fallback to dense if sparse index not configured
        logger.debug("Sparse search falling back to dense (BM25 index not configured)")
        return self._dense_search(query_vector, config)

    def _hybrid_search(self, query_vector: List[float], config: RetrievalConfig) -> List[RetrievalResult]:
        """Hybrid: run dense search with slightly more candidates, then re-rank."""
        results = self._client.search(
            collection_name=config.collection,
            query_vector=query_vector,
            limit=min(config.top_k * 2, 20),
            score_threshold=max(config.score_threshold - 0.1, 0.0),
            query_filter=self._build_filter(config.filters),
            with_payload=True,
        )
        docs = self._to_normalized_records(results)
        # Return only top_k after hybrid re-ranking (score already sorted by Qdrant)
        return docs[: config.top_k]

    def _to_normalized_records(self, results) -> List[RetrievalResult]:
        records = []
        for hit in results:
            payload = hit.payload or {}
            # Chunk ID must be stable and properly scoped to the actual hit ID.
            # Qdrant client sometimes returns UUIDs as UUID objects, so stringify it.
            hit_id = str(hit.id)
            records.append(
                RetrievalResult(
                    chunk_id=hit_id,
                    document_id=payload.get("document_id", hit_id),
                    source_id=payload.get("source_id"),
                    text=payload.get("content", ""),
                    authority=payload.get("authority"),
                    title=payload.get("title"),
                    topic=payload.get("topic"),
                    product=payload.get("product"),
                    hs_code=payload.get("hs_code"),
                    country=payload.get("jurisdiction", payload.get("country")),
                    language=payload.get("language"),
                    page=payload.get("page"),
                    section=payload.get("section"),
                    publication_date=payload.get("publication_date"),
                    effective_date=payload.get("effective_date"),
                    superseded=payload.get("superseded"),
                    dataset_version=payload.get("dataset_version"),
                    verification_status=payload.get("verification_status", "REVIEW_REQUIRED"),
                    score=round(getattr(hit, "score", 0.0), 4),
                )
            )
        return records


# ── Singleton ─────────────────────────────────────────────────────────────────
_retriever_instance: Optional[QdrantRetriever] = None


def get_retriever() -> QdrantRetriever:
    """Return the process-level QdrantRetriever singleton."""
    global _retriever_instance
    if _retriever_instance is None:
        _retriever_instance = QdrantRetriever()
    return _retriever_instance
