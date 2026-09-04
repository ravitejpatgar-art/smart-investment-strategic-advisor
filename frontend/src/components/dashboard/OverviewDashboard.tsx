import React, { useState, useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import {
  Target,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
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
import { Skeleton, EmptyState, Button } from '../common';

type ProjectionHorizon = 5 | 10 | 15 | 20 | 25;
type ProjectionScenario = 'Conservative' | 'Base' | 'Optimistic';

// ---- Institutional Chart Tooltips ----
const PremiumTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (!active || !payload || !payload.length) return null;
  const cVal = payload.find((p: any) => p.dataKey === 'corpus')?.value as number;
  const iVal = payload.find((p: any) => p.dataKey === 'invested')?.value as number;
  return (
    <div className="bg-[#0A1022] border border-white/[0.12] rounded-lg p-3 shadow-xl font-sans text-xs">
      <div className="text-white font-bold mb-1.5">{label}</div>
      <div className="text-[#00D4AA] font-mono font-bold">
        Corpus: {formatCurrency(cVal || 0)}
      </div>
      <div className="text-[#8A94A6] font-mono mt-0.5">
        Invested: {formatCurrency(iVal || 0)}
      </div>
    </div>
  );
};

const AllocationTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-[#0A1022] border border-white/[0.12] rounded-lg p-2.5 shadow-xl text-xs">
      <div className="text-white font-bold">{item.name}</div>
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
        { name: 'Sovereign Gold Hedge', value: 10, color: '#00C853', monthly: Math.round(recommendedInvestment * 0.10) },
      ];
    }
    return strategy.allocations.map(a => ({ name: a.name, value: a.percentage, color: a.color || '#00D4AA', monthly: a.monthlyAmount, category: a.category }));
  }, [strategy, recommendedInvestment]);

  // Risk styling - Restrained amber/teal instead of alarming bright red
  const riskBadgeStyle = effectiveRiskCategory === 'Aggressive'
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    : (effectiveRiskCategory === 'Conservative'
      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      : 'bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/30');

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">

      {/* ================================================================
          1. COMPACT CLIENT CONTEXT BAR
      ================================================================ */}
      <section className="animate-entrance-1 bg-[#0A1022] border border-white/[0.08] rounded-xl p-3.5 sm:p-4.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-md">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className={`text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border transition-colors duration-150 ${riskBadgeStyle}`}>
              {effectiveRiskCategory} Mandate
            </span>
            <span className="text-[10px] sm:text-[10.5px] font-medium px-2 py-0.5 rounded bg-white/[0.04] text-[#A0AEC0] border border-white/[0.06]">
              {horizon}
            </span>
            <span className="text-[10px] sm:text-[10.5px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#A0AEC0] border border-white/[0.06]">
              Capacity: <strong className="text-white">{riskCapacityScore}/100</strong>
            </span>
            <span className="text-[10px] sm:text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20">
              {formatCurrency(surplus)}/mo surplus
            </span>
            {primaryGoal && (
              <span className="hidden md:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1E88E5]/10 text-[#1E88E5] border border-[#1E88E5]/20 truncate max-w-[200px]">
                Goal: {primaryGoal.title}
              </span>
            )}
          </div>
          <p className="text-xs text-[#8A94A6] leading-relaxed">
            Monthly deployment calibrated at{' '}
            <strong className="text-white font-mono">{formatCurrency(recommendedInvestment)}/mo</strong>{' '}
            targeting {(scenarioCagr * 100).toFixed(1)}% CAGR multi-asset compounding blueprint.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 pt-1 lg:pt-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('recommendations')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />}
            className="flex-1 lg:flex-initial group"
          >
            View Allocation
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveView('ai')}
            leftIcon={<Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-180" />}
            className="flex-1 lg:flex-initial group"
          >
            Ask VestIQ
          </Button>
        </div>
      </section>

      {/* ================================================================
          2. COMPACT MARKET RADAR STRIP
      ================================================================ */}
      <section className="animate-entrance-2 bg-[#0A1022] border border-white/[0.06] rounded-lg py-2 px-3 sm:px-4 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none text-xs min-w-0">
        <div className="flex items-center gap-5 sm:gap-6 min-w-max">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
            <span className="text-[10.5px] font-bold text-white tracking-wider uppercase">Market Radar</span>
          </div>
          {dashboardSymbols.map((sym) => {
            const q = quotes[sym];
            if (!q && isMarketLoading) {
              return (
                <div key={sym} className="flex items-center gap-2">
                  <span className="text-[#8A94A6] text-xs font-semibold">{sym}</span>
                  <Skeleton className="h-3.5 w-14 rounded" />
                </div>
              );
            }
            const isPos = (q?.changePct ?? 0) >= 0;
            const priceStr = q?.price
              ? (q.currency === 'USD' ? `$${q.price.toLocaleString('en-IN')}` : `₹${q.price.toLocaleString('en-IN')}`)
              : '—';
            return (
              <div key={sym} className="flex items-center gap-2">
                <span className="text-[#8A94A6] text-xs">{sym}</span>
                <span className="text-white font-mono font-bold text-xs">{priceStr}</span>
                {q?.changePct !== undefined && q?.changePct !== null && (
                  <span className={`font-mono font-bold text-[11px] ${isPos ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
                    {isPos ? '+' : ''}{q.changePct.toFixed(2)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={() => refetchMarket()}
          className="text-[#8A94A6] hover:text-white hover:bg-white/[0.06] p-1 rounded shrink-0 cursor-pointer active:scale-90 transition-all duration-150 group"
          title="Refresh Live Data"
          aria-label="Refresh Market Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isMarketLoading ? 'animate-spin text-[#00D4AA]' : 'group-hover:rotate-45 transition-transform duration-200'}`} />
        </button>
      </section>

      {/* ================================================================
          3. PRIMARY FINANCIAL + RISK SECTION (Asymmetric Grouping)
      ================================================================ */}
      <section className="animate-entrance-3 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-w-0">

        {/* LEFT COLUMN (7 COLS): Cashflow & Surplus Group (Dominant Financial Section) */}
        <div className="lg:col-span-7 bg-[#101827] border border-white/[0.08] rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-white/[0.12] transition-colors duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#00D4AA]" />
                <span>Operating Cash Flow & Surplus</span>
              </h2>
              <p className="text-[11px] text-[#8A94A6] mt-0.5">Net disposable liquidity calibrated for investment</p>
            </div>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#A0AEC0] border border-white/[0.06]">
              MONTHLY AUDIT
            </span>
          </div>

          {/* Dual Inflow / Outflow Secondary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#0A1022] border border-white/[0.04] hover:border-white/[0.10] transition-colors duration-150 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider">Monthly Inflow</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#00C853]" />
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-white">
                {formatCurrency(totalIncome)}
              </div>
              <span className="text-[10.5px] text-[#8A94A6] truncate block">Gross Liquidity</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0A1022] border border-white/[0.04] hover:border-white/[0.10] transition-colors duration-150 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider">Monthly Outflow</span>
                <TrendingDown className="w-3.5 h-3.5 text-[#FF5252]" />
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-white">
                {formatCurrency(totalExpenses)}
              </div>
              <span className="text-[10.5px] text-[#8A94A6] truncate block">{expenses.length} Logged Categories</span>
            </div>
          </div>

          {/* PRIMARY HERO NUMBER: Investable Surplus */}
          <div className="p-4 rounded-lg bg-[#0A1022] border border-[#00D4AA]/25 hover:border-[#00D4AA]/40 transition-colors duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="space-y-1">
              <span className="text-[10.5px] font-bold text-[#8A94A6] uppercase tracking-wider block">
                {isDeficit ? 'Operating Deficit' : 'Investable Monthly Surplus'}
              </span>
              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${isDeficit ? 'text-[#FF5252]' : 'text-[#00D4AA]'}`}>
                {isDeficit ? `-${formatCurrency(Math.abs(rawSurplus))}` : formatCurrency(surplus)}
                <span className="text-xs text-[#8A94A6] font-normal font-sans ml-1.5">/month</span>
              </div>
            </div>

            <div className="sm:text-right space-y-0.5">
              <span className="text-xs font-bold text-[#00C853] block">
                {isDeficit ? 'Surplus Constrained' : `+${savingsRate}% Savings Rate`}
              </span>
              <span className="text-[11px] text-[#8A94A6]">
                Target Deployment: <strong className="text-white font-mono">{formatCurrency(recommendedInvestment)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 COLS): Risk, Emergency Runway & Safety Group */}
        <div className="lg:col-span-5 bg-[#101827] border border-white/[0.08] rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-white/[0.12] transition-colors duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E88E5]" />
                <span>Capital Protection & Mandate</span>
              </h2>
              <p className="text-[11px] text-[#8A94A6] mt-0.5">Downside cushion & volatility threshold</p>
            </div>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20">
              GRADE A
            </span>
          </div>

          <div className="space-y-3">
            {/* Emergency Runway Buffer */}
            <div className="p-3 rounded-lg bg-[#0A1022] border border-white/[0.04] hover:border-white/[0.10] transition-colors duration-150 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8A94A6] font-semibold">Emergency Runway</span>
                <span className="font-mono font-bold text-white">{formatCurrency(emergencyFund)}</span>
              </div>
              <div className="w-full bg-[#101827] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1E88E5] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(5, emergencyFundedPct)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10.5px] text-[#8A94A6]">
                <span>{emergencyCoverageMonths} Months Cushion</span>
                <span>{emergencyFundedPct}% of 6M Target</span>
              </div>
            </div>

            {/* Risk Governance & Capacity */}
            <div className="p-3 rounded-lg bg-[#0A1022] border border-white/[0.04] hover:border-white/[0.10] transition-colors duration-150 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider block">Risk Mandate</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{effectiveRiskCategory}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider block">Capacity Score</span>
                <span className="font-bold font-mono text-[#00D4AA] text-sm mt-0.5 block">{riskCapacityScore}/100</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px] text-[#8A94A6]">
            <span>Audit Score: <strong className="text-white font-mono">{healthFactors.overall}/100</strong></span>
            <button
              onClick={() => setShowHealthFactors(!showHealthFactors)}
              className="text-[#00D4AA] hover:text-[#14F1D9] transition-colors duration-150 cursor-pointer"
            >
              {showHealthFactors ? 'Hide Details' : 'View Health Breakdown'}
            </button>
          </div>

          {showHealthFactors && (
            <div className="space-y-1.5 p-2.5 rounded-lg bg-[#0A1022] text-[11px] border border-white/[0.04] animate-entrance-1">
              <div className="flex justify-between text-[#8A94A6]">
                <span>Savings Discipline:</span>
                <strong className="text-white font-mono">{healthFactors.savings}/100</strong>
              </div>
              <div className="flex justify-between text-[#8A94A6]">
                <span>Emergency Cushion:</span>
                <strong className="text-white font-mono">{healthFactors.emergency}/100</strong>
              </div>
              <div className="flex justify-between text-[#8A94A6]">
                <span>Debt Capacity Buffer:</span>
                <strong className="text-white font-mono">{healthFactors.debt}/100</strong>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          4. ASSET ALLOCATION PANEL + ACTIVE MILESTONE GOALS
      ================================================================ */}
      <section className="animate-entrance-4 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-w-0">

        {/* LEFT (7 COLS): Asset Allocation Panel */}
        <div className="lg:col-span-7 bg-[#101827] border border-white/[0.08] rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-white/[0.12] transition-colors duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#00D4AA]" />
                <span>Target Asset Allocation Distribution</span>
              </h2>
              <p className="text-[11px] text-[#8A94A6] mt-0.5">Quantitative multi-asset diversification blueprint</p>
            </div>
            <span className="text-xs font-bold text-[#00D4AA] font-mono">
              {formatCurrency(recommendedInvestment)}/mo
            </span>
          </div>

          {/* Allocation Donut + Legend Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">

            {/* Donut Chart (5 cols) */}
            <div className="sm:col-span-5 h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={350}
                    animationEasing="ease-out"
                  >
                    {allocationPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#101827" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<AllocationTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-white font-mono">{allocationPieData.length}</span>
                <span className="text-[9px] font-bold text-[#8A94A6] uppercase tracking-wider">CLASSES</span>
              </div>
            </div>

            {/* Legend List (7 cols) */}
            <div className="sm:col-span-7 space-y-1.5">
              {allocationPieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-[#0A1022] border border-white/[0.04] hover:border-white/[0.10] hover:bg-[#0E172A] transition-all duration-150 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-white truncate max-w-[140px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 font-mono">
                    <span className="text-[#8A94A6] text-[11px]">{formatCurrency(item.monthly)}/mo</span>
                    <span className="font-bold text-[#00D4AA] text-xs w-7 text-right">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('recommendations')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#00D4AA] group-hover:translate-x-0.5 transition-transform duration-150" />}
            className="w-full justify-center group"
          >
            Inspect Strategy Blueprint & Underlying Holdings
          </Button>
        </div>

        {/* RIGHT (5 COLS): Active Financial Milestone Goals */}
        <div className="lg:col-span-5 bg-[#101827] border border-white/[0.08] rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-white/[0.12] transition-colors duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-[#00D4AA]" />
                <span>Active Goal Milestones</span>
              </h2>
              <p className="text-[11px] text-[#8A94A6] mt-0.5">Capital roadmaps and funding schedules</p>
            </div>
            <button
              onClick={() => setActiveView('goals')}
              className="text-xs font-semibold text-[#00D4AA] hover:text-[#14F1D9] transition-colors duration-150 cursor-pointer"
            >
              Manage Goals →
            </button>
          </div>

          {goals.length === 0 ? (
            <EmptyState
              icon={<Target className="w-6 h-6 text-[#00D4AA]" />}
              title="No Active Milestone Portfolios"
              description="Configure your milestone roadmap to track SIP timelines and completion probabilities."
              actionLabel="Create First Milestone"
              onAction={() => setActiveView('goals')}
              className="py-6 bg-[#0A1022]"
            />
          ) : (
            <div className="space-y-2.5">
              {goals.slice(0, 3).map((g) => {
                const pct = Math.min(100, Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100));
                return (
                  <div key={g.id} className="p-3 rounded-lg bg-[#0A1022] border border-white/[0.04] hover:border-white/[0.10] transition-colors duration-150 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white truncate max-w-[150px]">{g.title}</span>
                      <span className="font-mono text-[#00D4AA] font-semibold">{formatCurrency(g.targetAmount)} ({g.targetDate})</span>
                    </div>
                    <div className="w-full bg-[#101827] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#00D4AA] h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${Math.max(5, pct)}%` }} />
                    </div>
                    <div className="flex justify-between text-[10.5px] text-[#8A94A6]">
                      <span>Funded: <strong className="text-white font-mono">{formatCurrency(g.currentAmount || 0)}</strong></span>
                      <span className="font-semibold text-white">{pct}% Completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs text-[#8A94A6]">
            <span>{goals.length} Goals Registered</span>
            <span className="text-[#00D4AA] font-semibold">{goals.length > 0 ? 'On Track' : 'Not Configured'}</span>
          </div>
        </div>
      </section>

      {/* ================================================================
          5. PROJECTED WEALTH TRAJECTORY (Dominant Visual Hero)
      ================================================================ */}
      <section className="animate-entrance-5 bg-[#101827] border border-white/[0.10] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl hover:border-white/[0.14] transition-colors duration-150">

        {/* Trajectory Header & Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00D4AA]" />
              <span>Projected Wealth Trajectory</span>
            </h2>
            <p className="text-xs text-[#8A94A6] mt-0.5">
              Simulated compounding at <strong className="text-white">{(scenarioCagr * 100).toFixed(1)}% CAGR</strong> over {selectedHorizon} years deployment
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Scenario Toggles */}
            <div className="flex items-center bg-[#0A1022] p-1 rounded-lg border border-white/[0.06] text-xs">
              {(['Conservative', 'Base', 'Optimistic'] as ProjectionScenario[]).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setSelectedScenario(sc)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all duration-150 ease-out active:scale-95 focus-visible:ring-1 focus-visible:ring-[#00D4AA] cursor-pointer ${
                    selectedScenario === sc ? 'bg-[#101827] text-[#00D4AA] border border-white/[0.08] shadow-xs' : 'text-[#8A94A6] hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>

            {/* Horizon Selector */}
            <div className="flex items-center gap-1 bg-[#0A1022] p-1 rounded-lg border border-white/[0.06] text-xs">
              {([5, 10, 15, 20, 25] as ProjectionHorizon[]).map((hz) => (
                <button
                  key={hz}
                  onClick={() => setSelectedHorizon(hz)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer transition-all duration-150 ease-out active:scale-95 focus-visible:ring-1 focus-visible:ring-[#00D4AA] ${
                    selectedHorizon === hz ? 'bg-[#00D4AA] text-[#050816] shadow-xs' : 'text-[#8A94A6] hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {hz}Y
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 sm:h-80 w-full pt-2">
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
              <XAxis dataKey="label" stroke="#5A667A" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <YAxis stroke="#5A667A" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v).slice(0, 5)} />
              <Tooltip content={<PremiumTooltip formatCurrency={formatCurrency} />} />
              <Area type="monotone" dataKey="corpus" stroke="#00D4AA" strokeWidth={2.5} fillOpacity={1} fill="url(#corpusGrad)" name="Corpus" animationDuration={350} animationEasing="ease-out" />
              <Area type="monotone" dataKey="invested" stroke="#1E88E5" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#investedGrad)" name="Invested" animationDuration={350} animationEasing="ease-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Final Projected Target Summary Strip with End-Value Callout */}
        {finalProjection && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-[#0A1022] border border-white/[0.06] hover:border-white/[0.10] transition-colors duration-150 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider block">Estimated Year {selectedHorizon} Corpus</span>
              <div className="text-xl sm:text-2xl font-black text-[#00D4AA] font-mono leading-tight">
                {formatCurrency(finalProjection.corpus)}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider block">Total Capital Deployed</span>
              <div className="text-base sm:text-lg font-bold text-white font-mono leading-tight">
                {formatCurrency(finalProjection.invested)}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider block">Estimated Compound Gains</span>
              <div className="text-base sm:text-lg font-bold text-[#00C853] font-mono leading-tight">
                +{formatCurrency(finalProjection.returns)}
              </div>
            </div>
          </div>
        )}
      </section>

    </div>
  );
};
