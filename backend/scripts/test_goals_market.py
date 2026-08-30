import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_goals_and_market():
    print("--- 1. Authenticating test user ---")
    login_res = client.post("/api/v1/auth/login", json={"email": "test.user@smartvest.ai", "password": "Password123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 2. Testing Goal Listing ---")
    goals_res = client.get("/api/v1/goals", headers=headers)
    print(f"Goals status: {goals_res.status_code}, Found: {len(goals_res.json())}")
    assert goals_res.status_code == 200
    assert len(goals_res.json()) > 0

    print("\n--- 3. Testing Goal Compounding Simulator Endpoint ---")
    calc_res = client.post("/api/v1/goals/calculate", json={
        "target_amount": 25000000.0,
        "current_amount": 4000000.0,
        "time_horizon_years": 10,
        "risk_profile": "Aggressive"
    })
    print(f"Calc status: {calc_res.status_code}")
    calc_data = calc_res.json()
    print(f"Required Monthly SIP: {calc_data['required_monthly_sip']}, Probability: {calc_data['probability']}%")
    assert calc_res.status_code == 200
    assert "required_monthly_sip" in calc_data
    assert "timeline" in calc_data

    print("\n--- 4. Testing Creating New Goal ---")
    new_g = {
        "title": "Startup Angel Fund",
        "category": "Wealth Creation",
        "target_amount": 10000000.0,
        "current_amount": 2000000.0,
        "target_date": "2030-01-01",
        "risk_profile": "Aggressive"
    }
    create_res = client.post("/api/v1/goals", json=new_g, headers=headers)
    print(f"Create goal status: {create_res.status_code}")
    assert create_res.status_code == 201
    goal_id = create_res.json()["id"]

    print("\n--- 5. Testing Deleting Goal ---")
    del_res = client.delete(f"/api/v1/goals/{goal_id}", headers=headers)
    print(f"Delete goal status: {del_res.status_code}")
    assert del_res.status_code == 204

    print("\n--- 6. Testing Market Intelligence Overview ---")
    market_res = client.get("/api/v1/market/overview")
    print(f"Market overview status: {market_res.status_code}")
    market_data = market_res.json()
    print(f"India Indices count: {len(market_data['indices']['india'])}, US Indices count: {len(market_data['indices']['us'])}")
    assert market_res.status_code == 200
    assert "indices" in market_data
    assert "sector_heatmap" in market_data

    print("\n--- 7. Testing Market Movers & Heatmap ---")
    movers_res = client.get("/api/v1/market/movers")
    assert movers_res.status_code == 200
    heatmap_res = client.get("/api/v1/market/heatmap")
    assert heatmap_res.status_code == 200

    print("\n ALL PHASE 12 & 13 BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_goals_and_market()
