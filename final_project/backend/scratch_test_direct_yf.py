import urllib.request
import json

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

symbols = ['MON100.NS', 'GOLDBEES.NS', 'NIFTYBEES.NS', 'RELIANCE.NS', 'AAPL', '^NSEI']

for sym in symbols:
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?range=3y&interval=1d"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            result = data.get('chart', {}).get('result', [])
            if result:
                meta = result[0].get('meta', {})
                timestamps = result[0].get('timestamp', [])
                indicators = result[0].get('indicators', {}).get('quote', [{}])[0]
                closes = indicators.get('close', [])
                valid_closes = [c for c in closes if c is not None]
                print(f"SUCCESS for {sym}: currency={meta.get('currency')}, points={len(timestamps)}, valid_closes={len(valid_closes)}, first={valid_closes[0] if valid_closes else None}, last={valid_closes[-1] if valid_closes else None}")
            else:
                print(f"NO RESULT for {sym}:", data)
    except Exception as e:
        print(f"FAILED for {sym}:", e)
