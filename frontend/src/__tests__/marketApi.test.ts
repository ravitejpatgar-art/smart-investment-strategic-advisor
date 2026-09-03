import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { marketApi, resolveQuoteStatus } from '../services/marketApi';
import { apiClient } from '../services/api';

describe('Market API & Fallback Resilience (P1.2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // 1. Successful live quote is returned as live
  it('returns successful live quote as LIVE with accurate metadata', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        symbol: 'TCS.NS',
        name: 'Tata Consultancy Services',
        exchange: 'NSE',
        assetType: 'STOCK',
        price: 4250.0,
        currency: 'INR',
        change: 35.0,
        changePct: 0.83,
        volume: 1200000,
        timestamp: new Date().toISOString(),
        marketStatus: 'OPEN',
        freshness: 'REALTIME',
        status: 'LIVE',
        source: 'Backend Live Market Engine',
        asOf: 'Today'
      }
    });

    const quote = await marketApi.getQuote('TCS.NS');
    expect(quote).toBeDefined();
    expect(quote.symbol).toBe('TCS.NS');
    expect(quote.price).toBe(4250.0);
    expect(quote.status).toBe('LIVE');
    expect(quote.freshness).toBe('REALTIME');
    expect(quote.source).toContain('Backend Live');
  });

  // 2. Live quote failure falls back safely
  it('gracefully falls back when backend network call rejects without throwing uncaught errors', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Network offline in CI'));

    const quote = await marketApi.getQuote('RELIANCE.NS');
    expect(quote).toBeDefined();
    expect(quote.symbol).toBe('RELIANCE.NS');
    expect(quote.price).toBeGreaterThan(0);
    expect(typeof quote.price).toBe('number');
    expect(isNaN(quote.price!)).toBe(false);
  });

  // 3. Fallback quote contains correct status/source metadata
  it('fallback quote contains correct status and source metadata', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Backend API 500 error'));

    const quote = await marketApi.getQuote('RELIANCE.NS');
    expect(quote.status).toBe('FALLBACK');
    expect(quote.source).toContain('Fallback Market Baseline');
    expect(quote.freshness).toBe('LATEST_AVAILABLE');
    expect(quote.message).toContain('Latest available');
  });

  // 4. One failed quote does not break batch quotes
  it('resolves batch quotes reliably when some or all quotes fail', async () => {
    // Simulate batch endpoint failing
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/market/quotes')) {
        throw new Error('Batch endpoint timeout');
      }
      if (url.includes('AAPL')) {
        return {
          data: {
            symbol: 'AAPL',
            name: 'Apple Inc.',
            exchange: 'NASDAQ',
            assetType: 'STOCK',
            price: 228.0,
            currency: 'USD',
            change: 1.5,
            changePct: 0.66,
            volume: 45000000,
            timestamp: new Date().toISOString(),
            marketStatus: 'OPEN',
            freshness: 'REALTIME',
            status: 'LIVE',
            source: 'Backend Live Market Engine',
            asOf: 'Today'
          }
        };
      }
      throw new Error('Individual symbol offline');
    });

    const quotes = await marketApi.getQuotes(['AAPL', 'NIFTY 50', 'SENSEX']);
    expect(quotes['AAPL']).toBeDefined();
    expect(quotes['AAPL'].status).toBe('LIVE');
    expect(quotes['AAPL'].price).toBe(228.0);

    expect(quotes['NIFTY 50']).toBeDefined();
    expect(quotes['NIFTY 50'].price).toBeGreaterThan(0);
    expect(quotes['NIFTY 50'].status).toBe('FALLBACK');

    expect(quotes['SENSEX']).toBeDefined();
    expect(quotes['SENSEX'].price).toBeGreaterThan(0);
    expect(quotes['SENSEX'].status).toBe('FALLBACK');
  });

  // 5. Historical API failure uses safe fallback where configured
  it('uses safe fallback for historical candles when backend API rejects', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Candles endpoint offline'));

    const candles = await marketApi.getCandles('NIFTY 50', '1y', '1d');
    expect(candles).toBeDefined();
    expect(candles.symbol).toBe('NIFTY 50');
    expect(candles.status).toBe('FALLBACK');
    expect(candles.source).toContain('Fallback Historical Model');
    expect(candles.freshness).toBe('LATEST_AVAILABLE');
  });

  // 6. Historical fallback has valid OHLCV values
  it('generates non-empty historical fallback candles with valid numeric OHLCV values', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Candles 503 Service Unavailable'));

    const candles = await marketApi.getCandles('S&P 500', '1y', '1d');
    expect(candles.observations.length).toBeGreaterThan(0);

    for (const obs of candles.observations) {
      expect(obs.date).toBeDefined();
      expect(typeof obs.open).toBe('number');
      expect(obs.open).toBeGreaterThan(0);
      expect(typeof obs.high).toBe('number');
      expect(typeof obs.low).toBe('number');
      expect(obs.high).toBeGreaterThanOrEqual(obs.low);
      expect(typeof obs.close).toBe('number');
      expect(obs.close).toBeGreaterThan(0);
      expect(typeof obs.volume).toBe('number');
      expect(isNaN(obs.volume)).toBe(false);
    }
  });

  // 7. Instrument-directory failure falls back safely
  it('returns valid instruments directory on network failure preserving asset_type filters', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Instruments directory offline'));

    const stockResponse = await marketApi.getInstruments({ asset_type: 'STOCK' });
    expect(stockResponse).toBeDefined();
    expect(Array.isArray(stockResponse.items)).toBe(true);
    expect(stockResponse.items.length).toBeGreaterThan(0);
    expect(stockResponse.items.every(i => i.assetType === 'STOCK')).toBe(true);

    const queryResponse = await marketApi.getInstruments({ q: 'nifty' });
    expect(queryResponse.items.some(i => i.symbol.toLowerCase().includes('nifty') || i.name.toLowerCase().includes('nifty'))).toBe(true);
  });

  // 8. Missing benchmark does not break the remaining benchmarks
  it('ensures missing or failed benchmark does not break remaining benchmarks in overview', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Overview offline'));

    const overview = await marketApi.getOverview();
    expect(overview).toBeDefined();
    expect(Array.isArray(overview.indices)).toBe(true);
    expect(overview.indices.length).toBeGreaterThanOrEqual(4);
    expect(overview.status).toBe('FALLBACK');

    const symbols = overview.indices.map((idx: any) => idx.symbol);
    expect(symbols).toContain('NIFTY 50');
    expect(symbols).toContain('SENSEX');
    expect(symbols).toContain('S&P 500');
    expect(symbols).toContain('NASDAQ');
  });

  // 9. Demo Mode still returns deterministic demo data
  it('returns deterministic demo data with status DEMO when demo mode is active', async () => {
    localStorage.setItem('smartvest_demo_mode', 'true');

    const quote = await marketApi.getQuote('NIFTY 50');
    expect(quote.symbol).toBe('NIFTY 50');
    expect(quote.price).toBeGreaterThan(20000);
    expect(quote.status).toBe('DEMO');
    expect(quote.freshness).toBe('MODEL_ASSUMPTION');
    expect(quote.source).toContain('Deterministic Demo');

    const candles = await marketApi.getCandles('NIFTY 50', '1y', '1d');
    expect(candles.status).toBe('DEMO');
    expect(candles.source).toContain('Deterministic Demo');
    expect(candles.freshness).toBe('MODEL_ASSUMPTION');
  });

  // 10. No fake "live" status is assigned to fallback/demo data
  it('never assigns fake LIVE status to fallback or demo quotes', async () => {
    // A. Demo data check
    localStorage.setItem('smartvest_demo_mode', 'true');
    const demoQuote = await marketApi.getQuote('AAPL');
    expect(demoQuote.status).not.toBe('LIVE');
    expect(demoQuote.freshness).not.toBe('REALTIME');
    expect(demoQuote.status).toBe('DEMO');

    // B. Fallback data check
    localStorage.clear();
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Offline backend'));
    const fallbackQuote = await marketApi.getQuote('AAPL');
    expect(fallbackQuote.status).not.toBe('LIVE');
    expect(fallbackQuote.freshness).not.toBe('REALTIME');
    expect(fallbackQuote.status).toBe('FALLBACK');

    // C. Helper resolution check
    expect(resolveQuoteStatus({ freshness: 'MODEL_ASSUMPTION', source: 'Deterministic Demo' })).toBe('DEMO');
    expect(resolveQuoteStatus({ freshness: 'LATEST_AVAILABLE', source: 'Fallback Market Baseline' })).toBe('FALLBACK');
    expect(resolveQuoteStatus({ price: null })).toBe('UNAVAILABLE');
    expect(resolveQuoteStatus({ freshness: 'UNAVAILABLE' })).toBe('UNAVAILABLE');
  });
});
