import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoint(name, url, method="GET", data=None, headers=None, expected_status=200):
    try:
        req = urllib.request.Request(url, method=method)
        if headers:
            for k, v in headers.items():
                req.add_header(k, v)
        if data:
            req.data = json.dumps(data).encode('utf-8')
            req.add_header("Content-Type", "application/json")
        
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode('utf-8'))
            assert resp.status == expected_status, f"Expected {expected_status}, got {resp.status}"
            print(f"[PASS] {name} (HTTP {resp.status})")
            return body
    except urllib.error.HTTPError as e:
        if e.code == expected_status:
            print(f"[PASS] {name} (Expected HTTP {e.code})")
            try:
                return json.loads(e.read().decode('utf-8'))
            except Exception:
                return {}
        else:
            print(f"[FAIL] {name}: HTTP {e.code} - {e.read().decode('utf-8')}")
            sys.exit(1)
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
        sys.exit(1)

print("=" * 75)
print("RUNNING COMPREHENSIVE MARKETPLACE EXPLORER TEST SUITE (13 SCENARIOS)")
print("=" * 75)

# 1. Search Indian Stock
res_stock = test_endpoint("1. Search Indian Stock (Reliance)", f"{BASE_URL}/market/instruments?q=Reliance&asset_type=STOCK")
assert any("RELIANCE" in item["symbol"] for item in res_stock.get("items", [])), "Reliance not found in Indian stocks"

# 2. Search US Stock
res_us = test_endpoint("2. Search US Stock (Nvidia)", f"{BASE_URL}/market/instruments?q=Nvidia&asset_type=STOCK")
assert any(item["symbol"] == "NVDA" for item in res_us.get("items", [])), "NVDA not found in US stocks"

# 3. Search ETF
res_etf = test_endpoint("3. Search ETF (NiftyBeES)", f"{BASE_URL}/market/instruments?q=NiftyBeES&asset_type=ETF")
assert any(item["symbol"] == "NIFTYBEES" for item in res_etf.get("items", [])), "NIFTYBEES not found in ETFs"

# 4. Search Mutual Fund
res_mf = test_endpoint("4. Search Mutual Fund (Parag Parikh)", f"{BASE_URL}/market/instruments?q=Parag+Parikh&asset_type=MUTUAL_FUND")
assert any("Parag Parikh" in item["name"] for item in res_mf.get("items", [])), "Parag Parikh not found in Mutual Funds"

# 5. Search Index
res_idx = test_endpoint("5. Search Index (Nifty 50)", f"{BASE_URL}/market/instruments?q=Nifty+50&asset_type=INDEX")
assert any(item["symbol"] == "NIFTY 50" for item in res_idx.get("items", [])), "NIFTY 50 not found in Index"

# 6. Alias Resolution (Microsoft -> MSFT)
res_alias = test_endpoint("6. Alias Resolution (Microsoft -> MSFT)", f"{BASE_URL}/market/instruments?q=Microsoft")
assert any(item["symbol"] == "MSFT" for item in res_alias.get("items", [])), "Microsoft alias failed to resolve MSFT"

# 7. Asset-Type Differentiation (Search 'Nifty' across types)
res_diff_idx = test_endpoint("7a. Asset Differentiation: Nifty INDEX", f"{BASE_URL}/market/instruments?q=Nifty&asset_type=INDEX")
assert all(item["assetType"] == "INDEX" for item in res_diff_idx.get("items", [])), "Index filter contained non-index items"

res_diff_etf = test_endpoint("7b. Asset Differentiation: Nifty ETF", f"{BASE_URL}/market/instruments?q=Nifty&asset_type=ETF")
assert all(item["assetType"] == "ETF" for item in res_diff_etf.get("items", [])), "ETF filter contained non-ETF items"

res_diff_mf = test_endpoint("7c. Asset Differentiation: Nifty MUTUAL_FUND", f"{BASE_URL}/market/instruments?q=Nifty&asset_type=MUTUAL_FUND")
assert all(item["assetType"] == "MUTUAL_FUND" for item in res_diff_mf.get("items", [])), "MF filter contained non-MF items"

