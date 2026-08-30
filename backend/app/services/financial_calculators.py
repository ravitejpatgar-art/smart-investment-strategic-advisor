import math
from typing import Dict, Any, List, Optional

def calculate_sip_future_value(
    monthly_investment: float,
    annual_rate_pct: float,
    years: int
) -> Dict[str, Any]:
    """
    Computes Future Value of a disciplined monthly SIP:
    FV = P * [((1 + r)^n - 1) / r] * (1 + r)
    where r = monthly interest rate, n = total months.
    """
    if monthly_investment <= 0 or years <= 0:
        return {
            "monthly_investment": max(0.0, monthly_investment),
            "annual_rate_pct": annual_rate_pct,
            "years": max(0, years),
            "total_invested": 0.0,
            "estimated_returns": 0.0,
            "future_value": 0.0,
            "multiplier": 1.0
        }
    
    months = years * 12
    monthly_rate = (annual_rate_pct / 100.0) / 12.0
    
    if monthly_rate > 0:
        fv_factor = (((1.0 + monthly_rate) ** months - 1.0) / monthly_rate) * (1.0 + monthly_rate)
        future_value = round(monthly_investment * fv_factor)
    else:
        future_value = round(monthly_investment * months)
        
    total_invested = round(monthly_investment * months)
    estimated_returns = max(0, future_value - total_invested)
    
    return {
        "monthly_investment": monthly_investment,
        "annual_rate_pct": annual_rate_pct,
        "years": years,
        "total_invested": total_invested,
        "estimated_returns": estimated_returns,
        "future_value": future_value,
        "multiplier": round(future_value / total_invested, 2) if total_invested > 0 else 1.0
    }

def calculate_required_sip(
    target_amount: float,
    annual_rate_pct: float,
    years: int,
    current_amount: float = 0.0
) -> Dict[str, Any]:
    """
    Computes required monthly SIP to accumulate target amount over specified years.
    """
    if target_amount <= 0 or years <= 0:
        return {
            "target_amount": target_amount,
            "current_amount": current_amount,
            "years": years,
            "annual_rate_pct": annual_rate_pct,
            "required_monthly_sip": 0.0,
            "total_sip_invested": 0.0,
            "total_invested": 0.0,
            "estimated_growth": 0.0,
            "already_funded": target_amount <= current_amount
        }
        
    months = years * 12
    monthly_rate = (annual_rate_pct / 100.0) / 12.0
    
    # Growth of current lump sum
    lump_future = current_amount * math.pow(1.0 + monthly_rate, months) if current_amount > 0 else 0.0
    remaining_target = max(0.0, target_amount - lump_future)
    
    if remaining_target <= 0:
        return {
            "target_amount": target_amount,
            "current_amount": current_amount,
            "years": years,
            "annual_rate_pct": annual_rate_pct,
            "required_monthly_sip": 0.0,
            "total_sip_invested": 0.0,
            "total_invested": round(current_amount),
            "estimated_growth": round(lump_future - current_amount),
            "already_funded": True
        }
        
    if monthly_rate > 0:
        sip_factor = (((1.0 + monthly_rate) ** months - 1.0) / monthly_rate) * (1.0 + monthly_rate)
        required_sip = round(remaining_target / sip_factor)
    else:
        required_sip = round(remaining_target / months)
        
    total_sip_invested = round(required_sip * months)
    total_invested = round(current_amount + total_sip_invested)
    estimated_growth = round(target_amount - total_invested)
    
    return {
        "target_amount": target_amount,
        "current_amount": current_amount,
        "years": years,
        "annual_rate_pct": annual_rate_pct,
        "required_monthly_sip": required_sip,
        "total_sip_invested": total_sip_invested,
        "total_invested": total_invested,
        "estimated_growth": max(0, estimated_growth),
        "already_funded": False
    }

