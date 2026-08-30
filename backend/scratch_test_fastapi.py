import sys
import os
sys.path.insert(0, os.path.abspath('.'))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
symbols = [
    'MON100',
    'GOLDBEES',
    'NIFTYBEES',
    'NIFTY50',
    'PPFCF',
    'RELIANCE',
    'AAPL',
    'UTI Nifty 50 Index Fund Direct',
    'Parag Parikh Flexi Cap Fund Direct',
    'NIFTY 50',
    '^NSEI'
]

print("=== FASTAPI TEST CLIENT CANDLES API TEST ===")
for s in symbols:
    res = client.get(f'/api/v1/market/candles/{s}?range=3y&interval=1d')
    data = res.json()
    obs = data.get('observations', [])
    print(f"{s:<35} -> HTTP {res.status_code} | observations: {len(obs)} | source: {data.get('source')} | freshness: {data.get('freshness')}")
