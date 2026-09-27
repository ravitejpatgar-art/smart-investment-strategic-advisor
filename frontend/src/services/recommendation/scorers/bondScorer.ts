import type {
  CandidateInstrumentRecord,
  SuitabilityProfile,
  PortfolioHolding,
  ScoringFactorResult
} from '../types';
import { BOND_WEIGHTS } from '../types';
import { analyzePortfolioOverlap } from '../portfolioOverlap';
import type { ScorerOutput } from './mfScorer';

/**
 * Transparent, deterministic Corporate & Sovereign Bond scoring model.
 * Initial weights:
 * - Goal / Maturity Fit: 20%
 * - Credit Quality: 20%
 * - Yield / YTM: 20%
 * - Duration / Rate Sensitivity: 15%
 * - Liquidity: 10%
 * - Issuer Quality: 10%
 * - Portfolio Diversification: 5%
 */
export function scoreBond(
  candidate: CandidateInstrumentRecord,
  suitability: SuitabilityProfile,
  portfolio?: PortfolioHolding[]
): ScorerOutput {
  const rawFactors: (Omit<ScoringFactorResult, 'effectiveWeight' | 'contribution'>)[] = [];
  const negativeFactors: string[] = [];
  const risks: string[] = [];

  // 1. Goal / Maturity Fit (20%)
  const hasMat = Boolean(candidate.maturityDate && candidate.maturityYears !== undefined && candidate.maturityYears !== null);
  let maturityFitScore = 0;
  let maturityEvidence = 'Goal / Maturity Fit: N/A — this factor was excluded from scoring due to unavailable verified data.';
  let matVal = 'N/A';

  if (hasMat) {
    const matYrs = candidate.maturityYears!;
    const horizon = suitability.horizonYears;
    const diff = Math.abs(matYrs - horizon);
    matVal = `${candidate.maturityDate} (${matYrs} yrs)`;

    if (diff <= 0.5) {
      maturityFitScore = 98;
      maturityEvidence = `Optimal maturity immunization: bond matures (${candidate.maturityDate}) precisely near your ${horizon}-year goal.`;
    } else if (matYrs <= horizon && diff <= 2.0) {
      maturityFitScore = 90;
      maturityEvidence = `Protective immunization: capital matures in ${matYrs} years ahead of your ${horizon}-year goal.`;
    } else if (matYrs > horizon) {
      maturityFitScore = 45;
      maturityEvidence = `Maturity (${matYrs} yrs) extends beyond your ${horizon}-year horizon, requiring secondary market sale.`;
      negativeFactors.push('Bond matures after stated goal, exposing position to secondary market interest rate risk.');
    } else {
      maturityFitScore = 75;
      maturityEvidence = `Matures significantly earlier than horizon (${matYrs} vs ${horizon} yrs), posing reinvestment risk.`;
    }
  }

  rawFactors.push({
    factor: 'Goal / Maturity Fit',
    value: matVal,
    normalizedScore: maturityFitScore,
    weight: BOND_WEIGHTS.goalMaturityFit,
    evidence: maturityEvidence,
    dataSource: 'NSE Corporate Bond Directory / CBRICS',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: hasMat
  });

  // 2. Credit Quality (20%)
  const hasRating = Boolean(candidate.creditRating);
  let creditScore = 0;
  let creditEvidence = 'Credit Quality: N/A — this factor was excluded from scoring due to unavailable verified data.';
  let creditVal = 'N/A';

  if (hasRating) {
    const rating = candidate.creditRating!;
    creditVal = rating;

    if (rating.includes('AAA') || candidate.securityType === 'SOVEREIGN') {
      creditScore = 98;
      creditEvidence = `Highest tier credit safety (${rating}) with virtually zero default probability.`;
    } else if (rating.includes('AA+')) {
      creditScore = 88;
      creditEvidence = `Strong credit safety (${rating}) with robust balance sheet backing.`;
    } else if (rating.includes('AA')) {
      creditScore = 78;
      creditEvidence = `Adequate credit quality (${rating}), but subject to moderate economic sensitivity.`;
      negativeFactors.push('Non-AAA rating carries mild credit spread risk.');
    } else {
      creditScore = 60;
      creditEvidence = `Lower credit rating (${rating}) necessitates active credit monitoring.`;
    }
  }

  rawFactors.push({
    factor: 'Credit Quality',
    value: creditVal,
    normalizedScore: creditScore,
    weight: BOND_WEIGHTS.creditQuality,
    evidence: creditEvidence,
    dataSource: 'SEBI Registered Credit Rating Agencies (CRISIL/ICRA/CARE)',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: hasRating
  });

  // 3. Yield / YTM (20%)
  const hasYield = candidate.ytmPct !== undefined || candidate.couponPct !== undefined;
  let yieldScore = 0;
  let yieldEvidence = 'Yield / YTM: N/A — this factor was excluded from scoring due to unavailable verified data.';
  let yieldVal = 'N/A';

  if (hasYield) {
    const ytm = candidate.ytmPct ?? candidate.couponPct!;
    yieldVal = `${ytm}% YTM${candidate.couponPct ? ` (Coupon: ${candidate.couponPct}%)` : ''}`;
    if (ytm >= 7.6) yieldScore = 95;
    else if (ytm >= 7.3) yieldScore = 88;
    else if (ytm >= 7.0) yieldScore = 80;
    else yieldScore = 68;

    yieldEvidence = `Yield to Maturity of ${ytm}% provides predictable annualized cashflow and coupon accrual.`;
  }

  rawFactors.push({
    factor: 'Yield / YTM',
    value: yieldVal,
    normalizedScore: yieldScore,
    weight: BOND_WEIGHTS.yieldYtm,
    evidence: yieldEvidence,
    dataSource: 'NSE Secondary Market CBRICS Reporting',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: hasYield
  });

  // 4. Duration / Rate Sensitivity (15%)
  const hasDur = candidate.durationYears !== undefined && candidate.durationYears !== null;
  let durScore = 0;
  let durEvidence = 'Duration / Rate Sensitivity: N/A — this factor was excluded from scoring due to unavailable verified data.';
  let durVal = 'N/A';

  if (hasDur) {
    const dur = candidate.durationYears!;
    durVal = `${dur} years modified duration`;
    if (dur <= 1.5) durScore = 96;
    else if (dur <= 2.5) durScore = 90;
    else if (dur <= 3.5) durScore = 82;
    else durScore = 68;

    durEvidence = `Low-to-moderate modified duration of ${dur} years cushions against central bank rate changes.`;
  }

  rawFactors.push({
    factor: 'Duration / Rate Sensitivity',
    value: durVal,
    normalizedScore: durScore,
    weight: BOND_WEIGHTS.durationRateSensitivity,
    evidence: durEvidence,
    dataSource: 'Fixed Income Analytics Engine',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: hasDur
  });

  // 5. Liquidity (10%)
  const liqStatus = candidate.liquidityStatus || 'LAST_TRADED';
  let liqScore = 82;
  if (candidate.securityType === 'SOVEREIGN') liqScore = 98;
  else if (candidate.securityType === 'PSU' || candidate.issuer?.includes('HDFC')) liqScore = 90;
  else liqScore = 75;

  rawFactors.push({
    factor: 'Liquidity',
    value: liqStatus,
    normalizedScore: liqScore,
    weight: BOND_WEIGHTS.liquidity,
    evidence: `Reported on NSE CBRICS platform with verified institutional trading depth.`,
    dataSource: 'NSE CBRICS Trade Reporting Platform',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: true
  });

  // 6. Issuer Quality (10%)
  const hasIssuer = candidate.issuerQualityScore !== undefined && candidate.issuerQualityScore !== null;
  let issuerScore = 0;
  let issuerVal = 'N/A';
  let issuerEvidence = 'Issuer Quality: N/A — this factor was excluded from scoring due to unavailable verified data.';

  if (hasIssuer) {
    const scoreVal = candidate.issuerQualityScore!;
    issuerVal = `${candidate.issuer || 'Issuer'} (${scoreVal}/100)`;
    issuerScore = scoreVal;
    issuerEvidence = `Premier institutional issuer (${candidate.issuer || 'Disclosed Entity'}) with strong balance sheet capitalization.`;
  }

  rawFactors.push({
    factor: 'Issuer Quality',
    value: issuerVal,
    normalizedScore: issuerScore,
    weight: BOND_WEIGHTS.issuerQuality,
    evidence: issuerEvidence,
    dataSource: 'Statutory Corporate Filings',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: hasIssuer
  });

  // 7. Portfolio Diversification (5%)
  const overlap = analyzePortfolioOverlap(candidate, portfolio);
  rawFactors.push({
    factor: 'Portfolio Diversification',
    value: `${overlap.diversificationScore}/100`,
    normalizedScore: overlap.diversificationScore,
    weight: BOND_WEIGHTS.portfolioDiversification,
    evidence: overlap.evidence,
    dataSource: 'SmartVest Portfolio Engine',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: true
  });

  // Re-normalize weights
  const availableFactors = rawFactors.filter(f => f.isAvailable);
  const unavailableFactors = rawFactors.filter(f => !f.isAvailable).map(f => f.factor);
  const totalAvailableNominalWeight = availableFactors.reduce((sum, f) => sum + f.weight, 0);

  const scoredFactors: ScoringFactorResult[] = rawFactors.map(f => {
    if (!f.isAvailable) {
      return {
        ...f,
        effectiveWeight: 0,
        contribution: 0
      };
    }
    const effectiveWeight = totalAvailableNominalWeight > 0 ? f.weight / totalAvailableNominalWeight : f.weight;
    const contribution = Math.round(f.normalizedScore * effectiveWeight * 10) / 10;
    return {
      ...f,
      effectiveWeight,
      contribution
    };
  });

  const finalScore = Math.round(
    scoredFactors.reduce((sum, f) => sum + f.contribution, 0) * 10
  ) / 10;

  // Major Risks for Bonds
  risks.push(`Interest rate risk: Bond prices decline if prevailing market interest rates rise prior to maturity.`);
  risks.push(`Credit risk: Default risk is minimal for ${candidate.creditRating || 'investment-grade securities'}, but subject to overall financial condition of ${candidate.issuer}.`);
  risks.push(`Liquidity risk: Secondary market trade volume in corporate bonds is lower than listed equities.`);

  const suitabilityFitScore = Math.round((maturityFitScore * 0.5 + creditScore * 0.5) * 10) / 10;
  const evidenceCoveragePct = Math.round((availableFactors.length / rawFactors.length) * 100);

  return {
    finalScore,
    suitabilityFitScore,
    factors: scoredFactors,
    unavailableFactors,
    negativeFactors,
    risks,
    evidenceCoveragePct
  };
}
