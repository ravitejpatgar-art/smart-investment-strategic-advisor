import sys
import os

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.allocation_engine import calculate_dynamic_allocation, CANDIDATE_REGISTRY

def test_personalized_basket_engine():
    print("================================================================================")
    print("SMARTVEST TEST SUITE: FINAL PERSONALIZED PORTFOLIO CONSTRUCTION ENGINE")
    print("================================================================================")

    total_passed = 0
    total_assertions = 0

    # --------------------------------------------------------------------------
    # TEST 1: RISK DIFFERENTIATION & TOP SPOTLIGHT RANKING
    # --------------------------------------------------------------------------
    print("\n--- TEST 1: Risk Differentiation & Top Spotlight Ranking ---")
    low_basket = calculate_dynamic_allocation(risk_tolerance="LOW", risk_capacity="LOW", age=22, horizon_years=20, monthly_income=50000, monthly_expenses=30000, emergency_fund_months=6.0, total_corpus=200000)
    mod_basket = calculate_dynamic_allocation(risk_tolerance="MODERATE", risk_capacity="MODERATE", age=22, horizon_years=20, monthly_income=50000, monthly_expenses=30000, emergency_fund_months=6.0, total_corpus=200000)
    high_basket = calculate_dynamic_allocation(risk_tolerance="HIGH", risk_capacity="HIGH", age=22, horizon_years=20, monthly_income=50000, monthly_expenses=30000, emergency_fund_months=6.0, total_corpus=200000)

    # Risk budget scaling
    assert low_basket["target_risk_budget"] < mod_basket["target_risk_budget"] < high_basket["target_risk_budget"], "Risk budget must scale LOW < MODERATE < HIGH"
    total_assertions += 1
    total_passed += 1
    print(f"  ✓ Risk Budget Scaling: LOW ({low_basket['target_risk_budget']}) < MOD ({mod_basket['target_risk_budget']}) < HIGH ({high_basket['target_risk_budget']})")

    # Portfolio-level weighted risk scaling
    assert low_basket["portfolioRisk"] < mod_basket["portfolioRisk"] < high_basket["portfolioRisk"], "Portfolio risk must scale LOW < MODERATE < HIGH"
    total_assertions += 1
    total_passed += 1
    print(f"  ✓ Portfolio Risk Scaling: LOW ({low_basket['portfolioRisk']}) < MOD ({mod_basket['portfolioRisk']}) < HIGH ({high_basket['portfolioRisk']})")

    # Top candidates derived dynamically from ranking
    low_top = low_basket["top_recommendation"]["symbol"]
    mod_top = mod_basket["top_recommendation"]["symbol"]
    high_top = high_basket["top_recommendation"]["symbol"]
    print(f"  ✓ Top Picks: LOW ({low_top}) | MOD ({mod_top}) | HIGH ({high_top})")
    assert low_top != high_top, "LOW and HIGH top picks must differ"
    total_assertions += 1
    total_passed += 1

    # --------------------------------------------------------------------------
    # TEST 2: TARGET INSTRUMENT MIX (1 Stock + 2-3 ETFs + 2-3 MFs)
    # --------------------------------------------------------------------------
    print("\n--- TEST 2: Target Instrument Mix (1 Stock + 2-3 ETFs + 2-3 Mutual Funds) ---")
    cats_mod = mod_basket["categoryBreakdown"]
    print(f"  Moderate Basket Counts: {cats_mod['stocks']} Stock, {cats_mod['etfs']} ETFs, {cats_mod['mutualFunds']} Mutual Funds (Total: {mod_basket['recommendationCount']})")
    assert cats_mod["stocks"] == 1, "Standard Moderate basket should include 1 Stock"
    assert 2 <= cats_mod["etfs"] <= 3, "Standard Moderate basket should include 2-3 ETFs"
    assert 2 <= cats_mod["mutualFunds"] <= 3, "Standard Moderate basket should include 2-3 Mutual Funds"
    assert 5 <= mod_basket["recommendationCount"] <= 6, "Standard Moderate basket should contain 5-6 instruments"
    total_assertions += 4
    total_passed += 4
    print("  ✓ Target Mix Validated: Exactly 1 Stock, 2-3 ETFs, 2-3 Mutual Funds (Max 6)")

    # --------------------------------------------------------------------------
    # TEST 3: CORPUS & MONTHLY SURPLUS SENSITIVITY (Small vs Large)
    # --------------------------------------------------------------------------
    print("\n--- TEST 3: Corpus & Monthly Surplus Sensitivity ---")
    small_corpus = calculate_dynamic_allocation(risk_tolerance="MODERATE", total_corpus=15000, monthly_income=0, monthly_expenses=0)
    large_corpus = calculate_dynamic_allocation(risk_tolerance="MODERATE", total_corpus=500000, monthly_income=80000, monthly_expenses=40000)

    print(f"  Small Corpus (₹15k): {small_corpus['recommendationCount']} instruments")
    print(f"  Large Corpus (₹5L):  {large_corpus['recommendationCount']} instruments")
    assert small_corpus["recommendationCount"] <= 3, "Small corpus should concentrate into 2-3 instruments to avoid fragmentation"
    assert large_corpus["recommendationCount"] >= 5, "Large corpus should expand to 5-6 instruments"
    total_assertions += 2
    total_passed += 2
    print("  ✓ Corpus Sensitivity Validated: Small corpus is concentrated, large corpus is diversified")

    # --------------------------------------------------------------------------
    # TEST 4: HORIZON SENSITIVITY (<3Y Capital Preservation vs 20Y Growth)
    # --------------------------------------------------------------------------
    print("\n--- TEST 4: Horizon Sensitivity (2Y vs 20Y) ---")
    short_horizon = calculate_dynamic_allocation(risk_tolerance="HIGH", horizon_years=2, total_corpus=200000)
    long_horizon = calculate_dynamic_allocation(risk_tolerance="HIGH", horizon_years=20, total_corpus=200000)

    print(f"  Short Horizon (2Y) Debt/Liquid %: {short_horizon['debt_total_pct']}% | Title: {short_horizon['strategy_title']}")
    print(f"  Long Horizon (20Y) Debt/Liquid %:  {long_horizon['debt_total_pct']}% | Title: {long_horizon['strategy_title']}")
    assert short_horizon["debt_total_pct"] >= 50, "Short horizon (<3Y) must allocate >=50% to debt/liquid preservation"
    assert long_horizon["debt_total_pct"] <= 10, "Long horizon (20Y) high risk must have minimal debt drag"
    total_assertions += 2
    total_passed += 2
    print("  ✓ Horizon Gating Validated: Near-term horizon overrides aggressive preference to prevent drawdown")

    # --------------------------------------------------------------------------
    # TEST 5: EMERGENCY FUND SENSITIVITY (Low EF vs Healthy EF)
    # --------------------------------------------------------------------------
    print("\n--- TEST 5: Emergency Fund Sensitivity ---")
    low_ef = calculate_dynamic_allocation(risk_tolerance="HIGH", emergency_fund_months=1.0, total_corpus=200000)
    healthy_ef = calculate_dynamic_allocation(risk_tolerance="HIGH", emergency_fund_months=6.0, total_corpus=200000)

    low_ef_symbols = [r["symbol"] for r in low_ef["recommendations"]]
    healthy_ef_symbols = [r["symbol"] for r in healthy_ef["recommendations"]]
    print(f"  Low EF (1M) Symbols:     {low_ef_symbols}")
    print(f"  Healthy EF (6M) Symbols: {healthy_ef_symbols}")
    assert "ICICILIQ" in low_ef_symbols, "Low emergency fund must include liquid cash safety reserve"
    total_assertions += 1
    total_passed += 1
    print("  ✓ Emergency Fund Gating Validated: Fragile cash reserves force liquid buffer allocation")

    # --------------------------------------------------------------------------
    # TEST 6: PORTFOLIO OVERLAP PENALTY & DEDUPLICATION
    # --------------------------------------------------------------------------
    print("\n--- TEST 6: Portfolio Overlap Penalty & Deduplication ---")
    clean_basket = calculate_dynamic_allocation(risk_tolerance="MODERATE", total_corpus=200000, portfolio=[])
    overlap_basket = calculate_dynamic_allocation(risk_tolerance="MODERATE", total_corpus=200000, portfolio=[{"symbol": "MON100", "name": "Motilal Oswal Nasdaq 100 ETF"}])

    clean_mon = next((r for r in clean_basket["recommendations"] if r["symbol"] == "MON100"), None)
    overlap_mon = next((r for r in overlap_basket["recommendations"] if r["symbol"] == "MON100"), None)
    if clean_mon and overlap_mon:
        assert overlap_mon["overlapPenalty"] > 0, "Existing Nasdaq holding must trigger overlap penalty"
        assert overlap_mon["suitabilityScore"] < clean_mon["suitabilityScore"], "Overlap must reduce candidate suitability score"
        total_assertions += 2
        total_passed += 2
        print(f"  ✓ Overlap Penalty Verified: MON100 clean score ({clean_mon['suitabilityScore']}) vs overlap score ({overlap_mon['suitabilityScore']}) [Penalty: -{overlap_mon['overlapPenalty']}]")

    # --------------------------------------------------------------------------
    # TEST 7: DEEP EXPLAINABILITY (Zero Generic Text)
    # --------------------------------------------------------------------------
    print("\n--- TEST 7: Deep Explainability & Distinct Rationale ---")
    recs = mod_basket["recommendations"]
    why_selected_set = set()
    for r in recs:
        assert r["whySelected"] and len(r["whySelected"]) > 30, f"Missing detailed whySelected for {r['symbol']}"
        assert r["whyNotAlternatives"] and len(r["whyNotAlternatives"]) > 20, f"Missing whyNotAlternatives for {r['symbol']}"
        assert r["portfolioRole"] and len(r["portfolioRole"]) > 3, f"Missing portfolioRole for {r['symbol']}"
        assert r["horizonFit"], f"Missing horizonFit for {r['symbol']}"
        assert r["goalFit"], f"Missing goalFit for {r['symbol']}"
        assert r["diversificationRole"], f"Missing diversificationRole for {r['symbol']}"
        why_selected_set.add(r["whySelected"])
        total_assertions += 6
        total_passed += 6

    assert len(why_selected_set) == len(recs), "All candidates must have unique, non-generic explanations"
    total_assertions += 1
    total_passed += 1
    print(f"  ✓ Deep Explainability Validated: All {len(recs)} candidates have unique, candidate-specific rationales")

    # --------------------------------------------------------------------------
    # TEST 8: MATHEMATICAL NORMALIZATION (Sum == 100% & Monthly Sum)
    # --------------------------------------------------------------------------
    print("\n--- TEST 8: Mathematical Normalization ---")
    for b_name, b in [("LOW", low_basket), ("MOD", mod_basket), ("HIGH", high_basket), ("SMALL", small_corpus)]:
        sum_pct = sum(r["allocationPct"] for r in b["recommendations"])
        assert sum_pct == 100, f"{b_name} basket allocations sum to {sum_pct}%, expected 100%"
        total_assertions += 1
        total_passed += 1

        if b["monthlyDeployment"] > 0:
            sum_amt = sum(r["monthlyAmount"] for r in b["recommendations"])
            assert abs(sum_amt - b["monthlyDeployment"]) < 0.05, f"{b_name} monthly amounts sum to {sum_amt}, expected {b['monthlyDeployment']}"
            total_assertions += 1
            total_passed += 1

    print("  ✓ Normalization Validated: All basket weights strictly sum to 100.0% and monthly amounts match deployment")

    # --------------------------------------------------------------------------
    # TEST 9: CASHFLOW DEFICIT SAFEGUARD
    # --------------------------------------------------------------------------
    print("\n--- TEST 9: Cashflow Deficit Safeguard ---")
    deficit_basket = calculate_dynamic_allocation(monthly_income=40000, monthly_expenses=45000, total_corpus=0)
    assert deficit_basket["recommendationCount"] == 1, "Deficit cashflow must return 1 emergency safety recommendation"
    assert deficit_basket["recommendations"][0]["symbol"] == "ICICILIQ", "Deficit must prioritize liquid safety reserve"
    total_assertions += 2
    total_passed += 2
    print("  ✓ Deficit Safeguard Validated: 0 market investments recommended during negative cashflow")

    print("\n================================================================================")
    print(f"PERSONALIZED BASKET INTEGRITY RESULTS: {total_passed}/{total_assertions} Assertions Passed ({(total_passed/total_assertions)*100:.1f}%)")
    print("================================================================================")
    print("ALL PERSONALIZED PORTFOLIO CONSTRUCTION TESTS PASSED WITH 100% INTEGRITY.")

if __name__ == "__main__":
    test_personalized_basket_engine()
