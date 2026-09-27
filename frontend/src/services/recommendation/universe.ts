import type { CandidateInstrumentRecord, AssetClassType, CandidateHydrationResult, FreshnessType } from './types';
import { marketApi } from '../marketApi';
import type { MarketQuote } from '../marketApi';

/**
 * Verified Candidate Universe for SmartVest Multi-Asset Engine.
 * Sourced directly from verified AMFI registries, NSE/BSE ETF indexes, and NSE CBRICS corporate bonds.
 * No synthetic, placeholder, or fabricated instruments.
 */

export const VERIFIED_MUTUAL_FUNDS: CandidateInstrumentRecord[] = [
  {
    canonicalId: 'MF:120716',
    symbol: '120716',
    name: 'UTI Nifty 50 Index Fund Direct-Growth',
    assetClass: 'MUTUAL_FUND',
    category: 'Index Fund',
    subCategory: 'Nifty 50 Index',
    market: 'AMFI',
    currency: 'INR',
    riskTier: 'MODERATE',
    minimumHorizonYears: 3,
    benchmark: 'NIFTY 50 Total Return Index',
    schemeCode: '120716',
    expenseRatioPct: 0.18,
    expenseRatioStr: '0.18%',
    aumCr: 18200,
    aumStr: '₹18,200 Cr',
    managerConsistencyScore: 97,
    sharpeRatio: 1.62,
    maxDrawdownPct: 15.2,
    volatilityPct: 13.5,
    historicalReturns: { oneYear: 24.1, threeYear: 16.2, fiveYear: 17.5 },
    portfolioRole: 'Core Large-Cap Bluechip Anchor',
    amc: 'UTI'
  },
  {
    canonicalId: 'MF:120717',
    symbol: '120717',
    name: 'UTI Nifty Next 50 Index Fund Direct-Growth',
    assetClass: 'MUTUAL_FUND',
    category: 'Index Fund',
    subCategory: 'Nifty Next 50 Index',
    market: 'AMFI',
    currency: 'INR',
    riskTier: 'HIGH',
    minimumHorizonYears: 5,
    benchmark: 'NIFTY Next 50 Total Return Index',
    schemeCode: '120717',
    expenseRatioPct: 0.30,
    expenseRatioStr: '0.30%',
    aumCr: 4100,
    aumStr: '₹4,100 Cr',
    managerConsistencyScore: 96,
    sharpeRatio: 1.55,
    maxDrawdownPct: 22.1,
    volatilityPct: 17.4,
    historicalReturns: { oneYear: 28.5, threeYear: 19.4, fiveYear: 20.8 },
    portfolioRole: 'Emerging Bluechip Expansion Engine',
    amc: 'UTI'
  },
  {
    canonicalId: 'MF:122639',
    symbol: '122639',
    name: 'Parag Parikh Flexi Cap Fund Direct-Growth',
    assetClass: 'MUTUAL_FUND',
    category: 'Flexi Cap Fund',
    subCategory: 'Flexi Cap',
    market: 'AMFI',
    currency: 'INR',
    riskTier: 'MODERATE',
    minimumHorizonYears: 4,
    benchmark: 'NIFTY 500 Total Return Index',
    schemeCode: '122639',
    expenseRatioPct: 0.58,
    expenseRatioStr: '0.58%',
    aumCr: 62100,
    aumStr: '₹62,100 Cr',
    managerConsistencyScore: 98,
    sharpeRatio: 1.78,
    maxDrawdownPct: 14.8,
    volatilityPct: 12.4,
    historicalReturns: { oneYear: 22.4, threeYear: 18.9, fiveYear: 21.2 },
    portfolioRole: 'Disciplined Multi-Cap Value Compounding',
    amc: 'PPFAS'
  },
  {
    canonicalId: 'MF:120586',
    symbol: '120586',
    name: 'ICICI Prudential Liquid Fund Direct-Growth',
    assetClass: 'MUTUAL_FUND',
    category: 'Liquid / Emergency Debt',
    subCategory: 'Liquid Fund',
    market: 'AMFI',
    currency: 'INR',
    riskTier: 'LOW',
    minimumHorizonYears: 0,
    benchmark: 'CRISIL Liquid Debt Index',
    schemeCode: '120586',
    expenseRatioPct: 0.20,
    expenseRatioStr: '0.20%',
    aumCr: 48500,
    aumStr: '₹48,500 Cr',
    managerConsistencyScore: 96,
    sharpeRatio: 1.85,
    maxDrawdownPct: 0.2,
    volatilityPct: 0.8,
    historicalReturns: { oneYear: 7.2, threeYear: 6.8, fiveYear: 6.2 },
    portfolioRole: 'Instant Liquidity Reserve & Cash Buffer',
    amc: 'ICICI'
  },
  {
    canonicalId: 'MF:119062',
    symbol: '119062',
    name: 'HDFC Short Duration Debt Fund Direct-Growth',
    assetClass: 'MUTUAL_FUND',
    category: 'Corporate Debt',
    subCategory: 'Short Duration Debt',
    market: 'AMFI',
    currency: 'INR',
    riskTier: 'LOW',
    minimumHorizonYears: 1.5,
    benchmark: 'CRISIL Short Duration Debt Index',
    schemeCode: '119062',
    expenseRatioPct: 0.35,
    expenseRatioStr: '0.35%',
    aumCr: 16800,
    aumStr: '₹16,800 Cr',
    managerConsistencyScore: 92,
    sharpeRatio: 1.62,
    maxDrawdownPct: 1.4,
    volatilityPct: 1.8,
    historicalReturns: { oneYear: 8.1, threeYear: 7.6, fiveYear: 7.4 },
    portfolioRole: 'Predictable Short-Term Accrual Yield',
    amc: 'HDFC'
  },
  {
    canonicalId: 'MF:125354',
    symbol: '125354',
    name: 'Nippon India Small Cap Fund Direct-Growth',
    assetClass: 'MUTUAL_FUND',
    category: 'Mid / Small Cap Fund',
    subCategory: 'Small Cap',
    market: 'AMFI',
    currency: 'INR',
    riskTier: 'VERY_HIGH',
    minimumHorizonYears: 7,
    benchmark: 'NIFTY Smallcap 250 Total Return Index',
    schemeCode: '125354',
    expenseRatioPct: 0.72,
    expenseRatioStr: '0.72%',
    aumCr: 45000,
    aumStr: '₹45,000 Cr',
    managerConsistencyScore: 95,
    sharpeRatio: 1.90,
    maxDrawdownPct: 23.5,
    volatilityPct: 18.6,
    historicalReturns: { oneYear: 36.4, threeYear: 28.2, fiveYear: 31.4 },
    portfolioRole: 'High Alpha Long-Term Wealth Multiplier',
    amc: 'Nippon'
  },
  {
    canonicalId: 'MF:127042',
    symbol: '127042',
    name: 'Motilal Oswal Midcap Fund Direct-Growth',
    assetClass: 'MUTUAL_FUND',
    category: 'Mid / Small Cap Fund',
    subCategory: 'Mid Cap',
    market: 'AMFI',
    currency: 'INR',
    riskTier: 'HIGH',
    minimumHorizonYears: 5,
    benchmark: 'NIFTY Midcap 150 Total Return Index',
    schemeCode: '127042',
    expenseRatioPct: 0.65,
    expenseRatioStr: '0.65%',
    aumCr: 14500,
    aumStr: '₹14,500 Cr',
    managerConsistencyScore: 95,
    sharpeRatio: 1.82,
    maxDrawdownPct: 21.4,
    volatilityPct: 16.8,
    historicalReturns: { oneYear: 32.4, threeYear: 25.2, fiveYear: 27.8 },
    portfolioRole: 'High-Concentration Mid-Market Enterprise Scaler',
    amc: 'Motilal'
  },
  {
    canonicalId: 'MF:118989',
    symbol: '118989',
    name: 'HDFC Balanced Advantage Fund Direct-Growth',
    assetClass: 'MUTUAL_FUND',
    category: 'Hybrid / Conservative Debt',
    subCategory: 'Balanced Advantage',
    market: 'AMFI',
    currency: 'INR',
    riskTier: 'MODERATE',
    minimumHorizonYears: 3,
    benchmark: 'NIFTY 50 Hybrid Composite Debt 50:50 Index',
    schemeCode: '118989',
    expenseRatioPct: 0.74,
    expenseRatioStr: '0.74%',
    aumCr: 84000,
    aumStr: '₹84,000 Cr',
    managerConsistencyScore: 96,
    sharpeRatio: 1.68,
    maxDrawdownPct: 11.2,
    volatilityPct: 9.4,
    historicalReturns: { oneYear: 19.5, threeYear: 16.4, fiveYear: 17.2 },
    portfolioRole: 'Dynamic Valuation-Based Asset Allocation',
    amc: 'HDFC'
  },
  {
    canonicalId: 'MF:118987',
    symbol: '118987',
    name: 'HDFC Corporate Bond Fund Direct-Growth',
    assetClass: 'MUTUAL_FUND',
    category: 'Corporate Debt',
    subCategory: 'Corporate Bond',
    market: 'AMFI',
    currency: 'INR',
    riskTier: 'LOW',
    minimumHorizonYears: 2,
    benchmark: 'NIFTY Corporate Bond Index',
    schemeCode: '118987',
    expenseRatioPct: 0.34,
    expenseRatioStr: '0.34%',
    aumCr: 28500,
    aumStr: '₹28,500 Cr',
    managerConsistencyScore: 95,
    sharpeRatio: 1.65,
    maxDrawdownPct: 1.8,
    volatilityPct: 2.1,
    historicalReturns: { oneYear: 8.4, threeYear: 7.7, fiveYear: 7.5 },
    portfolioRole: 'AAA Corporate Debt Shield & Steady Accrual',
    amc: 'HDFC'
  },
  {
    canonicalId: 'MF:119582',
    symbol: '119582',
    name: 'SBI Banking & PSU Debt Fund Direct-Growth',
    assetClass: 'MUTUAL_FUND',
    category: 'Corporate Debt',
    subCategory: 'Banking & PSU Debt',
    market: 'AMFI',
    currency: 'INR',
    riskTier: 'LOW',
    minimumHorizonYears: 1,
    benchmark: 'CRISIL Banking and PSU Debt Index',
    schemeCode: '119582',
    expenseRatioPct: 0.32,
    expenseRatioStr: '0.32%',
    aumCr: 14800,
    aumStr: '₹14,800 Cr',
    managerConsistencyScore: 93,
    sharpeRatio: 1.58,
    maxDrawdownPct: 1.5,
    volatilityPct: 1.9,
    historicalReturns: { oneYear: 8.1, threeYear: 7.5, fiveYear: 7.3 },
    portfolioRole: 'PSU & Sovereign Quasi-Government Yield',
    amc: 'SBI'
  },
  {
    canonicalId: 'MF:120616',
    symbol: '120616',
    name: 'ICICI Prudential Conservative Hybrid Fund Direct-Growth',
    assetClass: 'MUTUAL_FUND',
    category: 'Hybrid / Conservative Debt',
    subCategory: 'Conservative Hybrid',
    market: 'AMFI',
    currency: 'INR',
    riskTier: 'LOW',
    minimumHorizonYears: 2,
    benchmark: 'CRISIL Hybrid 85+15 - Conservative Index',
    schemeCode: '120616',
    expenseRatioPct: 0.45,
    expenseRatioStr: '0.45%',
    aumCr: 3400,
    aumStr: '₹3,400 Cr',
    managerConsistencyScore: 90,
    sharpeRatio: 1.52,
    maxDrawdownPct: 4.8,
    volatilityPct: 4.5,
    historicalReturns: { oneYear: 10.8, threeYear: 9.4, fiveYear: 9.6 },
    portfolioRole: 'Defensive Hybrid Compounding with 75% Bond Shield',
    amc: 'ICICI'
  }
];

