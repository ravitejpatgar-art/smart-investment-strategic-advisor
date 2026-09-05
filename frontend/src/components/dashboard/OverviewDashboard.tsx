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

// ---- Modern Light Chart Tooltips ----
const PremiumTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (!active || !payload || !payload.length) return null;
  const cVal = payload.find((p: any) => p.dataKey === 'corpus')?.value as number;
  const iVal = payload.find((p: any) => p.dataKey === 'invested')?.value as number;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-xl font-sans text-xs">
      <div className="text-[#0F172A] font-bold mb-1.5">{label}</div>
      <div className="text-teal-700 font-mono font-bold">
        Corpus: {formatCurrency(cVal || 0)}
      </div>
      <div className="text-[#64748B] font-mono mt-0.5">
        Invested: {formatCurrency(iVal || 0)}
      </div>
    </div>
  );
};

const AllocationTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-2.5 shadow-xl text-xs">
      <div className="text-[#0F172A] font-bold">{item.name}</div>
      <div className="text-teal-700 font-extrabold font-mono">{item.value}%</div>
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

  // Risk styling
  const riskBadgeStyle = effectiveRiskCategory === 'Aggressive'
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : (effectiveRiskCategory === 'Conservative'
      ? 'bg-blue-50 text-blue-800 border-blue-200'
      : 'bg-teal-50 text-teal-800 border-teal-200');

  return (
    <div className="space-y-4 sm:space-y-5 pb-10 font-sans">

      {/* ================================================================
          1. COMPACT CLIENT CONTEXT BAR
      ================================================================ */}
      <section className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className={`text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${riskBadgeStyle}`}>
              {effectiveRiskCategory} Mandate
            </span>
            <span className="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#475569] border border-slate-200">
              {horizon}
            </span>
            <span className="text-[10.5px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-[#475569] border border-slate-200">
              Capacity: <strong className="text-[#0F172A]">{riskCapacityScore}/100</strong>
            </span>
            <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              {formatCurrency(surplus)}/mo surplus
            </span>
            {primaryGoal && (
              <span className="hidden md:inline-flex text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 truncate max-w-[200px]">
                Goal: {primaryGoal.title}
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Monthly deployment calibrated at{' '}
            <strong className="text-[#0F172A] font-mono">{formatCurrency(recommendedInvestment)}/mo</strong>{' '}
            targeting {(scenarioCagr * 100).toFixed(1)}% CAGR multi-asset compounding blueprint.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 pt-1 lg:pt-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('recommendations')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="flex-1 lg:flex-initial"
          >
            View Allocation
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveView('ai')}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            className="flex-1 lg:flex-initial"
          >
            Ask VestIQ
          </Button>
        </div>
      </section>

      {/* ================================================================
          2. COMPACT MARKET RADAR STRIP
      ================================================================ */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl py-2 px-3 sm:px-4 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none text-xs min-w-0 shadow-2xs">
        <div className="flex items-center gap-5 sm:gap-6 min-w-max">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[10.5px] font-bold text-[#0F172A] tracking-wider uppercase">Market Radar</span>
          </div>
          {dashboardSymbols.map((sym) => {
            const q = quotes[sym];
            if (!q && isMarketLoading) {
              return (
                <div key={sym} className="flex items-center gap-2">
                  <span className="text-[#64748B] text-xs font-semibold">{sym}</span>
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
                <span className="text-[#64748B] text-xs">{sym}</span>
                <span className="text-[#0F172A] font-mono font-bold text-xs">{priceStr}</span>
                {q?.changePct !== undefined && q?.changePct !== null && (
                  <span className={`font-mono font-bold text-[11px] ${isPos ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPos ? '+' : ''}{q.changePct.toFixed(2)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={() => refetchMarket()}
          className="text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 p-1 rounded shrink-0 cursor-pointer active:scale-90 transition-all"
          title="Refresh Live Data"
          aria-label="Refresh Market Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isMarketLoading ? 'animate-spin text-teal-600' : ''}`} />
        </button>
      </section>

      {/* ================================================================
          3. PRIMARY FINANCIAL + RISK SECTION (Asymmetric Grouping)
      ================================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-w-0">

        {/* LEFT COLUMN (7 COLS): Cashflow & Surplus Group */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Operating Cash Flow & Surplus</span>
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">Net disposable liquidity calibrated for investment</p>
            </div>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-[#475569] border border-slate-200">
              MONTHLY AUDIT
            </span>
          </div>

          {/* Dual Inflow / Outflow Secondary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Monthly Inflow</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-[#0F172A]">
                {formatCurrency(totalIncome)}
              </div>
              <span className="text-[10.5px] text-[#94A3B8] truncate block">Gross Liquidity</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Monthly Outflow</span>
                <TrendingDown className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-[#0F172A]">
                {formatCurrency(totalExpenses)}
              </div>
              <span className="text-[10.5px] text-[#94A3B8] truncate block">{expenses.length} Logged Categories</span>
            </div>
          </div>

          {/* PRIMARY HERO NUMBER: Investable Surplus */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <span className="text-[10.5px] font-bold text-teal-900 uppercase tracking-wider block">
                {isDeficit ? 'Operating Deficit' : 'Investable Monthly Surplus'}
              </span>
              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${isDeficit ? 'text-red-600' : 'text-teal-800'}`}>
                {isDeficit ? `-${formatCurrency(Math.abs(rawSurplus))}` : formatCurrency(surplus)}
                <span className="text-xs text-[#64748B] font-normal font-sans ml-1.5">/month</span>
              </div>
            </div>

            <div className="sm:text-right space-y-0.5">
              <span className="text-xs font-bold text-emerald-700 block">
                {isDeficit ? 'Surplus Constrained' : `+${savingsRate}% Savings Rate`}
              </span>
              <span className="text-[11px] text-[#64748B]">
                Target Deployment: <strong className="text-[#0F172A] font-mono">{formatCurrency(recommendedInvestment)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 COLS): Risk, Emergency Runway & Safety Group */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Capital Protection & Mandate</span>
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">Downside cushion & volatility threshold</p>
            </div>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              GRADE A
            </span>
          </div>

          <div className="space-y-3">
            {/* Emergency Runway Buffer */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#64748B] font-semibold">Emergency Runway</span>
                <span className="font-mono font-bold text-[#0F172A]">{formatCurrency(emergencyFund)}</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(5, emergencyFundedPct)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10.5px] text-[#64748B]">
                <span>{emergencyCoverageMonths} Months Cushion</span>
                <span>{emergencyFundedPct}% of 6M Target</span>
              </div>
            </div>

            {/* Risk Governance & Capacity */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Risk Mandate</span>
                <span className="font-bold text-[#0F172A] text-sm mt-0.5 block">{effectiveRiskCategory}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Capacity Score</span>
                <span className="font-bold font-mono text-teal-700 text-sm mt-0.5 block">{riskCapacityScore}/100</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9] text-[11px] text-[#64748B]">
            <span>Audit Score: <strong className="text-[#0F172A] font-mono">{healthFactors.overall}/100</strong></span>
            <button
              onClick={() => setShowHealthFactors(!showHealthFactors)}
              className="text-teal-700 hover:text-teal-800 font-semibold transition-colors cursor-pointer"
            >
              {showHealthFactors ? 'Hide Details' : 'View Health Breakdown'}
            </button>
          </div>

          {showHealthFactors && (
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 text-[11px] border border-[#E2E8F0] animate-fade-in">
              <div className="flex justify-between text-[#64748B]">
                <span>Savings Discipline:</span>
                <strong className="text-[#0F172A] font-mono">{healthFactors.savings}/100</strong>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Emergency Cushion:</span>
                <strong className="text-[#0F172A] font-mono">{healthFactors.emergency}/100</strong>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Debt Capacity Buffer:</span>
                <strong className="text-[#0F172A] font-mono">{healthFactors.debt}/100</strong>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          4. ASSET ALLOCATION PANEL + ACTIVE MILESTONE GOALS
      ================================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-w-0">

        {/* LEFT (7 COLS): Asset Allocation Panel */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>Target Asset Allocation Distribution</span>
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">Quantitative multi-asset diversification blueprint</p>
            </div>
            <span className="text-xs font-bold text-teal-800 font-mono">
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<AllocationTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-[#0F172A] font-mono">{allocationPieData.length}</span>
                <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">CLASSES</span>
              </div>
            </div>

            {/* Legend List (7 cols) */}
            <div className="sm:col-span-7 space-y-1.5">
              {allocationPieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0] hover:bg-slate-100 transition-all text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-[#0F172A] truncate max-w-[140px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 font-mono">
                    <span className="text-[#64748B] text-[11px]">{formatCurrency(item.monthly)}/mo</span>
                    <span className="font-bold text-teal-700 text-xs w-7 text-right">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('recommendations')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5 text-teal-600" />}
            className="w-full justify-center"
          >
            Inspect Strategy Blueprint & Underlying Holdings
          </Button>
        </div>

        {/* RIGHT (5 COLS): Active Financial Milestone Goals */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-teal-600" />
                <span>Active Goal Milestones</span>
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">Capital roadmaps and funding schedules</p>
            </div>
            <button
              onClick={() => setActiveView('goals')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
            >
              Manage Goals →
            </button>
          </div>

          {goals.length === 0 ? (
            <EmptyState
              icon={<Target className="w-6 h-6 text-teal-600" />}
              title="No Active Milestone Portfolios"
              description="Configure your milestone roadmap to track SIP timelines and completion probabilities."
              actionLabel="Create First Milestone"
              onAction={() => setActiveView('goals')}
              className="py-6 bg-slate-50 rounded-xl"
            />
          ) : (
            <div className="space-y-2.5">
              {goals.slice(0, 3).map((g) => {
                const pct = Math.min(100, Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100));
                return (
                  <div key={g.id} className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0F172A] truncate max-w-[150px]">{g.title}</span>
                      <span className="font-mono text-teal-700 font-semibold">{formatCurrency(g.targetAmount)} ({g.targetDate})</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${Math.max(5, pct)}%` }} />
                    </div>
                    <div className="flex justify-between text-[10.5px] text-[#64748B]">
                      <span>Funded: <strong className="text-[#0F172A] font-mono">{formatCurrency(g.currentAmount || 0)}</strong></span>
                      <span className="font-semibold text-[#0F172A]">{pct}% Completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
            <span>{goals.length} Goals Registered</span>
            <span className="text-teal-700 font-semibold">{goals.length > 0 ? 'On Track' : 'Not Configured'}</span>
          </div>
        </div>
      </section>

      {/* ================================================================
          5. PROJECTED WEALTH TRAJECTORY (Dominant Visual Hero)
      ================================================================ */}
      <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">

        {/* Trajectory Header & Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-600" />
              <span>Projected Wealth Trajectory</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Simulated compounding at <strong className="text-[#0F172A]">{(scenarioCagr * 100).toFixed(1)}% CAGR</strong> over {selectedHorizon} years deployment
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Scenario Toggles */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-[#E2E8F0] text-xs">
              {(['Conservative', 'Base', 'Optimistic'] as ProjectionScenario[]).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setSelectedScenario(sc)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedScenario === sc ? 'bg-white text-teal-800 shadow-2xs font-bold' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>

            {/* Horizon Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-[#E2E8F0] text-xs">
              {([5, 10, 15, 20, 25] as ProjectionHorizon[]).map((hz) => (
                <button
                  key={hz}
                  onClick={() => setSelectedHorizon(hz)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-all ${
                    selectedHorizon === hz ? 'bg-[#00D4AA] text-[#0F172A] shadow-2xs' : 'text-[#64748B] hover:text-[#0F172A]'
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
              <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
              <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v).slice(0, 5)} />
              <Tooltip content={<PremiumTooltip formatCurrency={formatCurrency} />} />
              <Area type="monotone" dataKey="corpus" stroke="#00D4AA" strokeWidth={2.5} fillOpacity={1} fill="url(#corpusGrad)" name="Corpus" animationDuration={350} animationEasing="ease-out" />
              <Area type="monotone" dataKey="invested" stroke="#1E88E5" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#investedGrad)" name="Invested" animationDuration={350} animationEasing="ease-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Final Projected Target Summary Strip */}
        {finalProjection && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs">
            <div className="space-y-0.5">
              <span className="text-[10.5px] font-bold text-[#64748B] uppercase tracking-wider block">Estimated Year {selectedHorizon} Corpus</span>
              <div className="text-xl sm:text-2xl font-black text-teal-800 font-mono leading-tight">
                {formatCurrency(finalProjection.corpus)}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10.5px] font-bold text-[#64748B] uppercase tracking-wider block">Total Capital Deployed</span>
              <div className="text-base sm:text-lg font-bold text-[#0F172A] font-mono leading-tight">
                {formatCurrency(finalProjection.invested)}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10.5px] font-bold text-[#64748B] uppercase tracking-wider block">Estimated Compound Gains</span>
              <div className="text-base sm:text-lg font-bold text-emerald-600 font-mono leading-tight">
                +{formatCurrency(finalProjection.returns)}
              </div>
            </div>
          </div>
        )}
      </section>

    </div>
  );
};
