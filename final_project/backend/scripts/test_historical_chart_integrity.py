import sys
import os

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.market_data.registry import market_registry

def test_historical_chart_pipeline():
    print("================================================================================")
    print("SMARTVEST TEST SUITE: HISTORICAL CHART & NAV PIPELINE INTEGRITY")
    print("================================================================================")

    test_symbols = [
        # Indices & Indian Equities
        {"symbol": "NIFTY 50", "expected_provider": "Yahoo Finance / NSE Delayed Feed", "asset_type": "INDEX"},
        {"symbol": "^NSEI", "expected_provider": "Yahoo Finance / NSE Delayed Feed", "asset_type": "INDEX"},
        {"symbol": "RELIANCE", "expected_provider": "Yahoo Finance / NSE Delayed Feed", "asset_type": "EQUITY"},
        
        # ETFs & Commodities
        {"symbol": "NIFTYBEES", "expected_provider": "Exchange Traded Fund Provider", "asset_type": "ETF"},
        {"symbol": "MON100", "expected_provider": "Exchange Traded Fund Provider", "asset_type": "ETF"},
        {"symbol": "GOLDBEES", "expected_provider": "Gold Reference & ETF Provider", "asset_type": "COMMODITY"},
        
        # US Equities
        {"symbol": "AAPL", "expected_provider": "US Market Feed (yfinance)", "asset_type": "EQUITY"},
        {"symbol": "MSFT", "expected_provider": "US Market Feed (yfinance)", "asset_type": "EQUITY"},
        {"symbol": "NVDA", "expected_provider": "US Market Feed (yfinance)", "asset_type": "EQUITY"},
        
        # Mutual Funds (AMFI)
        {"symbol": "NIFTY50", "expected_provider": "AMFI / Official Mutual Fund Feed", "asset_type": "MUTUAL_FUND"},
        {"symbol": "PPFCF", "expected_provider": "AMFI / Official Mutual Fund Feed", "asset_type": "MUTUAL_FUND"},
        {"symbol": "ICICILIQ", "expected_provider": "AMFI / Official Mutual Fund Feed", "asset_type": "MUTUAL_FUND"},
        {"symbol": "HDFCSHORT", "expected_provider": "AMFI / Official Mutual Fund Feed", "asset_type": "MUTUAL_FUND"},
        {"symbol": "NIPPSMALL", "expected_provider": "AMFI / Official Mutual Fund Feed", "asset_type": "MUTUAL_FUND"},
        {"symbol": "ICICISAVE", "expected_provider": "AMFI / Official Mutual Fund Feed", "asset_type": "MUTUAL_FUND"},
        {"symbol": "UTI Nifty 50 Index Fund Direct", "expected_provider": "AMFI / Official Mutual Fund Feed", "asset_type": "MUTUAL_FUND"},
        {"symbol": "Parag Parikh Flexi Cap Fund Direct", "expected_provider": "AMFI / Official Mutual Fund Feed", "asset_type": "MUTUAL_FUND"}
    ]

    total_passed = 0
    total_assertions = 0

    for item in test_symbols:
        sym = item["symbol"]
        print(f"\nTesting Instrument: {sym}", flush=True)
        
        provider = market_registry.resolve_provider(sym)
        assert provider.name == item["expected_provider"], f"Expected {item['expected_provider']}, got {provider.name}"
        total_assertions += 1
        total_passed += 1
        print(f"  ✓ Provider Routing: {provider.name}", flush=True)

        # Test 1Y, 3Y, 5Y candles
        for r in ["1y", "3y", "5y"]:
            candles = market_registry.get_candles(sym, range_period=r)
            obs = candles.get("observations", [])
            total_assertions += 1
            if len(obs) >= 20:
                total_passed += 1
                first_obs = obs[0]
                last_obs = obs[-1]
                val_first = first_obs.get("nav") or first_obs.get("close")
                val_last = last_obs.get("nav") or last_obs.get("close")
                
                # Check ascending order
                assert first_obs["date"] <= last_obs["date"], f"Dates not ascending for {sym} {r}: {first_obs['date']} > {last_obs['date']}"
                total_assertions += 1
                total_passed += 1

                # Check valid positive numbers
                assert val_first > 0 and val_last > 0, f"Invalid zero price/nav for {sym} {r}"
                total_assertions += 1
                total_passed += 1

                print(f"  ✓ Range {r.upper()}: {len(obs)} observations ({first_obs['date']} [{val_first}] -> {last_obs['date']} [{val_last}])", flush=True)
            else:
                print(f"  ✗ Range {r.upper()}: Insufficient observations ({len(obs)})", flush=True)

    print("\n================================================================================", flush=True)
    print(f"HISTORICAL CHART INTEGRITY RESULTS: {total_passed}/{total_assertions} Assertions Passed ({(total_passed/total_assertions)*100:.1f}%)", flush=True)
    print("================================================================================", flush=True)

    if total_passed == total_assertions:
        print("ALL HISTORICAL CANDLE TESTS PASSED WITH 100% INTEGRITY.")
    else:
        sys.exit(1)

if __name__ == "__main__":
    test_historical_chart_pipeline()