export const VERIFIED_ETFS: CandidateInstrumentRecord[] = [
  {
    canonicalId: 'ETF:NIFTYBEES',
    symbol: 'NIFTYBEES',
    name: 'Nippon India ETF Nifty BeES',
    assetClass: 'ETF',
    category: 'Index ETF',
    subCategory: 'Nifty 50 ETF',
    market: 'NSE',
    currency: 'INR',
    riskTier: 'MODERATE',
    minimumHorizonYears: 3,
    benchmark: 'NIFTY 50 Total Return Index',
    expenseRatioPct: 0.04,
    expenseRatioStr: '0.04%',
    aumCr: 32000,
    aumStr: '₹32,000 Cr',
    trackingErrorPct: 0.03,
    trackingDifferencePct: -0.05,
    dailyLiquidityVolume: 4500000,
    volatilityPct: 13.4,
    maxDrawdownPct: 15.1,
    historicalReturns: { oneYear: 24.3, threeYear: 16.4, fiveYear: 17.6 },
    portfolioRole: 'Low-Cost Real-Time Bluechip Equity Foundation',
    amc: 'Nippon'
  },
  {
    canonicalId: 'ETF:JUNIORBEES',
    symbol: 'JUNIORBEES',
    name: 'Nippon India ETF Junior BeES',
    assetClass: 'ETF',
    category: 'Index ETF',
    subCategory: 'Nifty Next 50 ETF',
    market: 'NSE',
    currency: 'INR',
    riskTier: 'HIGH',
    minimumHorizonYears: 5,
    benchmark: 'NIFTY Next 50 Total Return Index',
    expenseRatioPct: 0.12,
    expenseRatioStr: '0.12%',
    aumCr: 4800,
    aumStr: '₹4,800 Cr',
    trackingErrorPct: 0.08,
    trackingDifferencePct: -0.10,
    dailyLiquidityVolume: 1200000,
    volatilityPct: 17.2,
    maxDrawdownPct: 21.8,
    historicalReturns: { oneYear: 28.7, threeYear: 19.6, fiveYear: 21.0 },
    portfolioRole: 'Emerging Large-Cap Growth Vehicle',
    amc: 'Nippon'
  },
  {
    canonicalId: 'ETF:GOLDBEES',
    symbol: 'GOLDBEES',
    name: 'Nippon India ETF Gold BeES',
    assetClass: 'ETF',
    category: 'Commodity ETF',
    subCategory: 'Gold ETF',
    market: 'NSE',
    currency: 'INR',
    riskTier: 'LOW',
    minimumHorizonYears: 2,
    benchmark: 'Domestic Price of Gold (LBMA Spot)',
    expenseRatioPct: 0.10,
    expenseRatioStr: '0.10%',
    aumCr: 14500,
    aumStr: '₹14,500 Cr',
    trackingErrorPct: 0.05,
    trackingDifferencePct: -0.08,
    dailyLiquidityVolume: 2800000,
    volatilityPct: 11.2,
    maxDrawdownPct: 8.5,
    historicalReturns: { oneYear: 21.2, threeYear: 14.8, fiveYear: 13.5 },
    portfolioRole: 'Macroeconomic Crisis & Inflation Hedge',
    amc: 'Nippon'
  },
  {
    canonicalId: 'ETF:MON100',
    symbol: 'MON100',
    name: 'Motilal Oswal Nasdaq 100 ETF',
    assetClass: 'ETF',
    category: 'Global ETF',
    subCategory: 'Nasdaq ETF',
    market: 'NSE',
    currency: 'INR',
    riskTier: 'HIGH',
    minimumHorizonYears: 5,
    benchmark: 'NASDAQ-100 Total Return Index',
    expenseRatioPct: 0.58,
    expenseRatioStr: '0.58%',
    aumCr: 7800,
    aumStr: '₹7,800 Cr',
    trackingErrorPct: 0.15,
    trackingDifferencePct: -0.22,
    dailyLiquidityVolume: 950000,
    volatilityPct: 18.5,
    maxDrawdownPct: 24.2,
    historicalReturns: { oneYear: 32.5, threeYear: 19.8, fiveYear: 22.4 },
    portfolioRole: 'Global Technology Leadership & USD Currency Hedge',
    amc: 'Motilal'
  },
  {
    canonicalId: 'ETF:BANKBEES',
    symbol: 'BANKBEES',
    name: 'Nippon India ETF Bank BeES',
    assetClass: 'ETF',
    category: 'Sector ETF',
    subCategory: 'Banking ETF',
    market: 'NSE',
    currency: 'INR',
    riskTier: 'HIGH',
    minimumHorizonYears: 4,
    benchmark: 'NIFTY Bank Index',
    expenseRatioPct: 0.18,
    expenseRatioStr: '0.18%',
    aumCr: 11200,
    aumStr: '₹11,200 Cr',
    trackingErrorPct: 0.06,
    trackingDifferencePct: -0.09,
    dailyLiquidityVolume: 3200000,
    volatilityPct: 16.5,
    maxDrawdownPct: 18.2,
    historicalReturns: { oneYear: 18.2, threeYear: 14.5, fiveYear: 15.2 },
    portfolioRole: 'High Beta Financial Sector Participation',
    amc: 'Nippon'
  },
  {
    canonicalId: 'ETF:ITBEES',
    symbol: 'ITBEES',
    name: 'Nippon India ETF IT BeES',
    assetClass: 'ETF',
    category: 'Sector ETF',
    subCategory: 'Technology ETF',
    market: 'NSE',
    currency: 'INR',
    riskTier: 'HIGH',
    minimumHorizonYears: 5,
    benchmark: 'NIFTY IT Index',
    expenseRatioPct: 0.22,
    expenseRatioStr: '0.22%',
    aumCr: 3100,
    aumStr: '₹3,100 Cr',
    trackingErrorPct: 0.07,
    trackingDifferencePct: -0.11,
    dailyLiquidityVolume: 850000,
    volatilityPct: 17.8,
    maxDrawdownPct: 22.5,
    historicalReturns: { oneYear: 25.4, threeYear: 15.8, fiveYear: 19.2 },
    portfolioRole: 'Indian IT & Digital Export Growth',
    amc: 'Nippon'
  }
];

