import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_system():
    print("--- 1. Testing Health Endpoint ---")
    res = client.get("/api/health")
    print(f"Status: {res.status_code}, Response: {res.json()}")
    assert res.status_code == 200

    print("\n--- 2. Testing User Registration ---")
    reg_payload = {
        "email": "test.user@smartvest.ai",
        "password": "Password123!",
        "full_name": "Test User"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    print(f"Register status: {res.status_code}")
    if res.status_code == 201:
        token = res.json()["access_token"]
        print(f"Token received: {token[:20]}...")
    elif res.status_code == 400:
        # User already exists from prior test, let's login
        print("User already exists, proceeding to login...")
        login_res = client.post("/api/v1/auth/login", json={"email": reg_payload["email"], "password": reg_payload["password"]})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]

    print("\n--- 3. Testing User Profile ---")
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/users/me", headers=headers)
    print(f"Profile: {res.status_code}, User: {res.json()['email']}")
    assert res.status_code == 200

    print("\n--- 4. Testing Onboarding Submission ---")
    onboard_payload = {
        "full_name": "Test User",
        "age": 30,
        "occupation": "Software Engineer",
        "monthly_income": 200000.0,
        "monthly_expenses": 60000.0,
        "existing_savings": 1500000.0,
        "investment_experience": "Intermediate",
        "risk_tolerance": "Aggressive",
        "primary_goals": ["Retirement", "House"]
    }
    res = client.post("/api/v1/onboarding/submit", json=onboard_payload, headers=headers)
    print(f"Onboarding Status: {res.status_code}, Score: {res.json().get('baseline_health_score')}")
    assert res.status_code == 200
    assert res.json().get("onboarding_completed") == True
    print("\n ALL BACKEND AUTH & ONBOARDING TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_system()
