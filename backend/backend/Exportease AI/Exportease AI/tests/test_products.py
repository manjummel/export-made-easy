import pytest
from httpx import AsyncClient

@pytest.fixture
async def auth_and_business(async_client: AsyncClient):
    """Fixture providing headers, a mock msme, and business context."""
    # Registration
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "product_test@exportease.ai", "password": "SecurePassword123", "full_name": "Tester"}
    )
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "product_test@exportease.ai", "password": "SecurePassword123"}
    )
    headers = {"Authorization": f"Bearer {login_res.json()['data']['access_token']}"}
    
    # MSME
    msme_resp = await async_client.post(
        "/api/v1/msme-profiles/", headers=headers, json={"company_name": "Products Ltd", "gstin": "1234"}
    )
    
    # Business
    bus_resp = await async_client.post(
        "/api/v1/businesses/", headers=headers, json={"msme_id": msme_resp.json()["data"]["id"], "business_name": "Op1"}
    )
    
    return {
        "headers": headers,
        "business_id": bus_resp.json()["data"]["id"]
    }

@pytest.mark.asyncio
async def test_product_crud_and_analysis(async_client: AsyncClient, auth_and_business: dict):
    headers = auth_and_business["headers"]
    b_id = auth_and_business["business_id"]

    # 1. Create Prod
    prod_req = await async_client.post(
        "/api/v1/products/",
        headers=headers,
        json={
            "business_id": b_id,
            "product_name": "Turmeric Powder Standard",
            "intended_destination": "Germany"
        }
    )
    assert prod_req.status_code == 201
    pid = prod_req.json()["data"]["id"]
    
    # 2. Get Prod
    get_req = await async_client.get(f"/api/v1/products/{pid}", headers=headers)
    assert get_req.status_code == 200

    # 3. Analyze Endpoint (Triggers mock AI + Mock config returns Turmeric values)
    analysis_req = await async_client.post(
        "/api/v1/products/analyze",
        headers=headers,
        json={"product_id": pid}
    )
    assert analysis_req.status_code == 200
    adata = analysis_req.json()["data"]
    
    # Verify AI integration updated parameters without explicit client definition
    assert adata["hs_code"] is not None
    assert int(float(adata["hs_classification_confidence"])) > 0
    assert adata["hs_classification_source"] == "AI_VERIFIED"
    
    # 4. List Prods
    list_req = await async_client.get(f"/api/v1/products/?business_id={b_id}", headers=headers)
    assert list_req.json()["data"]["total"] == 1 
    
    # 5. Put Prod
    put_req = await async_client.put(
        f"/api/v1/products/{pid}",
        headers=headers,
        json={"unit_price_usd": 15.0} # Validating partial overrides
    )
    assert put_req.status_code == 200
    assert put_req.json()["data"]["unit_price_usd"] == 15.0
    
    # 6. Delete Prod
    del_req = await async_client.delete(f"/api/v1/products/{pid}", headers=headers)
    assert del_req.status_code == 204
    
    # Ensure deleted
    verify = await async_client.get(f"/api/v1/products/{pid}", headers=headers)
    assert verify.status_code == 404
