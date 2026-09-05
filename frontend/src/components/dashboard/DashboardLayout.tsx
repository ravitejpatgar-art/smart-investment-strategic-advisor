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
    dashboard:       { title: 'Portfolio Overview',     subtitle: 'Real-time wealth metrics, surplus analytics & financial health' },
    market:          { title: 'Market Terminal',        subtitle: 'NSE · SENSEX · NASDAQ · Direct ETFs & Mutual Funds' },
    recommendations: { title: 'Asset Allocation Blueprint', subtitle: 'Quantitative multi-asset strategy & execution guide' },
    goals:           { title: 'Goal Roadmaps & Milestones', subtitle: 'Target probability modeling & inflation-adjusted SIP plans' },
    expenses:        { title: 'Cash Flow & Capital Surplus', subtitle: 'Income allocation, expenditure breakdown, and investable surplus' },
    profile:         { title: 'Investor Mandate & Profile', subtitle: 'Risk capacity scores, horizon parameters, and personal targets' },
    onboarding:      { title: 'Wealth Discovery',       subtitle: 'Complete your investment profile' },
  };

  const currentMeta = pageTitleMap[activeView] || pageTitleMap.dashboard!;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'R';

  return (
    <div className="h-screen flex overflow-hidden bg-[#F8F9FA] text-[#0F172A] font-sans">
      
      {/* ================================================================
          MODERN LIGHT FINTECH SIDEBAR — Desktop
      ================================================================ */}
      <aside
        className="hidden lg:flex flex-col w-[240px] shrink-0 h-full bg-white border-r border-[#E2E8F0] shadow-xs"
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-[#F1F5F9]">
          <BrandLogo size="md" subtitleText="SMARTVEST ADVISOR" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
          <div className="text-[10px] font-bold tracking-wider uppercase px-2.5 mb-2 text-[#94A3B8]">
            PORTFOLIO MODULES
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isActive 
                    ? 'bg-teal-50 text-teal-900 border border-teal-200/80 font-bold shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors duration-150 ${isActive ? 'text-teal-700' : 'text-[#94A3B8]'}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{item.label}</div>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />}
              </button>
            );
          })}

          {/* AI Intelligence Workspace Link */}
          <div className="pt-4 mt-4 border-t border-[#F1F5F9]">
            <div className="text-[10px] font-bold tracking-wider uppercase px-2.5 mb-2 text-[#94A3B8]">
              INTELLIGENCE
            </div>
            <button
              onClick={() => setActiveView('ai')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-teal-500 ${
                activeView === 'ai' || activeView === 'vestiq'
                  ? 'bg-teal-50 text-teal-900 border border-teal-200/80 font-bold shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 border border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>VestIQ Strategic AI</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer — Client Account Card */}
        <div className="p-3 border-t border-[#F1F5F9] bg-slate-50/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs min-w-0 flex-1">
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#0F172A] truncate">{user?.name || 'Investor'}</div>
              <div className="text-[10px] text-[#64748B] truncate">{user?.riskTolerance ? `${user.riskTolerance} Mandate` : 'Moderate Mandate'}</div>
            </div>
          </div>
          {authActive && (
            <button
              onClick={async () => {
                await signOut();
                setActiveView('landing');
              }}
              title="Sign Out"
              className="p-2 rounded-xl bg-white hover:bg-red-50 border border-[#E2E8F0] hover:border-red-200 text-[#64748B] hover:text-red-600 transition-all duration-150 active:scale-95 cursor-pointer shrink-0 shadow-2xs"
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
        
        {/* Modern Clean TopBar */}
        <header className="h-14 shrink-0 bg-white border-b border-[#E2E8F0] px-3 sm:px-4 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 z-20 shadow-xs">
          {/* Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="lg:hidden p-2 rounded-lg bg-slate-50 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] cursor-pointer active:scale-95 transition-all duration-150"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-[#0F172A] tracking-tight truncate leading-none">
                {currentMeta.title}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] hidden sm:block truncate mt-0.5">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-100 border border-[#E2E8F0] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                  currency === 'INR' ? 'bg-white text-[#0F172A] shadow-2xs font-bold' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                  currency === 'USD' ? 'bg-white text-[#0F172A] shadow-2xs font-bold' : 'text-[#64748B] hover:text-[#0F172A]'
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
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#475569] hover:text-[#0F172A] transition-all duration-150 cursor-pointer text-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin text-teal-600' : ''}`} />
              <span className="hidden sm:inline text-[11px] font-semibold">Recalculate</span>
            </button>

            {/* PDF Export Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              title="Export PDF Report"
              className="p-1.5 sm:px-3 sm:py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#475569] hover:text-[#0F172A] text-[11px] font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            {/* VestIQ Assistant Trigger */}
            <button
              onClick={() => setActiveView('ai')}
              className="px-3 py-1.5 rounded-lg bg-[#00D4AA] hover:bg-teal-400 text-[#0F172A] text-[10.5px] sm:text-[11px] font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0F172A]" />
              <span>VestIQ AI</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
            <div 
              className="fixed inset-0 bg-black/40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-[280px] bg-white h-full p-4 flex flex-col justify-between shadow-2xl animate-slide-left">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <BrandLogo size="md" subtitleText="SMARTVEST" />
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
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
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                          isActive
                            ? 'bg-teal-50 text-teal-900 border border-teal-200 font-bold'
                            : 'text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-[#94A3B8]'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0]">
                {authActive && (
                  <button
                    onClick={async () => {
                      await signOut();
                      setActiveView('landing');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-50 text-red-700 font-bold text-xs border border-red-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto bg-[#F8F9FA] p-3 sm:p-5 lg:p-6">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>

      </div>

      {/* Floating Assistant Drawer & Trigger */}
      {isAdvisorOpen && (
        <AIAssistantDrawer
          onClose={() => setAdvisorOpen(false)}
        />
      )}
      <FloatingAIAssistantButton />

    </div>
  );
};
