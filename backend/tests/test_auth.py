import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.enums import UserRole
from app.models.user import User
from app.core.security import hash_password, create_access_token
from datetime import timedelta

client = TestClient(app)

def test_register_worker_success():
    payload = {
        "name": "Jane Worker",
        "email": "jane.worker@example.com",
        "password": "password123",
        "role": "WORKER"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Jane Worker"
    assert data["email"] == "jane.worker@example.com"
    assert data["role"] == "WORKER"
    assert data["is_active"] is True
    assert data["worker_profile"] is not None
    assert "password" not in data
    assert "password_hash" not in data

def test_register_lender_success():
    payload = {
        "name": "Acme Capital",
        "email": "lender@acme.com",
        "password": "lenderpassword123",
        "role": "LENDER"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "lender@acme.com"
    assert data["role"] == "LENDER"
    assert data["lender_profile"] is not None

def test_register_admin_blocked():
    payload = {
        "name": "Malicious Admin",
        "email": "admin@hacker.com",
        "password": "adminpassword123",
        "role": "ADMIN"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code in [400, 422]

def test_register_duplicate_email_blocked():
    payload = {
        "name": "First User",
        "email": "dup@example.com",
        "password": "password123",
        "role": "WORKER"
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_register_weak_password_rejected():
    payload = {
        "name": "Weak Pass User",
        "email": "weak@example.com",
        "password": "123",
        "role": "WORKER"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422

def test_login_success():
    # Register first
    client.post("/api/v1/auth/register", json={
        "name": "Login User",
        "email": "login@example.com",
        "password": "password123",
        "role": "WORKER"
    })

    # Login
    response = client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password():
    client.post("/api/v1/auth/register", json={
        "name": "Wrong Pass User",
        "email": "wrongpass@example.com",
        "password": "correctpassword",
        "role": "WORKER"
    })

    response = client.post("/api/v1/auth/login", json={
        "email": "wrongpass@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_login_unknown_email():
    response = client.post("/api/v1/auth/login", json={
        "email": "unknown@example.com",
        "password": "anypassword"
    })
    assert response.status_code == 401

def test_get_me_success():
    # Register & Login
    client.post("/api/v1/auth/register", json={
        "name": "Me User",
        "email": "me@example.com",
        "password": "password123",
        "role": "WORKER"
    })
    login_res = client.post("/api/v1/auth/login", json={
        "email": "me@example.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]

    # Call /auth/me
    response = client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["role"] == "WORKER"

def test_get_me_missing_token():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_get_me_expired_token():
    token = create_access_token(subject="fake-user-id", role="WORKER", expires_delta=timedelta(seconds=-10))
    response = client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 401

def test_role_authorization_matrix():
    # 1. Register Worker
    client.post("/api/v1/auth/register", json={
        "name": "Worker User",
        "email": "worker.matrix@example.com",
        "password": "password123",
        "role": "WORKER"
    })
    worker_token = client.post("/api/v1/auth/login", json={
        "email": "worker.matrix@example.com",
        "password": "password123"
    }).json()["access_token"]

    # 2. Register Lender
    client.post("/api/v1/auth/register", json={
        "name": "Lender User",
        "email": "lender.matrix@example.com",
        "password": "password123",
        "role": "LENDER"
    })
    lender_token = client.post("/api/v1/auth/login", json={
        "email": "lender.matrix@example.com",
        "password": "password123"
    }).json()["access_token"]

    # Worker accesses /test-worker -> 200
    res = client.get("/api/v1/auth/test-worker", headers={"Authorization": f"Bearer {worker_token}"})
    assert res.status_code == 200

    # Worker accesses /test-lender -> 403 Forbidden
    res = client.get("/api/v1/auth/test-lender", headers={"Authorization": f"Bearer {worker_token}"})
    assert res.status_code == 403

    # Lender accesses /test-lender -> 200
    res = client.get("/api/v1/auth/test-lender", headers={"Authorization": f"Bearer {lender_token}"})
    assert res.status_code == 200

    # Lender accesses /test-worker -> 403 Forbidden
    res = client.get("/api/v1/auth/test-worker", headers={"Authorization": f"Bearer {lender_token}"})
    assert res.status_code == 403

def test_login_email_case_normalization():
    # Register mixed-case email
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Case Test User",
        "email": "CaseUser.Test@Example.Com",
        "password": "Password123!",
        "role": "WORKER"
    })
    assert reg_res.status_code == 201

    # Login using uppercase email
    login_res1 = client.post("/api/v1/auth/login", json={
        "email": "CASEUSER.TEST@EXAMPLE.COM",
        "password": "Password123!"
    })
    assert login_res1.status_code == 200
    assert "access_token" in login_res1.json()

    # Login using lowercase email
    login_res2 = client.post("/api/v1/auth/login", json={
        "email": "caseuser.test@example.com",
        "password": "Password123!"
    })
    assert login_res2.status_code == 200

def test_login_inactive_user():
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    try:
        reg_res = client.post("/api/v1/auth/register", json={
            "name": "Inactive User",
            "email": "inactive.user@example.com",
            "password": "Password123!",
            "role": "WORKER"
        })
        assert reg_res.status_code == 201
        
        # Deactivate user in DB directly
        u = db.query(User).filter(User.email == "inactive.user@example.com").first()
        if u:
            u.is_active = False
            db.commit()

        login_res = client.post("/api/v1/auth/login", json={
            "email": "inactive.user@example.com",
            "password": "Password123!"
        })
        assert login_res.status_code == 403
        assert "inactive" in login_res.json()["detail"].lower()
    finally:
        db.close()

