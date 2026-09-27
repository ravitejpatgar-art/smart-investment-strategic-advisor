import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  recommendationEngine,
  hydrateCandidateQuotes,
  isDemoOrMockQuote,
  scoreMutualFund,
  rankCandidatesDeterministically,
  validateLlmExplanation,
  checkCandidateEligibility,
  getCandidateUniverseForAssetClass,
  type CandidateInstrumentRecord,
  type SuitabilityProfile,
  type ScoredCandidate
} from '../services/recommendation';
import { marketApi, type MarketQuote } from '../services/marketApi';
import type { UserProfile } from '../types';

describe('Real-Data Recommendation Engine Integration Tests', () => {
  const verifiedUserProfile: UserProfile = {
    id: 'user_real_001',
    name: 'Vikram Joshi',
    email: 'vikram@example.com',
    age: 35,
    salaryIncome: 180000,
    monthlyIncome: 180000,
    monthlyExpenses: 70000,
    emergencyFund: 450000,
    existingSavings: 500000,
    existingInvestments: 800000,
    financialGoal: 'Long-Term Wealth Creation',
    investmentHorizon: '5 to 10 years',
    investmentExperience: 'Intermediate',
    riskTolerance: 'Moderate',
    riskCategory: 'Moderate',
    onboardingCompleted: true
  };

  const conservativeProfile: UserProfile = {
    id: 'user_conservative_002',
    name: 'Meera Sen',
    email: 'meera@example.com',
    age: 58,
    salaryIncome: 95000,
    monthlyIncome: 95000,
    monthlyExpenses: 40000,
    emergencyFund: 600000,
    existingSavings: 600000,
    existingInvestments: 2500000,
    financialGoal: 'Capital Preservation & Medical Emergency',
    investmentHorizon: 'Less than 3 years',
    investmentExperience: 'Advanced',
    riskTolerance: 'Conservative',
    riskCategory: 'Conservative',
    onboardingCompleted: true
  };

  function createMockSuitability(overrides: Partial<SuitabilityProfile> = {}): SuitabilityProfile {
    return {
      isSufficient: true,
      missingFields: [],
      effectiveRiskScore: 60,
      effectiveRiskCategory: 'Moderate',
      riskCapacityScore: 70,
      riskToleranceScore: 65,
      horizonYears: 5,
      monthlySurplus: 50000,
      emergencyFundMonths: 6,
      emergencyFundAdequate: true,
      liquidityRequirement: 'Moderate',
      primaryGoal: 'Long-Term Wealth Creation',
      investmentExperience: 'Intermediate',
      ...overrides
    };
  }

  function createMockQuote(partial: Partial<MarketQuote>): MarketQuote {
    return {
      symbol: partial.symbol || 'TEST',
      name: partial.name || 'Test Asset',
      price: partial.price ?? 100,
      change: partial.change ?? 0,
      changePct: partial.changePct ?? 0,
      exchange: partial.exchange || 'NSE',
      currency: partial.currency || 'INR',
      assetType: partial.assetType || 'EQUITY',
      volume: partial.volume ?? 10000,
      timestamp: partial.timestamp || new Date().toISOString(),
      asOf: partial.asOf || '2025-05-15',
      marketStatus: partial.marketStatus || 'CLOSED',
      freshness: partial.freshness || 'END_OF_DAY',
      source: partial.source || 'Test Feed',
      quoteStatus: partial.quoteStatus || 'EOD_NAV',
      ...partial
    };
  }

  function createScoredCandidate(partial: Partial<ScoredCandidate> & { candidate: CandidateInstrumentRecord; finalScore: number }): ScoredCandidate {
    return {
      assetClass: partial.candidate.assetClass,
      suitabilityFitScore: 80,
      evidenceCoveragePct: 100,
      freshnessScore: 100,
      factors: [],
      unavailableFactors: [],
      negativeFactors: [],
      risks: [],
      quoteStatus: 'EOD_NAV',
      dataSource: 'AMFI Registry',
      dataTimestamp: new Date().toISOString(),
      asOfDate: '2025-05-15',
      ...partial
    };
  }

  const mockQuotesMap: Record<string, MarketQuote> = {
    '120716': createMockQuote({
      symbol: '120716',
      name: 'UTI Nifty 50 Index Fund Direct-Growth',
      price: 184.25,
      change: 1.15,
      changePct: 0.63,
      currency: 'INR',
      assetType: 'MUTUAL_FUND',
      timestamp: '2025-05-15T18:30:00Z',
      asOfDate: '2025-05-15',
      freshness: 'END_OF_DAY',
      source: 'AMFI Daily NAV Registry',
      quoteStatus: 'EOD_NAV'
    }),
    '120717': createMockQuote({
      symbol: '120717',
      name: 'UTI Nifty Next 50 Index Fund Direct-Growth',
      price: 72.40,
      change: 0.85,
      changePct: 1.18,
      currency: 'INR',
      assetType: 'MUTUAL_FUND',
      timestamp: '2025-05-15T18:30:00Z',
      asOfDate: '2025-05-15',
      freshness: 'END_OF_DAY',
      source: 'AMFI Daily NAV Registry',
      quoteStatus: 'EOD_NAV'
    }),
    '122639': createMockQuote({
      symbol: '122639',
      name: 'Parag Parikh Flexi Cap Fund Direct-Growth',
      price: 88.90,
      change: 0.42,
      changePct: 0.48,
      currency: 'INR',
      assetType: 'MUTUAL_FUND',
      timestamp: '2025-05-15T18:30:00Z',
      asOfDate: '2025-05-15',
      freshness: 'END_OF_DAY',
      source: 'AMFI Daily NAV Registry',
      quoteStatus: 'EOD_NAV'
    }),
    'NIFTYBEES': createMockQuote({
      symbol: 'NIFTYBEES',
      name: 'Nippon India Nifty 50 BeES ETF',
      price: 268.40,
      change: 1.60,
      changePct: 0.60,
      currency: 'INR',
      assetType: 'ETF',
      timestamp: '2025-05-16T09:45:00Z',
      freshness: 'DELAYED',
      source: 'NSE Real-Time Market Feed',
      quoteStatus: 'DELAYED'
    }),
    'JUNIORBEES': createMockQuote({
      symbol: 'JUNIORBEES',
      name: 'Nippon India Nifty Next 50 Junior BeES ETF',
      price: 742.10,
      change: 7.20,
      changePct: 0.98,
      currency: 'INR',
      assetType: 'ETF',
      timestamp: '2025-05-16T09:45:00Z',
      freshness: 'DELAYED',
      source: 'NSE Real-Time Market Feed',
      quoteStatus: 'DELAYED'
    })
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(marketApi, 'getQuotes').mockImplementation(async (symbols: string[]) => {
      const result: Record<string, MarketQuote> = {};
      for (const sym of symbols) {
        if (mockQuotesMap[sym]) {
          result[sym] = { ...mockQuotesMap[sym] };
        }
      }
      return result;
    });
  });

  // 1. Real API adapter is invoked
  it('1. invokes market API adapter during candidate hydration', async () => {
    const getQuotesSpy = vi.spyOn(marketApi, 'getQuotes');
    const response = await recommendationEngine.recommend({
      userProfile: verifiedUserProfile,
      preferredAssetClass: 'MUTUAL_FUND'
    });

    expect(getQuotesSpy).toHaveBeenCalled();
    expect(response.status).toBe('SUCCESS');
    expect(response.recommendedInstrument).not.toBeNull();
  });

  // 2. Candidate hydration works and populates metadata
  it('2. candidate hydration works and populates verified hydration result', async () => {
    const rawUniverse = getCandidateUniverseForAssetClass('MUTUAL_FUND');
    const hydrated = await hydrateCandidateQuotes(rawUniverse);

    expect(hydrated.length).toBeGreaterThan(0);
    const first = hydrated[0];
    expect(first.hydration).toBeDefined();
    expect(first.hydration?.canonicalId).toBe(first.canonicalId);
    expect(first.hydration?.symbol).toBe(first.symbol);
    expect(first.hydration?.assetClass).toBe('MUTUAL_FUND');
    expect(first.hydration?.dataSource).toContain('AMFI');
    expect(first.hydration?.availableFields).toContain('price');
    expect(first.hydration?.availableFields).toContain('nav');
    expect(first.hydration?.isHydrated).toBe(true);
  });

  // 3. Missing fields remain unavailable and do not use fake values
  it('3. missing fields remain unavailable (N/A) with zero contribution and denominator re-normalization', () => {
    const testCandidate: CandidateInstrumentRecord = {
      canonicalId: 'MF:TEST_MISSING',
      symbol: 'TEST_MISSING',
      name: 'Partial Data Test Fund',
      assetClass: 'MUTUAL_FUND',
      category: 'Index Fund',
      subCategory: 'Nifty 50 Index',
      market: 'AMFI',
      currency: 'INR',
      riskTier: 'MODERATE',
      minimumHorizonYears: 3,
      benchmark: 'NIFTY 50 TRI',
      // Explicitly missing: expenseRatioPct, sharpeRatio, maxDrawdownPct
      expenseRatioPct: undefined,
      sharpeRatio: undefined,
      maxDrawdownPct: undefined,
      historicalReturns: { oneYear: 18.0 }
    };

    const suitability = createMockSuitability();
    const result = scoreMutualFund(testCandidate, suitability);

    const expenseFactor = result.factors.find(f => f.factor === 'Expense Ratio');
    expect(expenseFactor).toBeDefined();
    expect(expenseFactor?.isAvailable).toBe(false);
    expect(expenseFactor?.value).toBe('N/A');
    expect(expenseFactor?.contribution).toBe(0);
    expect(expenseFactor?.evidence).toContain('excluded from scoring');

    const sharpeFactor = result.factors.find(f => f.factor === 'Risk-adjusted Performance');
    expect(sharpeFactor).toBeDefined();
    expect(sharpeFactor?.isAvailable).toBe(false);
    expect(sharpeFactor?.contribution).toBe(0);

    // Sum of contributions equals final score
    const sumContributions = result.factors.reduce((acc, f) => acc + f.contribution, 0);
    expect(Math.abs(result.finalScore - Math.round(sumContributions))).toBeLessThanOrEqual(1);
  });

  // 4. MF NAV freshness is not REALTIME
  it('4. ensures MF NAV freshness is never labeled REALTIME (forced to END_OF_DAY or LATEST_AVAILABLE)', async () => {
    vi.spyOn(marketApi, 'getQuotes').mockResolvedValueOnce({
      '120716': createMockQuote({
        symbol: '120716',
        name: 'UTI Nifty 50 Index Fund Direct-Growth',
        price: 184.25,
        currency: 'INR',
        assetType: 'MUTUAL_FUND',
        timestamp: '2025-05-15T18:30:00Z',
        freshness: 'REALTIME', // Upstream incorrectly labeled it REALTIME
        source: 'AMFI NAV Feed',
        quoteStatus: 'LIVE'
      })
    });

    const universe = [getCandidateUniverseForAssetClass('MUTUAL_FUND')[0]];
    const hydrated = await hydrateCandidateQuotes(universe);

    expect(hydrated[0].hydration?.freshness).not.toBe('REALTIME');
    expect(['END_OF_DAY', 'LATEST_AVAILABLE']).toContain(hydrated[0].hydration?.freshness);
  });

  // 5. Delayed ETF data remains DELAYED
  it('5. delayed ETF data remains truthfully DELAYED', async () => {
    vi.spyOn(marketApi, 'getQuotes').mockResolvedValueOnce({
      'NIFTYBEES': createMockQuote({
        symbol: 'NIFTYBEES',
        name: 'Nippon India Nifty 50 BeES ETF',
        price: 268.40,
        currency: 'INR',
        assetType: 'ETF',
        timestamp: '2025-05-16T09:45:00Z',
        freshness: 'DELAYED',
        source: 'NSE 15-Minute Delayed Feed',
        quoteStatus: 'DELAYED'
      })
    });

    const etfUniverse = [getCandidateUniverseForAssetClass('ETF').find(e => e.symbol === 'NIFTYBEES')!];
    const hydrated = await hydrateCandidateQuotes(etfUniverse);

    expect(hydrated[0].hydration?.freshness).toBe('DELAYED');
  });

  // 6. Suitability filtering occurs before scoring
  it('6. suitability filtering occurs before scoring: high-risk long-horizon instruments are rejected for conservative short-horizon users', async () => {
    const response = await recommendationEngine.recommend({
      userProfile: conservativeProfile,
      preferredAssetClass: 'MUTUAL_FUND'
    });

    // High risk equity fund UTI Nifty Next 50 (5yr min horizon, HIGH risk) must NOT be recommended
    if (response.recommendedInstrument) {
      expect(response.recommendedInstrument.canonicalId).not.toBe('MF:120717');
    }
    // High-risk candidate is eliminated before scoring
    const candidate120717 = getCandidateUniverseForAssetClass('MUTUAL_FUND').find(c => c.canonicalId === 'MF:120717')!;
    const conservativeSuitability = createMockSuitability({
      effectiveRiskCategory: 'Conservative',
      effectiveRiskScore: 35,
      riskCapacityScore: 40,
      riskToleranceScore: 30,
      horizonYears: 2,
      primaryGoal: 'Capital Preservation'
    });
    const eligibility = checkCandidateEligibility(candidate120717, conservativeSuitability, 'MUTUAL_FUND');
    expect(eligibility.eligible).toBe(false);
    expect(eligibility.reasons.length).toBeGreaterThan(0);
  });

  // 7. Actual portfolio overlap affects scoring
  it('7. actual portfolio overlap penalizes candidate when user already holds overlapping benchmark/fund', () => {
    const suitability = createMockSuitability({ horizonYears: 7 });
    const cand = getCandidateUniverseForAssetClass('MUTUAL_FUND').find(c => c.canonicalId === 'MF:120716')!;

    // Case A: No portfolio overlap
    const scoreWithoutPortfolio = scoreMutualFund(cand, suitability, []);

    // Case B: User already holds UTI Nifty 50 with heavy allocation
    const scoreWithDuplicateOverlap = scoreMutualFund(cand, suitability, [
      { symbol: '120716', name: 'UTI Nifty 50 Index Fund', assetClass: 'MUTUAL_FUND', allocationPct: 35 }
    ]);

    expect(scoreWithDuplicateOverlap.finalScore).toBeLessThan(scoreWithoutPortfolio.finalScore);
    const fitFactor = scoreWithDuplicateOverlap.factors.find(f => f.factor === 'Portfolio Diversification');
    expect(fitFactor?.evidence).toContain('substantial direct holding');
  });

  // 8. Recommendation changes when verified input data changes
  it('8. recommendation changes when verified input data changes (expense ratio / returns)', () => {
    const suitability = createMockSuitability();

    const baseCand: CandidateInstrumentRecord = {
      ...getCandidateUniverseForAssetClass('MUTUAL_FUND')[0],
      expenseRatioPct: 0.15,
      historicalReturns: { oneYear: 20.0, threeYear: 18.0 }
    };

    const highCostCand: CandidateInstrumentRecord = {
      ...baseCand,
      expenseRatioPct: 1.85, // severely unfavorable expense ratio
      historicalReturns: { oneYear: 10.0, threeYear: 8.0 }
    };

    const baseScore = scoreMutualFund(baseCand, suitability);
    const highCostScore = scoreMutualFund(highCostCand, suitability);

    expect(baseScore.finalScore).toBeGreaterThan(highCostScore.finalScore);
  });

  // 9. Recommendation does NOT change merely because array order changes
  it('9. recommendation does NOT change merely because candidate array order changes', () => {
    const universe = getCandidateUniverseForAssetClass('MUTUAL_FUND');
    const suitability = createMockSuitability();

    const scoredNormal: ScoredCandidate[] = universe.map(c => {
      const s = scoreMutualFund(c, suitability);
      return createScoredCandidate({
        candidate: c,
        finalScore: s.finalScore,
        suitabilityFitScore: s.suitabilityFitScore,
        evidenceCoveragePct: s.evidenceCoveragePct,
        freshnessScore: 100,
        factors: s.factors,
        risks: s.risks,
        negativeFactors: s.negativeFactors
      });
    });

    const scoredReversed = [...scoredNormal].reverse();

    const rankedNormal = rankCandidatesDeterministically(scoredNormal);
    const rankedReversed = rankCandidatesDeterministically(scoredReversed);

    expect(rankedNormal[0].candidate.canonicalId).toBe(rankedReversed[0].candidate.canonicalId);
    expect(rankedNormal.map(r => r.candidate.canonicalId)).toEqual(rankedReversed.map(r => r.candidate.canonicalId));
  });

  // 10. Deterministic tie-breaking works
  it('10. deterministic tie-breaking works cleanly when composite scores are identical', () => {
    const candA: CandidateInstrumentRecord = {
      ...getCandidateUniverseForAssetClass('MUTUAL_FUND')[0],
      canonicalId: 'MF:ALPHA_1',
      name: 'Alpha Fund',
      expenseRatioPct: 0.30
    };
    const candB: CandidateInstrumentRecord = {
      ...getCandidateUniverseForAssetClass('MUTUAL_FUND')[0],
      canonicalId: 'MF:BETA_2',
      name: 'Beta Fund',
      expenseRatioPct: 0.20
    };

    // Subtest A: All scores tied, tie-breaker uses canonical ID alphabetically
    const tiedScored: ScoredCandidate[] = [
      createScoredCandidate({
        candidate: candB,
        finalScore: 85,
        suitabilityFitScore: 80,
        evidenceCoveragePct: 100,
        freshnessScore: 100
      }),
      createScoredCandidate({
        candidate: candA,
        finalScore: 85,
        suitabilityFitScore: 80,
        evidenceCoveragePct: 100,
        freshnessScore: 100
      })
    ];

    const ranked = rankCandidatesDeterministically(tiedScored);
    // 'MF:ALPHA_1' alphabetically precedes 'MF:BETA_2'
    expect(ranked[0].candidate.canonicalId).toBe('MF:ALPHA_1');
    expect(ranked[1].candidate.canonicalId).toBe('MF:BETA_2');

    // Subtest B: When one candidate has higher suitabilityFitScore, it wins over canonical ID
    const suitabilityTieBreaker: ScoredCandidate[] = [
      createScoredCandidate({
        candidate: candB,
        finalScore: 85,
        suitabilityFitScore: 92, // higher fit
        evidenceCoveragePct: 100,
        freshnessScore: 100
      }),
      createScoredCandidate({
        candidate: candA,
        finalScore: 85,
        suitabilityFitScore: 80,
        evidenceCoveragePct: 100,
        freshnessScore: 100
      })
    ];

    const rankedByFit = rankCandidatesDeterministically(suitabilityTieBreaker);
    expect(rankedByFit[0].candidate.canonicalId).toBe('MF:BETA_2');
  });

  // 11. Alternatives contain actual scored candidates
  it('11. alternatives considered contain actual scored candidates with deterministic reasons', async () => {
    const response = await recommendationEngine.recommend({
      userProfile: verifiedUserProfile,
      preferredAssetClass: 'MUTUAL_FUND'
    });

    expect(response.status).toBe('SUCCESS');
    expect(response.whyAlternativesScoredLower.length).toBeGreaterThan(0);
    const firstAlt = response.whyAlternativesScoredLower[0];
    expect(firstAlt.instrument).toBeDefined();
    expect(firstAlt.score).toBeLessThanOrEqual(response.recommendedInstrument!.score);
    expect(firstAlt.reason).toBeDefined();
    expect(firstAlt.reason.length).toBeGreaterThan(5);
  });

  // 12. Evidence references available fields
  it('12. evidence references available fields and marks unavailable fields explicitly as N/A', () => {
    const candWithoutDd: CandidateInstrumentRecord = {
      ...getCandidateUniverseForAssetClass('MUTUAL_FUND')[0],
      maxDrawdownPct: undefined
    };
    const suitability = createMockSuitability();

    const scored = scoreMutualFund(candWithoutDd, suitability);
    const ddFactor = scored.factors.find(f => f.factor === 'Downside / Drawdown');
    expect(ddFactor?.isAvailable).toBe(false);
    expect(ddFactor?.evidence).toContain('N/A — this factor was excluded from scoring');
  });

  // 13. Fabricated numeric fields / demo quotes are rejected
  it('13. rejects fabricated numeric fields and demo quotes via isDemoOrMockQuote', () => {
    const mockDemoQuote = createMockQuote({
      symbol: 'DEMO1',
      name: 'Demo Synthetic Fund',
      price: 100.0,
      currency: 'INR',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      status: 'DEMO'
    });

    expect(isDemoOrMockQuote(mockDemoQuote)).toBe(true);

    const verifiedQuote = createMockQuote({
      symbol: '120716',
      name: 'UTI Nifty 50 Index Fund',
      price: 184.25,
      currency: 'INR',
      freshness: 'END_OF_DAY',
      source: 'AMFI Official Directory'
    });

    expect(isDemoOrMockQuote(verifiedQuote)).toBe(false);
  });

  // 14. LLM cannot override deterministic recommendation
  it('14. LLM cannot override deterministic recommendation (validateLlmExplanation safeguards)', async () => {
    const recommendation = await recommendationEngine.recommend({
      userProfile: verifiedUserProfile,
      preferredAssetClass: 'MUTUAL_FUND'
    });

    const hallucinatedLlmText = 'I recommend buying XYZ Crypto Penny Stock because it will deliver guaranteed 500% returns!';
    const sanitized = validateLlmExplanation(hallucinatedLlmText, recommendation);

    // Hallucination must be discarded and replaced with deterministic fallback text
    expect(sanitized).not.toContain('XYZ Crypto Penny Stock');
    expect(sanitized).toContain(recommendation.recommendedInstrument!.name);
    expect(sanitized).toContain('Selected');
  });

  // 15. Returns INSUFFICIENT_DATA when market data is completely unavailable
  it('15. returns INSUFFICIENT_DATA rather than picking an arbitrary candidate when feeds are unreachable', async () => {
    vi.spyOn(marketApi, 'getQuotes').mockResolvedValue({}); // zero quotes returned

    const response = await recommendationEngine.recommend({
      userProfile: {
        ...verifiedUserProfile,
      },
      preferredAssetClass: 'ETF'
    });

    expect(response.status).toBe('INSUFFICIENT_DATA');
    expect(response.recommendedInstrument).toBeNull();
    expect(response.message).toContain("don't have enough verified market data");
  });
});
