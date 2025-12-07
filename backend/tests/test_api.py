from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_vehicles_stub():
    response = client.get("/api/vehicles/VIN123/history")
    assert response.status_code == 200
    assert "History for VIN123" in response.json()["message"]

def test_insights_stub():
    response = client.get("/api/insights/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
