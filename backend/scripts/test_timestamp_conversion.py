"""
Regression test for Indian Market timestamp conversion and IST handling.
Verifies the exact test cases:
- 2026-09-18T10:28:33Z -> 18 Sep 2026, 03:58:33 PM IST (15:58:33)
- 2026-09-18T09:59:59Z -> 18 Sep 2026, 03:29:59 PM IST (15:29:59)
- 2026-09-18T00:00:00Z -> 18 Sep 2026, 05:30:00 AM IST (05:30:00)
And checks the target instruments:
RELIANCE, TCS, INFY, HDFCBANK, MON100, NIFTYBEES, GOLDBEES
"""
import os
import sys
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.market_data.normalizer import format_ist_timestamp, to_ist_datetime
from app.services.market_data.router import provider_router
from app.services.market_data.market_hours import get_indian_market_status

def test_regression_cases():
    print("=" * 80)
    print("1. EXACT REGRESSION CASES")
    print("=" * 80)
    
    test_cases = [
        ("2026-09-18T10:28:33Z", "15:58:33", "18 Sep 2026, 03:58:33 PM IST"),
        ("2026-09-18T09:59:59Z", "15:29:59", "18 Sep 2026, 03:29:59 PM IST"),
        ("2026-09-18T00:00:00Z", "05:30:00", "18 Sep 2026, 05:30:00 AM IST"),
    ]

    for utc_str, expected_time_24h, expected_display in test_cases:
        ist_dt = to_ist_datetime(utc_str)
        formatted = format_ist_timestamp(utc_str)
        time_24h = ist_dt.strftime("%H:%M:%S")
        
        pass_24h = (time_24h == expected_time_24h)
        pass_display = (formatted == expected_display)
        
        print(f"Input UTC:      {utc_str}")
        print(f"Converted IST:  {ist_dt.isoformat()}")
        print(f"Formatted IST:  {formatted}")
        print(f"Expected 24h:   {expected_time_24h} | Match: {pass_24h}")
        print(f"Expected Disp:  {expected_display} | Match: {pass_display}")
        print("-" * 60)
        assert pass_24h, f"Failed 24h conversion for {utc_str}: got {time_24h}, expected {expected_time_24h}"
        assert pass_display, f"Failed display conversion for {utc_str}: got {formatted}, expected {expected_display}"
    
    print("ALL REGRESSION CASES PASSED SUCCESSFULLY!\n")

def test_target_instruments():
    print("=" * 80)
    print("2. TARGET INSTRUMENTS TIMESTAMP & PROVENANCE VERIFICATION")
    print("=" * 80)

    symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "MON100", "NIFTYBEES", "GOLDBEES"]

    for sym in symbols:
        quote = provider_router.get_quote(sym)
        assert quote is not None, f"Could not fetch quote for {sym}"

        price = quote.get("price")
        utc_ts = quote.get("exchangeTimestampUtc") or quote.get("exchangeTimestamp")
        display_ist = quote.get("displayTimestampIst") or quote.get("asOf")
        freshness = quote.get("freshness")
        market_status = quote.get("marketStatus")
        is_live = quote.get("isLive")

        print(f"Instrument:             {sym}")
        print(f"  Price (INR):          {price}")
        print(f"  Raw UTC Timestamp:    {utc_ts}")
        print(f"  Converted IST:        {display_ist}")
        print(f"  Freshness:            {freshness}")
        print(f"  Market Status:        {market_status}")
        print(f"  isLive:               {is_live}")
        
        # Verify UTC timestamp has 'Z' or '+00:00'
        assert utc_ts is not None, f"Missing raw UTC timestamp for {sym}"
        assert "Z" in utc_ts or "+00:00" in utc_ts, f"UTC timestamp {utc_ts} not normalized to UTC"
        
        # Verify display IST string has 'IST'
        assert display_ist is not None and "IST" in display_ist, f"Missing IST in display timestamp {display_ist}"
        
        # Verify no double conversion (e.g. 21:xx:xx PM or 09:xx:xx PM for ~15:30 closing quote)
        # Closing quotes on 18-Sep happened between 15:00 and 16:00 IST (03:xx:xx PM IST)
        if "18 Sep 2026" in display_ist:
            assert "03:" in display_ist, f"Double conversion detected! Found {display_ist} instead of 03:xx PM IST"

        print(f"  Status:               PASS (Clean UTC & IST match, no double conversion)\n")

if __name__ == "__main__":
    test_regression_cases()
    test_target_instruments()
