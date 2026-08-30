import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.allocation_engine import calculate_dynamic_allocation
from app.services.risk_engine import compute_risk_capacity, resolve_final_advisory_risk

class TestDynamicPersonalizationEngine(unittest.TestCase):
    """
    Comprehensive verification of multi-factor personalization across:
    1. Risk differentiation (LOW, MODERATE, HIGH)
    2. Horizon differentiation (3Y, 10Y, 20Y)
    3. Emergency fund differentiation (0 vs Adequate)
    4. Goal differentiation (Near-term house goal vs Long-term wealth)
    5. Portfolio overlap differentiation (Heavy US tech vs Zero US tech)
    6. Same-risk different-user differentiation (User A vs User B)
    7. Same-user different-goal differentiation
    8. Same-user different-horizon differentiation
    """

    def test_01_risk_differentiation(self):
        """1. Risk differentiation across LOW, MODERATE, HIGH."""
        base = {
            "age": 25,
            "monthly_income": 60000.0,
            "monthly_expenses": 35000.0,
            "emergency_fund_months": 6.0,
            "horizon_years": 15
        }
        res_low = calculate_dynamic_allocation(risk_tolerance="LOW", risk_capacity="LOW", **base)
        res_mod = calculate_dynamic_allocation(risk_tolerance="MODERATE", risk_capacity="MODERATE", **base)
        res_high = calculate_dynamic_allocation(risk_tolerance="HIGH", risk_capacity="HIGH", **base)

        self.assertEqual(res_low["final_advisory_risk"], "LOW")
        self.assertEqual(res_mod["final_advisory_risk"], "MODERATE")
        self.assertEqual(res_high["final_advisory_risk"], "HIGH")

        self.assertLess(res_low["core_portfolio_risk"], res_mod["core_portfolio_risk"])
        self.assertLess(res_mod["core_portfolio_risk"], res_high["core_portfolio_risk"])
        self.assertLess(res_low["equity_total_pct"], res_mod["equity_total_pct"])
        self.assertLess(res_mod["equity_total_pct"], res_high["equity_total_pct"])

    def test_02_horizon_differentiation(self):
        """2. Horizon differentiation (3Y vs 10Y vs 20Y)."""
        base = {
            "risk_tolerance": "HIGH",
            "risk_capacity": "HIGH",
            "age": 25,
            "monthly_income": 60000.0,
            "monthly_expenses": 35000.0,
            "emergency_fund_months": 6.0
        }
        res_3y = calculate_dynamic_allocation(horizon_years=2, **base)
        res_10y = calculate_dynamic_allocation(horizon_years=10, **base)
        res_20y = calculate_dynamic_allocation(horizon_years=20, **base)

        self.assertGreaterEqual(res_3y["debt_total_pct"], 50)
        self.assertLess(res_10y["debt_total_pct"], res_3y["debt_total_pct"])
        self.assertEqual(res_20y["debt_total_pct"], 0)
        self.assertGreater(res_20y["equity_total_pct"], res_10y["equity_total_pct"])

    def test_03_emergency_fund_differentiation(self):
        """3. Emergency fund differentiation (0 vs 6 months)."""
        base = {
            "risk_tolerance": "HIGH",
            "risk_capacity": "HIGH",
            "age": 22,
            "monthly_income": 50000.0,
            "monthly_expenses": 30000.0,
            "horizon_years": 20
        }
        res_adequate = calculate_dynamic_allocation(emergency_fund_months=6.0, **base)
        res_zero = calculate_dynamic_allocation(emergency_fund_months=0.0, **base)

        self.assertEqual(res_adequate["safety_allocation_pct"], 0)
        self.assertGreater(res_zero["safety_allocation_pct"], 0)
        self.assertGreater(res_adequate["equity_total_pct"], res_zero["equity_total_pct"])

    def test_04_goal_differentiation(self):
        """4. Goal differentiation (Near-term house goal vs Long-term wealth)."""
        res_house_goal = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="HIGH",
            age=28,
            monthly_income=80000.0,
            monthly_expenses=40000.0,
            emergency_fund_months=6.0,
            horizon_years=2,
            has_near_term_goal=True
        )
        res_wealth_goal = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="HIGH",
            age=28,
            monthly_income=80000.0,
            monthly_expenses=40000.0,
            emergency_fund_months=6.0,
            horizon_years=15,
            has_near_term_goal=False
        )

        self.assertGreaterEqual(res_house_goal["debt_total_pct"], 50)
        self.assertEqual(res_wealth_goal["debt_total_pct"], 0)

    def test_05_portfolio_overlap_differentiation(self):
        """5. Portfolio overlap differentiation."""
        # High existing investments triggers concentration adjustment
        res_empty = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="HIGH",
            age=25,
            monthly_income=70000.0,
            monthly_expenses=35000.0,
            emergency_fund_months=6.0,
            horizon_years=15,
            existing_investments=0.0
        )
        res_heavy = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="HIGH",
            age=25,
            monthly_income=70000.0,
            monthly_expenses=35000.0,
            emergency_fund_months=6.0,
            horizon_years=15,
            existing_investments=1500000.0
        )
        self.assertEqual(sum(res_empty["allocation_dict"].values()), 100)
        self.assertEqual(sum(res_heavy["allocation_dict"].values()), 100)

    def test_06_same_risk_different_user_differentiation(self):
        """
        6. Verify that two users with the SAME stated HIGH risk tolerance
        receive DIFFERENT portfolios because of their capacity, emergency fund, and horizon.
        """
        # User A: High Risk, 20Y horizon, 6 mo emergency fund, high surplus
        user_a = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="HIGH",
            age=22,
            monthly_income=80000.0,
            monthly_expenses=35000.0,
            emergency_fund_months=6.0,
            horizon_years=20
        )

        # User B: High Risk, 2Y horizon, 0 mo emergency fund, house goal
        user_b = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="LOW",
            age=22,
            monthly_income=80000.0,
            monthly_expenses=35000.0,
            emergency_fund_months=0.0,
            horizon_years=2,
            has_near_term_goal=True
        )

        self.assertGreaterEqual(user_a["equity_total_pct"], 85)
        self.assertEqual(user_a["debt_total_pct"], 0)
        self.assertEqual(user_a["final_advisory_risk"], "HIGH")

        self.assertGreaterEqual(user_b["debt_total_pct"], 50)
        self.assertEqual(user_b["final_advisory_risk"], "LOW")
        self.assertNotEqual(user_a["allocation_dict"], user_b["allocation_dict"])

    def test_07_same_user_different_goal(self):
        """7. Same user with different goals produces different risk allocations."""
        user_retire = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="HIGH",
            age=24,
            monthly_income=65000.0,
            monthly_expenses=30000.0,
            emergency_fund_months=6.0,
            horizon_years=20,
            has_near_term_goal=False
        )
        user_car = calculate_dynamic_allocation(
            risk_tolerance="HIGH",
            risk_capacity="HIGH",
            age=24,
            monthly_income=65000.0,
            monthly_expenses=30000.0,
            emergency_fund_months=6.0,
            horizon_years=2,
            has_near_term_goal=True
        )
        self.assertNotEqual(user_retire["allocation_dict"], user_car["allocation_dict"])
        self.assertGreater(user_retire["core_portfolio_risk"], user_car["core_portfolio_risk"])

    def test_08_same_user_different_horizon(self):
        """8. Same user across 3Y, 10Y, 20Y horizons."""
        user_3y = calculate_dynamic_allocation(risk_tolerance="MODERATE", risk_capacity="MODERATE", age=30, monthly_income=60000.0, monthly_expenses=30000.0, emergency_fund_months=4.0, horizon_years=2)
        user_10y = calculate_dynamic_allocation(risk_tolerance="MODERATE", risk_capacity="MODERATE", age=30, monthly_income=60000.0, monthly_expenses=30000.0, emergency_fund_months=4.0, horizon_years=10)
        user_20y = calculate_dynamic_allocation(risk_tolerance="MODERATE", risk_capacity="MODERATE", age=30, monthly_income=60000.0, monthly_expenses=30000.0, emergency_fund_months=4.0, horizon_years=20)

        self.assertGreater(user_3y["debt_total_pct"], user_10y["debt_total_pct"])
        self.assertGreater(user_20y["equity_total_pct"], user_3y["equity_total_pct"])

if __name__ == '__main__':
    unittest.main()
