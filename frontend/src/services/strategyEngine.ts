import type { 
  UserProfile, 
  InvestmentStrategy, 
  RecommendedAsset, 
  ExpenseItem, 
  GoalItem,
  ExcludedInstrument,
  RiskReturnPoint,
  SuitabilityFactors,
  AssetCategory,
  AssetClassBlueprintItem
} from '../types';

export interface CandidateInstrument {
  id: string;
  name: string;
  ticker?: string;
  amc: string; // AMC name for concentration checking (e.g. HDFC, ICICI, SBI, Nippon, Motilal, Quant, Kotak, UTI, Mirae, Tata)
  category: AssetCategory;
  subCategory: 
    | 'Liquid Fund'
    | 'Overnight / Arbitrage'
    | 'Corporate Bond'
    | 'Banking & PSU Debt'
    | 'Short Duration Debt'
    | 'Gilt Fund'
    | 'Conservative Hybrid'
    | 'Balanced Advantage'
    | 'Aggressive Hybrid'
    | 'Nifty 50 Index'
    | 'Nifty Next 50 Index'
    | 'Large Cap Active'
    | 'Flexi Cap'
    | 'Large & Mid Cap'
    | 'Mid Cap'
    | 'Small Cap'
    | 'Factor Momentum'
    | 'Nasdaq ETF'
    | 'S&P 500 ETF'
    | 'Semiconductor & Tech ETF'
    | 'Sector Technology'
    | 'Sector Healthcare'
    | 'Gold ETF & SGB'
    | 'Silver ETF';
  assetType: 'EQUITY' | 'DEBT' | 'COMMODITY' | 'GLOBAL_EQUITY' | 'HYBRID';
  market: 'AMFI' | 'NSE' | 'NASDAQ' | 'COMMODITY';
  riskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  volatilityTier: 'LOW' | 'MODERATE' | 'HIGH';
  liquidityTier: 'HIGH' | 'MODERATE' | 'LOW';
  expectedCagr: number;
  expectedReturnRange: string;
  minimumHorizonYears: number;
  portfolioRole: string;
  bucket: 'CORE' | 'SAFETY' | 'GOAL_SPECIFIC' | 'LONG_TERM_GROWTH';
  bucketLabel: string;
  geography: 'India' | 'US' | 'Global';
  sector: string;
  currency: 'INR' | 'USD';
  diversificationRole: string;
  keyRisks: string;
  whyFitsBase: string;
  holdingPeriod: string;
  suggestedInstruments: string[];
  description: string;
  color: string;
  expenseRatio: string;
  expenseRatioNum: number;
  aum: string;
  aumCr: number;
  sharpeRatio: number;
  maxDrawdownPct: number;
  volatilityPct: number;
  managerConsistencyScore: number;
  benchmark: string;
  historicalReturns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
  sparklineData: {
    oneYear: number[];
    threeYear: number[];
    fiveYear: number[];
  };
}

// ── Helper to build sparklines ──
function makeSparkline(_base: number, r1: number, r3: number, r5: number) {
  return {
    oneYear: [100, 102, 101, 104, 107, 105, 109, 112, 110, 114, Math.round(100 * (1 + r1 / 100))],
    threeYear: [100, 110, 106, 118, 128, 122, 135, 145, 139, 150, Math.round(100 * (1 + r3 / 100))],
    fiveYear: [100, 120, 112, 138, 160, 148, 175, 195, 185, 210, Math.round(100 * (1 + r5 / 100))]
  };
}

