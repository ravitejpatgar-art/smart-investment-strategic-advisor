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
print("RUNNING COMPREHENSIVE PROFILE UPDATE & PERSISTENCE TEST SUITE")
print("=" * 75)

ts = int(time.time())
email_u1 = f"profile_test_u1_{ts}@test.com"
email_u2 = f"profile_test_u2_{ts}@test.com"

# Setup User 1
reg_u1 = api_call("0a. Register User 1", f"{BASE_URL}/auth/register", method="POST", data={"email": email_u1, "password": "password123", "full_name": "Ravi Initial"}, expected_status=201)
token_u1 = reg_u1["access_token"]
headers_u1 = {"Authorization": f"Bearer {token_u1}"}

# Setup User 2
reg_u2 = api_call("0b. Register User 2", f"{BASE_URL}/auth/register", method="POST", data={"email": email_u2, "password": "password123", "full_name": "Other User"}, expected_status=201)
token_u2 = reg_u2["access_token"]
headers_u2 = {"Authorization": f"Bearer {token_u2}"}

# 1. Load Profile
p1 = api_call("1. Load Profile (User 1)", f"{BASE_URL}/users/me/profile", headers=headers_u1)
assert p1["full_name"] == "Ravi Initial"

# 2. Update Name
up_name = api_call("2. Update Name", f"{BASE_URL}/users/me/profile", method="PUT", data={"full_name": "Ravi Sharma"}, headers=headers_u1)
assert up_name["full_name"] == "Ravi Sharma"

# 3. Update Age
up_age = api_call("3. Update Age", f"{BASE_URL}/users/me/profile", method="PUT", data={"age": 28}, headers=headers_u1)
assert up_age["age"] == 28

# 4. Update Occupation
up_occ = api_call("4. Update Occupation", f"{BASE_URL}/users/me/profile", method="PUT", data={"occupation": "Senior Staff Architect"}, headers=headers_u1)
assert up_occ["occupation"] == "Senior Staff Architect"

# 5. Update Income
up_inc = api_call("5. Update Income", f"{BASE_URL}/users/me/profile", method="PUT", data={"monthly_income": 125000.0, "monthly_expenses": 45000.0}, headers=headers_u1)
assert up_inc["monthly_income"] == 125000.0
assert up_inc["monthly_expenses"] == 45000.0

# 6. Update Emergency Fund
up_emg = api_call("6. Update Emergency Fund", f"{BASE_URL}/users/me/profile", method="PUT", data={"existing_savings": 270000.0}, headers=headers_u1)
assert up_emg["existing_savings"] == 270000.0

# 7. Update Existing Investments
up_inv = api_call("7. Update Existing Investments", f"{BASE_URL}/users/me/profile", method="PUT", data={"existing_investments": 850000.0}, headers=headers_u1)
assert up_inv["existing_investments"] == 850000.0

# 8. Update Risk Tolerance
up_risk = api_call("8. Update Risk Tolerance", f"{BASE_URL}/users/me/profile", method="PUT", data={"risk_tolerance": "Aggressive", "risk_score": 85}, headers=headers_u1)
assert up_risk["risk_tolerance"] == "Aggressive"
assert up_risk["risk_score"] == 85

# 9. Update Horizon & Goal
up_hor = api_call("9. Update Horizon & Goal", f"{BASE_URL}/users/me/profile", method="PUT", data={"investment_horizon": "10+ Years", "financial_goal": "Financial Freedom by 40"}, headers=headers_u1)
assert up_hor["investment_horizon"] == "10+ Years"
assert up_hor["financial_goal"] == "Financial Freedom by 40"

# 10. Save Persistence (Fetch fresh profile and verify all fields preserved)
fresh_p1 = api_call("10. Verify Full Save Persistence", f"{BASE_URL}/users/me/profile", headers=headers_u1)
assert fresh_p1["full_name"] == "Ravi Sharma"
assert fresh_p1["age"] == 28
assert fresh_p1["occupation"] == "Senior Staff Architect"
assert fresh_p1["monthly_income"] == 125000.0
assert fresh_p1["monthly_expenses"] == 45000.0
assert fresh_p1["existing_savings"] == 270000.0
assert fresh_p1["existing_investments"] == 850000.0
assert fresh_p1["risk_tolerance"] == "Aggressive"
assert fresh_p1["investment_horizon"] == "10+ Years"

# 11. Invalid Data Handling (Verify unauthenticated access returns 401)
api_call("11. Unauthenticated Update Returns 401", f"{BASE_URL}/users/me/profile", method="PUT", data={"age": 30}, expected_status=401)

# 12. User Isolation (Verify User 2 profile is unmodified by User 1 updates)
p2 = api_call("12. Verify User Isolation (User 2 Profile)", f"{BASE_URL}/users/me/profile", headers=headers_u2)
assert p2["full_name"] == "Other User"
assert p2["monthly_income"] == 0.0 or p2["monthly_income"] != 125000.0
assert p2["risk_tolerance"] != "Aggressive"

print("\n" + "=" * 75)
print("ALL 12 PROFILE UPDATE & PERSISTENCE TESTS PASSED PERFECTLY!")
print("=" * 75)
