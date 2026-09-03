import { describe, it, expect } from 'vitest';
import { calculateInvestmentStrategy } from '../services/strategyEngine';
import type { UserProfile, ExpenseItem, GoalItem } from '../types';

describe('Financial Strategy & Calculation Engine', () => {
  it('returns default empty mandate when profile is null or uncompleted', () => {
    const strategy = calculateInvestmentStrategy(null);
    expect(strategy.strategyName).toBe('Pending Financial Onboarding');
    expect(strategy.allocations.length).toBe(0);
    expect(strategy.recommendedMonthlyInvestment).toBe(0);
  });

  it('calculates cash flow metrics and surplus accurately for valid profile', () => {
    const profile: UserProfile = {
      email: 'priya@example.com',
      name: 'Priya Sharma',
      age: 28,
      monthlyIncome: 150000,
      salaryIncome: 150000,
      otherIncome: 0,
      monthlyExpenses: 60000,
      emergencyFund: 360000,
      existingSavings: 360000,
      existingInvestments: 200000,
      investmentHorizon: '5 to 10 years',
      riskTolerance: 'Aggressive',
      riskCategory: 'Aggressive',
      financialGoal: 'Wealth Creation',
      onboardingCompleted: true
    };

    const expenses: ExpenseItem[] = [
      { id: '1', category: 'Rent', amount: 35000, date: '2026-09-01', description: 'Monthly Apartment Rent' },
      { id: '2', category: 'Food', amount: 25000, date: '2026-09-01', description: 'Groceries & Dining' }
    ];

    const goals: GoalItem[] = [
      {
        id: 'g1',
        title: 'Financial Independence',
        targetAmount: 20000000,
        currentAmount: 200000,
        targetDate: '2036-12-31',
        category: 'Retirement',
        riskProfile: 'Aggressive',
        monthlySipRequired: 45000,
        probability: 92,
        projectedCorpus: 22000000
      }
    ];

    const strategy = calculateInvestmentStrategy(profile, expenses, goals);

    // 1. Monthly surplus: 150000 - 60000 = 90000
    expect(strategy.monthlySurplus).toBe(90000);

    // 2. Savings rate: (90000 / 150000) * 100 = 60%
    expect(strategy.suitabilityFactors.savingsRate).toBe(60);

    // 3. Emergency fund months: 360000 / 60000 = 6.0 months
    expect(strategy.suitabilityFactors.emergencyFundMonths).toBe(6);
    expect(strategy.suitabilityFactors.emergencyFundAdequacy).toBe('Surplus');

    // 4. Allocations must be present and sum to 100%
    expect(strategy.allocations.length).toBeGreaterThan(0);
    const totalAllocationPct = strategy.allocations.reduce((sum, a) => sum + a.percentage, 0);
    expect(Math.round(totalAllocationPct)).toBe(100);

    // 5. Expected portfolio returns must be positive
    expect(strategy.expectedReturnRange).toBeDefined();
    expect(strategy.allocations[0].expectedCagr).toBeGreaterThan(5);

    // 6. Long term compounding projections must strictly compound over time
    expect(strategy.projections.year5).toBeGreaterThan(0);
    expect(strategy.projections.year10).toBeGreaterThan(strategy.projections.year5);
    expect(strategy.projections.year15).toBeGreaterThan(strategy.projections.year10);
    expect(strategy.projections.year20).toBeGreaterThan(strategy.projections.year15);
  });

  it('adjusts risk category conservatively for older investors near retirement', () => {
    const seniorProfile: UserProfile = {
      email: 'ramesh@example.com',
      name: 'Ramesh Kumar',
      age: 62,
      monthlyIncome: 100000,
      salaryIncome: 100000,
      monthlyExpenses: 50000,
      emergencyFund: 500000,
      existingInvestments: 5000000,
      investmentHorizon: '3 to 5 years',
      riskTolerance: 'Conservative',
      riskCategory: 'Conservative',
      financialGoal: 'Capital Preservation',
      onboardingCompleted: true
    };

    const strategy = calculateInvestmentStrategy(seniorProfile);
    expect(strategy.suitabilityFactors.effectiveRiskCategory).toBe('Conservative');
    expect(strategy.suitabilityFactors.finalAdvisoryRisk).toBe('LOW');
  });
});
