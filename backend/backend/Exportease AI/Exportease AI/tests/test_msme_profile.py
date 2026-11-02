import pytest
from httpx import AsyncClient


@pytest.fixture
async def auth_headers(async_client: AsyncClient):
    """Fixture mapping an authenticated user's headers."""
    # Register first
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "msme_tester@example.com", "password": "SecurePassword123", "full_name": "MSME Tester"}
    )
    
    # Login to get token
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "msme_tester@example.com", "password": "SecurePassword123"}
    )
    
    token = login_res.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
    

@pytest.mark.asyncio
async def test_msme_profile_lifecycle(async_client: AsyncClient, auth_headers: dict):
    """
    Test suite covering MSME resource bounds:
    - profile creation
    - profile retrieval 
    - list retrieval
    - profile patching
    """
    
    # 1. Create Profile
    creation_req = await async_client.post(
        "/api/v1/msme-profiles/",
        headers=auth_headers,
        json={
            "company_name": "Kumar Spices Ltd",
            "gstin": "27AADCK1234F1ZH",
            "export_experience_years": 2,
            "annual_turnover_inr": 25000000.0,
            "msme_category": "SMALL"
        }
    )
    assert creation_req.status_code == 201
    
    data = creation_req.json()["data"]
    profile_id = data["id"]
    assert data["company_name"] == "Kumar Spices Ltd"

    # 2. Get Single Profile
    get_req = await async_client.get(
        f"/api/v1/msme-profiles/{profile_id}",
        headers=auth_headers
    )
    assert get_req.status_code == 200
    assert get_req.json()["data"]["gstin"] == "27AADCK1234F1ZH"

    # 3. Patch Existing Profile (Updating turnover)
    patch_req = await async_client.patch(
        f"/api/v1/msme-profiles/{profile_id}",
        headers=auth_headers,
        json={"annual_turnover_inr": 50000000.0}
    )
    assert patch_req.status_code == 200
    assert patch_req.json()["data"]["annual_turnover_inr"] == 50000000.0

    # 4. List All Associated Profiles
    list_req = await async_client.get("/api/v1/msme-profiles/", headers=auth_headers)
    assert list_req.status_code == 200
    assert list_req.json()["data"]["total"] == 1
    assert list_req.json()["data"]["profiles"][0]["id"] == profile_id
