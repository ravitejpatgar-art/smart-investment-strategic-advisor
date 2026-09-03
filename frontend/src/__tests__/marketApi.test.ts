import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { marketApi } from '../services/marketApi';
import { apiClient } from '../services/api';

describe('Market API & Fallback Resilience', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('serves deterministic quotes when demo mode is active', async () => {
    localStorage.setItem('smartvest_demo_mode', 'true');
    const quote = await marketApi.getQuote('NIFTY 50');
    expect(quote.symbol).toBe('NIFTY 50');
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.source).toContain('Deterministic Demo');
  });

  it('gracefully falls back when backend network call rejects', async () => {
    // Mock apiClient to simulate offline/failed backend API
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Network offline in CI'));

    const quote = await marketApi.getQuote('RELIANCE.NS');
    expect(quote).toBeDefined();
    expect(quote.symbol).toBe('RELIANCE.NS');
    expect(quote.price).toBeGreaterThan(0);
    expect(typeof quote.price).toBe('number');
  });

  it('resolves batch quotes reliably without throwing uncaught rejections', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Batch endpoint offline'));

    const quotes = await marketApi.getQuotes(['NIFTY 50', 'SENSEX', 'AAPL']);
    expect(quotes['NIFTY 50']).toBeDefined();
    expect(quotes['SENSEX']).toBeDefined();
    expect(quotes['AAPL']).toBeDefined();
    expect(quotes['NIFTY 50'].price).toBeGreaterThan(0);
  });

  it('generates non-empty historical candles with valid numeric observations', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Candles endpoint offline'));

    const candles = await marketApi.getCandles('NIFTY 50', '1y', '1d');
    expect(candles.symbol).toBe('NIFTY 50');
    expect(candles.observations.length).toBeGreaterThan(0);

    const first = candles.observations[0];
    expect(first.date).toBeDefined();
    expect(first.open).toBeGreaterThan(0);
    expect(first.high).toBeGreaterThanOrEqual(first.low);
    expect(first.close).toBeGreaterThan(0);
    expect(typeof first.volume).toBe('number');
  });

  it('returns valid instruments list on network failure instead of crashing', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Instruments directory offline'));

    const response = await marketApi.getInstruments({ assetType: 'EQUITY' });
    expect(response).toBeDefined();
    expect(Array.isArray(response.items)).toBe(true);
    expect(response.items.length).toBeGreaterThan(0);
  });
});
