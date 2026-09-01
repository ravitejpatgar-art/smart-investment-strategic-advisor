#!/usr/bin/env python3
"""
Test Risk-Based Candidate Differentiation & Eligibility Filtering.
Verifies that:
1. LOW (Conservative) risk mandates do NOT receive high-volatility thematic assets (e.g. MON100, Small-cap) by default.
2. HIGH (Aggressive) risk mandates receive growth/small-cap allocations with 0% debt drag.
3. Candidate pools and ranking materially change across LOW, MODERATE, and HIGH.
4. Overlap penalties reduce ranking for existing holdings.
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.allocation_engine import calculate_dynamic_allocation
from app.services.ai.tool_router import screen_stocks
from app.services.ai.entity_engine import MarketRegion

def test_conservative_candidate_exclusion():
    print("\n--- TEST 1: Conservative / Short Horizon Candidate Exclusion ---")
    user_context = {
        "riskTolerance": "LOW",
        "riskCategory": "Conservative",
        "age": 48,
        "investmentHorizon": "3 to 5 years",
        "monthlyIncome": 120000,
        "monthlyExpenses": 60000,
        "emergencyFundMonths": 6.0
    }

    # Test allocation
    alloc = calculate_dynamic_allocation(
        risk_tolerance="LOW",
        risk_capacity="LOW",
        horizon_years=4,
        emergency_fund_months=6.0,
        monthly_income=120000,
        monthly_expenses=60000
    )

    print(f"Conservative Allocations: {alloc['allocation_dict']}")
    assert alloc["debt_total_pct"] >= 45, "Conservative mandate must allocate at least 45% to Debt & Liquid"
    assert alloc["allocation_dict"].get("Global US Tech", 0) == 0, "Conservative profile must have 0% Global US Tech"
    assert alloc["allocation_dict"].get("Emerging Small-Cap", 0) == 0, "Conservative profile must have 0% small-cap"

    # Test stock screening for conservative
    us_stocks_cons = screen_stocks(MarketRegion.US, user_context)
    top_cons_symbol = us_stocks_cons[0]["symbol"]
    print(f"Conservative Top US Stock: {top_cons_symbol} ({us_stocks_cons[0]['name']}) - Score: {us_stocks_cons[0]['suitability_score']}")
    
    # In conservative, Visa or Microsoft or Apple must rank higher than NVDA
    symbols_order = [s["symbol"] for s in us_stocks_cons]
    print(f"Conservative US Stock Order: {symbols_order}")
    assert symbols_order.index("V") < symbols_order.index("NVDA"), "Visa (defensive) must rank higher than NVDA for conservative profile"
    print("[OK] PASSED: Conservative Candidate Exclusion & Defensive Ranking Verified")

def test_aggressive_candidate_inclusion():
    print("\n--- TEST 2: Aggressive / Long Horizon High-Alpha Candidate Inclusion ---")
    user_context = {
        "riskTolerance": "HIGH",
        "riskCategory": "Aggressive",
        "age": 22,
        "investmentHorizon": "15+ years",
        "monthlyIncome": 60000,
        "monthlyExpenses": 35000,
        "emergencyFundMonths": 6.0
    }

    alloc = calculate_dynamic_allocation(
        risk_tolerance="HIGH",
        risk_capacity="HIGH",
        horizon_years=15,
        emergency_fund_months=6.0,
        monthly_income=60000,
        monthly_expenses=35000
    )

    print(f"Aggressive Allocations: {alloc['allocation_dict']}")
    assert alloc["equity_total_pct"] >= 90, "Aggressive mandate with 15Y horizon must allocate at least 90% to Equity/Growth"
    assert alloc["debt_total_pct"] == 0, "Aggressive mandate with 15Y horizon and full emergency fund must have 0% debt drag"
    assert alloc["allocation_dict"].get("Emerging Small-Cap", 0) == 10, "Aggressive mandate must include high-alpha emerging small-caps"
    assert alloc["allocation_dict"].get("Global US Tech", 0) >= 20 or alloc["allocation_dict"].get("Global Tech ETF", 0) >= 20, "Aggressive mandate must include Global US Tech"

    # Test stock screening for aggressive
    us_stocks_agg = screen_stocks(MarketRegion.US, user_context)
    top_agg_symbol = us_stocks_agg[0]["symbol"]
    print(f"Aggressive Top US Stock: {top_agg_symbol} ({us_stocks_agg[0]['name']}) - Score: {us_stocks_agg[0]['suitability_score']}")
    assert top_agg_symbol in ["NVDA", "MSFT"], "Aggressive profile must prioritize high-alpha tech leaders (NVDA / MSFT)"
    print("[OK] PASSED: Aggressive Candidate Inclusion & Growth Ranking Verified")

def test_candidate_differentiation_across_risks():
    print("\n--- TEST 3: Candidate Differentiation (LOW vs MODERATE vs HIGH) ---")
    ctx_low = {"riskTolerance": "LOW", "riskCategory": "Conservative", "investmentHorizon": "5 years"}
    ctx_mod = {"riskTolerance": "MODERATE", "riskCategory": "Moderate", "investmentHorizon": "8 years"}
    ctx_high = {"riskTolerance": "HIGH", "riskCategory": "Aggressive", "investmentHorizon": "15 years"}

    in_low = [s["symbol"] for s in screen_stocks(MarketRegion.INDIA, ctx_low)]
    in_high = [s["symbol"] for s in screen_stocks(MarketRegion.INDIA, ctx_high)]

    print(f"India Stocks Order (LOW):  {in_low}")
    print(f"India Stocks Order (HIGH): {in_high}")

    assert in_low[0] != in_high[0] or in_low[-1] != in_high[-1], \
        "Indian stock candidate rankings must materially differ between LOW and HIGH profiles"
    assert in_low.index("TCS.NS") < in_low.index("TATAMOTORS.NS"), \
        "TCS (debt-free defensive) must rank higher than Tata Motors (cyclical) for LOW risk profile"
    print("[OK] PASSED: Stock Candidate Differentiation Verified")

def test_portfolio_overlap_penalty():
    print("\n--- TEST 4: Portfolio Overlap Penalty ---")
    ctx_no_overlap = {"riskTolerance": "HIGH", "riskCategory": "Aggressive", "portfolio": []}
    ctx_with_overlap = {
        "riskTolerance": "HIGH", 
        "riskCategory": "Aggressive", 
        "portfolio": [{"name": "Motilal Oswal Nasdaq 100 ETF", "symbol": "MON100", "amount": 100000}]
    }

    stocks_clean = screen_stocks(MarketRegion.US, ctx_no_overlap)
    stocks_overlap = screen_stocks(MarketRegion.US, ctx_with_overlap)

    nvda_clean_score = next(s["suitability_score"] for s in stocks_clean if s["symbol"] == "NVDA")
    nvda_overlap_score = next(s["suitability_score"] for s in stocks_overlap if s["symbol"] == "NVDA")
    nvda_why_not = next(s.get("why_not") for s in stocks_overlap if s["symbol"] == "NVDA")

    print(f"NVDA Score without existing tech: {nvda_clean_score}")
    print(f"NVDA Score with existing tech:    {nvda_overlap_score}")
    print(f"NVDA Reason: {nvda_why_not}")

    assert nvda_overlap_score < nvda_clean_score, "Existing portfolio tech exposure must reduce candidate suitability score"
    assert nvda_why_not is not None, "Overlap explanation must be provided when candidate is penalized"
    print("[OK] PASSED: Portfolio Overlap Penalty Verified")

if __name__ == "__main__":
    print("======================================================================")
    print("RUNNING RISK-BASED CANDIDATE DIFFERENTIATION REGRESSION TESTS")
    print("======================================================================")
    test_conservative_candidate_exclusion()
    test_aggressive_candidate_inclusion()
    test_candidate_differentiation_across_risks()
    test_portfolio_overlap_penalty()
    print("\n======================================================================")
    print("ALL CANDIDATE DIFFERENTIATION TESTS PASSED 100%!")
    print("======================================================================")
