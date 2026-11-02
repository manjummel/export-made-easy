import pytest
from httpx import AsyncClient

@pytest.fixture
async def hs_context(async_client: AsyncClient):
    # Establish Auth Context
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "hs_test@exportease.ai", "password": "SecurePassword123", "full_name": "HS Tester"}
    )
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "hs_test@exportease.ai", "password": "SecurePassword123"}
    )
    headers = {"Authorization": f"Bearer {login_res.json()['data']['access_token']}"}
    
    # Establish MSME + Project
    msme = await async_client.post(
        "/api/v1/msme-profiles/", headers=headers, json={"company_name": "HS Ltd"}
    )
    proj = await async_client.post(
        "/api/v1/projects/", headers=headers,
        json={"msme_id": msme.json()["data"]["id"], "project_name": "Leather Bags to UK"}
    )
    
    return {
        "headers": headers,
        "project_id": proj.json()["data"]["id"]
    }

@pytest.mark.asyncio
async def test_hs_classification_flow(async_client: AsyncClient, hs_context: dict):
    headers = hs_context["headers"]
    project_id = hs_context["project_id"]

    # Trigger HS Classification API endpoint directly
    classify_req = await async_client.post(
        "/api/v1/hs/classification",
        headers=headers,
        json={
            "export_project_id": project_id,
            "product_description": "Handcrafted Leather Bags",
            "destination": "UK"
        }
    )
    
    assert classify_req.status_code == 201
    classification_data = classify_req.json()["data"]
    
    # Verify mapping to Mock AI + RAG responses mapping
    assert classification_data["status"] in ["CLASSIFIED", "REVIEW_REQUIRED", "INSUFFICIENT_EVIDENCE"]
    assert classification_data["confidence"] is not None

    # Retrieve history
    history_req = await async_client.get(
        f"/api/v1/hs/classification/{project_id}",
        headers=headers
    )
    
    assert history_req.status_code == 200
    assert len(history_req.json()["data"]) >= 1
    recent_entry = history_req.json()["data"][0]
    assert recent_entry["id"] == classification_data["id"]
