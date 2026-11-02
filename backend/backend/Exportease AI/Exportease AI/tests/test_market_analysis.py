import pytest
from httpx import AsyncClient

@pytest.fixture
async def market_context(async_client: AsyncClient):
    # Register/Login
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "market_tester@exportease.ai", "password": "SecurePassword123", "full_name": "Market Tester"}
    )
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "market_tester@exportease.ai", "password": "SecurePassword123"}
    )
    headers = {"Authorization": f"Bearer {login_res.json()['data']['access_token']}"}
    
    # Establish MSME Profile
    msme_resp = await async_client.post(
        "/api/v1/msme-profiles/", headers=headers, json={"company_name": "Market Assess Ltd", "gstin": "XYZ123"}
    )
    
    # Create Project
    proj_resp = await async_client.post(
        "/api/v1/projects/", headers=headers,
        json={"msme_id": msme_resp.json()["data"]["id"], "project_name": "Test Honey to US", "destination_country": "US"}
    )
    
    return {
        "headers": headers,
        "project_id": proj_resp.json()["data"]["id"]
    }

@pytest.mark.asyncio
async def test_market_analyze_success(async_client: AsyncClient, market_context: dict):
    headers = market_context["headers"]
    project_id = market_context["project_id"]

    payload = {
        "project_id": project_id,
        "product": "Organic Honey",
        "hs_code": "0409.00",
        "destination_country": "Japan"
    }

    res = await async_client.post("/api/v1/market/analyze", headers=headers, json=payload)
    assert res.status_code == 200
    
    data = res.json()["data"]
    # Check fields
    assert "destination_information" in data
    assert "product_market_requirements" in data
    assert "trade_requirements" in data
    assert "market_opportunities" in data
    assert "market_risks" in data
    assert "citations" in data
    assert "confidence" in data

@pytest.mark.asyncio
async def test_market_analyze_data_not_available(async_client: AsyncClient, market_context: dict):
    headers = market_context["headers"]
    project_id = market_context["project_id"]

    # "unknown" triggers the DATA_NOT_AVAILABLE logic
    payload = {
        "project_id": project_id,
        "product": "Organic Honey",
        "hs_code": "0409.00",
        "destination_country": "unknown"
    }

    res = await async_client.post("/api/v1/market/analyze", headers=headers, json=payload)
    assert res.status_code == 404
    assert res.json()["detail"] == "DATA_NOT_AVAILABLE"

@pytest.mark.asyncio
async def test_get_project_market_analysis(async_client: AsyncClient, market_context: dict):
    headers = market_context["headers"]
    project_id = market_context["project_id"]
    
    # Analyze first
    payload = {
        "project_id": project_id,
        "product": "Organic Honey",
        "hs_code": "0409.00",
        "destination_country": "Japan"
    }
    await async_client.post("/api/v1/market/analyze", headers=headers, json=payload)
    
    # Retrieve
    # Route in projects API is GET /api/v1/projects/{project_id}/market-analysis
    res = await async_client.get(f"/api/v1/projects/{project_id}/market-analysis", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "market_analysis" in data
    assert len(data["market_analysis"]) > 0
    record = data["market_analysis"][0]
    assert record["country"] == "Japan"
    assert record["product"] == "Organic Honey"
    assert "summary" in record
    assert "requirements" in record
    assert "opportunities" in record
    assert "risks" in record
    assert "confidence" in record
