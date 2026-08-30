import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_assistant_education_admin():
    print("--- 1. Authenticating test user ---")
    login_res = client.post("/api/v1/auth/login", json={"email": "test.user@smartvest.ai", "password": "Password123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 2. Testing AI Financial Assistant Chat ---")
    chat_res = client.post("/api/v1/assistant/chat", json={"message": "Can I afford a 15 Lakh car today?"}, headers=headers)
    print(f"Chat status: {chat_res.status_code}")
    data = chat_res.json()
    assert chat_res.status_code == 200
    assert "response" in data
    assert "user_context" in data
    print(f"Context monthly surplus: {data['user_context']['monthly_surplus']}")

    print("\n--- 3. Testing Assistant Prompt Suggestions ---")
    sug_res = client.get("/api/v1/assistant/suggestions")
    assert sug_res.status_code == 200
    assert len(sug_res.json()) > 0

    print("\n--- 4. Testing Education Hub Courses ---")
    edu_res = client.get("/api/v1/education/courses")
    assert edu_res.status_code == 200
    courses = edu_res.json()
    print(f"Found {len(courses)} curriculum courses")
    assert len(courses) >= 4

    print("\n--- 5. Testing Education Quiz Verification ---")
    quiz_res = client.post("/api/v1/education/verify-quiz", json={
        "course_id": "personal-finance-101",
        "selected_option_index": 1
    })
    print(f"Quiz status: {quiz_res.status_code}, Success: {quiz_res.json()['success']}")
    assert quiz_res.status_code == 200
    assert quiz_res.json()["success"] is True

    print("\n--- 6. Testing Admin Stats & Telemetry ---")
    admin_stats_res = client.get("/api/v1/admin/stats")
    print(f"Admin stats status: {admin_stats_res.status_code}")
    assert admin_stats_res.status_code == 200
    assert "metrics" in admin_stats_res.json()
    assert "services" in admin_stats_res.json()

    print("\n--- 7. Testing Admin Users Directory ---")
    admin_users_res = client.get("/api/v1/admin/users")
    assert admin_users_res.status_code == 200
    print(f"Admin users count: {len(admin_users_res.json())}")

    print("\n ALL PHASE 14, 15 & 16 BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_assistant_education_admin()
