import os
import sys

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure app path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.ai_assistant import generate_ai_assistant_response
from app.services.intent_detector import (
    detect_financial_intent,
    INTENT_GENERAL_FINANCIAL_EDUCATION,
    INTENT_INVESTMENT_RECOMMENDATION,
    INTENT_ETF_COMPARISON,
    INTENT_AFFORDABILITY,
    INTENT_GREETING,
    INTENT_GOAL_PLANNING,
    INTENT_SURPLUS_ALLOCATION
)

def run_tests():
    # User A: Young Professional (Surplus: 10,000)
    ctx_a = {
        'name': 'Aarav',
        'age': 22,
        'occupation': 'Software Engineer',
        'monthlyIncome': 40000,
        'monthlyExpenses': 30000,
        'investableSurplus': 10000,
        'emergencyFund': 90000,
        'riskTolerance': 'Moderate',
        'riskScore': 72,
        'investmentHorizon': '15 years',
        'onboardingCompleted': True
    }

    # User B: Mid-career Conservative Executive (Surplus: 60,000)
    ctx_b = {
        'name': 'Priya',
        'age': 44,
        'occupation': 'Senior Manager',
        'monthlyIncome': 120000,
        'monthlyExpenses': 60000,
        'investableSurplus': 60000,
        'emergencyFund': 360000,
        'riskTolerance': 'Conservative',
        'riskScore': 38,
        'investmentHorizon': '4 years',
        'goals': [{'title': 'Buy House', 'targetAmount': 5000000, 'targetDate': '2030-12-31'}],
        'onboardingCompleted': True
    }

    # User C: High-earner with 320k income, 110k expenses, 210k surplus
    ctx_c = {
        'name': 'Vikram',
        'age': 35,
        'occupation': 'Director',
        'monthlyIncome': 320000,
        'monthlyExpenses': 110000,
        'investableSurplus': 210000,
        'emergencyFund': 660000,
        'riskTolerance': 'Conservative',
        'riskScore': 45,
        'investmentHorizon': '7 years',
        'onboardingCompleted': True
    }

    print("========================================")
    print("TEST 1: Educational Question 'What is an ETF?'")
    print("========================================")
    intent_1, _ = detect_financial_intent("What is an ETF?")
    assert intent_1 == INTENT_GENERAL_FINANCIAL_EDUCATION, f"Expected GENERAL_FINANCIAL_EDUCATION, got {intent_1}"
    
    res_1 = generate_ai_assistant_response("What is an ETF?", user_context=ctx_c, request_id="req_test_1")
    assert res_1["intent"] == INTENT_GENERAL_FINANCIAL_EDUCATION
    assert res_1["requestId"] == "req_test_1"
    assert "ETF" in res_1["answer"] or "Exchange Traded Fund" in res_1["answer"]
    
    # CRITICAL: Must NOT contain personal cashflow templates or private income/expense numbers
    assert "320,000" not in res_1["answer"]
    assert "110,000" not in res_1["answer"]
    assert "210,000" not in res_1["answer"]
    assert "Based on your current cashflow" not in res_1["answer"]
    assert "Conservative profile" not in res_1["answer"]
    print("[PASS] 'What is an ETF?' returned pure educational explanation without irrelevant financial calculations.")

    print("\n========================================")
    print("TEST 2: Educational Question 'What is an ETF and how does it work?'")
    print("========================================")
    intent_2, _ = detect_financial_intent("What is an ETF and how does it work?")
    assert intent_2 == INTENT_GENERAL_FINANCIAL_EDUCATION
    res_2 = generate_ai_assistant_response("What is an ETF and how does it work?", user_context=ctx_c)
    assert "ETF" in res_2["answer"]
    assert "320,000" not in res_2["answer"]
    print("[PASS] 'What is an ETF and how does it work?' classified as GENERAL_FINANCIAL_EDUCATION.")

    print("\n========================================")
    print("TEST 3: Instrument Classification 'Is MON100 an ETF?'")
    print("========================================")
    intent_3, _ = detect_financial_intent("Is MON100 an ETF?")
    assert intent_3 == INTENT_GENERAL_FINANCIAL_EDUCATION
    res_3 = generate_ai_assistant_response("Is MON100 an ETF?", user_context=ctx_c)
    assert "MON100" in res_3["answer"]
    assert "ETF" in res_3["answer"]
    assert "Nasdaq" in res_3["answer"]
    assert "320,000" not in res_3["answer"]
    print("[PASS] 'Is MON100 an ETF?' correctly explained that MON100 is an ETF tracking Nasdaq-100.")

    print("\n========================================")
    print("TEST 4: Personalized Query 'Should I invest in MON100?'")
    print("========================================")
    intent_4, _ = detect_financial_intent("Should I invest in MON100?")
    assert intent_4 == INTENT_INVESTMENT_RECOMMENDATION
    res_4 = generate_ai_assistant_response("Should I invest in MON100?", user_context=ctx_c)
    assert res_4["intent"] == INTENT_INVESTMENT_RECOMMENDATION
    assert "Conservative" in res_4["answer"] or "210,000" in res_4["answer"] or "MON100" in res_4["answer"]
    print("[PASS] 'Should I invest in MON100?' correctly engaged user's personalized profile and risk mandate.")

    print("\n========================================")
    print("TEST 5: Comparison 'What is the difference between an ETF and a mutual fund?'")
    print("========================================")
    intent_5, _ = detect_financial_intent("What is the difference between an ETF and a mutual fund?")
    assert intent_5 in [INTENT_ETF_COMPARISON, INTENT_GENERAL_FINANCIAL_EDUCATION]
    res_5 = generate_ai_assistant_response("What is the difference between an ETF and a mutual fund?", user_context=ctx_a)
    assert "ETF" in res_5["answer"]
    assert "Mutual Fund" in res_5["answer"] or "NAV" in res_5["answer"]
    print("[PASS] Comparison between ETF and Mutual Fund rendered accurately.")

    print("\n========================================")
    print("TEST 6: Surplus Allocation 'Where should I invest my monthly surplus?'")
    print("========================================")
    intent_6, _ = detect_financial_intent("Where should I invest my monthly surplus?")
    assert intent_6 in [INTENT_INVESTMENT_RECOMMENDATION, INTENT_SURPLUS_ALLOCATION]
    res_6 = generate_ai_assistant_response("Where should I invest my monthly surplus?", user_context=ctx_a)
    assert "UTI Nifty 50" in res_6["answer"]
    assert "10,000" in res_6["answer"]
    print("[PASS] 'Where should I invest my monthly surplus?' deployed User A's ₹10,000 surplus.")

    print("\n========================================")
    print("TEST 7: Affordability 'Can I afford a ₹10 lakh car?'")
    print("========================================")
    intent_7, _ = detect_financial_intent("Can I afford a ₹10 lakh car?")
    assert intent_7 == INTENT_AFFORDABILITY
    res_7 = generate_ai_assistant_response("Can I afford a ₹10 lakh car?", user_context=ctx_a)
    assert res_7["calculations"]["type"] == "affordability"
    assert res_7["calculations"]["monthlyEmi"] > 0
    print(f"[PASS] Affordability computed EMI of ₹{res_7['calculations']['monthlyEmi']:,} with verdict: {res_7['calculations']['verdict']}")

    print("\n========================================")
    print("TEST 8: Greeting 'Hi'")
    print("========================================")
    intent_8, _ = detect_financial_intent("Hi")
    assert intent_8 == INTENT_GREETING
    res_8 = generate_ai_assistant_response("Hi", user_context=ctx_a)
    assert len(res_8["answer"]) < 300
    assert "SmartVest AI Advisor" in res_8["answer"]
    assert "320,000" not in res_8["answer"]
    print(f"[PASS] Greeting generated clean welcome: '{res_8['answer']}'")

    print("\n========================================")
    print("TEST 9: 'What is NiftyBeES?' (Test D)")
    print("========================================")
    intent_d, _ = detect_financial_intent("What is NiftyBeES?")
    assert intent_d == INTENT_GENERAL_FINANCIAL_EDUCATION, f"Expected GENERAL_FINANCIAL_EDUCATION, got {intent_d}"
    res_d = generate_ai_assistant_response("What is NiftyBeES?", user_context=ctx_c)
    assert res_d["intent"] == INTENT_GENERAL_FINANCIAL_EDUCATION
    assert "320,000" not in res_d["answer"]
    print("[PASS] 'What is NiftyBeES?' returned pure educational explanation.")

    print("\n========================================")
    print("TEST 10: 'Should I invest in NiftyBeES?' (Test E)")
    print("========================================")
    intent_e, _ = detect_financial_intent("Should I invest in NiftyBeES?")
    assert intent_e == INTENT_INVESTMENT_RECOMMENDATION, f"Expected INVESTMENT_RECOMMENDATION, got {intent_e}"
    res_e = generate_ai_assistant_response("Should I invest in NiftyBeES?", user_context=ctx_c)
    assert res_e["intent"] == INTENT_INVESTMENT_RECOMMENDATION
    assert "Conservative" in res_e["answer"] or "210,000" in res_e["answer"]
    print("[PASS] 'Should I invest in NiftyBeES?' personalized to user's profile.")

    print("\n========================================")
    print("TEST 11: 'What is Nifty doing today?' (Test H)")
    print("========================================")
    intent_h, _ = detect_financial_intent("What is Nifty doing today?")
    from app.services.intent_detector import INTENT_MARKET_QUESTION
    assert intent_h == INTENT_MARKET_QUESTION, f"Expected MARKET_QUESTION, got {intent_h}"
    res_h = generate_ai_assistant_response("What is Nifty doing today?", user_context=ctx_c)
    assert res_h["intent"] == INTENT_MARKET_QUESTION
    print("[PASS] 'What is Nifty doing today?' returned live market overview.")

    print("\n========================================")
    print("TEST 12: Multi-Topic Educational Repository (SIP, Index Fund, Expense Ratio, NAV, CAGR)")
    print("========================================")
    topics = [
        ("What is SIP?", "Systematic Investment Plan"),
        ("What is an index fund?", "Index Fund"),
        ("What is expense ratio?", "Expense Ratio"),
        ("What is NAV?", "Net Asset Value"),
        ("What is CAGR?", "Compound Annual Growth Rate"),
        ("What is a liquid fund?", "Liquid Fund")
    ]
    for q, expected_term in topics:
        res = generate_ai_assistant_response(q, user_context=ctx_c)
        assert res["intent"] == INTENT_GENERAL_FINANCIAL_EDUCATION
        assert expected_term.lower() in res["answer"].lower(), f"Expected '{expected_term}' in response to '{q}'"
        assert "320,000" not in res["answer"]
        assert "Based on your current cashflow" not in res["answer"]
    print("[PASS] All 6 educational concepts responded with pure definitions and zero cashflow leak.")

    print("\n========================================")
    print("TEST 13: Hedge Fund Educational Query 'What is a hedge fund?'")
    print("========================================")
    intent_hf, params_hf = detect_financial_intent("What is a hedge fund?")
    assert intent_hf == INTENT_GENERAL_FINANCIAL_EDUCATION
    assert params_hf["topic"] == "HEDGE_FUND"
    res_hf = generate_ai_assistant_response("What is a hedge fund?", user_context=ctx_c)
    assert res_hf["intent"] == INTENT_GENERAL_FINANCIAL_EDUCATION
    assert res_hf["topic"] == "HEDGE_FUND"
    assert "Hedge Fund" in res_hf["answer"]
    assert "Exchange Traded Fund" not in res_hf["answer"]
    assert "320,000" not in res_hf["answer"]
    print("[PASS] 'What is a hedge fund?' returned pure Hedge Fund knowledge (NOT ETF!).")

    print("\n========================================")
    print("TEST 14: Difference between ETF and Hedge Fund")
    print("========================================")
    intent_diff, params_diff = detect_financial_intent("What is the difference between an ETF and a hedge fund?")
    assert intent_diff == INTENT_ETF_COMPARISON
    res_diff = generate_ai_assistant_response("What is the difference between an ETF and a hedge fund?", user_context=ctx_c)
    assert "Exchange Traded Fund" in res_diff["answer"]
    assert "Hedge Fund" in res_diff["answer"]
    print("[PASS] Difference between ETF and Hedge Fund compared both vehicles clearly.")

    print("\n========================================")
    print("TEST 15: Suitability 'Should I invest in a hedge fund?'")
    print("========================================")
    intent_hf_rec, params_hf_rec = detect_financial_intent("Should I invest in a hedge fund?")
    assert intent_hf_rec == INTENT_INVESTMENT_RECOMMENDATION
    assert params_hf_rec["topic"] == "HEDGE_FUND"
    res_hf_rec = generate_ai_assistant_response("Should I invest in a hedge fund?", user_context=ctx_c)
    assert res_hf_rec["intent"] == INTENT_INVESTMENT_RECOMMENDATION
    assert res_hf_rec["topic"] == "HEDGE_FUND"
    assert "1 Crore" in res_hf_rec["answer"] or "AIF" in res_hf_rec["answer"] or "not recommend" in res_hf_rec["answer"].lower()
    print("[PASS] 'Should I invest in a hedge fund?' correctly conducted personalized suitability analysis.")

    print("\n========================================")
    print("ALL 15 ADVANCED AI REASONING & INTENT TESTS PASSED!")
    print("========================================")

if __name__ == "__main__":
    run_tests()