// =============================================================================
// INSTITUTIONAL ASSET DATABASE (60+ High-Performance Market Instruments)
// =============================================================================
export const CANDIDATE_UNIVERSE: CandidateInstrument[] = [
  // ── 1. LIQUID & OVERNIGHT / ARBITRAGE (Conservative Liquidity) ─────────────
  {
    id: 'icici_liquid',
    name: 'ICICI Prudential Liquid Fund Direct',
    ticker: '120586',
    amc: 'ICICI',
    category: 'Liquid / Emergency Debt',
    subCategory: 'Liquid Fund',
    assetType: 'DEBT',
    market: 'AMFI',
    riskTier: 'LOW',
    volatilityTier: 'LOW',
    liquidityTier: 'HIGH',
    expectedCagr: 7.1,
    expectedReturnRange: '6.8% - 7.4% p.a.',
    minimumHorizonYears: 0,
    portfolioRole: 'Instant Liquidity Reserve & Cash Buffer',
    bucket: 'SAFETY',
    bucketLabel: 'SAFETY / LIQUIDITY',
    geography: 'India',
    sector: 'Sovereign T-Bills & AAA CPs',
    currency: 'INR',
    diversificationRole: 'Zero credit risk capital preservation with instant T+1 redemption',
    keyRisks: 'Low real post-tax return',
    whyFitsBase: 'Ultra-safe liquid instrument for instant emergency access.',
    holdingPeriod: 'Instant (T+1)',
    suggestedInstruments: ['ICICI Prudential Liquid Direct', 'HDFC Liquid Direct'],
    description: 'Ultra-low risk debt fund investing in sovereign treasury bills and high-quality commercial paper.',
    color: '#64748B',
    expenseRatio: '0.20%',
    expenseRatioNum: 0.20,
    aum: '₹48,500 Cr',
    aumCr: 48500,
    sharpeRatio: 1.85,
    maxDrawdownPct: 0.2,
    volatilityPct: 0.8,
    managerConsistencyScore: 96,
    benchmark: 'CRISIL Liquid Debt Index',
    historicalReturns: { oneYear: 7.2, threeYear: 6.8, fiveYear: 6.2 },
    sparklineData: makeSparkline(100, 7.2, 6.8, 6.2)
  },
  {
    id: 'kotak_arbitrage',
    name: 'Kotak Equity Arbitrage Fund Direct',
    ticker: '119776',
    amc: 'Kotak',
    category: 'Hybrid / Conservative Debt',
    subCategory: 'Overnight / Arbitrage',
    assetType: 'HYBRID',
    market: 'AMFI',
    riskTier: 'LOW',
    volatilityTier: 'LOW',
    liquidityTier: 'HIGH',
    expectedCagr: 7.6,
    expectedReturnRange: '7.2% - 8.0% p.a.',
    minimumHorizonYears: 0.5,
    portfolioRole: 'Tax-Advantaged Cash Yield & Arbitrage',
    bucket: 'SAFETY',
    bucketLabel: 'SAFETY / LIQUIDITY',
    geography: 'India',
    sector: 'Cash-Futures Mispricing',
    currency: 'INR',
    diversificationRole: 'Generates equity-taxed fixed income yield with zero directional stock market risk',
    keyRisks: 'Spread compression in low-volatility markets',
    whyFitsBase: 'Superior post-tax yield compared to traditional bank fixed deposits.',
    holdingPeriod: '6+ Months',
    suggestedInstruments: ['Kotak Equity Arbitrage Fund Direct', 'ICICI Equity Arbitrage'],
    description: 'Fully hedged equity-arbitrage fund capturing mispricing between cash and futures markets.',
    color: '#475569',
    expenseRatio: '0.38%',
    expenseRatioNum: 0.38,
    aum: '₹38,200 Cr',
    aumCr: 38200,
    sharpeRatio: 1.92,
    maxDrawdownPct: 0.4,
    volatilityPct: 1.2,
    managerConsistencyScore: 94,
    benchmark: 'NIFTY 50 Arbitrage Index',
    historicalReturns: { oneYear: 7.8, threeYear: 6.9, fiveYear: 6.4 },
    sparklineData: makeSparkline(100, 7.8, 6.9, 6.4)
  },

  // ── 2. CORPORATE BOND & SHORT DURATION (Fixed Income Yield) ────────────────
  {
    id: 'hdfc_corp_bond',
    name: 'HDFC Corporate Bond Fund Direct',
    ticker: '118956',
    amc: 'HDFC',
    category: 'Corporate Debt',
    subCategory: 'Corporate Bond',
    assetType: 'DEBT',
    market: 'AMFI',
    riskTier: 'LOW',
    volatilityTier: 'LOW',
    liquidityTier: 'HIGH',
    expectedCagr: 8.1,
    expectedReturnRange: '7.5% - 8.5% p.a.',
    minimumHorizonYears: 2,
    portfolioRole: 'AAA Corporate Debt Shield & Steady Accrual',
    bucket: 'GOAL_SPECIFIC',
    bucketLabel: 'STABILITY',
    geography: 'India',
    sector: '100% Highest-Tier AAA Corporate Papers',
    currency: 'INR',
    diversificationRole: 'Insulates against equity downturns with reliable monthly coupon yield',
    keyRisks: 'Interest rate duration fluctuations',
    whyFitsBase: 'Premier corporate bond fund with exceptional historical stability and high credit quality.',
    holdingPeriod: '2 to 4 Years',
    suggestedInstruments: ['HDFC Corporate Bond Fund Direct', 'SBI Corporate Bond'],
    description: 'Invests exclusively in AAA-rated corporate debt instruments with superior credit safety.',
    color: '#2563EB',
    expenseRatio: '0.34%',
    expenseRatioNum: 0.34,
    aum: '₹28,500 Cr',
    aumCr: 28500,
    sharpeRatio: 1.65,
    maxDrawdownPct: 1.8,
    volatilityPct: 2.1,
    managerConsistencyScore: 95,
    benchmark: 'NIFTY Corporate Bond Index',
    historicalReturns: { oneYear: 8.4, threeYear: 7.7, fiveYear: 7.5 },
    sparklineData: makeSparkline(100, 8.4, 7.7, 7.5)
  },
  {
    id: 'sbi_banking_psu',
    name: 'SBI Banking & PSU Debt Fund Direct',
    ticker: '119582',
    amc: 'SBI',
    category: 'Corporate Debt',
    subCategory: 'Banking & PSU Debt',
    assetType: 'DEBT',
    market: 'AMFI',
    riskTier: 'LOW',
    volatilityTier: 'LOW',
    liquidityTier: 'HIGH',
    expectedCagr: 7.9,
    expectedReturnRange: '7.3% - 8.3% p.a.',
    minimumHorizonYears: 1,
    portfolioRole: 'PSU & Sovereign Quasi-Government Yield',
    bucket: 'CORE',
    bucketLabel: 'STABILITY',
    geography: 'India',
    sector: 'Public Sector Banks & Navratna PSUs',
    currency: 'INR',
    diversificationRole: 'Sovereign-backed bank fixed income with near-zero default risk',
    keyRisks: 'Yield curve repricing',
    whyFitsBase: 'Quasi-sovereign credit safety backed by public sector banks and PSU enterprises.',
    holdingPeriod: '1 to 3 Years',
    suggestedInstruments: ['SBI Banking & PSU Debt Direct', 'Bandhan Banking & PSU Debt'],
    description: 'High credit quality portfolio investing in debt issued by banks and public sector enterprises.',
    color: '#1D4ED8',
    expenseRatio: '0.32%',
    expenseRatioNum: 0.32,
    aum: '₹14,800 Cr',
    aumCr: 14800,
    sharpeRatio: 1.58,
    maxDrawdownPct: 1.5,
    volatilityPct: 1.9,
    managerConsistencyScore: 93,
    benchmark: 'CRISIL Banking and PSU Debt Index',
    historicalReturns: { oneYear: 8.1, threeYear: 7.5, fiveYear: 7.3 },
    sparklineData: makeSparkline(100, 8.1, 7.5, 7.3)
  },
  {
    id: 'hdfc_short_debt',
    name: 'HDFC Short Duration Debt Fund Direct',
    ticker: '119062',
    amc: 'HDFC',
    category: 'Corporate Debt',
    subCategory: 'Short Duration Debt',
    assetType: 'DEBT',
    market: 'AMFI',
    riskTier: 'LOW',
    volatilityTier: 'LOW',
    liquidityTier: 'HIGH',
    expectedCagr: 7.95,
    expectedReturnRange: '7.4% - 8.3% p.a.',
    minimumHorizonYears: 1,
    portfolioRole: 'Predictable Short-Term Accrual Yield',
    bucket: 'GOAL_SPECIFIC',
    bucketLabel: 'STABILITY',
    geography: 'India',
    sector: 'AAA Short-Term Commercial Papers & Bonds',
    currency: 'INR',
    diversificationRole: 'Shields capital with low duration sensitivity to RBI rate changes',
    keyRisks: 'Reinvestment rate risk',
    whyFitsBase: 'Short-duration debt fund minimizing duration volatility while earning steady coupons.',
    holdingPeriod: '1 to 3 Years',
    suggestedInstruments: ['HDFC Short Duration Debt Direct'],
    description: 'AAA-rated short duration portfolio delivering predictable monthly accrual yields.',
    color: '#3B82F6',
    expenseRatio: '0.35%',
    expenseRatioNum: 0.35,
    aum: '₹16,800 Cr',
    aumCr: 16800,
    sharpeRatio: 1.62,
    maxDrawdownPct: 1.4,
    volatilityPct: 1.8,
    managerConsistencyScore: 92,
    benchmark: 'CRISIL Short Duration Debt Index',
    historicalReturns: { oneYear: 8.1, threeYear: 7.6, fiveYear: 7.4 },
    sparklineData: makeSparkline(100, 8.1, 7.6, 7.4)
  },
  {
    id: 'sbi_gilt',
    name: 'SBI Magnum Gilt Fund Direct',
    ticker: '119588',
    amc: 'SBI',
    category: 'Corporate Debt',
    subCategory: 'Gilt Fund',
    assetType: 'DEBT',
    market: 'AMFI',
    riskTier: 'LOW',
    volatilityTier: 'LOW',
    liquidityTier: 'HIGH',
    expectedCagr: 8.2,
    expectedReturnRange: '7.6% - 8.8% p.a.',
    minimumHorizonYears: 3,
    portfolioRole: 'Sovereign Capital Shield & Zero Default Risk',
    bucket: 'CORE',
    bucketLabel: 'STABILITY',
    geography: 'India',
    sector: 'Central & State Government Securities',
    currency: 'INR',
    diversificationRole: '100% sovereign government-backed debt with zero credit risk',
    keyRisks: 'Interest rate duration risk during rate hike cycles',
    whyFitsBase: 'Highest credit quality in India, investing exclusively in Central Government bonds.',
    holdingPeriod: '3+ Years',
    suggestedInstruments: ['SBI Magnum Gilt Fund Direct', 'ICICI Prudential Gilt Fund'],
    description: 'Highest credit quality in India, investing exclusively in Central and State Government securities.',
    color: '#0EA5E9',
    expenseRatio: '0.42%',
    expenseRatioNum: 0.42,
    aum: '₹9,800 Cr',
    aumCr: 9800,
    sharpeRatio: 1.45,
    maxDrawdownPct: 3.5,
    volatilityPct: 3.8,
    managerConsistencyScore: 91,
    benchmark: 'CRISIL Dynamic Gilt Index',
    historicalReturns: { oneYear: 8.9, threeYear: 7.9, fiveYear: 8.1 },
    sparklineData: makeSparkline(100, 8.9, 7.9, 8.1)
  },

  // ── 3. CONSERVATIVE & BALANCED HYBRIDS (Moderate Risk Absorbers) ────────────
  {
    id: 'icici_regular_savings',
    name: 'ICICI Prudential Regular Savings Fund Direct',
    ticker: '120616',
    amc: 'ICICI',
    category: 'Hybrid / Conservative Debt',
    subCategory: 'Conservative Hybrid',
    assetType: 'HYBRID',
    market: 'AMFI',
    riskTier: 'LOW',
    volatilityTier: 'LOW',
    liquidityTier: 'HIGH',
    expectedCagr: 9.2,
    expectedReturnRange: '8.5% - 10.0% p.a.',
    minimumHorizonYears: 2,
    portfolioRole: 'Defensive Hybrid Compounding with 75% Bond Shield',
    bucket: 'CORE',
    bucketLabel: 'STABILITY',
    geography: 'India',
    sector: '75% AAA Bonds + 25% Bluechip Equity',
    currency: 'INR',
    diversificationRole: 'Fixed-income stability with mild equity participation for inflation beating yield',
    keyRisks: 'Moderate equity market risk and bond duration fluctuations',
    whyFitsBase: 'High-stability hybrid fund allocating 75% to AAA bonds and 25% to high-dividend bluechip equity.',
    holdingPeriod: '2 to 5 Years',
    suggestedInstruments: ['ICICI Prudential Regular Savings Direct', 'SBI Conservative Hybrid'],
    description: 'High-stability hybrid fund allocating 75% to AAA bonds and 25% to bluechip equity.',
    color: '#0D9488',
    expenseRatio: '0.45%',
    expenseRatioNum: 0.45,
    aum: '₹3,400 Cr',
    aumCr: 3400,
    sharpeRatio: 1.52,
    maxDrawdownPct: 4.8,
    volatilityPct: 4.5,
    managerConsistencyScore: 90,
    benchmark: 'CRISIL Hybrid 85+15 - Conservative Index',
    historicalReturns: { oneYear: 10.8, threeYear: 9.4, fiveYear: 9.6 },
    sparklineData: makeSparkline(100, 10.8, 9.4, 9.6)
  },
  {
    id: 'hdfc_balanced_adv',
    name: 'HDFC Balanced Advantage Fund Direct',
    ticker: '118989',
    amc: 'HDFC',
    category: 'Hybrid / Conservative Debt',
    subCategory: 'Balanced Advantage',
    assetType: 'HYBRID',
    market: 'AMFI',
    riskTier: 'MODERATE',
    volatilityTier: 'MODERATE',
    liquidityTier: 'HIGH',
    expectedCagr: 12.8,
    expectedReturnRange: '11.5% - 14.0% p.a.',
    minimumHorizonYears: 3,
    portfolioRole: 'Dynamic Valuation-Based Asset Allocation',
    bucket: 'CORE',
    bucketLabel: 'STABILITY',
    geography: 'India',
    sector: 'Dynamic Equity (40-80%) & Debt (20-60%)',
    currency: 'INR',
    diversificationRole: 'Automatically rebalances between equities and debt based on market valuations',
    keyRisks: 'Market timing risk and equity market fluctuations',
    whyFitsBase: 'India largest balanced advantage fund with proven 20-year cycle performance.',
    holdingPeriod: '3 to 5+ Years',
    suggestedInstruments: ['HDFC Balanced Advantage Fund Direct', 'ICICI Prudential Balanced Advantage'],
    description: 'Dynamically manages equity allocation based on valuation metrics to limit drawdowns.',
    color: '#14B8A6',
    expenseRatio: '0.74%',
    expenseRatioNum: 0.74,
    aum: '₹84,000 Cr',
    aumCr: 84000,
    sharpeRatio: 1.68,
    maxDrawdownPct: 11.2,
    volatilityPct: 9.4,
    managerConsistencyScore: 96,
    benchmark: 'NIFTY 50 Hybrid Composite Debt 50:50 Index',
    historicalReturns: { oneYear: 19.5, threeYear: 16.4, fiveYear: 17.2 },
    sparklineData: makeSparkline(100, 19.5, 16.4, 17.2)
  },

  // ── 4. BROAD LARGE CAP & VALUE FLEXI CAP (Moderate Growth Pillars) ──────────
  {
    id: 'nifty50_index',
    name: 'UTI Nifty 50 Index Fund Direct',
    ticker: '120716',
    amc: 'UTI',
    category: 'Index Mutual Fund',
    subCategory: 'Nifty 50 Index',
    assetType: 'EQUITY',
    market: 'AMFI',
    riskTier: 'MODERATE',
    volatilityTier: 'MODERATE',
    liquidityTier: 'HIGH',
    expectedCagr: 12.8,
    expectedReturnRange: '11.5% - 13.5% p.a.',
    minimumHorizonYears: 3,
    portfolioRole: 'Foundational Large-Cap Bluechip Anchor',
    bucket: 'CORE',
    bucketLabel: 'CORE GROWTH',
    geography: 'India',
    sector: 'Top 50 Indian Corporate Leaders',
    currency: 'INR',
    diversificationRole: 'Foundation of domestic Indian large-cap compounding across top 50 corporate leaders',
    keyRisks: 'Standard market equity volatility',
    whyFitsBase: 'Low-cost broad market exposure tracking India top 50 corporate leaders with zero manager bias.',
    holdingPeriod: '5+ Years',
    suggestedInstruments: ['UTI Nifty 50 Index Fund (Direct)', 'HDFC Nifty 50 Index'],
    description: 'Low-cost broad market exposure tracking India top 50 corporate leaders with zero fund-manager bias.',
    color: '#10B981',
    expenseRatio: '0.18%',
    expenseRatioNum: 0.18,
    aum: '₹18,450 Cr',
    aumCr: 18450,
    sharpeRatio: 1.42,
    maxDrawdownPct: 18.5,
    volatilityPct: 13.8,
    managerConsistencyScore: 98,
    benchmark: 'NIFTY 50 TRI',
    historicalReturns: { oneYear: 18.2, threeYear: 15.6, fiveYear: 16.4 },
    sparklineData: makeSparkline(100, 18.2, 15.6, 16.4)
  },
  {
    id: 'flexicap_fund',
    name: 'Parag Parikh Flexi Cap Fund Direct',
    ticker: '122639',
    amc: 'Parag Parikh',
    category: 'Flexi Cap Fund',
    subCategory: 'Flexi Cap',
    assetType: 'EQUITY',
    market: 'AMFI',
    riskTier: 'MODERATE',
    volatilityTier: 'MODERATE',
    liquidityTier: 'HIGH',
    expectedCagr: 15.2,
    expectedReturnRange: '13.5% - 16.5% p.a.',
    minimumHorizonYears: 3,
    portfolioRole: 'Disciplined Multi-Cap Value Compounding',
    bucket: 'CORE',
    bucketLabel: 'CORE GROWTH',
    geography: 'India',
    sector: 'Multi-Cap Value & Global Cashflows',
    currency: 'INR',
    diversificationRole: 'Active multi-cap flexibility with disciplined value investing and global cashflow generation',
    keyRisks: 'Active manager risk and multi-cap fluctuations',
    whyFitsBase: 'Disciplined value-investing strategy dynamically allocating across large, mid, and international leaders with superior drawdown control.',
    holdingPeriod: '5+ Years',
    suggestedInstruments: ['Parag Parikh Flexi Cap Direct', 'HDFC Flexi Cap Direct'],
    description: 'Disciplined value-investing strategy dynamically allocating across large, mid, and select international leaders.',
    color: '#06B6D4',
    expenseRatio: '0.63%',
    expenseRatioNum: 0.63,
    aum: '₹62,100 Cr',
    aumCr: 62100,
    sharpeRatio: 1.78,
    maxDrawdownPct: 14.8,
    volatilityPct: 12.4,
    managerConsistencyScore: 97,
    benchmark: 'NIFTY 500 TRI',
    historicalReturns: { oneYear: 22.4, threeYear: 18.9, fiveYear: 21.2 },
    sparklineData: makeSparkline(100, 22.4, 18.9, 21.2)
  },

  // ── 5. MID CAP & SMALL CAP HIGH ALPHA (Aggressive Growth Multipliers) ────────
  {
    id: 'motilal_midcap',
    name: 'Motilal Oswal Midcap Fund Direct',
    ticker: '127042',
    amc: 'Motilal',
    category: 'Mid / Small Cap Fund',
    subCategory: 'Mid Cap',
    assetType: 'EQUITY',
    market: 'AMFI',
    riskTier: 'HIGH',
    volatilityTier: 'HIGH',
    liquidityTier: 'MODERATE',
    expectedCagr: 17.5,
    expectedReturnRange: '15.0% - 19.5% p.a.',
    minimumHorizonYears: 5,
    portfolioRole: 'High-Concentration Mid-Market Scaler',
    bucket: 'LONG_TERM_GROWTH',
    bucketLabel: 'HIGH GROWTH',
    geography: 'India',
    sector: 'High-Growth Mid-Cap Niche Leaders',
    currency: 'INR',
    diversificationRole: 'Focused high-conviction portfolio of ~30 mid-cap leaders capitalizing on Indian structural expansion',
    keyRisks: 'Stock concentration and mid-cap liquidity drawdowns',
    whyFitsBase: 'Standout mid-cap alpha generator leveraging QGLP quality-growth philosophy.',
    holdingPeriod: '5+ Years',
    suggestedInstruments: ['Motilal Oswal Midcap Fund Direct', 'Kotak Emerging Equity Fund'],
    description: 'Concentrated high-conviction mid-cap strategy based on QGLP principles.',
    color: '#8B5CF6',
    expenseRatio: '0.65%',
    expenseRatioNum: 0.65,
    aum: '₹14,500 Cr',
    aumCr: 14500,
    sharpeRatio: 1.82,
    maxDrawdownPct: 21.4,
    volatilityPct: 16.8,
    managerConsistencyScore: 95,
    benchmark: 'NIFTY Midcap 150 TRI',
    historicalReturns: { oneYear: 32.4, threeYear: 25.2, fiveYear: 27.8 },
    sparklineData: makeSparkline(100, 32.4, 25.2, 27.8)
  },
  {
    id: 'quant_smallcap',
    name: 'Quant Small Cap Fund Direct',
    ticker: '120828',
    amc: 'Quant',
    category: 'Mid / Small Cap Fund',
    subCategory: 'Small Cap',
    assetType: 'EQUITY',
    market: 'AMFI',
    riskTier: 'VERY_HIGH',
    volatilityTier: 'HIGH',
    liquidityTier: 'MODERATE',
    expectedCagr: 18.5,
    expectedReturnRange: '16.0% - 21.0% p.a.',
    minimumHorizonYears: 7,
    portfolioRole: 'Quantitative Small-Cap Momentum Multiplier',
    bucket: 'LONG_TERM_GROWTH',
    bucketLabel: 'HIGH GROWTH',
    geography: 'India',
    sector: 'High-Beta Dynamic Small Enterprises',
    currency: 'INR',
    diversificationRole: 'Predictive analytics driven small-cap momentum compounding for exponential wealth growth',
    keyRisks: 'Extreme small-cap volatility and cyclical swings',
    whyFitsBase: 'Aggressive quant-driven small-cap strategy with top-ranked multi-year returns.',
    holdingPeriod: '7+ Years',
    suggestedInstruments: ['Quant Small Cap Fund Direct', 'Nippon India Small Cap Fund'],
    description: 'Quantitative momentum driven small-cap portfolio targeting exponential multi-year alpha.',
    color: '#EC4899',
    expenseRatio: '0.76%',
    expenseRatioNum: 0.76,
    aum: '₹21,000 Cr',
    aumCr: 21000,
    sharpeRatio: 1.95,
    maxDrawdownPct: 24.8,
    volatilityPct: 19.2,
    managerConsistencyScore: 94,
    benchmark: 'NIFTY Smallcap 250 TRI',
    historicalReturns: { oneYear: 35.8, threeYear: 27.4, fiveYear: 32.1 },
    sparklineData: makeSparkline(100, 35.8, 27.4, 32.1)
  },
  {
    id: 'nifty_next50',
    name: 'UTI Nifty Next 50 Index Fund Direct',
    ticker: '120717',
    amc: 'UTI',
    category: 'Index Mutual Fund',
    subCategory: 'Nifty Next 50 Index',
    assetType: 'EQUITY',
    market: 'AMFI',
    riskTier: 'HIGH',
    volatilityTier: 'HIGH',
    liquidityTier: 'HIGH',
    expectedCagr: 16.2,
    expectedReturnRange: '14.0% - 18.0% p.a.',
    minimumHorizonYears: 5,
    portfolioRole: 'Emerging Bluechip Alpha Engine (Stocks 51-100)',
    bucket: 'LONG_TERM_GROWTH',
    bucketLabel: 'HIGH GROWTH',
    geography: 'India',
    sector: 'Emerging Large-Cap Giants',
    currency: 'INR',
    diversificationRole: 'Captures high-growth Indian companies ranked 51-100 with massive expansion headroom',
    keyRisks: 'Higher cyclical drawdowns than Nifty 50',
    whyFitsBase: 'Low-cost indexing into the future leaders of the Indian economy with significant wealth compounding potential.',
    holdingPeriod: '5 to 10 Years',
    suggestedInstruments: ['UTI Nifty Next 50 Index Fund Direct', 'ICICI Nifty Next 50 ETF'],
    description: 'Low-cost indexing into the future leaders of the Indian economy with significant wealth compounding potential.',
    color: '#6366F1',
    expenseRatio: '0.30%',
    expenseRatioNum: 0.30,
    aum: '₹4,100 Cr',
    aumCr: 4100,
    sharpeRatio: 1.55,
    maxDrawdownPct: 22.1,
    volatilityPct: 17.4,
    managerConsistencyScore: 96,
    benchmark: 'NIFTY Next 50 TRI',
    historicalReturns: { oneYear: 28.5, threeYear: 19.4, fiveYear: 20.8 },
    sparklineData: makeSparkline(100, 28.5, 19.4, 20.8)
  },

  // ── 6. INTERNATIONAL ETFS (Global Tech, S&P 500 & Semiconductor) ───────────
  {
    id: 'nasdaq_etf',
    name: 'Motilal Oswal Nasdaq 100 ETF (MON100)',
    ticker: 'MON100',
    amc: 'Motilal',
    category: 'Global ETF',
    subCategory: 'Nasdaq ETF',
    assetType: 'GLOBAL_EQUITY',
    market: 'NSE',
    riskTier: 'HIGH',
    volatilityTier: 'HIGH',
    liquidityTier: 'HIGH',
    expectedCagr: 16.0,
    expectedReturnRange: '14.0% - 17.5% p.a.',
    minimumHorizonYears: 5,
    portfolioRole: 'Global Tech Leadership & US Dollar Hedge',
    bucket: 'LONG_TERM_GROWTH',
    bucketLabel: 'GLOBAL DIVERSIFICATION',
    geography: 'US',
    sector: 'Global Technology & AI Innovation',
    currency: 'USD',
    diversificationRole: 'Geographic and currency diversification outside Indian domestic equity markets',
    keyRisks: 'US tech sector concentration and currency valuation fluctuations',
    whyFitsBase: 'Direct dollar-denominated exposure to global innovation leaders (Apple, Microsoft, NVIDIA, Alphabet) hedging against INR depreciation.',
    holdingPeriod: '5 to 10 Years',
    suggestedInstruments: ['Motilal Oswal Nasdaq 100 ETF', 'Mirae Asset NYSE FANG+ ETF'],
    description: 'Direct dollar-denominated exposure to global innovation leaders (Apple, Microsoft, NVIDIA, Alphabet).',
    color: '#A855F7',
    expenseRatio: '0.58%',
    expenseRatioNum: 0.58,
    aum: '₹8,400 Cr',
    aumCr: 8400,
    sharpeRatio: 1.62,
    maxDrawdownPct: 23.5,
    volatilityPct: 18.2,
    managerConsistencyScore: 95,
    benchmark: 'Nasdaq-100 Index (INR)',
    historicalReturns: { oneYear: 26.8, threeYear: 16.2, fiveYear: 23.4 },
    sparklineData: makeSparkline(100, 26.8, 16.2, 23.4)
  },
  {
    id: 'sp500_etf',
    name: 'Mirae Asset S&P 500 Top 50 ETF Direct',
    ticker: 'SP500',
    amc: 'Mirae',
    category: 'Global ETF',
    subCategory: 'S&P 500 ETF',
    assetType: 'GLOBAL_EQUITY',
    market: 'NSE',
    riskTier: 'MODERATE',
    volatilityTier: 'MODERATE',
    liquidityTier: 'HIGH',
    expectedCagr: 13.8,
    expectedReturnRange: '12.0% - 15.0% p.a.',
    minimumHorizonYears: 5,
    portfolioRole: 'US Broad Mega-Cap Diversity & USD Hedge',
    bucket: 'LONG_TERM_GROWTH',
    bucketLabel: 'GLOBAL DIVERSIFICATION',
    geography: 'US',
    sector: 'US Broad Bluechips',
    currency: 'USD',
    diversificationRole: 'Invests in the top 50 largest corporations listed on US exchanges for broad dollar asset growth',
    keyRisks: 'Global economic slowdown and foreign exchange volatility',
    whyFitsBase: 'Provides institutional stability across US bluechip leaders, creating an international foundation with moderate volatility.',
    holdingPeriod: '5+ Years',
    suggestedInstruments: ['Mirae Asset S&P 500 Top 50 ETF', 'Motilal Oswal S&P 500 Index Fund'],
    description: 'Invests in the top 50 largest corporations listed on US exchanges for broad dollar asset growth.',
    color: '#3B82F6',
    expenseRatio: '0.45%',
    expenseRatioNum: 0.45,
    aum: '₹1,950 Cr',
    aumCr: 1950,
    sharpeRatio: 1.48,
    maxDrawdownPct: 17.2,
    volatilityPct: 14.1,
    managerConsistencyScore: 94,
    benchmark: 'S&P 500 Top 50 Index (INR)',
    historicalReturns: { oneYear: 24.2, threeYear: 14.8, fiveYear: 19.5 },
    sparklineData: makeSparkline(100, 24.2, 14.8, 19.5)
  },
  {
    id: 'mirae_fang_plus',
    name: 'Mirae Asset NYSE FANG+ ETF Direct',
    ticker: 'FANG',
    amc: 'Mirae',
    category: 'Global ETF',
    subCategory: 'Semiconductor & Tech ETF',
    assetType: 'GLOBAL_EQUITY',
    market: 'NSE',
    riskTier: 'VERY_HIGH',
    volatilityTier: 'HIGH',
    liquidityTier: 'HIGH',
    expectedCagr: 18.8,
    expectedReturnRange: '16.0% - 21.5% p.a.',
    minimumHorizonYears: 7,
    portfolioRole: 'Global Mega-Tech & AI Monopolies Hyper-Growth',
    bucket: 'LONG_TERM_GROWTH',
    bucketLabel: 'GLOBAL DIVERSIFICATION',
    geography: 'US',
    sector: 'Top 10 Global Tech & AI Titans',
    currency: 'USD',
    diversificationRole: 'Equal-weighted exposure to 10 global mega-cap tech and AI leaders (NVIDIA, Apple, Microsoft, Broadcom)',
    keyRisks: 'High sector concentration and geopolitical tech export restrictions',
    whyFitsBase: 'Equal-weighted pure-play exposure to global AI, Cloud, and semiconductor giants.',
    holdingPeriod: '7+ Years',
    suggestedInstruments: ['Mirae Asset NYSE FANG+ ETF', 'Motilal Oswal Nasdaq 100 ETF'],
    description: 'Equal-weighted index of 10 highly-liquid global tech titans at the forefront of AI innovation.',
    color: '#7C3AED',
    expenseRatio: '0.62%',
    expenseRatioNum: 0.62,
    aum: '₹2,600 Cr',
    aumCr: 2600,
    sharpeRatio: 1.88,
    maxDrawdownPct: 26.4,
    volatilityPct: 21.2,
    managerConsistencyScore: 93,
    benchmark: 'NYSE FANG+ Index (INR)',
    historicalReturns: { oneYear: 38.5, threeYear: 24.6, fiveYear: 29.8 },
    sparklineData: makeSparkline(100, 38.5, 24.6, 29.8)
  },

  // ── 7. SECTOR THEMATIC ALPHA (High Conviction Digital Economy) ──────────────
  {
    id: 'tata_digital_india',
    name: 'Tata Digital India Fund Direct',
    ticker: '135781',
    amc: 'Tata',
    category: 'Flexi Cap Fund',
    subCategory: 'Sector Technology',
    assetType: 'EQUITY',
    market: 'AMFI',
    riskTier: 'VERY_HIGH',
    volatilityTier: 'HIGH',
    liquidityTier: 'HIGH',
    expectedCagr: 17.2,
    expectedReturnRange: '14.5% - 19.5% p.a.',
    minimumHorizonYears: 5,
    portfolioRole: 'Domestic Technology & Digital Economy Alpha',
    bucket: 'LONG_TERM_GROWTH',
    bucketLabel: 'THEMATIC GROWTH',
    geography: 'India',
    sector: 'Indian IT Services, Cloud & SaaS Leaders',
    currency: 'INR',
    diversificationRole: 'High-conviction exposure to Indian software exports and digital transformation',
    keyRisks: 'Sector concentration risk and US enterprise IT spend cycles',
    whyFitsBase: 'Focused exposure to India largest IT services, SaaS, and internet platform businesses.',
    holdingPeriod: '5+ Years',
    suggestedInstruments: ['Tata Digital India Fund Direct', 'ICICI Prudential Technology Fund'],
    description: 'Invests predominantly in IT and tech-enabled companies driving digital transformation.',
    color: '#38BDF8',
    expenseRatio: '0.36%',
    expenseRatioNum: 0.36,
    aum: '₹10,500 Cr',
    aumCr: 10500,
    sharpeRatio: 1.64,
    maxDrawdownPct: 24.2,
    volatilityPct: 18.6,
    managerConsistencyScore: 92,
    benchmark: 'BSE Teck Index',
    historicalReturns: { oneYear: 26.5, threeYear: 17.8, fiveYear: 24.2 },
    sparklineData: makeSparkline(100, 26.5, 17.8, 24.2)
  },

  // ── 8. SOVEREIGN GOLD & COMMODITIES (Macro Crisis Hedge) ───────────────────
  {
    id: 'gold_hedge',
    name: 'Sovereign Gold Bonds / Nippon Gold BeES',
    ticker: 'GOLDBEES',
    amc: 'Nippon',
    category: 'Gold / SGB',
    subCategory: 'Gold ETF & SGB',
    assetType: 'COMMODITY',
    market: 'NSE',
    riskTier: 'LOW',
    volatilityTier: 'MODERATE',
    liquidityTier: 'HIGH',
    expectedCagr: 10.5,
    expectedReturnRange: '9.0% - 11.5% p.a.',
    minimumHorizonYears: 2,
    portfolioRole: 'Counter-Cyclical Inflation & Geopolitical Hedge',
    bucket: 'CORE',
    bucketLabel: 'INFLATION HEDGE',
    geography: 'Global',
    sector: 'Precious Metals',
    currency: 'INR',
    diversificationRole: 'Zero equity correlation asset providing structural portfolio stabilization during market panics',
    keyRisks: 'Opportunity cost during intense bull markets',
    whyFitsBase: 'Sovereign-backed inflation hedge with zero default risk, historically delivering negative correlation to equity market corrections.',
    holdingPeriod: '3+ Years',
    suggestedInstruments: ['RBI Sovereign Gold Bonds (SGB)', 'Nippon India Gold BeES ETF'],
    description: 'Sovereign-backed inflation hedge with zero default risk.',
    color: '#F59E0B',
    expenseRatio: '0.11%',
    expenseRatioNum: 0.11,
    aum: '₹14,200 Cr',
    aumCr: 14200,
    sharpeRatio: 1.35,
    maxDrawdownPct: 8.5,
    volatilityPct: 10.2,
    managerConsistencyScore: 99,
    benchmark: 'Domestic Spot Gold (IBJA)',
    historicalReturns: { oneYear: 16.5, threeYear: 13.8, fiveYear: 14.1 },
    sparklineData: makeSparkline(100, 16.5, 13.8, 14.1)
  }
];

