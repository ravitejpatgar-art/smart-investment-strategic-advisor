import { create } from 'zustand';
import type { 
  Currency, 
  UserProfile, 
  ExpenseItem, 
  GoalItem, 
  InvestmentStrategy
} from '../types';
import { calculateInvestmentStrategy } from '../services/strategyEngine';
import { authApi } from '../services/api';
import { userProfileRepo } from '../services/userProfileRepository';
import { subscribeToAuthState, isAuthEnabled } from '../services/firebase';
import { auditLogger } from '../services/auditLogger';

export type ActiveNavTab = 
  | 'landing' 
  | 'onboarding' 
  | 'analysis' 
  | 'dashboard' 
  | 'market'
  | 'expenses' 
  | 'goals' 
  | 'recommendations' 
  | 'advisor' 
  | 'ai'
  | 'vestiq'
  | 'profile';

interface FintechState {
  currency: Currency;
  currencySymbol: string;
  currencyRate: number;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
  
  // User Profile
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  token: string | null;
  setUser: (user: UserProfile | null, token?: string) => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  initAuthListener: () => () => void;
  resetProfile: () => void;
  
  // Navigation
  activeView: ActiveNavTab;
  setActiveView: (view: ActiveNavTab) => void;

  // AI Advisor Modal State
  isAdvisorOpen: boolean;
  setAdvisorOpen: (open: boolean) => void;

  // AI Analysis Animation State
  isAnalyzing: boolean;
  runAiAnalysis: (callback?: () => void) => void;

  // Investment Strategy Engine (dynamically computed from real user profile)
  strategy: InvestmentStrategy;

  // Data Collections (Real user data only)
  expenses: ExpenseItem[];
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  editExpense: (id: string, updated: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;

  goals: GoalItem[];
  addGoal: (goal: Omit<GoalItem, 'id'>) => void;
  editGoal: (id: string, updated: Partial<GoalItem>) => void;
  deleteGoal: (id: string) => void;
}

// Load authoritative session data from UserProfileRepository
const authActive = isAuthEnabled();
const storedToken = localStorage.getItem('smartvest_token');
// Clean up any legacy theme keys
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try {
    localStorage.removeItem('smartvest_theme');
    localStorage.removeItem('smartvest_theme_v2');
  } catch {
    // Ignore
  }
}

const initialUser = authActive ? null : userProfileRepo.getProfile();
const initialExpenses = authActive ? [] : userProfileRepo.getExpenses();
const initialGoals = authActive ? [] : userProfileRepo.getGoals();

const initialStrategy = calculateInvestmentStrategy(initialUser, initialExpenses, initialGoals);
if (initialUser && initialUser.onboardingCompleted) {
  try {
    localStorage.setItem('smartvest_recommendations', JSON.stringify(initialStrategy));
  } catch {
    //
  }
}

