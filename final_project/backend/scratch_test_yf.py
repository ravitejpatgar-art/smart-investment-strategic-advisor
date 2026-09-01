import sys
import os
sys.path.insert(0, os.path.abspath('.'))
import yfinance as yf
import traceback

print("Testing yfinance version:", yf.__version__)
for sym in ['MON100.NS', 'GOLDBEES.NS', 'NIFTYBEES.NS', 'RELIANCE.NS', 'AAPL', '^NSEI']:
    print(f"\n--- Testing {sym} ---")
    try:
        t = yf.Ticker(sym)
        h = t.history(period="1y", interval="1d")
        print(f"Result for {sym}: empty={h.empty}, len={len(h)}")
        if not h.empty:
            print(h.head(2))
    except Exception as e:
        print(f"Exception for {sym}:", e)
        traceback.print_exc()