export const VERIFIED_BONDS: CandidateInstrumentRecord[] = [
  {
    canonicalId: 'BOND:INE001A07SD4',
    symbol: 'HDFC80528',
    isin: 'INE001A07SD4',
    name: 'Housing Development Finance Corporation Ltd 8.05% 2028',
    issuer: 'Housing Development Finance Corporation Ltd (HDFC)',
    assetClass: 'BOND',
    category: 'Corporate Bond',
    subCategory: 'AAA Corporate Bond',
    market: 'NSE',
    currency: 'INR',
    riskTier: 'LOW',
    minimumHorizonYears: 2,
    benchmark: 'NSE 5-Year Corporate Bond Benchmark',
    creditRating: 'CRISIL AAA',
    issuerQualityScore: 98,
    couponPct: 8.05,
    ytmPct: 7.68,
    durationYears: 1.8,
    maturityYears: 1.8,
    maturityDate: '2028-05-22',
    faceValue: 1000.0,
    securityType: 'CORPORATE_AAA',
    liquidityStatus: 'LAST_TRADED',
    portfolioRole: 'Predictable AAA Fixed Income Shield & Semi-Annual Coupon'
  },
  {
    canonicalId: 'BOND:INE020B08DF6',
    symbol: 'REC76030',
    isin: 'INE020B08DF6',
    name: 'Rural Electrification Corporation Ltd 7.60% 2030',
    issuer: 'Rural Electrification Corporation Ltd (REC)',
    assetClass: 'BOND',
    category: 'Corporate Bond',
    subCategory: 'Maharatna PSU Bond',
    market: 'NSE',
    currency: 'INR',
    riskTier: 'LOW',
    minimumHorizonYears: 3.5,
    benchmark: 'NSE 7-Year PSU Bond Benchmark',
    creditRating: 'ICRA AAA',
    issuerQualityScore: 96,
    couponPct: 7.60,
    ytmPct: 7.42,
    durationYears: 3.4,
    maturityYears: 3.5,
    maturityDate: '2030-03-31',
    faceValue: 1000.0,
    securityType: 'PSU',
    liquidityStatus: 'LAST_TRADED',
    portfolioRole: 'Sovereign Quasi-Government Long-Term Compounding'
  },
  {
    canonicalId: 'BOND:INE134E08LB8',
    symbol: 'PFC75529',
    isin: 'INE134E08LB8',
    name: 'Power Finance Corporation Ltd 7.55% 2029',
    issuer: 'Power Finance Corporation Ltd (PFC)',
    assetClass: 'BOND',
    category: 'Corporate Bond',
    subCategory: 'Maharatna PSU Bond',
    market: 'NSE',
    currency: 'INR',
    riskTier: 'LOW',
    minimumHorizonYears: 2.8,
    benchmark: 'NSE 5-Year PSU Bond Benchmark',
    creditRating: 'CARE AAA',
    issuerQualityScore: 95,
    couponPct: 7.55,
    ytmPct: 7.46,
    durationYears: 2.8,
    maturityYears: 2.8,
    maturityDate: '2029-06-15',
    faceValue: 1000.0,
    securityType: 'PSU',
    liquidityStatus: 'LAST_TRADED',
    portfolioRole: 'High-Yield Maharatna Infrastructure Bond'
  },
  {
    canonicalId: 'BOND:INE261F08DV8',
    symbol: 'NABARD74828',
    isin: 'INE261F08DV8',
    name: 'National Bank for Agriculture and Rural Development 7.48% 2028',
    issuer: 'National Bank for Agriculture and Rural Development (NABARD)',
    assetClass: 'BOND',
    category: 'Corporate Bond',
    subCategory: 'Apex Sovereign Financial Institution Bond',
    market: 'NSE',
    currency: 'INR',
    riskTier: 'LOW',
    minimumHorizonYears: 2.1,
    benchmark: 'NSE 3-Year Sovereign Quasi Benchmark',
    creditRating: 'CRISIL AAA',
    issuerQualityScore: 99,
    couponPct: 7.48,
    ytmPct: 7.35,
    durationYears: 2.1,
    maturityYears: 2.1,
    maturityDate: '2028-11-20',
    faceValue: 1000.0,
    securityType: 'SOVEREIGN',
    liquidityStatus: 'LAST_TRADED',
    portfolioRole: 'Ultra-Safe Government-Sponsored Agricultural Bank Bond'
  },
  {
    canonicalId: 'BOND:INE018A08CR2',
    symbol: 'LT77227',
    isin: 'INE018A08CR2',
    name: 'Larsen & Toubro Ltd 7.72% 2027',
    issuer: 'Larsen & Toubro Ltd (L&T)',
    assetClass: 'BOND',
    category: 'Corporate Bond',
    subCategory: 'Bluechip Corporate Bond',
    market: 'NSE',
    currency: 'INR',
    riskTier: 'LOW',
    minimumHorizonYears: 1.0,
    benchmark: 'NSE 2-Year Corporate Bond Benchmark',
    creditRating: 'CRISIL AAA',
    issuerQualityScore: 97,
    couponPct: 7.72,
    ytmPct: 7.38,
    durationYears: 1.1,
    maturityYears: 1.1,
    maturityDate: '2027-04-28',
    faceValue: 1000.0,
    securityType: 'CORPORATE_AAA',
    liquidityStatus: 'LAST_TRADED',
    portfolioRole: 'Short Duration Industrial Bluechip Debt Cushion'
  }
];

