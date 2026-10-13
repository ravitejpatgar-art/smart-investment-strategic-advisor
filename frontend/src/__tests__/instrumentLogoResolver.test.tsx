import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { 
  normalizeSymbol, 
  resolveInstrumentLogo,
  buildLogoDevUrl,
  buildLogoDevTickerUrl,
  buildBrandfetchUrl,
  reportMissingLogo,
  getReportedMissingLogos,
  clearReportedMissingLogos
} from '../utils/instrumentLogoResolver';
import { InstrumentLogo } from '../components/market/InstrumentLogo';

// Enable React act environment for clean assertions
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('Instrument Logo Resolver & Normalization', () => {
  beforeEach(() => {
    clearReportedMissingLogos();
  });

  describe('Symbol Normalization', () => {
    it('normalizes Indian NSE stocks by stripping .NS', () => {
      const res = normalizeSymbol('RELIANCE.NS');
      expect(res.cleanSymbol).toBe('RELIANCE');
      expect(res.exchangeSuffix).toBe('NS');
      expect(res.isAmfi).toBe(false);
    });

    it('normalizes Indian BSE stocks by stripping .BO and .BSE', () => {
      const res1 = normalizeSymbol('TCS.BO');
      expect(res1.cleanSymbol).toBe('TCS');
      expect(res1.exchangeSuffix).toBe('BO');

      const res2 = normalizeSymbol('INFY.BSE');
      expect(res2.cleanSymbol).toBe('INFY');
      expect(res2.exchangeSuffix).toBe('BSE');
    });

    it('handles AMFI mutual fund symbols without treating raw code as company symbol', () => {
      const res = normalizeSymbol('AMFI:152073');
      expect(res.cleanSymbol).toBe('152073');
      expect(res.isAmfi).toBe(true);
    });

    it('handles market indices with INDEX: or caret prefix', () => {
      const res1 = normalizeSymbol('INDEX:SENSEX');
      expect(res1.cleanSymbol).toBe('SENSEX');
      expect(res1.isIndex).toBe(true);

      const res2 = normalizeSymbol('^BSESN');
      expect(res2.cleanSymbol).toBe('BSESN');
      expect(res2.isIndex).toBe(true);
    });

    it('preserves clean US tickers without suffixes', () => {
      const res = normalizeSymbol('AAPL');
      expect(res.cleanSymbol).toBe('AAPL');
      expect(res.exchangeSuffix).toBeUndefined();
    });
  });

  describe('Verified Real Brand Logo Resolution (5 Required Instruments)', () => {
    it('1. RELIANCE.NS resolves to real Reliance Industries corporate brand logo', () => {
      const reliance = resolveInstrumentLogo({
        symbol: 'RELIANCE.NS',
        name: 'Reliance Industries Limited',
        assetType: 'STOCK'
      });
      expect(reliance.domain).toBe('ril.com');
      expect(reliance.brandName).toBe('Reliance Industries');
      expect(reliance.logoUrl).toContain('NSE_RELIANCE.svg');
    });

    it('2. TCS.NS resolves to real Tata Consultancy Services corporate brand logo', () => {
      const tcs = resolveInstrumentLogo({
        symbol: 'TCS.NS',
        name: 'Tata Consultancy Services Limited',
        assetType: 'STOCK'
      });
      expect(tcs.domain).toBe('tcs.com');
      expect(tcs.brandName).toBe('Tata Consultancy Services');
      expect(tcs.logoUrl).toContain('NSE_TCS.svg');
    });

    it('3. AAPL resolves to real Apple Inc. brand logo', () => {
      const aapl = resolveInstrumentLogo({
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'STOCK'
      });
      expect(aapl.domain).toBe('apple.com');
      expect(aapl.brandName).toBe('Apple Inc.');
      expect(aapl.logoUrl).toContain('apple.svg');
    });

    it('4. SPY resolves to real SPDR S&P 500 ETF Trust issuer logo', () => {
      const spy = resolveInstrumentLogo({
        symbol: 'SPY',
        name: 'SPDR S&P 500 ETF Trust',
        assetType: 'ETF',
        fundHouse: 'State Street Global Advisors'
      });
      expect(spy.domain).toBe('ssga.com');
      expect(spy.brandName).toBe('SPDR S&P 500 ETF Trust');
      expect(spy.logoUrl).toContain('spdr-sandp500-etf-tr--big.svg');
    });

    it('5. AMFI:152073 establishes AMC metadata and resolves to real 360 ONE AMC logo', () => {
      const amfiFund = resolveInstrumentLogo({
        symbol: 'AMFI:152073',
        name: '360 ONE Balanced Hybrid Fund Direct Growth',
        assetType: 'MUTUAL_FUND',
        fundHouse: '360 ONE Mutual Fund'
      });
      expect(amfiFund.domain).toBe('360.one');
      expect(amfiFund.brandName).toBe('360 ONE Mutual Fund');
      expect(amfiFund.logoUrl).toContain('NSE_360ONE.svg');
    });
  });

  describe('Real Logo Service URL Builders (Logo.dev and Brandfetch)', () => {
    it('builds Logo.dev CDN URL with publishable key, high-res parameters, and fallback=404', () => {
      const url = buildLogoDevUrl('apple.com', 'pk_test_12345');
      expect(url).toBe('https://img.logo.dev/apple.com?token=pk_test_12345&size=128&format=png&fallback=404');
    });

    it('builds Logo.dev stock ticker CDN URL with publishable key and fallback=404', () => {
      const url = buildLogoDevTickerUrl('AAPL', 'pk_test_12345');
      expect(url).toBe('https://img.logo.dev/ticker/AAPL?token=pk_test_12345&fallback=404');
    });

    it('builds Brandfetch CDN URL with client ID', () => {
      const url = buildBrandfetchUrl('ril.com', 'client_xyz');
      expect(url).toBe('https://cdn.brandfetch.io/ril.com?c=client_xyz');
    });
  });

  describe('Catalog Diversity & Less-Common Instruments', () => {
    it('resolves less-common Indian small/mid cap stock (20MICRONS.NS) via verified vector registry', () => {
      const res = resolveInstrumentLogo({
        symbol: '20MICRONS.NS',
        name: '20 Microns Limited',
        assetType: 'STOCK'
      });
      expect(res.logoUrl).toContain('NSE_20MICRONS.svg');
      expect(res.normalizedSymbol).toBe('20MICRONS');
    });

    it('resolves less-common Indian MNC stock (3MINDIA.NS) via verified vector registry', () => {
      const res = resolveInstrumentLogo({
        symbol: '3MINDIA.NS',
        name: '3M India Limited',
        assetType: 'STOCK'
      });
      expect(res.logoUrl).toContain('NSE_3MINDIA.svg');
      expect(res.normalizedSymbol).toBe('3MINDIA');
    });

    it('resolves PSU CPSE ETF (CPSEETF.NS) to Nippon India AMC logo', () => {
      const res = resolveInstrumentLogo({
        symbol: 'CPSEETF.NS',
        name: 'CPSE ETF',
        assetType: 'ETF'
      });
      expect(res.logoUrl).toContain('NSE_NAM_INDIA.svg');
      expect(res.brandName).toBe('Nippon India ETF CPSE');
    });

    it('resolves less-common AMFI mutual fund (AMFI:120716 Axis Bluechip Fund) to official Axis AMC logo', () => {
      const res = resolveInstrumentLogo({
        symbol: 'AMFI:120716',
        name: 'Axis Bluechip Fund - Regular Plan - Growth',
        assetType: 'MUTUAL_FUND',
        fundHouse: 'Axis Mutual Fund'
      });
      expect(res.logoUrl).toContain('NSE_AXISBANK.svg');
      expect(res.brandName).toBe('Axis Mutual Fund');
      expect(res.domain).toBe('axismf.com');
    });

    it('resolves Motilal Oswal Midcap Fund to official Motilal Oswal AMC logo', () => {
      const res = resolveInstrumentLogo({
        symbol: 'AMFI:129035',
        name: 'Motilal Oswal Midcap Fund - Regular Plan - Growth',
        assetType: 'MUTUAL_FUND',
        fundHouse: 'Motilal Oswal Mutual Fund'
      });
      expect(res.logoUrl).toContain('NSE_MOTILALOFS.svg');
      expect(res.brandName).toBe('Motilal Oswal Mutual Fund');
      expect(res.domain).toBe('motilaloswalmf.com');
    });
  });

  describe('Missing Logo State & Failure Reporting', () => {
    it('returns null logoUrl for uncataloged stocks without guessing random domains', () => {
      const unknownStock = resolveInstrumentLogo({
        symbol: 'UNKNOWNXYZ.NS',
        name: 'Unknown Random Company Ltd',
        assetType: 'STOCK'
      });
      expect(unknownStock.domain).toBeNull();
      expect(unknownStock.logoUrl).toBeNull();
    });

    it('returns null logoUrl for unknown AMFI code without AMC match', () => {
      const unknownFund = resolveInstrumentLogo({
        symbol: 'AMFI:999999',
        name: 'Unregistered Anonymous Scheme',
        assetType: 'MUTUAL_FUND'
      });
      expect(unknownFund.domain).toBeNull();
      expect(unknownFund.logoUrl).toBeNull();
    });

    it('records and reports missing logo symbols', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      reportMissingLogo('NEWTICKER.NS', 'New Ticker Co', 'No verified domain found');
      
      const reported = getReportedMissingLogos();
      expect(reported).toContain('NEWTICKER.NS');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SmartVest LogoResolver] Missing or unverified logo for NEWTICKER.NS')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('InstrumentLogo Component Rendering', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);
    });

    afterEach(() => {
      act(() => {
        root.unmount();
      });
      document.body.removeChild(container);
    });

    it('renders real img tag with lazy loading for verified instruments', async () => {
      await act(async () => {
        root.render(
          <InstrumentLogo 
            instrument={{
              symbol: 'AAPL',
              name: 'Apple Inc.',
              assetType: 'STOCK'
            }}
            size="md"
          />
        );
      });

      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.getAttribute('src')).toContain('apple.svg');
      expect(img?.getAttribute('loading')).toBe('lazy');
    });

    it('renders neutral missing-logo state WITHOUT initials or placeholder graphics', async () => {
      await act(async () => {
        root.render(
          <InstrumentLogo 
            instrument={{
              symbol: 'UNKNOWNXYZ',
              name: 'Unknown XYZ Corp',
              assetType: 'STOCK'
            }}
            size="md"
          />
        );
      });

      // Must NOT render any img tag
      expect(container.querySelector('img')).toBeNull();
      // Must NOT render initials (e.g., 'UN')
      expect(container.textContent).not.toContain('UN');
      // Must render neutral accessible container
      const missingContainer = container.querySelector('[role="img"]');
      expect(missingContainer).not.toBeNull();
      expect(missingContainer?.getAttribute('aria-label')).toContain('Logo unavailable for UNKNOWNXYZ');
    });

    it('handles image error gracefully by transitioning to neutral missing-logo state', async () => {
      await act(async () => {
        root.render(
          <InstrumentLogo 
            instrument={{
              symbol: 'TCS.NS',
              name: 'Tata Consultancy Services',
              assetType: 'STOCK'
            }}
            size="md"
          />
        );
      });

      const img = container.querySelector('img');
      expect(img).not.toBeNull();

      // Trigger image error event
      await act(async () => {
        img?.dispatchEvent(new Event('error'));
      });

      // img is cleanly replaced by the neutral missing-logo container
      expect(container.querySelector('img')).toBeNull();
      expect(container.textContent).not.toContain('TC'); // No initials
      const fallbackBox = container.querySelector('[role="img"]');
      expect(fallbackBox).not.toBeNull();
      expect(fallbackBox?.getAttribute('aria-label')).toContain('Logo unavailable for TCS.NS');
    });

    it('resets error state when instrument prop changes to a valid instrument', async () => {
      await act(async () => {
        root.render(
          <InstrumentLogo 
            instrument={{
              symbol: 'UNKNOWNXYZ',
              name: 'Unknown Random Company',
              assetType: 'STOCK'
            }}
            size="md"
          />
        );
      });

      // Initially fallback
      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('[role="img"]')).not.toBeNull();

      // Update prop to a verified instrument
      await act(async () => {
        root.render(
          <InstrumentLogo 
            instrument={{
              symbol: 'AAPL',
              name: 'Apple Inc.',
              assetType: 'STOCK'
            }}
            size="md"
          />
        );
      });

      // Img tag should now render
      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.getAttribute('src')).toContain('apple.svg');
    });
  });

  describe('Strict Asset Class Isolation & Logo Non-Borrowing', () => {
    it('ETF never borrows underlying stock logo (HDFCNIFTY resolves HDFC AMC, not HDFC Bank)', () => {
      const etf = resolveInstrumentLogo({
        symbol: 'HDFCNIFTY',
        name: 'HDFC NIFTY 50 ETF',
        assetType: 'ETF',
        fundHouse: 'HDFC Mutual Fund'
      });
      expect(etf.logoUrl).toContain('NSE_HDFCAMC.svg');
      expect(etf.logoUrl).not.toContain('NSE_HDFCBANK.svg');
      expect(etf.domain).toBe('hdfcfund.com');
    });

    it('NIFTYBEES ETF resolves to Nippon India AMC logo, not equity stock', () => {
      const etf = resolveInstrumentLogo({
        symbol: 'NIFTYBEES',
        name: 'Nippon India ETF Nifty BeES',
        assetType: 'ETF'
      });
      expect(etf.logoUrl).toContain('NSE_NAM_INDIA.svg');
      expect(etf.domain).toBe('nipponindiaim.com');
    });

    it('Unknown ETF never borrows arbitrary stock logo from verified registry', () => {
      const unknownEtf = resolveInstrumentLogo({
        symbol: 'RANDOMETF',
        name: 'Random Sector ETF',
        assetType: 'ETF'
      });
      expect(unknownEtf.logoUrl).toBeNull();
      expect(unknownEtf.domain).toBeNull();
    });

    it('Mutual Fund resolves to AMC logo, never underlying stock logo (HDFC Top 100 resolves HDFC AMC)', () => {
      const fund = resolveInstrumentLogo({
        symbol: 'AMFI:101010',
        name: 'HDFC Top 100 Fund - Regular Plan',
        assetType: 'MUTUAL_FUND',
        fundHouse: 'HDFC Mutual Fund'
      });
      expect(fund.logoUrl).toContain('NSE_HDFCAMC.svg');
      expect(fund.logoUrl).not.toContain('NSE_HDFCBANK.svg');
      expect(fund.domain).toBe('hdfcfund.com');
    });

    it('Stock never borrows AMC logo (Choice International does not match Choice Mutual Fund)', () => {
      const stock = resolveInstrumentLogo({
        symbol: 'CHOICEIN.NS',
        name: 'Choice International Ltd',
        assetType: 'STOCK'
      });
      // Should resolve via Indian listed company logos or null, NOT Choice Mutual Fund (choiceindia.com)
      if (stock.logoUrl) {
        expect(stock.logoUrl).toContain('NSE_CHOICEIN.svg');
      }
      expect(stock.domain).not.toBe('choiceindia.com');
    });
  });

  describe('Cross-Market Ticker Collision Protection', () => {
    it('resolves HAL.NS on NSE to Hindustan Aeronautics, but US HAL on NYSE does not collide', () => {
      const indianHAL = resolveInstrumentLogo({
        symbol: 'HAL.NS',
        name: 'Hindustan Aeronautics Limited',
        assetType: 'STOCK',
        exchange: 'NSE',
        country: 'IN'
      });
      expect(indianHAL.logoUrl).toContain('NSE_HAL.svg');

      const usHAL = resolveInstrumentLogo({
        symbol: 'HAL',
        name: 'Halliburton Company',
        assetType: 'STOCK',
        exchange: 'NYSE',
        country: 'US'
      });
      // US HAL must NOT receive the Indian aeronautics logo
      expect(usHAL.logoUrl ?? '').not.toContain('indian-listed-company-logos');
    });

    it('resolves BEL.NS on NSE to Bharat Electronics, but US BEL on NASDAQ does not collide', () => {
      const indianBEL = resolveInstrumentLogo({
        symbol: 'BEL.NS',
        name: 'Bharat Electronics Limited',
        assetType: 'STOCK',
        exchange: 'NSE',
        country: 'IN'
      });
      expect(indianBEL.logoUrl).toContain('NSE_BEL.svg');

      const usBEL = resolveInstrumentLogo({
        symbol: 'BEL',
        name: 'Bel Fuse Inc.',
        assetType: 'STOCK',
        exchange: 'NASDAQ',
        country: 'US'
      });
      // US BEL must NOT receive the Indian electronics logo
      expect(usBEL.logoUrl ?? '').not.toContain('indian-listed-company-logos');
    });
  });

  describe('Expanded Benchmark Index Resolution', () => {
    it('resolves NIFTY and NIFTY 50 to NSE vector asset', () => {
      const idx1 = resolveInstrumentLogo({ symbol: '^NSEI', name: 'NIFTY 50', assetType: 'INDEX' });
      expect(idx1.logoUrl).toContain('source/NSE.svg');
      expect(idx1.domain).toBe('nseindia.com');

      const idx2 = resolveInstrumentLogo({ symbol: 'NIFTY 50', name: 'NIFTY 50 Benchmark', assetType: 'INDEX' });
      expect(idx2.logoUrl).toContain('source/NSE.svg');
    });

    it('resolves SENSEX and ^BSESN to BSE vector asset', () => {
      const idx = resolveInstrumentLogo({ symbol: '^BSESN', name: 'BSE SENSEX', assetType: 'INDEX' });
      expect(idx.logoUrl).toContain('source/BSE.svg');
      expect(idx.domain).toBe('bseindia.com');
    });

    it('resolves S&P 500 and SPX to S&P index asset', () => {
      const idx = resolveInstrumentLogo({ symbol: 'S&P 500', name: 'S&P 500 Index', assetType: 'INDEX' });
      expect(idx.logoUrl).toContain('indices/s-and-p-500.svg');
      expect(idx.domain).toBe('spglobal.com');
    });

    it('resolves NASDAQ and DOW indices to official index assets', () => {
      const nasdaq = resolveInstrumentLogo({ symbol: 'NASDAQ', name: 'NASDAQ Composite', assetType: 'INDEX' });
      expect(nasdaq.logoUrl).toContain('indices/nasdaq-composite.svg');

      const dow = resolveInstrumentLogo({ symbol: 'DOW', name: 'Dow Jones Industrial Average', assetType: 'INDEX' });
      expect(dow.logoUrl).toContain('indices/dow-30.svg');
    });
  });
});

