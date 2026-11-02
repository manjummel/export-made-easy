# SET 2 Connectivity Report

**System ID**: EXPORT-EASE-KNOWLEDGE-V1  
**Audit Date**: 2026-08-12  

---

## Connectivity Matrix

| Path / Boundary | Interface | Status | Notes |
|---|---|---|---|
| **SYSTEM 2 INTERNAL PIPELINE** | Core Services | **PASS** | Internal RAG pipeline, extraction, cleaner, retriever fully functional |
| **SOURCE REGISTRY** | HTTP / API | **PASS** | Source registry models, batch lookup, and registration verified |
| **VERIFICATION** | Retriever Filter | **PASS** | Strict filtering for `verification_status == "VERIFIED"` |
| **DATASET** | API / `data/verified/` | **PASS** | Dataset schema validation and manifest reporting active |
| **CHUNKING** | Internal Cleaner | **PASS** | SHA-256 stable chunk ID generation active |
| **EMBEDDINGS** | SentenceTransformers | **PASS** | `all-MiniLM-L6-v2` 384-dim vector generation active |
| **QDRANT** | Private Client | **PASS** | Qdrant client encapsulated behind `QdrantRetriever` |
| **DENSE RETRIEVAL** | `POST /v1/retrieve` | **PASS** | Pure vector similarity search working |
| **BM25** | Qdrant / Hybrid | **PASS** | Keyword filtering & search support active |
| **HYBRID** | `POST /v1/retrieve/hybrid` | **PASS** | Hybrid RRF fusion retrieval active |
| **RERANKER** | Pipeline Fusion | **PASS** | Reranking logic and score normalization active |
| **CONFIDENCE** | `POST /v1/confidence` | **PASS** | Evaluates `HIGH`, `MEDIUM`, `LOW`, `INSUFFICIENT_GROUNDING` |
| **CITATIONS** | `POST /v1/citations` | **PASS** | Resolves chunk IDs to verified citations |
| **API** | FastAPI / OpenAPI | **PASS** | Matches OpenAPI contract hash |
| **END-TO-END RAG** | Knowledge Pipeline | **PASS** | Complete pipeline trace executed |
| **SYSTEM 2 → SYSTEM 1 (AI Agents)** | HTTP API | **BLOCKED** | System 1 AI Service is currently offline (`WAITING_FOR_AI_SERVICE`). Connection NOT faked. |
| **SYSTEM 2 → SYSTEM 3 (Backend)** | HTTP API | **BLOCKED** | System 3 Backend Service is currently offline (`WAITING_FOR_BACKEND_SERVICE`). Connection NOT faked. |

---

## Final Connectivity Summary

- **System 2 Internal RAG Pipeline**: **PASS**
- **System 2 → System 1 External Connection**: **BLOCKED — DEPENDENCY NOT AVAILABLE**
- **System 2 → System 3 External Connection**: **BLOCKED — DEPENDENCY NOT AVAILABLE**
