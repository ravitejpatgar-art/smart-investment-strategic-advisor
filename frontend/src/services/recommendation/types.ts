import type { UserProfile, QuoteStatus } from '../../types';
import type { MarketQuote, InstrumentResearchBundle, FreshnessType } from '../marketApi';
export type { FreshnessType };

export type AssetClassType = 'MUTUAL_FUND' | 'ETF' | 'BOND';
export type RequestedAssetClass = AssetClassType | 'ANY';

export interface PortfolioHolding {
  symbol: string;
  name: string;
  assetClass: AssetClassType | 'STOCK' | 'GOLD' | 'CASH';
  allocationPct: number;
  amount?: number;
  sector?: string;
  benchmark?: string;
}

export interface RecommendationRequest {
  userProfile: UserProfile | null;
  preferredAssetClass?: RequestedAssetClass;
  monthlyInvestableAmount?: number;
  goalAmount?: number;
  financialGoal?: string;
  investmentHorizon?: string;
  liquidityRequirement?: 'High' | 'Moderate' | 'Low';
  existingPortfolio?: PortfolioHolding[];
  country?: 'INDIA' | 'US';
  currency?: 'INR' | 'USD';
}

export interface SuitabilityProfile {
  isSufficient: boolean;
  missingFields: string[];
  effectiveRiskScore: number; // 0-100
  effectiveRiskCategory: 'Conservative' | 'Moderate' | 'Aggressive';
  riskCapacityScore: number;
  riskToleranceScore: number;
  horizonYears: number;
  monthlySurplus: number;
  emergencyFundMonths: number;
  emergencyFundAdequate: boolean;
  liquidityRequirement: 'High' | 'Moderate' | 'Low';
  primaryGoal: string;
  investmentExperience: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

export interface ScoringFactorResult {
  factor: string;
  value: number | string;
  normalizedScore: number; // 0-100
  weight: number; // Configured nominal weight (e.g. 0.20)
  effectiveWeight: number; // Re-normalized weight if some factors unavailable
  contribution: number; // normalizedScore * effectiveWeight
  evidence: string;
  dataSource: string;
  dataFreshness: FreshnessType;
  isAvailable: boolean;
}

export interface CandidateInstrumentRecord {
  canonicalId: string;
  symbol: string;
  name: string;
  assetClass: AssetClassType;
  category: string;
  subCategory: string;
  market: 'AMFI' | 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE';
  currency: 'INR' | 'USD';
  riskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  minimumHorizonYears: number;
  benchmark: string;
  expenseRatioPct?: number;
  expenseRatioStr?: string;
  aumCr?: number;
  aumStr?: string;
  
  // Mutual Fund specific
  schemeCode?: string;
  managerConsistencyScore?: number;
  sharpeRatio?: number;
  maxDrawdownPct?: number;
  volatilityPct?: number;
  historicalReturns?: {
    oneYear?: number;
    threeYear?: number;
    fiveYear?: number;
  };
  portfolioRole?: string;
  amc?: string;

  // ETF specific
  trackingErrorPct?: number;
  trackingDifferencePct?: number;
  dailyLiquidityVolume?: number;

  // Bond specific
  isin?: string;
  issuer?: string;
  issuerQualityScore?: number; // 0 - 100
  creditRating?: string;
  maturityDate?: string;
  maturityYears?: number;
  couponPct?: number;
  ytmPct?: number;
  durationYears?: number;
  faceValue?: number;
  securityType?: 'SOVEREIGN' | 'PSU' | 'CORPORATE_AAA' | 'CORPORATE_AA';
  liquidityStatus?: 'HIGH' | 'MODERATE' | 'LOW' | 'LAST_TRADED';

