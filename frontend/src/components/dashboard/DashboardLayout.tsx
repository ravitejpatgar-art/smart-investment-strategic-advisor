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
    { id: 'expenses',        label: 'Expenses',         icon: Receipt },
    { id: 'recommendations', label: 'Recommendations',  icon: Layers },
    { id: 'goals',           label: 'Goals',            icon: Target },
    { id: 'profile',         label: 'Profile',          icon: User },
    { id: 'ai',              label: 'VestIQ AI',        icon: Sparkles },
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
    dashboard:       { title: 'Strategic Wealth Overview',     subtitle: 'Asset allocation & financial runway analytics' },
    market:          { title: 'Global Market Terminal',        subtitle: 'NSE · NASDAQ · Global ETFs · Commodities & NAV Feeds' },
    recommendations: { title: 'Asset Allocation Blueprint',    subtitle: 'Quantitative multi-asset strategy & direct execution guide' },
    goals:           { title: 'Goal Roadmaps & Milestones',    subtitle: 'Target probability modeling & inflation-adjusted SIP plans' },
    expenses:        { title: 'Cash Flow & Capital Surplus',   subtitle: 'Income allocation, fixed expenditure, and investable surplus' },
    profile:         { title: 'Investor Mandate & Governance', subtitle: 'Risk capacity scores and portfolio settings' },
    ai:              { title: 'VestIQ Financial AI',           subtitle: 'AI financial intelligence workspace' },
    vestiq:          { title: 'VestIQ Financial AI',           subtitle: 'AI financial intelligence workspace' },
    onboarding:      { title: 'Wealth Discovery',              subtitle: 'Complete your investment profile' },
  };

  const currentMeta = pageTitleMap[activeView] || pageTitleMap.dashboard!;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'R';
  const userName = user?.name || 'ravi';
  const userRisk = user?.riskTolerance || user?.riskCategory || 'Conservative';

  return (
    <div className="h-screen flex overflow-hidden bg-[#F8FAFC] dark:bg-[#060811] text-slate-900 dark:text-white font-sans">
      
      {/* ================================================================
          MINIMAL SAAS SIDEBAR — Desktop
      ================================================================ */}
      <aside
        className="hidden lg:flex flex-col w-[240px] shrink-0 h-full bg-white dark:bg-[#0B1120] border-r border-slate-200/80 dark:border-white/[0.06]"
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.04]">
          <BrandLogo size="md" subtitleText="STRATEGIC ADVISOR" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
          <div className="text-[10px] font-semibold tracking-wider uppercase px-2 mb-2 text-slate-400">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive 
                    ? 'bg-[#E6FDF7] dark:bg-[#00D4AA]/15 text-[#0F766E] dark:text-[#00D4AA] font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0D9488] dark:text-[#00D4AA]' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-100 dark:border-white/[0.04] space-y-2 bg-white dark:bg-[#0B1120]">
          
          <div className="flex items-center justify-between text-xs px-1">
            {/* Currency Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-[#0F172A] p-0.5 rounded-md text-[11px]">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                  currency === 'INR' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                  currency === 'USD' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md bg-slate-100 dark:bg-[#0F172A] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-100 dark:border-white/[0.04] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-md bg-[#0D9488] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{userName}</div>
                <div className="text-[10px] text-slate-400 truncate">{userRisk} Risk</div>
              </div>
            </div>
            {authActive && (
              <button
                onClick={async () => {
                  await signOut();
                  setActiveView('landing');
                }}
                title="Sign Out"
                className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
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
        <header className="h-14 shrink-0 bg-white dark:bg-[#0B1120] border-b border-slate-200/80 dark:border-white/[0.06] px-4 lg:px-8 flex items-center justify-between gap-4 z-20">
          {/* Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {currentMeta.title}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Re-analyze Button */}
            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin text-[#0D9488]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Export PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export PDF</span>
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC] dark:bg-[#060811] p-4 lg:p-7 min-w-0">
          <div className="max-w-7xl mx-auto w-full min-w-0 space-y-5">
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
