# ============================================================
# ExportEase AI - Integration Tests
# ============================================================
"""
Integration tests for the canonical export workflow.
Scenario: Exporting turmeric powder to Germany.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    """Test the health endpoint."""
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "system_id" in data


@pytest.mark.asyncio
async def test_readiness_check(async_client: AsyncClient):
    """Test the readiness endpoint."""
    response = await async_client.get("/api/v1/readiness")
    assert response.status_code == 200
    data = response.json()
    assert "ready" in data


@pytest.mark.asyncio
async def test_canonical_export_workflow(async_client: AsyncClient):
    """
    Test the full API flow for a new project, assuming mock services.
    """
    # 1. Register User
    reg_res = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@exportease.ai",
            "password": "hashed_password_mock",
            "full_name": "Test User",
            "phone": "1234567890"
        }
    )
    assert reg_res.status_code == 201
    user_data = reg_res.json()["data"]

    # 2. Login
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@exportease.ai",
            "password": "hashed_password_mock"
        }
    )
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create MSME Profile
    msme_res = await async_client.post(
        "/api/v1/msme-profiles/",
        headers=headers,
        json={
            "company_name": "Test Spice Exports",
            "gstin": "27AADCK1234F1ZH",
            "iec_code": "AADCK1234F"
        }
    )
    assert msme_res.status_code == 201
    msme_id = msme_res.json()["data"]["id"]

    # 4. Create Business
    bus_res = await async_client.post(
        "/api/v1/businesses/",
        headers=headers,
        json={
            "msme_id": msme_id,
            "business_name": "Spice Factory",
            "business_type": "Manufacturing"
        }
    )
    assert bus_res.status_code == 201
    bus_id = bus_res.json()["data"]["id"]

    # 5. Create Product
    prod_res = await async_client.post(
        "/api/v1/products/",
        headers=headers,
        json={
            "business_id": bus_id,
            "product_name": "Turmeric Powder",
            "category": "Spices"
        }
    )
    assert prod_res.status_code == 201
    prod_id = prod_res.json()["data"]["id"]

    # 6. Create Project
    proj_res = await async_client.post(
        "/api/v1/projects/",
        headers=headers,
        json={
            "msme_id": msme_id,
            "product_id": prod_id,
            "project_name": "Turmeric to Germany",
            "destination_country": "Germany",
            "destination_country_code": "DE",
            "user_query": "I want to export turmeric powder to Germany."
        }
    )
    assert proj_res.status_code == 201
    project_id = proj_res.json()["data"]["id"]

    # 7. Check Workflow Status
    status_res = await async_client.get(
        f"/api/v1/workflow/{project_id}/status",
        headers=headers
    )
    assert status_res.status_code == 200
    assert status_res.json()["data"]["current_step"] == "MSME_PROFILE"

    # 8. Advance Workflow
    adv_res = await async_client.post(
        "/api/v1/workflow/advance",
        headers=headers,
        json={"project_id": project_id}
    )
    assert adv_res.status_code == 200
    assert adv_res.json()["data"]["current_step"] == "PRODUCT"

    # 9. Execute step (General Analysis, handled by Mock AI Client)
    exec_res = await async_client.post(
        f"/api/v1/workflow/{project_id}/execute/GENERAL_ANALYSIS",
        headers=headers
    )
    assert exec_res.status_code == 200
    assert exec_res.json()["data"] is not None
