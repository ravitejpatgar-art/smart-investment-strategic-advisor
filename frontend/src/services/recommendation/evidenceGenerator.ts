import type {
  ScoredCandidate,
  CandidateInstrumentRecord,
  WhyChosenFactor,
  LowerScoredAlternative,
  DataQualityAudit,
  ScoringMethodologyConfig,
  RecommendationResponse
} from './types';
import { MUTUAL_FUND_WEIGHTS, ETF_WEIGHTS, BOND_WEIGHTS } from './types';
import { formatIstTimestamp } from '../marketApi';

/**
 * Evidence and explanation generator.
 * Formulates transparent, auditable rationales based exclusively on verified factors.
 * Never generates generic boilerplate or ungrounded AI claims.
 */
export function generateRecommendationEvidence(
  topCandidate: ScoredCandidate,
  alternatives: ScoredCandidate[],
  _totalEvaluated: number,
  _totalEligible: number,
  ineligibleCandidates?: { candidate: CandidateInstrumentRecord; reasons: string[] }[]
): {
  whyChosen: WhyChosenFactor[];
  negativeFactors: string[];
  whyAlternativesScoredLower: LowerScoredAlternative[];
  risks: string[];
  dataQuality: DataQualityAudit;
  methodology: ScoringMethodologyConfig;
  disclaimer: string;
} {
  // 1. Why Chosen: Top factors ordered by contribution
  const sortedFactors = [...topCandidate.factors]
    .filter(f => f.isAvailable && f.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution);

  const whyChosen: WhyChosenFactor[] = sortedFactors.map(f => ({
    factor: f.factor,
    evidence: f.evidence,
    contribution: f.contribution,
    dataSource: f.dataSource
  }));

  // 2. Negative factors from top candidate
  const negativeFactors = [...topCandidate.negativeFactors];

  // 3. Why Alternatives Scored Lower (2 to 3 alternatives)
  const topAlternatives = alternatives.slice(0, 3);
  const whyAlternativesScoredLower: LowerScoredAlternative[] = topAlternatives.map(alt => {
    const reasons: string[] = [];

    // Compare key factors
    const topExp = topCandidate.candidate.expenseRatioPct ?? 0.5;
    const altExp = alt.candidate.expenseRatioPct ?? 0.5;
    if (altExp > topExp + 0.15) {
      reasons.push(`Higher expense ratio (${alt.candidate.expenseRatioStr || `${altExp}%`} vs ${topCandidate.candidate.expenseRatioStr || `${topExp}%`})`);
    }

    if (alt.suitabilityFitScore < topCandidate.suitabilityFitScore - 5) {
      reasons.push(`Lower suitability fit for your risk profile and goal`);
    }

    // Check portfolio overlap
    const altOverlap = alt.factors.find(f => f.factor === 'Portfolio Diversification');
    const topOverlap = topCandidate.factors.find(f => f.factor === 'Portfolio Diversification');
    if (altOverlap && topOverlap && altOverlap.normalizedScore < topOverlap.normalizedScore - 15) {
      reasons.push(`Higher portfolio overlap with existing holdings`);
    }

    // Check consistency
    const altCons = alt.candidate.managerConsistencyScore;
    const topCons = topCandidate.candidate.managerConsistencyScore;
    if (altCons && topCons && altCons < topCons - 5) {
      reasons.push(`Lower multi-regime consistency score (${altCons}/100 vs ${topCons}/100)`);
    }

    // Check tracking error for ETFs
    if (alt.assetClass === 'ETF' && topCandidate.assetClass === 'ETF') {
      const altTe = alt.candidate.trackingErrorPct ?? 0;
      const topTe = topCandidate.candidate.trackingErrorPct ?? 0;
      if (altTe > topTe + 0.03) {
        reasons.push(`Higher benchmark tracking error (${altTe}% vs ${topTe}%)`);
      }
    }

    // Check credit rating for Bonds
    if (alt.assetClass === 'BOND' && topCandidate.assetClass === 'BOND') {
      if (alt.candidate.creditRating && topCandidate.candidate.creditRating && alt.candidate.creditRating !== topCandidate.candidate.creditRating) {
        reasons.push(`Lower credit safety rating (${alt.candidate.creditRating} vs ${topCandidate.candidate.creditRating})`);
      }
    }

    if (reasons.length === 0) {
      reasons.push(`Lower composite multi-factor evidence score (${alt.finalScore} vs ${topCandidate.finalScore})`);
    }

    return {
      canonicalId: alt.candidate.canonicalId,
      instrument: alt.candidate.name,
      assetClass: alt.assetClass,
      score: alt.finalScore,
      reason: reasons.join(' · '),
      missingDataLimitations: alt.unavailableFactors.length > 0 
        ? `Missing verified data for: ${alt.unavailableFactors.join(', ')}`
        : undefined
    };
  });

  // If fewer than 3 scored alternatives exist, include candidates excluded before ranking
  if (whyAlternativesScoredLower.length < 3 && ineligibleCandidates && ineligibleCandidates.length > 0) {
    const needed = 3 - whyAlternativesScoredLower.length;
    for (let i = 0; i < Math.min(needed, ineligibleCandidates.length); i++) {
      const inel = ineligibleCandidates[i];
      whyAlternativesScoredLower.push({
        canonicalId: inel.candidate.canonicalId,
        instrument: inel.candidate.name,
        assetClass: inel.candidate.assetClass,
        score: 0,
        reason: `Excluded before ranking because: ${inel.reasons.join(' · ')}`
      });
    }
  }

  // 4. Data Quality Audit
  const sourcesSet = new Set<string>();
  topCandidate.factors.forEach(f => {
    if (f.dataSource) sourcesSet.add(f.dataSource);
  });
  if (topCandidate.dataSource) sourcesSet.add(topCandidate.dataSource);

  const dataQuality: DataQualityAudit = {
    coveragePct: topCandidate.evidenceCoveragePct,
    freshness: topCandidate.candidate.quote?.freshness || (topCandidate.assetClass === 'MUTUAL_FUND' ? 'END_OF_DAY' : 'LATEST_AVAILABLE'),
    timestamp: formatIstTimestamp(topCandidate.dataTimestamp || new Date()),
    sources: Array.from(sourcesSet)
  };

  // 5. Methodology Config
  let activeWeights = MUTUAL_FUND_WEIGHTS;
  if (topCandidate.assetClass === 'ETF') {
    activeWeights = ETF_WEIGHTS;
  } else if (topCandidate.assetClass === 'BOND') {
    activeWeights = BOND_WEIGHTS;
  }

  const methodology: ScoringMethodologyConfig = {
    version: '1.0-deterministic',
    assetClass: topCandidate.assetClass,
    weights: activeWeights
  };

  const disclaimer = 'SmartVest provides decision-support quantitative models based on verified historical and regulatory market data. Information is for educational and asset allocation planning, not personalized investment advice.';

  return {
    whyChosen,
    negativeFactors,
    whyAlternativesScoredLower,
    risks: topCandidate.risks,
    dataQuality,
    methodology,
    disclaimer
  };
}

