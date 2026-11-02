# ExportEase AI - Service Boundaries

## Overview
The ExportEase AI platform operates on a loosely coupled, tightly contracted microservice architecture. Establishing strict boundaries is critical to preventing circular dependencies, redundant logic, and insecure data leakage.

## System Matrix

### System 1: AI Engine (LLM + QLoRA + LangGraph)
- **Identity**: `EXPORT-EASE-AI-ENGINE-V1`
- **Responsibilities**: Agentic reasoning, parsing queries, evaluating context against retrieved evidence, generating export plans, identifying HS codes mapping.
- **Boundaries**: 
  - Cannot read/write to the PostgreSQL operational DB.
  - Must perform all knowledge retrieval exclusively via System 2 (RAG).
  - Listens only to structured requests from System 3.

### System 2: Knowledge / RAG (Qdrant + Registry + Retrieval)
- **Identity**: `EXPORT-EASE-KNOWLEDGE-V1`
- **Responsibilities**: Vector similarity search, dense retrieval, reranking, source registry management, chunking and embedding Indian export regulations (DGFT, CBIC, FDA).
- **Boundaries**:
  - Is ignorant of "Users" or "Export Projects".
  - Operates strictly on queries and filtering combinations.
  - Never exposed directly to the public internet or frontend.

### System 3: Backend (Business Orchestrator / FastAPI)
- **Identity**: `EXPORT-EASE-BACKEND-V1`
- **Responsibilities**: Source of truth for business logic. JWT auth, user state, project configuration, historical tracing, database governance, HTTP gateway to Frontend.
- **Boundaries**:
  - Owns PostgreSQL fully.
  - **Does not execute LLMs.** System 3 must defer LLM logic to System 1.
  - **Does not construct Qdrant queries.** 
  - Ensures compliance: If System 1 or 2 reports `INSUFFICIENT_EVIDENCE`, System 3 flags the project and pauses progression regardless of user input.

### System 4: Frontend (React / Tailwind)
- **Identity**: `EXPORT-EASE-FRONTEND-V1`
- **Responsibilities**: Final UX/UI presentation, complex form management, rendering live Agent Trace steps, rendering interactive export plans.
- **Boundaries**:
  - Talks ONLY to System 3. 
  - Zero awareness of AI/RAG internal models, configurations, or direct API routes.

## Security Boundaries
1. **Network**: Only System 3 routes and the static System 4 files are public. Systems 1 and 2 exist in internal, shielded subnets.
2. **Access Constraints**: System 3 forces role-based access controls (RBAC). A user (`user_id`) cannot mutate queries or view export projects owned by another `msme_id` unless flagged as `ADMIN`.
3. **Fact Rigidity (Safety)**: AI hallucinations are blocked by the architecture. System 1 is constrained to RAG sources, and System 3 audits all `sources` returned in the `ResponseEnvelope`. No regulatory claim can bypass the citation registry.
