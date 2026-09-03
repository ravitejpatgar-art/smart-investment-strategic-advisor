/**
 * SmartVest Portfolio Rebalancing Engine (P3.2)
 * Pure, typed, deterministic analytical engine for portfolio drift calculation,
 * asset allocation variance analysis, and new-contribution (SIP) rebalancing models.
 *
 * All calculations are analytical & non-predictive. No broker execution or trade placement.
 */

export type RebalanceAction = 'OVERWEIGHT' | 'UNDERWEIGHT' | 'ON_TARGET';

export interface AssetAllocationItem {
  id: string;
  name: string;
  category: string;
  currentPct: number;
  targetPct: number;
  currentValue?: number;
  currentPrice?: number | null;
  color?: string;
}

export interface AssetRebalanceResult {
  id: string;
  name: string;
  category: string;
  currentPct: number;
  targetPct: number;
  driftPct: number;
  action: RebalanceAction;
  currentVal: number;
  targetVal: number;
  adjustmentAmount: number;
  sipSuggestedAmount: number;
  sipSuggestedPct: number;
  color?: string;
}

export interface PortfolioRebalanceAnalysis {
  totalPortfolioValue: number;
  monthlySip: number;
  thresholdPct: number;
  overallDriftScore: number;
  alignmentFitScore: number;
  maxOverweight: AssetRebalanceResult | null;
  maxUnderweight: AssetRebalanceResult | null;
  assets: AssetRebalanceResult[];
  newContributionPlan: {
    assetId: string;
    name: string;
    category: string;
    suggestedSipAmount: number;
    suggestedSipPct: number;
    color?: string;
  }[];
  isFullyAligned: boolean;
}

/**
 * Normalizes allocation percentages so that total equals 100% mathematically.
 */
export function normalizePercentages(items: { pct: number }[]): number[] {
  const sum = items.reduce((acc, curr) => acc + (Number(curr.pct) || 0), 0);
  if (sum <= 0) return items.map(() => 0);
  return items.map(item => Math.round(((Number(item.pct) || 0) / sum) * 1000) / 10);
}

/**
 * Calculates portfolio allocation drift, drift categories, and new contribution SIP distribution.
 */
export function calculatePortfolioRebalance(
  rawAssets: AssetAllocationItem[],
  totalPortfolioValue: number = 1000000,
  monthlySip: number = 25000,
  thresholdPct: number = 2.0
): PortfolioRebalanceAnalysis {
  const safeTotalVal = Math.max(0, Number(totalPortfolioValue) || 0);
  const safeSip = Math.max(0, Number(monthlySip) || 0);
  const safeThreshold = Math.max(0.1, Number(thresholdPct) || 2.0);

  if (!rawAssets || rawAssets.length === 0) {
    return {
      totalPortfolioValue: safeTotalVal,
      monthlySip: safeSip,
      thresholdPct: safeThreshold,
      overallDriftScore: 0,
      alignmentFitScore: 100,
      maxOverweight: null,
      maxUnderweight: null,
      assets: [],
      newContributionPlan: [],
      isFullyAligned: true
    };
  }

  // 1. Calculate individual asset drift
  let totalAbsoluteDrift = 0;
  const analyzedAssets: AssetRebalanceResult[] = rawAssets.map((asset) => {
    const curPct = Math.max(0, Math.min(100, Number(asset.currentPct) || 0));
    const tarPct = Math.max(0, Math.min(100, Number(asset.targetPct) || 0));
    const drift = Math.round((curPct - tarPct) * 10) / 10;
    totalAbsoluteDrift += Math.abs(drift);

    let action: RebalanceAction = 'ON_TARGET';
    if (drift > safeThreshold) {
      action = 'OVERWEIGHT';
    } else if (drift < -safeThreshold) {
      action = 'UNDERWEIGHT';
    }

    const curVal = safeTotalVal > 0 
      ? Math.round(safeTotalVal * (curPct / 100)) 
      : (Number(asset.currentValue) || 0);
    const tarVal = Math.round(safeTotalVal * (tarPct / 100));
    const adjustment = tarVal - curVal;

    return {
      id: asset.id,
      name: asset.name,
      category: asset.category,
      currentPct: curPct,
      targetPct: tarPct,
      driftPct: drift,
      action,
      currentVal: curVal,
      targetVal: tarVal,
      adjustmentAmount: adjustment,
      sipSuggestedAmount: 0,
      sipSuggestedPct: 0,
      color: asset.color
    };
  });

  // 2. Compute overall drift & alignment fit
  const overallDriftScore = Math.round((totalAbsoluteDrift / 2) * 10) / 10;
  const alignmentFitScore = Math.max(0, Math.min(100, Math.round(100 - overallDriftScore * 2)));
  const isFullyAligned = analyzedAssets.every(a => a.action === 'ON_TARGET');

  // 3. Find max overweight & underweight
  let maxOverweight: AssetRebalanceResult | null = null;
  let maxUnderweight: AssetRebalanceResult | null = null;

  for (const a of analyzedAssets) {
    if (a.driftPct > 0 && (!maxOverweight || a.driftPct > maxOverweight.driftPct)) {
      maxOverweight = a;
    }
    if (a.driftPct < 0 && (!maxUnderweight || a.driftPct < maxUnderweight.driftPct)) {
      maxUnderweight = a;
    }
  }

  // 4. Calculate New Contribution (SIP) Rebalancing Plan
  // Direct future SIP flows into underweighted assets to close drift without forced selling
  const annualSip = safeSip * 12;
  const projectedFuturePortfolio = safeTotalVal + annualSip;

  let totalDeficit = 0;
  const deficits = analyzedAssets.map((asset) => {
    const futureTargetVal = projectedFuturePortfolio * (asset.targetPct / 100);
    const deficit = Math.max(0, futureTargetVal - asset.currentVal);
    totalDeficit += deficit;
    return { asset, deficit };
  });

  const newContributionPlan = analyzedAssets.map((asset) => {
    let suggestedSip = 0;
    if (safeSip > 0) {
      if (totalDeficit > 0) {
        const itemDeficit = deficits.find(d => d.asset.id === asset.id)?.deficit || 0;
        suggestedSip = Math.round((itemDeficit / totalDeficit) * safeSip);
      } else {
        // If aligned, distribute according to target allocation
        suggestedSip = Math.round((asset.targetPct / 100) * safeSip);
      }
    }

    const sipPct = safeSip > 0 ? Math.round((suggestedSip / safeSip) * 1000) / 10 : asset.targetPct;
    asset.sipSuggestedAmount = suggestedSip;
    asset.sipSuggestedPct = sipPct;

    return {
      assetId: asset.id,
      name: asset.name,
      category: asset.category,
      suggestedSipAmount: suggestedSip,
      suggestedSipPct: sipPct,
      color: asset.color
    };
  });

  return {
    totalPortfolioValue: safeTotalVal,
    monthlySip: safeSip,
    thresholdPct: safeThreshold,
    overallDriftScore,
    alignmentFitScore,
    maxOverweight,
    maxUnderweight,
    assets: analyzedAssets,
    newContributionPlan,
    isFullyAligned
  };
}