def calculate_step_up_sip(
    initial_sip: float,
    annual_step_up_pct: float,
    annual_rate_pct: float,
    years: int
) -> Dict[str, Any]:
    """
    Computes Future Value of a Step-Up SIP where monthly investment increases each year.
    """
    if initial_sip <= 0 or years <= 0:
        return {
            "initial_sip": initial_sip,
            "annual_step_up_pct": annual_step_up_pct,
            "annual_rate_pct": annual_rate_pct,
            "years": years,
            "total_invested": 0,
            "estimated_returns": 0,
            "future_value": 0
        }
        
    monthly_rate = (annual_rate_pct / 100.0) / 12.0
    total_invested = 0.0
    current_sip = initial_sip
    running_future_value = 0.0
    
    for yr in range(1, years + 1):
        for m in range(1, 13):
            total_invested += current_sip
            months_remaining = (years - yr) * 12 + (12 - m) + 1
            growth_factor = math.pow(1.0 + monthly_rate, months_remaining)
            running_future_value += current_sip * growth_factor
            
        current_sip = current_sip * (1.0 + (annual_step_up_pct / 100.0))
        
    future_value = round(running_future_value)
    total_invested = round(total_invested)
    
    return {
        "initial_sip": initial_sip,
        "annual_step_up_pct": annual_step_up_pct,
        "annual_rate_pct": annual_rate_pct,
        "years": years,
        "total_invested": total_invested,
        "estimated_returns": max(0, future_value - total_invested),
        "future_value": future_value
    }

def calculate_time_to_target(
    monthly_sip: float,
    target_amount: float,
    annual_rate_pct: float = 13.5,
    current_amount: float = 0.0
) -> Dict[str, Any]:
    """
    Computes time required (in years and months) to reach a target corpus at a given SIP.
    """
    if monthly_sip <= 0 or target_amount <= 0:
        return {"estimated_years": 0, "estimated_months": 0, "achievable": False}
        
    if current_amount >= target_amount:
        return {"estimated_years": 0.0, "total_months": 0, "achievable": True}
        
    monthly_rate = (annual_rate_pct / 100.0) / 12.0
    
    for y in range(1, 45):
        months = y * 12
        lump_fv = current_amount * math.pow(1.0 + monthly_rate, months) if current_amount > 0 else 0.0
        sip_factor = (((1.0 + monthly_rate) ** months - 1.0) / monthly_rate) * (1.0 + monthly_rate)
        fv = lump_fv + (monthly_sip * sip_factor)
        if fv >= target_amount:
            # Check finer month resolution
            for m in range(max(1, (y - 1) * 12), months + 1):
                l_fv = current_amount * math.pow(1.0 + monthly_rate, m) if current_amount > 0 else 0.0
                s_fac = (((1.0 + monthly_rate) ** m - 1.0) / monthly_rate) * (1.0 + monthly_rate) if m > 0 else 0
                if (l_fv + monthly_sip * s_fac) >= target_amount:
                    return {
                        "estimated_years": round(m / 12.0, 1),
                        "total_months": m,
                        "achievable": True
                    }
            return {
                "estimated_years": y,
                "total_months": months,
                "achievable": True
            }
            
    return {"estimated_years": 45, "total_months": 540, "achievable": False}

def calculate_lumpsum_growth(
    principal: float,
    annual_rate_pct: float,
    years: int
) -> Dict[str, Any]:
    """Computes compound growth of a one-time lumpsum investment."""
    if principal <= 0 or years <= 0:
        return {
            "principal": principal,
            "annual_rate_pct": annual_rate_pct,
            "years": years,
            "future_value": principal,
            "estimated_returns": 0
        }
    fv = round(principal * math.pow(1.0 + (annual_rate_pct / 100.0), years))
    return {
        "principal": principal,
        "annual_rate_pct": annual_rate_pct,
        "years": years,
        "future_value": fv,
        "estimated_returns": max(0, fv - round(principal))
    }

def calculate_inflation_adjusted_target(
    target_amount: float,
    annual_inflation_rate: float,
    years: int
) -> float:
    """Computes inflation adjusted nominal target."""
    return round(target_amount * math.pow(1.0 + (annual_inflation_rate / 100.0), years))

