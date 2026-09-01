from typing import Dict, Any, List

def compute_financial_health_score(
    monthly_income: float,
    monthly_expenses: float,
    existing_savings: float,
    total_investments: float = 0.0,
    active_goals_count: int = 3,
    debt_payments: float = 0.0
) -> Dict[str, Any]:
    """
    Institutional 5-Pillar Financial Health Scoring Engine:
    1. Savings Rate Score (0 - 25 pts)
    2. Emergency Runway Buffer (0 - 25 pts)
    3. Debt-to-Income Leverage (0 - 20 pts)
    4. Asset Diversification (0 - 15 pts)
    5. Goal Adherence & SIP Capacity (0 - 15 pts)
    """
    total_score = 0
    factors = {}
    recommendations: List[str] = []

    # 1. Savings Rate Pillar (Max 25 pts)
    monthly_savings = max(0.0, monthly_income - monthly_expenses)
    savings_rate = (monthly_savings / monthly_income * 100.0) if monthly_income > 0 else 0.0
    
    if savings_rate >= 40.0:
        sr_score = 25
        sr_label = f"Elite ({savings_rate:.1f}% of income saved)"
    elif savings_rate >= 25.0:
        sr_score = 20
        sr_label = f"Healthy ({savings_rate:.1f}% of income saved)"
    elif savings_rate >= 15.0:
        sr_score = 14
        sr_label = f"Moderate ({savings_rate:.1f}% of income saved)"
    elif savings_rate > 0.0:
        sr_score = 8
        sr_label = f"Low Buffer ({savings_rate:.1f}% of income saved)"
        recommendations.append("Audit non-essential subscription and dining expenses to increase monthly savings rate above 20%.")
    else:
        sr_score = 0
        sr_label = "Negative Cash Flow (Expenses exceed income)"
        recommendations.append("Immediate intervention needed: Expenses exceed monthly cash inflow. Reduce discretionary spending.")

    total_score += sr_score
    factors["savingsRate"] = {"score": sr_score, "rate": round(savings_rate, 1), "label": sr_label}

    # 2. Emergency Runway Buffer (Max 25 pts)
    emergency_months = (existing_savings / monthly_expenses) if monthly_expenses > 0 else 0.0
    
    if emergency_months >= 6.0:
        ef_score = 25
        ef_label = f"Robust ({emergency_months:.1f} months liquid buffer)"
    elif emergency_months >= 3.0:
        ef_score = 18
        ef_label = f"Adequate ({emergency_months:.1f} months liquid buffer)"
        recommendations.append(f"Expand liquid savings from {emergency_months:.1f} months to 6.0 months in high-yield liquid funds.")
    elif emergency_months >= 1.0:
        ef_score = 10
        ef_label = f"Vulnerable ({emergency_months:.1f} months liquid buffer)"
        recommendations.append("Priority: Build at least 3 months of emergency expenses before taking aggressive equity exposure.")
    else:
        ef_score = 2
        ef_label = f"Critical ({emergency_months:.1f} months liquid buffer)"
        recommendations.append("Emergency Alert: Liquid safety net is below 1 month. Channel all surplus into capital preservation accounts.")

    total_score += ef_score
    factors["emergencyFund"] = {"score": ef_score, "months": round(emergency_months, 1), "label": ef_label}

    # 3. Debt-to-Income Ratio (Max 20 pts)
    dti_ratio = (debt_payments / monthly_income * 100.0) if monthly_income > 0 else 0.0
    if dti_ratio <= 15.0:
        debt_score = 20
        debt_label = f"Optimal Leverage ({dti_ratio:.1f}% DTI)"
    elif dti_ratio <= 35.0:
        debt_score = 14
        debt_label = f"Manageable ({dti_ratio:.1f}% DTI)"
    elif dti_ratio <= 50.0:
        debt_score = 8
        debt_label = f"High Debt Burden ({dti_ratio:.1f}% DTI)"
        recommendations.append("Execute Avalanche debt repayment method on high-interest loans (credit cards & personal loans).")
    else:
        debt_score = 2
        debt_label = f"Severe Over-Leverage ({dti_ratio:.1f}% DTI)"
        recommendations.append("Critical: Debt servicing consumes over 50% of income. Restructure liabilities immediately.")

    total_score += debt_score
    factors["debtRatio"] = {"score": debt_score, "ratio": round(dti_ratio, 1), "label": debt_label}

    # 4. Investment Diversification Pillar (Max 15 pts)
    if total_investments > 0:
        div_score = 14
        div_label = "Multi-Asset Active (Equity, Gold, Debt)"
    elif existing_savings > (monthly_expenses * 6):
        div_score = 10
        div_label = "Liquid Heavy (Surplus ready for deployment)"
        recommendations.append("Surplus capital detected sitting in low-yield savings. Deploy into automated index SIPs.")
    else:
        div_score = 6
        div_label = "Early Accumulation Phase"

    total_score += div_score
    factors["diversification"] = {"score": div_score, "label": div_label}

    # 5. Goal Progress Pillar (Max 15 pts)
    if active_goals_count >= 2:
        goal_score = 14
        goal_label = f"Active Planning ({active_goals_count} Tracked Goals)"
    elif active_goals_count == 1:
        goal_score = 10
        goal_label = "Single Milestone Target"
    else:
        goal_score = 5
        goal_label = "No Formal Milestone Tracked"
        recommendations.append("Define at least 2 primary goals (e.g. Retirement & Emergency House Fund) to activate Monte Carlo forecasting.")

    total_score += goal_score
    factors["goalProgress"] = {"score": goal_score, "label": goal_label}

    # Normalize final score between 0 and 100
    final_score = max(5, min(100, total_score))

    # Determine Grade and Status
    if final_score >= 90:
        grade = "A+"
        status = "Excellent"
    elif final_score >= 80:
        grade = "A"
        status = "Healthy"
    elif final_score >= 65:
        grade = "B"
        status = "Moderate"
    elif final_score >= 50:
        grade = "C"
        status = "Vulnerable"
    else:
        grade = "D"
        status = "Critical"

    if not recommendations:
        recommendations.append("Portfolio is optimally balanced. Continue systematic monthly SIP compounding.")
        recommendations.append("Consider international ETF diversification (Nasdaq 100 / S&P 500) to hedge currency risks.")

    return {
        "score": final_score,
        "grade": grade,
        "status": status,
        "factors": factors,
        "recommendations": recommendations[:3] # Top 3 priority recommendations
    }