export const useFintechStore = create<FintechState>((set, get) => ({

  currency: 'INR',
  currencySymbol: '₹',
  currencyRate: 86.5,
  setCurrency: (currency: Currency) => set({
    currency,
    currencySymbol: currency === 'INR' ? '₹' : '$'
  }),
  formatCurrency: (amount: number) => {
    const { currency, currencySymbol, currencyRate } = get();
    const finalAmount = currency === 'USD' ? amount / currencyRate : amount;
    
    if (currency === 'INR') {
      if (Math.abs(finalAmount) >= 10000000) {
        return `${currencySymbol}${(finalAmount / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(finalAmount) >= 100000) {
        return `${currencySymbol}${(finalAmount / 100000).toFixed(2)} L`;
      }
      return `${currencySymbol}${finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    } else {
      if (Math.abs(finalAmount) >= 1000000) {
        return `${currencySymbol}${(finalAmount / 1000000).toFixed(2)}M`;
      }
      if (Math.abs(finalAmount) >= 1000) {
        return `${currencySymbol}${(finalAmount / 1000).toFixed(1)}k`;
      }
      return `${currencySymbol}${finalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
  },

  // Auth state synced with Firebase
  user: initialUser,
  isAuthenticated: !isAuthEnabled(),
  isAuthLoading: isAuthEnabled(),
  token: storedToken || null,
  
  initAuthListener: () => {
    if (!isAuthEnabled()) {
      set({ isAuthLoading: false, isAuthenticated: true });
      return () => {};
    }

    set({ isAuthLoading: true });
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      if (firebaseUser) {
        let userObj: UserProfile;
        const savedProf = userProfileRepo.getProfile(firebaseUser.uid);

        if (savedProf) {
          userObj = { ...savedProf, id: firebaseUser.uid, email: firebaseUser.email || savedProf.email || '' };
        } else {
          const draft = userProfileRepo.getOnboardingDraft(firebaseUser.uid);
          userObj = {
            id: firebaseUser.uid,
            name: draft?.fullName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
            email: firebaseUser.email || '',
            age: draft?.age ? Number(draft.age) : undefined,
            occupation: draft?.occupation || undefined,
            salaryIncome: draft?.monthlySalary ? Number(draft.monthlySalary) : undefined,
            otherIncome: draft?.otherIncome ? Number(draft.otherIncome) : undefined,
            emergencyFund: draft?.emergencyFund ? Number(draft.emergencyFund) : undefined,
            existingSavings: draft?.savingsBalance ? Number(draft.savingsBalance) : undefined,
            existingInvestments: draft?.existingInvestments ? Number(draft.existingInvestments) : undefined,
            onboardingCompleted: false,
            riskTolerance: 'Moderate',
            investmentHorizon: draft?.investmentHorizon || '5 to 10 years',
            investmentExperience: 'Intermediate'
          };
        }

        const loadedExpenses = userProfileRepo.getExpenses(firebaseUser.uid);
        const loadedGoals = userProfileRepo.getGoals(firebaseUser.uid);
        const computedStrategy = calculateInvestmentStrategy(userObj, loadedExpenses, loadedGoals);
        const currentView = get().activeView;
        let routeView: ActiveNavTab = userObj.onboardingCompleted ? 'dashboard' : 'onboarding';
        try {
          const path = window.location.pathname.toLowerCase();
          const hash = window.location.hash.toLowerCase();
          if (path === '/ai' || path === '/vestiq' || path.startsWith('/vestiq/') || path.startsWith('/ai/') || hash === '#ai' || hash === '#vestiq') {
            routeView = 'ai';
          } else if (path === '/recommendations' || hash === '#recommendations') {
            routeView = 'recommendations';
          } else if (path === '/market' || hash === '#market') {
            routeView = 'market';
          } else if (path === '/goals' || hash === '#goals') {
            routeView = 'goals';
          } else if (path === '/expenses' || path === '/expense-tracker' || hash === '#expenses' || hash === '#expense-tracker') {
            routeView = 'expenses';
          } else if (path === '/profile' || hash === '#profile') {
            routeView = 'profile';
          } else if (currentView !== 'landing' && currentView !== 'onboarding') {
            routeView = currentView;
          }
        } catch {
          if (currentView !== 'landing' && currentView !== 'onboarding') {
            routeView = currentView;
          }
        }

        set({
          user: userObj,
          expenses: loadedExpenses,
          goals: loadedGoals,
          isAuthenticated: true,
          isAuthLoading: false,
          strategy: computedStrategy,
          activeView: routeView
        });
      } else {
        localStorage.removeItem('smartvest_token');
        const emptyStrategy = calculateInvestmentStrategy(null, [], []);
        set({
          user: null,
          expenses: [],
          goals: [],
          isAuthenticated: false,
          isAuthLoading: false,
          token: null,
          strategy: emptyStrategy,
          activeView: 'landing'
        });
      }
    });

    return unsubscribe;
  },

  setUser: (user, token) => {
    if (user) {
      userProfileRepo.saveProfile(user);
      if (token) localStorage.setItem('smartvest_token', token);
      const computedStrategy = calculateInvestmentStrategy(user, get().expenses, get().goals);
      localStorage.setItem('smartvest_recommendations', JSON.stringify(computedStrategy));
      auditLogger.profile(user.onboardingCompleted ? 'ONBOARDING_COMPLETED' : 'PROFILE_SAVED', 'success');
      set({ 
        user, 
        isAuthenticated: true, 
        isAuthLoading: false, 
        token: token || get().token,
        strategy: computedStrategy,
        activeView: user.onboardingCompleted ? 'dashboard' : 'onboarding'
      });
    } else {
      localStorage.removeItem('smartvest_token');
      set({ 
        user: null, 
        isAuthenticated: !isAuthEnabled(), 
        isAuthLoading: false, 
        token: null, 
        activeView: 'landing' 
      });
    }
  },

  updateUserProfile: async (data) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...data };
    userProfileRepo.saveProfile(updatedUser);
    const computedStrategy = calculateInvestmentStrategy(updatedUser, get().expenses, get().goals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(computedStrategy));
    auditLogger.profile('PROFILE_UPDATED', 'success');
    
    set({
      user: updatedUser,
      strategy: computedStrategy
    });

    const token = localStorage.getItem('smartvest_token');
    if (token) {
      try {
        await authApi.updateProfile({
          full_name: updatedUser.name,
          age: updatedUser.age,
          occupation: updatedUser.occupation,
          monthly_income: updatedUser.salaryIncome || updatedUser.monthlyIncome,
          monthly_expenses: updatedUser.monthlyExpenses,
          existing_savings: updatedUser.emergencyFund || updatedUser.existingSavings,
          existing_investments: updatedUser.existingInvestments,
          financial_goal: updatedUser.financialGoal,
          investment_horizon: updatedUser.investmentHorizon,
          investment_experience: updatedUser.investmentExperience,
          risk_tolerance: updatedUser.riskTolerance,
          risk_score: updatedUser.riskScore,
        });
      } catch (err) {
        console.warn('Backend profile sync note:', err);
      }
    }
  },

  resetProfile: () => {
    userProfileRepo.clearProfile();
    localStorage.removeItem('smartvest_token');
    const emptyStrategy = calculateInvestmentStrategy(null, [], []);
    set({
      user: null,
      isAuthenticated: !isAuthEnabled(),
      isAuthLoading: false,
      token: null,
      expenses: [],
      goals: [],
      strategy: emptyStrategy,
      activeView: 'landing'
    });
  },

  activeView: (() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/ai' || path === '/vestiq' || path.startsWith('/vestiq/') || path.startsWith('/ai/') || hash === '#ai' || hash === '#vestiq') {
        return 'ai';
      }
      if (path === '/recommendations' || hash === '#recommendations') {
        return 'recommendations';
      }
      if (path === '/market' || hash === '#market') {
        return 'market';
      }
      if (path === '/goals' || hash === '#goals') {
        return 'goals';
      }
      if (path === '/expenses' || path === '/expense-tracker' || hash === '#expenses' || hash === '#expense-tracker') {
        return 'expenses';
      }
      if (path === '/profile' || hash === '#profile') {
        return 'profile';
      }
      if (path === '/dashboard' || hash === '#dashboard') {
        return 'dashboard';
      }
    } catch {}
    return !authActive && initialUser && initialUser.onboardingCompleted ? 'dashboard' : 'landing';
  })(),
  setActiveView: (view) => set({ activeView: view }),

  isAdvisorOpen: false,
  setAdvisorOpen: (open) => set({ isAdvisorOpen: open }),

  isAnalyzing: false,
  runAiAnalysis: (callback) => {
    const updatedStrategy = calculateInvestmentStrategy(get().user, get().expenses, get().goals);
    try {
      localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    } catch {
      //
    }
    auditLogger.financialPlanning('STRATEGY_ANALYSIS_REQUESTED', 'info');
    set({ isAnalyzing: true, strategy: updatedStrategy, activeView: 'analysis' });
    setTimeout(() => {
      set({ isAnalyzing: false, activeView: 'dashboard' });
      if (callback) callback();
    }, 3800);
  },

  strategy: initialStrategy,

  // Expenses Collection (Real user data only)
  expenses: initialExpenses,
  addExpense: (expense) => set((state) => {
    const newExpenses = [{ ...expense, id: `exp_${Date.now()}` }, ...state.expenses];
    userProfileRepo.saveExpenses(newExpenses, state.user?.id);
    const updatedStrategy = calculateInvestmentStrategy(state.user, newExpenses, state.goals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    auditLogger.financialPlanning('EXPENSE_CREATED', 'success', { category: expense.category });
    return { expenses: newExpenses, strategy: updatedStrategy };
  }),
  editExpense: (id, updated) => set((state) => {
    const newExpenses = state.expenses.map((e) => e.id === id ? { ...e, ...updated } : e);
    userProfileRepo.saveExpenses(newExpenses, state.user?.id);
    const updatedStrategy = calculateInvestmentStrategy(state.user, newExpenses, state.goals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    auditLogger.financialPlanning('EXPENSE_UPDATED', 'success', { expenseId: id });
    return { expenses: newExpenses, strategy: updatedStrategy };
  }),
  deleteExpense: (id) => set((state) => {
    const newExpenses = state.expenses.filter((e) => e.id !== id);
    userProfileRepo.saveExpenses(newExpenses, state.user?.id);
    const updatedStrategy = calculateInvestmentStrategy(state.user, newExpenses, state.goals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    auditLogger.financialPlanning('EXPENSE_DELETED', 'info', { expenseId: id });
    return { expenses: newExpenses, strategy: updatedStrategy };
  }),

  // Goals Collection (Real user data only)
  goals: initialGoals,
  addGoal: (goal) => set((state) => {
    const newGoals = [{ ...goal, id: `goal_${Date.now()}` }, ...state.goals];
    userProfileRepo.saveGoals(newGoals, state.user?.id);
    const updatedStrategy = calculateInvestmentStrategy(state.user, state.expenses, newGoals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    auditLogger.financialPlanning('GOAL_CREATED', 'success', { category: goal.category });
    return { goals: newGoals, strategy: updatedStrategy };
  }),
  editGoal: (id, updated) => set((state) => {
    const newGoals = state.goals.map((g) => g.id === id ? { ...g, ...updated } : g);
    userProfileRepo.saveGoals(newGoals, state.user?.id);
    const updatedStrategy = calculateInvestmentStrategy(state.user, state.expenses, newGoals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    auditLogger.financialPlanning('GOAL_UPDATED', 'success', { goalId: id });
    return { goals: newGoals, strategy: updatedStrategy };
  }),
  deleteGoal: (id) => set((state) => {
    const newGoals = state.goals.filter((g) => g.id !== id);
    userProfileRepo.saveGoals(newGoals, state.user?.id);
    const updatedStrategy = calculateInvestmentStrategy(state.user, state.expenses, newGoals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    auditLogger.financialPlanning('GOAL_DELETED', 'info', { goalId: id });
    return { goals: newGoals, strategy: updatedStrategy };
  }),
}));
