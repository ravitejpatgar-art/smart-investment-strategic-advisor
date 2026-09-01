import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.market_data.registry import market_registry
from app.services.market_data.router import provider_router
from app.services.market_data.technical_analysis import calculate_technical_indicators

def main():
    print("==================================================")
    print("SMARTVEST GLOBAL MARKET DATA INFRASTRUCTURE TEST")
    print("==================================================")

    test_symbols = [
        ("AAPL", "US Stock"),
        ("NVDA", "US Stock"),
        ("MSFT", "US Stock"),
        ("TSM", "Global / Taiwan Semi"),
        ("ASML", "Global / European Semi"),
        ("SPY", "US S&P 500 ETF"),
        ("QQQ", "US Tech ETF"),
        ("VOO", "Vanguard ETF"),
        ("RELIANCE.NS", "Indian Equities"),
        ("TCS.NS", "Indian Equities"),
        ("INFY.NS", "Indian Equities"),
        ("HDFCBANK.NS", "Indian Equities"),
        ("122639", "Parag Parikh Flexi Cap Direct MF"),
        ("NIFTY 50", "NSE Benchmark Index"),
        ("S&P 500", "US Benchmark Index"),
        ("NASDAQ", "US Tech Benchmark Index"),
        ("GOLD", "Commodities Spot"),
        ("SILVER", "Commodities Spot")
    ]

    print("\n1. Testing Live Quotes via Provider Router & Failover:")
    print("--------------------------------------------------")
    for sym, category in test_symbols:
        try:
            q = market_registry.get_quote(sym)
            price = q.get("price")
            currency = q.get("currency")
            source = q.get("source")
            freshness = q.get("freshness")
            change_pct = q.get("changePct")
            status = "PASS" if price is not None else "UNAVAILABLE"
            print(f"[{status}] {sym:<14} ({category:<26}) -> Price: {currency} {price} ({change_pct}%) | Source: {source} [{freshness}]")
        except Exception as e:
            print(f"[FAIL] {sym:<14} -> Error: {e}")

    print("\n2. Testing Historical Candles & Technical Analysis:")
    print("--------------------------------------------------")
    for sym in ["NVDA", "RELIANCE.NS", "SPY", "GOLD"]:
        candles = market_registry.get_candles(sym, interval="1d", range_period="1y")
        obs = candles.get("observations", [])
        obs_count = len(obs)
        technicals = calculate_technical_indicators(obs) if obs_count > 0 else {}
        rsi = technicals.get("rsi")
        macd = technicals.get("macd")
        sma50 = technicals.get("movingAverages", {}).get("sma50") if technicals else None
        vol = technicals.get("volatilityAnnualizedPct") if technicals else None
        max_dd = technicals.get("maxDrawdownPct") if technicals else None
        print(f"[CANDLES] {sym:<12} -> {obs_count} bars | RSI(14): {rsi} | SMA50: {sma50} | Volatility: {vol}% | MaxDD: -{max_dd}%")

    print("\n3. Provider Health Monitor Telemetry:")
    print("--------------------------------------------------")
    health = provider_router.get_health_status()
    for p in health.get("providers", []):
        print(f"Provider: {p['name']:<16} | Status: {p['status']:<10} | Success Rate: {p['successRate']}% | Latency: {p['lastLatencyMs']}ms")

    print("\n==================================================")
    print("ALL TESTS COMPLETED.")
    print("==================================================")

if __name__ == "__main__":
    main()
