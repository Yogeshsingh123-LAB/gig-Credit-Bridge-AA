import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def worker_auth_headers():
    # Register & login a dedicated worker for testing
    email = "test.workflow.worker@example.com"
    pwd = "Password123!"
    
    # Register
    client.post("/api/v1/auth/register", json={
        "name": "Ravi Test Worker",
        "email": email,
        "password": pwd,
        "role": "WORKER"
    })
    
    # Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": pwd
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def other_worker_auth_headers():
    email = "other.worker@example.com"
    pwd = "Password123!"
    client.post("/api/v1/auth/register", json={
        "name": "Other Worker",
        "email": email,
        "password": pwd,
        "role": "WORKER"
    })
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": pwd
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_digilocker_verification_and_confirmation(worker_auth_headers):
    # 1. Start DigiLocker
    start_res = client.post("/api/v1/digilocker/start", headers=worker_auth_headers)
    assert start_res.status_code == 200
    sess_id = start_res.json()["session_id"]
    assert sess_id.startswith("DL-SESS-")
    assert start_res.json()["is_demo"] is True

    # 2. Verify identity
    ver_res = client.post("/api/v1/digilocker/verify", json={
        "session_id": sess_id,
        "verified_name": "Ravi Test Worker"
    }, headers=worker_auth_headers)
    assert ver_res.status_code == 200
    assert ver_res.json()["status"] == "VERIFIED"
    assert ver_res.json()["masked_id"] == "XXXXXXXX4821"

    # 3. Status
    status_res = client.get("/api/v1/digilocker/status", headers=worker_auth_headers)
    assert status_res.status_code == 200
    assert status_res.json()["identity_status"] == "VERIFIED"

    # 4. Confirm
    conf_res = client.post("/api/v1/digilocker/confirm", headers=worker_auth_headers)
    assert conf_res.status_code == 200
    assert conf_res.json()["status"] == "CONFIRMED"

def test_aa_consent_lifecycle(worker_auth_headers):
    # 1. Create consent
    req_res = client.post("/api/v1/aa/consents", json={
        "purpose": "Generate Verified Gig Income Report",
        "data_types": ["TRANSACTIONS", "PROFILE"],
        "selected_accounts": ["acc_hdfc_4821", "acc_sbi_9217"],
        "selected_sources": ["Uber", "Zomato"]
    }, headers=worker_auth_headers)
    assert req_res.status_code == 201
    consent_id = req_res.json()["id"]
    assert req_res.json()["status"] == "ACTIVE"

    # 2. List consents
    list_res = client.get("/api/v1/aa/consents", headers=worker_auth_headers)
    assert list_res.status_code == 200
    assert any(c["id"] == consent_id for c in list_res.json())

    # 3. Revoke consent
    rev_res = client.post(f"/api/v1/aa/consents/{consent_id}/revoke", headers=worker_auth_headers)
    assert rev_res.status_code == 200
    assert rev_res.json()["status"] == "REVOKED"

def test_bank_account_selection(worker_auth_headers):
    # List linked accounts
    acc_res = client.get("/api/v1/aa/bank-accounts", headers=worker_auth_headers)
    assert acc_res.status_code == 200
    accounts = acc_res.json()
    assert len(accounts) >= 2
    # Verify masking
    for acc in accounts:
        assert acc["account_mask"].startswith("****")

    # Update selection
    sel_ids = [accounts[0]["id"]]
    update_res = client.post("/api/v1/aa/bank-accounts/select", json={
        "selected_account_ids": sel_ids
    }, headers=worker_auth_headers)
    assert update_res.status_code == 200
    assert update_res.json()["selected_count"] == 1

def test_gig_platforms_listing(worker_auth_headers):
    plat_res = client.get("/api/v1/aa/platforms", headers=worker_auth_headers)
    assert plat_res.status_code == 200
    platforms = plat_res.json()
    plat_names = [p["name"] for p in platforms]
    assert "Uber" in plat_names
    assert "Zomato" in plat_names
    assert "Swiggy" in plat_names

def test_transaction_filtering_and_classification(worker_auth_headers):
    # Process data with selected platforms = Uber, Zomato
    today = date.today()
    start_date = today - timedelta(days=180)

    proc_res = client.post("/api/v1/reports/process", json={
        "platforms": ["Uber", "Zomato"],
        "start_date": start_date.isoformat(),
        "end_date": today.isoformat()
    }, headers=worker_auth_headers)
    assert proc_res.status_code == 200
    data = proc_res.json()

    assert data["total_gig_income"] > 0
    assert data["average_monthly_gig_income"] > 0
    assert data["verification_confidence"] >= 70.0

    # Verify that excluded transactions are accounted for
    quality = data["data_quality"]
    assert quality["matching_transactions"] > 0
    assert quality["excluded_transactions"] > 0
    breakdown = quality["excluded_breakdown"]
    assert breakdown["personal_transfers"] >= 0
    assert breakdown["expenses"] >= 0

