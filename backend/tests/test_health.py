import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    """
    Test root GET / endpoint returns 200 OK and expected JSON message.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "CredBridge API is running"}

def test_health_check():
    """
    Test GET /api/v1/health endpoint returns 200 OK and expected status JSON.
    """
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "credbridge-api"
    }