def calculate_emergency_fund_metrics(
    monthly_expenses: float,
    current_savings: float,
    target_months: int = 6
) -> Dict[str, Any]:
    """
    Calculates safety buffer requirements, coverage runway, and deficit.
    """
    target_fund = round(monthly_expenses * target_months)
    coverage_months = round(current_savings / monthly_expenses, 1) if monthly_expenses > 0 else float(target_months)
    deficit = max(0.0, target_fund - current_savings)
    surplus = max(0.0, current_savings - target_fund)
    
    if coverage_months >= target_months:
        status = "Fully Funded"
        badge = "Optimal Safety"
    elif coverage_months >= 3:
        status = f"₹{deficit:,.0f} Needed to Reach {target_months}-Month Buffer"
        badge = "Moderate Buffer"
    else:
        status = f"₹{deficit:,.0f} Critical Buffer Needed"
        badge = "High Liquidity Risk"
        
    return {
        "monthly_expenses": monthly_expenses,
        "target_months": target_months,
        "target_fund": target_fund,
        "current_savings": current_savings,
        "coverage_months": coverage_months,
        "deficit": deficit,
        "surplus": surplus,
        "status": status,
        "badge": badge
    }

def calculate_affordability(
    purchase_price: float,
    down_payment_pct: float,
    annual_interest_rate: float,
    tenure_years: int,
    monthly_income: float,
    monthly_expenses: float,
    current_emergency_fund: float
) -> Dict[str, Any]:
    """
    Calculates loan EMI and evaluates affordability against monthly cashflow.
    """
    monthly_surplus = max(0.0, monthly_income - monthly_expenses)
    down_payment = round(purchase_price * (down_payment_pct / 100.0))
    loan_amount = max(0.0, purchase_price - down_payment)
    
    months = tenure_years * 12
    monthly_rate = (annual_interest_rate / 100.0) / 12.0
    
    if loan_amount > 0 and monthly_rate > 0:
        factor = (1.0 + monthly_rate) ** months
        emi = round((loan_amount * monthly_rate * factor) / (factor - 1.0))
    else:
        emi = 0
        
    total_payment = emi * months
    total_interest = max(0, total_payment - loan_amount)
    
    # Financial Ratios
    emi_to_income_pct = round((emi / monthly_income * 100.0), 1) if monthly_income > 0 else 100.0
    emi_to_surplus_pct = round((emi / monthly_surplus * 100.0), 1) if monthly_surplus > 0 else 100.0
    remaining_surplus = max(0.0, monthly_surplus - emi)
    
    emergency_target = monthly_expenses * 6
    remaining_savings = current_emergency_fund - down_payment
    emergency_fund_drained = remaining_savings < (monthly_expenses * 3) if monthly_expenses > 0 else False
    
    if emi_to_surplus_pct <= 35.0 and emi_to_income_pct <= 20.0 and not emergency_fund_drained:
        verdict = "Comfortable"
        verdict_color = "emerald"
        recommendation = (
            f"The estimated EMI of ₹{emi:,.0f}/month consumes {emi_to_surplus_pct:.0f}% of your surplus. "
            f"You will have ₹{remaining_surplus:,.0f}/month remaining to sustain your long-term SIP compounding."
        )
    elif emi_to_surplus_pct <= 55.0 and emi_to_income_pct <= 30.0:
        verdict = "Possible with Caution"
        verdict_color = "amber"
        recommendation = (
            f"The estimated EMI of ₹{emi:,.0f}/month consumes {emi_to_surplus_pct:.0f}% of your monthly surplus. "
            f"While manageable, it slows your goal accumulation momentum. Consider saving a higher down payment first."
        )
    else:
        verdict = "Not Advisable Currently"
        verdict_color = "rose"
        recommendation = (
            f"The estimated EMI of ₹{emi:,.0f}/month consumes {emi_to_surplus_pct:.0f}% of your monthly surplus, "
            f"leaving an inadequate cushion for unexpected expenses or investment compounding."
        )
        
    return {
        "purchase_price": purchase_price,
        "down_payment_pct": down_payment_pct,
        "down_payment": down_payment,
        "loan_amount": loan_amount,
        "annual_interest_rate": annual_interest_rate,
        "tenure_years": tenure_years,
        "monthly_emi": emi,
        "total_payment": total_payment,
        "total_interest": total_interest,
        "monthly_surplus": monthly_surplus,
        "remaining_surplus": remaining_surplus,
        "emi_to_income_pct": emi_to_income_pct,
        "emi_to_surplus_pct": emi_to_surplus_pct,
        "verdict": verdict,
        "verdict_color": verdict_color,
        "recommendation": recommendation,
        "emergency_fund_status": "Protected" if not emergency_fund_drained else "At Risk"
    }

