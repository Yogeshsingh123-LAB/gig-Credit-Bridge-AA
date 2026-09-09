import os
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.models.user import User
from app.models.enums import UserRole
from app.models.lender_organization import LenderOrganization
from app.models.lender_profile import LenderProfile
from app.models.audit_log import AuditLog

client = TestClient(app)

def get_auth_token(email: str, password: str = "Password123!") -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]


@pytest.fixture
def admin_headers():
    token = get_auth_token("admin@demo.credbridge.local", "Admin@123456")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def lender_finance_admin_headers():
    token = get_auth_token("lender-admin@demo-finance.local", "Password123!")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def lender_capital_admin_headers():
    token = get_auth_token("lender-admin@demo-capital.local", "Password123!")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def worker_headers():
    email = "test.lender.mgmt.worker@example.com"
    pwd = "Password123!"
    client.post("/api/v1/auth/register", json={
        "name": "Test Worker",
        "email": email,
        "password": pwd,
        "role": "WORKER"
    })
    token = get_auth_token(email, pwd)
    return {"Authorization": f"Bearer {token}"}


def test_admin_can_create_lender(admin_headers):
    payload = {
        "organization_name": "Test Acme Capital",
        "organization_identifier": "ORG-ACME-99",
        "contact_email": "contact@acmecapital.demo",
        "contact_person": "Jane Doe",
        "status": "PENDING"
    }
    res = client.post("/api/v1/admin/lenders", json=payload, headers=admin_headers)
    assert res.status_code == 201, f"Failed to create lender: {res.text}"
    data = res.json()
    assert data["organization_name"] == "Test Acme Capital"
    assert data["organization_identifier"] == "ORG-ACME-99"
    assert data["status"] == "PENDING"
    assert data["lender_id"].startswith("LND-")


def test_lender_id_is_unique(admin_headers):
    res1 = client.post("/api/v1/admin/lenders", json={
        "organization_name": "Unique Test Org 1",
        "organization_identifier": "ORG-UNIQ-1",
        "contact_email": "u1@demo.local"
    }, headers=admin_headers)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/admin/lenders", json={
        "organization_name": "Unique Test Org 2",
        "organization_identifier": "ORG-UNIQ-2",
        "contact_email": "u2@demo.local"
    }, headers=admin_headers)
    assert res2.status_code == 201

    assert res1.json()["lender_id"] != res2.json()["lender_id"]


def test_duplicate_organization_identifier_rejected(admin_headers):
    payload = {
        "organization_name": "Duplicate Ident Org 1",
        "organization_identifier": "ORG-DUP-IDENT",
        "contact_email": "dup1@demo.local"
    }
    res1 = client.post("/api/v1/admin/lenders", json=payload, headers=admin_headers)
    assert res1.status_code == 201

    payload2 = {
        "organization_name": "Duplicate Ident Org 2",
        "organization_identifier": "ORG-DUP-IDENT",
        "contact_email": "dup2@demo.local"
    }
    res2 = client.post("/api/v1/admin/lenders", json=payload2, headers=admin_headers)
    assert res2.status_code == 400
    assert "A lender with this organization identifier already exists." in res2.json()["detail"]


def test_admin_can_activate_lender(admin_headers):
    # Create lender in PENDING status
    res = client.post("/api/v1/admin/lenders", json={
        "organization_name": "Pending Org To Activate",
        "organization_identifier": "ORG-ACTIVATE-01",
        "contact_email": "activate@demo.local",
        "status": "PENDING"
    }, headers=admin_headers)
    assert res.status_code == 201
    lender_id = res.json()["lender_id"]

    # Activate lender
    act_res = client.patch(f"/api/v1/admin/lenders/{lender_id}", json={"status": "ACTIVE"}, headers=admin_headers)
    assert act_res.status_code == 200
    assert act_res.json()["status"] == "ACTIVE"


def test_admin_can_suspend_lender(admin_headers):
    res = client.post("/api/v1/admin/lenders", json={
        "organization_name": "Org To Suspend",
        "organization_identifier": "ORG-SUSPEND-01",
        "contact_email": "suspend@demo.local",
        "status": "ACTIVE"
    }, headers=admin_headers)
    assert res.status_code == 201
    lender_id = res.json()["lender_id"]

    # Suspend lender
    susp_res = client.patch(f"/api/v1/admin/lenders/{lender_id}", json={"status": "SUSPENDED"}, headers=admin_headers)
    assert susp_res.status_code == 200
    assert susp_res.json()["status"] == "SUSPENDED"


def test_admin_can_deactivate_lender(admin_headers):
    res = client.post("/api/v1/admin/lenders", json={
        "organization_name": "Org To Deactivate",
        "organization_identifier": "ORG-DEACT-01",
        "contact_email": "deact@demo.local",
        "status": "ACTIVE"
    }, headers=admin_headers)
    assert res.status_code == 201
    lender_id = res.json()["lender_id"]

    # Deactivate lender
    deact_res = client.patch(f"/api/v1/admin/lenders/{lender_id}", json={"status": "DEACTIVATED"}, headers=admin_headers)
    assert deact_res.status_code == 200
    assert deact_res.json()["status"] == "DEACTIVATED"


