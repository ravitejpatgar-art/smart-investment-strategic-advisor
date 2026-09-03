import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { MarketInstrument, MarketStatusResponse } from '../services/marketApi';
import {
  isDemoMode,
  DEMO_INSTRUMENTS,
  DEMO_COVERAGE,
  DEMO_MARKET_OVERVIEW,
  DEMO_MARKET_STATUS,
  getDemoQuote,
  getDemoInstruments,
  getDemoResearch
} from '../services/demoData';

describe('SmartVest Demo Mode & Deterministic Data', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('detects demo mode via URL search param ?demo=true', () => {
    window.history.pushState({}, '', '/dashboard?demo=true');
    expect(isDemoMode()).toBe(true);

    window.history.pushState({}, '', '/dashboard');
    expect(isDemoMode()).toBe(false);
  });

  it('detects demo mode via localStorage override', () => {
    expect(isDemoMode()).toBe(false);
    localStorage.setItem('smartvest_demo_mode', 'true');
    expect(isDemoMode()).toBe(true);
  });

  it('provides complete demo coverage and market status structures', () => {
    expect(DEMO_COVERAGE.total_instruments).toBeGreaterThan(1000);
    expect(DEMO_COVERAGE.exchanges).toContain('NSE');
    expect(DEMO_COVERAGE.exchanges).toContain('NASDAQ');

    expect(DEMO_MARKET_STATUS.length).toBeGreaterThanOrEqual(2);
    expect(DEMO_MARKET_STATUS.some((s: MarketStatusResponse) => s.market === 'INDIA')).toBe(true);
    expect(DEMO_MARKET_STATUS.some((s: MarketStatusResponse) => s.market === 'US')).toBe(true);

    expect(DEMO_MARKET_OVERVIEW.indices.length).toBeGreaterThanOrEqual(2);
  });

  it('contains essential benchmark assets across asset classes in DEMO_INSTRUMENTS', () => {
    const symbols = DEMO_INSTRUMENTS.map((i: MarketInstrument) => i.symbol);
    expect(symbols).toContain('NIFTY 50');
    expect(symbols).toContain('SENSEX');
    expect(symbols).toContain('S&P 500');
    expect(symbols).toContain('NASDAQ');
    expect(symbols).toContain('RELIANCE.NS');
    expect(symbols).toContain('AAPL');
    expect(symbols).toContain('GOLDBEES.NS');
    expect(symbols).toContain('122639');
    expect(symbols).toContain('GOLD (10g)');
  });

  it('returns valid deterministic quotes via getDemoQuote', () => {
    const nifty = getDemoQuote('NIFTY 50');
    expect(nifty.symbol).toBe('NIFTY 50');
    expect(nifty.price).toBeGreaterThan(20000);
    expect(nifty.currency).toBe('INR');
    expect(nifty.freshness).toBe('MODEL_ASSUMPTION');
    expect(nifty.source).toBe('Deterministic Demo Market Feed');

    const apple = getDemoQuote('AAPL');
    expect(apple.symbol).toBe('AAPL');
    expect(apple.price).toBeGreaterThan(100);
    expect(apple.currency).toBe('USD');
  });

  it('filters demo instruments correctly with query, assetType, and pagination', () => {
    const all = getDemoInstruments();
    expect(all.items.length).toBeGreaterThan(0);
    expect(all.total).toBe(DEMO_INSTRUMENTS.length);

    const stocksOnly = getDemoInstruments({ asset_type: 'STOCK' });
    expect(stocksOnly.items.every((i: MarketInstrument) => i.assetType === 'STOCK')).toBe(true);

    const queryMatch = getDemoInstruments({ q: 'reliance' });
    expect(queryMatch.items.some((i: MarketInstrument) => i.symbol === 'RELIANCE.NS')).toBe(true);
  });

  it('returns research bundle with fundamentals and technicals', () => {
    const research = getDemoResearch('INFY.NS');
    expect(research.quote).toBeDefined();
    expect(research.fundamentals?.peRatio).toBeGreaterThan(0);
    expect(research.technicals?.rsi).toBeGreaterThan(0);
  });
});