def calculate_retirement_corpus(
    current_age: int,
    retirement_age: int,
    life_expectancy: int,
    current_monthly_expenses: float,
    annual_inflation_pct: float = 6.0,
    pre_ret_cagr: float = 12.5,
    post_ret_return_pct: float = 8.0,
    existing_retirement_savings: float = 0.0
) -> Dict[str, Any]:
    """
    Computes required retirement nest egg and required monthly SIP.
    """
    years_to_retire = max(1, retirement_age - current_age)
    years_in_retirement = max(1, life_expectancy - retirement_age)
    
    monthly_expense_at_ret = current_monthly_expenses * math.pow(1.0 + (annual_inflation_pct / 100.0), years_to_retire)
    annual_expense_at_ret = monthly_expense_at_ret * 12.0
    
    real_post_ret_rate = ((1.0 + post_ret_return_pct / 100.0) / (1.0 + annual_inflation_pct / 100.0)) - 1.0
    
    if real_post_ret_rate > 0:
        corpus_needed = annual_expense_at_ret * ((1.0 - math.pow(1.0 + real_post_ret_rate, -years_in_retirement)) / real_post_ret_rate)
    else:
        corpus_needed = annual_expense_at_ret * years_in_retirement
        
    corpus_needed = round(corpus_needed)
    
    pre_ret_monthly_rate = (pre_ret_cagr / 100.0) / 12.0
    months_to_ret = years_to_retire * 12
    existing_growth = existing_retirement_savings * math.pow(1.0 + pre_ret_monthly_rate, months_to_ret)
    
    net_corpus_needed = max(0.0, corpus_needed - existing_growth)
    
    if net_corpus_needed > 0:
        sip_factor = (((1.0 + pre_ret_monthly_rate) ** months_to_ret - 1.0) / pre_ret_monthly_rate) * (1.0 + pre_ret_monthly_rate)
        required_monthly_sip = round(net_corpus_needed / sip_factor)
    else:
        required_monthly_sip = 0
        
    return {
        "current_age": current_age,
        "retirement_age": retirement_age,
        "years_to_retire": years_to_retire,
        "years_in_retirement": years_in_retirement,
        "current_monthly_expenses": current_monthly_expenses,
        "monthly_expense_at_ret": round(monthly_expense_at_ret),
        "target_retirement_corpus": corpus_needed,
        "existing_savings": existing_retirement_savings,
        "existing_savings_projected": round(existing_growth),
        "net_corpus_needed": round(net_corpus_needed),
        "required_monthly_sip": required_monthly_sip
    }

def calculate_portfolio_concentration(
    existing_amount: float,
    instrument_name: str,
    total_portfolio_value: float = 0.0
) -> Dict[str, Any]:
    """
    Evaluates concentration risk of holding an asset.
    """
    total_val = max(existing_amount, total_portfolio_value)
    pct = round((existing_amount / total_val * 100.0), 1) if total_val > 0 else 100.0
    
    if pct >= 50.0:
        risk_level = "High Concentration Risk"
        guidance = f"Your holding in {instrument_name} represents {pct:.0f}% of your portfolio. SmartVest recommends diversifying new cashflows into complementary asset classes (Flexi-Cap, US Tech, Gold, Debt) rather than adding more to this single instrument."
    elif pct >= 30.0:
        risk_level = "Moderate Concentration"
        guidance = f"Your holding in {instrument_name} represents {pct:.0f}% of your portfolio. It is a solid core anchor, but ensure your satellite assets (Gold, International Tech) are adequately funded."
    else:
        risk_level = "Well Diversified"
        guidance = f"Your holding in {instrument_name} represents {pct:.0f}% of your portfolio, well within standard risk concentration limits."
        
    return {
        "existing_amount": existing_amount,
        "instrument_name": instrument_name,
        "total_portfolio_value": total_val,
        "concentration_pct": pct,
        "risk_level": risk_level,
        "guidance": guidance
    }

