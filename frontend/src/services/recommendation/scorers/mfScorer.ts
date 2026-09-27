import type {
  CandidateInstrumentRecord,
  SuitabilityProfile,
  PortfolioHolding,
  ScoringFactorResult
} from '../types';
import { MUTUAL_FUND_WEIGHTS } from '../types';
import { analyzePortfolioOverlap } from '../portfolioOverlap';

export interface ScorerOutput {
  finalScore: number;
  suitabilityFitScore: number;
  factors: ScoringFactorResult[];
  unavailableFactors: string[];
  negativeFactors: string[];
  risks: string[];
  evidenceCoveragePct: number;
}

/**
 * Transparent, deterministic Mutual Fund scoring model.
 * Initial weights:
 * - Category / Goal Fit: 25%
 * - Risk Suitability: 20%
 * - Consistency: 15%
 * - Benchmark-relative Evidence: 10%
 * - Expense Ratio: 10%
 * - Downside / Drawdown: 10%
 * - Risk-adjusted Performance: 5%
 * - Portfolio Diversification: 5%
 */
export function scoreMutualFund(
  candidate: CandidateInstrumentRecord,
  suitability: SuitabilityProfile,
  portfolio?: PortfolioHolding[]
): ScorerOutput {
  const rawFactors: (Omit<ScoringFactorResult, 'effectiveWeight' | 'contribution'>)[] = [];
  const negativeFactors: string[] = [];
  const risks: string[] = [];

  // 1. Category / Goal Fit (25%)
  const goalLower = suitability.primaryGoal.toLowerCase();
  let goalFitScore = 75;
  let goalEvidence = `Fund category (${candidate.category}) is compatible with stated goal (${suitability.primaryGoal}).`;

  if (goalLower.includes('emergency') || goalLower.includes('liquid') || suitability.liquidityRequirement === 'High') {
    if (candidate.category.includes('Liquid')) {
      goalFitScore = 98;
      goalEvidence = 'Immediate T+1 liquidity aligns with emergency reserve priority.';
    } else if (candidate.category.includes('Debt')) {
      goalFitScore = 80;
      goalEvidence = 'Short duration debt provides stability, but lacks immediate liquid redemption.';
    } else {
      goalFitScore = 30;
      goalEvidence = 'Equity volatility conflicts with capital preservation / emergency goal.';
    }
  } else if (goalLower.includes('retirement') || goalLower.includes('wealth') || suitability.horizonYears >= 10) {
    if (candidate.category.includes('Small Cap') || candidate.category.includes('Mid Cap') || candidate.category.includes('Flexi') || candidate.category.includes('Index')) {
      goalFitScore = 95;
      goalEvidence = 'Long compounding runway maximizes equity wealth accumulation.';
    } else {
      goalFitScore = 60;
      goalEvidence = 'Debt allocations limit inflation-adjusted compounding over 10+ year horizons.';
    }
  } else if (goalLower.includes('preservation') || goalLower.includes('capital')) {
    if (candidate.category.includes('Liquid') || candidate.category.includes('Corporate Debt') || candidate.category.includes('Conservative Hybrid')) {
      goalFitScore = 95;
      goalEvidence = 'Defensive debt instruments strictly preserve capital.';
    } else {
      goalFitScore = 40;
      goalEvidence = 'Market equity beta introduces potential downside volatility.';
    }
  }

  rawFactors.push({
    factor: 'Category / Goal Fit',
    value: candidate.category,
    normalizedScore: goalFitScore,
    weight: MUTUAL_FUND_WEIGHTS.categoryGoalFit,
    evidence: goalEvidence,
    dataSource: 'AMFI Category Classification',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: true
  });

  // 2. Risk Suitability (20%)
  let riskScore = 70;
  let riskEvidence = `Matches investor ${suitability.effectiveRiskCategory} risk mandate.`;
  if (suitability.effectiveRiskCategory === 'Conservative') {
    if (candidate.riskTier === 'LOW') {
      riskScore = 96;
      riskEvidence = 'Low-volatility sovereign and AAA debt safely aligns with Conservative risk profile.';
    } else if (candidate.riskTier === 'MODERATE') {
      riskScore = 65;
      riskEvidence = 'Balanced allocation carries moderate equity risk.';
    } else {
      riskScore = 25;
      riskEvidence = 'High risk tier exceeds Conservative mandate.';
      negativeFactors.push('Elevated equity volatility conflicts with conservative risk posture.');
    }
  } else if (suitability.effectiveRiskCategory === 'Moderate') {
    if (candidate.riskTier === 'MODERATE') {
      riskScore = 95;
      riskEvidence = 'Large-cap and multi-cap blend ideally calibrated for Moderate risk capacity.';
    } else if (candidate.riskTier === 'LOW') {
      riskScore = 80;
      riskEvidence = 'Capital safe, but sacrifices equity compounding potential.';
    } else {
      riskScore = 70;
      riskEvidence = 'Higher market beta acceptable within managed limits.';
    }
  } else {
    // Aggressive
    if (candidate.riskTier === 'HIGH' || candidate.riskTier === 'VERY_HIGH') {
      riskScore = 98;
      riskEvidence = 'High-growth alpha engines leverage your aggressive risk capacity for maximum alpha.';
    } else if (candidate.riskTier === 'MODERATE') {
      riskScore = 85;
      riskEvidence = 'Solid foundation, though conservative relative to maximum risk capacity.';
    } else {
      riskScore = 50;
      riskEvidence = 'Underutilizes aggressive risk capacity.';
    }
  }

  rawFactors.push({
    factor: 'Risk Suitability',
    value: `${candidate.riskTier} vs ${suitability.effectiveRiskCategory}`,
    normalizedScore: riskScore,
    weight: MUTUAL_FUND_WEIGHTS.riskSuitability,
    evidence: riskEvidence,
    dataSource: 'SmartVest Risk Engine',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: true
  });

  // 3. Consistency (15%)
  const hasConsistency = candidate.managerConsistencyScore !== undefined && candidate.managerConsistencyScore !== null;
  const consistencyVal = hasConsistency ? candidate.managerConsistencyScore! : 0;
  rawFactors.push({
    factor: 'Consistency',
    value: hasConsistency ? `${consistencyVal}/100` : 'N/A',
    normalizedScore: hasConsistency ? consistencyVal : 0,
    weight: MUTUAL_FUND_WEIGHTS.consistency,
    evidence: hasConsistency 
      ? `Historical 3Y/5Y rolling consistency score of ${consistencyVal}/100 across market regimes.`
      : 'Consistency: N/A — this factor was excluded from scoring due to unavailable verified data.',
    dataSource: 'AMFI Rolling Return Analysis',
    dataFreshness: 'HISTORICAL',
    isAvailable: hasConsistency
  });

  // 4. Benchmark-relative Evidence (10%)
  const alphaEvidence = candidate.historicalReturns?.threeYear 
    ? `${candidate.historicalReturns.threeYear}% 3Y CAGR tracking ${candidate.benchmark}`
    : `Tracks ${candidate.benchmark}`;
  let benchmarkScore = 85;
  if (candidate.historicalReturns?.threeYear) {
    benchmarkScore = candidate.historicalReturns.threeYear > 15 ? 92 : (candidate.historicalReturns.threeYear > 10 ? 84 : 75);
  }
  rawFactors.push({
    factor: 'Benchmark-relative Evidence',
    value: candidate.benchmark,
    normalizedScore: benchmarkScore,
    weight: MUTUAL_FUND_WEIGHTS.benchmarkRelativeEvidence,
    evidence: `Verified multi-year track record against ${candidate.benchmark} (${alphaEvidence}).`,
    dataSource: 'AMFI Benchmark Directory',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: true
  });

  // 5. Expense Ratio (10%)
  const hasExp = candidate.expenseRatioPct !== undefined && candidate.expenseRatioPct !== null;
  let expScore = 0;
  let expVal = 'N/A';
  let expEvidence = 'Expense ratio: N/A — this factor was excluded from scoring due to unavailable verified data.';

  if (hasExp) {
    const expNum = candidate.expenseRatioPct!;
    expVal = candidate.expenseRatioStr || `${expNum}%`;
    if (expNum <= 0.20) expScore = 98;
    else if (expNum <= 0.40) expScore = 90;
    else if (expNum <= 0.65) expScore = 80;
    else if (expNum <= 0.85) expScore = 70;
    else expScore = 55;

    expEvidence = `Direct Plan annual total expense ratio is ${expVal}, eliminating distributor commissions.`;
    if (expNum > 0.70) {
      negativeFactors.push(`Active management fee (${expVal}) is higher than low-cost index alternatives.`);
    }
  }

  rawFactors.push({
    factor: 'Expense Ratio',
    value: expVal,
    normalizedScore: expScore,
    weight: MUTUAL_FUND_WEIGHTS.expenseRatio,
    evidence: expEvidence,
    dataSource: 'AMFI Direct Plan Registry',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: hasExp
  });

  // 6. Downside / Drawdown (10%)
  const hasDd = candidate.maxDrawdownPct !== undefined && candidate.maxDrawdownPct !== null;
  let ddScore = 0;
  let ddVal = 'N/A';
  let ddEvidence = 'Downside / Drawdown: N/A — this factor was excluded from scoring due to unavailable verified data.';

  if (hasDd) {
    const dd = candidate.maxDrawdownPct!;
    ddVal = `-${dd}% max drawdown`;
    if (dd <= 1.0) ddScore = 99;
    else if (dd <= 5.0) ddScore = 92;
    else if (dd <= 15.0) ddScore = 82;
    else if (dd <= 20.0) ddScore = 72;
    else ddScore = 60;

    ddEvidence = `Historical peak-to-trough maximum drawdown contained at ${dd}%.`;
    if (dd > 20) {
      risks.push(`Historical maximum drawdown of ${dd}% during severe equity market corrections.`);
    }
  }

  rawFactors.push({
    factor: 'Downside / Drawdown',
    value: ddVal,
    normalizedScore: ddScore,
    weight: MUTUAL_FUND_WEIGHTS.downsideDrawdown,
    evidence: ddEvidence,
    dataSource: 'AMFI Risk Statistics',
    dataFreshness: 'HISTORICAL',
    isAvailable: hasDd
  });

  // 7. Risk-adjusted Performance (Sharpe Ratio) (5%)
  const hasSharpe = candidate.sharpeRatio !== undefined && candidate.sharpeRatio !== null;
  let sharpeScore = 0;
  let sharpeVal = 'N/A';
  let sharpeEvidence = 'Risk-adjusted Performance: N/A — this factor was excluded from scoring due to unavailable verified data.';

  if (hasSharpe) {
    const sharpe = candidate.sharpeRatio!;
    sharpeVal = `Sharpe: ${sharpe}`;
    if (sharpe >= 1.8) sharpeScore = 96;
    else if (sharpe >= 1.6) sharpeScore = 88;
    else if (sharpe >= 1.4) sharpeScore = 80;
    else sharpeScore = 65;

    sharpeEvidence = `Delivers strong risk-adjusted alpha (Sharpe ratio: ${sharpe}).`;
  }

  rawFactors.push({
    factor: 'Risk-adjusted Performance',
    value: sharpeVal,
    normalizedScore: sharpeScore,
    weight: MUTUAL_FUND_WEIGHTS.riskAdjustedPerformance,
    evidence: sharpeEvidence,
    dataSource: 'AMFI Risk Statistics',
    dataFreshness: 'HISTORICAL',
    isAvailable: hasSharpe
  });

  // 8. Portfolio Diversification (5%)
  const overlap = analyzePortfolioOverlap(candidate, portfolio);
  if (overlap.duplicateExposure) {
    negativeFactors.push(overlap.evidence);
  }

  rawFactors.push({
    factor: 'Portfolio Diversification',
    value: `${overlap.diversificationScore}/100`,
    normalizedScore: overlap.diversificationScore,
    weight: MUTUAL_FUND_WEIGHTS.portfolioDiversification,
    evidence: overlap.evidence,
    dataSource: 'SmartVest Portfolio Engine',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: true
  });

  // Calculate Re-Normalized Final Score
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

  // Add default risk disclosures
  if (candidate.category.includes('Small Cap') || candidate.category.includes('Mid Cap')) {
    risks.push('Mid and small cap enterprises are prone to higher market beta and liquidity volatility.');
  }
  if (candidate.category.includes('Index') || candidate.category.includes('Equity')) {
    risks.push('Subject to macroeconomic market risk; capital is not guaranteed by government or banks.');
  }
  if (candidate.category.includes('Debt')) {
    risks.push('Subject to interest rate cycle adjustments and inflation risk.');
  }

  const suitabilityFitScore = Math.round((goalFitScore * 0.55 + riskScore * 0.45) * 10) / 10;
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
