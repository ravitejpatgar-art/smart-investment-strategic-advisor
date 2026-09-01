#!/usr/bin/env python3
"""
Test Risk-Based Allocation Matrix & Strategy Differentiation.
Verifies that:
1. LOW, MODERATE, and HIGH risk mandates produce materially different asset allocations.
2. Horizon and Goal deadlines scale capital preservation assets.
3. Insufficient Emergency Fund forces protective cash buffers.
4. Objective Risk Capacity constrains subjective Risk Tolerance (LOW < MODERATE < HIGH).
5. All allocation percentages sum to 100.0% exactly.
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.allocation_engine import calculate_dynamic_allocation, compute_asset_allocation
from app.services.risk_engine import compute_risk_capacity, resolve_final_advisory_risk

def test_risk_level_differentiation():
    print("\n--- TEST 1: Same User Risk Switch (LOW -> MODERATE -> HIGH) ---")
    user_base = {
        "age": 25,
        "horizon_years": 15,
        "monthly_income": 50000.0,
        "monthly_expenses": 30000.0,
        "emergency_fund_months": 6.0,
        "existing_investments": 100000.0,
        "total_corpus": 20000.0
    }

    low_alloc = calculate_dynamic_allocation(risk_tolerance="LOW", risk_capacity="HIGH", **user_base)
    mod_alloc = calculate_dynamic_allocation(risk_tolerance="MODERATE", risk_capacity="HIGH", **user_base)
    high_alloc = calculate_dynamic_allocation(risk_tolerance="HIGH", risk_capacity="HIGH", **user_base)

    print(f"LOW Risk: Equity={low_alloc['equity_total_pct']}%, Debt={low_alloc['debt_total_pct']}%, Gold={low_alloc['gold_total_pct']}%, CAGR={low_alloc['expected_cagr']}%")
    print(f"MODERATE Risk: Equity={mod_alloc['equity_total_pct']}%, Debt={mod_alloc['debt_total_pct']}%, Gold={mod_alloc['gold_total_pct']}%, CAGR={mod_alloc['expected_cagr']}%")
    print(f"HIGH Risk: Equity={high_alloc['equity_total_pct']}%, Debt={high_alloc['debt_total_pct']}%, Gold={high_alloc['gold_total_pct']}%, CAGR={high_alloc['expected_cagr']}%")

    # Assertions for differentiation
    assert high_alloc["equity_total_pct"] > mod_alloc["equity_total_pct"] > low_alloc["equity_total_pct"], \
        "Equity allocation must strictly follow HIGH > MODERATE > LOW"
    assert low_alloc["debt_total_pct"] > mod_alloc["debt_total_pct"] >= high_alloc["debt_total_pct"], \
        "Debt allocation must strictly follow LOW > MODERATE >= HIGH"
    assert high_alloc["expected_cagr"] > mod_alloc["expected_cagr"] > low_alloc["expected_cagr"], \
        "Expected CAGR must increase with risk tier"
    
    # 100% sum assertion
    assert sum(low_alloc["allocation_dict"].values()) == 100, "LOW allocation must sum to 100%"
    assert sum(mod_alloc["allocation_dict"].values()) == 100, "MODERATE allocation must sum to 100%"
    assert sum(high_alloc["allocation_dict"].values()) == 100, "HIGH allocation must sum to 100%"
    print("[OK] PASSED: Risk Level Differentiation & 100% Sum Validated")

def test_risk_capacity_bounding():
    print("\n--- TEST 2: Risk Capacity Bounding Rule min(Tolerance, Capacity) ---")
    # High tolerance, but zero emergency fund and 1-year horizon -> Capacity is LOW
    cap_res = compute_risk_capacity(
        age=30,
        monthly_income=50000.0,
        monthly_expenses=45000.0,
        existing_savings=5000.0, # < 0.2 months
        horizon_years=2,
        debt_burden_monthly=15000.0
    )
    final_risk = resolve_final_advisory_risk(risk_tolerance="HIGH", risk_capacity=cap_res["capacity_level"])
    print(f"Tolerance=HIGH, Capacity={cap_res['capacity_level']} (Score: {cap_res['capacity_score']}) -> Final Advisory Risk={final_risk}")
    
    assert final_risk in ["LOW", "MODERATE"], "Capacity constraint must bound aggressive tolerance when capacity is weak"
    assert final_risk != "HIGH", "High risk tolerance must not be granted when capacity is inadequate"
    print("[OK] PASSED: Risk Capacity Bounding Verified")

def test_horizon_adaptation():
    print("\n--- TEST 3: Same User Horizon Switch (20Y -> 10Y -> 2Y) ---")
    h20 = calculate_dynamic_allocation(risk_tolerance="HIGH", risk_capacity="HIGH", horizon_years=20, emergency_fund_months=6.0)
    h10 = calculate_dynamic_allocation(risk_tolerance="HIGH", risk_capacity="HIGH", horizon_years=10, emergency_fund_months=6.0)
    h2 = calculate_dynamic_allocation(risk_tolerance="HIGH", risk_capacity="HIGH", horizon_years=2, emergency_fund_months=6.0)

    print(f"20Y Horizon: Equity={h20['equity_total_pct']}%, Debt={h20['debt_total_pct']}%")
    print(f"10Y Horizon: Equity={h10['equity_total_pct']}%, Debt={h10['debt_total_pct']}%")
    print(f"2Y Horizon: Equity={h2['equity_total_pct']}%, Debt={h2['debt_total_pct']}%")

    assert h20["equity_total_pct"] >= h10["equity_total_pct"] > h2["equity_total_pct"], \
        "Near-term horizon (2Y) must enforce capital preservation regardless of risk tolerance"
    assert h2["debt_total_pct"] >= 50, "Near-term horizon must allocate at least 50% to debt/liquid preservation"
    print("[OK] PASSED: Horizon Adaptation Verified")

def test_emergency_fund_override():
    print("\n--- TEST 4: Emergency Fund Impact on Risk Budget ---")
    healthy_ef = calculate_dynamic_allocation(risk_tolerance="MODERATE", risk_capacity="MODERATE", emergency_fund_months=6.0)
    low_ef = calculate_dynamic_allocation(risk_tolerance="MODERATE", risk_capacity="MODERATE", emergency_fund_months=1.5)

    print(f"Healthy EF (6M): Equity={healthy_ef['equity_total_pct']}%, Debt/Liquid={healthy_ef['debt_total_pct']}%")
    print(f"Low EF (1.5M): Equity={low_ef['equity_total_pct']}%, Debt/Liquid={low_ef['debt_total_pct']}%")

    assert low_ef["debt_total_pct"] > healthy_ef["debt_total_pct"], \
        "Low emergency fund must allocate higher liquid cash reserve buffer"
    print("[OK] PASSED: Emergency Fund Buffer Override Verified")

def test_all_matrix_permutations():
    print("\n--- TEST 5: Complete 3x4 Matrix Permutation Test ---")
    risks = ["LOW", "MODERATE", "HIGH"]
    horizons = [2, 5, 10, 20]

    for r in risks:
        for h in horizons:
            res = calculate_dynamic_allocation(risk_tolerance=r, risk_capacity=r, horizon_years=h, emergency_fund_months=6.0)
            total = sum(res["allocation_dict"].values())
            assert total == 100, f"Matrix failure for Risk={r}, Horizon={h}Y: Total={total}%"
            print(f"Risk={r:8s} | Horizon={h:2d}Y -> Equity={res['equity_total_pct']:2d}% | Debt={res['debt_total_pct']:2d}% | Gold={res['gold_total_pct']:2d}% | Title: {res['strategy_title']}")

    print("[OK] PASSED: All 12 Matrix Permutations Verified (100% exact math)")

if __name__ == "__main__":
    print("======================================================================")
    print("RUNNING RISK-BASED ALLOCATION MATRIX & STRATEGY REGRESSION TESTS")
    print("======================================================================")
    test_risk_level_differentiation()
    test_risk_capacity_bounding()
    test_horizon_adaptation()
    test_emergency_fund_override()
    test_all_matrix_permutations()
    print("\n======================================================================")
    print("ALL RISK-BASED ALLOCATION TESTS PASSED 100%!")
    print("======================================================================")
