import { calculateInvestmentStrategy } from '../src/services/strategyEngine';
import type { UserProfile } from '../src/types';

console.log('================================================================');
console.log('SMARTVEST MULTI-PERSONA RECOMMENDATION ENGINE AUDIT');
console.log('================================================================');

// Persona 1: Senior Conservative (Age 62, 3Y Horizon, Capital Preservation)
const p1: UserProfile = {
  id: 'u1',
  name: 'Rajesh Sharma',
  age: 62,
  monthlyIncome: 120000,
  salaryIncome: 120000,
  monthlyExpenses: 60000,
  emergencyFund: 400000,
  existingSavings: 400000,
  riskTolerance: 'Conservative',
  investmentHorizon: '3 to 5 years',
  financialGoal: 'Capital Preservation & Retirement',
  onboardingCompleted: true
} as any;

// Persona 2: Mid-Career Homebuyer (Age 32, 4Y Horizon, House Purchase)
const p2: UserProfile = {
  id: 'u2',
  name: 'Sneha Kulkarni',
  age: 32,
  monthlyIncome: 180000,
  salaryIncome: 180000,
  monthlyExpenses: 80000,
  emergencyFund: 250000,
  existingSavings: 250000,
  riskTolerance: 'Moderate',
  investmentHorizon: '3 to 5 years',
  financialGoal: 'House Purchase Down Payment',
  onboardingCompleted: true
} as any;

// Persona 3: Aggressive Young Techie (Age 22, 15+ Y Horizon, Wealth Creation)
const p3: UserProfile = {
  id: 'u3',
  name: 'Vikram Mehta',
  age: 22,
  monthlyIncome: 130000,
  salaryIncome: 130000,
  monthlyExpenses: 40000,
  emergencyFund: 300000,
  existingSavings: 300000,
  riskTolerance: 'Aggressive',
  investmentHorizon: '15+ years',
  financialGoal: 'Aggressive Wealth Creation',
  onboardingCompleted: true
} as any;

[p1, p2, p3].forEach((p, idx) => {
  const strat = calculateInvestmentStrategy(p);
  console.log(`\n------------------------------------------------------------`);
  console.log(`PERSONA ${idx + 1}: ${p.name} (Age ${p.age}, Risk: ${strat.riskProfile}, Goal: "${p.financialGoal}")`);
  console.log(`Monthly Deployment: ₹${strat.recommendedMonthlyInvestment.toLocaleString('en-IN')} | Risk Budget: ${strat.targetRiskBudget}/100`);
  console.log(`Instruments Recommended:`);
  strat.allocations.forEach(a => {
    console.log(`  • [${a.percentage}%] ${a.name} (₹${a.monthlyAmount.toLocaleString('en-IN')}) [${a.category}]`);
    console.log(`    Role: ${a.portfolioRole}`);
    console.log(`    Why: "${a.reasonSelected}"`);
  });
});
