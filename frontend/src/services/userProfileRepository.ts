import type { UserProfile, ExpenseItem, GoalItem, InvestmentStrategy } from '../types';

export interface SmartVestUserContext {
  userId: string | null;
  name: string;
  age: number | null;
  occupation: string | null;

  monthlyIncome: number;
  salaryIncome: number;
  otherIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  investableSurplus: number;
  savingsRate: number;

  emergencyFund: number;
  emergencyTarget: number;
  emergencyCoverageMonths: number;
  emergencyFundMonths: number;
  emergencyFundStatus: 'Inadequate' | 'Moderate' | 'Healthy' | 'Surplus';

  riskTolerance: string;
  riskCapacity: string;
  riskScore: number;
  riskCategory: string;

  investmentHorizon: string;
  investmentExperience: string;

  existingSavings: number;
  existingInvestments: number;
  financialGoal: string;

  goals: Array<{
    title: string;
    targetAmount: number;
    targetDate: string;
    category?: string;
    monthlySipRequired?: number;
  }>;

  portfolio: Array<{
    name: string;
    amount: number;
    category?: string;
  }>;

  preferences: {
    investmentExperience?: string;
    financialGoal?: string;
    currency?: string;
  };

  goalSummary: string;
  portfolioSummary: string;
  onboardingCompleted: boolean;

  strategy?: {
    strategyName?: string;
    riskProfile?: string;
    expectedReturnRange?: string;
    allocations?: Array<{
      name: string;
      percentage: number;
      monthlyAmount: number;
      category?: string;
      riskLevel?: string;
      reasonSelected?: string;
    }>;
  };

  recommendations?: Array<{
    name: string;
    percentage: number;
    monthlyAmount: number;
    category?: string;
    riskLevel?: string;
    reasonSelected?: string;
  }>;
}

export type NormalizedUserContext = SmartVestUserContext;

export interface UserProfileRepository {
  getProfile(): UserProfile | null;
  saveProfile(profile: UserProfile): void;
  clearProfile(): void;
  getExpenses(): ExpenseItem[];
  saveExpenses(expenses: ExpenseItem[]): void;
  getGoals(): GoalItem[];
  saveGoals(goals: GoalItem[]): void;
}

export class LocalUserProfileRepository implements UserProfileRepository {
  private readonly PROFILE_KEY = 'smartvest_profile';
  private readonly EXPENSES_KEY = 'smartvest_expenses';
  private readonly GOALS_KEY = 'smartvest_goals';

  getProfile(): UserProfile | null {
    try {
      const raw = localStorage.getItem(this.PROFILE_KEY) || localStorage.getItem('smartvest_user');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as UserProfile;
      return parsed;
    } catch {
      return null;
    }
  }

  saveProfile(profile: UserProfile): void {
    try {
      const serialized = JSON.stringify(profile);
      localStorage.setItem(this.PROFILE_KEY, serialized);
      localStorage.setItem('smartvest_user', serialized);
      if (profile.id) {
        localStorage.setItem(`smartvest_user_${profile.id}`, serialized);
      }
    } catch (e) {
      console.error('Failed to save user profile to localStorage', e);
    }
  }

  clearProfile(): void {
    try {
      localStorage.removeItem(this.PROFILE_KEY);
      localStorage.removeItem('smartvest_profiles');
      localStorage.removeItem('smartvest_active_profile_id');
      localStorage.removeItem('smartvest_user');
      localStorage.removeItem('smartvest_token');
      localStorage.removeItem(this.EXPENSES_KEY);
      localStorage.removeItem(this.GOALS_KEY);
      localStorage.removeItem('smartvest_recommendations');
      localStorage.removeItem('smartvest_chat_history');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('smartvest_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Failed to clear profile from localStorage', e);
    }
  }

