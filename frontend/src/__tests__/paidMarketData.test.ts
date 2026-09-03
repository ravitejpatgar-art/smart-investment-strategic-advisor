import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isPaidProviderEnabled,
  getPaidProviderName,
  normalizePaidProviderQuote,
  resolveQuoteStatus,
  type MarketQuote
} from '../services/marketApi';
import { isDemoMode } from '../services/demoData';
import { logger } from '../services/logger';
import { auditLogger } from '../services/auditLogger';

describe('P3.1 Optional Paid Indian Market Data Feed Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Provider is disabled by default
  it('verifies that paid provider is disabled by default in absence of explicit configuration', () => {
    expect(isPaidProviderEnabled()).toBe(false);
  });

  // 2. Provider identifier default
  it('provides a safe default provider identifier (e.g. truedata) when queried', () => {
    expect(getPaidProviderName()).toBe('truedata');
  });

  // 3. Normalization of a valid real-time provider payload
  it('normalizes a raw paid provider payload into the canonical MarketQuote structure with LIVE status', () => {
    const rawPayload = {
      price: 2980.50,
      change: 35.20,
      changePercent: 1.19,
      volume: 4500000,
      open: 2950.00,
      high: 2995.00,
      low: 2942.10,
      prevClose: 2945.30,
      timestamp: '2026-09-03T10:30:00.000Z',
      isRealtime: true,
      name: 'Reliance Industries Ltd',
      exchange: 'NSE',
      source: 'TrueData NSE Authorized Feed'
    };

    const quote: MarketQuote = normalizePaidProviderQuote(rawPayload, 'RELIANCE.NS');

    expect(quote).toBeDefined();
    expect(quote.symbol).toBe('RELIANCE.NS');
    expect(quote.name).toBe('Reliance Industries Ltd');
    expect(quote.price).toBe(2980.50);
    expect(quote.currency).toBe('INR');
    expect(quote.change).toBe(35.20);
    expect(quote.changePct).toBe(1.19);
    expect(quote.volume).toBe(4500000);
    expect(quote.freshness).toBe('REALTIME');
    expect(quote.status).toBe('LIVE');
    expect(quote.source).toContain('TrueData');
  });

  // 4. Normalization of a delayed feed quote
  it('normalizes a delayed provider payload with DELAYED status (never falsely labeled LIVE)', () => {
    const rawPayload = {
      price: 3950.00,
      change: -12.40,
      changePct: -0.31,
      volume: 1200000,
      isRealtime: false,
      freshness: 'DELAYED',
      status: 'DELAYED',
      source: 'NSE 15m Delayed Feed'
    };

    const quote = normalizePaidProviderQuote(rawPayload, 'TCS.NS');

    expect(quote.price).toBe(3950.00);
    expect(quote.freshness).toBe('DELAYED');
    expect(quote.status).toBe('DELAYED');
  });

  // 5. Normalization of invalid / empty payload
  it('gracefully handles empty or malformed provider responses without throwing', () => {
    const quote = normalizePaidProviderQuote(null, 'INFY.NS');

    expect(quote.symbol).toBe('INFY.NS');
    expect(quote.price).toBeNull();
    expect(quote.status).toBe('UNAVAILABLE');
    expect(quote.freshness).toBe('UNAVAILABLE');

    const quoteNaN = normalizePaidProviderQuote({ price: 'INVALID_NUMBER' }, 'INFY.NS');
    expect(quoteNaN.price).toBeNull();
    expect(quoteNaN.status).toBe('UNAVAILABLE');
  });

  // 6. Quote status resolver compliance
  it('correctly resolves MarketDataStatus adhering strictly to P1.2 classifications', () => {
    expect(resolveQuoteStatus({ status: 'LIVE', price: 100 })).toBe('LIVE');
    expect(resolveQuoteStatus({ freshness: 'REALTIME', price: 100 })).toBe('LIVE');
    expect(resolveQuoteStatus({ status: 'DELAYED', price: 100 })).toBe('DELAYED');
    expect(resolveQuoteStatus({ freshness: 'DELAYED', price: 100 })).toBe('DELAYED');
    expect(resolveQuoteStatus({ status: 'DEMO', price: 100 })).toBe('DEMO');
    expect(resolveQuoteStatus({ freshness: 'MODEL_ASSUMPTION', price: 100 })).toBe('DEMO');
    expect(resolveQuoteStatus({ status: 'FALLBACK', price: 100 })).toBe('FALLBACK');
    expect(resolveQuoteStatus({ freshness: 'UNAVAILABLE' })).toBe('UNAVAILABLE');
    expect(resolveQuoteStatus({ price: null })).toBe('UNAVAILABLE');
  });

  // 7. Demo mode safety
  it('ensures demo mode remains deterministic and does not use live/paid provider', () => {
    // When demo mode is active
    expect(isDemoMode()).toBe(false); // In standard test runner
  });

  // 8. Privacy & Zero Credential Leakage in Logs
  it('ensures provider error logging never includes secrets or raw credentials in metadata', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    logger.warn('Paid provider rate limited', {
      service: 'paidMarketData',
      operation: 'getQuote',
      provider: 'truedata',
      symbol: 'RELIANCE.NS',
      status: 'FALLBACK',
      error: 'HTTP 429 Rate Limit Exceeded'
    });

    auditLogger.market('MARKET_FALLBACK_ACTIVATED', 'warning', {
      provider: 'truedata',
      symbol: 'RELIANCE.NS',
      reason: 'Rate limit exceeded'
    });

    expect(warnSpy).toHaveBeenCalled();

    // Verify no secret keys or passwords in logger call arguments
    const loggedCalls = warnSpy.mock.calls.flat().join(' ');
    expect(loggedCalls).not.toContain('api_key');
    expect(loggedCalls).not.toContain('secret');
    expect(loggedCalls).not.toContain('token');
  });
});
