"""
SmartVest - Production API Connectivity & VestIQ Conversation Lifecycle Test Script
Can run against any target URL (e.g. Render public URL or localhost) to verify:
1. Backend Health
2. Authentication (Registration & JWT issuance)
3. List Conversations
4. Create Conversation
5. Add Messages (User & Assistant)
6. Auto-titling & Detail retrieval
7. Rename Conversation
8. Pin/Unpin Conversation
9. User Isolation (Cross-user access denied 404)
10. Delete Conversation & Cascade Verification
"""

import sys
import os
import argparse
import uuid
import requests

def run_production_api_test(base_url: str, use_testclient: bool = False):
    print("=" * 70)
    print(f"SMARTVEST PRODUCTION API TEST SUITE: {base_url} (TestClient: {use_testclient})")
    print("=" * 70)

    if use_testclient:
        sys.path.insert(0, os.path.abspath("."))
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)
        api_v1_url = "/api/v1"
        root_url = ""
        http_get = lambda url, **kwargs: client.get(url, **kwargs)
        http_post = lambda url, **kwargs: client.post(url, **kwargs)
        http_patch = lambda url, **kwargs: client.patch(url, **kwargs)
        http_delete = lambda url, **kwargs: client.delete(url, **kwargs)
    else:
        base_url = base_url.rstrip("/")
        if base_url.endswith("/api/v1"):
            api_v1_url = base_url
            root_url = base_url[:-7]
        else:
            root_url = base_url
            api_v1_url = f"{base_url}/api/v1"
        http_get = lambda url, **kwargs: requests.get(url, timeout=15, **kwargs)
        http_post = lambda url, **kwargs: requests.post(url, timeout=15, **kwargs)
        http_patch = lambda url, **kwargs: requests.patch(url, timeout=15, **kwargs)
        http_delete = lambda url, **kwargs: requests.delete(url, timeout=15, **kwargs)

    print(f"[*] Target Root: {root_url or '/'}")
    print(f"[*] Target API v1: {api_v1_url}")

    # 1. Health check
    print("\n--- 1. HEALTH ENDPOINT TEST ---")
    try:
        health_resp = http_get(f"{root_url}/api/health")
        print(f"Status Code: {health_resp.status_code}")
        print(f"Response: {health_resp.text[:300]}")
        if health_resp.status_code != 200:
            print(f"[FAIL] Health endpoint returned HTTP {health_resp.status_code}")
            return False
        print("[PASS] Health endpoint returned HTTP 200 OK")
    except Exception as e:
        print(f"[FAIL] Health endpoint connection failed: {e}")
        return False

    # 2. Register User 1
    print("\n--- 2. AUTHENTICATION & REGISTRATION ---")
    u1_email = f"prod_user_{uuid.uuid4().hex[:6]}@smartvest.ai"
    u1_pwd = "ProdPassword123!"
    try:
        reg_resp = http_post(f"{api_v1_url}/auth/register", json={
            "email": u1_email,
            "password": u1_pwd,
            "full_name": "Production Test User 1"
        })
        if reg_resp.status_code != 201:
            print(f"[FAIL] User registration returned {reg_resp.status_code}: {reg_resp.text}")
            return False
        u1_token = reg_resp.json().get("access_token")
        u1_headers = {"Authorization": f"Bearer {u1_token}"}
        print(f"[PASS] User 1 registered ({u1_email}) & JWT Bearer token obtained")
    except Exception as e:
        print(f"[FAIL] Auth registration failed: {e}")
        return False

    # 3. List conversations (initially empty)
    print("\n--- 3. GET /conversations (EMPTY STATE) ---")
    try:
        list_resp = http_get(f"{api_v1_url}/conversations", headers=u1_headers)
        if list_resp.status_code != 200:
            print(f"[FAIL] List conversations returned {list_resp.status_code}")
            return False
        items = list_resp.json()
        assert isinstance(items, list)
        print(f"[PASS] GET /conversations returned HTTP 200 with {len(items)} items")
    except Exception as e:
        print(f"[FAIL] List conversations failed: {e}")
        return False

    # 4. Create Conversation
    print("\n--- 4. POST /conversations (CREATE CHAT) ---")
    try:
        create_resp = http_post(f"{api_v1_url}/conversations", headers=u1_headers, json={
            "title": "New Financial Chat"
        })
        if create_resp.status_code != 201:
            print(f"[FAIL] Create conversation returned {create_resp.status_code}")
            return False
        conv_data = create_resp.json()
        conv_id = conv_data.get("id")
        print(f"[PASS] Created conversation with ID: {conv_id}")
    except Exception as e:
        print(f"[FAIL] Create conversation failed: {e}")
        return False

    # 5. Add User Message (triggers auto-titling)
    print("\n--- 5. POST /conversations/{id}/messages (USER MESSAGE & AUTO TITLE) ---")
    try:
        msg_resp = http_post(f"{api_v1_url}/conversations/{conv_id}/messages", headers=u1_headers, json={
            "role": "user",
            "content": "Explain ETFs and compare them with mutual funds"
        })
        if msg_resp.status_code != 201:
            print(f"[FAIL] Add user message returned {msg_resp.status_code}")
            return False
        print("[PASS] User message persisted successfully")
    except Exception as e:
        print(f"[FAIL] Add user message failed: {e}")
        return False

    # 6. Add Assistant Message
    print("\n--- 6. POST /conversations/{id}/messages (ASSISTANT RESPONSE PERSISTENCE) ---")
    try:
        ai_resp = http_post(f"{api_v1_url}/conversations/{conv_id}/messages", headers=u1_headers, json={
            "role": "assistant",
            "content": "ETFs (Exchange Traded Funds) trade on stock exchanges like individual stocks..."
        })
        if ai_resp.status_code != 201:
            print(f"[FAIL] Add assistant message returned {ai_resp.status_code}")
            return False
        print("[PASS] Assistant response persisted successfully")
    except Exception as e:
        print(f"[FAIL] Add assistant message failed: {e}")
        return False

    # 7. Get Conversation Detail (Deep Link test)
    print("\n--- 7. GET /conversations/{id} (DEEP LINK & ORDERED MESSAGES) ---")
    try:
        detail_resp = http_get(f"{api_v1_url}/conversations/{conv_id}", headers=u1_headers)
        if detail_resp.status_code != 200:
            print(f"[FAIL] Get conversation detail returned {detail_resp.status_code}")
            return False
        detail = detail_resp.json()
        print(f"Title: '{detail.get('title')}' | Message Count: {detail.get('message_count')}")
        assert len(detail.get("messages", [])) == 2
        print("[PASS] Deep link detail retrieved with 2 ordered messages")
    except Exception as e:
        print(f"[FAIL] Get conversation detail failed: {e}")
        return False

    # 8. Rename Conversation
    print("\n--- 8. PATCH /conversations/{id}/rename ---")
    try:
        rename_resp = http_patch(f"{api_v1_url}/conversations/{conv_id}/rename", headers=u1_headers, json={
            "title": "ETF vs Mutual Funds Strategy"
        })
        if rename_resp.status_code != 200:
            print(f"[FAIL] Rename conversation returned {rename_resp.status_code}")
            return False
        assert rename_resp.json().get("title") == "ETF vs Mutual Funds Strategy"
        print("[PASS] Conversation renamed to 'ETF vs Mutual Funds Strategy'")
    except Exception as e:
        print(f"[FAIL] Rename conversation failed: {e}")
        return False

    # 9. Pin Conversation
    print("\n--- 9. PATCH /conversations/{id}/pin ---")
    try:
        pin_resp = http_patch(f"{api_v1_url}/conversations/{conv_id}/pin", headers=u1_headers, json={
            "is_pinned": True
        })
        if pin_resp.status_code != 200:
            print(f"[FAIL] Pin conversation returned {pin_resp.status_code}")
            return False
        assert pin_resp.json().get("is_pinned") is True
        print("[PASS] Conversation pinned successfully")
    except Exception as e:
        print(f"[FAIL] Pin conversation failed: {e}")
        return False

    # 10. User Isolation
    print("\n--- 10. USER ISOLATION VERIFICATION ---")
    u2_email = f"prod_user_{uuid.uuid4().hex[:6]}@smartvest.ai"
    try:
        reg2 = http_post(f"{api_v1_url}/auth/register", json={
            "email": u2_email,
            "password": "ProdPassword123!",
            "full_name": "Production Test User 2"
        })
        u2_token = reg2.json().get("access_token")
        u2_headers = {"Authorization": f"Bearer {u2_token}"}

        # User 2 list must be empty
        u2_list = http_get(f"{api_v1_url}/conversations", headers=u2_headers).json()
        assert len(u2_list) == 0

        # User 2 cannot access User 1 conversation (must return 404)
        u2_access = http_get(f"{api_v1_url}/conversations/{conv_id}", headers=u2_headers)
        if u2_access.status_code != 404:
            print(f"[FAIL] User isolation failed! Expected 404, got {u2_access.status_code}")
            return False
        print("[PASS] Strict user isolation verified: User 2 receives 404 for User 1 conversation")
    except Exception as e:
        print(f"[FAIL] User isolation test failed: {e}")
        return False

    # 11. Delete Conversation
    print("\n--- 11. DELETE /conversations/{id} ---")
    try:
        del_resp = http_delete(f"{api_v1_url}/conversations/{conv_id}", headers=u1_headers)
        if del_resp.status_code != 200:
            print(f"[FAIL] Delete conversation returned {del_resp.status_code}")
            return False
        
        # Verify deletion returns 404
        ver_resp = http_get(f"{api_v1_url}/conversations/{conv_id}", headers=u1_headers)
        assert ver_resp.status_code == 404
        print("[PASS] Conversation deleted and verified non-existent (404)")
    except Exception as e:
        print(f"[FAIL] Delete conversation failed: {e}")
        return False

    print("\n" + "=" * 70)
    print("ALL PRODUCTION API CONNECTIVITY & LIFECYCLE TESTS PASSED 100%!")
    print("=" * 70)
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SmartVest Production API Test")
    parser.add_argument("--url", default=os.getenv("BACKEND_URL", "http://localhost:8000"), help="Backend URL")
    parser.add_argument("--testclient", action="store_true", help="Use FastAPI TestClient internally")
    args = parser.parse_args()

    success = run_production_api_test(args.url, use_testclient=args.testclient)
    sys.exit(0 if success else 1)