  // Live/EOD Market Data Hydration
  quote?: MarketQuote | null;
  research?: InstrumentResearchBundle | null;
  hydration?: CandidateHydrationResult;
}

export interface CandidateHydrationResult {
  canonicalId: string;
  symbol: string;
  assetClass: AssetClassType;
  metrics: {
    price?: number | null;
    nav?: number | null;
    navDate?: string | null;
    expenseRatioPct?: number | null;
    aumCr?: number | null;
    trackingErrorPct?: number | null;
    sharpeRatio?: number | null;
    volatilityPct?: number | null;
    maxDrawdownPct?: number | null;
    ytmPct?: number | null;
    durationYears?: number | null;
    couponPct?: number | null;
    creditRating?: string | null;
    maturityDate?: string | null;
    returns?: { oneYear?: number; threeYear?: number; fiveYear?: number };
    [key: string]: any;
  };
  dataSource: string;
  dataTimestamp: string;
  freshness: FreshnessType;
  currency: string;
  availableFields: string[];
  isHydrated: boolean;
}

export interface RecommendationDebugAudit {
  candidateCount: number;
  eligibleCount: number;
  scoredCount: number;
  excludedCount: number;
  selectedCanonicalId: string | null;
  selectedScore: number | null;
  dataCoveragePct: number;
  freshness: FreshnessType;
  source: string;
}

export interface ScoredCandidate {
  candidate: CandidateInstrumentRecord;
  assetClass: AssetClassType;
  finalScore: number; // 0 - 100
  suitabilityFitScore: number; // 0 - 100
  evidenceCoveragePct: number; // 0 - 100
  freshnessScore: number; // Higher is fresher
  factors: ScoringFactorResult[];
  unavailableFactors: string[];
  negativeFactors: string[];
  risks: string[];
  quoteStatus: QuoteStatus;
  dataSource: string;
  dataTimestamp: string;
  asOfDate: string;
}

export interface RecommendedInstrumentSummary {
  canonicalId: string;
  symbol: string;
  name: string;
  assetClass: AssetClassType;
  score: number;
  currentPrice: number | null;
  currency: string;
  freshness: FreshnessType;
  quoteStatus: QuoteStatus;
  asOfDate: string;
  dataTimestamp: string;
  dataSource: string;
  category: string;
  benchmark: string;
  expenseRatio?: string;
  creditRating?: string;
  maturity?: string;
  coupon?: number;
  ytm?: number;
  duration?: number;
}

export interface WhyChosenFactor {
  factor: string;
  evidence: string;
  contribution: number;
  dataSource?: string;
}

export interface LowerScoredAlternative {
  canonicalId: string;
  instrument: string;
  assetClass: AssetClassType;
  score: number;
  reason: string;
  missingDataLimitations?: string;
}

export interface DataQualityAudit {
  coveragePct: number;
  freshness: FreshnessType;
  timestamp: string;
  sources: string[];
}

export interface ScoringMethodologyConfig {
  version: string;
  assetClass: AssetClassType;
  weights: Record<string, number>;
}

export interface RecommendationResponse {
  status: 'SUCCESS' | 'INSUFFICIENT_PROFILE' | 'INSUFFICIENT_DATA';
  message?: string;
  missingProfileFields?: string[];
  recommendedInstrument: RecommendedInstrumentSummary | null;
  whyChosen: WhyChosenFactor[];
  negativeFactors: string[];
  whyAlternativesScoredLower: LowerScoredAlternative[];
  risks: string[];
  dataQuality: DataQualityAudit;
  methodology: ScoringMethodologyConfig;
  disclaimer: string;
  evaluatedCandidatesCount: number;
  eligibleCandidatesCount: number;
  rankingAudit?: {
    candidateId: string;
    score: number;
    suitabilityFit: number;
    coveragePct: number;
    freshnessScore: number;
  }[];
  audit?: RecommendationDebugAudit;
}

// =============================================================================
// TRANSPARENT CONFIGURABLE SCORING WEIGHTS (Mandatory Constants)
// =============================================================================

export const MUTUAL_FUND_WEIGHTS: Record<string, number> = {
  categoryGoalFit: 0.25,
  riskSuitability: 0.20,
  consistency: 0.15,
  benchmarkRelativeEvidence: 0.10,
  expenseRatio: 0.10,
  downsideDrawdown: 0.10,
  riskAdjustedPerformance: 0.05,
  portfolioDiversification: 0.05
};

export const ETF_WEIGHTS: Record<string, number> = {
  benchmarkGoalFit: 0.20,
  trackingDifferenceError: 0.20,
  expenseRatio: 0.15,
  liquidity: 0.15,
  aum: 0.10,
  volatilityDrawdown: 0.10,
  portfolioDiversification: 0.10
};

export const BOND_WEIGHTS: Record<string, number> = {
  goalMaturityFit: 0.20,
  creditQuality: 0.20,
  yieldYtm: 0.20,
  durationRateSensitivity: 0.15,
  liquidity: 0.10,
  issuerQuality: 0.10,
  portfolioDiversification: 0.05
};
