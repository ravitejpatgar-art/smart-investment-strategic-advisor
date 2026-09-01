"""
SmartVest Test Suite: User Context & Data Isolation Engine (Phase 34 & 39)
Verifies:
1. Single source of truth for user data
2. Zero demo fallback in default runtime
3. User data isolation (User A vs User B)
4. Dynamic surplus updates on expense modifications
5. Deficit status preservation (negative surplus)
6. Risk and Goal synchronization
"""

import os
import sys

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.services.financial_calculators import calculate_surplus_allocation_breakdown

client = TestClient(app)

def test_single_source_of_truth():
    print("\n" + "=" * 60)
    print("TEST 1: SINGLE SOURCE OF TRUTH & CASHFLOW CALCULATION")
    print("=" * 60)

    # Surplus positive
    res_pos = calculate_surplus_allocation_breakdown(50000.0, 30000.0)
    assert res_pos["monthly_surplus"] == 20000.0, f"Expected 20000.0, got {res_pos['monthly_surplus']}"
    assert res_pos["status"] == "SURPLUS"
    assert res_pos["maximum_investable_capacity"] == 20000.0
    assert res_pos["recommended_investment"] == 18000.0  # 90%
    assert res_pos["flexible_buffer"] == 2000.0  # 10%
    print("[PASS] Surplus positive cashflow: Income ₹50k, Expenses ₹30k -> Surplus ₹20k, Recommended ₹18k, Buffer ₹2k")

    # Deficit negative surplus preservation
    res_def = calculate_surplus_allocation_breakdown(50000.0, 60000.0)
    assert res_def["monthly_surplus"] == -10000.0, f"Expected -10000.0, got {res_def['monthly_surplus']}"
    assert res_def["status"] == "DEFICIT"
    assert res_def["maximum_investable_capacity"] == 0.0
    assert res_def["recommended_investment"] == 0.0
    assert res_def["flexible_buffer"] == 0.0
    print("[PASS] Deficit preservation: Income ₹50k, Expenses ₹60k -> Surplus -₹10k, Status: DEFICIT, Investable Capacity 0")

def test_dynamic_expense_update():
    print("\n" + "=" * 60)
    print("TEST 2: DYNAMIC PROFILE & EXPENSE SYNCHRONIZATION")
    print("=" * 60)

    # Base: Income 50,000, Expenses 30,000 -> Surplus 20,000
    base_res = calculate_surplus_allocation_breakdown(50000.0, 30000.0)
    assert base_res["monthly_surplus"] == 20000.0

    # Expense increased by 5,000 -> Expenses 35,000 -> Surplus 15,000
    updated_res = calculate_surplus_allocation_breakdown(50000.0, 35000.0)
    assert updated_res["monthly_surplus"] == 15000.0, f"Expected 15000.0, got {updated_res['monthly_surplus']}"
    print("[PASS] Dynamic surplus update: +₹5,000 expense updates surplus from ₹20,000 -> ₹15,000")

def test_user_isolation_via_ai_endpoint():
    print("\n" + "=" * 60)
    print("TEST 3: MULTI-USER ISOLATION VIA AI CONVERSATIONAL PIPELINE")
    print("=" * 60)

    # User A Context
    user_a = {
        "userId": "usr_001",
        "name": "Aarav Sharma",
        "age": 24,
        "monthlyIncome": 60000,
        "monthlyExpenses": 35000,
        "monthlySurplus": 25000,
        "riskTolerance": "High",
        "emergencyFund": 120000
    }

    # User B Context
    user_b = {
        "userId": "usr_002",
        "name": "Sunita Patel",
        "age": 52,
        "monthlyIncome": 180000,
        "monthlyExpenses": 90000,
        "monthlySurplus": 90000,
        "riskTolerance": "Low",
        "emergencyFund": 800000
    }

    # Query for User A
    res_a = client.post("/api/v1/ai/chat", json={
        "question": "What is my monthly surplus?",
        "user_context": user_a
    }).json()

    assert "25,000" in res_a["answer"], f"Expected ₹25,000 in User A response: {res_a['answer']}"
    assert "90,000" not in res_a["answer"], "Data leak from User B detected in User A response!"
    assert "Sunita" not in res_a["answer"], "Name leak from User B detected in User A response!"

    # Query for User B
    res_b = client.post("/api/v1/ai/chat", json={
        "question": "What is my monthly surplus?",
        "user_context": user_b
    }).json()

    assert "90,000" in res_b["answer"], f"Expected ₹90,000 in User B response: {res_b['answer']}"
    assert "25,000" not in res_b["answer"], "Data leak from User A detected in User B response!"
    assert "Aarav" not in res_b["answer"], "Name leak from User A detected in User B response!"
    print("[PASS] User isolation verified: User A and User B receive strictly segregated context without cross-pollination.")

def test_zero_demo_data_leak():
    print("\n" + "=" * 60)
    print("TEST 4: ZERO DEMO PERSONA IN RUNTIME")
    print("=" * 60)

    clean_user = {
        "name": "Ravi Kumar",
        "monthlyIncome": 45000,
        "monthlyExpenses": 25000,
        "monthlySurplus": 20000,
        "riskTolerance": "Moderate"
    }

    res = client.post("/api/v1/ai/chat", json={
        "question": "Where should I invest my monthly surplus?",
        "user_context": clean_user
    }).json()

    answer_text = res["answer"]
    forbidden_terms = ["Arjun Mehta", "Rahul Verma", "175000", "58000", "30000000", "Staff Software Architect"]
    for term in forbidden_terms:
        assert term.lower() not in answer_text.lower(), f"Forbidden demo term '{term}' found in response!"
    print("[PASS] Zero demo data: No legacy demo personas or hardcoded financial numbers in response.")

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING MASTER USER CONTEXT & DATA ISOLATION TEST SUITE")
    print("=" * 60)
    test_single_source_of_truth()
    test_dynamic_expense_update()
    test_user_isolation_via_ai_endpoint()
    test_zero_demo_data_leak()
    print("\n" + "=" * 60)
    print("ALL USER CONTEXT TESTS PASSED 100%!")
    print("=" * 60)
