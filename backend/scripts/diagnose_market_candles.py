import urllib.request
import urllib.parse
import json

symbols = ['NIFTY 50', 'NIFTYBEES', 'MON100', 'GOLDBEES', 'UTI Nifty 50', 'PPFCF']
ranges = ['1y', '3y', '5y']

print("=" * 75)
print("SMARTVEST MARKET CANDLES DIRECT ENDPOINT DIAGNOSTIC")
print("=" * 75)

for sym in symbols:
    print(f"\n--- Instrument: {sym} ---")
    for r in ranges:
        encoded_sym = urllib.parse.quote(sym)
        url = f"http://localhost:8000/api/v1/market/candles/{encoded_sym}?range={r}&interval=1d"
        try:
            with urllib.request.urlopen(url, timeout=10) as resp:
                data = json.loads(resp.read().decode())
                obs = data.get("observations", [])
                freshness = data.get("freshness")
                source = data.get("source")
                msg = data.get("message", "")
                print(f"[{r.upper()}] HTTP {resp.status} | Source: {source} | Freshness: {freshness} | Obs Count: {len(obs)}")
                if obs:
                    first = obs[0]
                    last = obs[-1]
                    val_first = first.get("close") if first.get("close") is not None else first.get("nav")
                    val_last = last.get("close") if last.get("close") is not None else last.get("nav")
                    print(f"       Range: {first.get('date')} ({val_first}) -> {last.get('date')} ({val_last})")
                else:
                    print(f"       Message: {msg}")
        except Exception as e:
            print(f"[{r.upper()}] ERROR connecting to {url}: {e}")

print("\n" + "=" * 75)