def calculate_surplus_allocation_breakdown(
    income: float,
    expenses: float,
    risk_category: str = "Moderate",
    safety_buffer_pct: float = 10.0
) -> Dict[str, Any]:
    """
    Phase 5 Cashflow Engine:
    monthlySurplus = monthlyIncome - monthlyExpenses
    Do NOT convert negative surplus to zero.
    Status: DEFICIT when income < expenses, SURPLUS when income >= expenses.
    Distinguishes:
    1. Monthly Income
    2. Monthly Expenses
    3. Monthly Surplus
    4. Maximum Investable Capacity
    5. Recommended Investment
    6. Flexible Buffer
    """
    surplus = income - expenses
    savings_rate = round((surplus / income * 100.0), 1) if income > 0 and surplus > 0 else 0.0

    if surplus <= 0:
        status = "DEFICIT"
        maximum_investable_capacity = 0.0
        recommended_monthly_investment = 0.0
        flexible_buffer = 0.0
        safety_buffer = 0.0
    else:
        status = "SURPLUS"
        maximum_investable_capacity = float(surplus)
        flexible_buffer = round(surplus * (safety_buffer_pct / 100.0))
        safety_buffer = flexible_buffer
        recommended_monthly_investment = round(surplus - flexible_buffer)

    return {
        "monthly_income": income,
        "monthly_expenses": expenses,
        "monthly_surplus": surplus,
        "savings_rate_pct": savings_rate,
        "savings_rate": savings_rate,
        "status": status,
        "maximum_investable_capacity": maximum_investable_capacity,
        "investable_capacity": maximum_investable_capacity,
        "recommended_investment": recommended_monthly_investment,
        "recommended_monthly_investment": recommended_monthly_investment,
        "flexible_buffer": flexible_buffer,
        "safety_buffer": safety_buffer,
        "risk_category": risk_category
    }

def reconcile_declared_vs_tracked_expenses(
    declared_monthly_expenses: float,
    tracked_monthly_expenses: float
) -> Dict[str, Any]:
    """
    Phase 4: Profile vs Expense Reconciliation Engine
    Determines authoritative monthly expenses and generates notice if difference is meaningful.
    """
    decl = max(0.0, float(declared_monthly_expenses or 0.0))
    tracked = max(0.0, float(tracked_monthly_expenses or 0.0))
    
    # Documented policy: if tracked data is sufficiently complete / logged, use tracked
    if tracked > 0:
        authoritative = tracked
        source = "TRACKED_EXPENSES"
    else:
        authoritative = decl
        source = "DECLARED_PROFILE"
        
    diff = abs(tracked - decl)
    has_meaningful_difference = (tracked > 0 and decl > 0 and diff > max(1000.0, 0.05 * decl))
    
    notice = None
    if has_meaningful_difference:
        notice = f"Your tracked expenses are ₹{tracked:,.0f} while your declared monthly expenses are ₹{decl:,.0f}."
        
    return {
        "declared_monthly_expenses": decl,
        "tracked_monthly_expenses": tracked,
        "authoritative_monthly_expenses": authoritative,
        "source": source,
        "difference": round(diff, 2),
        "has_meaningful_difference": has_meaningful_difference,
        "notice": notice
    }

