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
  category: AssetCategory;
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
  goalRoles: string[];
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
  aum: string;
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

// Single Authoritative Institutional Candidate Universe
export const CANDIDATE_UNIVERSE: CandidateInstrument[] = [
  {
    id: 'nifty50_index',
    name: 'UTI Nifty 50 Index Fund Direct',
    ticker: 'NIFTY50',
    category: 'Index Mutual Fund',
    assetType: 'EQUITY',
    market: 'AMFI',
    riskTier: 'MODERATE',
    volatilityTier: 'MODERATE',
    liquidityTier: 'HIGH',
    expectedCagr: 12.8,
    expectedReturnRange: '11.5% - 13.5% p.a.',
    minimumHorizonYears: 3,
    portfolioRole: 'Core Large-Cap Equity Anchor',
    bucket: 'CORE',
    bucketLabel: 'CORE GROWTH',
    goalRoles: ['Long-Term Wealth Building', 'Retirement Core', 'Education Fund'],
    geography: 'India',
    sector: 'Broad Market Top 50',
    currency: 'INR',
    diversificationRole: 'Foundation of domestic Indian large-cap compounding across top 50 corporate leaders',
    keyRisks: 'Standard market equity volatility and cyclical economic drawdowns',
    whyFitsBase: 'Low-cost broad market exposure tracking India\'s top 50 corporate leaders with zero fund-manager bias and rock-bottom tracking error.',
    holdingPeriod: '5+ Years',
    suggestedInstruments: ['UTI Nifty 50 Index Fund (Direct-Growth)', 'NiftyBeES ETF'],
    description: 'Low-cost broad market exposure tracking India\'s top 50 corporate leaders with zero fund-manager bias and rock-bottom tracking error.',
    color: '#10B981',
    expenseRatio: '0.18%',
    aum: '₹18,450 Cr',
    benchmark: 'NIFTY 50 Total Returns Index (TRI)',
    historicalReturns: { oneYear: 18.2, threeYear: 15.6, fiveYear: 16.4 },
    sparklineData: {
      oneYear: [100, 103, 101, 106, 109, 107, 112, 114, 111, 115, 118],
      threeYear: [100, 112, 108, 122, 131, 128, 142, 148, 144, 153, 158],
      fiveYear: [100, 124, 118, 145, 162, 155, 182, 195, 189, 205, 214]
    }
  },
  {
    id: 'flexicap_fund',
    name: 'Parag Parikh Flexi Cap Fund Direct',
    ticker: 'PPFCF',
    category: 'Flexi Cap Fund',
    assetType: 'EQUITY',
    market: 'AMFI',
    riskTier: 'MODERATE',
    volatilityTier: 'MODERATE',
    liquidityTier: 'HIGH',
    expectedCagr: 15.2,
    expectedReturnRange: '13.5% - 16.5% p.a.',
    minimumHorizonYears: 3,
    portfolioRole: 'Dynamic Multi-Cap Alpha Booster',
    bucket: 'CORE',
    bucketLabel: 'CORE GROWTH',
    goalRoles: ['Long-Term Wealth Building', 'Retirement Growth'],
    geography: 'India',
    sector: 'Multi-Cap Value & Global Leaders',
    currency: 'INR',
    diversificationRole: 'Active multi-cap flexibility with disciplined value investing and global cashflow generation',
    keyRisks: 'Active manager risk and multi-cap mid/small market fluctuations',
    whyFitsBase: 'Disciplined value-investing strategy dynamically allocating across large, mid, and select international leaders with superior drawdown control.',
    holdingPeriod: '5+ Years',
    suggestedInstruments: ['Parag Parikh Flexi Cap Fund Direct-Growth', 'Quant Flexi Cap Fund'],
    description: 'Disciplined value-investing strategy dynamically allocating across large, mid, and select international leaders with superior drawdown control.',
    color: '#06B6D4',
    expenseRatio: '0.63%',
    aum: '₹62,100 Cr',
    benchmark: 'NIFTY 500 TRI',
    historicalReturns: { oneYear: 22.4, threeYear: 18.9, fiveYear: 21.2 },
    sparklineData: {
      oneYear: [100, 104, 102, 108, 112, 110, 116, 119, 117, 121, 124],
      threeYear: [100, 115, 111, 129, 142, 138, 155, 163, 159, 171, 178],
      fiveYear: [100, 132, 125, 162, 188, 179, 218, 238, 230, 252, 268]
    }
  },
  {
    id: 'nasdaq_etf',
    name: 'Motilal Oswal Nasdaq 100 ETF (MON100)',
    ticker: 'MON100',
    category: 'Global ETF',
    assetType: 'GLOBAL_EQUITY',
    market: 'NSE',
    riskTier: 'HIGH',
    volatilityTier: 'HIGH',
    liquidityTier: 'HIGH',
    expectedCagr: 15.5,
    expectedReturnRange: '13.5% - 17.0% p.a.',
    minimumHorizonYears: 5,
    portfolioRole: 'Global Tech & US Currency Hedge',
    bucket: 'LONG_TERM_GROWTH',
    bucketLabel: 'GLOBAL DIVERSIFICATION',
    goalRoles: ['Long-Term Wealth Building', 'US Dollar Hedge', 'Global Innovation Exposure'],
    geography: 'US',
    sector: 'Global Technology & Innovation',
    currency: 'USD',
    diversificationRole: 'Geographic and currency diversification outside Indian domestic equity markets',
    keyRisks: 'US tech sector concentration, interest rate valuation sensitivity, and USD/INR exchange rate movement',
    whyFitsBase: 'Direct dollar-denominated exposure to global innovation leaders (Apple, Microsoft, NVIDIA, Alphabet) hedging against INR depreciation.',
    holdingPeriod: '5 to 10 Years',
    suggestedInstruments: ['Motilal Oswal Nasdaq 100 ETF', 'Mirae Asset NYSE FANG+ ETF'],
    description: 'Direct dollar-denominated exposure to global innovation leaders (Apple, Microsoft, NVIDIA, Alphabet) hedging against INR depreciation.',
    color: '#8B5CF6',
    expenseRatio: '0.58%',
    aum: '₹8,400 Cr',
    benchmark: 'Nasdaq-100 Index (INR)',
    historicalReturns: { oneYear: 26.8, threeYear: 16.2, fiveYear: 23.4 },
    sparklineData: {
      oneYear: [100, 107, 103, 112, 118, 114, 122, 128, 123, 129, 134],
      threeYear: [100, 118, 105, 126, 145, 132, 158, 172, 161, 180, 192],
      fiveYear: [100, 138, 120, 175, 210, 190, 245, 275, 255, 290, 315]
    }
  },
  {
    id: 'smallcap_fund',
    name: 'Nippon India Small Cap Fund Direct',
    ticker: 'NIPPSMALL',
    category: 'Mid / Small Cap Fund',
    assetType: 'EQUITY',
    market: 'AMFI',
    riskTier: 'VERY_HIGH',
    volatilityTier: 'HIGH',
    liquidityTier: 'MODERATE',
    expectedCagr: 17.5,
    expectedReturnRange: '15.0% - 19.5% p.a.',
    minimumHorizonYears: 7,
    portfolioRole: 'High-Alpha Emerging Market Multiplier',
    bucket: 'LONG_TERM_GROWTH',
    bucketLabel: 'HIGH GROWTH',
    goalRoles: ['Multi-Decade Wealth Compounding', 'Aggressive Growth'],
    geography: 'India',
    sector: 'Emerging Manufacturing & High Growth',
    currency: 'INR',
    diversificationRole: 'Adds high-beta entrepreneurial growth participation across fast-growing small enterprises',
    keyRisks: 'High liquidity risk during market downturns, wide cyclical drawdowns, and elevated beta',
    whyFitsBase: 'High-growth emerging small-cap companies in India benefiting from domestic manufacturing, capex cycles, and structural growth.',
    holdingPeriod: '7+ Years',
    suggestedInstruments: ['Nippon India Small Cap Fund Direct-Growth', 'SBI Small Cap Fund'],
    description: 'High-growth emerging small-cap companies in India benefiting from domestic manufacturing, capex cycles, and structural growth.',
    color: '#EC4899',
    expenseRatio: '0.68%',
    aum: '₹46,200 Cr',
    benchmark: 'NIFTY Smallcap 250 TRI',
    historicalReturns: { oneYear: 31.4, threeYear: 24.8, fiveYear: 28.6 },
    sparklineData: {
      oneYear: [100, 108, 103, 115, 124, 118, 129, 136, 128, 138, 146],
      threeYear: [100, 122, 110, 138, 162, 148, 178, 198, 185, 215, 235],
      fiveYear: [100, 145, 125, 185, 235, 205, 280, 325, 295, 360, 410]
    }
  },
  {
    id: 'gold_hedge',
    name: 'Sovereign Gold Bonds / Nippon Gold BeES',
    ticker: 'GOLDBEES',
    category: 'Gold / SGB',
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
    goalRoles: ['Inflation Protection', 'Crisis Hedge', 'Portfolio Stabilization'],
    geography: 'Global',
    sector: 'Precious Metals',
    currency: 'INR',
    diversificationRole: 'Zero equity correlation asset providing structural portfolio stabilization during market panics',
    keyRisks: 'Opportunity cost during intense bull markets and spot currency fluctuations',
    whyFitsBase: 'Sovereign-backed inflation hedge with zero default risk, historically delivering negative correlation to equity market corrections.',
    holdingPeriod: '3+ Years',
    suggestedInstruments: ['RBI Sovereign Gold Bonds (SGB)', 'Nippon India Gold BeES ETF'],
    description: 'Sovereign-backed inflation hedge with zero default risk, historically delivering negative correlation to equity market corrections.',
    color: '#F59E0B',
    expenseRatio: '0.11%',
    aum: '₹14,200 Cr',
    benchmark: 'Domestic Spot Gold (IBJA)',
    historicalReturns: { oneYear: 16.5, threeYear: 13.8, fiveYear: 14.1 },
    sparklineData: {
      oneYear: [100, 102, 104, 103, 107, 109, 108, 112, 114, 113, 117],
      threeYear: [100, 108, 114, 119, 126, 131, 136, 141, 145, 149, 154],
      fiveYear: [100, 118, 132, 142, 155, 168, 179, 188, 196, 204, 212]
    }
  },
  {
    id: 'short_debt_fund',
    name: 'HDFC Short Duration Debt Fund Direct',
    ticker: 'HDFCSHORT',
    category: 'Corporate Debt',
    assetType: 'DEBT',
    market: 'AMFI',
    riskTier: 'LOW',
    volatilityTier: 'LOW',
    liquidityTier: 'HIGH',
    expectedCagr: 7.9,
    expectedReturnRange: '7.4% - 8.3% p.a.',
    minimumHorizonYears: 1,
    portfolioRole: 'Predictable Fixed Income & Yield Stability',
    bucket: 'GOAL_SPECIFIC',
    bucketLabel: 'STABILITY',
    goalRoles: ['Near-Term Goal Preservation (<3 Years)', 'Defensive Yield Accrual'],
    geography: 'India',
    sector: 'AAA Corporate Bonds & Sovereign Debt',
    currency: 'INR',
    diversificationRole: 'Shields capital against equity drawdowns while accruing monthly coupon yield',
    keyRisks: 'Interest rate duration risk and reinvestment rate shifts',
    whyFitsBase: 'AAA-rated corporate bond portfolio delivering predictable monthly accrual yields with low sensitivity to benchmark interest rate changes.',
    holdingPeriod: '1 to 3 Years',
    suggestedInstruments: ['HDFC Short Duration Debt Fund Direct', 'ICICI Short Term Bond'],
    description: 'AAA-rated corporate bond portfolio delivering predictable monthly accrual yields with low sensitivity to benchmark interest rate changes.',
    color: '#3B82F6',
    expenseRatio: '0.35%',
    aum: '₹16,800 Cr',
    benchmark: 'CRISIL Short Duration Debt Index',
    historicalReturns: { oneYear: 8.1, threeYear: 7.6, fiveYear: 7.4 },
    sparklineData: {
      oneYear: [100, 100.7, 101.4, 102.1, 102.8, 103.5, 104.2, 105.0, 105.8, 106.6, 107.9],
      threeYear: [100, 107.2, 114.8, 122.9, 131.5, 140.7, 150.5, 161.0, 172.3, 184.4, 197.3],
      fiveYear: [100, 107.4, 115.3, 123.8, 133.0, 142.8, 153.4, 164.8, 177.0, 190.1, 204.2]
    }
  },
  {
    id: 'liquid_fund',
    name: 'ICICI Prudential Liquid Fund Direct',
    ticker: 'ICICILIQ',
    category: 'Liquid / Emergency Debt',
    assetType: 'DEBT',
    market: 'AMFI',
    riskTier: 'LOW',
    volatilityTier: 'LOW',
    liquidityTier: 'HIGH',
    expectedCagr: 7.1,
    expectedReturnRange: '6.8% - 7.4% p.a.',
    minimumHorizonYears: 0,
    portfolioRole: 'Instant Liquidity & Emergency Cushion',
    bucket: 'SAFETY',
    bucketLabel: 'SAFETY / LIQUIDITY',
    goalRoles: ['Emergency Fund Runway', 'Tactical Cash Buffer', 'Instant T+1 Redemption'],
    geography: 'India',
    sector: 'Sovereign Treasury Bills & CPs',
    currency: 'INR',
    diversificationRole: 'Zero credit risk capital preservation with instant liquidity to protect against forced asset liquidations',
    keyRisks: 'Lower post-inflation real return',
    whyFitsBase: 'Ultra-low risk debt fund investing in sovereign treasury bills and high-quality commercial paper with instant redemption liquidity.',
    holdingPeriod: 'Instant (T+1)',
    suggestedInstruments: ['ICICI Prudential Liquid Fund Direct-Growth', 'HDFC Liquid Fund Direct'],
    description: 'Ultra-low risk debt fund investing in sovereign treasury bills and high-quality commercial paper with instant redemption liquidity.',
    color: '#64748B',
    expenseRatio: '0.20%',
    aum: '₹48,500 Cr',
    benchmark: 'CRISIL Liquid Debt Index',
    historicalReturns: { oneYear: 7.2, threeYear: 6.8, fiveYear: 6.2 },
    sparklineData: {
      oneYear: [100, 100.6, 101.2, 101.8, 102.4, 103.0, 103.6, 104.2, 104.8, 105.4, 107.1],
      threeYear: [100, 105.8, 111.9, 118.2, 124.5, 131.0, 137.5, 144.2, 151.0, 158.0, 165.2],
      fiveYear: [100, 106.2, 112.8, 119.8, 127.2, 135.1, 143.5, 152.4, 161.8, 171.9, 182.5]
    }
  },
  {
    id: 'conservative_hybrid',
    name: 'ICICI Prudential Regular Savings Fund Direct',
    ticker: 'ICICISAVE',
    category: 'Hybrid / Conservative Debt',
    assetType: 'HYBRID',
    market: 'AMFI',
    riskTier: 'LOW',
    volatilityTier: 'LOW',
    liquidityTier: 'HIGH',
    expectedCagr: 9.2,
    expectedReturnRange: '8.5% - 10.0% p.a.',
    minimumHorizonYears: 2,
    portfolioRole: 'Defensive Hybrid Capital Growth with Debt Shielding',
    bucket: 'CORE',
    bucketLabel: 'STABILITY',
    goalRoles: ['Conservative Capital Preservation', 'Low-Volatility Income Generation'],
    geography: 'India',
    sector: '75% AAA Bonds + 25% Bluechip Equity',
    currency: 'INR',
    diversificationRole: 'Balanced blend of fixed-income stability with mild equity participation',
    keyRisks: 'Moderate equity market risk and bond duration fluctuations',
    whyFitsBase: 'High-stability hybrid fund allocating 75% to AAA sovereign bonds and 25% to high-dividend large-cap equity to generate regular returns without significant drawdowns.',
    holdingPeriod: '2 to 5 Years',
    suggestedInstruments: ['ICICI Prudential Regular Savings Fund Direct', 'SBI Conservative Hybrid Fund'],
    description: 'High-stability hybrid fund allocating 75% to AAA sovereign bonds and 25% to high-dividend large-cap equity to generate regular returns without significant drawdowns.',
    color: '#0D9488',
    expenseRatio: '0.45%',
    aum: '₹3,400 Cr',
    benchmark: 'CRISIL Hybrid 85+15 - Conservative Index',
    historicalReturns: { oneYear: 10.8, threeYear: 9.4, fiveYear: 9.6 },
    sparklineData: {
      oneYear: [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 111],
      threeYear: [100, 109, 118, 128, 137, 147, 157, 168, 179, 191, 203],
      fiveYear: [100, 110, 121, 133, 146, 161, 177, 195, 214, 235, 258]
    }
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

  // 1. INFLOW & OUTFLOW CASHFLOW ENGINE
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
    if (hLower.includes('less than 3') || hLower.includes('< 3') || hLower.includes('1-2') || hLower.includes('2 year')) {
      horizonYears = 2;
    } else if (hLower.includes('3 to 5') || hLower.includes('3-5') || hLower.includes('3 year') || hLower.includes('4 year')) {
      horizonYears = 4;
    } else if (hLower.includes('5 to 10') || hLower.includes('5-10') || hLower.includes('5 year') || hLower.includes('7 year')) {
      horizonYears = 7;
    } else if (hLower.includes('10+') || hLower.includes('10 to 15') || hLower.includes('10-15')) {
      horizonYears = 12;
    } else if (hLower.includes('20+') || hLower.includes('more than 10') || hLower.includes('15+') || hLower.includes('20 year')) {
      horizonYears = 20;
    }
  }

  // Check near-term goal commitments
  const hasNearTermGoal = goalsList.some(g => {
    if (!g.targetDate) return false;
    const targetYr = new Date(g.targetDate).getFullYear();
    const currentYr = new Date().getFullYear();
    return (targetYr - currentYr) <= 3;
  }) || (profile.financialGoal && profile.financialGoal.toLowerCase().includes('house') && horizonYears <= 4);

  // 2. MULTI-FACTOR OBJECTIVE RISK CAPACITY & FINAL ADVISORY RISK
  const emergencyFundMonths = effectiveExpenses > 0 ? Number((emergencyFund / effectiveExpenses).toFixed(1)) : 0;
  let emergencyFundAdequacy: SuitabilityFactors['emergencyFundAdequacy'] = 'Inadequate';
  if (emergencyFundMonths >= 6) emergencyFundAdequacy = 'Surplus';
  else if (emergencyFundMonths >= 3.5) emergencyFundAdequacy = 'Healthy';
  else if (emergencyFundMonths >= 1.5) emergencyFundAdequacy = 'Moderate';

  // Stated Risk Tolerance Normalization
  const rawRiskTol = (profile.riskTolerance || profile.riskCategory || 'Moderate').toLowerCase();
  let statedToleranceLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'MODERATE';
  let statedToleranceScore = 55;

  if (rawRiskTol.includes('conservative') || rawRiskTol.includes('low')) {
    statedToleranceLevel = 'LOW';
    statedToleranceScore = 25;
  } else if (rawRiskTol.includes('aggressive') || rawRiskTol.includes('high') || rawRiskTol.includes('ultra')) {
    statedToleranceLevel = 'HIGH';
    statedToleranceScore = 85;
  } else {
    statedToleranceLevel = 'MODERATE';
    statedToleranceScore = 55;
  }

  // Institutional Risk Capacity Calculation (Independent of age-alone bias)
  let riskCapacityPoints = 50;

  // Emergency runway factor (+18 to -20)
  if (emergencyFundMonths >= 6) riskCapacityPoints += 18;
  else if (emergencyFundMonths >= 3) riskCapacityPoints += 8;
  else if (emergencyFundMonths >= 1) riskCapacityPoints -= 10;
  else riskCapacityPoints -= 20;

  // Savings rate factor (+15 to -25)
  if (savingsRate >= 35) riskCapacityPoints += 15;
  else if (savingsRate >= 20) riskCapacityPoints += 8;
  else if (savingsRate > 0) riskCapacityPoints -= 5;
  else riskCapacityPoints -= 25;

  // Compounding horizon factor (+18 to -20)
  if (horizonYears >= 10) riskCapacityPoints += 18;
  else if (horizonYears >= 5) riskCapacityPoints += 8;
  else if (horizonYears >= 3) riskCapacityPoints -= 5;
  else riskCapacityPoints -= 20;

  // Contextual Age factor (+10 to -10)
  if (age <= 30) riskCapacityPoints += 10;
  else if (age <= 45) riskCapacityPoints += 4;
  else if (age > 55) riskCapacityPoints -= 10;

  // Existing assets
  if (existingInvestments > 500000) riskCapacityPoints += 5;
  else if (existingInvestments === 0) riskCapacityPoints -= 3;

  const riskCapacityScore = Math.max(10, Math.min(95, Math.round(riskCapacityPoints)));

  let riskCapacityLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'MODERATE';
  if (riskCapacityScore >= 65) riskCapacityLevel = 'HIGH';
  else if (riskCapacityScore >= 40) riskCapacityLevel = 'MODERATE';
  else riskCapacityLevel = 'LOW';

  // Final Advisory Risk = min(Tolerance, Capacity) on scale LOW < MODERATE < HIGH
  const levelOrder = { LOW: 1, MODERATE: 2, HIGH: 3 };
  const revOrder: Record<number, 'LOW' | 'MODERATE' | 'HIGH'> = { 1: 'LOW', 2: 'MODERATE', 3: 'HIGH' };
  const finalAdvisoryRisk = revOrder[Math.min(levelOrder[statedToleranceLevel], levelOrder[riskCapacityLevel])];

  // Map to effectiveRiskCategory for UI display
  let effectiveRiskCategory: SuitabilityFactors['effectiveRiskCategory'] = 'Moderate';
  if (finalAdvisoryRisk === 'LOW') effectiveRiskCategory = 'Conservative';
  else if (finalAdvisoryRisk === 'HIGH') effectiveRiskCategory = 'Aggressive';
  else effectiveRiskCategory = 'Moderate';

  const isCapacityConstrained = levelOrder[statedToleranceLevel] > levelOrder[riskCapacityLevel];
  let capacityConstraintReason: string | undefined;
  if (isCapacityConstrained) {
    if (emergencyFundMonths < 3) {
      capacityConstraintReason = `Your stated risk preference is High, but your liquid emergency runway (${emergencyFundMonths} months) requires funding a safety reserve before taking maximum equity risk.`;
    } else if (horizonYears < 3) {
      capacityConstraintReason = `Your stated risk preference is High, but your investment horizon (<3 years) is too short to absorb potential equity drawdown cycles safely.`;
    } else {
      capacityConstraintReason = `Your objective financial capacity indicates your current cashflow and reserve cushion supports a balanced mandate.`;
    }
  }

  // Financial Resilience Score (0 - 100)
  const financialResilienceScore = Math.round(
    Math.min(100, Math.max(10, (emergencyFundMonths * 8) + (savingsRate * 0.6) + (horizonYears * 2)))
  );

  // Target Risk Budget (0 - 100)
  let targetRiskBudget = 55;
  if (finalAdvisoryRisk === 'LOW') {
    targetRiskBudget = horizonYears < 3 ? 20 : 30;
  } else if (finalAdvisoryRisk === 'MODERATE') {
    targetRiskBudget = horizonYears >= 10 ? 65 : 55;
  } else {
    // HIGH
    targetRiskBudget = horizonYears >= 10 && emergencyFundMonths >= 3 ? 90 : 80;
  }

  // 3. INVESTABLE AMOUNTS: SURPLUS, MAX CAPACITY, & RECOMMENDED SIP
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
    // 90% deployable into investment & safety buckets, 10% flexible cash cushion
    const flexBuffer = Math.round(monthlySurplus * 0.10);
    maxInvestableCapacity = monthlySurplus - flexBuffer;
    recommendedMonthlyInvestment = maxInvestableCapacity;
    remainingFlexibleBuffer = flexBuffer;
    bufferRationale = `Deploying 90% (₹${maxInvestableCapacity.toLocaleString('en-IN')}/mo) into your structured portfolio buckets while retaining a 10% cashflow liquidity cushion.`;
  }

  // 4. BUCKET ALLOCATION SIZING (Core vs Safety vs Goal-Specific vs Growth)
  let safetyBudgetPct = 0;
  let goalBudgetPct = 0;

  // Emergency runway allocation (Safety Bucket)
  if (emergencyFundMonths < 2) {
    safetyBudgetPct = 25; // 25% diverted to dedicated Safety/Liquid fund
  } else if (emergencyFundMonths < 3.5) {
    safetyBudgetPct = 15;
  } else {
    safetyBudgetPct = 0; // Fully funded emergency reserve; 0% needed in ongoing SIP
  }

  // Goal-Specific allocation (Near-term capital preservation)
  if (hasNearTermGoal && horizonYears <= 3) {
    goalBudgetPct = 35;
  } else if (hasNearTermGoal && horizonYears <= 5) {
    goalBudgetPct = 15;
  } else {
    goalBudgetPct = 0;
  }

  const coreAndGrowthPct = Math.max(0, 100 - safetyBudgetPct - goalBudgetPct);

  // 5. DYNAMIC ASSET CLASS BLUEPRINT FOR CORE/GROWTH MANDATE
  interface AssetClassWeight {
    id: string;
    weightPct: number;
    bucket: 'CORE' | 'SAFETY' | 'GOAL_SPECIFIC' | 'LONG_TERM_GROWTH';
    bucketLabel: string;
    role: string;
    instrumentCandidateId: string;
  }

  const assetClassTargets: AssetClassWeight[] = [];

  if (recommendedMonthlyInvestment <= 0) {
    assetClassTargets.push({
      id: 'emergency_liquid',
      weightPct: 100,
      bucket: 'SAFETY',
      bucketLabel: 'SAFETY / LIQUIDITY',
      role: 'Emergency Cash Cushion',
      instrumentCandidateId: 'liquid_fund'
    });
  } else {
    // Add Safety Bucket if needed
    if (safetyBudgetPct > 0) {
      assetClassTargets.push({
        id: 'safety_reserve',
        weightPct: safetyBudgetPct,
        bucket: 'SAFETY',
        bucketLabel: 'SAFETY / LIQUIDITY',
        role: 'Emergency Runway Acceleration',
        instrumentCandidateId: 'liquid_fund'
      });
    }

    // Add Goal-Specific Bucket if needed
    if (goalBudgetPct > 0) {
      assetClassTargets.push({
        id: 'goal_preservation',
        weightPct: goalBudgetPct,
        bucket: 'GOAL_SPECIFIC',
        bucketLabel: 'GOAL SPECIFIC',
        role: 'Near-Term Goal Capital Preservation',
        instrumentCandidateId: 'short_debt_fund'
      });
    }

    // Allocate Core & Long-Term Growth according to Final Advisory Risk & Horizon
    if (finalAdvisoryRisk === 'LOW' || horizonYears < 3) {
      // CONSERVATIVE / LOW RISK MANDATE
      // 35% Hybrid Stability, 25% Short Debt, 20% Core Index, 20% Gold
      const scale = coreAndGrowthPct / 100;
      assetClassTargets.push(
        {
          id: 'defensive_hybrid',
          weightPct: Math.round(35 * scale),
          bucket: 'CORE',
          bucketLabel: 'STABILITY',
          role: 'Defensive Hybrid Capital Growth',
          instrumentCandidateId: 'conservative_hybrid'
        },
        {
          id: 'short_debt',
          weightPct: Math.round(25 * scale),
          bucket: 'GOAL_SPECIFIC',
          bucketLabel: 'STABILITY',
          role: 'Predictable Fixed Income & Yield Stability',
          instrumentCandidateId: 'short_debt_fund'
        },
        {
          id: 'core_index',
          weightPct: Math.round(20 * scale),
          bucket: 'CORE',
          bucketLabel: 'CORE GROWTH',
          role: 'Conservative Large-Cap Core Exposure',
          instrumentCandidateId: 'nifty50_index'
        },
        {
          id: 'gold_hedge',
          weightPct: Math.round(20 * scale),
          bucket: 'CORE',
          bucketLabel: 'INFLATION HEDGE',
          role: 'Inflation & Crisis Hedge',
          instrumentCandidateId: 'gold_hedge'
        }
      );
    } else if (finalAdvisoryRisk === 'MODERATE') {
      // MODERATE / BALANCED MANDATE
      // 35% Core Index, 25% Flexi-Cap, 15% Global ETF, 10% Gold, 15% Corporate Debt
      const scale = coreAndGrowthPct / 100;
      assetClassTargets.push(
        {
          id: 'core_index',
          weightPct: Math.round(35 * scale),
          bucket: 'CORE',
          bucketLabel: 'CORE GROWTH',
          role: 'Core Large-Cap Market Anchor',
          instrumentCandidateId: 'nifty50_index'
        },
        {
          id: 'flexi_cap',
          weightPct: Math.round(25 * scale),
          bucket: 'CORE',
          bucketLabel: 'CORE GROWTH',
          role: 'Dynamic Multi-Cap Alpha Compounding',
          instrumentCandidateId: 'flexicap_fund'
        },
        {
          id: 'global_tech',
          weightPct: Math.round(15 * scale),
          bucket: 'LONG_TERM_GROWTH',
          bucketLabel: 'GLOBAL DIVERSIFICATION',
          role: 'Global Tech & US Currency Hedge',
          instrumentCandidateId: 'nasdaq_etf'
        },
        {
          id: 'gold_hedge',
          weightPct: Math.round(10 * scale),
          bucket: 'CORE',
          bucketLabel: 'INFLATION HEDGE',
          role: 'Portfolio Volatility Damper',
          instrumentCandidateId: 'gold_hedge'
        },
        {
          id: 'corporate_debt',
          weightPct: Math.round(15 * scale),
          bucket: 'GOAL_SPECIFIC',
          bucketLabel: 'STABILITY',
          role: 'Fixed Income Yield Stability',
          instrumentCandidateId: 'short_debt_fund'
        }
      );
    } else {
      // HIGH / AGGRESSIVE MANDATE
      // 35% Core Index, 25% Flexi-Cap, 25% Global Tech, 10% Emerging Small-Cap, 5% Gold Hedge
      const scale = coreAndGrowthPct / 100;
      assetClassTargets.push(
        {
          id: 'core_index',
          weightPct: Math.round(35 * scale),
          bucket: 'CORE',
          bucketLabel: 'CORE GROWTH',
          role: 'Foundational Large-Cap Anchor',
          instrumentCandidateId: 'nifty50_index'
        },
        {
          id: 'flexi_cap',
          weightPct: Math.round(25 * scale),
          bucket: 'CORE',
          bucketLabel: 'CORE GROWTH',
          role: 'Multi-Cap Value & Alpha Compounding',
          instrumentCandidateId: 'flexicap_fund'
        },
        {
          id: 'global_tech',
          weightPct: Math.round(25 * scale),
          bucket: 'LONG_TERM_GROWTH',
          bucketLabel: 'GLOBAL DIVERSIFICATION',
          role: 'High-Alpha Global Tech & US Dollar Hedge',
          instrumentCandidateId: 'nasdaq_etf'
        },
        {
          id: 'small_cap',
          weightPct: Math.round(10 * scale),
          bucket: 'LONG_TERM_GROWTH',
          bucketLabel: 'HIGH GROWTH',
          role: 'Emerging Small-Cap Alpha Multiplier',
          instrumentCandidateId: 'smallcap_fund'
        },
        {
          id: 'gold_hedge',
          weightPct: Math.round(5 * scale),
          bucket: 'CORE',
          bucketLabel: 'INFLATION HEDGE',
          role: 'Tail-Risk Crisis Hedge',
          instrumentCandidateId: 'gold_hedge'
        }
      );
    }
  }

  // 6. CANDIDATE SCORING & MULTI-FACTOR RANKING
  const scoredCandidates = CANDIDATE_UNIVERSE.map((candidate) => {
    // Factor 1: Risk Fit (out of 25)
    let riskFit = 20;
    if (finalAdvisoryRisk === 'LOW') {
      riskFit = candidate.riskTier === 'LOW' ? 25 : (candidate.riskTier === 'MODERATE' ? 18 : 5);
    } else if (finalAdvisoryRisk === 'MODERATE') {
      riskFit = candidate.riskTier === 'MODERATE' ? 25 : (candidate.riskTier === 'LOW' ? 20 : 16);
    } else {
      // HIGH
      riskFit = candidate.riskTier === 'HIGH' || candidate.riskTier === 'VERY_HIGH' ? 25 : (candidate.riskTier === 'MODERATE' ? 22 : 12);
    }

    // Factor 2: Horizon Fit (out of 20)
    let goalHorizonFit = 10;
    if (horizonYears >= candidate.minimumHorizonYears) {
      goalHorizonFit = Math.min(20, 15 + Math.min(5, horizonYears - candidate.minimumHorizonYears));
    } else {
      goalHorizonFit = Math.max(2, 15 - ((candidate.minimumHorizonYears - horizonYears) * 6));
    }

    // Factor 3: Diversification Benefit (out of 20)
    let diversificationFit = 16;
    if (candidate.category.includes('Global') || candidate.category.includes('Gold')) {
      diversificationFit = 19;
    } else if (candidate.category.includes('Index')) {
      diversificationFit = 18;
    }

    // Factor 4: Cost Efficiency (out of 15)
    let costEfficiencyFit = 12;
    if (candidate.expenseRatio.includes('0.18') || candidate.expenseRatio.includes('0.11') || candidate.expenseRatio.includes('0.00')) {
      costEfficiencyFit = 15;
    } else if (candidate.expenseRatio.includes('0.20') || candidate.expenseRatio.includes('0.35')) {
      costEfficiencyFit = 13;
    } else {
      costEfficiencyFit = 10;
    }

    // Factor 5: Existing Portfolio Overlap Fit (out of 20)
    let existingExposureFit = 18;
    if (existingInvestments > 500000 && candidate.id === 'nifty50_index') {
      existingExposureFit = 14;
    }

    // Strict Eligibility Gating for high-volatility instruments
    if (candidate.id === 'smallcap_fund' && (horizonYears < 5 || finalAdvisoryRisk === 'LOW')) {
      riskFit = 3;
      goalHorizonFit = 3;
    }
    if (candidate.id === 'nasdaq_etf' && (horizonYears < 3 || finalAdvisoryRisk === 'LOW')) {
      riskFit = Math.min(riskFit, 6);
      goalHorizonFit = Math.min(goalHorizonFit, 4);
    }

    const total = Math.min(98, Math.max(15, riskFit + goalHorizonFit + diversificationFit + costEfficiencyFit + existingExposureFit));

    return {
      candidate,
      suitabilityScore: total,
      suitabilityBreakdown: {
        riskFit,
        goalHorizonFit,
        diversificationFit,
        costEfficiencyFit,
        existingExposureFit,
        total
      }
    };
  });

  // 7. ASSEMBLE RECOMMENDED ASSETS FROM DYNAMIC TARGETS
  const allocatedAssets: RecommendedAsset[] = [];
  const excludedAssets: ExcludedInstrument[] = [];

  for (const target of assetClassTargets) {
    if (target.weightPct <= 0) continue;
    const cand = CANDIDATE_UNIVERSE.find(c => c.id === target.instrumentCandidateId);
    if (!cand) continue;

    const scoreEntry = scoredCandidates.find(s => s.candidate.id === cand.id);
    const amount = Math.round(recommendedMonthlyInvestment * (target.weightPct / 100));

    let whyFits = cand.whyFitsBase;
    if (target.bucket === 'SAFETY') {
      whyFits = `Allocated specifically to your Safety / Liquidity Reserve (${emergencyFundMonths} mo runway) to protect against forced liquidations.`;
    } else if (target.bucket === 'GOAL_SPECIFIC') {
      whyFits = `Selected for your near-term goal preservation to shield capital against equity drawdown cycles.`;
    } else if (target.bucket === 'LONG_TERM_GROWTH') {
      whyFits = `Selected for your Long-Term Growth bucket because your final advisory risk is ${finalAdvisoryRisk} and horizon is ${horizonYears} years.`;
    } else {
      whyFits = `Core wealth foundation delivering disciplined multi-factor compounding tailored to your ${finalAdvisoryRisk} risk profile.`;
    }

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
      bucket: target.bucket,
      bucketLabel: target.bucketLabel,
      portfolioRole: target.role,
      percentage: target.weightPct,
      monthlyAmount: amount,
      suitabilityScore: scoreEntry?.suitabilityScore || 85,
      suitabilityBreakdown: scoreEntry?.suitabilityBreakdown,
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

  // MATHEMATICAL NORMALIZATION: SUM(percentages) = 100% and SUM(amounts) = recommendedMonthlyInvestment
  const currentTotalPct = allocatedAssets.reduce((sum, a) => sum + a.percentage, 0);
  if (allocatedAssets.length > 0 && currentTotalPct !== 100) {
    const diffPct = 100 - currentTotalPct;
    allocatedAssets[0].percentage += diffPct;
  }

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

  // Compute Weighted Risk Score (Low = 2, Moderate = 5, High = 8, VeryHigh = 10)
  const riskWeightMap: Record<string, number> = { LOW: 2, MODERATE: 5, HIGH: 8, VERY_HIGH: 10 };
  
  const coreWeightTotal = coreAllocations.reduce((s, a) => s + a.percentage, 0) + growthAllocations.reduce((s, a) => s + a.percentage, 0);
  const coreRiskWeightedSum = [...coreAllocations, ...growthAllocations].reduce(
    (s, a) => s + ((riskWeightMap[a.riskTier || 'MODERATE'] || 5) * a.percentage), 0
  );
  const corePortfolioRisk = coreWeightTotal > 0 ? Number((coreRiskWeightedSum / coreWeightTotal).toFixed(1)) : 2.0;

  const totalWeightedRisk = allocatedAssets.reduce(
    (s, a) => s + ((riskWeightMap[a.riskTier || 'MODERATE'] || 5) * a.percentage), 0
  );
  const overallPortfolioRisk = Number((totalWeightedRisk / 100).toFixed(1));
  const safetyPortfolioRisk = 1.0;

  // 8. ASSET CLASS BLUEPRINT
  const assetClassBlueprint: AssetClassBlueprintItem[] = allocatedAssets.map((asset) => ({
    id: asset.id,
    name: asset.category,
    percentage: asset.percentage,
    monthlyAmount: asset.monthlyAmount,
    color: asset.color,
    role: asset.portfolioRole,
    instrumentName: asset.name
  }));

  // 9. DIVERSIFICATION HEALTH BREAKDOWN
  let divScore = 50;
  const uniqueCategories = new Set(allocatedAssets.map(a => a.category)).size;
  if (uniqueCategories >= 4) divScore += 25;
  else if (uniqueCategories >= 3) divScore += 18;
  else divScore += 8;

  const hasGlobal = allocatedAssets.some(a => a.category.includes('Global'));
  if (hasGlobal) divScore += 12;

  const hasGold = allocatedAssets.some(a => a.category.includes('Gold'));
  if (hasGold) divScore += 10;

  const hasDebtOrLiquid = allocatedAssets.some(a => a.category.includes('Debt') || a.category.includes('Liquid'));
  if (hasDebtOrLiquid) divScore += 8;

  const maxSingleAlloc = Math.max(...allocatedAssets.map(a => a.percentage));
  if (maxSingleAlloc <= 35) divScore += 8;
  else if (maxSingleAlloc > 45) divScore -= 12;

  const diversificationScore = Math.min(98, Math.max(40, divScore));

  const strongPoints: string[] = [];
  const watchPoints: string[] = [];

  if (uniqueCategories >= 4) strongPoints.push('True Multi-Asset Allocation across Equities, Debt, Global, and Gold');
  if (hasGlobal) strongPoints.push('Geographic US Dollar & Global Tech Diversification (MON100)');
  if (hasGold) strongPoints.push('Sovereign Gold Inflation & Crisis Hedge');
  if (safetyAllocationPct > 0) strongPoints.push(`Dedicated Safety / Liquidity Reserve (${safetyAllocationPct}%) protecting against forced liquidations`);
  if (maxSingleAlloc <= 35) strongPoints.push(`Single Asset Concentration Capped (Max ${maxSingleAlloc}%)`);

  if (emergencyFundMonths < 3) watchPoints.push(`Liquid runway is ${emergencyFundMonths} months; safety reserve allocation active in SIP.`);
  if (!hasGlobal && finalAdvisoryRisk !== 'LOW') watchPoints.push('Zero international exposure; concentrated in Indian domestic assets.');
  if (maxSingleAlloc > 35) watchPoints.push(`Largest asset allocation is ${maxSingleAlloc}%; monitor for equity concentration.`);
  if (watchPoints.length === 0) watchPoints.push('Optimal balance achieved across growth, safety, and inflation hedges.');

  // 10. EXCLUDED OR DEPRIORITIZED CANDIDATES WITH EVIDENCE
  CANDIDATE_UNIVERSE.forEach((cand) => {
    const isAllocated = allocatedAssets.some(a => a.id === cand.id);
    if (!isAllocated) {
      let reason = '';
      if (cand.id === 'nasdaq_etf') {
        reason = finalAdvisoryRisk === 'LOW' || horizonYears < 3
          ? `Excluded high-volatility global tech ETF to safeguard capital preservation for your ${finalAdvisoryRisk} mandate.`
          : `Deprioritized in favor of foundational domestic index allocations.`;
      } else if (cand.id === 'smallcap_fund') {
        reason = finalAdvisoryRisk !== 'HIGH' || horizonYears < 5
          ? `Excluded emerging small-cap alpha multiplier because minimum 5-7 year horizon and high risk capacity are required.`
          : `Deprioritized in favor of large-cap and flexi-cap core compounding.`;
      } else if (cand.id === 'short_debt_fund' || cand.id === 'liquid_fund') {
        reason = finalAdvisoryRisk === 'HIGH' && emergencyFundMonths >= 3.5
          ? `Low-yield debt excluded from core growth portfolio because your emergency reserve is already fully funded.`
          : `Deprioritized in favor of higher-yielding multi-asset growth compounders.`;
      } else if (cand.id === 'conservative_hybrid') {
        reason = `Excluded conservative hybrid debt-shielded fund as your risk mandate supports pure growth equity and global assets.`;
      } else {
        reason = `Deprioritized based on multi-factor suitability scoring and portfolio diversification rules.`;
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

  // 11. 2D RISK VS RETURN MATRIX POINTS
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

  // 12. PROJECTIONS
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

  // Expected CAGR Range Display
  const returnMin = (weightedCagr - 1.2).toFixed(1);
  const returnMax = (weightedCagr + 1.2).toFixed(1);

  // Strategy Name
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
      liquidityRequirement: safetyBudgetPct > 0 ? 'High' : 'Moderate',
      horizonStrength: horizonYears >= 10 ? 'Multi-Decade' : (horizonYears >= 5 ? 'Long-Term' : 'Short-Term')
    },
    whyThisStrategy: {
      summaryRationale: `Personalized ${finalAdvisoryRisk} strategy configured for age ${age} across a ${horizon} horizon.`,
      badges: [
        `${finalAdvisoryRisk} Advisory Risk`,
        `${horizonYears}Y Horizon`,
        safetyBudgetPct > 0 ? `Safety Reserve Active (${safetyBudgetPct}%)` : 'Core Growth Dedicated',
        `${uniqueCategories} Distinct Asset Classes`
      ],
      deepRationale: `This portfolio dynamically allocates your ₹${recommendedMonthlyInvestment.toLocaleString('en-IN')}/month investable surplus across ${allocatedAssets.length} verified candidate instruments to balance growth, inflation hedging, and capital stability.`,
      keyHighlights: [
        `Expected Portfolio CAGR: ~${weightedCagr.toFixed(1)}% p.a.`,
        `Core Weighted Risk: ${corePortfolioRisk}/10`,
        safetyBudgetPct > 0 ? `Safety Reserve: ${safetyBudgetPct}% in Liquid Fund` : 'Emergency Runway: Fully Funded'
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
      overallConfidencePercentage: 92
    }
  };
}