def test_admin_can_create_lender_user(admin_headers):
    # Create lender
    create_org = client.post("/api/v1/admin/lenders", json={
        "organization_name": "Org User Test",
        "organization_identifier": "ORG-USER-01",
        "contact_email": "orguser@demo.local",
        "status": "ACTIVE"
    }, headers=admin_headers)
    assert create_org.status_code == 201
    lender_id = create_org.json()["lender_id"]

    # Create lender user
    u_res = client.post(f"/api/v1/admin/lenders/{lender_id}/users", json={
        "name": "Rohan Patel",
        "email": "rohan.patel@orguser.demo",
        "role": "LENDER_OFFICER"
    }, headers=admin_headers)
    assert u_res.status_code == 201
    udata = u_res.json()
    assert udata["name"] == "Rohan Patel"
    assert udata["email"] == "rohan.patel@orguser.demo"
    assert udata["role"] == "LENDER_OFFICER"
    assert udata["status"] == "INVITED"


def test_admin_can_change_lender_user_role(admin_headers):
    create_org = client.post("/api/v1/admin/lenders", json={
        "organization_name": "Role Change Org",
        "organization_identifier": "ORG-ROLE-01",
        "contact_email": "roleorg@demo.local"
    }, headers=admin_headers)
    lender_id = create_org.json()["lender_id"]

    u_res = client.post(f"/api/v1/admin/lenders/{lender_id}/users", json={
        "name": "Amit Sharma",
        "email": "amit.sharma@roleorg.demo",
        "role": "LENDER_OFFICER"
    }, headers=admin_headers)
    user_id = u_res.json()["user_id"]

    # Change role to LENDER_ADMIN
    patch_res = client.patch(f"/api/v1/admin/lenders/{lender_id}/users/{user_id}", json={
        "role": "LENDER_ADMIN"
    }, headers=admin_headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["role"] == "LENDER_ADMIN"


def test_admin_can_suspend_lender_user(admin_headers):
    create_org = client.post("/api/v1/admin/lenders", json={
        "organization_name": "User Suspend Org",
        "organization_identifier": "ORG-USERSUSP-01",
        "contact_email": "usersusp@demo.local"
    }, headers=admin_headers)
    lender_id = create_org.json()["lender_id"]

    u_res = client.post(f"/api/v1/admin/lenders/{lender_id}/users", json={
        "name": "Pooja Verma",
        "email": "pooja.verma@usersusp.demo",
        "role": "LENDER_OFFICER"
    }, headers=admin_headers)
    user_id = u_res.json()["user_id"]

    # Suspend user
    patch_res = client.patch(f"/api/v1/admin/lenders/{lender_id}/users/{user_id}", json={
        "status": "SUSPENDED"
    }, headers=admin_headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "SUSPENDED"
    assert patch_res.json()["is_active"] is False


def test_lender_user_cannot_access_admin_api(lender_finance_admin_headers):
    res = client.get("/api/v1/admin/lenders", headers=lender_finance_admin_headers)
    assert res.status_code == 403

    post_res = client.post("/api/v1/admin/lenders", json={"organization_name": "Hack Org"}, headers=lender_finance_admin_headers)
    assert post_res.status_code == 403


def test_lender_cannot_access_other_lender(lender_finance_admin_headers, lender_capital_admin_headers):
    # Lender A gets organization
    res_fin = client.get("/api/v1/lender/organization", headers=lender_finance_admin_headers)
    assert res_fin.status_code == 200

    # Lender B gets organization
    res_cap = client.get("/api/v1/lender/organization", headers=lender_capital_admin_headers)
    assert res_cap.status_code == 200

    # Tampering check
    cap_user_id = res_cap.json()["members"][0]["user_id"]
    tamper = client.patch(f"/api/v1/lender/organization/users/{cap_user_id}", json={"is_active": False}, headers=lender_finance_admin_headers)
    assert tamper.status_code == 404


def test_worker_cannot_access_admin_lender_management(worker_headers):
    res = client.get("/api/v1/admin/lenders", headers=worker_headers)
    assert res.status_code == 403


def test_audit_log_created_for_lender_changes(admin_headers):
    create_res = client.post("/api/v1/admin/lenders", json={
        "organization_name": "Audit Tracked Org",
        "organization_identifier": "ORG-AUDIT-01",
        "contact_email": "audit@demo.local"
    }, headers=admin_headers)
    assert create_res.status_code == 201
    lender_id = create_res.json()["lender_id"]

    # Perform status change
    client.patch(f"/api/v1/admin/lenders/{lender_id}", json={"status": "SUSPENDED"}, headers=admin_headers)

    # Check audit logs endpoint
    audit_res = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()["items"]
    actions = [l["action"] for l in logs]
    assert "LENDER_CREATED" in actions or "CREATE_LENDER_ORGANIZATION" in actions
    assert "LENDER_SUSPENDED" in actions or "UPDATE_ORGANIZATION_STATUS" in actions
