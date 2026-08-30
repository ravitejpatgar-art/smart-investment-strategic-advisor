import { create } from 'zustand';
import type { 
  Currency, 
  UserProfile, 
  ExpenseItem, 
  GoalItem, 
  InvestmentStrategy
} from '../types';
import { calculateInvestmentStrategy } from '../services/strategyEngine';
import { subscribeToAuthState, logoutFirebase, isAuthEnabled, type FirebaseUser } from '../services/firebase';
import { authApi } from '../services/api';

export type ActiveNavTab = 
  | 'landing' 
  | 'auth' 
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
  
  // Auth & User Profile (Single authoritative user profile)
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  token: string | null;
  setUser: (user: UserProfile | null, token?: string) => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  initAuthListener: () => () => void;
  logout: () => Promise<void>;
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

import { userProfileRepo } from '../services/userProfileRepository';

// Load authoritative session data from UserProfileRepository
const storedToken = localStorage.getItem('smartvest_token');
const storedTheme = (localStorage.getItem('smartvest_theme') as 'light' | 'dark') || 'dark';
const initialUser = userProfileRepo.getProfile();
const initialExpenses = userProfileRepo.getExpenses();
const initialGoals = userProfileRepo.getGoals();

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

const authEnabled = isAuthEnabled();

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

  // Auth & Profile
  user: initialUser,
  isAuthenticated: !authEnabled || !!initialUser,
  isAuthLoading: authEnabled,
  token: storedToken || null,
  
  initAuthListener: () => {
    // When Auth is disabled via feature flag, bypass Firebase Auth listener
    if (!isAuthEnabled()) {
      const currentUser = get().user;
      set({
        isAuthenticated: true,
        isAuthLoading: false,
        activeView: currentUser?.onboardingCompleted ? 'dashboard' : 'landing'
      });
      return () => {};
    }

    const unsubscribe = subscribeToAuthState(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        let token = '';
        try {
          token = await firebaseUser.getIdToken();
          localStorage.setItem('smartvest_token', token);
        } catch {
          //
        }

        const userStorageKey = `smartvest_user_${firebaseUser.uid}`;
        const userProfileRaw = localStorage.getItem('smartvest_profile') || localStorage.getItem(userStorageKey) || localStorage.getItem('smartvest_user');
        let profileData: UserProfile;

        if (userProfileRaw) {
          try {
            profileData = JSON.parse(userProfileRaw);
            profileData.id = firebaseUser.uid;
            profileData.email = firebaseUser.email || profileData.email || '';
            if (firebaseUser.displayName && !profileData.name) {
              profileData.name = firebaseUser.displayName;
            }
          } catch {
            profileData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
              onboardingCompleted: false
            };
          }
        } else {
          profileData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
            onboardingCompleted: false
          };
        }

        localStorage.setItem('smartvest_profile', JSON.stringify(profileData));
        localStorage.setItem('smartvest_user', JSON.stringify(profileData));
        localStorage.setItem(userStorageKey, JSON.stringify(profileData));

        const computedStrategy = calculateInvestmentStrategy(profileData, get().expenses, get().goals);
        localStorage.setItem('smartvest_recommendations', JSON.stringify(computedStrategy));
        
        set({
          user: profileData,
          isAuthenticated: true,
          isAuthLoading: false,
          token,
          strategy: computedStrategy,
          activeView: profileData.onboardingCompleted ? 'dashboard' : 'onboarding'
        });
      } else {
        // Unauthenticated or Logged out
        set({
          user: null,
          isAuthenticated: false,
          isAuthLoading: false,
          token: null,
          activeView: get().activeView === 'auth' ? 'auth' : 'landing'
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
      userProfileRepo.clearProfile();
      set({ 
        user: null, 
        isAuthenticated: !isAuthEnabled(), 
        isAuthLoading: false, 
        token: null, 
        activeView: isAuthEnabled() ? 'auth' : 'onboarding' 
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
    const emptyStrategy = calculateInvestmentStrategy(null, [], []);
    set({
      user: null,
      isAuthenticated: !isAuthEnabled(),
      isAuthLoading: false,
      token: null,
      expenses: [],
      goals: [],
      strategy: emptyStrategy,
      activeView: 'onboarding'
    });
  },

  logout: async () => {
    if (isAuthEnabled()) {
      try {
        await logoutFirebase();
      } catch {
        //
      }
    }
    userProfileRepo.clearProfile();
    
    set({ 
      user: null, 
      isAuthenticated: !isAuthEnabled(), 
      isAuthLoading: false, 
      token: null, 
      expenses: [], 
      goals: [], 
      activeView: isAuthEnabled() ? 'auth' : 'onboarding' 
    });
  },

  activeView: initialUser && initialUser.onboardingCompleted ? 'dashboard' : 'landing',
  setActiveView: (view) => set({ activeView: view }),

  isAdvisorOpen: false,
  setAdvisorOpen: (open) => set({ isAdvisorOpen: open }),

  isAnalyzing: false,
  runAiAnalysis: (callback) => {
    set({ isAnalyzing: true, activeView: 'analysis' });
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
    userProfileRepo.saveExpenses(newExpenses);
    const updatedStrategy = calculateInvestmentStrategy(state.user, newExpenses, state.goals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    return { expenses: newExpenses, strategy: updatedStrategy };
  }),
  editExpense: (id, updated) => set((state) => {
    const newExpenses = state.expenses.map((e) => e.id === id ? { ...e, ...updated } : e);
    userProfileRepo.saveExpenses(newExpenses);
    const updatedStrategy = calculateInvestmentStrategy(state.user, newExpenses, state.goals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    return { expenses: newExpenses, strategy: updatedStrategy };
  }),
  deleteExpense: (id) => set((state) => {
    const newExpenses = state.expenses.filter((e) => e.id !== id);
    userProfileRepo.saveExpenses(newExpenses);
    const updatedStrategy = calculateInvestmentStrategy(state.user, newExpenses, state.goals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    return { expenses: newExpenses, strategy: updatedStrategy };
  }),

  // Goals Collection (Real user data only)
  goals: initialGoals,
  addGoal: (goal) => set((state) => {
    const newGoals = [{ ...goal, id: `goal_${Date.now()}` }, ...state.goals];
    userProfileRepo.saveGoals(newGoals);
    const updatedStrategy = calculateInvestmentStrategy(state.user, state.expenses, newGoals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    return { goals: newGoals, strategy: updatedStrategy };
  }),
  editGoal: (id, updated) => set((state) => {
    const newGoals = state.goals.map((g) => g.id === id ? { ...g, ...updated } : g);
    userProfileRepo.saveGoals(newGoals);
    const updatedStrategy = calculateInvestmentStrategy(state.user, state.expenses, newGoals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    return { goals: newGoals, strategy: updatedStrategy };
  }),
  deleteGoal: (id) => set((state) => {
    const newGoals = state.goals.filter((g) => g.id !== id);
    userProfileRepo.saveGoals(newGoals);
    const updatedStrategy = calculateInvestmentStrategy(state.user, state.expenses, newGoals);
    localStorage.setItem('smartvest_recommendations', JSON.stringify(updatedStrategy));
    return { goals: newGoals, strategy: updatedStrategy };
  }),
}));
