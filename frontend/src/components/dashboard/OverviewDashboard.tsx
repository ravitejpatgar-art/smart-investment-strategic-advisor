import React, { useState, useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import {
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useMarketQuotes } from '../../hooks/useMarketQuotes';
import { Skeleton, Button } from '../common';
import { formatInvestorRiskLabel } from './DashboardLayout';

type ProjectionHorizon = 5 | 10 | 15 | 20 | 25;
type ProjectionScenario = 'Conservative' | 'Base' | 'Optimistic';

// ---- Semantic Theme Chart Tooltips ----
const PremiumTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (!active || !payload || !payload.length) return null;
  const cVal = payload.find((p: any) => p.dataKey === 'corpus')?.value as number;
  const iVal = payload.find((p: any) => p.dataKey === 'invested')?.value as number;
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-3 shadow-xl font-sans text-xs">
      <div className="text-[var(--color-text-primary)] font-bold mb-1.5">{label}</div>
      <div className="text-[#00D4AA] font-mono font-bold">
        Corpus: {formatCurrency(cVal || 0)}
      </div>
      <div className="text-[var(--color-text-secondary)] font-mono mt-0.5">
        Invested: {formatCurrency(iVal || 0)}
      </div>
    </div>
  );
};

const AllocationTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-2.5 shadow-xl text-xs">
      <div className="text-[var(--color-text-primary)] font-bold">{item.name}</div>
      <div className="text-[#00D4AA] font-extrabold font-mono">{item.value}%</div>
    </div>
  );
};

