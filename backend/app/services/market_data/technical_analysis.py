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
        "fiftyTwoWeek": {
            "high": round(high_52w, 2),
            "low": round(low_52w, 2),
            "positionPct": pos_52w
        },
        "volatilityAnnualizedPct": volatility_annualized,
        "maxDrawdownPct": round(max_dd, 2),
        "currentDrawdownPct": current_dd
    }