def detect_portfolio_overlaps(holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Phase 11: Overlap Detection Engine
    Identifies economically similar exposures across funds, ETFs, and direct equities.
    """
    if not holdings:
        return {
            "overlaps": [],
            "overlap_count": 0,
            "has_overlap": False,
            "diversification_score": 100,
            "feedback": {
                "what_is_good": "Portfolio is ready for initial multi-asset allocation.",
                "what_is_concentrated": "No holdings registered.",
                "what_overlaps": "None.",
                "what_is_missing": "Add holdings to assess real exposure."
            }
        }
        
    # Standardize exposure clusters
    cluster_mapping = {
        "NIFTYBEES": "Indian Large-Cap (Nifty 50)",
        "UTINIFTY50": "Indian Large-Cap (Nifty 50)",
        "NIFTY 50": "Indian Large-Cap (Nifty 50)",
        "HDFCNIFTY": "Indian Large-Cap (Nifty 50)",
        "MON100": "US Technology (Nasdaq-100)",
        "QQQ": "US Technology (Nasdaq-100)",
        "GOLDBEES": "Gold Commodity Hedge",
        "GOLD": "Gold Commodity Hedge",
        "SGB": "Gold Commodity Hedge"
    }
    
    seen_clusters: Dict[str, List[str]] = {}
    total_val = sum(float(h.get("amount", 0.0) or (float(h.get("shares", 0.0)) * float(h.get("price", h.get("avg_buy_price", 1.0))))) for h in holdings)
    
    for h in holdings:
        sym = str(h.get("symbol", "")).upper().replace(".NS", "").replace(".BO", "")
        name = str(h.get("name", sym))
        cat = str(h.get("category", "") or h.get("asset_class", ""))
        
        # Determine cluster
        cluster = cluster_mapping.get(sym)
        if not cluster:
            if "nifty" in name.lower() or "large cap" in cat.lower():
                cluster = "Indian Large-Cap (Nifty 50)"
            elif "nasdaq" in name.lower() or "us tech" in cat.lower():
                cluster = "US Technology (Nasdaq-100)"
            elif "gold" in name.lower():
                cluster = "Gold Commodity Hedge"
            else:
                cluster = cat or sym
                
        if cluster not in seen_clusters:
            seen_clusters[cluster] = []
        seen_clusters[cluster].append(name)
        
    overlaps = []
    for cluster, instruments in seen_clusters.items():
        if len(instruments) > 1:
            overlaps.append({
                "cluster": cluster,
                "instruments": instruments,
                "message": f"Overlapping economic exposure detected in '{cluster}' between: {', '.join(instruments)}."
            })
            
    unique_clusters = len(seen_clusters)
    overlap_count = sum(len(instruments) - 1 for instruments in seen_clusters.values() if len(instruments) > 1)
    
    # Calculate diversification score 0 - 100
    base_score = min(100, unique_clusters * 25)
    deduction = overlap_count * 8
    diversification_score = max(20, min(100, base_score - deduction))
    
    # Generate 4 dimensions
    good_items = []
    if "Indian Large-Cap (Nifty 50)" in seen_clusters:
        good_items.append("Solid domestic bluechip core anchor")
    if "US Technology (Nasdaq-100)" in seen_clusters:
        good_items.append("Global dollar-hedged technology participation")
    if "Gold Commodity Hedge" in seen_clusters:
        good_items.append("Inflation/crisis gold protection")
    if not good_items:
        good_items.append("Holdings established across initial asset classes")
        
    missing_items = []
    if "US Technology (Nasdaq-100)" not in seen_clusters:
        missing_items.append("US / International equity exposure")
    if "Gold Commodity Hedge" not in seen_clusters:
        missing_items.append("Gold / Precious metal safety reserve")
    if "Debt" not in "".join(seen_clusters.keys()):
        missing_items.append("Liquid debt / Fixed income cushion")
        
    return {
        "overlaps": overlaps,
        "overlap_count": overlap_count,
        "has_overlap": len(overlaps) > 0,
        "unique_asset_pillars": unique_clusters,
        "diversification_score": diversification_score,
        "feedback": {
            "what_is_good": "; ".join(good_items),
            "what_is_concentrated": "Single cluster concentration" if overlap_count > 0 else "Balanced distribution",
            "what_overlaps": "; ".join(o["message"] for o in overlaps) if overlaps else "No overlapping duplicate exposures detected",
            "what_is_missing": "; ".join(missing_items) if missing_items else "Comprehensive asset pillar coverage achieved"
        }
    }