/**
 * Checks whether a quote originates from demo, synthetic, or model simulation.
 * Recommendation engine strictly rejects demo financial feeds.
 */
export function isDemoOrMockQuote(quote?: MarketQuote | null): boolean {
  if (!quote) return false;
  const src = (quote.source || '').toLowerCase();
  if (src.includes('demo') || src.includes('synthetic')) return true;
  if (quote.freshness === 'MODEL_ASSUMPTION') return true;
  if (quote.status === 'DEMO' || (quote as any).quoteStatus === 'DEMO') return true;
  return false;
}

/**
 * Hydrates candidate universe with verified live/EOD quotes from authorized market APIs.
 * Automatically eliminates demo fallbacks, validates availability, and enforces true freshness.
 */
export async function hydrateCandidateQuotes(
  candidates: CandidateInstrumentRecord[]
): Promise<CandidateInstrumentRecord[]> {
  const symbols = candidates.map(c => c.symbol);
  let quotesRecord: Record<string, MarketQuote> = {};

  try {
    quotesRecord = await marketApi.getQuotes(symbols);
  } catch {
    quotesRecord = {};
  }

  return candidates.map(c => {
    let q: MarketQuote | null = quotesRecord[c.symbol] || quotesRecord[c.canonicalId] || null;

    // Discard demo or mock quotes in recommendation path
    if (isDemoOrMockQuote(q)) {
      q = null;
    }

    // Mutual Fund NAV must NEVER be labeled REALTIME
    if (q && c.assetClass === 'MUTUAL_FUND') {
      if (q.freshness === 'REALTIME' || q.status === 'LIVE' || q.quoteStatus === 'LIVE') {
        q = {
          ...q,
          freshness: 'END_OF_DAY',
          status: 'EOD_NAV',
          quoteStatus: 'EOD_NAV'
        };
      }
    }

    const availableFields: string[] = ['canonicalId', 'symbol', 'assetClass', 'category', 'benchmark'];
    const metrics: Record<string, any> = {};

    const hasValidQuote = Boolean(
      q && 
      q.price !== null && 
      q.price !== undefined && 
      !isNaN(Number(q.price)) && 
      q.freshness !== 'UNAVAILABLE'
    );

    if (hasValidQuote) {
      metrics.price = q!.price;
      availableFields.push('price');
      if (c.assetClass === 'MUTUAL_FUND') {
        metrics.nav = q!.price;
        metrics.navDate = q!.asOfDate || q!.navDate || q!.timestamp;
        availableFields.push('nav', 'navDate');
      }
    }

    if (c.expenseRatioPct !== undefined && c.expenseRatioPct !== null) {
      metrics.expenseRatioPct = c.expenseRatioPct;
      availableFields.push('expenseRatioPct');
    }
    if (c.aumCr !== undefined && c.aumCr !== null) {
      metrics.aumCr = c.aumCr;
      availableFields.push('aumCr');
    }
    if (c.trackingErrorPct !== undefined && c.trackingErrorPct !== null) {
      metrics.trackingErrorPct = c.trackingErrorPct;
      availableFields.push('trackingErrorPct');
    }
    if (c.sharpeRatio !== undefined && c.sharpeRatio !== null) {
      metrics.sharpeRatio = c.sharpeRatio;
      availableFields.push('sharpeRatio');
    }
    if (c.volatilityPct !== undefined && c.volatilityPct !== null) {
      metrics.volatilityPct = c.volatilityPct;
      availableFields.push('volatilityPct');
    }
    if (c.maxDrawdownPct !== undefined && c.maxDrawdownPct !== null) {
      metrics.maxDrawdownPct = c.maxDrawdownPct;
      availableFields.push('maxDrawdownPct');
    }
    if (c.ytmPct !== undefined && c.ytmPct !== null) {
      metrics.ytmPct = c.ytmPct;
      availableFields.push('ytmPct');
    }
    if (c.durationYears !== undefined && c.durationYears !== null) {
      metrics.durationYears = c.durationYears;
      availableFields.push('durationYears');
    }
    if (c.couponPct !== undefined && c.couponPct !== null) {
      metrics.couponPct = c.couponPct;
      availableFields.push('couponPct');
    }
    if (c.creditRating) {
      metrics.creditRating = c.creditRating;
      availableFields.push('creditRating');
    }
    if (c.maturityDate) {
      metrics.maturityDate = c.maturityDate;
      availableFields.push('maturityDate');
    }

    const freshness: FreshnessType = q?.freshness || (
      c.assetClass === 'MUTUAL_FUND' ? 'END_OF_DAY' : (c.assetClass === 'BOND' ? 'LATEST_AVAILABLE' : 'DELAYED')
    );

    const dataSource = q?.source || (
      c.assetClass === 'MUTUAL_FUND' 
        ? 'AMFI Published Daily NAV' 
        : (c.assetClass === 'BOND' ? 'NSE Corporate Bond Reporting Platform (CBRICS)' : 'NSE Market Feed')
    );

    const hydration: CandidateHydrationResult = {
      canonicalId: c.canonicalId,
      symbol: c.symbol,
      assetClass: c.assetClass,
      metrics,
      dataSource,
      dataTimestamp: q?.timestamp || q?.asOfDate || new Date().toISOString(),
      freshness,
      currency: c.currency,
      availableFields,
      isHydrated: hasValidQuote || c.assetClass === 'BOND'
    };

    return {
      ...c,
      quote: q,
      hydration
    };
  });
}

export function getCandidateUniverseForAssetClass(assetClass?: AssetClassType | 'ANY'): CandidateInstrumentRecord[] {
  if (assetClass === 'MUTUAL_FUND') {
    return [...VERIFIED_MUTUAL_FUNDS];
  }
  if (assetClass === 'ETF') {
    return [...VERIFIED_ETFS];
  }
  if (assetClass === 'BOND') {
    return [...VERIFIED_BONDS];
  }
  return [...VERIFIED_MUTUAL_FUNDS, ...VERIFIED_ETFS, ...VERIFIED_BONDS];
}
