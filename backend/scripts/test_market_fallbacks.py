import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import logging
from app.services.market_data.router import provider_router

# Set up detailed logging to stdout
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

print("=" * 80)
print("SMARTVEST MARKET DATA MULTI-PROVIDER FALLBACK & RESILIENCE AUDIT")
print("=" * 80)

test_symbols = [
    # 1. Indian Stocks & Indices (NSE -> Yahoo Finance)
    ("NIFTY 50", "Indian Index"),
    ("RELIANCE.NS", "Indian Stock"),
    ("TCS.NS", "Indian Stock"),

    # 2. Mutual Funds (AMFI -> MFAPI)
    ("120716", "UTI Nifty 50 Index Fund Direct (AMFI Code)"),
    ("122639", "Parag Parikh Flexi Cap Fund Direct (AMFI Code)"),
    ("120586", "ICICI Prudential Liquid Fund Direct (AMFI Code)"),

    # 3. US Stocks (Finnhub -> TwelveData -> Yahoo Finance)
    ("AAPL", "US Bluechip Tech"),
    ("MSFT", "US Bluechip Cloud"),
    ("NVDA", "US Semiconductor / AI"),

    # 4. ETFs (Yahoo Finance / Exchange)
    ("MON100.NS", "Motilal Nasdaq 100 ETF"),
    ("SPY", "SPDR S&P 500 ETF"),

    # 5. Gold & Commodities (NSE GoldBeES -> MCX)
    ("GOLDBEES.NS", "Nippon Gold BeES (NSE)"),
    ("GOLD", "Sovereign Gold Hedge"),
]

for sym, label in test_symbols:
    print(f"\n--- Testing Symbol: {sym} ({label}) ---")
    quote = provider_router.get_quote(sym)
    price = quote.get("price")
    freshness = quote.get("freshness")
    source = quote.get("source")
    curr = quote.get("currency")
    msg = quote.get("message", "")
    
    print(f"  [QUOTE] Price: {curr} {price} | Freshness: {freshness} | Source: {source}")
    if msg:
        print(f"          Note: {msg}")

    candles = provider_router.get_candles(sym, interval="1d", range_period="1mo")
    obs = candles.get("observations", [])
    c_source = candles.get("source")
    c_freshness = candles.get("freshness")
    print(f"  [CANDLES] Observations: {len(obs)} | Source: {c_source} | Freshness: {c_freshness}")
    if obs:
        first = obs[0]
        last = obs[-1]
        v_f = first.get("close") if first.get("close") is not None else first.get("nav")
        v_l = last.get("close") if last.get("close") is not None else last.get("nav")
        print(f"            Range: {first.get('date')} ({v_f}) -> {last.get('date')} ({v_l})")

print("\n" + "=" * 80)
print("PROVIDER HEALTH TRACKER METRICS:")
print("=" * 80)
for tracker in provider_router.get_health_status().get("providers", []):
    print(f"  • {tracker['name']:<16} | Status: {tracker['status']:<12} | Total: {tracker['totalRequests']} | SuccessRate: {tracker['successRate']}% | Latency: {tracker['lastLatencyMs']}ms")
print("=" * 80)
