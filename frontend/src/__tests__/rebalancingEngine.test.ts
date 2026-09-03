import { describe, it, expect } from 'vitest';
import {
  calculatePortfolioRebalance,
  normalizePercentages,
  type AssetAllocationItem
} from '../services/rebalancingEngine';

describe('P3.2 Portfolio Rebalancing Engine Suite', () => {
  const sampleAssets: AssetAllocationItem[] = [
    { id: 'equity1', name: 'Nifty 50 Index', category: 'Index Mutual Fund', currentPct: 40, targetPct: 30 },
    { id: 'equity2', name: 'Flexi Cap Fund', category: 'Flexi Cap Fund', currentPct: 20, targetPct: 25 },
    { id: 'global', name: 'Nasdaq 100 ETF', category: 'Global ETF', currentPct: 10, targetPct: 20 },
    { id: 'gold', name: 'Gold ETF', category: 'Gold / SGB', currentPct: 15, targetPct: 15 },
    { id: 'debt', name: 'Corporate Debt', category: 'Liquid / Debt', currentPct: 15, targetPct: 10 }
  ];

  // 1. Basic Drift Calculation & Categorization
  it('correctly calculates drift percentage and identifies overweight, underweight, and on-target assets', () => {
    const analysis = calculatePortfolioRebalance(sampleAssets, 1000000, 25000, 2.0);

    expect(analysis).toBeDefined();
    expect(analysis.assets.length).toBe(5);

    const n50 = analysis.assets.find(a => a.id === 'equity1')!;
    expect(n50.driftPct).toBe(10.0); // 40 - 30
    expect(n50.action).toBe('OVERWEIGHT');
    expect(n50.adjustmentAmount).toBeLessThan(0); // Needs trim

    const nasdaq = analysis.assets.find(a => a.id === 'global')!;
    expect(nasdaq.driftPct).toBe(-10.0); // 10 - 20
    expect(nasdaq.action).toBe('UNDERWEIGHT');
    expect(nasdaq.adjustmentAmount).toBeGreaterThan(0); // Needs addition

    const gold = analysis.assets.find(a => a.id === 'gold')!;
    expect(gold.driftPct).toBe(0.0); // 15 - 15
    expect(gold.action).toBe('ON_TARGET');
  });

  // 2. Max Overweight and Max Underweight Identification
  it('identifies the largest overweight and underweight assets accurately', () => {
    const analysis = calculatePortfolioRebalance(sampleAssets, 1000000, 25000, 2.0);

    expect(analysis.maxOverweight).toBeDefined();
    expect(analysis.maxOverweight?.id).toBe('equity1');
    expect(analysis.maxOverweight?.driftPct).toBe(10.0);

    expect(analysis.maxUnderweight).toBeDefined();
    expect(analysis.maxUnderweight?.id).toBe('global');
    expect(analysis.maxUnderweight?.driftPct).toBe(-10.0);
  });

  // 3. Threshold Sensitivity Adjustment
  it('adjusts categorization based on configurable threshold sensitivity', () => {
    const tightAnalysis = calculatePortfolioRebalance(sampleAssets, 1000000, 25000, 1.0);
    const debtTight = tightAnalysis.assets.find(a => a.id === 'debt')!;
    expect(debtTight.action).toBe('OVERWEIGHT'); // 15 - 10 = +5% > 1%

    const wideAnalysis = calculatePortfolioRebalance(sampleAssets, 1000000, 25000, 6.0);
    const debtWide = wideAnalysis.assets.find(a => a.id === 'debt')!;
    expect(debtWide.action).toBe('ON_TARGET'); // 5% < 6% threshold
  });

  // 4. Alignment Fit Score & Fully Aligned Check
  it('calculates alignment fit score and reports perfect alignment when drift is within threshold', () => {
    const alignedAssets: AssetAllocationItem[] = [
      { id: 'a1', name: 'Asset 1', category: 'Equity', currentPct: 50, targetPct: 50 },
      { id: 'a2', name: 'Asset 2', category: 'Debt', currentPct: 50, targetPct: 50 }
    ];

    const res = calculatePortfolioRebalance(alignedAssets, 500000, 10000, 2.0);
    expect(res.isFullyAligned).toBe(true);
    expect(res.overallDriftScore).toBe(0);
    expect(res.alignmentFitScore).toBe(100);
  });

  // 5. New Contribution (SIP) Rebalancing Plan
  it('allocates new monthly SIP inflows proportionally to underweighted assets without selling', () => {
    const analysis = calculatePortfolioRebalance(sampleAssets, 1000000, 30000, 2.0);

    expect(analysis.newContributionPlan.length).toBe(5);

    const nasdaqPlan = analysis.newContributionPlan.find(p => p.assetId === 'global')!;
    const n50Plan = analysis.newContributionPlan.find(p => p.assetId === 'equity1')!;

    // Underweighted assets (Nasdaq, Flexi) should receive majority of new SIP
    expect(nasdaqPlan.suggestedSipAmount).toBeGreaterThan(0);
    expect(nasdaqPlan.suggestedSipAmount).toBeGreaterThan(n50Plan.suggestedSipAmount);

    const totalAllocatedSip = analysis.newContributionPlan.reduce((sum, p) => sum + p.suggestedSipAmount, 0);
    expect(totalAllocatedSip).toBeLessThanOrEqual(30005); // within rounding
  });

  // 6. Target Allocations Immutability
  it('preserves target allocation percentages strictly unchanged during rebalance analysis', () => {
    const originalTarget = sampleAssets[0].targetPct;
    const analysis = calculatePortfolioRebalance(sampleAssets, 1000000, 25000);

    expect(analysis.assets[0].targetPct).toBe(originalTarget);
    expect(sampleAssets[0].targetPct).toBe(originalTarget);
  });

  // 7. Edge Cases: Empty array, zero portfolio, zero SIP
  it('handles edge cases gracefully without throwing or returning NaN', () => {
    const emptyRes = calculatePortfolioRebalance([]);
    expect(emptyRes.assets.length).toBe(0);
    expect(emptyRes.overallDriftScore).toBe(0);
    expect(emptyRes.alignmentFitScore).toBe(100);

    const zeroValRes = calculatePortfolioRebalance(sampleAssets, 0, 0);
    expect(zeroValRes.totalPortfolioValue).toBe(0);
    expect(zeroValRes.monthlySip).toBe(0);
    expect(zeroValRes.assets[0].adjustmentAmount).toBe(0);
  });

  // 8. Percentage normalization helper
  it('normalizes percentage arrays accurately to sum to 100%', () => {
    const normalized = normalizePercentages([
      { pct: 33 },
      { pct: 33 },
      { pct: 34 }
    ]);

    const sum = normalized.reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });
});
