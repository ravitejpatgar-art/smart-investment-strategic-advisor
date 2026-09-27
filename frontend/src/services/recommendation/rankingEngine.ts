import type { ScoredCandidate, FreshnessType } from './types';

export const FRESHNESS_HIERARCHY: Record<FreshnessType, number> = {
  REALTIME: 6,
  DELAYED: 5,
  LATEST_AVAILABLE: 4,
  END_OF_DAY: 3,
  HISTORICAL: 2,
  MODEL_ASSUMPTION: 1,
  STALE: 0,
  UNAVAILABLE: -1
};

export function getFreshnessWeight(freshness?: FreshnessType | string | null): number {
  if (!freshness) return 2;
  return FRESHNESS_HIERARCHY[freshness as FreshnessType] ?? 2;
}

/**
 * Multi-factor deterministic ranking algorithm.
 * Sorting order:
 * 1. highest final score
 * 2. strongest suitability fit
 * 3. highest evidence coverage
 * 4. freshest verified data
 * 5. deterministic canonical-id tie breaker
 *
 * Guaranteed 100% deterministic: Math.random() is strictly forbidden.
 */
export function rankCandidatesDeterministically(
  candidates: ScoredCandidate[]
): ScoredCandidate[] {
  // Create a copy to prevent mutation
  const sorted = [...candidates];

  sorted.sort((a, b) => {
    // 1. Highest final score (rounded to 2 decimal places to avoid float jitter)
    const scoreDiff = Math.round((b.finalScore - a.finalScore) * 100);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    // 2. Strongest suitability fit
    const suitDiff = Math.round((b.suitabilityFitScore - a.suitabilityFitScore) * 100);
    if (suitDiff !== 0) {
      return suitDiff;
    }

    // 3. Highest evidence coverage percentage
    const covDiff = b.evidenceCoveragePct - a.evidenceCoveragePct;
    if (covDiff !== 0) {
      return covDiff;
    }

    // 4. Freshest verified data
    const freshDiff = b.freshnessScore - a.freshnessScore;
    if (freshDiff !== 0) {
      return freshDiff;
    }

    // 5. Deterministic canonical-id tie-breaker
    return a.candidate.canonicalId.localeCompare(b.candidate.canonicalId);
  });

  return sorted;
}
