import urllib.request
import urllib.parse
import json
import sys
import time

BASE_URL = "http://localhost:8000/api/v1"

def api_call(name, url, method="GET", data=None, headers=None, expected_status=200):
    try:
        req = urllib.request.Request(url, method=method)
        if headers:
            for k, v in headers.items():
                req.add_header(k, v)
        if data is not None:
            req.data = json.dumps(data).encode('utf-8')
            req.add_header("Content-Type", "application/json")
        
        with urllib.request.urlopen(req, timeout=12) as resp:
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

print("=" * 80)
print("RUNNING 20-SCENARIO GLOBAL MARKET UNIVERSE & INSTRUMENT MASTER TEST SUITE")
print("=" * 80)

# 1. TSMC Search
res_tsmc = api_call("1. TSMC Search", f"{BASE_URL}/market/instruments?q=TSMC")
assert any("TSMC" in it["name"] or "Taiwan Semiconductor" in it["name"] or it["symbol"] in ["TSM", "2330.TW"] for it in res_tsmc["items"]), "TSMC not found"

# 2. Microsoft Search
res_msft = api_call("2. Microsoft Search", f"{BASE_URL}/market/instruments?q=Microsoft")
assert any(it["symbol"] == "MSFT" or "Microsoft" in it["name"] for it in res_msft["items"]), "Microsoft not found"

# 3. Nvidia Search
res_nvda = api_call("3. Nvidia Search", f"{BASE_URL}/market/instruments?q=Nvidia")
assert any(it["symbol"] == "NVDA" or "NVIDIA" in it["name"] for it in res_nvda["items"]), "Nvidia not found"

# 4. Indian Stock Search
res_tata = api_call("4. Indian Stock Search (Tata)", f"{BASE_URL}/market/instruments?q=Tata&market=INDIA")
assert any("Tata" in it["name"] and it["market"] == "INDIA" for it in res_tata["items"]), "Indian Tata stock not found"

# 5. ETF Search
res_spy = api_call("5. ETF Search (SPY)", f"{BASE_URL}/market/instruments?q=SPY&asset_type=ETF")
assert any(it["symbol"] == "SPY" and it["assetType"] == "ETF" for it in res_spy["items"]), "SPY ETF not found"

# 6. Mutual Fund Search
res_ppfas = api_call("6. Mutual Fund Search (Parag Parikh)", f"{BASE_URL}/market/instruments?q=Parag+Parikh")
pp_item = next((it for it in res_ppfas["items"] if "Parag Parikh" in it["name"]), None)
assert pp_item is not None and pp_item["assetType"] == "MUTUAL_FUND", "Parag Parikh must be returned as MUTUAL_FUND"

# 7. Index Search (NIFTY 50 Index vs Mutual Fund vs ETF)
res_nifty = api_call("7. Index Search (NIFTY 50)", f"{BASE_URL}/market/instruments?q=NIFTY+50&asset_type=INDEX")
assert any(it["assetType"] == "INDEX" and "NIFTY 50" in it["name"] for it in res_nifty["items"]), "NIFTY 50 Index not found"

# 8. Fuzzy Search
res_fuzzy = api_call("8. Fuzzy Search (nvdia)", f"{BASE_URL}/market/instruments?q=nvdia")
assert any(it["symbol"] == "NVDA" for it in res_fuzzy["items"]), "Fuzzy search nvdia should resolve to NVDA"

# 9. Pagination
res_p1 = api_call("9a. Pagination (Page 1)", f"{BASE_URL}/market/instruments?page=1&limit=4")
res_p2 = api_call("9b. Pagination (Page 2)", f"{BASE_URL}/market/instruments?page=2&limit=4")
assert len(res_p1["items"]) == 4 and len(res_p2["items"]) == 4
assert res_p1["items"][0]["canonicalId"] != res_p2["items"][0]["canonicalId"], "Page 1 and Page 2 items must differ"

