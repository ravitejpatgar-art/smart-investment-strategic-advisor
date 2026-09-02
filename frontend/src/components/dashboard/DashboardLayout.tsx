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
  Layers,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAuthEnabled } from '../../services/firebase';
import { AIAssistantDrawer } from '../assistant/AIAssistantDrawer';
import { FloatingAIAssistantButton } from '../assistant/FloatingAIAssistantButton';
import { generateAdvisoryPdfReport } from '../../services/pdfReportGenerator';
import { BrandLogo } from '../common/BrandLogo';

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
    isAdvisorOpen, 
    setAdvisorOpen,
    runAiAnalysis,
    theme,
    toggleTheme
  } = useFintechStore();

  const { signOut } = useAuth();
  const authActive = isAuthEnabled();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const navItems: { id: ActiveNavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard',       label: 'Dashboard',        icon: LayoutDashboard },
    { id: 'market',          label: 'Market',           icon: TrendingUp },
    { id: 'expenses',        label: 'Expense Tracker',  icon: Receipt },
    { id: 'recommendations', label: 'Recommendations',  icon: Layers },
    { id: 'goals',           label: 'Goals',            icon: Target },
    { id: 'profile',         label: 'Profile',          icon: User },
  ];

  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true);
      generateAdvisoryPdfReport({ user, strategy, expenses, goals, currency, currencySymbol: currency === 'USD' ? '$' : '₹' });
    } catch { /* Ignore */ }
    finally { setIsExportingPdf(false); }
  };

  const handleReanalyze = async () => {
    try {
      setIsReanalyzing(true);
      await runAiAnalysis();
    } finally { setIsReanalyzing(false); }
  };

  const pageTitleMap: Partial<Record<ActiveNavTab, { title: string; subtitle: string }>> = {
    dashboard:       { title: 'Strategic Wealth Overview',     subtitle: 'Real-time asset allocation & financial runway analytics' },
    market:          { title: 'Global Market Terminal',        subtitle: 'NSE · NASDAQ · Global ETFs · Commodities & NAV Feeds' },
    recommendations: { title: 'Asset Allocation Blueprint',    subtitle: 'Quantitative multi-asset strategy & direct execution guide' },
    goals:           { title: 'Goal Roadmaps & Milestones',    subtitle: 'Target probability modeling & inflation-adjusted SIP plans' },
    expenses:        { title: 'Cash Flow & Capital Surplus',   subtitle: 'Income allocation, fixed expenditure, and investable surplus' },
    profile:         { title: 'Investor Mandate & Governance', subtitle: 'Risk capacity scores, lifecycle parameters, and demographic settings' },
    onboarding:      { title: 'Wealth Discovery',              subtitle: 'Complete your investment profile' },
  };

  const currentMeta = pageTitleMap[activeView] || pageTitleMap.dashboard!;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'R';
  const userName = user?.name || 'ravi';
  const userRisk = user?.riskTolerance || user?.riskCategory || 'Conservative';

  return (
    <div className="h-screen flex overflow-hidden bg-[#F8FAFC] dark:bg-[#060811] text-slate-900 dark:text-white font-sans">
      
      {/* ================================================================
          INSTITUTIONAL SIDEBAR — Desktop
      ================================================================ */}
      <aside
        className="hidden lg:flex flex-col w-[230px] shrink-0 h-full bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-white/[0.08]"
      >
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-slate-100 dark:border-white/[0.06]">
          <BrandLogo size="md" subtitleText="STRATEGIC ADVISOR" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 scrollbar-none">
          <div className="text-[10px] font-bold tracking-wider uppercase px-2 mb-2 text-slate-400">
            MENU
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                  isActive 
                    ? 'bg-[#E6FDF7] dark:bg-[#00D4AA]/15 text-[#0F766E] dark:text-[#00D4AA] border border-[#00D4AA] dark:border-[#00D4AA]/40 font-bold shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00D4AA]' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* VestIQ AI Workspace Card */}
          <div className="pt-3">
            <div className="p-3 rounded-xl bg-[#F0FDFA] dark:bg-[#0F172A] border border-[#99F6E4] dark:border-white/[0.08] space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#00D4AA]" />
                  <span>VestIQ AI</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#00D4AA] text-[#060811]">
                  NEW
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Financial research & intelligence workspace
              </p>
              <button
                onClick={() => setActiveView('ai')}
                className="text-xs font-bold text-[#0D9488] dark:text-[#00D4AA] hover:underline cursor-pointer flex items-center gap-1 pt-0.5"
              >
                <span>Launch Workspace</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-3.5 border-t border-slate-100 dark:border-white/[0.06] space-y-3 bg-white dark:bg-[#0B1120]">
          
          {/* Theme Switcher */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">THEME</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer shadow-xs"
            >
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span className="capitalize">{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CURRENCY</span>
            <div className="flex items-center bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/[0.08] rounded-lg p-0.5">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  currency === 'INR' ? 'bg-[#00D4AA] text-[#060811] shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-[#00D4AA] text-[#060811] shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-[#E6FDF7] text-[#0D9488] dark:bg-[#00D4AA]/15 dark:text-[#00D4AA] border border-[#99F6E4] dark:border-[#00D4AA]/30 flex items-center justify-center font-black text-xs shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{userName}</div>
                <div className="text-[10px] text-slate-500 truncate">{userRisk} Risk</div>
              </div>
            </div>
            {authActive && (
              <button
                onClick={async () => {
                  await signOut();
                  setActiveView('landing');
                }}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF5252] transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </aside>

      {/* ================================================================
          MAIN CONTENT AREA & TOPBAR
      ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TopBar */}
        <header className="h-16 shrink-0 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-white/[0.08] px-4 lg:px-8 flex items-center justify-between gap-4 z-20">
          {/* Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div className="min-w-0 space-y-0.5">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                {currentMeta.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs text-slate-400 hidden md:inline">Last analyzed: Today</span>

            {/* Dark Mode Icon Button */}
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="p-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer shadow-xs"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Re-analyze Button */}
            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin text-[#00D4AA]' : ''}`} />
              <span className="hidden sm:inline">Re-analyze</span>
            </button>

            {/* Export PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#00D4AA]" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            {/* Ask VestIQ Primary CTA */}
            <button
              onClick={() => setActiveView('ai')}
              className="px-4 py-2 rounded-xl bg-[#00D4AA] text-[#060811] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:bg-[#00D4AA]/90"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask VestIQ</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-white/[0.08] p-4 space-y-1.5 z-30">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#E6FDF7] dark:bg-[#00D4AA]/15 text-[#0F766E] dark:text-[#00D4AA] border border-[#00D4AA]' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic View Scroll Container */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-[#060811] p-4 lg:p-7">
          <div className="max-w-7xl mx-auto space-y-5">
            {children}
          </div>
        </main>

      </div>

      {/* Slide-over Assistant Drawer */}
      {isAdvisorOpen && (
        <AIAssistantDrawer
          onClose={() => setAdvisorOpen(false)}
        />
      )}

      {/* Floating Assistant Trigger */}
      <FloatingAIAssistantButton />

    </div>
  );
};
