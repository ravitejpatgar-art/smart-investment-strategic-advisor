import type { CandidateInstrumentRecord, SuitabilityProfile, EligibilityResult, RequestedAssetClass } from './types';

/**
 * Hard eligibility filter.
 * Eliminates candidates that fail non-negotiable suitability or instrument invariants before scoring.
 * Emits machine-readable eligibility reasons.
 */
export function checkCandidateEligibility(
  candidate: CandidateInstrumentRecord,
  suitability: SuitabilityProfile,
  requestedAssetClass?: RequestedAssetClass
): EligibilityResult {
  const reasons: string[] = [];

  // 1. Asset Class Filter
  if (requestedAssetClass && requestedAssetClass !== 'ANY') {
    if (candidate.assetClass !== requestedAssetClass) {
      reasons.push(`Asset class mismatch: requested ${requestedAssetClass}, instrument is ${candidate.assetClass}`);
    }
  }

  // 2. Minimum Investment Horizon Check
  if (suitability.horizonYears < candidate.minimumHorizonYears) {
    reasons.push(
      `Goal horizon (${suitability.horizonYears} yrs) is shorter than recommended minimum horizon (${candidate.minimumHorizonYears} yrs)`
    );
  }

  // 3. Bond Maturity Horizon Invariant
  if (candidate.assetClass === 'BOND') {
    if (candidate.maturityYears !== undefined && candidate.maturityYears > (suitability.horizonYears + 0.5)) {
      reasons.push(
        `Bond maturity (${candidate.maturityYears} yrs) exceeds your stated goal horizon (${suitability.horizonYears} yrs)`
      );
    }
    if (!candidate.creditRating) {
      reasons.push('Required verified credit rating unavailable');
    }
    if (!candidate.ytmPct && !candidate.couponPct) {
      reasons.push('Required yield / coupon metrics unavailable');
    }
  }

  // 4. Risk Profile Compatibility
  if (suitability.effectiveRiskCategory === 'Conservative') {
    if (candidate.riskTier === 'VERY_HIGH' || candidate.riskTier === 'HIGH') {
      reasons.push(
        `Instrument risk tier (${candidate.riskTier}) exceeds Conservative risk mandate`
      );
    }
    // Conservative profiles must not be placed in speculative sector/small-cap instruments
    if (candidate.category.includes('Small Cap') || candidate.category.includes('Sector')) {
      reasons.push('High-volatility thematic/small-cap category ineligible for Conservative mandate');
    }
  } else if (suitability.effectiveRiskCategory === 'Moderate') {
    if (candidate.riskTier === 'VERY_HIGH') {
      reasons.push(
        `Instrument risk tier (${candidate.riskTier}) exceeds Moderate risk tolerance`
      );
    }
  }

  // 5. Liquidity Requirement Matching
  if (suitability.liquidityRequirement === 'High') {
    // High liquidity required (e.g. emergency fund or horizon <= 1 yr):
    // Cannot lock up in long duration bonds, mid/small caps, or low liquidity ETFs
    if (candidate.assetClass === 'BOND' && (candidate.maturityYears ?? 0) > 1.5) {
      reasons.push('Instrument lacks instant liquidity required for emergency / short-term deployment');
    }
    if (candidate.riskTier === 'HIGH' || candidate.riskTier === 'VERY_HIGH') {
      reasons.push('Capital preservation required; high-volatility instrument fails liquidity safety filter');
    }
  }

  // 6. Critical Data Availability
  if (candidate.assetClass === 'MUTUAL_FUND') {
    if (!candidate.schemeCode && !candidate.canonicalId) {
      reasons.push('Verified AMFI scheme identifier missing');
    }
  } else if (candidate.assetClass === 'ETF') {
    if (!candidate.symbol || !candidate.benchmark) {
      reasons.push('Verified ETF symbol or benchmark identifier missing');
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
}
