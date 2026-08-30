import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.allocation_engine import calculate_dynamic_allocation
from app.services.risk_engine import compute_risk_profile

class TestFundETFRiskDifferentiation(unittest.TestCase):
    """
    Dedicated test suite for verifying dynamic risk-based candidate differentiation,
    portfolio bucketing, and risk budget scaling (Section 21-25).
    """

    def setUp(self):
        # Baseline user parameters
        self.base_user = {
            "age": 22,
            "monthly_income": 50000.0,
            "monthly_expenses": 30000.0,
            "emergency_fund_months": 6.0,
            "existing_investments": 0.0,
            "horizon_years": 20,
            "total_corpus": 20000.0
        }

    def test_01_low_vs_moderate_vs_high_differentiation(self):
        """Verify identical user across LOW, MODERATE, HIGH produces materially different allocations."""
        res_low = calculate_dynamic_allocation(
            risk_tolerance="LOW",
            risk_capacity="LOW",
            **self.base_user
        )
        res_mod = calculate_dynamic_allocation(
            risk_tolerance="MODERATE",
            risk_capacity="MODERATE",
            **self.base_user
        )
        res_high = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="HIGH",
            **self.base_user
        )

        # 1. Final Advisory Risk verification
        self.assertEqual(res_low["final_advisory_risk"], "LOW")
        self.assertEqual(res_mod["final_advisory_risk"], "MODERATE")
        self.assertEqual(res_high["final_advisory_risk"], "HIGH")

        # 2. Equity % differences
        self.assertLess(res_low["equity_total_pct"], res_mod["equity_total_pct"])
        self.assertLess(res_mod["equity_total_pct"], res_high["equity_total_pct"])

        # 3. Debt % differences (Defensive debt drops as risk increases for 20Y horizon)
        self.assertGreater(res_low["debt_total_pct"], res_mod["debt_total_pct"])
        self.assertGreaterEqual(res_mod["debt_total_pct"], res_high["debt_total_pct"])

        # 4. Global Growth (MON100) allocation differences
        self.assertEqual(res_low["global_total_pct"], 0)
        self.assertGreater(res_mod["global_total_pct"], 0)
        self.assertGreater(res_high["global_total_pct"], res_mod["global_total_pct"])

        # 5. Core Portfolio Weighted Risk strictly monotonic: LOW < MODERATE < HIGH
        self.assertLess(res_low["core_portfolio_risk"], res_mod["core_portfolio_risk"])
        self.assertLess(res_mod["core_portfolio_risk"], res_high["core_portfolio_risk"])

        # 6. Overall Portfolio Weighted Risk strictly monotonic: LOW < MODERATE < HIGH
        self.assertLess(res_low["overall_portfolio_risk"], res_mod["overall_portfolio_risk"])
        self.assertLess(res_mod["overall_portfolio_risk"], res_high["overall_portfolio_risk"])

        # 7. Normalization check: Sum of allocations must be exactly 100%
        self.assertEqual(sum(res_low["allocation_dict"].values()), 100)
        self.assertEqual(sum(res_mod["allocation_dict"].values()), 100)
        self.assertEqual(sum(res_high["allocation_dict"].values()), 100)

    def test_02_emergency_fund_impact_on_safety_bucket(self):
        """Verify that zero emergency fund activates safety/liquidity allocation without corrupting growth core."""
        res_adequate = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="HIGH",
            age=22,
            monthly_income=50000.0,
            monthly_expenses=30000.0,
            emergency_fund_months=6.0,
            horizon_years=20
        )
        res_zero_emergency = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="HIGH",
            age=22,
            monthly_income=50000.0,
            monthly_expenses=30000.0,
            emergency_fund_months=0.0,
            horizon_years=20
        )

        # Zero emergency fund allocates defensive buffer
        self.assertGreater(res_zero_emergency["debt_total_pct"], res_adequate["debt_total_pct"])
        self.assertGreater(res_zero_emergency["safety_allocation_pct"], res_adequate["safety_allocation_pct"])

    def test_03_horizon_scaling(self):
        """Verify that a 3Y horizon enforces capital preservation even for a high-risk user."""
        res_20y = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="HIGH",
            age=22,
            monthly_income=50000.0,
            monthly_expenses=30000.0,
            emergency_fund_months=6.0,
            horizon_years=20
        )
        res_3y = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="HIGH",
            age=22,
            monthly_income=50000.0,
            monthly_expenses=30000.0,
            emergency_fund_months=6.0,
            horizon_years=2
        )

        # 3Y horizon enforces high defensive debt allocation (>= 50%)
        self.assertGreaterEqual(res_3y["debt_total_pct"], 50)
        self.assertLess(res_3y["equity_total_pct"], res_20y["equity_total_pct"])
        self.assertLess(res_3y["overall_portfolio_risk"], res_20y["overall_portfolio_risk"])

if __name__ == '__main__':
    unittest.main()
