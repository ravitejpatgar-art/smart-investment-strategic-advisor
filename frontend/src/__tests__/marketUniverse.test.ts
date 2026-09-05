import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { marketApi } from '../services/marketApi';
import { apiClient } from '../services/api';

describe('Global Market Universe & Explorer API (P7.0B)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // 1. Query parameter generation for search, asset_type, exchange, country, page, limit
  it('generates correct query parameters when calling getInstruments', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        items: [
          {
            symbol: 'NVDA',
            name: 'NVIDIA Corporation',
            asset_type: 'STOCK',
            exchange: 'NASDAQ',
            country: 'US',
            currency: 'USD',
            price: 125.5,
            change: 2.3,
            change_pct: 1.86,
            is_active: true
          }
        ],
        total: 1,
        page: 1,
        limit: 25,
        has_next: false,
        has_prev: false
      }
    });

    const result = await marketApi.getInstruments({
      q: 'NVDA',
      asset_type: 'STOCK',
      exchange: 'NASDAQ',
      country: 'US',
      page: 1,
      limit: 25
    });

    expect(getSpy).toHaveBeenCalledTimes(1);
    const calledUrl = getSpy.mock.calls[0][0];
    expect(calledUrl).toContain('/market/instruments');
    expect(calledUrl).toContain('q=NVDA');
    expect(calledUrl).toContain('asset_type=STOCK');
    expect(calledUrl).toContain('exchange=NASDAQ');
    expect(calledUrl).toContain('country=US');
    expect(calledUrl).toContain('page=1');
    expect(calledUrl).toContain('limit=25');

    expect(result.items.length).toBe(1);
    expect(result.items[0].symbol).toBe('NVDA');
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
  });

  // 2. Type filters (STOCK, ETF, MUTUAL_FUND)
  it('supports asset type filtering correctly', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        items: [
          {
            symbol: 'SPY',
            name: 'SPDR S&P 500 ETF Trust',
            asset_type: 'ETF',
            exchange: 'NYSE',
            country: 'US',
            currency: 'USD',
            price: 540.0,
            is_active: true
          }
        ],
        total: 1,
        page: 1,
        limit: 25,
        has_next: false,
        has_prev: false
      }
    });

    const result = await marketApi.getInstruments({ asset_type: 'ETF' });
    const calledUrl = getSpy.mock.calls[0][0];
    expect(calledUrl).toContain('asset_type=ETF');
    expect(result.items[0].assetType).toBe('ETF');
  });

  // 3. Exchange filter
  it('supports exchange filtering (NSE, NASDAQ, AMFI)', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        items: [
          {
            symbol: 'TCS.NS',
            name: 'Tata Consultancy Services',
            asset_type: 'STOCK',
            exchange: 'NSE',
            country: 'IN',
            currency: 'INR',
            price: 4200.0,
            is_active: true
          }
        ],
        total: 1,
        page: 1,
        limit: 25,
        has_next: false,
        has_prev: false
      }
    });

    const result = await marketApi.getInstruments({ exchange: 'NSE' });
    const calledUrl = getSpy.mock.calls[0][0];
    expect(calledUrl).toContain('exchange=NSE');
    expect(result.items[0].exchange).toBe('NSE');
  });

  // 4. Country filter
  it('supports country filtering (IN, US, GB)', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        items: [
          {
            symbol: 'INFY.NS',
            name: 'Infosys Limited',
            asset_type: 'STOCK',
            exchange: 'NSE',
            country: 'IN',
            currency: 'INR',
            is_active: true
          }
        ],
        total: 1,
        page: 1,
        limit: 25,
        has_next: false,
        has_prev: false
      }
    });

    const result = await marketApi.getInstruments({ country: 'IN' });
    const calledUrl = getSpy.mock.calls[0][0];
    expect(calledUrl).toContain('country=IN');
    expect(result.items[0].country).toBe('IN');
  });

  // 5. Pagination and Result Count
  it('supports pagination parameters and metadata', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        items: [
          { symbol: 'AAPL', name: 'Apple Inc.', asset_type: 'STOCK', exchange: 'NASDAQ', country: 'US', currency: 'USD' },
          { symbol: 'MSFT', name: 'Microsoft Corporation', asset_type: 'STOCK', exchange: 'NASDAQ', country: 'US', currency: 'USD' }
        ],
        total: 150,
        page: 3,
        limit: 2,
        has_next: true,
        has_prev: true
      }
    });

    const result = await marketApi.getInstruments({ page: 3, limit: 2 });
    const calledUrl = getSpy.mock.calls[0][0];
    expect(calledUrl).toContain('page=3');
    expect(calledUrl).toContain('limit=2');
    expect(result.items.length).toBe(2);
    expect(result.total).toBe(150);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(2);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrev).toBe(true);
  });

  // 6. Mutual Fund scheme fields (schemeCode, plan, option, nav, navDate)
  it('correctly maps Mutual Fund scheme fields from API response', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        items: [
          {
            symbol: 'AMFI:122639',
            name: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
            asset_type: 'MUTUAL_FUND',
            exchange: 'AMFI',
            country: 'IN',
            currency: 'INR',
            scheme_code: '122639',
            fund_house: 'PPFAS Mutual Fund',
            plan: 'Direct',
            option: 'Growth',
            nav: 78.45,
            nav_date: '05-Sep-2026',
            is_active: true
          }
        ],
        total: 1,
        page: 1,
        limit: 25,
        has_next: false,
        has_prev: false
      }
    });

    const result = await marketApi.getInstruments({ q: 'Parag Parikh' });
    expect(result.items.length).toBe(1);
    const mf = result.items[0];
    expect(mf.assetType).toBe('MUTUAL_FUND');
    expect(mf.schemeCode).toBe('122639');
    expect(mf.fundHouse).toBe('PPFAS Mutual Fund');
    expect(mf.plan).toBe('Direct');
    expect(mf.option).toBe('Growth');
    expect(mf.nav).toBe(78.45);
    expect(mf.navDate).toBe('05-Sep-2026');
  });

  // 7. Fallback behavior when API call fails
  it('falls back to local curated instruments on API error', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Network error'));

    const result = await marketApi.getInstruments({ q: 'Apple' });
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].symbol).toBe('AAPL');
    expect(result.total).toBeGreaterThan(0);
  });

  // 8. Currency filtering (P7.3)
  it('supports currency filtering in query parameters', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        items: [
          { symbol: 'AAPL', name: 'Apple Inc.', asset_type: 'STOCK', currency: 'USD' }
        ],
        total: 1,
        page: 1,
        limit: 25
      }
    });

    const result = await marketApi.getInstruments({ currency: 'USD' });
    const calledUrl = getSpy.mock.calls[0][0];
    expect(calledUrl).toContain('currency=USD');
    expect(result.items[0].currency).toBe('USD');
  });

  // 9. Market Coverage Telemetry (P7.3)
  it('fetches institutional market coverage statistics', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        total_instruments: 16921,
        stocks_count: 2562,
        etfs_count: 24,
        mutual_funds_count: 14329,
        indices_count: 6,
        by_asset_type: {
          STOCK: 2562,
          ETF: 24,
          MUTUAL_FUND: 14329,
          INDEX: 4,
          COMMODITY: 2
        },
        exchanges_count: 8,
        countries_count: 7,
        last_synced_at: '2026-09-05T12:00:00Z'
      }
    });

    const coverage = await marketApi.getCoverage();
    expect(getSpy).toHaveBeenCalledWith('/market/coverage');
    expect(coverage.total_instruments).toBe(16921);
    expect(coverage.stocks_count).toBe(2562);
    expect(coverage.mutual_funds_count).toBe(14329);
    expect(coverage.exchanges_count).toBe(8);
  });
});
