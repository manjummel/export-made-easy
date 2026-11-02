import pytest
from httpx import AsyncClient

@pytest.fixture
async def risk_context(async_client: AsyncClient):
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "risk_tester@exportease.ai", "password": "SecurePassword123", "full_name": "Risk Tester"}
    )
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "risk_tester@exportease.ai", "password": "SecurePassword123"}
    )
    headers = {"Authorization": f"Bearer {login_res.json()['data']['access_token']}"}
    
    msme_resp = await async_client.post(
        "/api/v1/msme-profiles/", headers=headers, json={"company_name": "Risk Assess Ltd", "gstin": "XYZ123"}
    )
    
    proj_resp = await async_client.post(
        "/api/v1/projects/", headers=headers,
        json={"msme_id": msme_resp.json()["data"]["id"], "project_name": "Test Project", "destination_country": "US"}
    )
    
    return {
        "headers": headers,
        "project_id": proj_resp.json()["data"]["id"]
    }

@pytest.mark.asyncio
async def test_risk_low(async_client: AsyncClient, risk_context: dict):
    headers = risk_context["headers"]
    project_id = risk_context["project_id"]

    payload = {
        "project_id": project_id,
        "product": "Organic Honey",
        "hs_code": "0409.00",
        "destination": "US"
    }
    res = await async_client.post("/api/v1/risk/analyze", headers=headers, json=payload)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["risk_level"] == "GREEN"
    assert len(data["risk_factors"]) > 0

@pytest.mark.asyncio
async def test_risk_medium(async_client: AsyncClient, risk_context: dict):
    headers = risk_context["headers"]
    project_id = risk_context["project_id"]

    payload = {
        "project_id": project_id,
        "product": "Organic Honey",
        "hs_code": "0409.00",
        "destination": "MED_RISK"
    }
    res = await async_client.post("/api/v1/risk/analyze", headers=headers, json=payload)
    assert res.status_code == 200
    assert res.json()["data"]["risk_level"] == "AMBER"

@pytest.mark.asyncio
async def test_risk_high(async_client: AsyncClient, risk_context: dict):
    headers = risk_context["headers"]
    project_id = risk_context["project_id"]

    payload = {
        "project_id": project_id,
        "product": "Organic Honey",
        "hs_code": "0409.00",
        "destination": "HIGH_RISK"
    }
    res = await async_client.post("/api/v1/risk/analyze", headers=headers, json=payload)
    assert res.status_code == 200
    assert res.json()["data"]["risk_level"] == "RED"

@pytest.mark.asyncio
async def test_risk_insufficient_data(async_client: AsyncClient, risk_context: dict):
    headers = risk_context["headers"]
    project_id = risk_context["project_id"]

    payload = {
        "project_id": project_id,
        "product": "Organic Honey",
        "hs_code": "0409.00",
        "destination": "UNKNOWN_DATA"
    }
    res = await async_client.post("/api/v1/risk/analyze", headers=headers, json=payload)
    assert res.status_code == 400
    assert res.json()["detail"] == "INSUFFICIENT_DATA"

@pytest.mark.asyncio
async def test_risk_conflicting_result(async_client: AsyncClient, risk_context: dict):
    headers = risk_context["headers"]
    project_id = risk_context["project_id"]

    payload = {
        "project_id": project_id,
        "product": "Organic Honey",
        "hs_code": "0409.00",
        "destination": "US",
        "simulate_conflict": True
    }
    res = await async_client.post("/api/v1/risk/analyze", headers=headers, json=payload)
    assert res.status_code == 200
    assert res.json()["data"]["risk_level"] == "RED"

@pytest.mark.asyncio
async def test_get_risk(async_client: AsyncClient, risk_context: dict):
    headers = risk_context["headers"]
    project_id = risk_context["project_id"]
    
    payload = {
        "project_id": project_id,
        "product": "Organic Honey",
        "hs_code": "0409.00",
        "destination": "US"
    }
    await async_client.post("/api/v1/risk/analyze", headers=headers, json=payload)
    
    res = await async_client.get(f"/api/v1/projects/{project_id}/risk", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["risk_level"] == "GREEN"    