export const OverviewDashboard: React.FC = () => {
  const {
    user,
    strategy,
    formatCurrency,
    setActiveView,
    expenses,
    goals
  } = useFintechStore();

  const [selectedHorizon, setSelectedHorizon] = useState<ProjectionHorizon>(15);
  const [selectedScenario, setSelectedScenario] = useState<ProjectionScenario>('Base');
  const [showHealthFactors, setShowHealthFactors] = useState(false);

  // Live Market Quotes for Dashboard
  const dashboardSymbols = ['NIFTY 50', 'SENSEX', 'NASDAQ', 'GOLD (10g)'];
  const { quotes, isLoading: isMarketLoading, refetch: refetchMarket } = useMarketQuotes(dashboardSymbols, 30000);

  // Cashflow Numbers — UNCHANGED LOGIC
  const salary = user?.salaryIncome || user?.monthlyIncome || 0;
  const otherInc = user?.otherIncome || 0;
  const totalIncome = salary + otherInc;
  const totalLoggedExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalExpenses = totalLoggedExpenses > 0 ? totalLoggedExpenses : (Number(user?.monthlyExpenses) || 0);
  const rawSurplus = totalIncome - totalExpenses;
  const isDeficit = rawSurplus < 0;
  const surplus = Math.max(0, rawSurplus);
  const recommendedInvestment = isDeficit ? 0 : (strategy?.recommendedMonthlyInvestment ?? Math.round(surplus * 0.90));
  const risk = user?.riskTolerance || user?.riskCategory || 'Moderate';
  const horizon = user?.investmentHorizon || '10+ Years';
  const primaryGoal = goals.length > 0 ? goals[0] : null;
  const sf = strategy?.suitabilityFactors;
  const riskCapacityScore = sf?.riskCapacityScore ?? 50;
  const effectiveRiskCategory = sf?.effectiveRiskCategory ?? risk;
  const savingsRate = totalIncome > 0 && !isDeficit ? Math.round((surplus / totalIncome) * 100) : 0;
  const emergencyFund = Number(user?.emergencyFund) || Number(user?.existingSavings) || 0;
  const targetEmergencyFund = totalExpenses * 6;
  const emergencyCoverageMonths = totalExpenses > 0 ? (emergencyFund / totalExpenses).toFixed(1) : '0';
  const emergencyFundedPct = targetEmergencyFund > 0 ? Math.min(100, Math.round((emergencyFund / targetEmergencyFund) * 100)) : 0;

  // Financial Health Score Factors — UNCHANGED LOGIC
  const healthFactors = useMemo(() => {
    const savingsScore = Math.min(100, Math.max(10, Math.round((savingsRate / 40) * 100)));
    const emergencyScore = Math.min(100, Math.max(10, Math.round((Number(emergencyCoverageMonths) / 6) * 100)));
    const goalScore = goals.length > 0 ? 80 : 30;
    const debtScore = totalIncome > 0 ? Math.max(20, Math.round(100 - ((totalExpenses * 0.3) / totalIncome) * 100)) : 70;
    const investScore = isDeficit ? 15 : (surplus > 10000 ? 90 : 65);
    const overallScore = Math.round(
      savingsScore * 0.25 + emergencyScore * 0.25 + goalScore * 0.20 + debtScore * 0.15 + investScore * 0.15
    );
    return {
      overall: Math.min(99, Math.max(30, overallScore)),
      savings: savingsScore, emergency: emergencyScore, goals: goalScore, debt: debtScore, investReadiness: investScore
    };
  }, [savingsRate, emergencyCoverageMonths, goals, totalIncome, totalExpenses, isDeficit, surplus]);

  // Dynamic CAGR — UNCHANGED LOGIC
  const scenarioCagr = useMemo(() => {
    let base = 12.0;
    if (risk === 'Aggressive') base = 14.5;
    else if (risk === 'Conservative') base = 8.5;
    else base = 11.5;
    if (selectedScenario === 'Optimistic') return (base + 3.0) / 100;
    if (selectedScenario === 'Conservative') return Math.max(4.0, base - 4.5) / 100;
    return base / 100;
  }, [risk, selectedScenario]);

  // Projection Data — UNCHANGED LOGIC
  const projectionData = useMemo(() => {
    if (recommendedInvestment <= 0) {
      return Array.from({ length: selectedHorizon + 1 }, (_, yr) => ({
        year: yr, label: yr === 0 ? 'Now' : `Yr ${yr}`, invested: 0, corpus: 0, returns: 0,
      }));
    }
    const data = [];
    const monthlyRate = scenarioCagr / 12;
    const initialCorpus = (user?.existingInvestments || 0);
    let currentCorpus = initialCorpus;
    let totalInvested = initialCorpus;
    data.push({ year: 0, label: 'Now', invested: Math.round(totalInvested), corpus: Math.round(currentCorpus), returns: 0 });
    for (let yr = 1; yr <= selectedHorizon; yr++) {
      for (let m = 0; m < 12; m++) {
        currentCorpus = (currentCorpus + recommendedInvestment) * (1 + monthlyRate);
        totalInvested += recommendedInvestment;
      }
      data.push({ year: yr, label: `Yr ${yr}`, invested: Math.round(totalInvested), corpus: Math.round(currentCorpus), returns: Math.max(0, Math.round(currentCorpus - totalInvested)) });
    }
    return data;
  }, [recommendedInvestment, scenarioCagr, selectedHorizon, user]);

  const finalProjection = projectionData.length > 0 ? projectionData[projectionData.length - 1] : null;

  // Allocation Data — UNCHANGED LOGIC
  const allocationPieData = useMemo(() => {
    if (!strategy?.allocations || strategy.allocations.length === 0) {
      return [
        { name: 'Core Equities & Index', value: 40, color: '#00D4AA', monthly: Math.round(recommendedInvestment * 0.40) },
        { name: 'Flexi-Cap Alpha Equities', value: 25, color: '#1E88E5', monthly: Math.round(recommendedInvestment * 0.25) },
        { name: 'US Tech & Global ETFs', value: 15, color: '#8B5CF6', monthly: Math.round(recommendedInvestment * 0.15) },
        { name: 'High-Yield Debt & Liquid', value: 10, color: '#F59E0B', monthly: Math.round(recommendedInvestment * 0.10) },
        { name: 'Sovereign Gold Hedge', value: 10, color: '#10B981', monthly: Math.round(recommendedInvestment * 0.10) },
      ];
    }
    return strategy.allocations.map(a => ({ name: a.name, value: a.percentage, color: a.color || '#00D4AA', monthly: a.monthlyAmount, category: a.category }));
  }, [strategy, recommendedInvestment]);

  return (
    <div className="space-y-4 sm:space-y-5 pb-10 font-sans">

      {/* ================================================================
          1. PORTFOLIO MANDATE SUMMARY (Structured Outer Card - rounded-2xl)
      ================================================================ */}
      <section className="financial-section-card p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
              <span className="font-bold text-[var(--color-text-primary)] text-base">
                {formatInvestorRiskLabel(effectiveRiskCategory)}
              </span>
              <span className="text-[var(--color-text-muted)]">·</span>
              <span>{horizon} Horizon</span>
              <span className="text-[var(--color-text-muted)]">·</span>
              <span>
                Risk Capacity: <strong className="font-mono font-bold text-[var(--color-text-primary)]">{riskCapacityScore}/100</strong>
              </span>
              <span className="text-[var(--color-text-muted)]">·</span>
              <span>
                Surplus: <strong className="font-mono font-bold text-[var(--color-accent-strong)]">{formatCurrency(surplus)}/mo</strong>
              </span>
              {primaryGoal && (
                <>
                  <span className="text-[var(--color-text-muted)] hidden md:inline">·</span>
                  <span className="hidden md:inline-flex text-[var(--color-text-secondary)] truncate max-w-[240px]">
                    Priority Goal: <strong className="ml-1 text-[var(--color-text-primary)]">{primaryGoal.title}</strong>
                  </span>
                </>
              )}
            </div>
            <p className="text-sm sm:text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
              Monthly deployment calibrated at{' '}
              <strong className="text-[var(--color-text-primary)] font-mono font-bold text-base sm:text-lg">{formatCurrency(recommendedInvestment)}/mo</strong>{' '}
              targeting <strong className="text-[var(--color-text-primary)] font-mono font-bold">{(scenarioCagr * 100).toFixed(1)}% CAGR</strong> multi-asset compounding blueprint.
            </p>
          </div>

          <div className="flex items-center w-full lg:w-auto shrink-0 pt-1 lg:pt-0">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setActiveView('recommendations')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              View Allocation
            </Button>
          </div>
        </div>
      </section>

      {/* ================================================================
          2. MARKET RADAR (Structured Standalone Outer Card - rounded-2xl)
      ================================================================ */}
      <section className="financial-section-card py-3 px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none text-sm min-w-0">
        <div className="flex items-center min-w-max">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs text-[var(--color-text-muted)] pr-6 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Market Radar</span>
          </div>
          <div className="flex items-center divide-x divide-[var(--color-border-subtle)]">
            {dashboardSymbols.map((sym) => {
              const q = quotes[sym];
              if (!q && isMarketLoading) {
                return (
                  <div key={sym} className="flex items-center gap-2.5 px-4 sm:px-6 first:pl-0">
                    <span className="text-[var(--color-text-secondary)] text-xs font-semibold">{sym}</span>
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                );
              }
              const isPos = (q?.changePct ?? 0) >= 0;
              const priceStr = q?.price
                ? (q.currency === 'USD' ? `$${q.price.toLocaleString('en-IN')}` : `₹${q.price.toLocaleString('en-IN')}`)
                : '—';
              return (
                <div key={sym} className="flex items-center gap-2.5 px-4 sm:px-6 first:pl-0">
                  <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase">{sym}</span>
                  <span className="text-[var(--color-text-primary)] font-mono font-bold text-sm sm:text-[15px]">{priceStr}</span>
                  {q?.changePct !== undefined && q?.changePct !== null && (
                    <span className={`font-mono font-bold text-xs sm:text-sm ${isPos ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isPos ? '+' : ''}{q.changePct.toFixed(2)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => refetchMarket()}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] shrink-0 cursor-pointer active:scale-90 transition-all ml-2"
          title="Refresh Live Data"
          aria-label="Refresh Market Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isMarketLoading ? 'animate-spin text-[var(--color-accent)]' : ''}`} />
        </button>
      </section>

      {/* ================================================================
          3. EXPENSE TRACKER & CAPITAL PROTECTION (Grid of 2 Distinct Major Cards - rounded-2xl)
      ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">

        {/* LEFT COLUMN (7 COLS): Expense Tracker Major Card */}
        <section className="lg:col-span-7 financial-section-card-interactive p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Expense Tracker
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Net disposable liquidity calibrated for investment
            </p>
          </div>

          {/* Dual Inflow / Outflow Internal Grid (No nested cards) */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 pt-1">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                Monthly Inflow
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--color-text-primary)]">
                {formatCurrency(totalIncome)}
              </div>
              <span className="text-xs text-[var(--color-text-secondary)] block">Gross liquidity</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                Monthly Outflow
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--color-text-primary)]">
                {formatCurrency(totalExpenses)}
              </div>
              <span className="text-xs text-[var(--color-text-secondary)] block">{expenses.length} logged categories</span>
            </div>
          </div>

          {/* PRIMARY HERO NUMBER: Investable Surplus */}
          <div className="pt-4 border-t border-[var(--color-border-subtle)]">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
                  {isDeficit ? 'Operating Deficit' : 'Investable Monthly Surplus'}
                </span>
                <div className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${isDeficit ? 'text-red-600' : 'text-[var(--color-accent-strong)]'}`}>
                  {isDeficit ? `-${formatCurrency(Math.abs(rawSurplus))}` : formatCurrency(surplus)}
                  <span className="text-sm text-[var(--color-text-muted)] font-normal font-sans ml-2">/month</span>
                </div>
              </div>

              <div className="sm:text-right space-y-1">
                <span className="text-sm font-bold text-emerald-600 block">
                  {isDeficit ? 'Surplus Constrained' : `+${savingsRate}% Savings Rate`}
                </span>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  Target Deployment: <strong className="text-[var(--color-text-primary)] font-mono font-bold">{formatCurrency(recommendedInvestment)}</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN (5 COLS): Capital Protection & Mandate Major Card */}
        <section className="lg:col-span-5 financial-section-card-interactive p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Capital Protection & Mandate
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Downside cushion & volatility threshold
            </p>
          </div>

          <div className="space-y-5 pt-1">
            {/* Emergency Runway Buffer */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Emergency Runway</span>
                <span className="font-mono font-bold text-lg sm:text-xl text-[var(--color-text-primary)]">{formatCurrency(emergencyFund)}</span>
              </div>
              <div className="w-full bg-[var(--color-surface-3)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(5, emergencyFundedPct)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                <span>{emergencyCoverageMonths} Months Cushion</span>
                <span>{emergencyFundedPct}% of 6M Target</span>
              </div>
            </div>

            {/* Risk Governance & Capacity */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--color-border-subtle)]">
              <div>
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Risk Mandate</span>
                <span className="font-bold text-[var(--color-text-primary)] text-base block">{effectiveRiskCategory}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Capacity Score</span>
                <span className="font-bold font-mono text-[var(--color-accent-strong)] text-base block">{riskCapacityScore}/100</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
              <span>Audit Score: <strong className="text-[var(--color-text-primary)] font-mono font-bold text-sm">{healthFactors.overall}/100</strong></span>
              <button
                onClick={() => setShowHealthFactors(!showHealthFactors)}
                className="text-[var(--color-accent)] hover:underline font-semibold transition-colors cursor-pointer group inline-flex items-center gap-1"
              >
                <span>{showHealthFactors ? 'Hide Details' : 'View Health Breakdown'}</span>
                <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">→</span>
              </button>
            </div>

            {showHealthFactors && (
              <div className="space-y-2 pt-2 text-xs text-[var(--color-text-secondary)] animate-fade-in border-t border-[var(--color-border-subtle)]">
                <div className="flex justify-between">
                  <span>Savings Discipline:</span>
                  <strong className="text-[var(--color-text-primary)] font-mono">{healthFactors.savings}/100</strong>
                </div>
                <div className="flex justify-between">
                  <span>Emergency Cushion:</span>
                  <strong className="text-[var(--color-text-primary)] font-mono">{healthFactors.emergency}/100</strong>
                </div>
                <div className="flex justify-between">
                  <span>Debt Capacity Buffer:</span>
                  <strong className="text-[var(--color-text-primary)] font-mono">{healthFactors.debt}/100</strong>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ================================================================
          4. TARGET ASSET ALLOCATION & ACTIVE GOALS (Grid of 2 Distinct Major Cards - rounded-2xl)
      ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">

        {/* LEFT (7 COLS): Target Asset Allocation Major Card */}
        <section className="lg:col-span-7 financial-section-card-interactive p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-baseline justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">
                Target Asset Allocation
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Quantitative multi-asset diversification blueprint
              </p>
            </div>
            <span className="text-sm sm:text-base font-bold text-[var(--color-accent-strong)] font-mono">
              {formatCurrency(recommendedInvestment)}/mo
            </span>
          </div>

          {/* Allocation Donut + Legend Layout (No nested cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-1">

            {/* Donut Chart (5 cols) */}
            <div className="sm:col-span-5 h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={350}
                    animationEasing="ease-out"
                  >
                    {allocationPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--color-bg)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<AllocationTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-[var(--color-text-primary)] font-mono">{allocationPieData.length}</span>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">CLASSES</span>
              </div>
            </div>

            {/* Legend List (7 cols) - Clean internal divider rows */}
            <div className="sm:col-span-7 space-y-1">
              {allocationPieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--color-border-subtle)] last:border-b-0 text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-[var(--color-text-primary)] truncate max-w-[180px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono">
                    <span className="text-[var(--color-text-secondary)] text-xs">{formatCurrency(item.monthly)}/mo</span>
                    <span className="font-bold text-[var(--color-accent-strong)] text-sm w-9 text-right">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--color-border-subtle)]">
            <button
              onClick={() => setActiveView('recommendations')}
              className="text-xs sm:text-sm font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1.5 cursor-pointer group"
            >
              <span>Inspect Strategy Blueprint & Underlying Holdings</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
            </button>
          </div>
        </section>

        {/* RIGHT (5 COLS): Active Financial Milestone Goals Major Card */}
        <section className="lg:col-span-5 financial-section-card-interactive p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-baseline justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">
                Active Goal Milestones
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Capital roadmaps & funding schedules
              </p>
            </div>
            <button
              onClick={() => setActiveView('goals')}
              className="text-xs sm:text-sm font-semibold text-[var(--color-accent)] hover:underline transition-colors cursor-pointer group inline-flex items-center gap-1"
            >
              <span>Manage Goals</span>
              <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">→</span>
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm font-semibold text-[var(--color-text-secondary)]">No active milestone portfolios configured</p>
              <button
                onClick={() => setActiveView('goals')}
                className="text-xs font-bold text-[var(--color-accent)] hover:underline cursor-pointer"
              >
                + Create First Milestone Roadmap
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {goals.slice(0, 3).map((g) => {
                const pct = Math.min(100, Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100));
                return (
                  <div key={g.id} className="space-y-1.5 py-2.5 border-b border-[var(--color-border-subtle)] last:border-b-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-[var(--color-text-primary)] truncate max-w-[180px]">{g.title}</span>
                      <span className="font-mono text-[var(--color-accent-strong)] font-semibold text-xs sm:text-sm">{formatCurrency(g.targetAmount)} ({g.targetDate})</span>
                    </div>
                    <div className="w-full bg-[var(--color-surface-3)] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${Math.max(5, pct)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                      <span>Funded: <strong className="text-[var(--color-text-primary)] font-mono font-bold">{formatCurrency(g.currentAmount || 0)}</strong></span>
                      <span className="font-semibold text-[var(--color-text-primary)]">{pct}% Completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>{goals.length} Goals Registered</span>
            <span className="text-emerald-600 font-semibold">{goals.length > 0 ? 'On Track' : 'Not Configured'}</span>
          </div>
        </section>
      </div>

      {/* ================================================================
          5. PROJECTED WEALTH TRAJECTORY (Full Width Structured Card - rounded-2xl)
      ================================================================ */}
      <section className="financial-section-card p-6 sm:p-8 space-y-6 min-w-0">

        {/* Trajectory Header & Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--color-accent-strong)]" />
              <span>Projected Wealth Trajectory</span>
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Simulated compounding at <strong className="text-[var(--color-text-primary)] font-mono font-bold">{(scenarioCagr * 100).toFixed(1)}% CAGR</strong> over {selectedHorizon}-year deployment
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Scenario Toggles */}
            <div className="inline-flex items-center p-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs">
              {(['Conservative', 'Base', 'Optimistic'] as ProjectionScenario[]).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setSelectedScenario(sc)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedScenario === sc
                      ? 'bg-[var(--color-card)] text-[var(--color-accent-strong)] shadow-xs font-bold'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>

            {/* Horizon Selector */}
            <div className="inline-flex items-center p-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs">
              {([5, 10, 15, 20, 25] as ProjectionHorizon[]).map((hz) => (
                <button
                  key={hz}
                  onClick={() => setSelectedHorizon(hz)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-bold cursor-pointer transition-all ${
                    selectedHorizon === hz
                      ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-xs'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {hz}Y
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recharts Area Chart Container */}
        <div className="h-72 sm:h-80 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#00D4AA" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#1E88E5" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={{ stroke: 'var(--color-border-subtle)' }} />
              <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v).slice(0, 5)} />
              <Tooltip content={<PremiumTooltip formatCurrency={formatCurrency} />} />
              <Area type="monotone" dataKey="corpus" stroke="#00D4AA" strokeWidth={2.5} fillOpacity={1} fill="url(#corpusGrad)" name="Corpus" animationDuration={350} animationEasing="ease-out" />
              <Area type="monotone" dataKey="invested" stroke="#1E88E5" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#investedGrad)" name="Invested" animationDuration={350} animationEasing="ease-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Final Projected Target Summary - Internal 3-Column Strip (No nested cards) */}
        {finalProjection && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[var(--color-border-subtle)]">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                Estimated Year {selectedHorizon} Corpus
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-accent-strong)] font-mono leading-tight">
                {formatCurrency(finalProjection.corpus)}
              </div>
              <span className="text-xs text-[var(--color-text-secondary)] block">Compounded portfolio milestone</span>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                Total Capital Deployed
              </span>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] font-mono leading-tight">
                {formatCurrency(finalProjection.invested)}
              </div>
              <span className="text-xs text-[var(--color-text-secondary)] block">Principal contributions</span>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                Estimated Compound Gains
              </span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono leading-tight">
                +{formatCurrency(finalProjection.returns)}
              </div>
              <span className="text-xs text-[var(--color-text-secondary)] block">Growth above capital principal</span>
            </div>
          </div>
        )}
      </section>

    </div>
  );
};



