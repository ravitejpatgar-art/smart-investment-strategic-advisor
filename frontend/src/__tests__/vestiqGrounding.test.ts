import { describe, it, expect } from 'vitest';
import {
  buildGroundedContext,
  generateGroundedOfflineResponse,
  parseAssistantApiResponse
} from '../services/vestiqGrounding';
import { calculateInvestmentStrategy } from '../services/strategyEngine';
import type { UserProfile, ExpenseItem, GoalItem } from '../types';

describe('VestIQ Financial Grounding Engine (P1.1)', () => {
  const mockProfile: UserProfile = {
    id: 'user_priya_101',
    email: 'priya.sharma@example.com',
    name: 'Priya Sharma',
    age: 29,
    occupation: 'Software Engineer',
    monthlyIncome: 180000,
    salaryIncome: 180000,
    otherIncome: 0,
    monthlyExpenses: 70000,
    emergencyFund: 420000,
    existingSavings: 420000,
    existingInvestments: 500000,
    investmentHorizon: '5 to 10 years',
    investmentExperience: 'Intermediate',
    riskTolerance: 'Aggressive',
    riskCategory: 'Aggressive',
    financialGoal: 'Wealth Creation',
    onboardingCompleted: true
  };

  const mockExpenses: ExpenseItem[] = [
    { id: 'e1', category: 'Rent', amount: 40000, date: '2026-09-01', description: 'Apartment' },
    { id: 'e2', category: 'Food', amount: 30000, date: '2026-09-01', description: 'Groceries' }
  ];

  const mockGoals: GoalItem[] = [
    {
      id: 'g1',
      title: 'Early Retirement',
      targetAmount: 25000000,
      currentAmount: 500000,
      targetDate: '2038-12-31',
      category: 'Retirement',
      riskProfile: 'Aggressive',
      monthlySipRequired: 55000,
      probability: 90,
      projectedCorpus: 27000000
    }
  ];

  const mockStrategy = calculateInvestmentStrategy(mockProfile, mockExpenses, mockGoals);

  it('1. builds context with authoritative user profile values', () => {
    const ctx = buildGroundedContext(mockProfile, mockExpenses, mockGoals, mockStrategy);
    expect(ctx.profile.userId).toBe('user_priya_101');
    expect(ctx.profile.name).toBe('Priya Sharma');
    expect(ctx.profile.age).toBe(29);
    expect(ctx.profile.occupation).toBe('Software Engineer');
    expect(ctx.profile.onboardingCompleted).toBe(true);
    expect(ctx.risk.riskTolerance).toBe('Aggressive');
  });

  it('2. accurately grounds cash flow, surplus, and emergency runway', () => {
    const ctx = buildGroundedContext(mockProfile, mockExpenses, mockGoals, mockStrategy);
    expect(ctx.cashFlow.monthlyIncome).toBe(180000);
    expect(ctx.cashFlow.monthlyExpenses).toBe(70000);
    expect(ctx.cashFlow.monthlySurplus).toBe(110000);
    expect(ctx.cashFlow.investableSurplus).toBe(110000);
    expect(ctx.cashFlow.savingsRate).toBe(61);
    expect(ctx.cashFlow.emergencyFund).toBe(420000);
    expect(ctx.cashFlow.emergencyFundMonths).toBe(6.0);
    expect(ctx.cashFlow.emergencyFundStatus).toBe('Surplus');
  });

  it('3. grounds active goals and SIP contribution amounts without distortion', () => {
    const ctx = buildGroundedContext(mockProfile, mockExpenses, mockGoals, mockStrategy);
    expect(ctx.goals.length).toBe(1);
    expect(ctx.goals[0].title).toBe('Early Retirement');
    expect(ctx.goals[0].targetAmount).toBe(25000000);
    expect(ctx.goals[0].monthlySipRequired).toBe(55000);
  });

  it('4. does not invent missing values for guest / unonboarded users', () => {
    const ctx = buildGroundedContext(null, [], [], null);
    expect(ctx.profile.userId).toBeNull();
    expect(ctx.profile.onboardingCompleted).toBe(false);
    expect(ctx.cashFlow.monthlyIncome).toBe(0);
    expect(ctx.cashFlow.monthlyExpenses).toBe(0);
    expect(ctx.cashFlow.investableSurplus).toBe(0);
    expect(ctx.goals.length).toBe(0);
    expect(ctx.strategy).toBeUndefined();
  });

  it('5. embeds anti-hallucination ground rules and explicit prohibitions', () => {
    const ctx = buildGroundedContext(mockProfile, mockExpenses, mockGoals, mockStrategy);
    expect(ctx.groundingRules.prohibitions.length).toBeGreaterThan(0);
    expect(ctx.groundingRules.prohibitions.some(p => p.includes('DO NOT invent portfolio holdings'))).toBe(true);
    expect(ctx.groundingRules.hasCompletedOnboarding).toBe(true);
    expect(ctx.groundingRules.hasActiveGoals).toBe(true);
  });

  it('6. isolates user sessions preventing cross-user data leakage', () => {
    const userAContext = buildGroundedContext(mockProfile, mockExpenses, mockGoals, mockStrategy);

    const userBProfile: UserProfile = {
      email: 'rohit@example.com',
      id: 'user_rohit_202',
      name: 'Rohit Verma',
      age: 45,
      monthlyIncome: 80000,
      salaryIncome: 80000,
      monthlyExpenses: 50000,
      emergencyFund: 100000,
      riskTolerance: 'Conservative',
      riskCategory: 'Conservative',
      financialGoal: 'Capital Preservation',
      onboardingCompleted: true
    };
    const userBContext = buildGroundedContext(userBProfile, [], [], null);

    expect(userBContext.profile.userId).toBe('user_rohit_202');
    expect(userBContext.profile.name).toBe('Rohit Verma');
    expect(userBContext.cashFlow.monthlyIncome).toBe(80000);
    expect(userBContext.goals.length).toBe(0); // must not contain userA's goals
    expect(userBContext.profile.name).not.toBe(userAContext.profile.name);
  });

  it('7. generates grounded offline response for surplus and investable capacity', () => {
    const ctx = buildGroundedContext(mockProfile, mockExpenses, mockGoals, mockStrategy);
    const res = generateGroundedOfflineResponse('How much can I invest each month?', ctx);

    expect(res.text).toContain('₹1,10,000');
    expect(res.text).toContain('61%');
    expect(res.intent).toBe('SURPLUS_ALLOCATION');
    expect(res.calculations?.investableSurplus).toBe(110000);
  });

  it('8. generates grounded offline response for emergency runway', () => {
    const ctx = buildGroundedContext(mockProfile, mockExpenses, mockGoals, mockStrategy);
    const res = generateGroundedOfflineResponse('How much emergency runway do I have?', ctx);

    expect(res.text).toContain('6 Months');
    expect(res.text).toContain('₹4,20,000');
    expect(res.intent).toBe('EMERGENCY_FUND');
  });

  it('9. explicitly acknowledges when queried about unconfigured assets (crypto, property)', () => {
    const ctx = buildGroundedContext(mockProfile, mockExpenses, mockGoals, mockStrategy);
    const res = generateGroundedOfflineResponse('What are my crypto and bitcoin holdings?', ctx);

    expect(res.text).toContain('I do not see any records');
    expect(res.text).toContain('crypto and bitcoin holdings');
  });

  it('10. grounds fiduciary risk mandate and allocation blueprint accurately', () => {
    const ctx = buildGroundedContext(mockProfile, mockExpenses, mockGoals, mockStrategy);
    const res = generateGroundedOfflineResponse('What is my asset allocation blueprint?', ctx);

    expect(res.text).toContain('Strategic Multi-Asset Allocation');
    expect(res.text).toContain('Expected Return:');
    expect(res.intent).toBe('ALLOCATION_ADVICE');
  });

  it('11. does not fabricate live stock prices or PE ratios when offline', () => {
    const ctx = buildGroundedContext(mockProfile, mockExpenses, mockGoals, mockStrategy);
    const res = generateGroundedOfflineResponse('What is the stock price and PE ratio of NVDA?', ctx);

    expect(res.text).toContain('Live Market Data Notice');
    expect(res.text).toContain('does not fabricate or estimate real-time market statistics');
    expect(res.intent).toBe('MARKET_DATA_UNAVAILABLE');
  });

  it('12. parseAssistantApiResponse extracts reply, calculations, and follow_up_suggestions losslessly', () => {
    // Schema with reply, calculations, and snake_case follow_up_suggestions
    const apiResponse1 = {
      reply: 'Based on your ₹1,10,000 monthly surplus, allocating 60% to Index Mutual Funds optimizes compounding.',
      calculations: {
        type: 'surplus',
        monthlyIncome: 180000,
        monthlyExpenses: 70000,
        investableSurplus: 110000,
        savingsRate: 61
      },
      follow_up_suggestions: ['How do I automate this SIP?', 'What is my emergency runway?'],
      intent: 'SURPLUS_ADVICE'
    };

    const parsed1 = parseAssistantApiResponse(apiResponse1, 'How should I invest?');
    expect(parsed1.text).toBe(apiResponse1.reply);
    expect(parsed1.calculations?.investableSurplus).toBe(110000);
    expect(parsed1.calculations?.savingsRate).toBe(61);
    expect(parsed1.followUps).toEqual(['How do I automate this SIP?', 'What is my emergency runway?']);
    expect(parsed1.intent).toBe('SURPLUS_ADVICE');

    // Schema with response or message
    const apiResponse2 = {
      response: 'Your emergency fund covers 6.0 months of living expenses.',
      suggested_questions: ['Where should I park my emergency fund?']
    };
    const parsed2 = parseAssistantApiResponse(apiResponse2, 'Emergency fund?');
    expect(parsed2.text).toBe(apiResponse2.response);
    expect(parsed2.followUps).toEqual(['Where should I park my emergency fund?']);

    // Plain string response
    const parsed3 = parseAssistantApiResponse('Direct stock investing carries higher volatility than index funds.');
    expect(parsed3.text).toBe('Direct stock investing carries higher volatility than index funds.');

    // OpenAI choices envelope
    const apiResponse4 = {
      choices: [{ message: { role: 'assistant', content: 'Here is your fiduciary analysis.' } }]
    };
    const parsed4 = parseAssistantApiResponse(apiResponse4);
    expect(parsed4.text).toBe('Here is your fiduciary analysis.');

    // Honest reporting when provider returns unavailable status
    const apiResponse5 = {
      status: 'unavailable',
      message: 'Market data provider connection timeout.'
    };
    const parsed5 = parseAssistantApiResponse(apiResponse5);
    expect(parsed5.text).toBe('Market data provider connection timeout.');
  });
});
