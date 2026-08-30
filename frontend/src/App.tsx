import React, { useEffect } from 'react';
import { useFintechStore } from './store/useFintechStore';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
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
import { isAuthEnabled } from './services/firebase';
import { TrendingUp } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    activeView, 
    setActiveView,
    initAuthListener, 
    isAuthLoading, 
    isAuthenticated,
    user 
  } = useFintechStore();

  const authEnabled = isAuthEnabled();

  // Initialize Auth listener on app mount & check URL routing
  useEffect(() => {
    const unsubscribe = initAuthListener();
    
    // Check if initial URL pathname / hash is /ai or /vestiq
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
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
      } else if (path === '/market' || hash === '#market') {
        setActiveView('market');
      }
    } catch {
      // Ignore
    }

    return () => unsubscribe();
  }, [initAuthListener, setActiveView]);

  // Initial Auth Loading Screen (Only active when Firebase auth is explicitly enabled)
  if (authEnabled && isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-4 animate-pulse">
          <TrendingUp className="w-7 h-7 text-slate-950 stroke-[2.5]" />
        </div>
        <div className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <span>SmartVest AI</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Advisory
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2 font-mono">Restoring secure Firebase session...</p>
      </div>
    );
  }

  // Views rendered outside Dashboard layout
  if (activeView === 'landing') {
    return <LandingPage />;
  }

  // When auth is disabled, prevent entering / displaying auth page
  if (activeView === 'auth') {
    if (!authEnabled) {
      if (user?.onboardingCompleted) {
        return (
          <DashboardLayout>
            <OverviewDashboard />
          </DashboardLayout>
        );
      }
      return <OnboardingWizard />;
    }
    return <AuthPage />;
  }

  // Protect internal views from unauthenticated access only when auth is enabled
  if (authEnabled && !isAuthenticated) {
    return <AuthPage />;
  }

  if (activeView === 'onboarding') {
    return <OnboardingWizard />;
  }

  if (activeView === 'analysis') {
    return <AIAnalysisEngineView />;
  }

  // Dedicated Full-Page AI Intelligence Workspace (VestIQ by SmartVest)
  if (activeView === 'ai' || activeView === 'vestiq') {
    return <VestiqShell />;
  }

  // Dashboard-scoped views for the 6 core modules
  return (
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
  );
};

export default App;
