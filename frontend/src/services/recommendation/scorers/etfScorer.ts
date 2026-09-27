import type {
  CandidateInstrumentRecord,
  SuitabilityProfile,
  PortfolioHolding,
  ScoringFactorResult
} from '../types';
import { ETF_WEIGHTS } from '../types';
import { analyzePortfolioOverlap } from '../portfolioOverlap';
import type { ScorerOutput } from './mfScorer';

/**
 * Transparent, deterministic ETF scoring model.
 * Initial weights:
 * - Benchmark / Goal Fit: 20%
 * - Tracking Difference / Error: 20%
 * - Expense Ratio: 15%
 * - Liquidity: 15%
 * - AUM: 10%
 * - Volatility / Drawdown: 10%
 * - Portfolio Diversification: 10%
 */
export function scoreETF(
  candidate: CandidateInstrumentRecord,
  suitability: SuitabilityProfile,
  portfolio?: PortfolioHolding[]
): ScorerOutput {
  const rawFactors: (Omit<ScoringFactorResult, 'effectiveWeight' | 'contribution'>)[] = [];
  const negativeFactors: string[] = [];
  const risks: string[] = [];

  // 1. Benchmark / Goal Fit (20%)
  const goalLower = suitability.primaryGoal.toLowerCase();
  let benchGoalScore = 80;
  let benchEvidence = `Direct passive tracking of ${candidate.benchmark} matches investor mandate.`;

  if (candidate.category.includes('Gold')) {
    if (goalLower.includes('inflation') || goalLower.includes('hedge') || goalLower.includes('preservation')) {
      benchGoalScore = 96;
      benchEvidence = 'Gold ETF provides direct physical-backed inflation protection and zero equity correlation.';
    } else {
      benchGoalScore = 75;
      benchEvidence = 'Provides sovereign-backed portfolio shock absorber, though equity compounding is lower.';
    }
  } else if (candidate.subCategory.includes('Nasdaq') || candidate.category.includes('Global')) {
    if (suitability.horizonYears >= 5) {
      benchGoalScore = 95;
      benchEvidence = 'Tracks NASDAQ-100 mega-cap tech innovators with direct US Dollar currency appreciation hedge.';
    } else {
      benchGoalScore = 65;
      benchEvidence = 'Shorter horizon introduces currency and technology sector cyclicality.';
    }
  } else {
    // Broad Nifty / Large-Cap ETF
    if (suitability.effectiveRiskCategory !== 'Conservative') {
      benchGoalScore = 95;
      benchEvidence = `Low-cost foundational equity compounding tracking top Indian corporations (${candidate.benchmark}).`;
    } else {
      benchGoalScore = 60;
      benchEvidence = 'Equity index ETF carries market drawdowns unsuitable for pure conservative preservation.';
    }
  }

  rawFactors.push({
    factor: 'Benchmark / Goal Fit',
    value: candidate.benchmark,
    normalizedScore: benchGoalScore,
    weight: ETF_WEIGHTS.benchmarkGoalFit,
    evidence: benchEvidence,
    dataSource: 'Exchange Benchmark Index Data',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: true
  });

  // 2. Tracking Difference / Error (20%)
  const hasTe = candidate.trackingErrorPct !== undefined && candidate.trackingErrorPct !== null;
  let teScore = 0;
  let teVal = 'N/A';
  let teEvidence = 'Tracking Difference / Error: N/A — this factor was excluded from scoring due to unavailable verified data.';

  if (hasTe) {
    const te = candidate.trackingErrorPct!;
    teVal = `${te}% annualized tracking error`;
    if (te <= 0.04) teScore = 98;
    else if (te <= 0.08) teScore = 92;
    else if (te <= 0.15) teScore = 82;
    else teScore = 65;

    teEvidence = `Tight historical tracking error of ${te}% against underlying benchmark index.`;
    if (te > 0.15) {
      negativeFactors.push(`Tracking error of ${te}% is slightly wider than domestic core index ETFs.`);
    }
  }

  rawFactors.push({
    factor: 'Tracking Difference / Error',
    value: teVal,
    normalizedScore: teScore,
    weight: ETF_WEIGHTS.trackingDifferenceError,
    evidence: teEvidence,
    dataSource: 'NSE / AMC Tracking Metrics',
    dataFreshness: 'HISTORICAL',
    isAvailable: hasTe
  });

  // 3. Expense Ratio (15%)
  const hasExp = candidate.expenseRatioPct !== undefined && candidate.expenseRatioPct !== null;
  let expScore = 0;
  let expVal = 'N/A';
  let expEvidence = 'Expense ratio: N/A — this factor was excluded from scoring due to unavailable verified data.';

  if (hasExp) {
    const expNum = candidate.expenseRatioPct!;
    expVal = candidate.expenseRatioStr || `${expNum}%`;
    if (expNum <= 0.05) expScore = 99;
    else if (expNum <= 0.12) expScore = 94;
    else if (expNum <= 0.25) expScore = 85;
    else if (expNum <= 0.60) expScore = 72;
    else expScore = 60;

    expEvidence = `Ultra-competitive TER of ${expVal} maximizes retained compound returns.`;
  }

  rawFactors.push({
    factor: 'Expense Ratio',
    value: expVal,
    normalizedScore: expScore,
    weight: ETF_WEIGHTS.expenseRatio,
    evidence: expEvidence,
    dataSource: 'Exchange Disclosed TER',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: hasExp
  });

  // 4. Secondary Market Liquidity (15%)
  const hasVol = candidate.dailyLiquidityVolume !== undefined && candidate.dailyLiquidityVolume !== null;
  let liqScore = 0;
  let liqVal = 'N/A';
  let liqEvidence = 'Liquidity: N/A — this factor was excluded from scoring due to unavailable verified data.';

  if (hasVol) {
    const vol = candidate.dailyLiquidityVolume!;
    liqVal = `~${(vol / 100000).toFixed(1)} Lakh shares/day`;
    if (vol >= 3000000) liqScore = 98;
    else if (vol >= 1000000) liqScore = 92;
    else if (vol >= 500000) liqScore = 82;
    else liqScore = 65;

    liqEvidence = `High exchange secondary trading depth with minimal bid-ask spread slippage.`;
  }

  rawFactors.push({
    factor: 'Liquidity',
    value: liqVal,
    normalizedScore: liqScore,
    weight: ETF_WEIGHTS.liquidity,
    evidence: liqEvidence,
    dataSource: 'NSE Cash Segment Trade Volume',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: hasVol
  });

  // 5. Assets Under Management (AUM) (10%)
  const hasAum = candidate.aumCr !== undefined && candidate.aumCr !== null;
  let aumScore = 0;
  let aumVal = 'N/A';
  let aumEvidence = 'AUM: N/A — this factor was excluded from scoring due to unavailable verified data.';

  if (hasAum) {
    const aumCr = candidate.aumCr!;
    aumVal = candidate.aumStr || `₹${aumCr} Cr`;
    if (aumCr >= 25000) aumScore = 98;
    else if (aumCr >= 10000) aumScore = 92;
    else if (aumCr >= 3000) aumScore = 84;
    else aumScore = 72;

    aumEvidence = `Substantial asset pool (${aumVal}) ensures institutional market-maker participation.`;
  }

  rawFactors.push({
    factor: 'AUM',
    value: aumVal,
    normalizedScore: aumScore,
    weight: ETF_WEIGHTS.aum,
    evidence: aumEvidence,
    dataSource: 'AMC Published AUM',
    dataFreshness: 'LATEST_AVAILABLE',
    isAvailable: hasAum
  });

  // 6. Volatility / Drawdown (10%)
  const hasDd = candidate.maxDrawdownPct !== undefined && candidate.maxDrawdownPct !== null;
  let volScore = 0;
  let volVal = 'N/A';
  let volEvidence = 'Volatility / Drawdown: N/A — this factor was excluded from scoring due to unavailable verified data.';

  if (hasDd) {
    const dd = candidate.maxDrawdownPct!;
    volVal = `-${dd}% max drawdown`;
    if (dd <= 10) volScore = 95;
    else if (dd <= 16) volScore = 85;
    else if (dd <= 22) volScore = 74;
    else volScore = 62;

    volEvidence = `Demonstrates disciplined benchmark containment with historical max drawdown of ${dd}%.`;
  }

  rawFactors.push({
    factor: 'Volatility / Drawdown',
    value: volVal,
    normalizedScore: volScore,
    weight: ETF_WEIGHTS.volatilityDrawdown,
    evidence: volEvidence,
    dataSource: 'Exchange Historical Price Series',
    dataFreshness: 'HISTORICAL',
    isAvailable: hasDd
  });

  // 7. Portfolio Diversification (10%)
  const overlap = analyzePortfolioOverlap(candidate, portfolio);
  if (overlap.duplicateExposure) {
    negativeFactors.push(overlap.evidence);
  }

  rawFactors.push({
    factor: 'Portfolio Diversification',
    value: `${overlap.diversificationScore}/100`,
    normalizedScore: overlap.diversificationScore,
    weight: ETF_WEIGHTS.portfolioDiversification,
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

  // Risks
  if (candidate.category.includes('Global')) {
    risks.push('Subject to foreign currency (USD/INR) fluctuations and overseas market trading schedules.');
  }
  if (candidate.category.includes('Commodity') || candidate.category.includes('Gold')) {
    risks.push('Gold yields no regular dividends or interest; returns depend entirely on bullion spot price moves.');
  }
  if (candidate.category.includes('Sector')) {
    risks.push('Sector-specific concentration risk; does not provide broad multi-industry diversification.');
  }
  risks.push('Intraday exchange price may trade at mild premium or discount to live intraday NAV (iNAV).');

  const suitabilityFitScore = Math.round((benchGoalScore * 0.6 + volScore * 0.4) * 10) / 10;
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