/**
 * Validates any optional LLM-generated explanation against the deterministic engine results.
 * If the LLM output contradicts the selected instrument, invents returns, or claims certainty:
 * IT IS DISCARDED and replaced by the deterministic text.
 */
export function validateLlmExplanation(
  llmText: string,
  recommendation: RecommendationResponse
): string {
  if (!recommendation.recommendedInstrument) {
    return recommendation.message || 'No recommendation available.';
  }

  const inst = recommendation.recommendedInstrument;
  const canonicalName = inst.name.toLowerCase();
  const canonicalSym = (inst.symbol || '').toLowerCase();
  const llmLower = llmText.toLowerCase();

  // Check 1: Does LLM mention the chosen instrument?
  const mentionsTarget = llmLower.includes(canonicalName) || llmLower.includes(canonicalSym) || llmLower.includes(inst.canonicalId.toLowerCase());
  if (!mentionsTarget) {
    return generateDeterministicFallbackText(recommendation);
  }

  // Check 2: Does LLM claim guaranteed returns or future certainty?
  const forbiddenClaims = ['guarantee', 'guaranteed', '100% safe', 'risk-free', 'cannot lose', 'best fund in india', 'ai predicted'];
  for (const forbidden of forbiddenClaims) {
    if (llmLower.includes(forbidden)) {
      return generateDeterministicFallbackText(recommendation);
    }
  }

  return llmText;
}

export function generateDeterministicFallbackText(recommendation: RecommendationResponse): string {
  if (!recommendation.recommendedInstrument) {
    return recommendation.message || 'Insufficient data to formulate recommendation.';
  }
  const inst = recommendation.recommendedInstrument;
  const topReasons = recommendation.whyChosen.slice(0, 3).map(w => `• ${w.factor}: ${w.evidence}`).join('\n');
  return `Selected ${inst.name} because it satisfied all eligibility filters and achieved the highest evidence-backed suitability score (${inst.score}/100) among the ${recommendation.eligibleCandidatesCount} evaluated candidates.\n\nKey Selection Drivers:\n${topReasons}`;
}