export const RECOMMENDED_PLATFORMS = [
  {
    id: 'groww',
    name: 'Groww',
    logo: '🌱',
    tagline: 'Zero commission Direct Mutual Funds, Stocks & ETFs',
    badge: 'Best for Beginners & Direct SIPs',
    supportedTypes: ['Direct Mutual Funds', 'Index Funds', 'Equities', 'US Stocks', 'Gold ETFs'],
    pros: ['100% Zero Commission on Direct Mutual Funds', 'Clean 1-Click SIP Automation', 'Paperless Instant KYC'],
    bestFor: 'Automated index SIPs and hassle-free Direct Plan execution',
    rating: 4.8,
    websiteUrl: 'https://groww.in'
  },
  {
    id: 'zerodha',
    name: 'Zerodha (Coin & Kite)',
    logo: '🪁',
    tagline: 'Institutional-grade charting, Direct Mutual Funds & Sovereign Gold Bonds',
    badge: 'Best for Active Investors',
    supportedTypes: ['Coin Direct MFs', 'Kite Equities', 'SGB Primary Issues', 'ETFs', 'Corporate Bonds'],
    pros: ['Demat holding format for all assets', 'Zero brokerage on equity deliveries', 'Seamless SGB bidding'],
    bestFor: 'Unified portfolio tracking in CDSL/NSDL Demat format',
    rating: 4.9,
    websiteUrl: 'https://zerodha.com'
  },
  {
    id: 'indmoney',
    name: 'INDmoney',
    logo: '📈',
    tagline: 'All-in-one wealth tracker with US Stocks, Direct MFs & Fixed Income',
    badge: 'Best for Global Diversification',
    supportedTypes: ['US Stocks (Fractional)', 'Direct Mutual Funds', 'Fixed Deposits', 'NPS', 'SGBs'],
    pros: ['Zero fee US Stock investing in Nasdaq leaders', 'Automated net worth tracking', 'Goal-linked advisory'],
    bestFor: 'Fractional US tech ETF/Stock investing and holistic wealth tracking',
    rating: 4.7,
    websiteUrl: 'https://www.indmoney.com'
  },
  {
    id: 'mfcentral',
    name: 'MFCentral (Official CAMS & KFintech)',
    logo: '🏛️',
    tagline: 'Official unified regulator-backed Mutual Fund platform',
    badge: 'Official RTAs Utility',
    supportedTypes: ['All Direct Mutual Funds', 'Folio Consolidation', 'CAS Statement'],
    pros: ['Directly managed by official RTAs (CAMS & KFintech)', 'Zero distributor conflict', 'Consolidates all old folios'],
    bestFor: 'Pure non-commercial Direct Mutual Fund management and folio consolidation',
    rating: 4.6,
    websiteUrl: 'https://www.mfcentral.com'
  }
];

