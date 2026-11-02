import pytest
from httpx import AsyncClient

@pytest.fixture
async def export_plan_context(async_client: AsyncClient):
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "plan_tester@exportease.ai", "password": "SecurePassword123", "full_name": "Plan Tester"}
    )
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "plan_tester@exportease.ai", "password": "SecurePassword123"}
    )
    headers = {"Authorization": f"Bearer {login_res.json()['data']['access_token']}"}
    
    msme_resp = await async_client.post(
        "/api/v1/msme-profiles/", headers=headers, json={"company_name": "Plan Assess Ltd", "gstin": "XYZ123"}
    )
    
    proj_resp = await async_client.post(
        "/api/v1/projects/", headers=headers,
        json={"msme_id": msme_resp.json()["data"]["id"], "project_name": "Plan Test Project", "destination_country": "GE"}
    )
    
    return {
        "headers": headers,
        "project_id": proj_resp.json()["data"]["id"]
    }

@pytest.mark.asyncio
async def test_export_plan_generate_success(async_client: AsyncClient, export_plan_context: dict):
    headers = export_plan_context["headers"]
    project_id = export_plan_context["project_id"]

    payload = {
        "project_id": project_id
    }
    res = await async_client.post("/api/v1/export-plan/generate", headers=headers, json=payload)
    assert res.status_code == 200
    data = res.json()["data"]
    
    assert data["project_id"] == project_id
    assert "phase_a_readiness" in data
    assert "phase_b_hs_classification" in data
    assert "phase_c_compliance" in data
    assert "phase_d_documents" in data
    assert "phase_e_certifications" in data
    assert "phase_f_destination_market" in data
    assert "phase_g_risk_mitigation" in data
    assert "phase_h_execution_checklist" in data
    
    # Check structure of a step inside the payload
    step = data["phase_a_readiness"][0]
    assert "title" in step
    assert "description" in step
    assert "status" in step
    assert "prerequisites" in step
    assert "next_action" in step
    assert "evidence" in step
    assert "citations" in step
    assert "confidence" in step

@pytest.mark.asyncio
async def test_get_project_export_plan(async_client: AsyncClient, export_plan_context: dict):
    headers = export_plan_context["headers"]
    project_id = export_plan_context["project_id"]
    
    payload = {
        "project_id": project_id
    }
    await async_client.post("/api/v1/export-plan/generate", headers=headers, json=payload)
    
    res = await async_client.get(f"/api/v1/projects/{project_id}/export-plan", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    
    assert data["project_id"] == project_id
    assert "phase_a_readiness" in data
    assert len(data["phase_a_readiness"]) > 0
    assert data["phase_a_readiness"][0]["title"] == "Profile Setup"
