import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_dashboard_and_health():
    print("--- 1. Testing Login to get Auth Token ---")
    login_res = client.post("/api/v1/auth/login", json={"email": "test.user@smartvest.ai", "password": "Password123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 2. Testing Health Score Evaluation Engine ---")
    res = client.get("/api/v1/health-score", headers=headers)
    print(f"Health Score Status: {res.status_code}")
    data = res.json()
    print(f"Health Score: {data['score']}, Grade: {data['grade']}, Status: {data['status']}")
    print(f"Pillars: {list(data['factors'].keys())}")
    assert res.status_code == 200
    assert "savingsRate" in data["factors"]
    assert "emergencyFund" in data["factors"]

    print("\n--- 3. Testing Dashboard Summary Aggregator ---")
    dash_res = client.get("/api/v1/dashboard/summary", headers=headers)
    print(f"Dashboard Status: {dash_res.status_code}")
    dash_data = dash_res.json()
    print(f"Net Worth: {dash_data['financials']['net_worth']}")
    print(f"Market Indices Count: {len(dash_data['market_indices'])}")
    print(f"Top Recommendations Count: {len(dash_data['top_ai_recommendations'])}")
    assert dash_res.status_code == 200
    assert len(dash_data["market_indices"]) > 0

    print("\n ALL PHASE 4 & 5 BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_dashboard_and_health()
