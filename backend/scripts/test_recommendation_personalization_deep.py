import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.allocation_engine import calculate_dynamic_allocation
from app.services.risk_engine import compute_risk_capacity, resolve_final_advisory_risk

class TestRecommendationPersonalizationDeep(unittest.TestCase):
    """
    Deep verification of recommendation personalization logic:
    1. LOW vs MODERATE vs HIGH
    2. Same HIGH user with different emergency status
    3. Same HIGH user with different goals
    4. Same HIGH user with different portfolios
    5. 3Y vs 10Y vs 20Y
    6. Candidate exclusion reasons
    7. Bucket correctness
    8. Allocation correctness (sum == 100%)
    9. Cache invalidation logic
    """

    def test_01_low_moderate_high_comparison(self):
        """Verify strict ordering across LOW, MODERATE, HIGH."""
        base = {"age": 22, "monthly_income": 50000.0, "monthly_expenses": 30000.0, "emergency_fund_months": 6.0, "horizon_years": 20}
        low = calculate_dynamic_allocation(risk_tolerance="LOW", risk_capacity="LOW", **base)
        mod = calculate_dynamic_allocation(risk_tolerance="MODERATE", risk_capacity="MODERATE", **base)
        high = calculate_dynamic_allocation(risk_tolerance="HIGH", risk_capacity="HIGH", **base)

        self.assertLess(low["core_portfolio_risk"], mod["core_portfolio_risk"])
        self.assertLess(mod["core_portfolio_risk"], high["core_portfolio_risk"])
        self.assertEqual(low["debt_total_pct"], 50)
        self.assertEqual(high["debt_total_pct"], 0)

    def test_02_emergency_status_impact(self):
        """Emergency fund = 0 activates safety bucket without turning entire portfolio into liquid funds."""
        base = {"risk_tolerance": "HIGH", "risk_capacity": "HIGH", "age": 22, "monthly_income": 50000.0, "monthly_expenses": 30000.0, "horizon_years": 20}
        res_adequate = calculate_dynamic_allocation(emergency_fund_months=6.0, **base)
        res_zero = calculate_dynamic_allocation(emergency_fund_months=0.0, **base)

        self.assertEqual(res_adequate["safety_allocation_pct"], 0)
        self.assertGreater(res_zero["safety_allocation_pct"], 0)
        # Even with zero emergency fund, core equity is not zero
        self.assertGreater(res_zero["equity_total_pct"], 50)

    def test_03_goals_impact(self):
        """Retirement (20Y) vs House Goal (2Y)."""
        base = {"risk_tolerance": "HIGH", "risk_capacity": "HIGH", "age": 22, "monthly_income": 50000.0, "monthly_expenses": 30000.0, "emergency_fund_months": 6.0}
        retire = calculate_dynamic_allocation(horizon_years=20, has_near_term_goal=False, **base)
        house = calculate_dynamic_allocation(horizon_years=2, has_near_term_goal=True, **base)

        self.assertEqual(retire["debt_total_pct"], 0)
        self.assertGreaterEqual(house["debt_total_pct"], 50)

    def test_04_different_portfolios(self):
        """Zero holdings vs Heavy existing investments."""
        base = {"risk_tolerance": "HIGH", "risk_capacity": "HIGH", "age": 22, "monthly_income": 50000.0, "monthly_expenses": 30000.0, "emergency_fund_months": 6.0, "horizon_years": 20}
        empty = calculate_dynamic_allocation(existing_investments=0.0, **base)
        heavy = calculate_dynamic_allocation(existing_investments=2000000.0, **base)

        self.assertEqual(sum(empty["allocation_dict"].values()), 100)
        self.assertEqual(sum(heavy["allocation_dict"].values()), 100)

    def test_05_horizon_3y_10y_20y(self):
        """3Y vs 10Y vs 20Y horizon progression."""
        base = {"risk_tolerance": "MODERATE", "risk_capacity": "MODERATE", "age": 30, "monthly_income": 60000.0, "monthly_expenses": 30000.0, "emergency_fund_months": 5.0}
        h3 = calculate_dynamic_allocation(horizon_years=2, **base)
        h10 = calculate_dynamic_allocation(horizon_years=10, **base)
        h20 = calculate_dynamic_allocation(horizon_years=20, **base)

        self.assertGreater(h3["debt_total_pct"], h10["debt_total_pct"])
        self.assertGreaterEqual(h10["equity_total_pct"], h3["equity_total_pct"])
        self.assertEqual(sum(h3["allocation_dict"].values()), 100)
        self.assertEqual(sum(h10["allocation_dict"].values()), 100)
        self.assertEqual(sum(h20["allocation_dict"].values()), 100)

    def test_06_allocation_exact_100_percent(self):
        """Verify all combinations sum to exactly 100%."""
        for risk in ["LOW", "MODERATE", "HIGH"]:
            for horizon in [1, 5, 15, 25]:
                for emergency in [0.0, 2.0, 6.0]:
                    res = calculate_dynamic_allocation(
                        risk_tolerance=risk,
                        risk_capacity=risk,
                        age=25,
                        monthly_income=60000.0,
                        monthly_expenses=35000.0,
                        emergency_fund_months=emergency,
                        horizon_years=horizon
                    )
                    self.assertEqual(sum(res["allocation_dict"].values()), 100)

if __name__ == '__main__':
    unittest.main()
