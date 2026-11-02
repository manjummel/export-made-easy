import pytest
from httpx import AsyncClient

@pytest.fixture
async def project_context(async_client: AsyncClient):
    """Fixture providing user headers and MSME ID for project instantiation."""
    # Register/Login
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "proj_export@exportease.ai", "password": "SecurePassword123", "full_name": "Project Tester"}
    )
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "proj_export@exportease.ai", "password": "SecurePassword123"}
    )
    headers = {"Authorization": f"Bearer {login_res.json()['data']['access_token']}"}
    
    # Establish MSME Profile
    msme_resp = await async_client.post(
        "/api/v1/msme-profiles/", headers=headers, json={"company_name": "Export Project Ltd", "gstin": "ABCD"}
    )
    return {
        "headers": headers,
        "msme_id": msme_resp.json()["data"]["id"]
    }

@pytest.mark.asyncio
async def test_project_lifecycle(async_client: AsyncClient, project_context: dict):
    headers = project_context["headers"]
    msme_id = project_context["msme_id"]

    # 1. POST /api/projects
    create_req = await async_client.post(
        "/api/v1/projects/",
        headers=headers,
        json={
            "msme_id": msme_id,
            "project_name": "Turmeric to Germany",
            "destination_country": "Germany",
            "quantity": 1000.0,
            "estimated_value": 15000.0,
            "currency": "EUR",
            "preferred_language": "de"
        }
    )
    assert create_req.status_code == 201
    
    data = create_req.json()["data"]
    p_id = data["id"]
    assert data["status"] == "DRAFT"
    assert data["quantity"] == 1000.0
    assert data["currency"] == "EUR"

    # 2. GET /api/projects/{id}
    fetch_req = await async_client.get(f"/api/v1/projects/{p_id}", headers=headers)
    assert fetch_req.status_code == 200

    # 3. PUT /api/projects/{id}
    update_req = await async_client.put(
        f"/api/v1/projects/{p_id}",
        headers=headers,
        json={"status": "IN_PROGRESS", "completion_percentage": 10.0}
    )
    assert update_req.status_code == 200
    assert update_req.json()["data"]["status"] == "IN_PROGRESS"

    # 4. GET /api/projects
    list_req = await async_client.get("/api/v1/projects/", headers=headers)
    assert list_req.status_code == 200
    assert list_req.json()["data"]["total"] == 1

    # 5. DELETE /api/projects/{id}
    del_req = await async_client.delete(f"/api/v1/projects/{p_id}", headers=headers)
    assert del_req.status_code == 204
    
    check = await async_client.get(f"/api/v1/projects/{p_id}", headers=headers)
    assert check.status_code == 404