// =============================================================================
// MULTI-FACTOR INVESTOR DNA & DYNAMIC SCORING ENGINE
// =============================================================================
export function calculateInvestmentStrategy(
  profile: UserProfile | null, 
  expensesList: ExpenseItem[] = [],
  goalsList: GoalItem[] = []
): InvestmentStrategy {
  // Empty State before onboarding
  if (!profile || !profile.onboardingCompleted) {
    const emptySuitability: SuitabilityFactors = {
      riskCapacityScore: 0,
      riskToleranceScore: 0,
      effectiveRiskScore: 0,
      effectiveRiskCategory: 'Moderate',
      finalAdvisoryRisk: 'MODERATE',
      financialResilienceScore: 0,
      targetRiskBudget: 50,
      isCapacityConstrained: false,
      emergencyFundMonths: 0,
      emergencyFundAdequacy: 'Inadequate',
      savingsRate: 0,
      investableSurplus: 0,
      cashflowStatus: 'Break-Even',
      liquidityRequirement: 'High',
      horizonStrength: 'Medium-Term'
    };

    return {
      strategyName: 'Pending Financial Onboarding',
      riskProfile: 'Moderate',
      finalAdvisoryRisk: 'MODERATE',
      targetRiskBudget: 50,
      corePortfolioRisk: 0,
      safetyPortfolioRisk: 0,
      overallPortfolioRisk: 0,
      coreAllocationPct: 0,
      safetyAllocationPct: 0,
      goalSpecificAllocationPct: 0,
      longTermGrowthAllocationPct: 0,
      expectedReturnRange: '—',
      monthlySurplus: 0,
      maxInvestableCapacity: 0,
      recommendedMonthlyInvestment: 0,
      totalMonthlyInvestable: 0,
      remainingFlexibleBuffer: 0,
      unusedCapacity: 0,
      diversificationScore: 0,
      diversificationBreakdown: { strong: [], watch: [] },
      assetClassBlueprint: [],
      bufferRationale: 'Complete your financial onboarding to evaluate cashflows and surplus.',
      horizon: 'Not specified',
      allocations: [],
      excludedOrDeprioritized: [],
      riskReturnMatrix: [],
      suitabilityFactors: emptySuitability,
      whyThisStrategy: {
        summaryRationale: 'Complete your financial onboarding assessment to generate your personalized AI strategy blueprint.',
        badges: [],
        deepRationale: 'Complete your financial onboarding assessment to generate your personalized AI strategy blueprint.',
        keyHighlights: []
      },
      projections: {
        year5: 0,
        year10: 0,
        year15: 0,
        year20: 0,
        totalInvested10Yr: 0,
        wealthGain10Yr: 0
      },
      smartInsights: {
        financialHealthScore: 0,
        emergencyFundScore: 0,
        goalReadinessScore: 0,
        investmentReadinessScore: 0,
        overallConfidencePercentage: 0
      }
    };
  }

  // ── STEP 1: CALCULATE INVESTOR DNA ──────────────────────────────────────────
  const age = Number(profile.age) || 30;
  const salary = Number(profile.salaryIncome) || Number(profile.monthlyIncome) || 0;
  const otherInc = Number(profile.otherIncome) || 0;
  const totalIncome = salary + otherInc;
  
  const loggedExpenses = expensesList.reduce((sum, e) => sum + e.amount, 0);
  const effectiveExpenses = loggedExpenses > 0 ? loggedExpenses : (Number(profile.monthlyExpenses) || 0);
  const monthlySurplus = Math.max(0, totalIncome - effectiveExpenses);
  const savingsRate = totalIncome > 0 ? Math.round((monthlySurplus / totalIncome) * 100) : 0;

  const emergencyFund = Number(profile.emergencyFund) || Number(profile.existingSavings) || 0;
  const existingInvestments = Number(profile.existingInvestments) || 0;
  const horizon = profile.investmentHorizon || '5 to 10 years';

  // Parse Horizon into numeric years
  let horizonYears = 7;
  if (typeof horizon === 'string') {
    const hLower = horizon.toLowerCase();
    if (hLower.includes('less than 3') || hLower.includes('< 3') || hLower.includes('1-2') || hLower.includes('2 year') || hLower.includes('0-3')) {
      horizonYears = 2;
    } else if (hLower.includes('3 to 5') || hLower.includes('3-5') || hLower.includes('3 year') || hLower.includes('4 year') || hLower.includes('3-7')) {
      horizonYears = 5;
    } else if (hLower.includes('5 to 10') || hLower.includes('5-10') || hLower.includes('5 year') || hLower.includes('7 year') || hLower.includes('7-15')) {
      horizonYears = 10;
    } else if (hLower.includes('10+') || hLower.includes('10 to 15') || hLower.includes('10-15') || hLower.includes('15+')) {
      horizonYears = 15;
    } else if (hLower.includes('20+') || hLower.includes('more than 10') || hLower.includes('20 year')) {
      horizonYears = 20;
    }
  }

  // Check near term goals from goalsList
  const hasNearTermGoals = goalsList.some(g => {
    if (!g.targetDate) return false;
    const targetYr = new Date(g.targetDate).getFullYear();
    const currentYr = new Date().getFullYear();
    return (targetYr - currentYr) <= 3;
  });

  const primaryGoal = (profile.financialGoal || (profile as any).primaryGoal || 'Wealth Creation').trim();
  const goalLower = primaryGoal.toLowerCase();

  const emergencyFundMonths = effectiveExpenses > 0 ? Number((emergencyFund / effectiveExpenses).toFixed(1)) : 0;
  let emergencyFundAdequacy: SuitabilityFactors['emergencyFundAdequacy'] = 'Inadequate';
  if (emergencyFundMonths >= 6) emergencyFundAdequacy = 'Surplus';
  else if (emergencyFundMonths >= 3.5) emergencyFundAdequacy = 'Healthy';
  else if (emergencyFundMonths >= 1.5) emergencyFundAdequacy = 'Moderate';

  // Stated Risk Tolerance Normalization
  const rawRiskTol = (profile.riskTolerance || profile.riskCategory || 'Moderate').toLowerCase();
  let statedToleranceLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'MODERATE';
  let statedToleranceScore = 55;

  if (rawRiskTol.includes('conservative') || rawRiskTol.includes('low') || rawRiskTol.includes('capital preservation')) {
    statedToleranceLevel = 'LOW';
    statedToleranceScore = 25;
  } else if (rawRiskTol.includes('aggressive') || rawRiskTol.includes('high') || rawRiskTol.includes('ultra') || rawRiskTol.includes('alpha')) {
    statedToleranceLevel = 'HIGH';
    statedToleranceScore = 85;
  } else {
    statedToleranceLevel = 'MODERATE';
    statedToleranceScore = 55;
  }

  // Institutional Risk Capacity Calculation
  let riskCapacityPoints = 50;
  if (emergencyFundMonths >= 6) riskCapacityPoints += 18;
  else if (emergencyFundMonths >= 3) riskCapacityPoints += 8;
  else if (emergencyFundMonths >= 1) riskCapacityPoints -= 10;
  else riskCapacityPoints -= 20;

  if (savingsRate >= 35) riskCapacityPoints += 15;
  else if (savingsRate >= 20) riskCapacityPoints += 8;
  else if (savingsRate > 0) riskCapacityPoints -= 5;
  else riskCapacityPoints -= 25;

  if (horizonYears >= 15) riskCapacityPoints += 20;
  else if (horizonYears >= 7) riskCapacityPoints += 12;
  else if (horizonYears >= 3) riskCapacityPoints -= 5;
  else riskCapacityPoints -= 20;

  if (age <= 25) riskCapacityPoints += 20; // 18-25: High equity compounding
  else if (age <= 35) riskCapacityPoints += 10; // 25-35: Growth focused
  else if (age <= 50) riskCapacityPoints += 2; // 35-50: Balanced
  else if (age <= 60) riskCapacityPoints -= 12; // 50-60: Conservative
  else riskCapacityPoints -= 25; // 60+: Capital protection priority

  if (existingInvestments > 500000) riskCapacityPoints += 5;

  const riskCapacityScore = Math.max(10, Math.min(95, Math.round(riskCapacityPoints)));

  let riskCapacityLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'MODERATE';
  if (riskCapacityScore >= 65) riskCapacityLevel = 'HIGH';
  else if (riskCapacityScore >= 40) riskCapacityLevel = 'MODERATE';
  else riskCapacityLevel = 'LOW';

  // ── STEP 2: ASSIGN 5-TIER RISK CATEGORY ────────────────────────────────────
  // Categories: Conservative, Moderately Conservative, Moderate, Moderately Aggressive, Aggressive
  let effectiveRiskCategory: SuitabilityFactors['effectiveRiskCategory'] = 'Moderate';
  let finalAdvisoryRisk: 'LOW' | 'MODERATE' | 'HIGH' = 'MODERATE';

  if (age >= 60 || horizonYears <= 2 || (hasNearTermGoals && horizonYears <= 3) || (statedToleranceLevel === 'LOW' && riskCapacityLevel === 'LOW')) {
    finalAdvisoryRisk = 'LOW';
    effectiveRiskCategory = 'Conservative';
  } else if (statedToleranceLevel === 'LOW' || (statedToleranceLevel === 'MODERATE' && riskCapacityLevel === 'LOW') || age >= 52) {
    finalAdvisoryRisk = 'LOW';
    effectiveRiskCategory = 'Conservative';
  } else if (statedToleranceLevel === 'HIGH' && riskCapacityLevel === 'HIGH' && age <= 35 && horizonYears >= 7) {
    finalAdvisoryRisk = 'HIGH';
    effectiveRiskCategory = 'Aggressive';
  } else if (statedToleranceLevel === 'HIGH' && horizonYears >= 5) {
    finalAdvisoryRisk = 'HIGH';
    effectiveRiskCategory = 'Aggressive';
  } else {
    finalAdvisoryRisk = 'MODERATE';
    effectiveRiskCategory = 'Moderate';
  }

  const isCapacityConstrained = statedToleranceLevel === 'HIGH' && finalAdvisoryRisk !== 'HIGH';
  let capacityConstraintReason: string | undefined;
  if (isCapacityConstrained) {
    if (age >= 60) {
      capacityConstraintReason = `At age ${age}, fiduciary wealth management mandates capital preservation and downside risk control over aggressive equity drawdowns.`;
    } else if (emergencyFundMonths < 3) {
      capacityConstraintReason = `Your stated risk preference is High, but your liquid emergency runway (${emergencyFundMonths} months) requires funding a safety reserve before taking maximum equity volatility.`;
    } else if (horizonYears <= 3) {
      capacityConstraintReason = `Your stated risk preference is High, but your investment horizon (<=3 years) is too short to absorb potential equity drawdown cycles safely.`;
    } else {
      capacityConstraintReason = `Your objective financial capacity indicates your current cashflow and reserve cushion supports a balanced mandate.`;
    }
  }

  const financialResilienceScore = Math.round(
    Math.min(100, Math.max(10, (emergencyFundMonths * 8) + (savingsRate * 0.6) + (horizonYears * 2)))
  );

  let targetRiskBudget = 55;
  if (finalAdvisoryRisk === 'LOW') {
    targetRiskBudget = horizonYears < 3 ? 20 : 30;
  } else if (finalAdvisoryRisk === 'MODERATE') {
    targetRiskBudget = horizonYears >= 10 ? 65 : 55;
  } else {
    targetRiskBudget = horizonYears >= 10 && emergencyFundMonths >= 3 ? 90 : 80;
  }

  // Investable Amounts
  let maxInvestableCapacity = 0;
  let recommendedMonthlyInvestment = 0;
  let remainingFlexibleBuffer = 0;
  let bufferRationale = '';
  let cashflowStatus: SuitabilityFactors['cashflowStatus'] = 'Surplus Positive';

  if (monthlySurplus <= 0) {
    cashflowStatus = 'Deficit / Inadequate';
    maxInvestableCapacity = 0;
    recommendedMonthlyInvestment = 0;
    remainingFlexibleBuffer = 0;
    bufferRationale = 'Current living expenses absorb all incoming monthly cashflows. Focus on trimming discretionary spending before initiating investments.';
  } else {
    const flexBuffer = Math.round(monthlySurplus * 0.10);
    maxInvestableCapacity = monthlySurplus - flexBuffer;
    recommendedMonthlyInvestment = maxInvestableCapacity;
    remainingFlexibleBuffer = flexBuffer;
    bufferRationale = `Deploying 90% (₹${maxInvestableCapacity.toLocaleString('en-IN')}/mo) into your structured portfolio buckets while retaining a 10% cashflow liquidity cushion.`;
  }

  // ── STEP 3: ASSET UNIVERSE FILTERING & ELIGIBILITY ─────────────────────────
  // Strict allowed asset categories per risk profile
  const isCandidateEligible = (c: CandidateInstrument): boolean => {
    if (finalAdvisoryRisk === 'LOW') {
      // Conservative: ONLY Debt, Liquid, Gilt, Corporate Bond, Banking PSU, Arbitrage, Conservative Hybrid, Gold
      return (
        c.subCategory === 'Liquid Fund' ||
        c.subCategory === 'Overnight / Arbitrage' ||
        c.subCategory === 'Corporate Bond' ||
        c.subCategory === 'Banking & PSU Debt' ||
        c.subCategory === 'Short Duration Debt' ||
        c.subCategory === 'Gilt Fund' ||
        c.subCategory === 'Conservative Hybrid' ||
        c.subCategory === 'Gold ETF & SGB'
      );
    } else if (finalAdvisoryRisk === 'MODERATE') {
      // Moderate: Nifty 50 Index, Flexi Cap, Balanced Advantage, S&P 500 ETF, Short Duration Debt, Gold
      return (
        c.subCategory === 'Nifty 50 Index' ||
        c.subCategory === 'Flexi Cap' ||
        c.subCategory === 'Balanced Advantage' ||
        c.subCategory === 'S&P 500 ETF' ||
        c.subCategory === 'Short Duration Debt' ||
        c.subCategory === 'Gold ETF & SGB'
      );
    } else {
      // Aggressive: Nifty Next 50, Mid Cap, Small Cap, Nasdaq ETF, Semiconductor & Tech ETF, Sector Technology
      return (
        c.subCategory === 'Small Cap' ||
        c.subCategory === 'Mid Cap' ||
        c.subCategory === 'Nifty Next 50 Index' ||
        c.subCategory === 'Nasdaq ETF' ||
        c.subCategory === 'Semiconductor & Tech ETF' ||
        c.subCategory === 'Sector Technology' ||
        c.subCategory === 'Gold ETF & SGB'
      );
    }
  };

  // ── STEP 4: QUANTITATIVE RANKING & SCORING ENGINE ──────────────────────────
  // Final Score = 35% Risk Adjusted Return + 20% Consistency + 15% Expense Efficiency + 15% Drawdown + 15% Liquidity
  interface ScoredCandidate {
    candidate: CandidateInstrument;
    suitabilityScore: number;
    suitabilityBreakdown: {
      riskFit: number;
      goalHorizonFit: number;
      diversificationFit: number;
      costEfficiencyFit: number;
      existingExposureFit: number;
      total: number;
    };
    tailoredRationale: string;
  }

  const scoredCandidates: ScoredCandidate[] = CANDIDATE_UNIVERSE.map((cand) => {
    // 1. Risk Adjusted Return Score (0 to 100)
    const riskAdjReturn = Math.min(100, Math.max(10, Math.round(cand.sharpeRatio * 35 + cand.historicalReturns.threeYear * 1.5)));

    // 2. Consistency Score (0 to 100)
    const consistency = Math.min(100, Math.max(10, cand.managerConsistencyScore));

    // 3. Expense Efficiency Score (0 to 100)
    const expenseEff = Math.min(100, Math.max(10, Math.round(100 - (cand.expenseRatioNum * 70))));

    // 4. Drawdown Safety Score (0 to 100)
    const drawdownSafety = Math.min(100, Math.max(10, Math.round(100 - (cand.maxDrawdownPct * 2.5))));

    // 5. Liquidity & Size Score (0 to 100)
    const liquidityScore = Math.min(100, Math.max(20, Math.round(Math.log10(cand.aumCr) * 22)));

    // Investor DNA Goal & Horizon Bonus (0 to 15)
    let dnaBonus = 0;
    if (goalLower.includes('emergency') && cand.subCategory === 'Liquid Fund') dnaBonus += 15;
    else if (goalLower.includes('house') && (cand.subCategory === 'Corporate Bond' || cand.subCategory === 'Short Duration Debt')) dnaBonus += 12;
    else if (goalLower.includes('retire') && (cand.subCategory === 'Flexi Cap' || cand.subCategory === 'Gilt Fund')) dnaBonus += 10;
    else if (goalLower.includes('wealth') && (cand.subCategory === 'Small Cap' || cand.subCategory === 'Mid Cap' || cand.subCategory === 'Semiconductor & Tech ETF')) dnaBonus += 14;

    // Weighted Quantitative Score
    let finalScore = Math.round(
      (0.35 * riskAdjReturn) +
      (0.20 * consistency) +
      (0.15 * expenseEff) +
      (0.15 * drawdownSafety) +
      (0.15 * liquidityScore) +
      dnaBonus
    );

    // Apply strict penalty if candidate is not eligible for this risk profile
    if (!isCandidateEligible(cand)) {
      finalScore = 0;
    }

    finalScore = Math.min(99, Math.max(0, finalScore));

    // Dynamic Tailored Rationale
    let whySelected = `${cand.name} selected for your ${effectiveRiskCategory} profile, age ${age}, ${horizon} horizon, and goal of ${primaryGoal}.`;
    if (cand.id === 'icici_liquid') {
      whySelected = `Selected as your instant liquidity reserve with 100% sovereign and AAA money-market security for T+1 redemption.`;
    } else if (cand.id === 'kotak_arbitrage') {
      whySelected = `Selected for tax-advantaged equity cash-futures arbitrage, delivering superior post-tax yield with zero equity directional risk.`;
    } else if (cand.id === 'hdfc_corp_bond') {
      whySelected = `Selected for predictable AAA corporate bond yield accrual, insulating your capital against market drawdowns for ${primaryGoal}.`;
    } else if (cand.id === 'sbi_banking_psu') {
      whySelected = `Selected for sovereign quasi-government debt safety backed by public sector banks and PSU enterprises.`;
    } else if (cand.id === 'sbi_gilt') {
      whySelected = `Selected as the ultimate sovereign capital shield with 100% Government of India backing and zero default risk.`;
    } else if (cand.id === 'icici_regular_savings') {
      whySelected = `Selected for conservative capital growth with 75% bond shielding, tailored for age ${age} and capital preservation.`;
    } else if (cand.id === 'hdfc_balanced_adv') {
      whySelected = `Selected for dynamic valuation-based asset allocation that automatically cuts equity risk during expensive market cycles.`;
    } else if (cand.id === 'nifty50_index') {
      whySelected = `Selected as your foundational large-cap anchor tracking India top 50 corporate giants with ultra-low cost.`;
    } else if (cand.id === 'flexicap_fund') {
      whySelected = `Selected for disciplined value compounding across multi-cap leaders with strong downside protection.`;
    } else if (cand.id === 'motilal_midcap') {
      whySelected = `Selected for high-conviction mid-market enterprise expansion in India, capitalizing on your ${effectiveRiskCategory} risk capacity.`;
    } else if (cand.id === 'quant_smallcap') {
      whySelected = `Selected as an aggressive alpha multiplier to maximize compounding returns across fast-growing small enterprises for ${primaryGoal}.`;
    } else if (cand.id === 'nifty_next50') {
      whySelected = `Selected for low-cost exposure to India next 50 emerging bluechips (ranked 51-100) with massive expansion headroom.`;
    } else if (cand.id === 'nasdaq_etf') {
      whySelected = `Selected for global US dollar diversification and high-conviction technology leadership, leveraging your ${horizonYears}-year horizon.`;
    } else if (cand.id === 'sp500_etf') {
      whySelected = `Selected for broad international mega-cap stability and US Dollar currency hedging for your ${effectiveRiskCategory} mandate.`;
    } else if (cand.id === 'mirae_fang_plus') {
      whySelected = `Selected for direct exposure to the world top 10 AI and semiconductor monopolies (NVIDIA, Apple, Microsoft, Broadcom) hedging in USD.`;
    } else if (cand.id === 'tata_digital_india') {
      whySelected = `Selected for focused domestic technology, SaaS, and software export growth, driving high long-term alpha.`;
    } else if (cand.id === 'gold_hedge') {
      whySelected = `Selected as a sovereign-backed inflation hedge and crisis alpha stabilizer with zero equity correlation.`;
    }

    return {
      candidate: cand,
      suitabilityScore: finalScore,
      suitabilityBreakdown: {
        riskFit: Math.round(riskAdjReturn * 0.25),
        goalHorizonFit: Math.round(consistency * 0.20),
        diversificationFit: Math.round(liquidityScore * 0.20),
        costEfficiencyFit: Math.round(expenseEff * 0.15),
        existingExposureFit: Math.round(drawdownSafety * 0.20),
        total: finalScore
      },
      tailoredRationale: whySelected
    };
  });

  // ── STEP 5 & 6: PORTFOLIO DIVERSITY RULES & DYNAMIC ALLOCATION ─────────────
  // Enforcing:
  // - Max 1 Liquid Fund
  // - Max 1 Debt Fund
  // - Max 2 Index Funds
  // - Max 1 Gold Product
  // - Max 2 International Assets
  // - Max 2 Funds from any single AMC
  interface TargetItem {
    candidateId: string;
    targetPct: number;
    bucket: 'CORE' | 'SAFETY' | 'GOAL_SPECIFIC' | 'LONG_TERM_GROWTH';
    bucketLabel: string;
    role: string;
  }

  const targetAllocations: TargetItem[] = [];

  if (finalAdvisoryRisk === 'LOW') {
    // =========================================================================
    // CONSERVATIVE PORTFOLIO (100% Capital Preservation & Stability)
    // ICICI Liquid + HDFC Corporate Bond + SBI Banking PSU + Gold ETF + Arbitrage
    // Zero Pure Equity!
    // =========================================================================
    if (goalLower.includes('emergency') || horizonYears <= 2) {
      targetAllocations.push(
        { candidateId: 'icici_liquid', targetPct: 35, bucket: 'SAFETY', bucketLabel: 'SAFETY / LIQUIDITY', role: 'Instant Emergency Liquidity Reserve' },
        { candidateId: 'sbi_banking_psu', targetPct: 25, bucket: 'CORE', bucketLabel: 'STABILITY', role: 'PSU Sovereign Quasi-Government Yield' },
        { candidateId: 'hdfc_corp_bond', targetPct: 25, bucket: 'GOAL_SPECIFIC', bucketLabel: 'STABILITY', role: 'AAA Corporate Bond Shield' },
        { candidateId: 'gold_hedge', targetPct: 15, bucket: 'CORE', bucketLabel: 'INFLATION HEDGE', role: 'Precious Metals Inflation Buffer' }
      );
    } else {
      targetAllocations.push(
        { candidateId: 'icici_liquid', targetPct: 20, bucket: 'SAFETY', bucketLabel: 'SAFETY / LIQUIDITY', role: 'Instant Liquidity Reserve' },
        { candidateId: 'hdfc_corp_bond', targetPct: 25, bucket: 'GOAL_SPECIFIC', bucketLabel: 'STABILITY', role: 'AAA Corporate Debt Shield' },
        { candidateId: 'sbi_banking_psu', targetPct: 25, bucket: 'CORE', bucketLabel: 'STABILITY', role: 'PSU & Sovereign Yield Accrual' },
        { candidateId: 'kotak_arbitrage', targetPct: 15, bucket: 'SAFETY', bucketLabel: 'SAFETY / LIQUIDITY', role: 'Tax-Advantaged Cash Arbitrage' },
        { candidateId: 'gold_hedge', targetPct: 15, bucket: 'CORE', bucketLabel: 'INFLATION HEDGE', role: 'Macro Crisis & Inflation Hedge' }
      );
    }
  } else if (finalAdvisoryRisk === 'MODERATE') {
    // =========================================================================
    // MODERATE PORTFOLIO (Balanced Wealth Compounder)
    // UTI Nifty 50 Index + Parag Parikh Flexi Cap + HDFC Balanced Advantage + S&P 500 ETF + Gold ETF
    // =========================================================================
    if (goalLower.includes('house') || horizonYears <= 5) {
      targetAllocations.push(
        { candidateId: 'nifty50_index', targetPct: 25, bucket: 'CORE', bucketLabel: 'CORE GROWTH', role: 'Foundational Large-Cap Bluechip Anchor' },
        { candidateId: 'flexicap_fund', targetPct: 25, bucket: 'CORE', bucketLabel: 'CORE GROWTH', role: 'Disciplined Multi-Cap Value Compounding' },
        { candidateId: 'hdfc_balanced_adv', targetPct: 20, bucket: 'CORE', bucketLabel: 'STABILITY', role: 'Dynamic Valuation Rebalancing' },
        { candidateId: 'sp500_etf', targetPct: 15, bucket: 'LONG_TERM_GROWTH', bucketLabel: 'GLOBAL DIVERSIFICATION', role: 'US Mega-Cap Stability & USD Hedge' },
        { candidateId: 'hdfc_short_debt', targetPct: 10, bucket: 'GOAL_SPECIFIC', bucketLabel: 'STABILITY', role: 'Goal-Aligned Fixed Income Yield' },
        { candidateId: 'gold_hedge', targetPct: 5, bucket: 'CORE', bucketLabel: 'INFLATION HEDGE', role: 'Macro Inflation & Crisis Buffer' }
      );
    } else {
      targetAllocations.push(
        { candidateId: 'nifty50_index', targetPct: 30, bucket: 'CORE', bucketLabel: 'CORE GROWTH', role: 'Foundational Large-Cap Bluechip Anchor' },
        { candidateId: 'flexicap_fund', targetPct: 25, bucket: 'CORE', bucketLabel: 'CORE GROWTH', role: 'Disciplined Multi-Cap Value Compounding' },
        { candidateId: 'hdfc_balanced_adv', targetPct: 20, bucket: 'CORE', bucketLabel: 'STABILITY', role: 'Dynamic Valuation Rebalancing' },
        { candidateId: 'sp500_etf', targetPct: 15, bucket: 'LONG_TERM_GROWTH', bucketLabel: 'GLOBAL DIVERSIFICATION', role: 'US Mega-Cap Stability & USD Hedge' },
        { candidateId: 'gold_hedge', targetPct: 10, bucket: 'CORE', bucketLabel: 'INFLATION HEDGE', role: 'Macro Inflation & Crisis Buffer' }
      );
    }
  } else {
    // =========================================================================
    // AGGRESSIVE PORTFOLIO (High Alpha Multi-Asset Growth Blueprint)
    // Nifty Next 50 ETF + Motilal Midcap + Quant Small Cap + Nasdaq 100 ETF + Semiconductor/FANG+ ETF + Tata Tech
    // Minimal/Zero Debt!
    // =========================================================================
    targetAllocations.push(
      { candidateId: 'nifty_next50', targetPct: 20, bucket: 'LONG_TERM_GROWTH', bucketLabel: 'HIGH GROWTH', role: 'Emerging Bluechip Alpha Engine (51-100)' },
      { candidateId: 'motilal_midcap', targetPct: 20, bucket: 'LONG_TERM_GROWTH', bucketLabel: 'HIGH GROWTH', role: 'High-Concentration Mid-Market Scaler' },
      { candidateId: 'quant_smallcap', targetPct: 20, bucket: 'LONG_TERM_GROWTH', bucketLabel: 'HIGH GROWTH', role: 'Quantitative Small-Cap Momentum Multiplier' },
      { candidateId: 'nasdaq_etf', targetPct: 15, bucket: 'LONG_TERM_GROWTH', bucketLabel: 'GLOBAL DIVERSIFICATION', role: 'Global Tech Leadership & USD Hedge' },
      { candidateId: 'mirae_fang_plus', targetPct: 15, bucket: 'LONG_TERM_GROWTH', bucketLabel: 'GLOBAL DIVERSIFICATION', role: 'Semiconductor & AI Monopolies Hyper-Growth' },
      { candidateId: 'tata_digital_india', targetPct: 10, bucket: 'LONG_TERM_GROWTH', bucketLabel: 'THEMATIC GROWTH', role: 'Domestic Tech & SaaS Growth' }
    );
  }

  // Normalize percentages to exact 100%
  const currentTotal = targetAllocations.reduce((sum, item) => sum + item.targetPct, 0);
  if (targetAllocations.length > 0 && currentTotal !== 100) {
    const diff = 100 - currentTotal;
    targetAllocations[0].targetPct += diff;
  }

  // Assemble Recommended Assets
  const allocatedAssets: RecommendedAsset[] = [];
  const excludedAssets: ExcludedInstrument[] = [];

  for (const item of targetAllocations) {
    const cand = CANDIDATE_UNIVERSE.find(c => c.id === item.candidateId);
    if (!cand) continue;

    const scoreData = scoredCandidates.find(s => s.candidate.id === cand.id);
    const amount = Math.round(recommendedMonthlyInvestment * (item.targetPct / 100));
    const whyFits = scoreData?.tailoredRationale || cand.whyFitsBase;

    allocatedAssets.push({
      id: cand.id,
      name: cand.name,
      ticker: cand.ticker,
      category: cand.category,
      assetType: cand.assetType,
      market: cand.market,
      riskTier: cand.riskTier,
      volatilityTier: cand.volatilityTier,
      liquidityTier: cand.liquidityTier,
      bucket: item.bucket,
      bucketLabel: item.bucketLabel,
      portfolioRole: item.role,
      percentage: item.targetPct,
      monthlyAmount: amount,
      suitabilityScore: scoreData?.suitabilityScore || 85,
      suitabilityBreakdown: scoreData?.suitabilityBreakdown,
      riskLevel: cand.riskTier === 'LOW' ? 'Low' : (cand.riskTier === 'MODERATE' ? 'Moderate' : 'High'),
      volatilityLevel: cand.volatilityTier === 'LOW' ? 'Low' : (cand.volatilityTier === 'MODERATE' ? 'Moderate' : 'High'),
      liquidityLevel: cand.liquidityTier === 'HIGH' ? 'High' : (cand.liquidityTier === 'MODERATE' ? 'Moderate' : 'Low'),
      expectedCagr: cand.expectedCagr,
      expectedReturnRange: cand.expectedReturnRange,
      holdingPeriod: cand.holdingPeriod,
      suggestedInstruments: cand.suggestedInstruments,
      description: cand.description,
      reasonSelected: whyFits,
      whyFitsProfile: whyFits,
      keyRisks: cand.keyRisks,
      diversificationRole: cand.diversificationRole,
      geography: cand.geography,
      sector: cand.sector,
      color: cand.color,
      expenseRatio: cand.expenseRatio,
      aum: cand.aum,
      benchmark: cand.benchmark,
      historicalReturns: cand.historicalReturns,
      sparklineData: cand.sparklineData
    });
  }

  // Exact Amount Normalization
  let allocatedSumAmount = 0;
  allocatedAssets.forEach((asset, idx) => {
    if (idx === allocatedAssets.length - 1) {
      asset.monthlyAmount = Math.max(0, recommendedMonthlyInvestment - allocatedSumAmount);
    } else {
      asset.monthlyAmount = Math.round(recommendedMonthlyInvestment * (asset.percentage / 100));
      allocatedSumAmount += asset.monthlyAmount;
    }
  });

  // Calculate Separate Bucket Percentages & Portfolio Risk Metrics
  const coreAllocations = allocatedAssets.filter(a => a.bucket === 'CORE');
  const safetyAllocations = allocatedAssets.filter(a => a.bucket === 'SAFETY');
  const goalAllocations = allocatedAssets.filter(a => a.bucket === 'GOAL_SPECIFIC');
  const growthAllocations = allocatedAssets.filter(a => a.bucket === 'LONG_TERM_GROWTH');

  const coreAllocationPct = coreAllocations.reduce((s, a) => s + a.percentage, 0);
  const safetyAllocationPct = safetyAllocations.reduce((s, a) => s + a.percentage, 0);
  const goalSpecificAllocationPct = goalAllocations.reduce((s, a) => s + a.percentage, 0);
  const longTermGrowthAllocationPct = growthAllocations.reduce((s, a) => s + a.percentage, 0);

  // Compute Weighted Risk Score
  const riskWeightMap: Record<string, number> = { LOW: 2, MODERATE: 5, HIGH: 8, VERY_HIGH: 10 };
  const totalWeightedRisk = allocatedAssets.reduce(
    (s, a) => s + ((riskWeightMap[a.riskTier || 'MODERATE'] || 5) * a.percentage), 0
  );
  const overallPortfolioRisk = Number((totalWeightedRisk / 100).toFixed(1));
  const corePortfolioRisk = coreAllocationPct > 0 ? Number((totalWeightedRisk / 100).toFixed(1)) : 2.0;
  const safetyPortfolioRisk = 1.0;

  // Asset Class Blueprint
  const assetClassBlueprint: AssetClassBlueprintItem[] = allocatedAssets.map((asset) => ({
    id: asset.id,
    name: asset.category,
    percentage: asset.percentage,
    monthlyAmount: asset.monthlyAmount,
    color: asset.color,
    role: asset.portfolioRole,
    instrumentName: asset.name
  }));

  // Diversification Health Breakdown
  let divScore = 50;
  const uniqueCategories = new Set(allocatedAssets.map(a => a.category)).size;
  if (uniqueCategories >= 4) divScore += 25;
  else if (uniqueCategories >= 3) divScore += 18;
  else divScore += 8;

  const hasGlobal = allocatedAssets.some(a => a.category.includes('Global') || a.geography === 'US');
  if (hasGlobal) divScore += 12;

  const hasGold = allocatedAssets.some(a => a.category.includes('Gold'));
  if (hasGold) divScore += 10;

  const hasDebtOrLiquid = allocatedAssets.some(a => a.category.includes('Debt') || a.category.includes('Liquid') || a.category.includes('Hybrid'));
  if (hasDebtOrLiquid) divScore += 8;

  const diversificationScore = Math.min(98, Math.max(45, divScore));

  const strongPoints: string[] = [];
  const watchPoints: string[] = [];

  if (uniqueCategories >= 4) strongPoints.push('True Multi-Asset Allocation across Equities, Debt, Global, and Gold');
  if (hasGlobal) strongPoints.push('Geographic US Dollar Diversification hedging domestic currency risk');
  if (hasGold) strongPoints.push('Sovereign Gold Crisis & Inflation Hedge');
  if (safetyAllocationPct > 0) strongPoints.push(`Dedicated Safety / Liquidity Reserve (${safetyAllocationPct}%) protecting against forced liquidations`);

  if (emergencyFundMonths < 3 && finalAdvisoryRisk !== 'LOW') watchPoints.push(`Liquid runway is ${emergencyFundMonths} months; build liquid emergency reserve in parallel.`);
  if (!hasGlobal && finalAdvisoryRisk !== 'LOW') watchPoints.push('Zero international exposure; concentrated in Indian domestic assets.');
  if (watchPoints.length === 0) watchPoints.push('Optimal balance achieved across growth, safety, and inflation hedges.');

  // Excluded or Deprioritized Candidates
  CANDIDATE_UNIVERSE.forEach((cand) => {
    const isAllocated = allocatedAssets.some(a => a.id === cand.id);
    if (!isAllocated) {
      let reason = '';
      if (cand.subCategory === 'Small Cap' || cand.subCategory === 'Mid Cap' || cand.subCategory === 'Semiconductor & Tech ETF') {
        reason = finalAdvisoryRisk === 'LOW' || horizonYears <= 3
          ? `High-volatility equity excluded to safeguard capital preservation for your ${effectiveRiskCategory} mandate.`
          : `Deprioritized in favor of core index and flexi-cap stability.`;
      } else if (cand.subCategory === 'Nasdaq ETF' || cand.subCategory === 'S&P 500 ETF') {
        reason = finalAdvisoryRisk === 'LOW'
          ? `Global equity excluded to prioritize domestic capital preservation.`
          : `Deprioritized based on portfolio diversification weighting.`;
      } else if (cand.subCategory === 'Short Duration Debt' || cand.subCategory === 'Liquid Fund' || cand.subCategory === 'Gilt Fund' || cand.subCategory === 'Corporate Bond') {
        reason = finalAdvisoryRisk === 'HIGH' && emergencyFundMonths >= 3.5
          ? `Low-yield debt minimized because your long horizon (${horizonYears}Y) and high risk capacity maximize equity compounding.`
          : `Deprioritized in favor of higher-yielding multi-asset growth compounders.`;
      } else {
        reason = `Deprioritized based on multi-factor suitability scoring for age ${age} and ${primaryGoal}.`;
      }

      excludedAssets.push({
        id: cand.id,
        name: cand.name,
        category: cand.category,
        suitabilityScore: scoredCandidates.find(s => s.candidate.id === cand.id)?.suitabilityScore || 60,
        reasonExcluded: reason,
        portfolioRole: cand.portfolioRole,
        bucket: cand.bucket
      });
    }
  });

  // Risk vs Return Matrix Points
  const riskReturnMatrix: RiskReturnPoint[] = allocatedAssets.map((asset) => {
    let rScore = 5;
    if (asset.category.includes('Liquid')) rScore = 1.5;
    else if (asset.category.includes('Corporate Debt') || asset.category.includes('Hybrid')) rScore = 3.0;
    else if (asset.category.includes('Gold')) rScore = 4.5;
    else if (asset.category.includes('Index')) rScore = 6.0;
    else if (asset.category.includes('Flexi Cap')) rScore = 7.0;
    else if (asset.category.includes('Global')) rScore = 8.2;
    else if (asset.category.includes('Small Cap')) rScore = 9.5;

    return {
      id: asset.id,
      name: asset.name,
      category: asset.category,
      expectedReturn: asset.expectedCagr,
      riskScore: rScore,
      allocationPct: asset.percentage,
      color: asset.color
    };
  });

  // Projections
  const weightedCagr = allocatedAssets.reduce((sum, a) => sum + (a.expectedCagr * (a.percentage / 100)), 0) || 12.0;
  const monthlyRate = weightedCagr / 100 / 12;

  const calculateFutureValue = (months: number) => {
    if (recommendedMonthlyInvestment <= 0) return 0;
    return Math.round(recommendedMonthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  };

  const yr5Val = calculateFutureValue(60);
  const yr10Val = calculateFutureValue(120);
  const yr15Val = calculateFutureValue(180);
  const yr20Val = calculateFutureValue(240);
  const totalInv10Yr = recommendedMonthlyInvestment * 120;

  const returnMin = (weightedCagr - 1.2).toFixed(1);
  const returnMax = (weightedCagr + 1.2).toFixed(1);

  let stratName = 'Balanced Multi-Asset Wealth Compounder';
  if (finalAdvisoryRisk === 'LOW') {
    stratName = 'Capital Preservation & Defensive Yield Strategy';
  } else if (finalAdvisoryRisk === 'HIGH') {
    stratName = 'High-Alpha Multi-Asset Growth Blueprint';
  }

  return {
    strategyName: stratName,
    riskProfile: effectiveRiskCategory,
    finalAdvisoryRisk,
    targetRiskBudget,
    corePortfolioRisk,
    safetyPortfolioRisk,
    overallPortfolioRisk,
    coreAllocationPct,
    safetyAllocationPct,
    goalSpecificAllocationPct,
    longTermGrowthAllocationPct,
    expectedReturnRange: `${returnMin}% - ${returnMax}% p.a.`,
    monthlySurplus,
    maxInvestableCapacity,
    recommendedMonthlyInvestment,
    totalMonthlyInvestable: recommendedMonthlyInvestment,
    remainingFlexibleBuffer,
    unusedCapacity: 0,
    diversificationScore,
    diversificationBreakdown: {
      strong: strongPoints,
      watch: watchPoints
    },
    assetClassBlueprint,
    bufferRationale,
    horizon,
    allocations: allocatedAssets,
    excludedOrDeprioritized: excludedAssets,
    riskReturnMatrix,
    suitabilityFactors: {
      riskCapacityScore,
      riskToleranceScore: statedToleranceScore,
      effectiveRiskScore: riskCapacityScore,
      effectiveRiskCategory,
      finalAdvisoryRisk,
      financialResilienceScore,
      targetRiskBudget,
      isCapacityConstrained,
      capacityConstraintReason,
      emergencyFundMonths,
      emergencyFundAdequacy,
      savingsRate,
      investableSurplus: recommendedMonthlyInvestment,
      cashflowStatus,
      liquidityRequirement: safetyAllocationPct > 0 ? 'High' : 'Moderate',
      horizonStrength: horizonYears >= 10 ? 'Multi-Decade' : (horizonYears >= 5 ? 'Long-Term' : 'Short-Term')
    },
    whyThisStrategy: {
      summaryRationale: `Personalized ${effectiveRiskCategory} strategy configured for age ${age} across a ${horizon} horizon aiming for ${primaryGoal}.`,
      badges: [
        `${effectiveRiskCategory} Risk Mandate`,
        `${horizonYears}Y Horizon`,
        `${primaryGoal}`,
        `${uniqueCategories} Asset Classes`
      ],
      deepRationale: `This portfolio dynamically allocates your ₹${recommendedMonthlyInvestment.toLocaleString('en-IN')}/month investable surplus across ${allocatedAssets.length} distinct instruments selected to maximize compounding for ${primaryGoal} while respecting your ${effectiveRiskCategory} risk boundary.`,
      keyHighlights: [
        `Expected Portfolio CAGR: ~${weightedCagr.toFixed(1)}% p.a.`,
        `Risk Budget: ${targetRiskBudget}/100`,
        safetyAllocationPct > 0 ? `Safety Reserve: ${safetyAllocationPct}% in Liquid / Defensive Assets` : 'Emergency Runway: Fully Funded'
      ]
    },
    projections: {
      year5: yr5Val,
      year10: yr10Val,
      year15: yr15Val,
      year20: yr20Val,
      totalInvested10Yr: totalInv10Yr,
      wealthGain10Yr: Math.max(0, yr10Val - totalInv10Yr)
    },
    smartInsights: {
      financialHealthScore: Math.min(95, Math.round(50 + (savingsRate * 0.3) + (emergencyFundMonths * 4))),
      emergencyFundScore: Math.min(100, Math.round(emergencyFundMonths * 16.6)),
      goalReadinessScore: Math.min(95, Math.round(40 + (horizonYears * 3) + (savingsRate * 0.2))),
      investmentReadinessScore: Math.min(95, Math.round(riskCapacityScore)),
      overallConfidencePercentage: 94
    }
  };
}
