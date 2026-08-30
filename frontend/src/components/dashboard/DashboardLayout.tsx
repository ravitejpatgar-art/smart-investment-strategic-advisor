import React, { useState } from 'react';
import { useFintechStore, type ActiveNavTab } from '../../store/useFintechStore';
import { 
  LayoutDashboard, 
  Receipt, 
  Sparkles, 
  Target, 
  User, 
  FileText, 
  RefreshCw,
  TrendingUp,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { AIAssistantDrawer } from '../assistant/AIAssistantDrawer';
import { FloatingAIAssistantButton } from '../assistant/FloatingAIAssistantButton';
import { generateAdvisoryPdfReport } from '../../services/pdfReportGenerator';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { 
    activeView, 
    setActiveView, 
    user, 
    strategy, 
    expenses,
    goals,
    currency, 
    setCurrency, 
    theme,
    toggleTheme,
    isAdvisorOpen, 
    setAdvisorOpen,
    runAiAnalysis
  } = useFintechStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Exact 6 Primary Navigation Areas
  const navItems: { id: ActiveNavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'market', label: 'Market', icon: TrendingUp },
    { id: 'expenses', label: 'Expense Tracker', icon: Receipt },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true);
      generateAdvisoryPdfReport({
        user,
        strategy,
        expenses,
        goals,
        currency,
        currencySymbol: currency === 'USD' ? '$' : '₹'
      });
    } catch {
      // Ignore
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleReanalyze = async () => {
    try {
      setIsReanalyzing(true);
      await runAiAnalysis();
    } finally {
      setIsReanalyzing(false);
    }
  };

  const pageTitleMap: Partial<Record<ActiveNavTab, { title: string; subtitle: string }>> = {
    dashboard: { title: 'Strategic Wealth Overview', subtitle: 'Real-time asset allocation & financial runway analytics' },
    market: { title: 'Global Market Terminal', subtitle: 'Real-time equity quotes, global benchmarks, mutual funds & asset discovery' },
    expenses: { title: 'Expense Tracker & Cashflow', subtitle: 'Track outflows and unlock investable surplus' },
    recommendations: { title: 'Investment Blueprint', subtitle: 'Fiduciary multi-asset portfolio calibrated for compound growth' },
    goals: { title: 'Milestone Goal Planner', subtitle: 'Calculate required SIPs and probability roadmaps' },
    profile: { title: 'Investor Profile & Settings', subtitle: 'Manage financial parameters and risk tolerance' },
    onboarding: { title: 'Investor Onboarding', subtitle: 'Complete your profile to generate your strategy blueprint' }
  };

  const currentMeta = pageTitleMap[activeView] || pageTitleMap.dashboard!;

  return (
    <div className="h-screen bg-[#F6F7FB] text-[#172033] flex overflow-hidden font-sans selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* =========================================================================
          NARROW PERSISTENT LIGHT SIDEBAR (224px Fixed Width)
      ========================================================================= */}
      <aside className="hidden lg:flex w-[224px] flex-col shrink-0 bg-white border-r border-[#E7E9F0] select-none h-full justify-between">
        
        {/* Upper Portion: Logo + Navigation */}
        <div>
          {/* Brand Header */}
          <div className="px-5 py-4 border-b border-[#E7E9F0]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[19px] font-bold text-[#172033] tracking-tight flex items-center gap-1.5 leading-tight">
                  <span>SmartVest</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">AI</span>
                </div>
                <div className="text-[11px] text-[#667085] font-semibold tracking-wider uppercase">
                  STRATEGIC ADVISOR
                </div>
              </div>
            </div>
          </div>

          {/* 5 Navigation Rows */}
          <nav className="p-3 space-y-1">
            <div className="text-[11.5px] font-bold text-[#98A2B3] px-3 py-1.5 uppercase tracking-wider">
              Menu
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14.5px] font-medium transition-colors cursor-pointer group relative ${
                    isActive 
                      ? 'bg-teal-50 text-teal-800 font-semibold border-r-2 border-teal-600' 
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F8F9FC]'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 shrink-0 ${
                    isActive ? 'text-teal-600' : 'text-[#667085]'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* VestIQ Co-pilot Card */}
            <div className="pt-2 px-1">
              <div 
                onClick={() => setActiveView('ai')}
                className="p-3 rounded-xl bg-gradient-to-br from-teal-50/90 to-indigo-50/90 border border-teal-200 hover:border-teal-400 transition-all cursor-pointer group shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[#172033] text-[13px]">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 group-hover:rotate-12 transition-transform" />
                    <span>VestIQ AI</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-600 text-white shadow-2xs">
                    NEW
                  </span>
                </div>
                <p className="text-[11.5px] text-[#667085] leading-tight">
                  Financial research & intelligence workspace
                </p>
                <div className="text-[11.5px] font-bold text-teal-700 flex items-center gap-1 pt-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Launch Workspace</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Portion: Currency Selector & User Profile */}
        <div className="p-3 border-t border-[#E7E9F0] space-y-2.5 bg-[#F8F9FC]">
          {/* Theme & Currency Controls */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] text-[#667085] font-semibold uppercase">Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E7E9F0] text-[12px] font-bold text-[#667085] hover:text-[#172033] shadow-xs cursor-pointer transition-all"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] text-[#667085] font-semibold uppercase">Currency</span>
            <div className="flex bg-white rounded-lg p-0.5 border border-[#E7E9F0] shadow-xs">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-2.5 py-1 rounded text-[12px] font-bold transition-all cursor-pointer ${
                  currency === 'INR' ? 'bg-teal-600 text-white shadow-xs' : 'text-[#667085] hover:text-[#172033]'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded text-[12px] font-bold transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-teal-600 text-white shadow-xs' : 'text-[#667085] hover:text-[#172033]'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          <div 
            onClick={() => setActiveView('profile')}
            className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#E7E9F0] hover:border-teal-400 transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate text-left flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-[#172033] truncate group-hover:text-teal-700 transition-colors">
                {user?.name || 'Investor'}
              </div>
              <div className="text-[11.5px] text-[#667085] truncate">
                {user?.riskTolerance || 'Moderate'} Risk
              </div>
            </div>
          </div>
        </div>

      </aside>

      {/* =========================================================================
          MAIN APPLICATION AREA (Header + Centered Wide Content 1400px)
      ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F6F7FB]">
        
        {/* Top Header */}
        <header className="h-[64px] min-h-[64px] border-b border-[#E7E9F0] bg-white px-5 sm:px-8 flex items-center justify-between shrink-0 z-30 shadow-xs">
          
          {/* Left: Title & Subtitle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#667085] hover:text-[#172033] rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] cursor-pointer"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <h1 className="text-lg sm:text-[22px] lg:text-[26px] font-bold text-[#172033] tracking-tight flex items-center gap-2 leading-tight">
                <span>{currentMeta.title}</span>
              </h1>
              <p className="hidden sm:block text-[13px] text-[#667085] font-normal leading-normal">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2.5">
            <span className="hidden xl:inline text-[13px] text-[#667085] pr-1">
              Last analyzed: <strong className="text-[#172033] font-medium font-mono">Today</strong>
            </span>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#667085] hover:text-[#172033] hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-fade-in" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 animate-fade-in" />
              )}
            </button>

            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="px-3 py-2 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] hover:bg-slate-100 text-[13.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              title="Recalculate Strategy"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isReanalyzing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Re-analyze</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="glow-btn-secondary px-3 py-2 rounded-lg text-[13.5px] font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              title="Download Comprehensive Strategy Report"
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
            </button>

            <button
              onClick={() => setActiveView('ai')}
              className="glow-btn-primary px-3.5 py-2 rounded-lg text-white font-bold text-[14px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Open VestIQ AI Financial Workspace"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Ask VestIQ</span>
            </button>
          </div>

        </header>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E7E9F0] p-3 space-y-1 animate-fade-in z-20 shadow-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[14.5px] font-semibold cursor-pointer ${
                    isActive ? 'bg-teal-50 text-teal-800' : 'text-[#667085] hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-teal-600" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-[#E7E9F0] flex items-center justify-between px-3">
              <span className="text-[13px] font-medium text-[#667085]">Theme</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[13px] font-bold text-[#172033]"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-700" />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area (Centered Wide Content Max Width 1400px) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-[1400px] mx-auto space-y-5">
          {children}
        </main>

      </div>

      {/* Slide-Over AI Assistant Drawer */}
      {isAdvisorOpen && (
        <AIAssistantDrawer onClose={() => setAdvisorOpen(false)} />
      )}

      {/* Floating Assistant Trigger Button */}
      <FloatingAIAssistantButton />

    </div>
  );
};
