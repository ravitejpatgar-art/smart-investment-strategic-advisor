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

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

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
const storedTheme = (localStorage.getItem('smartvest_theme') as 'light' | 'dark') || 'dark';
const initialUser = authActive ? null : userProfileRepo.getProfile();
const initialExpenses = authActive ? [] : userProfileRepo.getExpenses();
const initialGoals = authActive ? [] : userProfileRepo.getGoals();

// Ensure DOM has correct theme class on startup
if (typeof document !== 'undefined') {
  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

const initialStrategy = calculateInvestmentStrategy(initialUser, initialExpenses, initialGoals);
if (initialUser && initialUser.onboardingCompleted) {
  try {
    localStorage.setItem('smartvest_recommendations', JSON.stringify(initialStrategy));
  } catch {
    //
  }
}

export const useFintechStore = create<FintechState>((set, get) => ({
  theme: storedTheme,
  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem('smartvest_theme', theme);
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('smartvest_theme', next);
    if (typeof document !== 'undefined') {
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: next });
  },

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
        set({
          user: userObj,
          expenses: loadedExpenses,
          goals: loadedGoals,
          isAuthenticated: true,
          isAuthLoading: false,
          strategy: computedStrategy,
          activeView: userObj.onboardingCompleted ? 'dashboard' : 'onboarding'
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

  activeView: !authActive && initialUser && initialUser.onboardingCompleted ? 'dashboard' : 'landing',
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
    return { expenses: newExpenses, strategy: updatedStrategy };
  }),
  editExpense: (id, updated) => set((state) => {
    const newExpenses = state.expenses.map((e) => e.id === id ? { ...e, ...updated } : e);
    userProfileRepo.saveExpenses(newExpenses, state.user?.id);
    const updatedStrategy = calculateInvestmentStrategy(state.user, newExpenses, state.goals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    return { expenses: newExpenses, strategy: updatedStrategy };
  }),
  deleteExpense: (id) => set((state) => {
    const newExpenses = state.expenses.filter((e) => e.id !== id);
    userProfileRepo.saveExpenses(newExpenses, state.user?.id);
    const updatedStrategy = calculateInvestmentStrategy(state.user, newExpenses, state.goals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    return { expenses: newExpenses, strategy: updatedStrategy };
  }),

  // Goals Collection (Real user data only)
  goals: initialGoals,
  addGoal: (goal) => set((state) => {
    const newGoals = [{ ...goal, id: `goal_${Date.now()}` }, ...state.goals];
    userProfileRepo.saveGoals(newGoals, state.user?.id);
    const updatedStrategy = calculateInvestmentStrategy(state.user, state.expenses, newGoals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    return { goals: newGoals, strategy: updatedStrategy };
  }),
  editGoal: (id, updated) => set((state) => {
    const newGoals = state.goals.map((g) => g.id === id ? { ...g, ...updated } : g);
    userProfileRepo.saveGoals(newGoals, state.user?.id);
    const updatedStrategy = calculateInvestmentStrategy(state.user, state.expenses, newGoals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    return { goals: newGoals, strategy: updatedStrategy };
  }),
  deleteGoal: (id) => set((state) => {
    const newGoals = state.goals.filter((g) => g.id !== id);
    userProfileRepo.saveGoals(newGoals, state.user?.id);
    const updatedStrategy = calculateInvestmentStrategy(state.user, state.expenses, newGoals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    return { goals: newGoals, strategy: updatedStrategy };
  }),
}));
