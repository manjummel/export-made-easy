# ExportEase AI - API Architecture

## Overview
The System 3 (`EXPORT-EASE-BACKEND-V1`) API exposes a unified REST interface for the Frontend (`System 4`) while governing the interactions between the AI Engine (`System 1`) and Knowledge Services (`System 2`).

### API Philosophy
1. **Contract-Driven**: All endpoints strictly adhere to standard request and response envelopes to ensure cross-system compatibility.
2. **RESTful Design**: Standard HTTP methods (GET, POST, PATCH, DELETE) mapped semantically to resource operations.
3. **Event-Driven AI Sync**: Due to the asynchronous nature of agentic AI execution, the API offers both REST synchronous summaries and WebSocket real-time progress feeds.

## Base URL
`/api/v1`

## API Feature Groups

### 1. Authentication & Users
- `POST /auth/register` - MSME user registration.
- `POST /auth/login` - Issues JWT tokens.
- `GET /users/me` - Profile context retrieval.

### 2. Business Context (MSME Profiles, Businesses, Products)
Provides foundational context required for accurate AI analysis. An MSME user must configure these resources before creating an Export Project.
- `POST /msme-profiles` 
- `POST /businesses`
- `POST /products`

### 3. Export Projects
The central hub for the user's journey.
- `POST /projects` - Initialize a new export configuration (e.g., Turmeric to Germany).
- `GET /projects/{id}` - Full retrieval of project state and current workflow status.

### 4. Workflow Engine
Directly controls the stage of the export process.
- `GET /workflow/{project_id}/status` - Reports current step and completion map.
- `POST /workflow/advance` - Triggers the state machine to unlock the next phase.
- `POST /workflow/{project_id}/execute/{step_name}` - Proxies execution to the AI Engine for the current step.

### 5. Versioned AI Integration
Endpoints mapped directly to structural stages that hand off reasoning to System 1.
- `POST /ai/classify` - Formulates HS code reasoning.
- `POST /ai/compliance` - Checks export eligibility.
- `POST /ai/certifications` - Gathers certification checks.
- `POST /ai/documents` - Gathers shipping and statutory documentation needs.
- `POST /ai/market` - Returns economic market viability.
- `POST /ai/risk` - Assesses political and logistical risks.
- `POST /ai/export-plan` - Synthesizes a comprehensive export manual.

### 6. WebSocket Trace Streaming
- `WS /api/v1/projects/{project_id}/stream` - Pushes streaming `AgentEvents` (e.g., `STARTING`, `SEARCHING_RAG`, `EVALUATING`, `COMPLETED`) to the frontend for rich UX tracing without polling.

## Data Envelopes

### Universal Response Envelope
```json
{
  "request_id": "uuid",
  "project_id": "uuid",
  "status": "success|error",
  "data": { ... },
  "confidence": 0.95,
  "sources": [ ... ],
  "timestamp": "iso-time"
}
```

By ensuring all controllers map to this schema, the frontend can build universal error handlers, confidence bars, and source citation components.
