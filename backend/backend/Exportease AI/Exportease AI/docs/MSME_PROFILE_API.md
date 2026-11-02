# ExportEase AI - MSME Profile API

## Overview
The `MSME Profile` architecture establishes the core foundational identity for an export business inside the ExportEase Platform. All **Business** models and **Export Projects** are mapped directly down to an active `MSME Profile`.

The module employs strict boundaries verifying user authentication tokens to constrain mutations/reads securely.

## Base Operations

### `POST /api/v1/msme-profiles/`
Create a new profile mapped to the authenticated user.
```json
{
  "company_name": "Kumar Spices Ltd",
  "gstin": "27AADCK1234F1ZH",
  "iec_code": "AADCK1234F",
  "udyam_number": "UDYAM-KA-01-0012345",
  "msme_category": "SMALL",
  "export_experience_years": 2
}
```

### `GET /api/v1/msme-profiles/`
Returns a unified array schema (paginated later) of all profile instances bonded to that user.
- **Constraints**: MSME users cannot pass cross-tenant query variables.

### `GET /api/v1/msme-profiles/{profile_id}`
Retrieves total data for a specifically mapped profile.
- Outputs schema validates the integrity downstream: `document extraction`, `export compliance checks` and `risk evaluations`.

### `PATCH /api/v1/msme-profiles/{profile_id}`
Performs a partial schema update for any mutating business parameters (e.g. Updating an annual turnover bracket).

## Architecture Details
1. **Router**: Defined in `app/api/v1/msme_profiles.py` serving as purely transport layer mappings. 
2. **Service Layer**: Defined in `app/services/msme_service.py` to organize orchestration, parameter parsing, and schema conversions.
3. **Repository Layer**: Defined in `app/repositories/msme_repository.py` strictly restricting ORM (SQLAlchemy 2.x session) access from the router context and handling underlying transactions mapping down to `PostgreSQL`.
