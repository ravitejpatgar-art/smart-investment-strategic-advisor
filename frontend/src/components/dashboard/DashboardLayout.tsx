import React, { useState } from 'react';
import { useFintechStore, type ActiveNavTab } from '../../store/useFintechStore';
import {
  LayoutDashboard,
  Receipt,
  Target,
  User,
  FileText,
  RefreshCw,
  BarChart3,
  Menu,
  X,
  Layers,
  LogOut,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAuthEnabled } from '../../services/firebase';
import { AIAssistantDrawer } from '../assistant/AIAssistantDrawer';
import { FloatingAIAssistantButton } from '../assistant/FloatingAIAssistantButton';
import { generateAdvisoryPdfReport } from '../../services/pdfReportGenerator';
import { BrandLogo } from '../common/BrandLogo';
import { VestiqMark } from '../common/VestiqLogo';
import { ThemeToggle } from '../common/ThemeToggle';
import { AmbientCursorGlow } from '../common/AmbientCursorGlow';

export const formatInvestorRiskLabel = (risk?: string): string => {
  if (!risk) return 'Medium Investor';
  const r = risk.toLowerCase();
  if (r.includes('aggressive')) return 'Aggressive Investor';
  if (r.includes('moderate') || r.includes('medium') || r.includes('growth')) return 'Medium Investor';
  if (r.includes('conservative') || r.includes('slow')) return 'Slow Investor';
  return `${risk} Investor`;
};

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem('smartvest-sidebar-collapsed') === 'true';
      }
    } catch {
      // Ignore localStorage errors
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('smartvest-sidebar-collapsed', String(next));
        }
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const navItems: { id: ActiveNavTab; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'dashboard',       label: 'Wealth Overview',  icon: LayoutDashboard, desc: 'Portfolio & KPIs' },
    { id: 'market',          label: 'Market Terminal',  icon: BarChart3,        desc: 'Global Quotes'   },
    { id: 'academy',         label: 'Investing Academy', icon: GraduationCap,   desc: 'Beginner Lessons' },
    { id: 'recommendations', label: 'Asset Allocation', icon: Layers,           desc: 'Strategy Blueprint' },
    { id: 'goals',           label: 'Goal Roadmaps',    icon: Target,           desc: 'Milestones'      },
    { id: 'expenses',        label: 'Expense Tracker',  icon: Receipt,          desc: 'Inflow & Expenses' },
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
    academy:         { title: 'Investing Academy',      subtitle: 'Learn investing in simple 1–2 minute lessons' },
    recommendations: { title: 'Asset Allocation Blueprint', subtitle: 'Quantitative multi-asset strategy & execution guide' },
    goals:           { title: 'Goal Roadmaps & Milestones', subtitle: 'Target probability modeling & inflation-adjusted SIP plans' },
    expenses:        { title: 'Expense Tracker',        subtitle: 'Income allocation, expenditure breakdown, and investable surplus' },
    profile:         { title: 'Investor Mandate & Profile', subtitle: 'Risk capacity scores, horizon parameters, and personal targets' },
    onboarding:      { title: 'Wealth Discovery',       subtitle: 'Complete your investment profile' },
  };

  const currentMeta = pageTitleMap[activeView] || pageTitleMap.dashboard!;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'R';

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans relative">
      <AmbientCursorGlow />

      {/* ================================================================
          THEME-AWARE INSTITUTIONAL SIDEBAR — Desktop
      ================================================================ */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-full bg-[var(--color-surface)] border-r border-[var(--color-border)] shadow-xs transition-[width] duration-250 ease-in-out motion-reduce:transition-none ${
          isSidebarCollapsed ? 'w-[76px]' : 'w-[260px]'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Brand Header */}
        <div
          className={`border-b border-[var(--color-border-subtle)] flex items-center min-h-[57px] ${
            isSidebarCollapsed ? 'flex-col justify-center py-3 px-1 gap-1.5' : 'justify-between px-4 py-3.5'
          }`}
        >
          {isSidebarCollapsed ? (
            <>
              <BrandLogo size="sm" variant="icon" onClick={() => setActiveView('dashboard')} />
              <button
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                aria-expanded="false"
                title="Expand sidebar"
                className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] border border-transparent hover:border-[var(--color-border-subtle)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="overflow-hidden flex-1">
                <BrandLogo size="md" variant="horizontal" subtitleText="SMARTVEST ADVISOR" onClick={() => setActiveView('dashboard')} />
              </div>
              <button
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
                aria-expanded="true"
                title="Collapse sidebar"
                className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] border border-transparent hover:border-[var(--color-border-subtle)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] shrink-0"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav
          className={`flex-1 overflow-y-auto space-y-1 scrollbar-none ${
            isSidebarCollapsed ? 'px-2 py-3' : 'px-3 py-4'
          }`}
        >
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-bold tracking-wider uppercase px-2.5 mb-2 text-[var(--color-text-muted)] animate-fade-in">
              PORTFOLIO MODULES
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => setActiveView(item.id)}
                  title={item.label}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center rounded-xl text-[13.5px] font-semibold transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                    isSidebarCollapsed
                      ? 'justify-center p-2.5'
                      : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-[var(--accent-teal-dim)] text-[var(--text-accent)] border border-[var(--border-accent)] font-bold shadow-2xs'
                      : `text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] ${!isSidebarCollapsed ? 'hover:translate-x-0.5 motion-reduce:hover:translate-x-0' : ''} border border-transparent`
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                      isActive ? 'text-[var(--text-accent)]' : 'text-[var(--color-text-muted)]'
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <>
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{item.label}</div>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />}
                    </>
                  )}
                </button>

                {/* Accessible Floating Tooltip in Collapsed Mode */}
                {isSidebarCollapsed && (
                  <div
                    role="tooltip"
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold whitespace-nowrap shadow-lg opacity-0 scale-98 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 transition-all duration-150 z-50 motion-reduce:transition-none motion-reduce:scale-100"
                  >
                    <span>{item.label}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Advisory Workspace Link */}
          <div className="pt-3 mt-3 border-t border-[var(--color-border-subtle)]">
            {!isSidebarCollapsed && (
              <div className="text-[10px] font-bold tracking-wider uppercase px-2.5 mb-2 text-[var(--color-text-muted)] animate-fade-in">
                ADVISORY
              </div>
            )}
            <div className="relative group">
              <button
                onClick={() => setActiveView('ai')}
                title="VestIQ Advisory"
                aria-label="VestIQ Advisory"
                className={`w-full flex items-center rounded-xl text-[13.5px] font-semibold transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                  isSidebarCollapsed
                    ? 'justify-center p-2.5'
                    : 'gap-3 px-3 py-2.5'
                } ${
                  activeView === 'ai' || activeView === 'vestiq'
                    ? 'bg-[var(--accent-teal-dim)] text-[var(--text-accent)] border border-[var(--border-accent)] font-bold shadow-2xs'
                    : `text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] ${!isSidebarCollapsed ? 'hover:translate-x-0.5 motion-reduce:hover:translate-x-0' : ''} border border-transparent`
                }`}
              >
                <VestiqMark size={16} className="shrink-0" />
                {!isSidebarCollapsed && <span>VestIQ Advisory</span>}
              </button>

              {/* Accessible Floating Tooltip in Collapsed Mode */}
              {isSidebarCollapsed && (
                <div
                  role="tooltip"
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold whitespace-nowrap shadow-lg opacity-0 scale-98 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 transition-all duration-150 z-50 motion-reduce:transition-none motion-reduce:scale-100"
                >
                  <span>VestIQ Advisory</span>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer — Client Account Card */}
        <div
          className={`p-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-3)] ${
            isSidebarCollapsed ? 'flex flex-col items-center gap-2 px-2' : 'flex items-center justify-between gap-2'
          }`}
        >
          {isSidebarCollapsed ? (
            <div className="relative group flex flex-col items-center gap-2 w-full">
              <div
                className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-text)] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs cursor-default"
                title={`${user?.name || 'Investor'} (${formatInvestorRiskLabel(user?.riskTolerance)})`}
              >
                {userInitial}
              </div>

              {/* Tooltip for profile in collapsed state */}
              <div
                role="tooltip"
                className="absolute left-full ml-3 bottom-0 px-2.5 py-1 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50"
              >
                <div>{user?.name || 'Investor'}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">{formatInvestorRiskLabel(user?.riskTolerance)}</div>
              </div>

              {authActive && (
                <button
                  onClick={async () => {
                    await signOut();
                    setActiveView('landing');
                  }}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-2 rounded-lg bg-[var(--color-surface)] hover:bg-red-500/10 border border-[var(--color-border)] hover:border-red-400/40 text-[var(--color-text-muted)] hover:text-red-500 transition-all duration-150 active:scale-95 cursor-pointer shrink-0 shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xs min-w-0 flex-1">
                <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-text)] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[var(--color-text-primary)] truncate">{user?.name || 'Investor'}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)] truncate">{formatInvestorRiskLabel(user?.riskTolerance)}</div>
                </div>
              </div>
              {authActive && (
                <button
                  onClick={async () => {
                    await signOut();
                    setActiveView('landing');
                  }}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-2 rounded-xl bg-[var(--color-surface)] hover:bg-red-500/10 border border-[var(--color-border)] hover:border-red-400/40 text-[var(--color-text-muted)] hover:text-red-500 transition-all duration-150 active:scale-95 cursor-pointer shrink-0 shadow-2xs"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ================================================================
          MAIN CONTENT AREA & TOPBAR
      ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Modern Clean TopBar */}
        <header className="h-14 shrink-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-3 sm:px-4 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 z-20 shadow-xs">
          {/* Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="lg:hidden p-2 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer active:scale-95 transition-all duration-150"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div className="lg:hidden shrink-0">
              <BrandLogo size="sm" variant="icon" onClick={() => setActiveView('dashboard')} />
            </div>

            {/* Desktop Quick Toggle in Topbar when Collapsed */}
            {isSidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                aria-expanded="false"
                title="Expand sidebar"
                className="hidden lg:flex p-1.5 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] shrink-0"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-[var(--color-text-primary)] tracking-tight truncate leading-none">
                {currentMeta.title}
              </h1>
              <p className="text-[11px] sm:text-xs text-[var(--color-text-secondary)] hidden sm:block truncate mt-1">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Global Theme Toggle */}
            <ThemeToggle variant="header" />

            {/* Currency Selector */}
            <div className="flex items-center bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                  currency === 'INR' ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-2xs font-bold border border-[var(--color-border-subtle)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                  currency === 'USD' ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-2xs font-bold border border-[var(--color-border-subtle)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
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
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[var(--color-surface-3)] hover:bg-[var(--color-border-strong)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-150 cursor-pointer text-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin text-[var(--color-accent-strong)]' : ''}`} />
              <span className="hidden sm:inline text-[11px] font-semibold">Recalculate</span>
            </button>

            {/* PDF Export Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              title="Export PDF Report"
              className="p-1.5 sm:px-3 sm:py-1 rounded-lg bg-[var(--color-surface-3)] hover:bg-[var(--color-border-strong)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-[11px] font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-[280px] bg-[var(--color-surface)] h-full p-4 flex flex-col justify-between shadow-2xl border-r border-[var(--color-border)] animate-slide-left">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
                  <BrandLogo size="md" subtitleText="SMARTVEST" onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }} />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="pt-1">
                  <ThemeToggle variant="pill" />
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
                            ? 'bg-[var(--accent-teal-dim)] text-[var(--text-accent)] border border-[var(--border-accent)] font-bold shadow-2xs'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--text-accent)]' : 'text-[var(--color-text-muted)]'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-3 border-t border-[var(--color-border-subtle)]">
                {authActive && (
                  <button
                    onClick={async () => {
                      await signOut();
                      setActiveView('landing');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-xs border border-red-500/20"
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
        <main className="flex-1 min-w-0 overflow-y-auto bg-[var(--color-bg)] p-3 sm:p-5 lg:p-6">
          <div className="w-full min-w-0">
            {children}
          </div>
        </main>

      </div>

      {/* Floating Assistant Drawer */}
      {isAdvisorOpen && (
        <AIAssistantDrawer
          onClose={() => setAdvisorOpen(false)}
        />
      )}

      {/* Floating Ask VestIQ Quick-Chat Shortcut */}
      <FloatingAIAssistantButton />
    </div>
  );
};
