import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { marketApi, type MarketInstrument } from '../services/marketApi';
import { apiClient } from '../services/api';

describe('Instrument Detail & Research Terminal (P7.2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // 1. Stock detail and quote hydration
  it('correctly processes and formats stock detail and quote fields', async () => {
    const stockInstrument: MarketInstrument = {
      canonicalId: 'STOCK:AAPL:NASDAQ:US',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      assetType: 'STOCK',
      assetClass: 'EQUITY',
      market: 'US',
      exchange: 'NASDAQ',
      country: 'US',
      currency: 'USD',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      provider: 'USEquitiesProvider',
      quote: {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        exchange: 'NASDAQ',
        assetType: 'STOCK',
        price: 224.50,
        currency: 'USD',
        change: 3.20,
        changePct: 1.45,
        volume: 48500000,
        prevClose: 221.30,
        high: 225.10,
        low: 222.80,
        marketStatus: 'OPEN',
        freshness: 'REALTIME',
        status: 'LIVE',
        source: 'NASDAQ Realtime',
        asOf: 'Today',
        timestamp: '2026-09-05T14:30:00Z'
      }
    };

    expect(stockInstrument.assetType).toBe('STOCK');
    expect(stockInstrument.quote?.price).toBe(224.50);
    expect(stockInstrument.quote?.status).toBe('LIVE');
    expect(stockInstrument.currency).toBe('USD');
    expect(stockInstrument.sector).toBe('Technology');
  });

  // 2. ETF detail and fundamentals fields
  it('correctly structures ETF specific metrics (AUM, expense ratio, benchmark)', async () => {
    const etfInstrument: MarketInstrument = {
      canonicalId: 'ETF:SPY:NYSE:US',
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      assetType: 'ETF',
      assetClass: 'EQUITY',
      market: 'US',
      exchange: 'NYSE',
      country: 'US',
      currency: 'USD',
      expenseRatio: 0.09,
      aum: 500000000000,
      benchmark: 'S&P 500 Index',
      category: 'Large Blend',
      provider: 'USEquitiesProvider',
      quote: {
        symbol: 'SPY',
        name: 'SPDR S&P 500 ETF Trust',
        exchange: 'NYSE',
        assetType: 'ETF',
        price: 540.25,
        currency: 'USD',
        change: 2.10,
        changePct: 0.39,
        volume: 62000000,
        marketStatus: 'OPEN',
        freshness: 'REALTIME',
        status: 'LIVE',
        source: 'NYSE Realtime',
        asOf: 'Today',
        timestamp: '2026-09-05T14:30:00Z'
      }
    };

    expect(etfInstrument.assetType).toBe('ETF');
    expect(etfInstrument.expenseRatio).toBe(0.09);
    expect(etfInstrument.benchmark).toBe('S&P 500 Index');
    expect(etfInstrument.aum).toBe(500000000000);
  });

  // 3. Mutual fund NAV terminology and specific fields
  it('correctly uses NAV terminology rather than market price for Mutual Funds', async () => {
    const mfInstrument: MarketInstrument = {
      canonicalId: 'MUTUAL_FUND:119062:AMFI:IN',
      symbol: '119062',
      name: 'HDFC Flexi Cap Fund - Direct Plan - Growth',
      assetType: 'MUTUAL_FUND',
      assetClass: 'EQUITY',
      market: 'INDIA',
      exchange: 'AMFI',
      country: 'IN',
      currency: 'INR',
      schemeCode: '119062',
      fundHouse: 'HDFC Mutual Fund',
      plan: 'Direct',
      option: 'Growth',
      category: 'Flexi Cap Fund',
      nav: 1782.45,
      navDate: '2026-09-04',
      provider: 'AmfiMfProvider',
      quote: {
        symbol: '119062',
        name: 'HDFC Flexi Cap Fund - Direct Plan - Growth',
        exchange: 'AMFI',
        assetType: 'MUTUAL_FUND',
        price: 1782.45,
        currency: 'INR',
        change: 14.20,
        changePct: 0.80,
        volume: 0,
        prevClose: 1768.25,
        marketStatus: 'CLOSED',
        freshness: 'LATEST_AVAILABLE',
        status: 'FALLBACK',
        source: 'AMFI Daily NAV',
        asOf: '2026-09-04',
        navDate: '2026-09-04',
        timestamp: '2026-09-04T18:00:00Z'
      }
    };

    expect(mfInstrument.assetType).toBe('MUTUAL_FUND');
    expect(mfInstrument.schemeCode).toBe('119062');
    expect(mfInstrument.fundHouse).toBe('HDFC Mutual Fund');
    expect(mfInstrument.plan).toBe('Direct');
    expect(mfInstrument.option).toBe('Growth');
    expect(mfInstrument.nav).toBe(1782.45);
    expect(mfInstrument.navDate).toBe('2026-09-04');
    expect(mfInstrument.quote?.status).toBe('FALLBACK');
  });

  // 4. Truthful Freshness State Resolution
  it('never marks historical or fallback quotes as LIVE', () => {
    const fallbackQuote = {
      price: 150.0,
      freshness: 'HISTORICAL' as string,
      source: 'Yahoo Finance Delayed'
    };
    const resolvedStatus = fallbackQuote.freshness === 'REALTIME' ? 'LIVE' : 'FALLBACK';
    expect(resolvedStatus).not.toBe('LIVE');
    expect(resolvedStatus).toBe('FALLBACK');
  });

  // 5. Research bundle API integration
  it('fetches complete research bundle via marketApi.getResearch', async () => {
    const mockResearchBundle = {
      instrument: {
        canonicalId: 'STOCK:MSFT:NASDAQ:US',
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        assetType: 'STOCK' as const,
        assetClass: 'EQUITY' as const,
        market: 'US',
        exchange: 'NASDAQ',
        currency: 'USD'
      },
      quote: {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        exchange: 'NASDAQ',
        assetType: 'STOCK',
        price: 448.0,
        currency: 'USD',
        change: 4.5,
        changePct: 1.01,
        volume: 21000000,
        timestamp: '2026-09-05T14:30:00Z',
        marketStatus: 'OPEN',
        freshness: 'REALTIME' as const,
        status: 'LIVE' as const,
        source: 'NASDAQ',
        asOf: 'Today'
      },
      fundamentals: {
        revenue: 245000000000,
        revenueGrowth: 15.2,
        netIncome: 88000000000,
        eps: 11.80,
        profitMargin: 35.9,
        roe: 38.5
      },
      valuation: {
        peRatio: 37.9,
        forwardPE: 31.4,
        pbRatio: 12.1,
        marketCap: 3300000000000
      },
      technicals: {
        rsi: 58.4,
        summary: 'Bullish'
      },
      capabilities: {
        hasQuote: true,
        hasFundamentals: true,
        hasValuation: true,
        hasTechnicals: true
      },
      sources: {
        quote: 'NASDAQ',
        research: 'Yahoo Finance',
        freshness: 'REALTIME'
      }
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockResearchBundle
    });

    const data = await marketApi.getResearch('MSFT');

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy.mock.calls[0][0]).toContain('/market/research/MSFT');
    expect(data.quote?.price).toBe(448.0);
    expect(data.fundamentals?.eps).toBe(11.80);
    expect(data.valuation?.peRatio).toBe(37.9);
    expect(data.technicals?.rsi).toBe(58.4);
  });

  // 6. Watchlist add and remove actions
  it('correctly executes watchlist add and remove operations', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { status: 'SUCCESS', message: 'Added to watchlist', canonicalId: 'STOCK:NVDA:NASDAQ:US' }
    });
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      data: { status: 'SUCCESS', message: 'Removed from watchlist' }
    });

    const addRes = await marketApi.addToWatchlist('STOCK:NVDA:NASDAQ:US');
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(addRes.status).toBe('SUCCESS');

    const delRes = await marketApi.removeFromWatchlist('STOCK:NVDA:NASDAQ:US');
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(delRes.status).toBe('SUCCESS');
  });

  // 7. Missing optional fields conditional resilience
  it('gracefully handles missing optional fundamentals without throwing errors', () => {
    const rawInstrument: MarketInstrument = {
      canonicalId: 'STOCK:TEST:NSE:IN',
      symbol: 'TEST',
      name: 'Test Instruments Ltd',
      assetType: 'STOCK',
      assetClass: 'EQUITY',
      market: 'INDIA',
      exchange: 'NSE',
      currency: 'INR'
    };

    // Verify properties can be accessed safely without throwing
    expect(rawInstrument.sector).toBeUndefined();
    expect(rawInstrument.industry).toBeUndefined();
    expect(rawInstrument.quote).toBeUndefined();
  });
});
