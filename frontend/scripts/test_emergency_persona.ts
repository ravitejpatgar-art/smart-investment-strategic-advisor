import { calculateInvestmentStrategy } from '../src/services/strategyEngine';
import type { UserProfile } from '../src/types';

console.log('================================================================');
console.log('SMARTVEST FULL 4-MANDATE DIVERSIFICATION AUDIT');
console.log('================================================================');

// Persona 4: Emergency Fund Builder (Age 28, Emergency Fund Goal, 1Y Horizon)
const pEmergency: UserProfile = {
  id: 'u4',
  name: 'Ananya Deshmukh',
  age: 28,
  monthlyIncome: 100000,
  salaryIncome: 100000,
  monthlyExpenses: 50000,
  emergencyFund: 50000,
  existingSavings: 50000,
  riskTolerance: 'Conservative',
  investmentHorizon: 'Less than 3 years',
  financialGoal: 'Emergency Fund Runway',
  onboardingCompleted: true
} as any;

const strat4 = calculateInvestmentStrategy(pEmergency);
console.log(`\nPERSONA 4: Emergency Fund Builder (Goal: "${pEmergency.financialGoal}")`);
console.log(`Monthly Deployment: ₹${strat4.recommendedMonthlyInvestment.toLocaleString('en-IN')}`);
strat4.allocations.forEach(a => {
  console.log(`  • [${a.percentage}%] ${a.name} (₹${a.monthlyAmount.toLocaleString('en-IN')})`);
  console.log(`    Role: ${a.portfolioRole}`);
});
