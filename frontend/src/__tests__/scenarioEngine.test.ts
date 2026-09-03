import { describe, it, expect } from 'vitest';
import {
  calculateScenarioProjection,
  getDefaultPresets,
  calculateSensitivityMatrix,
  validateScenarioInputs,
  type ScenarioInputs
} from '../services/scenarioEngine';

describe('P3.2 Scenario Analysis Engine Suite', () => {
  const baseInputs: ScenarioInputs = {
    monthlySip: 25000,
    annualReturnPct: 12.0,
    horizonYears: 10,
    annualStepUpPct: 5,
    inflationPct: 6.0,
    initialLumpSum: 0
  };

  // 1. Base scenario compounding
  it('calculates deterministic compound growth for standard base inputs', () => {
    const result = calculateScenarioProjection(baseInputs, 'Base');

    expect(result).toBeDefined();
    expect(result.preset).toBe('Base');
    expect(result.totalContributed).toBeGreaterThan(0);
    expect(result.nominalCorpus).toBeGreaterThan(result.totalContributed);
    expect(result.totalEstimatedGrowth).toBe(result.nominalCorpus - result.totalContributed);
    expect(result.trajectory.length).toBe(11); // Year 0 to 10
  });

  // 2. Ordering: Conservative < Base < Optimistic
  it('guarantees that Conservative < Base < Optimistic projections when assumptions dictate', () => {
    const presets = getDefaultPresets(25000, 10, 12.0, 6.0);
    const con = calculateScenarioProjection(presets.conservative, 'Conservative');
    const base = calculateScenarioProjection(presets.base, 'Base');
    const opt = calculateScenarioProjection(presets.optimistic, 'Optimistic');

    expect(con.nominalCorpus).toBeLessThan(base.nominalCorpus);
    expect(base.nominalCorpus).toBeLessThan(opt.nominalCorpus);
  });

  // 3. Custom SIP changes contribution totals linearly without step-up
  it('accurately calculates contribution totals when varying SIP amounts', () => {
    const res1 = calculateScenarioProjection({ ...baseInputs, monthlySip: 10000, annualStepUpPct: 0 });
    const res2 = calculateScenarioProjection({ ...baseInputs, monthlySip: 20000, annualStepUpPct: 0 });

    expect(res1.totalContributed).toBe(10000 * 12 * 10);
    expect(res2.totalContributed).toBe(20000 * 12 * 10);
    expect(res2.nominalCorpus).toBeGreaterThan(res1.nominalCorpus);
  });

  // 4. Horizon increases compounding exponential growth
  it('accurately projects higher compounding over longer investment horizons', () => {
    const res5Yr = calculateScenarioProjection({ ...baseInputs, horizonYears: 5 });
    const res15Yr = calculateScenarioProjection({ ...baseInputs, horizonYears: 15 });

    expect(res15Yr.nominalCorpus).toBeGreaterThan(res5Yr.nominalCorpus);
    expect(res15Yr.trajectory.length).toBe(16);
    expect(res5Yr.trajectory.length).toBe(6);
  });

  // 5. Return rate sensitivity
  it('increases final corpus as expected return rate increases', () => {
    const res8Pct = calculateScenarioProjection({ ...baseInputs, annualReturnPct: 8.0 });
    const res14Pct = calculateScenarioProjection({ ...baseInputs, annualReturnPct: 14.0 });

    expect(res14Pct.nominalCorpus).toBeGreaterThan(res8Pct.nominalCorpus);
  });

  // 6. Annual SIP Step-Up effect
  it('correctly compounds additional capital when annual SIP step-up is enabled', () => {
    const noStepUp = calculateScenarioProjection({ ...baseInputs, annualStepUpPct: 0 });
    const withStepUp = calculateScenarioProjection({ ...baseInputs, annualStepUpPct: 10 });

    expect(withStepUp.totalContributed).toBeGreaterThan(noStepUp.totalContributed);
    expect(withStepUp.nominalCorpus).toBeGreaterThan(noStepUp.nominalCorpus);
  });

  // 7. Inflation Discounting for Real Purchasing Power
  it('discounts nominal corpus into real purchasing power under positive inflation', () => {
    const res = calculateScenarioProjection(baseInputs);

    expect(res.realCorpus).toBeLessThan(res.nominalCorpus);
    expect(res.realCorpus).toBeGreaterThan(0);
  });

  // 8. Zero inflation keeps real equal to nominal
  it('ensures real purchasing power equals nominal corpus when inflation is 0%', () => {
    const res = calculateScenarioProjection({ ...baseInputs, inflationPct: 0 });

    expect(res.realCorpus).toBe(res.nominalCorpus);
  });

  // 9. Input bounds validation and NaN safety
  it('sanitizes invalid/negative/NaN inputs gracefully to safe bounded defaults', () => {
    const sanitized = validateScenarioInputs({
      monthlySip: -5000,
      annualReturnPct: 999,
      horizonYears: -3,
      annualStepUpPct: -10,
      inflationPct: 500
    });

    expect(sanitized.monthlySip).toBe(0);
    expect(sanitized.annualReturnPct).toBe(50); // clamped to 50
    expect(sanitized.horizonYears).toBe(1); // clamped to 1
    expect(sanitized.annualStepUpPct).toBe(0);
    expect(sanitized.inflationPct).toBe(30); // clamped to 30
  });

  // 10. Sensitivity Matrix generation
  it('generates a complete sensitivity matrix across return variations', () => {
    const matrix = calculateSensitivityMatrix(baseInputs, [-4, -2, 0, 2, 4]);

    expect(matrix.length).toBe(5);
    expect(matrix[0].returnPct).toBe(8.0);
    expect(matrix[2].returnPct).toBe(12.0);
    expect(matrix[4].returnPct).toBe(16.0);
    expect(matrix[4].nominalCorpus).toBeGreaterThan(matrix[0].nominalCorpus);
  });
});
