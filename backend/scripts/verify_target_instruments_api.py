import sys
sys.path.insert(0, '.')
from fastapi.testclient import TestClient
from app.main import app

c = TestClient(app)
queries = [
    'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'ITC',
    'MON100', 'NIFTYBEES', 'GOLDBEES', 'BANKBEES', 'JUNIORBEES',
    'HDFC Flexi Cap', 'Parag Parikh Flexi Cap'
]

print("=" * 80)
print("VERIFYING TARGET INSTRUMENTS FROM BACKEND API")
print("=" * 80)

for q in queries:
    res = c.get(f'/api/v1/market/instruments?q={q}&limit=5').json()
    items = res.get('items', [])
    total = res.get('total', 0)
    print(f"\nQuery: '{q}' -> Total Found: {total}")
    if items:
        it = items[0]
        quote = it.get('quote') or {}
        print(f"  Symbol:            {it.get('symbol')}")
        print(f"  Name:              {it.get('name')}")
        print(f"  Exchange:          {it.get('exchange')}")
        print(f"  AssetType:         {it.get('assetType')}")
        print(f"  Price/NAV:         {quote.get('price')}")
        print(f"  Change %:          {quote.get('changePct')}")
        print(f"  Source/Provider:   {quote.get('source')}")
        print(f"  Freshness:         {quote.get('freshness')}")
        print(f"  Timestamp:         {quote.get('exchangeTimestamp') or quote.get('timestamp')}")
        print(f"  isLive:            {quote.get('isLive')}")
        print(f"  isStale:           {quote.get('isStale')}")
        print(f"  navDate:           {quote.get('navDate')}")
    else:
        print("  NO ITEMS RETURNED!")
