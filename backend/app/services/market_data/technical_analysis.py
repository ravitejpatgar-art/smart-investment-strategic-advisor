import math
from typing import List, Dict, Any, Optional

def calculate_technical_indicators(candles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes institutional technical indicators from historical candle observations:
    - RSI (14 period)
    - MACD (12, 26, 9 EMA with signal & histogram)
    - Moving Averages (SMA20, SMA50, SMA100, SMA200, EMA20, EMA50)
    - Bollinger Bands (20 period, 2 std dev: Upper, Middle, Lower, %B)
    - 52-Week Range Position %
    - Annualized Historical Volatility %
    - Max Drawdown % & Current Drawdown %
    """
    if not candles or len(candles) < 5:
        return {
            "available": False,
            "message": "Insufficient historical observations for technical analysis."
        }

    closes = [float(c.get("close") or 0.0) for c in candles if c.get("close") is not None and float(c.get("close") or 0.0) > 0]
    if len(closes) < 5:
        return {"available": False}

    current_price = closes[-1]

    # 1. Simple Moving Averages
    def sma(series: List[float], period: int) -> Optional[float]:
        if len(series) < period:
            return None
        return round(sum(series[-period:]) / period, 2)

    sma20 = sma(closes, 20)
    sma50 = sma(closes, 50)
    sma100 = sma(closes, 100)
    sma200 = sma(closes, 200)

    # 2. Exponential Moving Averages
    def ema(series: List[float], period: int) -> Optional[float]:
        if len(series) < period:
            return None
        k = 2.0 / (period + 1)
        ema_val = sum(series[:period]) / period
        for p in series[period:]:
            ema_val = (p * k) + (ema_val * (1 - k))
        return round(ema_val, 2)

    ema20 = ema(closes, 20)
    ema50 = ema(closes, 50)
    ema12 = ema(closes, 12)
    ema26 = ema(closes, 26)

    # 3. MACD (12, 26, 9)
    macd_data = None
    if len(closes) >= 35:
        # Calculate EMA12 and EMA26 series
        macd_series = []
        k12 = 2.0 / 13
        k26 = 2.0 / 27
        e12 = closes[0]
        e26 = closes[0]
        for p in closes:
            e12 = (p * k12) + (e12 * (1 - k12))
            e26 = (p * k26) + (e26 * (1 - k26))
            macd_series.append(e12 - e26)

        # 9-period EMA of MACD line
        signal_val = ema(macd_series, 9)
        macd_line = round(macd_series[-1], 2)
        if signal_val is not None:
            hist_val = round(macd_line - signal_val, 2)
            macd_data = {
                "macd": macd_line,
                "signal": signal_val,
                "histogram": hist_val,
                "trend": "BULLISH" if hist_val > 0 else "BEARISH"
            }

    # 4. RSI (14 Period)
    rsi_val = None
    if len(closes) >= 15:
        gains, losses = [], []
        for i in range(1, len(closes)):
            diff = closes[i] - closes[i - 1]
            if diff >= 0:
                gains.append(diff)
                losses.append(0.0)
            else:
                gains.append(0.0)
                losses.append(abs(diff))

        period = 14
        avg_gain = sum(gains[:period]) / period
        avg_loss = sum(losses[:period]) / period

        for i in range(period, len(gains)):
            avg_gain = ((avg_gain * 13) + gains[i]) / 14
            avg_loss = ((avg_loss * 13) + losses[i]) / 14

        if avg_loss == 0:
            rsi_val = 100.0
        else:
            rs = avg_gain / avg_loss
            rsi_val = round(100.0 - (100.0 / (1.0 + rs)), 2)

    # 5. Bollinger Bands (20 Period, 2 Std Dev)
    bollinger = None
    if len(closes) >= 20:
        window = closes[-20:]
        avg = sum(window) / 20.0
        variance = sum((x - avg) ** 2 for x in window) / 20.0
        std_dev = math.sqrt(variance)
        upper = round(avg + (2 * std_dev), 2)
        lower = round(avg - (2 * std_dev), 2)
        middle = round(avg, 2)
        percent_b = round(((current_price - lower) / (upper - lower) * 100), 2) if (upper - lower) > 0 else 50.0
        bollinger = {
            "upper": upper,
            "middle": middle,
            "lower": lower,
            "bandwidthPct": round(((upper - lower) / middle * 100), 2) if middle > 0 else 0.0,
            "percentB": percent_b
        }

    # 6. 52-Week Range & Position
    # Assume up to 252 trading days
    lookback_52w = closes[-252:] if len(closes) >= 252 else closes
    high_52w = max(lookback_52w)
    low_52w = min(lookback_52w)
    pos_52w = round(((current_price - low_52w) / (high_52w - low_52w) * 100), 2) if (high_52w - low_52w) > 0 else 50.0

    # 7. Annualized Volatility
    returns = []
    for i in range(1, len(closes)):
        if closes[i - 1] > 0:
            returns.append((closes[i] - closes[i - 1]) / closes[i - 1])
    volatility_annualized = None
    if len(returns) >= 10:
        mean_ret = sum(returns) / len(returns)
        var_ret = sum((r - mean_ret) ** 2 for r in returns) / len(returns)
        daily_std = math.sqrt(var_ret)
        volatility_annualized = round(daily_std * math.sqrt(252) * 100, 2)

    # 8. Max & Current Drawdown
    peak = closes[0]
    max_dd = 0.0
    for p in closes:
        if p > peak:
            peak = p
        dd = (peak - p) / peak * 100 if peak > 0 else 0.0
        if dd > max_dd:
            max_dd = dd

    all_time_peak = max(closes)
    current_dd = round(((all_time_peak - current_price) / all_time_peak * 100), 2) if all_time_peak > 0 else 0.0

    # 9. Average True Range (ATR 14)
    atr_14 = None
    if len(candles) >= 15:
        tr_list = []
        for i in range(1, len(candles)):
            h = float(candles[i].get("high") or closes[i])
            l = float(candles[i].get("low") or closes[i])
            prev_c = float(candles[i - 1].get("close") or closes[i - 1])
            tr = max(h - l, abs(h - prev_c), abs(l - prev_c))
            tr_list.append(tr)
        if len(tr_list) >= 14:
            atr_14 = round(sum(tr_list[-14:]) / 14.0, 2)

    # 10. Pivot Points (Standard Support / Resistance)
    last_candle = candles[-1]
    last_h = float(last_candle.get("high") or current_price)
    last_l = float(last_candle.get("low") or current_price)
    pivot_p = round((last_h + last_l + current_price) / 3.0, 2)
    r1 = round((2 * pivot_p) - last_l, 2)
    s1 = round((2 * pivot_p) - last_h, 2)
    r2 = round(pivot_p + (last_h - last_l), 2)
    s2 = round(pivot_p - (last_h - last_l), 2)

    # 11. Trend Direction
    trend_score = 0
    if sma20 and current_price > sma20: trend_score += 1
    elif sma20: trend_score -= 1
    if sma50 and current_price > sma50: trend_score += 1
    elif sma50: trend_score -= 1
    if sma200 and current_price > sma200: trend_score += 2
    elif sma200: trend_score -= 2
    if macd_data and macd_data.get("trend") == "BULLISH": trend_score += 1
    elif macd_data: trend_score -= 1

    trend_direction = "BULLISH" if trend_score >= 2 else "BEARISH" if trend_score <= -2 else "NEUTRAL"

    return {
        "available": True,
        "currentPrice": current_price,
        "rsi": rsi_val,
        "rsiCondition": "OVERBOUGHT" if (rsi_val and rsi_val >= 70) else "OVERSOLD" if (rsi_val and rsi_val <= 30) else "NEUTRAL",
        "macd": macd_data,
        "movingAverages": {
            "sma20": sma20,
            "sma50": sma50,
            "sma100": sma100,
            "sma200": sma200,
            "ema20": ema20,
            "ema50": ema50
        },
        "bollingerBands": bollinger,
        "atr": atr_14,
        "supportResistance": {
            "pivot": pivot_p,
            "r1": r1,
            "s1": s1,
            "r2": r2,
            "s2": s2
        },
        "trendDirection": trend_direction,
        "fiftyTwoWeek": {
            "high": round(high_52w, 2),
            "low": round(low_52w, 2),
            "positionPct": pos_52w
        },
        "volatilityAnnualizedPct": volatility_annualized,
        "maxDrawdownPct": round(max_dd, 2),
        "currentDrawdownPct": current_dd
    }


def compute_market_research_signal(
    technicals: Optional[Dict[str, Any]] = None,
    fundamentals: Optional[Dict[str, Any]] = None,
    valuation: Optional[Dict[str, Any]] = None,
    asset_type: str = "STOCK"
) -> Dict[str, Any]:
    """
    Computes a transparent, quantitative Market Research Signal (BUY / HOLD / SELL / INSUFFICIENT DATA).
    Strictly factual: never manufactures recommendations when input data is insufficient.
    """
    from datetime import datetime, timezone

    reasons: List[str] = []
    bullish_points = 0.0
    bearish_points = 0.0
    total_checks = 0

    # ── 1. Technical Moving Averages & Trend ──
    if technicals and technicals.get("available"):
        mas = technicals.get("movingAverages") or {}
        p = technicals.get("currentPrice", 0)
        sma200 = mas.get("sma200")
        sma50 = mas.get("sma50")
        sma20 = mas.get("sma20")

        if sma200 and p > 0:
            total_checks += 1
            if p >= sma200:
                bullish_points += 1.5
                reasons.append(f"Price is trading above 200-day moving average (SMA200: {sma200})")
            else:
                bearish_points += 1.5
                reasons.append(f"Price is trading below 200-day moving average (SMA200: {sma200})")

        if sma50 and sma20 and p > 0:
            total_checks += 1
            if sma20 >= sma50:
                bullish_points += 1.0
                reasons.append("Short-term moving average (SMA20) is above medium-term (SMA50)")
            else:
                bearish_points += 1.0
                reasons.append("Short-term moving average (SMA20) is below medium-term (SMA50)")

        # ── 2. RSI Momentum ──
        rsi = technicals.get("rsi")
        if rsi is not None:
            total_checks += 1
            if rsi < 35:
                bullish_points += 1.0
                reasons.append(f"RSI ({rsi}) is in oversold territory, suggesting potential support")
            elif rsi > 70:
                bearish_points += 1.0
                reasons.append(f"RSI ({rsi}) is in overbought territory, indicating potential exhaustion")
            else:
                reasons.append(f"RSI ({rsi}) is in balanced neutral territory")

        # ── 3. MACD ──
        macd = technicals.get("macd")
        if macd and macd.get("trend"):
            total_checks += 1
            if macd["trend"] == "BULLISH":
                bullish_points += 1.0
                reasons.append(f"MACD histogram ({macd.get('histogram')}) reflects positive upward momentum")
            else:
                bearish_points += 1.0
                reasons.append(f"MACD histogram ({macd.get('histogram')}) reflects negative downward pressure")

    # ── 4. Fundamentals & Valuation (for Equities) ──
    if valuation:
        pe = valuation.get("peRatio")
        if pe is not None and pe > 0:
            total_checks += 1
            if pe < 22:
                bullish_points += 1.0
                reasons.append(f"Trailing P/E ratio ({pe}) reflects reasonable valuation multiple")
            elif pe > 45:
                bearish_points += 0.8
                reasons.append(f"Trailing P/E ratio ({pe}) reflects an elevated valuation premium")

        peg = valuation.get("peg")
        if peg is not None and peg > 0:
            total_checks += 1
            if peg < 1.5:
                bullish_points += 1.0
                reasons.append(f"PEG ratio ({peg}) indicates attractive growth-adjusted valuation")
            elif peg > 2.5:
                bearish_points += 0.8
                reasons.append(f"PEG ratio ({peg}) indicates high valuation relative to earnings growth")

    if fundamentals:
        roe = fundamentals.get("roe")
        if roe is not None:
            total_checks += 1
            if roe >= 15.0:
                bullish_points += 1.0
                reasons.append(f"Return on Equity (ROE: {roe}%) indicates solid capital profitability")
            elif roe < 5.0:
                bearish_points += 0.8
                reasons.append(f"Return on Equity (ROE: {roe}%) reflects compressed profitability")

        d_e = fundamentals.get("debtToEquity")
        if d_e is not None:
            total_checks += 1
            if d_e < 1.0 or d_e < 100:
                bullish_points += 0.8
                reasons.append("Manageable leverage / debt profile")
            else:
                bearish_points += 0.8
                reasons.append("High debt-to-equity leverage")

        rev_growth = fundamentals.get("revenueGrowth")
        if rev_growth is not None:
            total_checks += 1
            if rev_growth > 8.0:
                bullish_points += 1.0
                reasons.append(f"Quarterly revenue expansion of {rev_growth}% indicates top-line growth")
            elif rev_growth < -2.0:
                bearish_points += 1.0
                reasons.append(f"Revenue contracted by {abs(rev_growth)}% year-over-year")

    # ── 5. Confidence / Coverage Calculation ──
    coverage_pct = min(100, int((total_checks / 6.0) * 100)) if total_checks > 0 else 0

    if total_checks < 2 or coverage_pct < 30:
        return {
            "signal": "INSUFFICIENT DATA",
            "confidence": coverage_pct,
            "coveragePct": coverage_pct,
            "reasons": ["Insufficient historical price series or fundamental metrics available to construct a defensible research signal."],
            "methodology": "Multi-factor quantitative model evaluating trend alignment (SMA 20/50/200), momentum (RSI/MACD), valuation multiples (P/E, PEG), and capital profitability (ROE).",
            "dataTimestamp": datetime.now(timezone.utc).strftime("%d %b %Y %H:%M UTC"),
            "disclaimer": "Market research signals are quantitative model outputs based on historical and published data. They do not constitute personalized investment advice or guaranteed return forecasts."
        }

    net_score = bullish_points - bearish_points

    if net_score >= 1.5:
        signal = "BUY"
    elif net_score <= -1.5:
        signal = "SELL"
    else:
        signal = "HOLD"

    return {
        "signal": signal,
        "confidence": coverage_pct,
        "coveragePct": coverage_pct,
        "reasons": reasons if reasons else ["Neutral balanced performance across technical and fundamental factors."],
        "methodology": "Multi-factor quantitative model evaluating trend alignment (SMA 20/50/200), momentum (RSI/MACD), valuation multiples (P/E, PEG), and capital profitability (ROE).",
        "dataTimestamp": datetime.now(timezone.utc).strftime("%d %b %Y %H:%M UTC"),
        "disclaimer": "Market research signals are quantitative model outputs based on historical and published data. They do not constitute personalized investment advice or guaranteed return forecasts."
    }
