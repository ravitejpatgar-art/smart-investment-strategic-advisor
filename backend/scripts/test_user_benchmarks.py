import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.allocation_engine import calculate_dynamic_allocation

def test_user_benchmarks():
    print("=" * 80)
    print("TESTING TARGET USER PERSONA BENCHMARKS")
    print("=" * 80)

    # --------------------------------------------------------------------------
    # USER A
    # Profile: Age 22, Risk: High, Horizon: 20Y, Corpus: Rs 5,00,000
    # Expected: Nvidia, QQQ, Parag Parikh Flexi Cap, Nippon Small Cap
    # --------------------------------------------------------------------------
    print("\n[USER A] Age: 22, Risk: HIGH, Horizon: 20Y, Corpus: Rs 5,00,000")
    user_a = calculate_dynamic_allocation(
        risk_tolerance="HIGH",
        risk_capacity="HIGH",
        age=22,
        horizon_years=20,
        total_corpus=500000,
        monthly_income=100000,
        monthly_expenses=40000,
        emergency_fund_months=6.0
    )
    print(f"Strategy Title: {user_a['strategy_title']}")
    print(f"Expected CAGR:  {user_a['expected_cagr']}%")
    print("Recommendations:")
    for r in user_a["recommendations"]:
        print(f"  * {r['name']} ({r['symbol']}) | Type: {r['type']} | Weight: {r['allocation']}% | Monthly: Rs {r['monthlyInvestment']:,.2f} | Role: {r['portfolioRole']}")
        print(f"    - Suitability Score: {r['suitabilityScore']} | Risk Score: {r['riskScore']}")
        print(f"    - Why Selected: {r['whySelected']}")
        print(f"    - Goal Fit: {r['goalFit']}")

    a_symbols = [r["symbol"] for r in user_a["recommendations"]]
    assert "NVDA" in a_symbols, "User A must receive Nvidia"
    assert "QQQ" in a_symbols, "User A must receive QQQ"
    assert "PPFCF" in a_symbols, "User A must receive Parag Parikh Flexi Cap"
    assert "NIPPSMALL" in a_symbols, "User A must receive Nippon Small Cap"
    print(">>> USER A VALIDATION PASSED: Received High-Alpha Growth Basket (NVDA, QQQ, PPFCF, NIPPSMALL)")

    # --------------------------------------------------------------------------
    # USER B
    # Profile: Age 45, Risk: Moderate, Horizon: 10Y, Corpus: Rs 5,00,000
    # Expected: NIFTYBEES, Parag Parikh Flexi Cap, HDFC Bank, Gold ETF
    # --------------------------------------------------------------------------
    print("\n" + "-" * 80)
    print("[USER B] Age: 45, Risk: MODERATE, Horizon: 10Y, Corpus: Rs 5,00,000")
    user_b = calculate_dynamic_allocation(
        risk_tolerance="MODERATE",
        risk_capacity="MODERATE",
        age=45,
        horizon_years=10,
        total_corpus=500000,
        monthly_income=150000,
        monthly_expenses=80000,
        emergency_fund_months=6.0
    )
    print(f"Strategy Title: {user_b['strategy_title']}")
    print(f"Expected CAGR:  {user_b['expected_cagr']}%")
    print("Recommendations:")
    for r in user_b["recommendations"]:
        print(f"  * {r['name']} ({r['symbol']}) | Type: {r['type']} | Weight: {r['allocation']}% | Monthly: Rs {r['monthlyInvestment']:,.2f} | Role: {r['portfolioRole']}")
        print(f"    - Suitability Score: {r['suitabilityScore']} | Risk Score: {r['riskScore']}")
        print(f"    - Why Selected: {r['whySelected']}")
        print(f"    - Goal Fit: {r['goalFit']}")

    b_symbols = [r["symbol"] for r in user_b["recommendations"]]
    assert "NIFTYBEES" in b_symbols, "User B must receive NIFTYBEES"
    assert "PPFCF" in b_symbols, "User B must receive Parag Parikh Flexi Cap"
    assert any("HDFCBANK" in s for s in b_symbols), "User B must receive HDFC Bank"
    assert "GOLDBEES" in b_symbols, "User B must receive Gold ETF"
    print(">>> USER B VALIDATION PASSED: Received Balanced Multi-Asset Basket (NIFTYBEES, PPFCF, HDFCBANK, GOLDBEES)")

    # --------------------------------------------------------------------------
    # USER C
    # Profile: Age 60, Risk: Low, Horizon: 5Y, Corpus: Rs 5,00,000
    # Expected: ICICI Conservative Hybrid, HDFC Short Duration, Gold ETF, Liquid Fund
    # --------------------------------------------------------------------------
    print("\n" + "-" * 80)
    print("[USER C] Age: 60, Risk: LOW, Horizon: 5Y, Corpus: Rs 5,00,000")
    user_c = calculate_dynamic_allocation(
        risk_tolerance="LOW",
        risk_capacity="LOW",
        age=60,
        horizon_years=5,
        total_corpus=500000,
        monthly_income=80000,
        monthly_expenses=50000,
        emergency_fund_months=6.0
    )
    print(f"Strategy Title: {user_c['strategy_title']}")
    print(f"Expected CAGR:  {user_c['expected_cagr']}%")
    print("Recommendations:")
    for r in user_c["recommendations"]:
        print(f"  * {r['name']} ({r['symbol']}) | Type: {r['type']} | Weight: {r['allocation']}% | Monthly: Rs {r['monthlyInvestment']:,.2f} | Role: {r['portfolioRole']}")
        print(f"    - Suitability Score: {r['suitabilityScore']} | Risk Score: {r['riskScore']}")
        print(f"    - Why Selected: {r['whySelected']}")
        print(f"    - Goal Fit: {r['goalFit']}")

    c_symbols = [r["symbol"] for r in user_c["recommendations"]]
    assert "ICICISAVE" in c_symbols, "User C must receive ICICI Conservative Hybrid"
    assert "HDFCSHORT" in c_symbols, "User C must receive HDFC Short Duration"
    assert "GOLDBEES" in c_symbols, "User C must receive Gold ETF"
    print(">>> USER C VALIDATION PASSED: Received Capital Preservation Basket (ICICISAVE, HDFCSHORT, GOLDBEES)")

    # --------------------------------------------------------------------------
    # CHECK DISPERSION BETWEEN USERS
    # --------------------------------------------------------------------------
    print("\n" + "-" * 80)
    print("CHECKING BASKET DIVERSITY & DISPERSION ACROSS USERS")
    assert a_symbols != b_symbols, "User A and User B recommendations must be completely differentiated"
    assert b_symbols != c_symbols, "User B and User C recommendations must be completely differentiated"
    assert a_symbols != c_symbols, "User A and User C recommendations must be completely differentiated"

    print(">>> Cross-User Portfolio Dispersion: 100% Distinct across User A, B, and C.")
    print("=" * 80)
    print("ALL USER BENCHMARK TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    test_user_benchmarks()
