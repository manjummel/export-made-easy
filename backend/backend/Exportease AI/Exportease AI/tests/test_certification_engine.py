# ============================================================
# ExportEase AI - Certification Engine Tests
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Tests for PROMPT 3.14 - Certification Engine.
Covers:
  - POST /api/v1/certifications/analyze
  - GET  /api/v1/projects/{id}/certifications
  - Mandatory vs. conditional guard rails
  - Persistence of certification analysis against export project
  - Confidence and evidence field integrity
"""

import pytest
from httpx import AsyncClient


# ─────────────────────────────────────────────────────────────
# Shared fixture: authenticated user + MSME + export project
# ─────────────────────────────────────────────────────────────
@pytest.fixture
async def cert_context(async_client: AsyncClient):
    """
    Sets up an authenticated user, MSME profile, and export project
    that certification tests can reference.
    """
    # 1. Register user
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "cert_engine@exportease.ai",
            "password": "SecurePassword123",
            "full_name": "Cert Engine Tester",
        },
    )

    # 2. Login
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "cert_engine@exportease.ai", "password": "SecurePassword123"},
    )
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create MSME profile
    msme_res = await async_client.post(
        "/api/v1/msme-profiles/",
        headers=headers,
        json={"company_name": "Sunrise Exports Pvt Ltd"},
    )
    assert msme_res.status_code in (200, 201)
    msme_id = msme_res.json()["data"]["id"]

    # 4. Create export project
    proj_res = await async_client.post(
        "/api/v1/projects/",
        headers=headers,
        json={
            "msme_id": msme_id,
            "project_name": "Organic Turmeric to Germany",
            "destination_country": "Germany",
        },
    )
    assert proj_res.status_code in (200, 201)
    project_id = proj_res.json()["data"]["id"]

    return {
        "headers": headers,
        "msme_id": msme_id,
        "project_id": project_id,
    }


# ─────────────────────────────────────────────────────────────
# Standard payload used across multiple tests
# ─────────────────────────────────────────────────────────────
SAMPLE_CERT_PAYLOAD = {
    "product": "Organic Turmeric Powder",
    "hs_code": "0910.30",
    "destination": "Germany",
    "compliance_information": {
        "fssai_registered": True,
        "export_license_held": True,
        "iec_number": "ABCD1234",
    },
}


# ─────────────────────────────────────────────────────────────
# Test 1: Successful certification analysis
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_certification_analyze_success(
    async_client: AsyncClient, cert_context: dict
):
    """POST /api/v1/certifications/analyze returns well-formed certifications."""
    headers = cert_context["headers"]
    project_id = cert_context["project_id"]

    payload = {**SAMPLE_CERT_PAYLOAD, "project_id": project_id}
    res = await async_client.post(
        "/api/v1/certifications/analyze", headers=headers, json=payload
    )

    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()["data"]

    # Root structure
    assert "project_id" in data
    assert data["project_id"] == project_id
    assert "certifications" in data
    assert isinstance(data["certifications"], list)
    assert len(data["certifications"]) > 0, "At least one certification expected"


# ─────────────────────────────────────────────────────────────
# Test 2: Each certification has required fields
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_certification_fields_present(
    async_client: AsyncClient, cert_context: dict
):
    """Every certification object must contain all 8 required fields."""
    headers = cert_context["headers"]
    project_id = cert_context["project_id"]

    payload = {**SAMPLE_CERT_PAYLOAD, "project_id": project_id}
    res = await async_client.post(
        "/api/v1/certifications/analyze", headers=headers, json=payload
    )
    assert res.status_code == 200

    required_fields = {
        "certification_name",
        "applicability",
        "status",
        "reason",
        "issuing_authority",
        "source",
        "evidence",
        "confidence",
    }
    for cert in res.json()["data"]["certifications"]:
        missing = required_fields - set(cert.keys())
        assert not missing, f"Certification missing fields: {missing}"


# ─────────────────────────────────────────────────────────────
# Test 3: Status values are within allowed set
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_certification_status_values(
    async_client: AsyncClient, cert_context: dict
):
    """Status must be one of: REQUIRED, CONDITIONAL, NOT_IDENTIFIED, REVIEW_REQUIRED."""
    headers = cert_context["headers"]
    project_id = cert_context["project_id"]

    payload = {**SAMPLE_CERT_PAYLOAD, "project_id": project_id}
    res = await async_client.post(
        "/api/v1/certifications/analyze", headers=headers, json=payload
    )
    assert res.status_code == 200

    allowed_statuses = {"REQUIRED", "CONDITIONAL", "NOT_IDENTIFIED", "REVIEW_REQUIRED"}
    for cert in res.json()["data"]["certifications"]:
        assert cert["status"] in allowed_statuses, (
            f"Invalid status '{cert['status']}' for '{cert['certification_name']}'"
        )


# ─────────────────────────────────────────────────────────────
# Test 4: CRITICAL — No conditional→mandatory escalation
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_conditional_not_escalated_to_mandatory(
    async_client: AsyncClient, cert_context: dict
):
    """
    CRITICAL: Certifications with applicability containing 'conditional'
    must never have status 'REQUIRED'. Validates the mandatory guard rail.
    """
    headers = cert_context["headers"]
    project_id = cert_context["project_id"]

    payload = {**SAMPLE_CERT_PAYLOAD, "project_id": project_id}
    res = await async_client.post(
        "/api/v1/certifications/analyze", headers=headers, json=payload
    )
    assert res.status_code == 200

    for cert in res.json()["data"]["certifications"]:
        if "conditional" in cert.get("applicability", "").lower():
            assert cert["status"] != "REQUIRED", (
                f"CRITICAL VIOLATION: '{cert['certification_name']}' marked REQUIRED "
                f"despite conditional applicability."
            )


# ─────────────────────────────────────────────────────────────
# Test 5: Evidence / source fields contain SET 2 citations
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_certifications_have_set2_citations(
    async_client: AsyncClient, cert_context: dict
):
    """
    Every factual certification recommendation must reference SET 2 sources
    in its 'evidence' or 'source' field.
    """
    headers = cert_context["headers"]
    project_id = cert_context["project_id"]

    payload = {**SAMPLE_CERT_PAYLOAD, "project_id": project_id}
    res = await async_client.post(
        "/api/v1/certifications/analyze", headers=headers, json=payload
    )
    assert res.status_code == 200

    # Only REQUIRED / CONDITIONAL certifications must have citations;
    # NOT_IDENTIFIED ones have no factual backing by definition.
    for cert in res.json()["data"]["certifications"]:
        if cert["status"] in ("REQUIRED", "CONDITIONAL"):
            has_citation = (
                "set 2" in cert.get("source", "").lower()
                or "set 2" in cert.get("evidence", "").lower()
            )
            assert has_citation, (
                f"'{cert['certification_name']}' ({cert['status']}) missing SET 2 citation. "
                f"source='{cert.get('source')}', evidence='{cert.get('evidence')}'"
            )


# ─────────────────────────────────────────────────────────────
# Test 6: Confidence is a float between 0 and 1
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_certification_confidence_range(
    async_client: AsyncClient, cert_context: dict
):
    """Confidence score must be a float in [0.0, 1.0]."""
    headers = cert_context["headers"]
    project_id = cert_context["project_id"]

    payload = {**SAMPLE_CERT_PAYLOAD, "project_id": project_id}
    res = await async_client.post(
        "/api/v1/certifications/analyze", headers=headers, json=payload
    )
    assert res.status_code == 200

    for cert in res.json()["data"]["certifications"]:
        confidence = cert.get("confidence")
        assert isinstance(confidence, (int, float)), (
            f"Confidence must be numeric, got {type(confidence)}"
        )
        assert 0.0 <= float(confidence) <= 1.0, (
            f"Confidence out of range: {confidence}"
        )


# ─────────────────────────────────────────────────────────────
# Test 7: Persistence — certifications stored in DB
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_certification_persistence(
    async_client: AsyncClient, cert_context: dict
):
    """
    After POST /analyze, certifications must be retrievable via
    GET /api/v1/projects/{id}/certifications.
    """
    headers = cert_context["headers"]
    project_id = cert_context["project_id"]

    payload = {**SAMPLE_CERT_PAYLOAD, "project_id": project_id}

    # Trigger analysis → persists to DB
    analyze_res = await async_client.post(
        "/api/v1/certifications/analyze", headers=headers, json=payload
    )
    assert analyze_res.status_code == 200
    expected_count = len(analyze_res.json()["data"]["certifications"])

    # Retrieve persisted certifications
    list_res = await async_client.get(
        f"/api/v1/projects/{project_id}/certifications", headers=headers
    )
    assert list_res.status_code == 200, f"List failed: {list_res.text}"
    list_data = list_res.json()["data"]

    assert "certifications" in list_data
    assert "total" in list_data
    assert list_data["total"] == expected_count, (
        f"Expected {expected_count} persisted certs, got {list_data['total']}"
    )


# ─────────────────────────────────────────────────────────────
# Test 8: GET certifications — returns correct project scope
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_get_certifications_project_scoping(
    async_client: AsyncClient, cert_context: dict
):
    """
    GET /api/v1/projects/{id}/certifications must only return certs
    belonging to the specified project.
    """
    headers = cert_context["headers"]
    project_id = cert_context["project_id"]

    # Analyze for this project
    payload = {**SAMPLE_CERT_PAYLOAD, "project_id": project_id}
    await async_client.post(
        "/api/v1/certifications/analyze", headers=headers, json=payload
    )

    # Verify all returned certs belong to this project
    list_res = await async_client.get(
        f"/api/v1/projects/{project_id}/certifications", headers=headers
    )
    assert list_res.status_code == 200
    for cert in list_res.json()["data"]["certifications"]:
        assert cert["project_id"] == project_id, (
            f"Cross-project leak: cert belongs to '{cert['project_id']}'"
        )


# ─────────────────────────────────────────────────────────────
# Test 9: GET certifications — 404 on non-existent project
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_get_certifications_nonexistent_project(
    async_client: AsyncClient, cert_context: dict
):
    """GET certifications for an unknown project_id must return 404."""
    headers = cert_context["headers"]

    res = await async_client.get(
        "/api/v1/projects/non-existent-project-id-9999/certifications",
        headers=headers,
    )
    assert res.status_code == 404


# ─────────────────────────────────────────────────────────────
# Test 10: Missing required fields returns validation error
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_certification_analyze_missing_hs_code(
    async_client: AsyncClient, cert_context: dict
):
    """POST /analyze with missing hs_code must return 422 Unprocessable Entity."""
    headers = cert_context["headers"]
    project_id = cert_context["project_id"]

    invalid_payload = {
        "project_id": project_id,
        "product": "Organic Turmeric Powder",
        # hs_code intentionally omitted
        "destination": "Germany",
        "compliance_information": {},
    }
    res = await async_client.post(
        "/api/v1/certifications/analyze", headers=headers, json=invalid_payload
    )
    assert res.status_code == 422, (
        f"Expected 422 for missing hs_code, got {res.status_code}"
    )


# ─────────────────────────────────────────────────────────────
# Test 11: Unauthenticated request is rejected
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_certification_analyze_unauthenticated(async_client: AsyncClient):
    """Requests without a Bearer token must be rejected with 401 or 403."""
    payload = {
        "project_id": "some-id",
        "product": "Turmeric",
        "hs_code": "0910.30",
        "destination": "Germany",
        "compliance_information": {},
    }
    res = await async_client.post("/api/v1/certifications/analyze", json=payload)
    assert res.status_code in (401, 403), (
        f"Expected 401/403 for unauthenticated request, got {res.status_code}"
    )


# ─────────────────────────────────────────────────────────────
# Test 12: Idempotent analysis — re-analysis stacks, doesn't replace
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_certification_analyze_is_additive(
    async_client: AsyncClient, cert_context: dict
):
    """
    Calling /analyze twice for the same project appends certifications
    (engine produces new records each run, suitable for multi-run audit trails).
    """
    headers = cert_context["headers"]
    project_id = cert_context["project_id"]

    payload = {**SAMPLE_CERT_PAYLOAD, "project_id": project_id}

    # Run 1
    res1 = await async_client.post(
        "/api/v1/certifications/analyze", headers=headers, json=payload
    )
    assert res1.status_code == 200
    count_run1 = len(res1.json()["data"]["certifications"])

    # Run 2
    res2 = await async_client.post(
        "/api/v1/certifications/analyze", headers=headers, json=payload
    )
    assert res2.status_code == 200

    # Total persisted should be 2x
    list_res = await async_client.get(
        f"/api/v1/projects/{project_id}/certifications", headers=headers
    )
    assert list_res.status_code == 200
    assert list_res.json()["data"]["total"] == count_run1 * 2