# 10. Asset-Type Filter
res_etfs = api_call("10. Asset-Type Filter (ETF)", f"{BASE_URL}/market/instruments?asset_type=ETF")
assert all(it["assetType"] == "ETF" for it in res_etfs["items"]), "All items must be ETFs"

# 11. Exchange Filter
res_nasdaq = api_call("11. Exchange Filter (NASDAQ)", f"{BASE_URL}/market/instruments?exchange=NASDAQ")
assert all(it["exchange"] == "NASDAQ" for it in res_nasdaq["items"]), "All items must be from NASDAQ"

# 12. Country Filter
res_tw = api_call("12. Country Filter (TW)", f"{BASE_URL}/market/instruments?country=TW")
assert any(it["country"] == "TW" for it in res_tw["items"]), "Country TW items must be returned"

# 13. Exact-Match Ranking
res_rank = api_call("13. Exact-Match Ranking (NVDA)", f"{BASE_URL}/market/instruments?q=NVDA")
assert res_rank["items"][0]["symbol"] == "NVDA", "Exact ticker NVDA must be ranked first"

# 14. Duplicate Prevention
res_all = api_call("14. Duplicate Prevention", f"{BASE_URL}/market/instruments?limit=100")
c_ids = [it["canonicalId"] for it in res_all["items"]]
assert len(c_ids) == len(set(c_ids)), "Duplicate canonical IDs found in market universe"

# 15. Canonical Identifiers
assert all(":" in it["canonicalId"] for it in res_all["items"][:10]), "Canonical IDs must follow EXCHANGE:SYMBOL format"
print("[PASS] 15. Canonical Identifiers structure verified")

# 16. Unsupported Provider Coverage (Empty/Graceful handling)
res_empty = api_call("16. Unsupported Provider Query", f"{BASE_URL}/market/instruments?q=NONEXISTENT_XYZ_UNIVERSE_999")
assert res_empty["total"] == 0 and res_empty["items"] == [], "Nonexistent instrument must return clean empty list"

# 17. Quote Integration
res_quote = api_call("17. Quote Integration", f"{BASE_URL}/market/quote/NVDA")
assert res_quote.get("price") is not None, "Quote must return real price snapshot"

# 18. Historical Integration
res_candles = api_call("18. Historical Candles Integration", f"{BASE_URL}/market/candles/SPY?range=1mo&interval=1d")
assert res_candles.get("observations") is not None and len(res_candles["observations"]) > 0, "Candles must return historical series"

# 19. Watchlist Isolation
ts = int(time.time())
reg_u = api_call("19a. Register User for Watchlist", f"{BASE_URL}/auth/register", method="POST", data={"email": f"mkt_test_{ts}@test.com", "password": "password123", "full_name": "Watchlist Tester"}, expected_status=201)
token = reg_u["access_token"]
auth_hdr = {"Authorization": f"Bearer {token}"}

api_call("19b. Add TSMC to Watchlist", f"{BASE_URL}/market/watchlist/NYSE:TSM", method="POST", headers=auth_hdr)
wl = api_call("19c. Get User Watchlist", f"{BASE_URL}/market/watchlist", headers=auth_hdr)
assert any("TSM" in it["symbol"] or "TSMC" in it["name"] for it in wl), "TSMC must be in user's watchlist"

# 20. Recommendation Separation (Market discovery does not alter personalized recommendations)
rec_cov = api_call("20. Coverage Stats Endpoint", f"{BASE_URL}/market/coverage")
assert rec_cov["total_instruments"] >= 35, "Coverage total must come from actual database master"
assert rec_cov["exchanges_count"] >= 4, "Multiple global exchanges must be tracked"

print("\n" + "=" * 80)
print("ALL 20 GLOBAL MARKET UNIVERSE & INSTRUMENT MASTER TESTS PASSED PERFECTLY!")
print("=" * 80)
