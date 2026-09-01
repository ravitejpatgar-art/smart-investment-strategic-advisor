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
  BarChart3,
  Menu,
  X,
  Layers,
  LogOut
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
    runAiAnalysis
  } = useFintechStore();

  const { signOut } = useAuth();
  const authActive = isAuthEnabled();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const navItems: { id: ActiveNavTab; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'dashboard',       label: 'Wealth Overview',  icon: LayoutDashboard, desc: 'Portfolio & KPIs' },
    { id: 'market',          label: 'Market Terminal',  icon: BarChart3,        desc: 'Global Quotes'   },
    { id: 'recommendations', label: 'Asset Allocation', icon: Layers,           desc: 'Strategy Blueprint' },
    { id: 'goals',           label: 'Goal Roadmaps',    icon: Target,           desc: 'Milestones'      },
    { id: 'expenses',        label: 'Cash Flow & Surplus', icon: Receipt,       desc: 'Inflow & Expenses' },
    { id: 'profile',         label: 'Investor Mandate', icon: User,             desc: 'Risk & Profile'  },
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
    dashboard:       { title: 'Portfolio Overview',     subtitle: 'Institutional capital analytics & real-time financial health' },
    market:          { title: 'Global Market Terminal', subtitle: 'NSE · NASDAQ · Global ETFs · Commodities & NAV Feeds' },
    recommendations: { title: 'Asset Allocation Blueprint', subtitle: 'Quantitative multi-asset strategy & direct execution guide' },
    goals:           { title: 'Goal Roadmaps & Milestones', subtitle: 'Target probability modeling & inflation-adjusted SIP plans' },
    expenses:        { title: 'Cash Flow & Capital Surplus', subtitle: 'Income allocation, fixed expenditure, and investable surplus' },
    profile:         { title: 'Investor Mandate & Governance', subtitle: 'Risk capacity scores, lifecycle parameters, and demographic settings' },
    onboarding:      { title: 'Wealth Discovery',       subtitle: 'Complete your investment profile' },
  };

  const currentMeta = pageTitleMap[activeView] || pageTitleMap.dashboard!;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="h-screen flex overflow-hidden bg-[#050816] text-[#FFFFFF] font-sans">
      
      {/* ================================================================
          INSTITUTIONAL SIDEBAR — Desktop
      ================================================================ */}
      <aside
        className="hidden lg:flex flex-col w-[240px] shrink-0 h-full bg-[#0A1022] border-r border-white/[0.08]"
      >
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <BrandLogo size="md" subtitleText="CAPITAL ADVISORY" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
          <div className="text-[10px] font-bold tracking-wider uppercase px-2.5 mb-2 text-[#5A667A]">
            PORTFOLIO MODULES
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                  isActive 
                    ? 'bg-[#101827] text-[#00D4AA] border border-white/[0.08]' 
                    : 'text-[#8A94A6] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00D4AA]' : 'text-[#8A94A6]'}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{item.label}</div>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />}
              </button>
            );
          })}

          {/* AI Intelligence Workspace Link */}
          <div className="pt-4 mt-4 border-t border-white/[0.06]">
            <div className="text-[10px] font-bold tracking-wider uppercase px-2.5 mb-2 text-[#5A667A]">
              INTELLIGENCE
            </div>
            <button
              onClick={() => setActiveView('ai')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                activeView === 'ai' || activeView === 'vestiq'
                  ? 'bg-[#101827] text-[#00D4AA] border border-white/[0.08]'
                  : 'text-[#8A94A6] hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#00D4AA]" />
              <span>VestIQ Strategic AI</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer — Client Account Card */}
        <div className="p-3 border-t border-white/[0.06] bg-[#050816]/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#101827] border border-white/[0.06] min-w-0 flex-1">
            <div className="w-8 h-8 rounded-md bg-[#00D4AA]/15 text-[#00D4AA] border border-[#00D4AA]/30 flex items-center justify-center font-bold text-xs shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Investor'}</div>
              <div className="text-[10px] text-[#8A94A6] truncate">{user?.riskTolerance ? `${user.riskTolerance} Mandate` : 'Moderate Mandate'}</div>
            </div>
          </div>
          {authActive && (
            <button
              onClick={async () => {
                await signOut();
                setActiveView('landing');
              }}
              title="Sign Out"
              className="p-2 rounded-lg bg-[#101827] hover:bg-[#1f293d] border border-white/[0.08] text-[#8A94A6] hover:text-[#FF5252] transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ================================================================
          MAIN CONTENT AREA & TOPBAR
      ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Institutional TopBar */}
        <header className="h-14 shrink-0 bg-[#0A1022] border-b border-white/[0.08] px-4 lg:px-8 flex items-center justify-between gap-4 z-20">
          {/* Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md bg-[#101827] border border-white/[0.08] text-[#8A94A6] hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate leading-none">
                {currentMeta.title}
              </h1>
              <p className="text-[11px] text-[#8A94A6] hidden sm:block truncate mt-0.5">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Currency Selector */}
            <div className="flex items-center bg-[#101827] border border-white/[0.08] rounded-md p-0.5 text-xs">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  currency === 'INR' ? 'bg-[#0A1022] text-white' : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-[#0A1022] text-white' : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Recalculate Button */}
            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              title="Recalculate Multi-Asset Blueprint"
              className="p-1.5 rounded-md bg-[#101827] border border-white/[0.08] text-[#8A94A6] hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin text-[#00D4AA]' : ''}`} />
              <span className="hidden sm:inline text-[11px] font-semibold">Recalculate</span>
            </button>

            {/* PDF Export Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3 py-1.5 rounded-md bg-[#101827] hover:bg-[#141F36] border border-white/[0.08] text-[#8A94A6] hover:text-white text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#00D4AA]" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            {/* VestIQ Assistant Trigger */}
            <button
              onClick={() => setActiveView('ai')}
              className="px-3 py-1.5 rounded-md bg-[#00D4AA] text-[#050816] text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>VestIQ AI</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A1022] border-b border-white/[0.08] p-4 space-y-1 z-30">
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive ? 'bg-[#101827] text-[#00D4AA]' : 'text-[#8A94A6]'
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
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 bg-[#050816]">
          <div className="max-w-7xl mx-auto">
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
