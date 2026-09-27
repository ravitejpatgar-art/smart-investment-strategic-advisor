import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  recommendationEngine,
  type RecommendationRequest,
  checkCandidateEligibility,
  analyzePortfolioOverlap,
  scoreMutualFund,
  rankCandidatesDeterministically,
  validateLlmExplanation,
  MUTUAL_FUND_WEIGHTS,
  ETF_WEIGHTS,
  BOND_WEIGHTS,
  type CandidateInstrumentRecord,
  type SuitabilityProfile
} from '../services/recommendation';
import type { UserProfile } from '../types';
import { marketApi } from '../services/marketApi';

describe('Deterministic Multi-Asset Recommendation Engine', () => {
  const baseProfile: UserProfile = {
    id: 'user_test_001',
    name: 'Amit Verma',
    email: 'amit@example.com',
    age: 32,
    salaryIncome: 150000,
    monthlyIncome: 150000,
    monthlyExpenses: 60000,
    emergencyFund: 360000,
    existingSavings: 360000,
    existingInvestments: 500000,
    financialGoal: 'Long-Term Wealth Creation',
    investmentHorizon: '5 to 10 years',
    investmentExperience: 'Intermediate',
    riskTolerance: 'Moderate',
    riskCategory: 'Moderate',
    onboardingCompleted: true
  };

  const conservativeSeniorProfile: UserProfile = {
    id: 'user_senior_002',
    name: 'Dr. Kulkarni',
    email: 'kulkarni@example.com',
    age: 64,
    salaryIncome: 90000,
    monthlyIncome: 90000,
    monthlyExpenses: 45000,
    emergencyFund: 500000,
    existingSavings: 500000,
    existingInvestments: 2000000,
    financialGoal: 'Capital Preservation & Medical Emergency',
    investmentHorizon: 'Less than 3 years',
    investmentExperience: 'Advanced',
    riskTolerance: 'Conservative',
    riskCategory: 'Conservative',
    onboardingCompleted: true
  };

  const aggressiveYoungProfile: UserProfile = {
    id: 'user_young_003',
    name: 'Priya Nair',
    email: 'priya@example.com',
    age: 24,
    salaryIncome: 120000,
    monthlyIncome: 120000,
    monthlyExpenses: 35000,
    emergencyFund: 200000,
    existingSavings: 200000,
    existingInvestments: 100000,
    financialGoal: 'Aggressive Alpha Wealth Building',
    investmentHorizon: '10+ years',
    investmentExperience: 'Beginner',
    riskTolerance: 'Aggressive',
    riskCategory: 'Aggressive',
    onboardingCompleted: true
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(marketApi, 'getQuotes').mockImplementation(async (symbols: string[]) => {
      const result: Record<string, any> = {};
      for (const s of symbols) {
        result[s] = {
          symbol: s,
          price: 250.0,
          change: 1.5,
          changePercent: 0.6,
          timestamp: '2026-09-26T15:30:00Z',
          freshness: 'LATEST_AVAILABLE',
          source: 'VERIFIED_TEST_CACHE'
        };
      }
      return result;
    });
  });

  // ---------------------------------------------------------------------------
  // 1. CRITICAL TEST: 100 REPEATED RUNS DETERMINISTIC IDENTICAL SELECTION
  // ---------------------------------------------------------------------------
  it('1. runs the same recommendation request 100 times and produces 100% identical canonicalId and score', async () => {
    const request: RecommendationRequest = {
      userProfile: baseProfile,
      preferredAssetClass: 'MUTUAL_FUND',
      monthlyInvestableAmount: 25000
    };

    const firstRun = await recommendationEngine.recommend(request);
    expect(firstRun.status).toBe('SUCCESS');
    expect(firstRun.recommendedInstrument).not.toBeNull();
    const targetCanonicalId = firstRun.recommendedInstrument!.canonicalId;
    const targetScore = firstRun.recommendedInstrument!.score;

    for (let i = 0; i < 100; i++) {
      const run = await recommendationEngine.recommend(request);
      expect(run.status).toBe('SUCCESS');
      expect(run.recommendedInstrument!.canonicalId).toBe(targetCanonicalId);
      expect(run.recommendedInstrument!.score).toBe(targetScore);
    }
  });

  // ---------------------------------------------------------------------------
  // 2. NO RANDOM SELECTION GUARANTEE
  // ---------------------------------------------------------------------------
  it('2. strictly forbids Math.random during recommendation calculation', async () => {
    const randomSpy = vi.spyOn(Math, 'random');

    const result = await recommendationEngine.recommend({
      userProfile: baseProfile,
      preferredAssetClass: 'ANY'
    });

    expect(result.status).toBe('SUCCESS');
    expect(randomSpy).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // 3. SUITABILITY FILTERING & INSUFFICIENT_PROFILE
  // ---------------------------------------------------------------------------
  it('3. returns INSUFFICIENT_PROFILE when mandatory suitability inputs are missing', async () => {
    // Missing financial goal
    const missingGoalProfile = { ...baseProfile, financialGoal: '' };
    const res1 = await recommendationEngine.recommend({ userProfile: missingGoalProfile });
    expect(res1.status).toBe('INSUFFICIENT_PROFILE');
    expect(res1.missingProfileFields).toContain('financialGoal');
    expect(res1.recommendedInstrument).toBeNull();

    // Missing investment horizon
    const missingHorizonProfile = { ...baseProfile, investmentHorizon: '' };
    const res2 = await recommendationEngine.recommend({ userProfile: missingHorizonProfile });
    expect(res2.status).toBe('INSUFFICIENT_PROFILE');
    expect(res2.missingProfileFields).toContain('investmentHorizon');

    // Missing risk tolerance
    const missingRiskProfile = { ...baseProfile, riskTolerance: '', riskCategory: undefined };
    const res3 = await recommendationEngine.recommend({ userProfile: missingRiskProfile as any });
    expect(res3.status).toBe('INSUFFICIENT_PROFILE');
    expect(res3.missingProfileFields).toContain('riskTolerance');

    // Null profile
    const res4 = await recommendationEngine.recommend({ userProfile: null });
    expect(res4.status).toBe('INSUFFICIENT_PROFILE');
  });

  // ---------------------------------------------------------------------------
  // 4. ASSET CLASS FILTERING
  // ---------------------------------------------------------------------------
  it('4. evaluates Mutual Funds only when MUTUAL_FUND is requested', async () => {
    const res = await recommendationEngine.recommend({
      userProfile: baseProfile,
      preferredAssetClass: 'MUTUAL_FUND'
    });
    expect(res.status).toBe('SUCCESS');
    expect(res.recommendedInstrument?.assetClass).toBe('MUTUAL_FUND');
    expect(res.whyAlternativesScoredLower.every(a => a.assetClass === 'MUTUAL_FUND')).toBe(true);
  });

  it('5. evaluates ETFs only when ETF is requested', async () => {
    const res = await recommendationEngine.recommend({
      userProfile: aggressiveYoungProfile,
      preferredAssetClass: 'ETF'
    });
    expect(res.status).toBe('SUCCESS');
    expect(res.recommendedInstrument?.assetClass).toBe('ETF');
    expect(res.whyAlternativesScoredLower.every(a => a.assetClass === 'ETF')).toBe(true);
  });

  it('6. evaluates Bonds only when BOND is requested', async () => {
    const res = await recommendationEngine.recommend({
      userProfile: conservativeSeniorProfile,
      preferredAssetClass: 'BOND'
    });
    expect(res.status).toBe('SUCCESS');
    expect(res.recommendedInstrument?.assetClass).toBe('BOND');
    expect(res.recommendedInstrument?.creditRating).toBeDefined();
    expect(res.recommendedInstrument?.ytm).toBeGreaterThan(0);
    expect(res.whyAlternativesScoredLower.every(a => a.assetClass === 'BOND')).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 5. HARD ELIGIBILITY FILTERS
  // ---------------------------------------------------------------------------
  it('7. eliminates bonds whose maturity exceeds the stated goal horizon', () => {
    const shortSuitability: SuitabilityProfile = {
      isSufficient: true,
      missingFields: [],
      effectiveRiskScore: 30,
      effectiveRiskCategory: 'Conservative',
      riskCapacityScore: 30,
      riskToleranceScore: 25,
      horizonYears: 1.5,
      monthlySurplus: 20000,
      emergencyFundMonths: 6,
      emergencyFundAdequate: true,
      liquidityRequirement: 'High',
      primaryGoal: 'Medical Fund',
      investmentExperience: 'Intermediate'
    };

    const longBond: CandidateInstrumentRecord = {
      canonicalId: 'BOND:LONG',
      symbol: 'LONG_BOND',
      name: 'Long Maturity PSU Bond 2035',
      assetClass: 'BOND',
      category: 'Corporate Bond',
      subCategory: 'PSU',
      market: 'NSE',
      currency: 'INR',
      riskTier: 'LOW',
      minimumHorizonYears: 7,
      benchmark: 'NSE 10Y Benchmark',
      maturityYears: 9.0,
      creditRating: 'CRISIL AAA',
      ytmPct: 7.8
    };

    const eligibility = checkCandidateEligibility(longBond, shortSuitability, 'BOND');
    expect(eligibility.eligible).toBe(false);
    expect(eligibility.reasons.some(r => r.includes('shorter than recommended minimum horizon') || r.includes('exceeds your stated goal horizon'))).toBe(true);
  });

  it('8. eliminates high-risk equity funds for conservative capital preservation profiles', () => {
    const conservativeSuit: SuitabilityProfile = {
      isSufficient: true,
      missingFields: [],
      effectiveRiskScore: 20,
      effectiveRiskCategory: 'Conservative',
      riskCapacityScore: 25,
      riskToleranceScore: 20,
      horizonYears: 2,
      monthlySurplus: 15000,
      emergencyFundMonths: 6,
      emergencyFundAdequate: true,
      liquidityRequirement: 'High',
      primaryGoal: 'Capital Preservation',
      investmentExperience: 'Intermediate'
    };

    const smallCapFund: CandidateInstrumentRecord = {
      canonicalId: 'MF:SMALLCAP',
      symbol: '125354',
      name: 'High Beta Small Cap Fund',
      assetClass: 'MUTUAL_FUND',
      category: 'Mid / Small Cap Fund',
      subCategory: 'Small Cap',
      market: 'AMFI',
      currency: 'INR',
      riskTier: 'VERY_HIGH',
      minimumHorizonYears: 7,
      benchmark: 'NIFTY Smallcap 250 TRI'
    };

    const eligibility = checkCandidateEligibility(smallCapFund, conservativeSuit, 'MUTUAL_FUND');
    expect(eligibility.eligible).toBe(false);
    expect(eligibility.reasons.some(r => r.includes('exceeds Conservative risk mandate') || r.includes('ineligible'))).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 6. SCORING WEIGHTS & FACTOR STRUCTURE (MF, ETF, BOND)
  // ---------------------------------------------------------------------------
  it('9. verifies Mutual Fund scoring weights sum to exactly 1.0 (100%)', () => {
    const sum = Object.values(MUTUAL_FUND_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(Math.round(sum * 100) / 100).toBe(1.0);
    expect(MUTUAL_FUND_WEIGHTS.categoryGoalFit).toBe(0.25);
    expect(MUTUAL_FUND_WEIGHTS.riskSuitability).toBe(0.20);
    expect(MUTUAL_FUND_WEIGHTS.consistency).toBe(0.15);
    expect(MUTUAL_FUND_WEIGHTS.benchmarkRelativeEvidence).toBe(0.10);
    expect(MUTUAL_FUND_WEIGHTS.expenseRatio).toBe(0.10);
    expect(MUTUAL_FUND_WEIGHTS.downsideDrawdown).toBe(0.10);
    expect(MUTUAL_FUND_WEIGHTS.riskAdjustedPerformance).toBe(0.05);
    expect(MUTUAL_FUND_WEIGHTS.portfolioDiversification).toBe(0.05);
  });

  it('10. verifies ETF scoring weights sum to exactly 1.0 (100%)', () => {
    const sum = Object.values(ETF_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(Math.round(sum * 100) / 100).toBe(1.0);
    expect(ETF_WEIGHTS.benchmarkGoalFit).toBe(0.20);
    expect(ETF_WEIGHTS.trackingDifferenceError).toBe(0.20);
    expect(ETF_WEIGHTS.expenseRatio).toBe(0.15);
    expect(ETF_WEIGHTS.liquidity).toBe(0.15);
    expect(ETF_WEIGHTS.aum).toBe(0.10);
    expect(ETF_WEIGHTS.volatilityDrawdown).toBe(0.10);
    expect(ETF_WEIGHTS.portfolioDiversification).toBe(0.10);
  });

  it('11. verifies Bond scoring weights sum to exactly 1.0 (100%)', () => {
    const sum = Object.values(BOND_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(Math.round(sum * 100) / 100).toBe(1.0);
    expect(BOND_WEIGHTS.goalMaturityFit).toBe(0.20);
    expect(BOND_WEIGHTS.creditQuality).toBe(0.20);
    expect(BOND_WEIGHTS.yieldYtm).toBe(0.20);
    expect(BOND_WEIGHTS.durationRateSensitivity).toBe(0.15);
    expect(BOND_WEIGHTS.liquidity).toBe(0.10);
    expect(BOND_WEIGHTS.issuerQuality).toBe(0.10);
    expect(BOND_WEIGHTS.portfolioDiversification).toBe(0.05);
  });

  // ---------------------------------------------------------------------------
  // 7. PORTFOLIO OVERLAP & DIVERSIFICATION
  // ---------------------------------------------------------------------------
  it('12. reduces diversification score and explains benchmark overlap when portfolio has identical index exposure', () => {
    const candidateETF: CandidateInstrumentRecord = {
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
      benchmark: 'NIFTY 50 Total Return Index'
    };

    // User already owns 40% UTI Nifty 50 Index Fund
    const existingPortfolio = [
      {
        symbol: '120716',
        name: 'UTI Nifty 50 Index Fund Direct',
        assetClass: 'MUTUAL_FUND' as const,
        allocationPct: 40,
        benchmark: 'NIFTY 50 Total Return Index'
      }
    ];

    const overlap = analyzePortfolioOverlap(candidateETF, existingPortfolio);
    expect(overlap.diversificationScore).toBeLessThanOrEqual(55);
    expect(overlap.evidence).toContain('benchmark');
    expect(overlap.benchmarkOverlapPct).toBeGreaterThanOrEqual(70);
  });

  // ---------------------------------------------------------------------------
  // 8. DATA FRESHNESS LABELS (EOD_NAV vs LIVE)
  // ---------------------------------------------------------------------------
  it('13. never labels Mutual Fund daily NAV as LIVE, strictly using END_OF_DAY / LATEST_AVAILABLE', async () => {
    const res = await recommendationEngine.recommend({
      userProfile: baseProfile,
      preferredAssetClass: 'MUTUAL_FUND'
    });

    expect(res.status).toBe('SUCCESS');
    expect(res.recommendedInstrument).not.toBeNull();
    expect(res.recommendedInstrument?.freshness).not.toBe('REALTIME');
    expect(['END_OF_DAY', 'LATEST_AVAILABLE']).toContain(res.recommendedInstrument?.freshness);
    expect(['LIVE', 'DELAYED', 'FALLBACK', 'DEMO']).toContain(res.recommendedInstrument?.quoteStatus);
  });

  // ---------------------------------------------------------------------------
  // 9. ALTERNATIVES CONSIDERED
  // ---------------------------------------------------------------------------
  it('14. returns 2-3 meaningful lower-ranked alternatives with specific factual reasons', async () => {
    const res = await recommendationEngine.recommend({
      userProfile: baseProfile,
      preferredAssetClass: 'MUTUAL_FUND'
    });

    expect(res.status).toBe('SUCCESS');
    expect(res.whyAlternativesScoredLower.length).toBeGreaterThanOrEqual(2);
    expect(res.whyAlternativesScoredLower.length).toBeLessThanOrEqual(3);

    for (const alt of res.whyAlternativesScoredLower) {
      expect(alt.score).toBeLessThanOrEqual(res.recommendedInstrument!.score);
      expect(alt.reason.length).toBeGreaterThan(5);
    }
  });

  // ---------------------------------------------------------------------------
  // 10. LLM OVERRIDE SAFETY SHIELD
  // ---------------------------------------------------------------------------
  it('15. rejects LLM explanation and falls back to deterministic text if LLM hallucinates different instrument or claims guaranteed returns', async () => {
    const rec = await recommendationEngine.recommend({
      userProfile: baseProfile,
      preferredAssetClass: 'MUTUAL_FUND'
    });

    expect(rec.status).toBe('SUCCESS');
    const selectedName = rec.recommendedInstrument!.name;

    // Case A: LLM claims guaranteed returns
    const badLlmWithGuarantee = `You should buy ${selectedName} because it gives guaranteed 25% risk-free returns!`;
    const safeOutputA = validateLlmExplanation(badLlmWithGuarantee, rec);
    expect(safeOutputA).not.toContain('guaranteed');
    expect(safeOutputA).toContain('Selected');

    // Case B: LLM names a completely different fund
    const hallucinatedFundLlm = `We recommend Crypto Doge Token because AI thinks this is the best fund.`;
    const safeOutputB = validateLlmExplanation(hallucinatedFundLlm, rec);
    expect(safeOutputB).not.toContain('Crypto Doge Token');
    expect(safeOutputB).toContain('Selected');
    expect(safeOutputB).toContain(selectedName);
  });

  // ---------------------------------------------------------------------------
  // 11. DETERMINISTIC TIE-BREAKING
  // ---------------------------------------------------------------------------
  it('16. uses canonicalId tie-breaker when final score and suitability fit are identical', () => {
    const candA: any = {
      candidate: { canonicalId: 'MF:A_FUND', name: 'Fund A', symbol: 'A' },
      finalScore: 85.0,
      suitabilityFitScore: 85.0,
      evidenceCoveragePct: 100,
      freshnessScore: 4
    };
    const candB: any = {
      candidate: { canonicalId: 'MF:B_FUND', name: 'Fund B', symbol: 'B' },
      finalScore: 85.0,
      suitabilityFitScore: 85.0,
      evidenceCoveragePct: 100,
      freshnessScore: 4
    };

    // Passing [candB, candA] must sort with 'MF:A_FUND' first alphabetically
    const sorted = rankCandidatesDeterministically([candB, candA]);
    expect(sorted[0].candidate.canonicalId).toBe('MF:A_FUND');
    expect(sorted[1].candidate.canonicalId).toBe('MF:B_FUND');
  });

  // ---------------------------------------------------------------------------
  // 12. FACTOR UNAVAILABILITY & RE-NORMALIZATION
  // ---------------------------------------------------------------------------
  it('17. re-normalizes available weights without converting missing factors to zero', () => {
    const suitability: SuitabilityProfile = {
      isSufficient: true,
      missingFields: [],
      effectiveRiskScore: 50,
      effectiveRiskCategory: 'Moderate',
      riskCapacityScore: 50,
      riskToleranceScore: 50,
      horizonYears: 5,
      monthlySurplus: 20000,
      emergencyFundMonths: 6,
      emergencyFundAdequate: true,
      liquidityRequirement: 'Moderate',
      primaryGoal: 'Retirement Wealth',
      investmentExperience: 'Intermediate'
    };

    const fundWithMissingConsistency: CandidateInstrumentRecord = {
      canonicalId: 'MF:TEST',
      symbol: 'TEST',
      name: 'New Fund Without 5Y Consistency',
      assetClass: 'MUTUAL_FUND',
      category: 'Index Fund',
      subCategory: 'Nifty 50 Index',
      market: 'AMFI',
      currency: 'INR',
      riskTier: 'MODERATE',
      minimumHorizonYears: 3,
      benchmark: 'NIFTY 50 TRI',
      expenseRatioPct: 0.20,
      expenseRatioStr: '0.20%',
      // managerConsistencyScore is undefined!
      managerConsistencyScore: undefined,
      maxDrawdownPct: 14.0,
      sharpeRatio: 1.5
    };

    const out = scoreMutualFund(fundWithMissingConsistency, suitability);
    expect(out.unavailableFactors).toContain('Consistency');
    // Available factors must have effectiveWeight higher than nominal weight
    const goalFactor = out.factors.find(f => f.factor === 'Category / Goal Fit');
    expect(goalFactor?.effectiveWeight).toBeGreaterThan(goalFactor?.weight || 0);
    expect(out.finalScore).toBeGreaterThan(0);
  });
});
