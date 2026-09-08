import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_credbridge_workflow():
    # 1. Register Worker
    w_reg = client.post("/api/v1/auth/register", json={
        "name": "Workflow Worker",
        "email": "workflow.worker@example.com",
        "password": "Password123!",
        "role": "WORKER"
    })
    assert w_reg.status_code == 201
    assert w_reg.json()["role"] == "WORKER"

    # 2. Login Worker
    w_login = client.post("/api/v1/auth/login", json={
        "email": "workflow.worker@example.com",
        "password": "Password123!"
    })
    assert w_login.status_code == 200
    w_token = w_login.json()["access_token"]
    w_headers = {"Authorization": f"Bearer {w_token}"}

    # 3. Get Worker Profile
    w_prof = client.get("/api/v1/profile", headers=w_headers)
    assert w_prof.status_code == 200
    assert w_prof.json()["email"] == "workflow.worker@example.com"

    # 4. Generate Demo Financial Data
    demo_res = client.post("/api/v1/platforms/generate-demo-data", json={"months": 6}, headers=w_headers)
    assert demo_res.status_code == 200
    assert demo_res.json()["transaction_count"] > 0

    # 5. Get Analytics Summary
    analytics_res = client.get("/api/v1/analytics/financial-summary", headers=w_headers)
    assert analytics_res.status_code == 200
    assert analytics_res.json()["income"]["total_income"] > 0

    # 6. Run Income Verification
    ver_res = client.post("/api/v1/verification/start", json={"declared_monthly_income": 25000.0}, headers=w_headers)
    assert ver_res.status_code == 200
    assert ver_res.json()["verification_status"] in ["VERIFIED", "PARTIALLY_VERIFIED"]

    # 7. Calculate Financial Readiness Score
    score_res = client.post("/api/v1/score/calculate", headers=w_headers)
    assert score_res.status_code == 200
    assert 0 <= score_res.json()["overall_score"] <= 100

    # 8. Generate Credit Passport
    pass_res = client.post("/api/v1/passport/generate", headers=w_headers)
    assert pass_res.status_code == 200
    passport_id = pass_res.json()["id"]
    assert pass_res.json()["passport_number"].startswith("CB-PASS-")

    # 9. Register Lender
    l_reg = client.post("/api/v1/auth/register", json={
        "name": "Workflow Lender",
        "email": "workflow.lender@example.com",
        "password": "Password123!",
        "role": "LENDER"
    })
    assert l_reg.status_code == 201
    
    # Login Lender
    l_login = client.post("/api/v1/auth/login", json={
        "email": "workflow.lender@example.com",
        "password": "Password123!"
    })
    assert l_login.status_code == 200
    l_token = l_login.json()["access_token"]
    l_headers = {"Authorization": f"Bearer {l_token}"}

    # Lender profile ID
    lenders_list = client.get("/api/v1/consent/lenders-list", headers=w_headers).json()
    assert len(lenders_list) > 0
    # Match the newly registered workflow lender by contact_email
    target_lender = next((l for l in lenders_list if l.get("contact_email") == "workflow.lender@example.com"), lenders_list[0])
    target_lender_id = target_lender["lender_id"]

    # 10. Verify Lender cannot view worker data BEFORE consent
    worker_id = w_prof.json()["id"]
    forbidden_res = client.get(f"/api/v1/lenders/applicant/{worker_id}", headers=l_headers)
    assert forbidden_res.status_code == 403

    # 11. Worker grants consent to Lender
    grant_res = client.post("/api/v1/consent/grant", json={
        "lender_id": target_lender_id,
        "passport_id": passport_id,
        "duration_days": 30
    }, headers=w_headers)
    assert grant_res.status_code == 200
    consent_id = grant_res.json()["consent"]["id"]

    # 12. Lender views applicant after consent
    applicant_detail = client.get(f"/api/v1/lenders/applicant/{worker_id}", headers=l_headers)
    assert applicant_detail.status_code == 200
    assert applicant_detail.json()["worker"]["name"] == "Workflow Worker"
    assert applicant_detail.json()["passport"]["passport_number"] == pass_res.json()["passport_number"]

    # 13. Lender runs What-If Simulator
    sim_res = client.post("/api/v1/lenders/simulator", json={
        "worker_id": worker_id,
        "income_change_pct": 15.0,
        "expense_change_pct": -5.0
    }, headers=l_headers)
    assert sim_res.status_code == 200
    assert sim_res.json()["simulated_monthly_income"] > sim_res.json()["original_monthly_income"]

    # 14. Worker revokes consent
    revoke_res = client.post("/api/v1/consent/revoke", json={"consent_id": consent_id}, headers=w_headers)
    assert revoke_res.status_code == 200

    # 15. Lender access immediately blocked after revocation
    blocked_res = client.get(f"/api/v1/lenders/applicant/{worker_id}", headers=l_headers)
    assert blocked_res.status_code == 403

    # 16. Admin Login & Dashboard access
    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@credbridge.com",
        "password": "Admin@123456"
    })
    assert admin_login.status_code == 200
    a_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    admin_dash = client.get("/api/v1/admin/dashboard", headers=a_headers)
    assert admin_dash.status_code == 200
    assert admin_dash.json()["total_workers"] >= 1