def test_report_generation_and_versioning(worker_auth_headers):
    today = date.today()
    start_date = today - timedelta(days=180)

    # 1. Generate Report 1 (6 months)
    gen_res = client.post("/api/v1/reports/generate", json={
        "platforms": ["Uber", "Zomato"],
        "start_date": start_date.isoformat(),
        "end_date": today.isoformat()
    }, headers=worker_auth_headers)
    assert gen_res.status_code == 201
    rep1 = gen_res.json()
    assert rep1["report_number"].startswith("CBR-") or rep1["report_number"].startswith("CB-REP-")
    assert rep1["total_verified_gig_income"] > 0
    assert len(rep1["accounts_analyzed"]) > 0

    rep1_id = rep1["id"]

    # 2. Get report detail
    detail_res = client.get(f"/api/v1/reports/{rep1_id}", headers=worker_auth_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["report_number"] == rep1["report_number"]

    # 3. Get PDF payload
    pdf_res = client.get(f"/api/v1/reports/{rep1_id}/pdf-data", headers=worker_auth_headers)
    assert pdf_res.status_code == 200
    assert pdf_res.json()["title"] == "VERIFIED GIG INCOME REPORT"
    assert "CredBridge is an evidence verification infrastructure" in pdf_res.json()["disclaimer"]

    # 4. Generate Report 2 with 3 months (creates new version, does not overwrite)
    start_3m = today - timedelta(days=90)
    gen_res2 = client.post("/api/v1/reports/generate", json={
        "platforms": ["Uber"],
        "start_date": start_3m.isoformat(),
        "end_date": today.isoformat()
    }, headers=worker_auth_headers)
    assert gen_res2.status_code == 201
    rep2 = gen_res2.json()
    assert rep2["id"] != rep1_id
    assert rep2["report_number"] != rep1["report_number"]

    # 5. List reports shows both
    list_res = client.get("/api/v1/reports", headers=worker_auth_headers)
    assert list_res.status_code == 200
    rep_ids = [r["id"] for r in list_res.json()]
    assert rep1_id in rep_ids
    assert rep2["id"] in rep_ids

def test_financial_recommendations(worker_auth_headers):
    rec_res = client.get("/api/v1/recommendations", headers=worker_auth_headers)
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) >= 2
    for r in recs:
        assert "disclaimer" in r
        assert "not a loan approval" in r["disclaimer"].lower()

def test_report_sharing_and_revocation(worker_auth_headers):
    # Generate report first
    gen_res = client.post("/api/v1/reports/generate", json={
        "platforms": ["Uber", "Zomato"]
    }, headers=worker_auth_headers)
    report_id = gen_res.json()["id"]

    # Share report
    share_res = client.post(f"/api/v1/reports/{report_id}/share", json={
        "recipient_name": "ABC Finance Ltd.",
        "include_raw_transactions": False,
        "duration_days": 30
    }, headers=worker_auth_headers)
    assert share_res.status_code == 201
    share_id = share_res.json()["id"]
    assert share_res.json()["recipient_name"] == "ABC Finance Ltd."
    assert share_res.json()["status"] == "ACTIVE"

    # List shares
    list_shares = client.get(f"/api/v1/reports/{report_id}/shares", headers=worker_auth_headers)
    assert list_shares.status_code == 200
    assert any(s["id"] == share_id for s in list_shares.json())

    # Revoke share
    rev_res = client.post(f"/api/v1/reports/shares/{share_id}/revoke", headers=worker_auth_headers)
    assert rev_res.status_code == 200
    assert rev_res.json()["status"] == "REVOKED"

def test_privacy_data_access_audit_history(worker_auth_headers):
    # Perform an action that writes to the audit log
    client.post("/api/v1/digilocker/start", headers=worker_auth_headers)
    
    audit_res = client.get("/api/v1/audit/data-access", headers=worker_auth_headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) > 0
    # Ensure no raw transaction lists or secrets are in descriptions
    for entry in logs:
        assert "password" not in entry["description"].lower()
        assert "secret" not in entry["description"].lower()

def test_worker_data_isolation_and_ownership(worker_auth_headers, other_worker_auth_headers):
    # Worker 1 generates report
    gen_res = client.post("/api/v1/reports/generate", json={"platforms": ["Uber"]}, headers=worker_auth_headers)
    rep_id = gen_res.json()["id"]

    # Worker 2 tries to access Worker 1's report -> 404 unauthorized
    unauth_res = client.get(f"/api/v1/reports/{rep_id}", headers=other_worker_auth_headers)
    assert unauth_res.status_code == 404

def test_simplified_workflow_digilocker_pdf_and_12m_metrics():
    # 1. DigiLocker session endpoint
    sess_res = client.get("/api/v1/auth/digilocker/session")
    assert sess_res.status_code == 200
    assert sess_res.json()["mode"] == "DEMO MODE"

    # 2. Authenticate worker via DigiLocker passwordless
    dl_login = client.post("/api/v1/auth/digilocker", json={
        "name": "Ravi Kumar",
        "masked_aadhaar": "XXXXXXXX4821",
        "is_new_user": False
    })
    assert dl_login.status_code == 200
    token = dl_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Financial accounts aliases
    acc_res = client.get("/api/v1/financial/accounts", headers=headers)
    assert acc_res.status_code == 200
    accounts = acc_res.json()
    assert len(accounts) >= 1
    selected_id = accounts[0]["id"]

    sel_res = client.post("/api/v1/financial/accounts/select", json={
        "selected_account_ids": [selected_id]
    }, headers=headers)
    assert sel_res.status_code == 200

    # 4. Generate 12-month report with consistency score
    rep_res = client.post("/api/v1/reports/generate", json={}, headers=headers)
    assert rep_res.status_code == 201
    rep_data = rep_res.json()
    assert rep_data["months_analyzed"] == 12
    assert "consistency_score" in rep_data
    assert 0 <= rep_data["consistency_score"] <= 100
    assert rep_data["report_id"].startswith("CBR-")

    report_id = rep_data["report_id"]

    # 5. Direct PDF generation and download
    pdf_res = client.get(f"/api/v1/reports/{report_id}/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF-")
    assert len(pdf_res.content) > 1000  # Valid binary PDF stream
