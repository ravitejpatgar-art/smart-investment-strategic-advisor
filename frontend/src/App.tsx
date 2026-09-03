import React, { useEffect } from 'react';
import { useFintechStore } from './store/useFintechStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { AIAnalysisEngineView } from './components/analysis/AIAnalysisEngineView';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { ExpenseTrackerView } from './components/expenses/ExpenseTrackerView';
import { GoalPlannerView } from './components/goals/GoalPlannerView';
import { InvestmentRecommendationsView } from './components/recommendations/InvestmentRecommendationsView';
import { MarketExplorerView } from './components/market/MarketExplorerView';
import { ProfileView } from './components/profile/ProfileView';
import { VestiqShell } from './components/vestiq/VestiqShell';

export const App: React.FC = () => {
  const { 
    activeView, 
    setActiveView,
    initAuthListener
  } = useFintechStore();

  // Initialize Firebase Auth listener on app startup
  useEffect(() => {
    const unsub = initAuthListener();
    return () => unsub();
  }, [initAuthListener]);

  // Check URL routing on mount
  useEffect(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      
      if (path === '/login' || hash === '#login') {
        setActiveView('dashboard');
      } else if (path === '/market' || hash === '#market') {
        setActiveView('market');
      } else if (path === '/recommendations' || hash === '#recommendations') {
        setActiveView('recommendations');
      } else if (path === '/goals' || hash === '#goals') {
        setActiveView('goals');
      } else if (path === '/expense-tracker' || path === '/expenses' || hash === '#expense-tracker' || hash === '#expenses') {
        setActiveView('expenses');
      } else if (path === '/profile' || hash === '#profile') {
        setActiveView('profile');
      } else if (path === '/dashboard' || hash === '#dashboard') {
        setActiveView('dashboard');
      } else if (path === '/onboarding' || hash === '#onboarding') {
        setActiveView('onboarding');
      } else if (
        path === '/ai' || 
        path === '/vestiq' || 
        path.startsWith('/vestiq/') || 
        path.startsWith('/ai/') || 
        hash === '#ai' || 
        hash === '#vestiq' ||
        hash.startsWith('#vestiq/') ||
        hash.startsWith('#ai/')
      ) {
        setActiveView('ai');
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, [setActiveView]);

  // Synchronize browser URL bar with active view
  useEffect(() => {
    try {
      const viewToPath: Record<string, string> = {
        dashboard: '/dashboard',
        market: '/market',
        recommendations: '/recommendations',
        goals: '/goals',
        expenses: '/expenses',
        profile: '/profile',
        ai: '/vestiq',
        vestiq: '/vestiq',
        landing: '/',
        onboarding: '/onboarding',
      };
      const targetPath = viewToPath[activeView];
      if (targetPath && window.location.pathname !== targetPath) {
        window.history.replaceState({}, '', targetPath);
      }
    } catch {
      // Ignore
    }
  }, [activeView]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = window.location.pathname.toLowerCase();
        if (path === '/ai' || path === '/vestiq' || path.startsWith('/vestiq/')) {
          setActiveView('ai');
        } else if (path === '/recommendations') {
          setActiveView('recommendations');
        } else if (path === '/market') {
          setActiveView('market');
        } else if (path === '/goals') {
          setActiveView('goals');
        } else if (path === '/expenses' || path === '/expense-tracker') {
          setActiveView('expenses');
        } else if (path === '/profile') {
          setActiveView('profile');
        } else if (path === '/dashboard') {
          setActiveView('dashboard');
        } else if (path === '/onboarding') {
          setActiveView('onboarding');
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveView]);

  // Views rendered outside Dashboard layout
  if (activeView === 'landing') {
    return <LandingPage />;
  }

  if (activeView === 'onboarding') {
    return (
      <ProtectedRoute>
        <OnboardingWizard />
      </ProtectedRoute>
    );
  }

  if (activeView === 'analysis') {
    return (
      <ProtectedRoute>
        <AIAnalysisEngineView />
      </ProtectedRoute>
    );
  }

  // Dedicated Full-Page AI Intelligence Workspace (VestIQ by SmartVest)
  if (activeView === 'ai' || activeView === 'vestiq') {
    return (
      <ProtectedRoute>
        <VestiqShell />
      </ProtectedRoute>
    );
  }

  // Core Dashboard views (Protected Route enforcement)
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {activeView === 'dashboard' && <OverviewDashboard />}
        {activeView === 'market' && <MarketExplorerView onOpenVestIQWithQuery={() => setActiveView('ai')} />}
        {activeView === 'expenses' && <ExpenseTrackerView />}
        {activeView === 'goals' && <GoalPlannerView />}
        {activeView === 'recommendations' && <InvestmentRecommendationsView />}
        {activeView === 'profile' && <ProfileView />}

        {/* Fallback */}
        {activeView !== 'dashboard' && 
         activeView !== 'market' &&
         activeView !== 'expenses' && 
         activeView !== 'goals' && 
         activeView !== 'recommendations' && 
         activeView !== 'profile' && 
         <OverviewDashboard />}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default App;