# 8. Pagination
res_p1 = test_endpoint("8a. Pagination Page 1 (limit 3)", f"{BASE_URL}/market/instruments?page=1&limit=3")
assert len(res_p1.get("items", [])) == 3, f"Expected 3 items, got {len(res_p1.get('items', []))}"
res_p2 = test_endpoint("8b. Pagination Page 2 (limit 3)", f"{BASE_URL}/market/instruments?page=2&limit=3")
assert res_p1["items"][0]["canonicalId"] != res_p2["items"][0]["canonicalId"], "Page 1 and Page 2 returned identical items"

# 9. Empty Search (Browse all)
res_all = test_endpoint("9. Empty Search / Browse All", f"{BASE_URL}/market/instruments?limit=25")
assert res_all["total"] > 10, "Total instruments catalogue too small"

# 10. Unsupported Instrument / Dynamic resolution fallback
res_unsupp = test_endpoint("10. Search non-existent gibberish query", f"{BASE_URL}/market/instruments?q=XYZ123NONEXISTENT999")
assert res_unsupp["total"] == 0, "Non-existent instrument should yield 0 results"

# 11. Provider Resilience Check (GET /market/quote for unknown returns structured unavailable quote, not 500)
res_prov = test_endpoint("11. Provider Resilience (Unknown quote returns unavailable schema)", f"{BASE_URL}/market/quote/UNKNOWN_INSTRUMENT_99")
assert res_prov.get("freshness") in ["UNAVAILABLE", "STALE"], "Provider resilience failed"

# 12. User Watchlist Isolation (Register/Login 2 users and test isolation)
import time
ts = int(time.time())
email_a = f"user_a_market_{ts}@test.com"
email_b = f"user_b_market_{ts}@test.com"

# Register User A & User B
auth_user_a = test_endpoint("12a. Register User A", f"{BASE_URL}/auth/register", method="POST", data={"email": email_a, "password": "password123", "full_name": "User A"}, expected_status=201)
token_a = auth_user_a["access_token"]
headers_a = {"Authorization": f"Bearer {token_a}"}

auth_user_b = test_endpoint("12b. Register User B", f"{BASE_URL}/auth/register", method="POST", data={"email": email_b, "password": "password123", "full_name": "User B"}, expected_status=201)
token_b = auth_user_b["access_token"]
headers_b = {"Authorization": f"Bearer {token_b}"}

# Add NVDA to User A watchlist
test_endpoint("12c. Add NVDA to User A watchlist", f"{BASE_URL}/market/watchlist/NASDAQ:NVDA", method="POST", headers=headers_a)

# Add RELIANCE to User B watchlist
test_endpoint("12d. Add RELIANCE to User B watchlist", f"{BASE_URL}/market/watchlist/NSE:RELIANCE", method="POST", headers=headers_b)

# Check User A watchlist (contains NVDA, not RELIANCE)
wl_a = test_endpoint("12e. Verify User A watchlist isolation", f"{BASE_URL}/market/watchlist", headers=headers_a)
symbols_a = [item["symbol"] for item in wl_a]
assert "NVDA" in symbols_a, "NVDA not in User A watchlist"
assert "RELIANCE" not in symbols_a, "User B's RELIANCE leaked into User A watchlist"

# Check User B watchlist (contains RELIANCE, not NVDA)
wl_b = test_endpoint("12f. Verify User B watchlist isolation", f"{BASE_URL}/market/watchlist", headers=headers_b)
symbols_b = [item["symbol"] for item in wl_b]
assert "RELIANCE" in symbols_b, "RELIANCE not in User B watchlist"
assert "NVDA" not in symbols_b, "User A's NVDA leaked into User B watchlist"

# 13. Instrument Detail
detail_res = test_endpoint("13. Instrument Detail (NASDAQ:NVDA)", f"{BASE_URL}/market/instruments/NASDAQ:NVDA")
assert detail_res["symbol"] == "NVDA"
assert "quote" in detail_res
assert "sector" in detail_res

print("\n" + "=" * 75)
print("ALL 13 MARKETPLACE EXPLORER TESTS PASSED PERFECTLY!")
print("=" * 75)
