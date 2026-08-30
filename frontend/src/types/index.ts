export type Currency = 'INR' | 'USD';

export interface UserProfile {
  id?: string;
  email: string;
  name: string;
  age?: number;
  occupation?: string;
  salaryIncome?: number;
  otherIncome?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  emergencyFund?: number;
  existingSavings?: number;
  existingInvestments?: number;
  financialGoal?: string;
  investmentHorizon?: 'Less than 3 years' | '3 to 5 years' | '5 to 10 years' | '10+ years' | string;
  investmentExperience?: 'Beginner' | 'Intermediate' | 'Advanced';
  riskTolerance?: 'Conservative' | 'Moderate' | 'Aggressive';
  riskCategory?: 'Conservative' | 'Moderate' | 'Aggressive' | 'Growth';
  riskScore?: number; // 0-100
  riskAnswers?: Record<string, number>;
  goals?: string[];
  primaryGoals?: string[];
  onboardingCompleted?: boolean;
}

export interface SmartInsightsData {
  financialHealthScore: number; // 0 - 100
  emergencyFundScore: number; // 0 - 100
  goalReadinessScore: number; // 0 - 100
  investmentReadinessScore: number; // 0 - 100
  overallConfidencePercentage: number; // e.g. 92%
}

export type AssetCategory = 
  | 'Index Mutual Fund' 
  | 'Flexi Cap Fund' 
  | 'Global ETF' 
  | 'Gold / SGB' 
  | 'Liquid / Emergency Debt'
  | 'Mid / Small Cap Fund'
  | 'Direct Equity / Stock'
  | 'Corporate Debt'
  | 'Hybrid / Conservative Debt';

export interface RecommendedAsset {
  id: string;
  name: string;
  ticker?: string;
  category: AssetCategory | string;
  assetType?: 'EQUITY' | 'DEBT' | 'COMMODITY' | 'GLOBAL_EQUITY' | 'HYBRID';
  percentage: number;
  monthlyAmount: number;
  suitabilityScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High';
  volatilityLevel: 'Low' | 'Moderate' | 'High';
  liquidityLevel: 'High' | 'Moderate' | 'Low';
  expectedCagr: number;
  expectedReturnRange: string;
  portfolioRole: string; // e.g. 'Core Equity Growth', 'Downside Cushion', 'Inflation Hedge'
  bucket?: 'CORE' | 'SAFETY' | 'GOAL_SPECIFIC' | 'LONG_TERM_GROWTH';
  bucketLabel?: string; // e.g. 'CORE GROWTH', 'SAFETY / LIQUIDITY', 'GLOBAL DIVERSIFICATION', 'INFLATION HEDGE'
  holdingPeriod: string; // e.g. '5+ Years', '3 to 5 Years', 'Instant / T+1'
  suggestedInstruments: string[];
  description: string;
  reasonSelected: string;
  whyFitsProfile?: string;
  keyRisks?: string;
  diversificationRole?: string;
  riskTier?: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  volatilityTier?: 'LOW' | 'MODERATE' | 'HIGH';
  liquidityTier?: 'HIGH' | 'MODERATE' | 'LOW';
  market?: string;
  geography?: string;
  sector?: string;
  color: string;
  expenseRatio?: string;
  aum?: string;
  benchmark?: string;
  historicalReturns?: {
    oneYear?: number;
    threeYear?: number;
    fiveYear?: number;
  };
  sparklineData?: {
    oneYear: number[];
    threeYear: number[];
    fiveYear: number[];
  };
  suitabilityBreakdown?: {
    riskFit: number; // out of 25
    goalHorizonFit: number; // out of 20
    diversificationFit: number; // out of 20
    costEfficiencyFit: number; // out of 15
    existingExposureFit: number; // out of 20
    total: number; // out of 100
  };
}

export interface ExcludedInstrument {
  id: string;
  name: string;
  category: string;
  suitabilityScore: number;
  reasonExcluded: string;
  portfolioRole?: string;
  bucket?: string;
}

