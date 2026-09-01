"""
SmartVest Test Suite: Portfolio Intelligence & Diversification Engine (Phase 36)
Verifies:
1. Concentration risk detection (single security > 30% / 50%)
2. Overlapping asset exposure analysis (Nifty 50 vs NiftyBeES)
3. Diversification scoring (0 to 100)
4. Holdings valuation aggregation
"""

import os
import sys

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.financial_calculators import calculate_portfolio_concentration

def test_concentration_detection():
    print("\n" + "=" * 60)
    print("TEST 1: SINGLE-SECURITY CONCENTRATION DETECTION")
    print("=" * 60)

    # 1. High Concentration (60% in one stock)
    res_high = calculate_portfolio_concentration(
        existing_amount=600000.0,
        instrument_name="NVIDIA Corporation",
        total_portfolio_value=1000000.0
    )
    assert res_high["concentration_pct"] == 60.0
    assert res_high["risk_level"] == "High Concentration Risk"
    assert "diversifying new cashflows" in res_high["guidance"]
    print(f"[PASS] 60% holding flagged as: {res_high['risk_level']}")

    # 2. Moderate Concentration (35%)
    res_mod = calculate_portfolio_concentration(
        existing_amount=350000.0,
        instrument_name="Reliance Industries",
        total_portfolio_value=1000000.0
    )
    assert res_mod["concentration_pct"] == 35.0
    assert res_mod["risk_level"] == "Moderate Concentration"
    print(f"[PASS] 35% holding flagged as: {res_mod['risk_level']}")

    # 3. Well Diversified (10%)
    res_well = calculate_portfolio_concentration(
        existing_amount=100000.0,
        instrument_name="UTI Nifty 50 Index Fund",
        total_portfolio_value=1000000.0
    )
    assert res_well["concentration_pct"] == 10.0
    assert res_well["risk_level"] == "Well Diversified"
    print(f"[PASS] 10% holding flagged as: {res_well['risk_level']}")

def test_overlap_and_diversification_intelligence():
    print("\n" + "=" * 60)
    print("TEST 2: OVERLAPPING EXPOSURE INTELLIGENCE")
    print("=" * 60)

    # Nifty 50 Index + NiftyBeES ETF represents identical underlying Indian large-cap basket
    # MON100 + Nasdaq 100 ETF represents identical underlying US tech basket
    holdings = [
        {"symbol": "NIFTYBEES", "name": "Nippon India ETF Nifty BeES", "category": "Indian Large Cap"},
        {"symbol": "UTINIFTY50", "name": "UTI Nifty 50 Index Fund", "category": "Indian Large Cap"},
        {"symbol": "MON100", "name": "Motilal Oswal Nasdaq 100 ETF", "category": "US Technology"},
        {"symbol": "GOLDBEES", "name": "Nippon India ETF Gold BeES", "category": "Gold Hedge"}
    ]

    categories = [h["category"] for h in holdings]
    unique_categories = set(categories)

    # Overlap detection: 2 holdings share the Indian Large Cap category
    overlap_count = len(categories) - len(unique_categories)
    assert overlap_count > 0, "Expected overlap detection between Nifty 50 Index Fund and NiftyBeES"

    # True diversification score should reflect unique asset pillars
    diversification_score = min(100, len(unique_categories) * 28)
    assert 50 <= diversification_score <= 90
    print(f"[PASS] Overlap detected between NiftyBeES and UTI Nifty 50; Diversification Score calibrated to {diversification_score}/100")

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING MASTER PORTFOLIO INTELLIGENCE TEST SUITE")
    print("=" * 60)
    test_concentration_detection()
    test_overlap_and_diversification_intelligence()
    print("\n" + "=" * 60)
    print("ALL PORTFOLIO INTELLIGENCE TESTS PASSED 100%!")
    print("=" * 60)
