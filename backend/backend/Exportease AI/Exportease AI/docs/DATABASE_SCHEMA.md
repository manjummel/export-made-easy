# ExportEase AI - Database Schema

## Overview
The System 3 database is built on PostgreSQL and orchestrates the state of all business logic for the MSME export journey. It strictly stores the results of AI agent runs but does **not** hallucinate regulatory facts, ensuring full preservation of citations mapping back to System 2 (Knowledge/RAG).

## Entity-Relationship Diagram

```mermaid
erDiagram
    %% Core Identity
    USERS {
        string id PK
        string email
        string hashed_password
        string full_name
        string role "MSME_USER | ADMIN"
        datetime created_at
    }

    MSME_PROFILES {
        string id PK
        string user_id FK
        string company_name
        string gstin
        string iec_code
        string udyam_number
    }

    BUSINESSES {
        string id PK
        string msme_id FK
        string business_name
        string business_type
        string primary_activity
    }

    PRODUCTS {
        string id PK
        string business_id FK
        string product_name
        string hs_code
        string hs_classification_confidence
        string unit_price_usd
    }

    COUNTRIES {
        string id PK
        string name
        string iso_alpha2
        string iso_alpha3
    }

    %% Project Orchestration
    EXPORT_PROJECTS {
        string id PK
        string msme_id FK
        string product_id FK
        string project_name
        string destination_country
        string status "CREATED|IN_PROGRESS|COMPLETED"
        string current_step "MSME_PROFILE -> EXPORT_PLAN"
    }

    PROJECT_STEPS {
        string id PK
        string project_id FK
        string step_name
        string status "PENDING|COMPLETED|INSUFFICIENT_EVIDENCE"
        float confidence
        string agent_run_id FK
    }

    %% Analytical Results (Attached to Project)
    PROJECT_COMPLIANCE {
        string id PK
        string project_id FK
        string requirement_name
        string regulatory_body
        string evidence_status "PENDING_REVIEW|VERIFIED"
    }

    PROJECT_CERTIFICATIONS {
        string id PK
        string project_id FK
        string certification_name
        boolean is_mandatory
    }

    PROJECT_DOCUMENTS {
        string id PK
        string project_id FK
        string document_name
        string status
    }

    MARKET_ANALYSIS {
        string id PK
        string project_id FK
        string target_country
        string market_size_usd
        string import_duty_rate
    }

    PROJECT_RISKS {
        string id PK
        string project_id FK
        string risk_title
        string risk_level
    }

    EXPORT_PLANS {
        string id PK
        string project_id FK
        text full_plan_json
        string plan_version
    }

    %% AI Integrations & Tracing
    AGENT_RUNS {
        string id PK
        string project_id FK
        string request_id
        string workflow_step
        string status
    }

    AGENT_EVENTS {
        string id PK
        string agent_run_id FK
        string event_type
        string partial_output
    }

    CITATIONS {
        string id PK
        string project_id FK
        string agent_run_id FK
        string source_id
        string url
        string excerpt
        boolean is_verified
    }

    AUDIT_LOGS {
        string id PK
        string user_id FK
        string project_id FK
        string action
        string description
    }

    %% Relationships
    USERS ||--o{ MSME_PROFILES : "owns"
    MSME_PROFILES ||--o{ BUSINESSES : "operates"
    BUSINESSES ||--o{ PRODUCTS : "manufactures"
    MSME_PROFILES ||--o{ EXPORT_PROJECTS : "initiates"
    PRODUCTS }|--o{ EXPORT_PROJECTS : "targets"
    
    EXPORT_PROJECTS ||--o{ PROJECT_STEPS : "progresses through"
    EXPORT_PROJECTS ||--o{ PROJECT_COMPLIANCE : "must adhere to"
    EXPORT_PROJECTS ||--o{ PROJECT_CERTIFICATIONS : "needs"
    EXPORT_PROJECTS ||--o{ PROJECT_DOCUMENTS : "generates"
    EXPORT_PROJECTS ||--o{ MARKET_ANALYSIS : "receives"
    EXPORT_PROJECTS ||--o{ PROJECT_RISKS : "monitors"
    EXPORT_PROJECTS ||--o| EXPORT_PLANS : "concludes with"

    EXPORT_PROJECTS ||--o{ AGENT_RUNS : "is analyzed by"
    AGENT_RUNS ||--o{ AGENT_EVENTS : "emits"
    
    AGENT_RUNS ||--o{ CITATIONS : "generates from RAG"
    EXPORT_PROJECTS ||--o{ CITATIONS : "relies on"
```

## Key Architectural Decisions

1. **Source Registry Mapping**: The `CITATIONS` table maps the `source_id` directly retrieved from System 2 (RAG). Any compliance or regulation requirement generated must attach an `.agent_run_id` and trace back to a verifiable citation.
2. **Safety Value Constraints**: Enums across `PROJECT_COMPLIANCE`, `PROJECT_STEPS`, and `DOCUMENT` statuses inherently support an `INSUFFICIENT_EVIDENCE` fallback mechanism. 
3. **Immutability of Audit**: `AUDIT_LOGS` track every business lifecycle mutation asynchronously without slowing down primary transaction writes.
