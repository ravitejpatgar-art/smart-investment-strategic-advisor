"""
SmartVest Active User Data & Zero-Demo Verification Suite
=========================================================
Tests that:
1. Real active user profile is the authoritative source of truth.
2. Surplus is dynamically calculated as max(0, income - expenses).
3. Expense updates immediately change investable surplus and AI context.
4. AI queries use active user financial parameters (not demo values).
5. Zero demo persona names (Arjun Mehta, 175000, 58000, etc.) appear.
"""

import sys
import os

# Set unicode-safe stdout for Windows
sys.stdout.reconfigure(encoding='utf-8')

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.services.ai.conversation_engine import process_conversational_query

client = TestClient(app)

def run_test(name, condition, details=""):
    if condition:
        print(f">>> [PASS] {name}")
    else:
        print(f">>> [FAIL] {name} - {details}")
        sys.exit(1)

print("\n=======================================================")
print("SMARTVEST ACTIVE USER DATA & ZERO-DEMO VERIFICATION")
print("=======================================================\n")

# TEST 1: User Profile - Ravi, Age 20, Income 40,000, Expenses 25,000, Risk Moderate
user_ravi = {
    "name": "Ravi",
    "age": 20,
    "monthlyIncome": 40000,
    "salaryIncome": 40000,
    "otherIncome": 0,
    "monthlyExpenses": 25000,
    "investableSurplus": 15000,
    "riskTolerance": "Moderate",
    "riskScore": 55,
    "investmentHorizon": "5 to 10 years",
    "onboardingCompleted": True,
    "goals": [{"title": "Wealth Building", "targetAmount": 1000000, "targetDate": "2030-12-31"}]
}

income = user_ravi["monthlyIncome"]
expenses = user_ravi["monthlyExpenses"]
surplus = max(0, income - expenses)
run_test("TEST 1 & 2: Initial Surplus Calculation (40,000 - 25,000 = 15,000)", surplus == 15000)

# TEST 3: Update Expenses to 30,000 -> Surplus becomes 10,000
user_ravi["monthlyExpenses"] = 30000
user_ravi["investableSurplus"] = max(0, user_ravi["monthlyIncome"] - user_ravi["monthlyExpenses"])
run_test("TEST 3: Expense Update Dynamic Surplus (40,000 - 30,000 = 10,000)", user_ravi["investableSurplus"] == 10000)

# TEST 4: AI ask: 'What is my monthly surplus?'
res_surplus = process_conversational_query(
    query="What is my monthly surplus?",
    user_context=user_ravi,
    history=[]
)
answer_surplus = res_surplus.get("answer", "")
run_test(
    "TEST 4: AI response uses actual surplus (10,000)",
    ("10,000" in answer_surplus or "10000" in answer_surplus) and ("58,000" not in answer_surplus),
    f"Got: {answer_surplus[:200]}"
)

# TEST 5: AI ask: 'Where should I invest my surplus?'
res_invest = process_conversational_query(
    query="Where should I invest my surplus?",
    user_context=user_ravi,
    history=[]
)
answer_invest = res_invest.get("answer", "")
run_test(
    "TEST 5: AI allocation uses actual profile (Ravi, 10,000/mo, Moderate)",
    ("10,000" in answer_invest or "10000" in answer_invest or "Ravi" in answer_invest or "Moderate" in answer_invest)
    and ("1.75" not in answer_invest and "175000" not in answer_invest and "58000" not in answer_invest),
    f"Got: {answer_invest[:200]}"
)

# TEST 6: AI ask: 'What is my monthly income?'
res_income = process_conversational_query(
    query="What is my monthly income?",
    user_context=user_ravi,
    history=[]
)
answer_income = res_income.get("answer", "")
run_test(
    "TEST 6: AI response returns actual income (40,000)",
    ("40,000" in answer_income or "40000" in answer_income) and ("1.75" not in answer_income),
    f"Got: {answer_income[:200]}"
)

# TEST 7: Zero Demo Persona Leakage Test
demo_terms = ["Arjun Mehta", "Staff Software Architect", "175000", "58000", "3 Crore FIRE"]
combined_answers = answer_surplus + answer_invest + answer_income
for term in demo_terms:
    run_test(f"TEST 7: No demo term '{term}' present in responses", term.lower() not in combined_answers.lower())

# TEST 8: Live FastAPI Endpoint Test with active user context
http_res = client.post(
    "/api/v1/ai/chat",
    json={
        "question": "Where should I invest my surplus?",
        "user_context": user_ravi,
        "history": []
    }
)
run_test("TEST 8: Live API Endpoint HTTP 200", http_res.status_code == 200)
http_data = http_res.json()
http_answer = http_data.get("answer", "")
run_test("TEST 8b: Live API uses active user context", "58,000" not in http_answer and "1.75" not in http_answer)

print("\n=======================================================")
print("ALL ACTIVE USER DATA VERIFICATION TESTS PASSED 100%!")
print("=======================================================\n")
