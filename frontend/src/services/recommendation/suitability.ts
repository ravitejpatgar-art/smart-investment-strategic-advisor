import type { RecommendationRequest, SuitabilityProfile } from './types';

/**
 * Evaluates mandatory suitability inputs and calculates deterministic investor dimensions.
 * If mandatory suitability data is missing: returns isSufficient=false.
 * NEVER guesses missing values.
 */
export function evaluateUserSuitability(request: RecommendationRequest): SuitabilityProfile {
  const profile = request.userProfile;
  const missing: string[] = [];

  if (!profile) {
    return {
      isSufficient: false,
      missingFields: ['userProfile', 'financialGoal', 'investmentHorizon', 'riskTolerance', 'monthlyIncomeOrExpenses'],
      effectiveRiskScore: 0,
      effectiveRiskCategory: 'Moderate',
      riskCapacityScore: 0,
      riskToleranceScore: 0,
      horizonYears: 0,
      monthlySurplus: 0,
      emergencyFundMonths: 0,
      emergencyFundAdequate: false,
      liquidityRequirement: 'Moderate',
      primaryGoal: '',
      investmentExperience: 'Beginner'
    };
  }

  // 1. Mandatory Suitability Check
  const financialGoal = request.financialGoal || profile.financialGoal || (profile as any).primaryGoal || (profile.goals && profile.goals[0]);
  if (!financialGoal || typeof financialGoal !== 'string' || !financialGoal.trim()) {
    missing.push('financialGoal');
  }

  const rawHorizon = request.investmentHorizon || profile.investmentHorizon;
  if (!rawHorizon || typeof rawHorizon !== 'string' || !rawHorizon.trim()) {
    missing.push('investmentHorizon');
  }

  const rawRiskTolerance = profile.riskTolerance || profile.riskCategory;
  if (!rawRiskTolerance || typeof rawRiskTolerance !== 'string' || !rawRiskTolerance.trim()) {
    missing.push('riskTolerance');
  }

  const monthlyIncome = Number(profile.salaryIncome) || Number(profile.monthlyIncome) || 0;
  const monthlyExpenses = Number(profile.monthlyExpenses) || 0;
  const explicitInvestable = request.monthlyInvestableAmount;
  
  if (monthlyIncome <= 0 && (!explicitInvestable || explicitInvestable <= 0)) {
    missing.push('monthlyIncome');
  }

  if (missing.length > 0) {
    return {
      isSufficient: false,
      missingFields: missing,
      effectiveRiskScore: 0,
      effectiveRiskCategory: 'Moderate',
      riskCapacityScore: 0,
      riskToleranceScore: 0,
      horizonYears: 0,
      monthlySurplus: 0,
      emergencyFundMonths: 0,
      emergencyFundAdequate: false,
      liquidityRequirement: 'Moderate',
      primaryGoal: financialGoal || '',
      investmentExperience: profile.investmentExperience || 'Beginner'
    };
  }

  // 2. Parse Horizon into numeric years
  let horizonYears = 5;
  const hLower = (rawHorizon || '').toLowerCase();
  if (hLower.includes('less than 1') || hLower.includes('< 1') || hLower.includes('months')) {
    horizonYears = 0.5;
  } else if (hLower.includes('less than 3') || hLower.includes('< 3') || hLower.includes('1 to 2') || hLower.includes('1-2') || hLower.includes('2 year')) {
    horizonYears = 2;
  } else if (hLower.includes('3 to 5') || hLower.includes('3-5') || hLower.includes('4 year')) {
    horizonYears = 4;
  } else if (hLower.includes('5 to 10') || hLower.includes('5-10') || hLower.includes('7 year')) {
    horizonYears = 8;
  } else if (hLower.includes('10+') || hLower.includes('10 to 15') || hLower.includes('15+')) {
    horizonYears = 15;
  } else if (hLower.includes('20+')) {
    horizonYears = 20;
  } else {
    const numMatch = hLower.match(/(\d+)/);
    if (numMatch) {
      horizonYears = Math.max(1, parseInt(numMatch[1], 10));
    }
  }

  // 3. Risk Tolerance Score (0-100)
  const tolLower = (rawRiskTolerance || '').toLowerCase();
  let riskToleranceScore = 50;
  if (tolLower.includes('conservative') || tolLower.includes('low') || tolLower.includes('preservation')) {
    riskToleranceScore = 25;
  } else if (tolLower.includes('aggressive') || tolLower.includes('high') || tolLower.includes('growth')) {
    riskToleranceScore = 80;
  } else {
    riskToleranceScore = 50;
  }

  // 4. Financial Capacity Score (0-100)
  const emergencyFund = Number(profile.emergencyFund) || Number(profile.existingSavings) || 0;
  const emergencyFundMonths = monthlyExpenses > 0 ? Number((emergencyFund / monthlyExpenses).toFixed(1)) : (emergencyFund > 0 ? 6 : 0);
  const emergencyFundAdequate = emergencyFundMonths >= 3;

  const monthlySurplus = explicitInvestable && explicitInvestable > 0 
    ? explicitInvestable 
    : Math.max(0, monthlyIncome - monthlyExpenses);

  const age = Number(profile.age) || 35;
  let ageCapacity = 100 - age; // Younger = higher compounding capacity
  ageCapacity = Math.min(80, Math.max(20, ageCapacity));

  let surplusCapacity = monthlyIncome > 0 ? Math.min(100, Math.round((monthlySurplus / monthlyIncome) * 100 * 2)) : 50;
  let emergencyCapacity = Math.min(100, emergencyFundMonths * 16);

  const riskCapacityScore = Math.round(
    ageCapacity * 0.35 +
    surplusCapacity * 0.35 +
    emergencyCapacity * 0.30
  );

  // Effective Risk is capped by Capacity to protect against catastrophic drawdown
  const effectiveRiskScore = Math.round(
    Math.min(riskToleranceScore, riskCapacityScore + 15) * 0.6 +
    riskCapacityScore * 0.4
  );

  let effectiveRiskCategory: 'Conservative' | 'Moderate' | 'Aggressive' = 'Moderate';
  if (effectiveRiskScore <= 35) {
    effectiveRiskCategory = 'Conservative';
  } else if (effectiveRiskScore >= 65) {
    effectiveRiskCategory = 'Aggressive';
  } else {
    effectiveRiskCategory = 'Moderate';
  }

  // 5. Liquidity Requirement
  let liquidityRequirement: 'High' | 'Moderate' | 'Low' = request.liquidityRequirement || 'Moderate';
  const goalText = (financialGoal || '').toLowerCase();
  if (goalText.includes('emergency') || goalText.includes('liquidity') || horizonYears <= 1 || !emergencyFundAdequate) {
    liquidityRequirement = 'High';
  } else if (horizonYears >= 7 && emergencyFundAdequate) {
    liquidityRequirement = 'Low';
  }

  return {
    isSufficient: true,
    missingFields: [],
    effectiveRiskScore,
    effectiveRiskCategory,
    riskCapacityScore,
    riskToleranceScore,
    horizonYears,
    monthlySurplus,
    emergencyFundMonths,
    emergencyFundAdequate,
    liquidityRequirement,
    primaryGoal: financialGoal || 'Wealth Creation',
    investmentExperience: profile.investmentExperience || 'Beginner'
  };
}
