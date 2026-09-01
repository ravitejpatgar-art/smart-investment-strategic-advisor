import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_risk_and_allocation():
    print("--- 1. Authenticating test user ---")
    login_res = client.post("/api/v1/auth/login", json={"email": "test.user@smartvest.ai", "password": "Password123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 2. Testing Risk Profile Endpoint ---")
    res = client.get("/api/v1/risk/profile", headers=headers)
    print(f"Risk status: {res.status_code}")
    data = res.json()
    print(f"Risk Score: {data['risk_score']}, Category: {data['category']}")
    print(f"Drawdown Capacity: {data['drawdown_capacity']}, Capacity: {data['investment_capacity']}")
    assert res.status_code == 200
    assert "risk_score" in data
    assert "factors" in data

    print("\n--- 3. Testing Risk Recalibration ---")
    eval_res = client.post("/api/v1/risk/evaluate", json={"age": 28, "horizon_years": 15, "market_drop_reaction": "Buy More", "experience": "Advanced"}, headers=headers)
    print(f"Recalibrate status: {eval_res.status_code}, Score: {eval_res.json()['risk_score']}")
    assert eval_res.status_code == 200

    print("\n--- 4. Testing Recommended Allocation Endpoint ---")
    alloc_res = client.get("/api/v1/allocation/recommended", headers=headers)
    print(f"Allocation status: {alloc_res.status_code}")
    alloc_data = alloc_res.json()
    print(f"Model Title: {alloc_data['model_title']}, Expected CAGR: {alloc_data['expected_cagr']}%")
    print(f"Asset Classes: {[a['asset'] for a in alloc_data['allocation']]}")
    assert alloc_res.status_code == 200
    assert len(alloc_data["allocation"]) == 7

    print("\n ALL PHASE 8 & 9 BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_risk_and_allocation()
