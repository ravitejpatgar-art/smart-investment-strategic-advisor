import type {
  RecommendationRequest,
  RecommendationResponse,
  ScoredCandidate,
  CandidateInstrumentRecord,
  RecommendationDebugAudit
} from './types';
import type { MarketDataStatus } from '../marketApi';
import { evaluateUserSuitability } from './suitability';
import { getCandidateUniverseForAssetClass, hydrateCandidateQuotes } from './universe';
import { checkCandidateEligibility } from './eligibility';
import { scoreMutualFund } from './scorers/mfScorer';
import { scoreETF } from './scorers/etfScorer';
import { scoreBond } from './scorers/bondScorer';
import { rankCandidatesDeterministically, getFreshnessWeight } from './rankingEngine';
import { generateRecommendationEvidence, validateLlmExplanation } from './evidenceGenerator';

export class DeterministicRecommendationEngine {
  /**
   * Main recommendation entry point.
   * Fully deterministic execution flow:
   * Suitability -> Candidate Universe -> Eligibility Filter -> Data Hydration -> Asset Scoring -> Deterministic Ranking -> Evidence Generation.
   */
  async recommend(request: RecommendationRequest): Promise<RecommendationResponse> {
    // 1. User Suitability Stage
    const suitability = evaluateUserSuitability(request);
    if (!suitability.isSufficient) {
      return {
        status: 'INSUFFICIENT_PROFILE',
        message: 'Mandatory investor suitability profile inputs are missing. Please complete your risk tolerance, financial goal, and investment horizon.',
        missingProfileFields: suitability.missingFields,
        recommendedInstrument: null,
        whyChosen: [],
        negativeFactors: [],
        whyAlternativesScoredLower: [],
        risks: [],
        dataQuality: {
          coveragePct: 0,
          freshness: 'UNAVAILABLE',
          timestamp: new Date().toISOString(),
          sources: []
        },
        methodology: {
          version: '1.0-deterministic',
          assetClass: 'MUTUAL_FUND',
          weights: {}
        },
        disclaimer: 'Decision-support information, not personalized financial advice.',
        evaluatedCandidatesCount: 0,
        eligibleCandidatesCount: 0,
        audit: {
          candidateCount: 0,
          eligibleCount: 0,
          scoredCount: 0,
          excludedCount: 0,
          selectedCanonicalId: null,
          selectedScore: null,
          dataCoveragePct: 0,
          freshness: 'UNAVAILABLE',
          source: 'N/A'
        }
      };
    }

    // 2. Asset Class & Candidate Universe Determination
    let preferredAssetClass = request.preferredAssetClass;
    if (!preferredAssetClass || preferredAssetClass === 'ANY') {
      preferredAssetClass = 'ANY';
    }

    const candidatePool = getCandidateUniverseForAssetClass(preferredAssetClass);
    if (candidatePool.length === 0) {
      return {
        status: 'INSUFFICIENT_DATA',
        message: 'I do not have enough verified data to make a reliable recommendation.',
        recommendedInstrument: null,
        whyChosen: [],
        negativeFactors: [],
        whyAlternativesScoredLower: [],
        risks: [],
        dataQuality: {
          coveragePct: 0,
          freshness: 'UNAVAILABLE',
          timestamp: new Date().toISOString(),
          sources: []
        },
        methodology: {
          version: '1.0-deterministic',
          assetClass: 'MUTUAL_FUND',
          weights: {}
        },
        disclaimer: 'Decision-support information, not personalized financial advice.',
        evaluatedCandidatesCount: 0,
        eligibleCandidatesCount: 0,
        audit: {
          candidateCount: 0,
          eligibleCount: 0,
          scoredCount: 0,
          excludedCount: 0,
          selectedCanonicalId: null,
          selectedScore: null,
          dataCoveragePct: 0,
          freshness: 'UNAVAILABLE',
          source: 'Candidate Universe Empty'
        }
      };
    }

    // 3. Hard Eligibility Filtering
    const eligibleCandidates: CandidateInstrumentRecord[] = [];
    const ineligibleCandidates: { candidate: CandidateInstrumentRecord; reasons: string[] }[] = [];
    for (const cand of candidatePool) {
      const eligibility = checkCandidateEligibility(cand, suitability, preferredAssetClass);
      if (eligibility.eligible) {
        eligibleCandidates.push(cand);
      } else {
        ineligibleCandidates.push({ candidate: cand, reasons: eligibility.reasons });
      }
    }

    if (eligibleCandidates.length === 0) {
      return {
        status: 'INSUFFICIENT_DATA',
        message: 'No instruments matched your strict suitability and horizon constraints.',
        recommendedInstrument: null,
        whyChosen: [],
        negativeFactors: [],
        whyAlternativesScoredLower: ineligibleCandidates.slice(0, 3).map(inel => ({
          canonicalId: inel.candidate.canonicalId,
          instrument: inel.candidate.name,
          assetClass: inel.candidate.assetClass,
          score: 0,
          reason: `Excluded before ranking because: ${inel.reasons.join(' · ')}`
        })),
        risks: [],
        dataQuality: {
          coveragePct: 0,
          freshness: 'UNAVAILABLE',
          timestamp: new Date().toISOString(),
          sources: []
        },
        methodology: {
          version: '1.0-deterministic',
          assetClass: 'MUTUAL_FUND',
          weights: {}
        },
        disclaimer: 'Decision-support information, not personalized financial advice.',
        evaluatedCandidatesCount: candidatePool.length,
        eligibleCandidatesCount: 0,
        audit: {
          candidateCount: candidatePool.length,
          eligibleCount: 0,
          scoredCount: 0,
          excludedCount: candidatePool.length,
          selectedCanonicalId: null,
          selectedScore: null,
          dataCoveragePct: 0,
          freshness: 'UNAVAILABLE',
          source: 'Eligibility Filter'
        }
      };
    }

    // 4. Data Hydration (Quotes & Provenance from Market API)
    const hydratedCandidates = await hydrateCandidateQuotes(eligibleCandidates);

    // Filter strictly for verified hydrated candidates
    const verifiedCandidates = hydratedCandidates.filter(c => c.hydration?.isHydrated);
    if (verifiedCandidates.length === 0) {
      return {
        status: 'INSUFFICIENT_DATA',
        message: "I don't have enough verified market data to make a reliable recommendation. Real-time/EOD market data feeds for eligible instruments are currently unreachable.",
        recommendedInstrument: null,
        whyChosen: [],
        negativeFactors: [],
        whyAlternativesScoredLower: [],
        risks: [],
        dataQuality: {
          coveragePct: 0,
          freshness: 'UNAVAILABLE',
          timestamp: new Date().toISOString(),
          sources: []
        },
        methodology: {
          version: '1.0-deterministic',
          assetClass: preferredAssetClass === 'ANY' ? 'MUTUAL_FUND' : preferredAssetClass,
          weights: {}
        },
        disclaimer: 'Decision-support information, not personalized financial advice.',
        evaluatedCandidatesCount: candidatePool.length,
        eligibleCandidatesCount: eligibleCandidates.length,
        audit: {
          candidateCount: candidatePool.length,
          eligibleCount: eligibleCandidates.length,
          scoredCount: 0,
          excludedCount: candidatePool.length,
          selectedCanonicalId: null,
          selectedScore: null,
          dataCoveragePct: 0,
          freshness: 'UNAVAILABLE',
          source: 'Market Feed Unavailable'
        }
      };
    }

    // 5. Asset-Specific Scoring
    const scoredCandidates: ScoredCandidate[] = verifiedCandidates.map(cand => {
      let scorerOut;
      if (cand.assetClass === 'MUTUAL_FUND') {
        scorerOut = scoreMutualFund(cand, suitability, request.existingPortfolio);
      } else if (cand.assetClass === 'ETF') {
        scorerOut = scoreETF(cand, suitability, request.existingPortfolio);
      } else {
        scorerOut = scoreBond(cand, suitability, request.existingPortfolio);
      }

      const quote = cand.quote;
      const freshness = quote?.freshness || (cand.assetClass === 'MUTUAL_FUND' ? 'END_OF_DAY' : 'LATEST_AVAILABLE');
      const freshnessScore = getFreshnessWeight(freshness);
      const quoteStatus: MarketDataStatus = quote?.status || (cand.assetClass === 'MUTUAL_FUND' ? 'FALLBACK' : (cand.assetClass === 'BOND' ? 'FALLBACK' : 'DELAYED'));

      return {
        candidate: cand,
        assetClass: cand.assetClass,
        finalScore: scorerOut.finalScore,
        suitabilityFitScore: scorerOut.suitabilityFitScore,
        evidenceCoveragePct: scorerOut.evidenceCoveragePct,
        freshnessScore,
        factors: scorerOut.factors,
        unavailableFactors: scorerOut.unavailableFactors,
        negativeFactors: scorerOut.negativeFactors,
        risks: scorerOut.risks,
        quoteStatus,
        dataSource: quote?.source || (cand.assetClass === 'MUTUAL_FUND' ? 'AMFI Published Daily NAV' : (cand.assetClass === 'BOND' ? 'NSE Corporate Bond Reporting Platform (CBRICS)' : 'NSE Market Feed')),
        dataTimestamp: quote?.timestamp || new Date().toISOString(),
        asOfDate: quote?.navDate || quote?.asOf || 'Published'
      };
    });

    // 6. Deterministic Multi-Tier Ranking
    const ranked = rankCandidatesDeterministically(scoredCandidates);
    const topCandidate = ranked[0];
    const alternatives = ranked.slice(1);

    // 7. Evidence Generation
    const evidence = generateRecommendationEvidence(
      topCandidate,
      alternatives,
      candidatePool.length,
      ranked.length,
      ineligibleCandidates
    );

    const price = topCandidate.candidate.quote?.price ?? (
      topCandidate.candidate.assetClass === 'BOND' ? (topCandidate.candidate.faceValue ?? 1000) : null
    );

    const recommendedInstrument = {
      canonicalId: topCandidate.candidate.canonicalId,
      symbol: topCandidate.candidate.symbol,
      name: topCandidate.candidate.name,
      assetClass: topCandidate.assetClass,
      score: topCandidate.finalScore,
      currentPrice: price,
      currency: topCandidate.candidate.currency,
      freshness: topCandidate.candidate.quote?.freshness || (topCandidate.assetClass === 'MUTUAL_FUND' ? 'END_OF_DAY' : 'LATEST_AVAILABLE'),
      quoteStatus: topCandidate.quoteStatus,
      asOfDate: topCandidate.asOfDate,
      dataTimestamp: topCandidate.dataTimestamp,
      dataSource: topCandidate.dataSource,
      category: topCandidate.candidate.category,
      benchmark: topCandidate.candidate.benchmark,
      expenseRatio: topCandidate.candidate.expenseRatioStr,
      creditRating: topCandidate.candidate.creditRating,
      maturity: topCandidate.candidate.maturityDate,
      coupon: topCandidate.candidate.couponPct,
      ytm: topCandidate.candidate.ytmPct,
      duration: topCandidate.candidate.durationYears
    };

    const audit: RecommendationDebugAudit = {
      candidateCount: candidatePool.length,
      eligibleCount: eligibleCandidates.length,
      scoredCount: ranked.length,
      excludedCount: candidatePool.length - ranked.length,
      selectedCanonicalId: topCandidate.candidate.canonicalId,
      selectedScore: topCandidate.finalScore,
      dataCoveragePct: topCandidate.evidenceCoveragePct,
      freshness: recommendedInstrument.freshness,
      source: recommendedInstrument.dataSource
    };

    return {
      status: 'SUCCESS',
      recommendedInstrument,
      whyChosen: evidence.whyChosen,
      negativeFactors: evidence.negativeFactors,
      whyAlternativesScoredLower: evidence.whyAlternativesScoredLower,
      risks: evidence.risks,
      dataQuality: evidence.dataQuality,
      methodology: evidence.methodology,
      disclaimer: evidence.disclaimer,
      evaluatedCandidatesCount: candidatePool.length,
      eligibleCandidatesCount: ranked.length,
      rankingAudit: ranked.map(r => ({
        candidateId: r.candidate.canonicalId,
        score: r.finalScore,
        suitabilityFit: r.suitabilityFitScore,
        coveragePct: r.evidenceCoveragePct,
        freshnessScore: r.freshnessScore
      })),
      audit
    };
  }

  /**
   * Validates optional LLM output.
   */
  validateLlm(llmText: string, recommendation: RecommendationResponse): string {
    return validateLlmExplanation(llmText, recommendation);
  }
}

export const recommendationEngine = new DeterministicRecommendationEngine();
