import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_expenses_and_emergency():
    print("--- 1. Authenticating test user ---")
    login_res = client.post("/api/v1/auth/login", json={"email": "test.user@smartvest.ai", "password": "Password123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 2. Testing Expense Listing & Seed ---")
    res = client.get("/api/v1/expenses", headers=headers)
    print(f"Status: {res.status_code}, Expenses count: {len(res.json())}")
    assert res.status_code == 200
    assert len(res.json()) > 0

    print("\n--- 3. Testing Expense Creation ---")
    new_expense = {
        "category": "Healthcare",
        "amount": 2500.0,
        "date": "2026-08-24",
        "description": "Annual Health Checkup",
        "is_recurring": False
    }
    create_res = client.post("/api/v1/expenses", json=new_expense, headers=headers)
    print(f"Create status: {create_res.status_code}")
    assert create_res.status_code == 201
    expense_id = create_res.json()["id"]

    print("\n--- 4. Testing Expense Analytics ---")
    analytics_res = client.get("/api/v1/expenses/analytics", headers=headers)
    print(f"Analytics status: {analytics_res.status_code}")
    data = analytics_res.json()
    print(f"Total spending: {data['total_monthly_spending']}")
    print(f"50/30/20 Needs: {data['budget_50_30_20']['needs']['percentage']}%")
    assert analytics_res.status_code == 200

    print("\n--- 5. Testing Emergency Fund Status ---")
    ef_res = client.get("/api/v1/emergency-fund", headers=headers)
    print(f"Emergency Fund status: {ef_res.status_code}")
    ef_data = ef_res.json()
    print(f"Runway: {ef_data['runway_months']} Months, Status: {ef_data['status']}")
    print(f"Required Fund: {ef_data['required_fund']}, Current: {ef_data['current_fund']}")
    assert ef_res.status_code == 200
    assert ef_data["status"] in ["Healthy", "Moderate", "Critical"]

    print("\n--- 6. Testing Expense Deletion ---")
    del_res = client.delete(f"/api/v1/expenses/{expense_id}", headers=headers)
    print(f"Delete status: {del_res.status_code}")
    assert del_res.status_code == 204

    print("\n ALL PHASE 6 & 7 BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_expenses_and_emergency()