export interface RiskReturnPoint {
  id: string;
  name: string;
  category: string;
  expectedReturn: number; // e.g. 13.5
  riskScore: number;       // 1 to 10
  allocationPct: number;
  color: string;
}

export interface SuitabilityFactors {
  riskCapacityScore: number; // 0 - 100
  riskToleranceScore: number; // 0 - 100
  effectiveRiskScore: number; // 0 - 100
  effectiveRiskCategory: 'Conservative' | 'Moderate' | 'Growth' | 'Aggressive';
  finalAdvisoryRisk?: 'LOW' | 'MODERATE' | 'HIGH';
  financialResilienceScore?: number;
  targetRiskBudget?: number;
  isCapacityConstrained: boolean;
  capacityConstraintReason?: string;
  emergencyFundMonths: number;
  emergencyFundAdequacy: 'Inadequate' | 'Moderate' | 'Healthy' | 'Surplus';
  savingsRate: number;
  investableSurplus: number;
  cashflowStatus: 'Surplus Positive' | 'Break-Even' | 'Deficit / Inadequate';
  liquidityRequirement: 'High' | 'Moderate' | 'Low';
  horizonStrength: 'Short-Term' | 'Medium-Term' | 'Long-Term' | 'Multi-Decade';
}

export interface AssetClassBlueprintItem {
  id: string;
  name: string;
  percentage: number;
  monthlyAmount: number;
  color: string;
  role: string;
  instrumentName: string;
}

export interface InvestmentStrategy {
  strategyName: string;
  riskProfile: 'Conservative' | 'Moderate' | 'Growth' | 'Aggressive';
  finalAdvisoryRisk?: 'LOW' | 'MODERATE' | 'HIGH';
  targetRiskBudget?: number;
  corePortfolioRisk?: number;
  safetyPortfolioRisk?: number;
  overallPortfolioRisk?: number;
  coreAllocationPct?: number;
  safetyAllocationPct?: number;
  goalSpecificAllocationPct?: number;
  longTermGrowthAllocationPct?: number;
  expectedReturnRange: string; // e.g. "12.0% - 14.5% p.a."
  monthlySurplus: number;
  maxInvestableCapacity: number;
  recommendedMonthlyInvestment: number;
  totalMonthlyInvestable: number; // alias for backward-compatibility
  remainingFlexibleBuffer: number;
  unusedCapacity: number;
  unusedCapacityRationale?: string;
  stepUpPotential?: {
    amount: number;
    trigger: string;
  };
  whyNotMoreLiquid?: string;
  diversificationScore: number; // 0 - 100
  diversificationBreakdown: {
    strong: string[];
    watch: string[];
  };
  assetClassBlueprint: AssetClassBlueprintItem[];
  bufferRationale: string;
  horizon: string;
  allocations: RecommendedAsset[];
  excludedOrDeprioritized: ExcludedInstrument[];
  riskReturnMatrix: RiskReturnPoint[];
  suitabilityFactors: SuitabilityFactors;
  whyThisStrategy: {
    summaryRationale: string;
    badges: string[];
    deepRationale: string;
    keyHighlights: string[];
  };
  projections: {
    year5: number;
    year10: number;
    year15: number;
    year20: number;
    totalInvested10Yr: number;
    wealthGain10Yr: number;
  };
  smartInsights: SmartInsightsData;
}

export interface ExpenseItem {
  id: string;
  category: 'Food' | 'Rent' | 'Shopping' | 'Transport' | 'Entertainment' | 'Utilities' | 'EMI' | 'Other';
  amount: number;
  date: string;
  description: string;
  isRecurring?: boolean;
}

export interface GoalItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'House' | 'Car' | 'Retirement' | 'Wealth Building' | 'Education' | 'Travel' | 'Other';
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  monthlySipRequired: number;
  probability: number; // 0 - 100%
  projectedCorpus: number;
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'On Track' | 'Attention' | 'Ahead';
}

export interface InvestmentPlatform {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  badge: string;
  supportedTypes: string[];
  pros: string[];
  bestFor: string;
  rating: number;
  websiteUrl: string;
}
