/**
 * SmartVest Scenario Analysis Engine (P3.2)
 * Pure, typed, deterministic analytical engine for multi-scenario wealth projections,
 * annual step-up SIP compounding, inflation-adjusted purchasing power, and return sensitivity.
 *
 * All calculations are analytical & non-predictive. No broker execution.
 */

export type ScenarioPreset = 'Conservative' | 'Base' | 'Optimistic' | 'Custom';

export interface ScenarioInputs {
  monthlySip: number;
  annualReturnPct: number;
  horizonYears: number;
  annualStepUpPct: number;
  inflationPct: number;
  initialLumpSum?: number;
}

export interface ScenarioYearPoint {
  year: number;
  label: string;
  invested: number;
  nominalCorpus: number;
  realCorpus: number;
}

export interface ScenarioResult {
  preset: ScenarioPreset;
  inputs: ScenarioInputs;
  totalContributed: number;
  nominalCorpus: number;
  realCorpus: number;
  totalEstimatedGrowth: number;
  annualEffectiveCagr: number;
  trajectory: ScenarioYearPoint[];
}

export interface SensitivityPoint {
  returnPct: number;
  nominalCorpus: number;
  realCorpus: number;
  totalContributed: number;
}

/**
 * Validates and sanitizes scenario input values against sensible bounds to prevent NaN/Infinity.
 */
export function validateScenarioInputs(inputs: Partial<ScenarioInputs>): ScenarioInputs {
  const rawSip = Number(inputs.monthlySip);
  const rawReturn = Number(inputs.annualReturnPct);
  const rawHorizon = Number(inputs.horizonYears);
  const rawStepUp = Number(inputs.annualStepUpPct);
  const rawInflation = Number(inputs.inflationPct);
  const rawLumpSum = Number(inputs.initialLumpSum);

  const monthlySip = isNaN(rawSip) || rawSip < 0 ? 0 : Math.min(10000000, rawSip);
  const annualReturnPct = isNaN(rawReturn) ? 12.0 : Math.max(-20, Math.min(50, rawReturn));
  const horizonYears = isNaN(rawHorizon) ? 10 : Math.max(1, Math.min(50, Math.round(rawHorizon)));
  const annualStepUpPct = isNaN(rawStepUp) || rawStepUp < 0 ? 0 : Math.min(50, rawStepUp);
  const inflationPct = isNaN(rawInflation) || rawInflation < 0 ? 6.0 : Math.min(30, rawInflation);
  const initialLumpSum = isNaN(rawLumpSum) || rawLumpSum < 0 ? 0 : Math.min(100000000, rawLumpSum);

  return {
    monthlySip,
    annualReturnPct,
    horizonYears,
    annualStepUpPct,
    inflationPct,
    initialLumpSum
  };
}

/**
 * Calculates deterministic compound wealth trajectory with monthly compounding and optional annual step-up.
 */
export function calculateScenarioProjection(
  rawInputs: ScenarioInputs,
  preset: ScenarioPreset = 'Custom'
): ScenarioResult {
  const inputs = validateScenarioInputs(rawInputs);
  const { monthlySip, annualReturnPct, horizonYears, annualStepUpPct, inflationPct, initialLumpSum = 0 } = inputs;

  const monthlyRate = annualReturnPct / 100 / 12;
  const inflationRate = inflationPct / 100;

  let currentCorpus = initialLumpSum;
  let totalInvested = initialLumpSum;
  let currentMonthlySip = monthlySip;

  const trajectory: ScenarioYearPoint[] = [
    {
      year: 0,
      label: 'Start',
      invested: Math.round(totalInvested),
      nominalCorpus: Math.round(currentCorpus),
      realCorpus: Math.round(currentCorpus)
    }
  ];

  for (let year = 1; year <= horizonYears; year++) {
    // Compound over 12 months for current year
    for (let month = 1; month <= 12; month++) {
      currentCorpus = (currentCorpus + currentMonthlySip) * (1 + monthlyRate);
      totalInvested += currentMonthlySip;
    }

    // Inflation discount factor for real purchasing power: (1 + inflation)^year
    const inflationDiscount = Math.pow(1 + inflationRate, year);
    const realCorpusVal = inflationDiscount > 0 ? currentCorpus / inflationDiscount : currentCorpus;

    trajectory.push({
      year,
      label: `Yr ${year}`,
      invested: Math.round(totalInvested),
      nominalCorpus: Math.round(currentCorpus),
      realCorpus: Math.round(realCorpusVal)
    });

    // Apply annual SIP step-up for next year
    if (annualStepUpPct > 0) {
      currentMonthlySip = currentMonthlySip * (1 + annualStepUpPct / 100);
    }
  }

  const finalNominal = Math.round(currentCorpus);
  const finalInvested = Math.round(totalInvested);
  const finalReal = Math.round(currentCorpus / Math.pow(1 + inflationRate, horizonYears));
  const estimatedGrowth = Math.max(0, finalNominal - finalInvested);

  return {
    preset,
    inputs,
    totalContributed: finalInvested,
    nominalCorpus: finalNominal,
    realCorpus: finalReal,
    totalEstimatedGrowth: estimatedGrowth,
    annualEffectiveCagr: annualReturnPct,
    trajectory
  };
}

/**
 * Returns preset assumptions anchored to authoritative strategy numbers.
 */
export function getDefaultPresets(
  baseMonthlySip: number,
  baseHorizonYears: number,
  baseReturnPct: number,
  inflationPct: number = 6.0
): { conservative: ScenarioInputs; base: ScenarioInputs; optimistic: ScenarioInputs } {
  const safeSip = Math.max(0, baseMonthlySip || 25000);
  const safeHorizon = Math.max(1, baseHorizonYears || 10);
  const safeReturn = baseReturnPct > 0 ? baseReturnPct : 12.0;

  return {
    conservative: {
      monthlySip: safeSip,
      annualReturnPct: Math.max(6.0, Math.round((safeReturn - 3.0) * 10) / 10),
      horizonYears: safeHorizon,
      annualStepUpPct: 0,
      inflationPct,
      initialLumpSum: 0
    },
    base: {
      monthlySip: safeSip,
      annualReturnPct: Math.round(safeReturn * 10) / 10,
      horizonYears: safeHorizon,
      annualStepUpPct: 5,
      inflationPct,
      initialLumpSum: 0
    },
    optimistic: {
      monthlySip: safeSip,
      annualReturnPct: Math.min(30.0, Math.round((safeReturn + 3.0) * 10) / 10),
      horizonYears: safeHorizon,
      annualStepUpPct: 10,
      inflationPct,
      initialLumpSum: 0
    }
  };
}

/**
 * Computes a sensitivity matrix over varying return rates (e.g. Base - 4%, Base - 2%, Base, Base + 2%, Base + 4%).
 */
export function calculateSensitivityMatrix(
  baseInputs: ScenarioInputs,
  variations: number[] = [-4, -2, 0, 2, 4]
): SensitivityPoint[] {
  const valid = validateScenarioInputs(baseInputs);
  return variations.map((delta) => {
    const rate = Math.max(1, valid.annualReturnPct + delta);
    const res = calculateScenarioProjection({
      ...valid,
      annualReturnPct: rate
    });
    return {
      returnPct: Math.round(rate * 10) / 10,
      nominalCorpus: res.nominalCorpus,
      realCorpus: res.realCorpus,
      totalContributed: res.totalContributed
    };
  });
}
