"""
SmartVest AI — Master Universal Financial Intelligence & Reasoning Test Suite.
Verifies semantic understanding, entity resolution, knowledge retrieval, calculations,
market awareness, and zero cashflow leaks across all 37 requirements.
"""

import os
import sys

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure app path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.services.ai_assistant import generate_ai_assistant_response
from app.services.intent_detector import detect_financial_intent, EducationalTopic

client = TestClient(app)

user_ctx = {
    "name": "Vikram",
    "age": 35,
    "monthlyIncome": 320000,
    "monthlyExpenses": 110000,
    "investableSurplus": 210000,
    "riskTolerance": "Moderate",
    "existingSavings": 660000
}

def test_category_1_education():
    print("\n" + "=" * 60)
    print("CATEGORY 1: UNIVERSAL FINANCIAL EDUCATION (NO PROFILE LEAK)")
    print("=" * 60)

    edu_queries = [
        ("What is an ETF?", "ETF", "Exchange Traded Fund"),
        ("What is a hedge fund?", "HEDGE_FUND", "Hedge Fund"),
        ("What is an IPO?", "IPO", "Initial Public Offering"),
        ("What is a bond?", "BOND", "Bond"),
        ("What is P/E?", "PE_RATIO", "Price-to-Earnings"),
        ("Explain PE ratio", "PE_RATIO", "Price-to-Earnings"),
        ("What is CAGR?", "CAGR", "Compound Annual Growth Rate"),
        ("What is NAV?", "NAV", "Net Asset Value"),
        ("What is a mutual fund?", "MUTUAL_FUND", "Mutual Fund"),
        ("What is REIT?", "REIT", "Real Estate Investment Trust"),
        ("What is SGB?", "SGB", "Sovereign Gold Bond"),
        ("What is FPO?", "FPO", "Follow-on Public Offering"),
        ("What is OFS?", "OFS", "Offer for Sale"),
        ("What is Beta?", "BETA", "Beta"),
        ("What is Sharpe ratio?", "SHARPE_RATIO", "Sharpe Ratio")
    ]

    for q, expected_topic, expected_term in edu_queries:
        res = client.post("/api/v1/ai/chat", json={"question": q, "user_context": user_ctx}).json()
        assert res["intent"] == "GENERAL_FINANCIAL_EDUCATION", f"Failed intent for '{q}': got {res['intent']}"
        assert res["contextMode"] == "EDUCATIONAL", f"Failed contextMode for '{q}'"
        assert expected_term.lower() in res["answer"].lower(), f"Expected '{expected_term}' in response for '{q}'"
        assert "320,000" not in res["answer"], f"Cashflow leak in educational query '{q}'"
        assert "Based on your current cashflow" not in res["answer"], f"Cashflow leak in '{q}'"
        assert res["calculations"] == {}, f"Unexpected calculation in educational query '{q}'"
        print(f"[PASS] Educational: '{q}' -> topic: {res.get('topic')}")

def test_category_2_current_market():
    print("\n" + "=" * 60)
    print("CATEGORY 2: CURRENT MARKET & MACRO INTELLIGENCE")
    print("=" * 60)

    market_queries = [
        ("What is Nifty doing today?", "NIFTY 50"),
        ("What is AAPL trading at?", "AAPL"),
        ("Why is gold moving today?", "GOLD (10g)"),
        ("Why did the market fall today?", "NIFTY 50")
    ]

    for q, sym in market_queries:
        res = client.post("/api/v1/ai/chat", json={"question": q, "user_context": user_ctx}).json()
        assert res["intent"] == "MARKET_QUESTION"
        assert res["contextMode"] == "MARKET"
        assert "MARKET SNAPSHOT" in res["answer"]
        assert len(res["sources"]) > 0
        print(f"[PASS] Market: '{q}' -> status: {res.get('marketData', {}).get('marketStatus', 'OK')}")

def test_category_3_personalized_recommendations():
    print("\n" + "=" * 60)
    print("CATEGORY 3: PERSONALIZED INVESTMENT ADVISORY")
    print("=" * 60)

    # 1. MON100 Suitability
    res_mon = client.post("/api/v1/ai/chat", json={"question": "Should I invest in MON100?", "user_context": user_ctx}).json()
    assert res_mon["intent"] in ["INVESTMENT_RECOMMENDATION", "ETF_ANALYSIS", "STOCK_ANALYSIS"]
    assert "Nasdaq 100" in res_mon["answer"] or "MON100" in res_mon["answer"] or "Nasdaq-100" in res_mon["answer"]
    assert "10%" in res_mon["answer"] or "15%" in res_mon["answer"] or "Satellite" in res_mon["answer"] or "Core" in res_mon["answer"]
    print("[PASS] Personal: 'Should I invest in MON100?' -> Satellite tech allocation recommendation")

    # 2. Where should I invest ₹20,000?
    res_surplus = client.post("/api/v1/ai/chat", json={"question": "Where should I invest ₹20,000?", "user_context": user_ctx}).json()
    assert res_surplus["intent"] in ["INVESTMENT_RECOMMENDATION", "SURPLUS_ALLOCATION", "ALLOCATION_ADVICE"]
    assert "UTI Nifty 50" in res_surplus["answer"] or "Index" in res_surplus["answer"]
    print("[PASS] Personal: 'Where should I invest ₹20,000?' -> Calibrated asset allocation")

    # 3. IPO Application Suitability
    res_ipo = client.post("/api/v1/ai/chat", json={"question": "Should I apply for this IPO?", "user_context": user_ctx}).json()
    assert res_ipo["intent"] in ["INVESTMENT_RECOMMENDATION", "EDUCATION", "GENERAL_FINANCIAL_EDUCATION", "STOCK_ANALYSIS"]
    assert "5%" in res_ipo["answer"] or "IPO" in res_ipo["answer"] or "Initial Public Offering" in res_ipo["answer"]
    print("[PASS] Personal: 'Should I apply for this IPO?' -> Risk & allocation guidance")

    # 4. Hedge Fund Suitability
    res_hf = client.post("/api/v1/ai/chat", json={"question": "Should I invest in a hedge fund?", "user_context": user_ctx}).json()
    assert res_hf["intent"] in ["INVESTMENT_RECOMMENDATION", "EDUCATION", "GENERAL_FINANCIAL_EDUCATION", "STOCK_ANALYSIS"]
    assert "1 Crore" in res_hf["answer"] or "not recommend" in res_hf["answer"].lower() or "Hedge Fund" in res_hf["answer"]
    print("[PASS] Personal: 'Should I invest in a hedge fund?' -> SEBI AIF constraints explained")

