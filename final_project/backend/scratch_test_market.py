import sys
import os
sys.path.insert(0, os.path.abspath('.'))

from app.services.market_data.registry import market_registry

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

print("="*80)
for s in symbols:
    provider = market_registry.resolve_provider(s)
    quote = market_registry.get_quote(s)
    candles_1y = market_registry.get_candles(s, range_period='1y')
    candles_3y = market_registry.get_candles(s, range_period='3y')
    candles_5y = market_registry.get_candles(s, range_period='5y')
    print(f"Symbol: {s:<35} | Provider: {provider.name:<30}")
    print(f"   Quote: {quote.get('price')} {quote.get('currency')} | Freshness: {quote.get('freshness')} | Source: {quote.get('source')}")
    print(f"   Candles 1Y: {len(candles_1y.get('observations', []))} pts | 3Y: {len(candles_3y.get('observations', []))} pts | 5Y: {len(candles_5y.get('observations', []))} pts | Source: {candles_3y.get('source')}")
    if candles_3y.get('observations'):
        print(f"   First: {candles_3y['observations'][0]} | Last: {candles_3y['observations'][-1]}")
    print("-" * 80)
