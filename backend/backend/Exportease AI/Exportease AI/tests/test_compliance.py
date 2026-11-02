import pytest
from httpx import AsyncClient

@pytest.fixture
async def compliance_context(async_client: AsyncClient):
    # Establish Auth Context
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "comp_test@exportease.ai", "password": "SecurePassword123", "full_name": "Comp Tester"}
    )
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "comp_test@exportease.ai", "password": "SecurePassword123"}
    )
    headers = {"Authorization": f"Bearer {login_res.json()['data']['access_token']}"}
    
    # Establish MSME + Project
    msme = await async_client.post(
        "/api/v1/msme-profiles/", headers=headers, json={"company_name": "Compliance Ltd"}
    )
    proj = await async_client.post(
        "/api/v1/projects/", headers=headers,
        json={"msme_id": msme.json()["data"]["id"], "project_name": "Spices to Dubai"}
    )
    
    return {
        "headers": headers,
        "project_id": proj.json()["data"]["id"]
    }

@pytest.mark.asyncio
async def test_compliance_analysis_flow(async_client: AsyncClient, compliance_context: dict):
    headers = compliance_context["headers"]
    project_id = compliance_context["project_id"]

    # Trigger Compliance Analysis
    analyze_req = await async_client.post(
        "/api/v1/compliance/analyze",
        headers=headers,
        json={
            "project_id": project_id,
            "product_name": "Organic Turmeric Powder",
            "hs_code": "0910.30",
            "destination": "UAE",
            "business_context": "Manufacturer with FSSAI"
        }
    )
    
    assert analyze_req.status_code == 201
    resp_data = analyze_req.json()["data"]
    
    # Verify strict status parsing
    assert resp_data["status"] in ["COMPLIANT_WITH_REQUIREMENTS", "REVIEW_REQUIRED", "INSUFFICIENT_EVIDENCE", "RESTRICTION_FOUND"]
    
    # Verify arrays map
    assert isinstance(resp_data["requirements"], list)
    assert isinstance(resp_data["restrictions"], list)
    assert isinstance(resp_data["licenses"], list)
    
    # DB persistence test check via manual db session (omitted HTTP for brevity)
    # Check if confidence dropped it into INSUFFICIENT_EVIDENCE correctly
    if resp_data.get("confidence", 0) < 0.6:
        assert resp_data["status"] == "INSUFFICIENT_EVIDENCE"
