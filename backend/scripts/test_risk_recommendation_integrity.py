import sys
import os

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.allocation_engine import calculate_dynamic_allocation

def test_risk_recommendation_integrity():
    print("================================================================================")
    print("SMARTVEST TEST SUITE: RISK-DRIVEN RECOMMENDATIONS & ALLOCATION DIFFERENTIATION")
    print("================================================================================")

    total_passed = 0
    total_assertions = 0

    # Scenario 1: Standard Comparative Profiles (Age 28, 15Y Horizon, Positive Surplus, 6M Emergency Fund)
    low_profile = calculate_dynamic_allocation(
        risk_tolerance="LOW",
        risk_capacity="LOW",
        age=28,
        horizon_years=15,
        monthly_income=60000,
        monthly_expenses=35000,
        emergency_fund_months=6.0
    )

    mod_profile = calculate_dynamic_allocation(
        risk_tolerance="MODERATE",
        risk_capacity="MODERATE",
        age=28,
        horizon_years=15,
        monthly_income=60000,
        monthly_expenses=35000,
        emergency_fund_months=6.0
    )

    high_profile = calculate_dynamic_allocation(
        risk_tolerance="HIGH",
        risk_capacity="HIGH",
        age=28,
        horizon_years=15,
        monthly_income=60000,
        monthly_expenses=35000,
        emergency_fund_months=6.0
    )

    print("\n--- 1. Verification of Risk Budget Scaling ---")
    print(f"  LOW Risk Budget: {low_profile['target_risk_budget']}")
    print(f"  MODERATE Risk Budget: {mod_profile['target_risk_budget']}")
    print(f"  HIGH Risk Budget: {high_profile['target_risk_budget']}")

    assert low_profile['target_risk_budget'] < mod_profile['target_risk_budget'] < high_profile['target_risk_budget'], \
        "Risk Budget must strictly scale: LOW < MODERATE < HIGH"
    total_assertions += 1
    total_passed += 1
    print("  ✓ Risk budget strictly scales: LOW < MODERATE < HIGH")

    print("\n--- 2. Verification of Weighted Portfolio Risk Scaling ---")
    print(f"  LOW Weighted Risk: {low_profile['overall_portfolio_risk']}")
    print(f"  MODERATE Weighted Risk: {mod_profile['overall_portfolio_risk']}")
    print(f"  HIGH Weighted Risk: {high_profile['overall_portfolio_risk']}")

    assert low_profile['overall_portfolio_risk'] < mod_profile['overall_portfolio_risk'] < high_profile['overall_portfolio_risk'], \
        "Portfolio Risk must strictly scale: LOW < MODERATE < HIGH"
    total_assertions += 1
    total_passed += 1
    print("  ✓ Portfolio Risk strictly scales: LOW < MODERATE < HIGH")

    print("\n--- 3. Verification of Top Spotlight Recommendation Differentiation ---")
    low_top = low_profile['top_recommendation']['symbol']
    mod_top = mod_profile['top_recommendation']['symbol']
    high_top = high_profile['top_recommendation']['symbol']

    print(f"  LOW Top Candidate: {low_top} ({low_profile['top_recommendation']['name']})")
    print(f"  MODERATE Top Candidate: {mod_top} ({mod_profile['top_recommendation']['name']})")
    print(f"  HIGH Top Candidate: {high_top} ({high_profile['top_recommendation']['name']})")

    assert low_top in ["ICICISAVE", "HDFCSHORT"], f"LOW top candidate should be conservative hybrid/debt, got {low_top}"
    assert mod_top in ["NIFTY50", "PPFCF"], f"MODERATE top candidate should be broad market/flexi-cap, got {mod_top}"
    assert high_top in ["PPFCF", "MON100", "NIPPSMALL"], f"HIGH top candidate should be flexi-cap/global/small-cap, got {high_top}"
    total_assertions += 3
    total_passed += 3
    print("  ✓ Top recommendations are fundamentally distinct and aligned with risk mandates")

    print("\n--- 4. Verification of Candidate Universe Gating ---")
    low_symbols = {c['symbol'] for c in low_profile['candidates']}
    mod_symbols = {c['symbol'] for c in mod_profile['candidates']}
    high_symbols = {c['symbol'] for c in high_profile['candidates']}

    print(f"  LOW Candidate Symbols: {low_symbols}")
    print(f"  MODERATE Candidate Symbols: {mod_symbols}")
    print(f"  HIGH Candidate Symbols: {high_symbols}")

    assert "NIPPSMALL" not in low_symbols and "MON100" not in low_symbols, "High beta/small cap must not be in LOW mandate"
    assert "ICICISAVE" in low_symbols, "Conservative hybrid must be in LOW mandate"
    assert "NIPPSMALL" in high_symbols or "MON100" in high_symbols, "High alpha assets must be in HIGH mandate"
    total_assertions += 3
    total_passed += 3
    print("  ✓ Eligibility gating strictly prevents high-beta assets in LOW mandate")

    print("\n--- 5. Verification of Cashflow Deficit Protection ---")
    deficit_profile = calculate_dynamic_allocation(
        risk_tolerance="HIGH",
        risk_capacity="HIGH",
        age=30,
        horizon_years=10,
        monthly_income=40000,
        monthly_expenses=45000,  # Expenses > Income
        emergency_fund_months=1.0
    )
    print(f"  Deficit Title: {deficit_profile['strategy_title']}")
    print(f"  Deficit Safety Allocation: {deficit_profile['safety_allocation_pct']}%")
    print(f"  Deficit Candidates: {[c['symbol'] for c in deficit_profile['candidates']]}")

    assert deficit_profile['safety_allocation_pct'] == 100, "Deficit cashflow must allocate 100% to liquid safety reserve"
    assert deficit_profile['top_recommendation']['symbol'] == "ICICILIQ", "Deficit cashflow top candidate must be liquid fund"
    total_assertions += 2
    total_passed += 2
    print("  ✓ Deficit cashflows divert 100% to capital protection and liquid runway")

    print("\n--- 6. Verification of Near-Term Horizon Capital Preservation ---")
    short_horizon_profile = calculate_dynamic_allocation(
        risk_tolerance="HIGH",
        risk_capacity="HIGH",
        age=25,
        horizon_years=2,  # Short horizon overrides aggressive tolerance
        monthly_income=50000,
        monthly_expenses=30000,
        emergency_fund_months=6.0,
        has_near_term_goal=True
    )
    print(f"  Short Horizon Title: {short_horizon_profile['strategy_title']}")
    print(f"  Short Horizon Top Candidate: {short_horizon_profile['top_recommendation']['symbol']}")
    
    assert short_horizon_profile['top_recommendation']['symbol'] in ["HDFCSHORT", "ICICISAVE"], "Short horizon must prioritize debt/hybrid preservation"
    total_assertions += 1
    total_passed += 1
    print("  ✓ Short horizon (<3Y) overrides aggressive stated preference to prevent drawdown risk")

    print("\n--- 7. Verification of Mathematical Normalization (Sum == 100%) ---")
    for p_name, p in [("LOW", low_profile), ("MODERATE", mod_profile), ("HIGH", high_profile), ("DEFICIT", deficit_profile), ("SHORT", short_horizon_profile)]:
        total_p = sum(c['percentage'] for c in p['candidates'])
        assert total_p == 100, f"Portfolio {p_name} percentage sum {total_p} != 100%"
        total_assertions += 1
        total_passed += 1
    print("  ✓ All test portfolios strictly sum to 100.0%")

    print("\n================================================================================")
    print(f"RISK RECOMMENDATION INTEGRITY RESULTS: {total_passed}/{total_assertions} Assertions Passed ({(total_passed/total_assertions)*100:.1f}%)")
    print("================================================================================")

    if total_passed == total_assertions:
        print("ALL RISK RECOMMENDATION & DIFFERENTIATION TESTS PASSED WITH 100% INTEGRITY.")
    else:
        sys.exit(1)

if __name__ == "__main__":
    test_risk_recommendation_integrity()