  getExpenses(): ExpenseItem[] {
    try {
      const raw = localStorage.getItem(this.EXPENSES_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as ExpenseItem[];
    } catch {
      return [];
    }
  }

  saveExpenses(expenses: ExpenseItem[]): void {
    try {
      localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses to localStorage', e);
    }
  }

  getGoals(): GoalItem[] {
    try {
      const raw = localStorage.getItem(this.GOALS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as GoalItem[];
    } catch {
      return [];
    }
  }

  saveGoals(goals: GoalItem[]): void {
    try {
      localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals to localStorage', e);
    }
  }
}

// Active singleton repository instance (can swap with FirebaseUserProfileRepository later)
export const userProfileRepo: UserProfileRepository = new LocalUserProfileRepository();

/**
 * Builds a single, authoritative, normalized user context object from active user data.
 * Pure deterministic calculation without hardcoded demo personas or fake fallbacks.
 */
export function buildUserContext(
  user: UserProfile | null,
  expenses: ExpenseItem[] = [],
  goals: GoalItem[] = [],
  strategy?: InvestmentStrategy | null
): NormalizedUserContext {
  const salary = user?.salaryIncome || user?.monthlyIncome || 0;
  const otherInc = user?.otherIncome || 0;
  const totalIncome = salary + otherInc;

  const totalLoggedExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalExpenses = totalLoggedExpenses > 0 ? totalLoggedExpenses : (Number(user?.monthlyExpenses) || 0);

  const monthlySurplus = totalIncome - totalExpenses;
  const investableSurplus = Math.max(0, monthlySurplus);
  const savingsRate = totalIncome > 0 && monthlySurplus > 0 ? Math.round((monthlySurplus / totalIncome) * 100) : 0;

  const emergencyFund = Number(user?.emergencyFund) || Number(user?.existingSavings) || 0;
  const emergencyTarget = totalExpenses * 6;
  const emergencyFundMonths = totalExpenses > 0 ? Number((emergencyFund / totalExpenses).toFixed(1)) : 0;
  const emergencyCoverageMonths = emergencyFundMonths;

  let emergencyFundStatus: 'Inadequate' | 'Moderate' | 'Healthy' | 'Surplus' = 'Inadequate';
  if (emergencyFundMonths >= 6) emergencyFundStatus = 'Surplus';
  else if (emergencyFundMonths >= 3.5) emergencyFundStatus = 'Healthy';
  else if (emergencyFundMonths >= 2) emergencyFundStatus = 'Moderate';

  const riskTolerance = user?.riskTolerance || user?.riskCategory || 'Moderate';
  const riskCapacity = emergencyFundMonths >= 4 && savingsRate >= 25 ? 'High' : (emergencyFundMonths < 2 ? 'Low' : 'Moderate');
  const riskScore = user?.riskScore || 50;

  const mappedGoals = goals.map((g) => ({
    title: g.title,
    targetAmount: g.targetAmount,
    targetDate: g.targetDate,
    category: g.category,
    monthlySipRequired: g.monthlySipRequired
  }));

  const goalSummary = mappedGoals.length > 0
    ? mappedGoals.map((g) => `${g.title} (₹${g.targetAmount.toLocaleString('en-IN')})`).join(', ')
    : (user?.financialGoal || 'No goals registered yet');

  const portfolioSummary = user?.existingInvestments && user.existingInvestments > 0
    ? `Existing Portfolio: ₹${user.existingInvestments.toLocaleString('en-IN')}`
    : 'No external portfolio connected';

  const portfolioList = user?.existingInvestments && user.existingInvestments > 0
    ? [{ name: 'Existing Holdings', amount: user.existingInvestments, category: 'Equity & Debt' }]
    : [];

  const recommendationsList = strategy?.allocations?.map((a) => ({
    name: a.name,
    percentage: a.percentage,
    monthlyAmount: a.monthlyAmount,
    category: a.category,
    riskLevel: a.riskLevel,
    reasonSelected: a.reasonSelected
  })) || [];

  return {
    userId: user?.id || null,
    name: user?.name?.trim() || 'Investor',
    age: user?.age ? Number(user.age) : null,
    occupation: user?.occupation?.trim() || null,
    monthlyIncome: totalIncome,
    salaryIncome: salary,
    otherIncome: otherInc,
    monthlyExpenses: totalExpenses,
    monthlySurplus,
    investableSurplus,
    savingsRate,
    emergencyFund,
    emergencyTarget,
    emergencyCoverageMonths,
    emergencyFundMonths,
    emergencyFundStatus,
    existingSavings: Number(user?.existingSavings) || emergencyFund,
    existingInvestments: Number(user?.existingInvestments) || 0,
    riskTolerance,
    riskCapacity,
    riskCategory: riskTolerance,
    riskScore,
    investmentHorizon: user?.investmentHorizon || 'Not specified',
    investmentExperience: user?.investmentExperience || 'Intermediate',
    financialGoal: user?.financialGoal || (mappedGoals.length > 0 ? mappedGoals[0].title : 'Wealth Building'),
    goals: mappedGoals,
    portfolio: portfolioList,
    preferences: {
      investmentExperience: user?.investmentExperience || 'Intermediate',
      financialGoal: user?.financialGoal || (mappedGoals.length > 0 ? mappedGoals[0].title : 'Wealth Building'),
    },
    goalSummary,
    portfolioSummary,
    onboardingCompleted: Boolean(user?.onboardingCompleted),
    strategy: strategy ? {
      strategyName: strategy.strategyName,
      riskProfile: strategy.riskProfile,
      expectedReturnRange: strategy.expectedReturnRange,
      allocations: strategy.allocations?.map((a) => ({
        name: a.name,
        percentage: a.percentage,
        monthlyAmount: a.monthlyAmount,
        category: a.category,
        riskLevel: a.riskLevel,
        reasonSelected: a.reasonSelected
      })) || []
    } : undefined,
    recommendations: recommendationsList
  };
}

/**
 * Checks whether demo mode is explicitly enabled.
 * Default is FALSE.
 */
export function isDemoModeEnabled(): boolean {
  try {
    return import.meta.env.VITE_DEMO_MODE === 'true';
  } catch {
    return false;
  }
}
