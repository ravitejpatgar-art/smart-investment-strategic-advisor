import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_stocks_and_portfolio():
    print("--- 1. Authenticating test user ---")
    login_res = client.post("/api/v1/auth/login", json={"email": "test.user@smartvest.ai", "password": "Password123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 2. Testing Stock Search ---")
    search_res = client.get("/api/v1/stocks/search?q=RELIANCE")
    print(f"Search status: {search_res.status_code}, Found: {len(search_res.json())}")
    assert search_res.status_code == 200
    assert len(search_res.json()) > 0

    print("\n--- 3. Testing Stock Analysis & Technical Indicators ---")
    stock_res = client.get("/api/v1/stocks/RELIANCE.NS")
    print(f"Stock status: {stock_res.status_code}")
    data = stock_res.json()
    print(f"Price: {data['currentPrice']}, RSI: {data['rsi']}, AI Signal: {data['aiSignal']} ({data['aiConfidence']}%)")
    assert stock_res.status_code == 200
    assert "rsi" in data
    assert "macd" in data
    assert "bollinger" in data
    assert data["aiSignal"] in ["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"]

    print("\n--- 4. Testing Portfolio Listing ---")
    port_res = client.get("/api/v1/portfolio", headers=headers)
    print(f"Portfolio status: {port_res.status_code}")
    port_data = port_res.json()
    print(f"Total Value: {port_data['summary']['total_portfolio_value']}, Holdings: {port_data['summary']['holdings_count']}")
    assert port_res.status_code == 200
    assert len(port_data["holdings"]) > 0

    print("\n--- 5. Testing Adding New Holding ---")
    new_h = {
        "symbol": "TCS.NS",
        "name": "Tata Consultancy Services",
        "asset_class": "Indian Stocks",
        "shares": 25.0,
        "avg_buy_price": 3850.0
    }
    add_res = client.post("/api/v1/portfolio/holdings", json=new_h, headers=headers)
    print(f"Add holding status: {add_res.status_code}")
    assert add_res.status_code == 201
    holding_id = add_res.json()["id"]

    print("\n--- 6. Testing Deleting Holding ---")
    del_res = client.delete(f"/api/v1/portfolio/holdings/{holding_id}", headers=headers)
    print(f"Delete holding status: {del_res.status_code}")
    assert del_res.status_code == 204

    print("\n ALL PHASE 10 & 11 BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_stocks_and_portfolio()
