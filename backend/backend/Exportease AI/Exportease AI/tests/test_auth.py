import pytest
from httpx import AsyncClient
import time

from app.utils.security import create_access_token

@pytest.mark.asyncio
async def test_auth_full_suite(async_client: AsyncClient, setup_db):
    """
    Test suite covering Auth/Authorization requirements:
    - valid login
    - invalid password
    - expired token
    - missing token
    - invalid token
    - unauthorized resource access
    - role restrictions
    """
    
    # 1. Register MSME User
    reg_response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "auth@exportease.ai",
            "password": "SecurePassword123",
            "full_name": "Auth Tester"
        }
    )
    assert reg_response.status_code == 201
    
    # 2. Register Admin User
    admin_reg = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin_auth@exportease.ai",
            "password": "SecurePassword123",
            "full_name": "Admin Tester"
        }
    )
    # Note: Default role is MSME, we will manually patch it for the test
    assert admin_reg.status_code == 201

    # 3. Valid Login
    login_valid = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "auth@exportease.ai",
            "password": "SecurePassword123"
        }
    )
    assert login_valid.status_code == 200
    token = login_valid.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 4. Invalid Password
    login_invalid = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "auth@exportease.ai",
            "password": "WrongPassword123"
        }
    )
    assert login_invalid.status_code == 401

    # 5. Missing Token
    me_resp_missing = await async_client.get("/api/v1/auth/me")
    assert me_resp_missing.status_code == 401

    # 6. Invalid Token
    me_resp_invalid = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer not_a_real_token"}
    )
    assert me_resp_invalid.status_code == 401

    # 7. Expired Token
    # Mimic token with past expiry
    expired_token = create_access_token({"user_id":"foo", "exp": int(time.time()) - 1000})
    me_resp_expired = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert me_resp_expired.status_code == 401

    # 8. Role Restrictions - Admin route access by MSME_USER
    # /api/v1/users/ listing requires ADMIN
    users_restrict = await async_client.get("/api/v1/users/", headers=headers)
    assert users_restrict.status_code == 403

    # 9. Role Restrictions / Unauthorized Resource Access - MSME profile mapping
    # Create profile for user 1
    profile_req = await async_client.post(
        "/api/v1/msme-profiles/", 
        headers=headers,
        json={
            "company_name": "Auth MSME Ltd",
            "gstin": "12345"
        }
    )
    assert profile_req.status_code == 201
    profile_id = profile_req.json()["data"]["id"]

    # Now login as user 2 (admin we just made MSME temporarily)
    login_2 = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin_auth@exportease.ai",
            "password": "SecurePassword123"
        }
    )
    token2 = login_2.json()["data"]["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # User 2 attempts to get User 1's profile
    access_attempt = await async_client.get(f"/api/v1/msme-profiles/{profile_id}", headers=headers2)
    assert access_attempt.status_code == 404 # Ownership bound returns 404 cleanly via query filters


    # 10. Valid logic verification via /me
    me_valid = await async_client.get("/api/v1/auth/me", headers=headers)
    assert me_valid.status_code == 200
    assert me_valid.json()["data"]["email"] == "auth@exportease.ai"

    # 11. Refresh logic verification
    refresh_token = login_valid.json()["data"]["refresh_token"]
    refresh_req = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert refresh_req.status_code == 200
    assert "access_token" in refresh_req.json()["data"]