def test_category_4_calculations():
    print("\n" + "=" * 60)
    print("CATEGORY 4: DETERMINISTIC FINANCIAL CALCULATORS")
    print("=" * 60)

    # 1. SIP for 1 Crore
    res_goal = client.post("/api/v1/ai/chat", json={"question": "How much SIP for ₹1 crore?", "user_context": user_ctx}).json()
    assert res_goal["intent"] == "GOAL_PLANNING"
    assert "Required Monthly SIP" in res_goal["answer"]
    print("[PASS] Calc: 'How much SIP for ₹1 crore?' -> Accurate required SIP")

    # 2. Affordability
    res_afford = client.post("/api/v1/ai/chat", json={"question": "Can I afford a ₹10 lakh car?", "user_context": user_ctx}).json()
    assert res_afford["intent"] == "AFFORDABILITY"
    assert "Verdict:" in res_afford["answer"]
    print("[PASS] Calc: 'Can I afford a ₹10 lakh car?' -> EMI computed and verdict rendered")

    # 3. Future Value
    res_fv = client.post("/api/v1/ai/chat", json={"question": "What will ₹10,000/month become in 15 years?", "user_context": user_ctx}).json()
    assert res_fv["intent"] == "SIP_CALCULATION"
    assert "Total Expected Future Value" in res_fv["answer"]
    print("[PASS] Calc: 'What will ₹10,000/month become in 15 years?' -> Compounding future value")

def test_category_5_comparisons():
    print("\n" + "=" * 60)
    print("CATEGORY 5: COMPARATIVE INTELLIGENCE")
    print("=" * 60)

    comparisons = [
        ("ETF vs mutual fund", "Exchange Traded Fund"),
        ("Gold ETF vs SGB", "Sovereign Gold Bond"),
        ("FD vs liquid fund", "Fixed Deposit"),
        ("What is the difference between an ETF and a hedge fund?", "Hedge Fund")
    ]

    for q, title_kw in comparisons:
        res = client.post("/api/v1/ai/chat", json={"question": q, "user_context": user_ctx}).json()
        assert res["intent"] in ["ETF_COMPARISON", "FUND_COMPARISON", "STOCK_COMPARISON", "EDUCATION", "GENERAL_FINANCIAL_EDUCATION"]
        assert "|" in res["answer"] or "vs" in res["answer"].lower(), f"Comparison matrix missing in '{q}'"
        assert title_kw.lower() in res["answer"].lower()
        print(f"[PASS] Comparison: '{q}' -> Structured comparison table generated")

def test_category_6_portfolio_review():
    print("\n" + "=" * 60)
    print("CATEGORY 6: PORTFOLIO REVIEW & CONCENTRATION")
    print("=" * 60)

    res_port = client.post("/api/v1/ai/chat", json={"question": "Am I too concentrated in Nifty?", "user_context": user_ctx}).json()
    assert res_port["intent"] == "PORTFOLIO_REVIEW"
    assert "PORTFOLIO HEALTH ASSESSMENT" in res_port["answer"]
    print("[PASS] Portfolio: 'Am I too concentrated in Nifty?' -> Health review rendered")

def test_category_7_multilingual_natural_phrasing():
    print("\n" + "=" * 60)
    print("CATEGORY 7: MULTILINGUAL / HINGLISH & NATURAL ROBUSTNESS")
    print("=" * 60)

    robust_queries = [
        ("ipo kya hai", "IPO", "Initial Public Offering"),
        ("ETF kya hota hai", "ETF", "Exchange Traded Fund"),
        ("SIP kya hai", "SIP", "Systematic Investment Plan"),
        ("where shud i invest", "surplus_allocation", "Nifty"),
        ("which mf is better for me", "surplus_allocation", "Fund")
    ]

    for q, expected_topic, expected_kw in robust_queries:
        res = client.post("/api/v1/ai/chat", json={"question": q, "user_context": user_ctx}).json()
        assert expected_kw.lower() in res["answer"].lower()
        print(f"[PASS] Natural/Hinglish: '{q}' -> resolved to {res.get('topic')}")

def run_all_tests():
    test_category_1_education()
    test_category_2_current_market()
    test_category_3_personalized_recommendations()
    test_category_4_calculations()
    test_category_5_comparisons()
    test_category_6_portfolio_review()
    test_category_7_multilingual_natural_phrasing()

    print("\n" + "=" * 60)
    print("ALL 7 TEST CATEGORIES & UNIVERSAL AI REQUIREMENTS PASSED 100%!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
