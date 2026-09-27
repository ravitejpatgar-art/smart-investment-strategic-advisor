import React, { useMemo, useState } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Layers,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { RECOMMENDED_PLATFORMS } from '../../services/strategyEngine';
import { useMarketQuotes } from '../../hooks/useMarketQuotes';
import type { MarketQuote } from '../../services/marketApi';
import type { RecommendedAsset } from '../../types';
import { HistoricalPerformanceChart } from './HistoricalPerformanceChart';
import { ScenarioSimulatorView } from '../analytics/ScenarioSimulatorView';
import { PortfolioRebalanceView } from '../analytics/PortfolioRebalanceView';

import { RecommendationCard } from './RecommendationCard';
import type { WhyChosenFactor } from '../../services/recommendation/types';

type RecommendationTab = 'blueprint' | 'engine' | 'scenario' | 'rebalance';

// Data Provenance & Freshness Badge Component
export const ProvenanceMarketBadge: React.FC<{
  quote?: MarketQuote | null;
  assetCategory?: string;
  assetType?: string;
}> = ({ quote, assetCategory, assetType }) => {
  const isMF = quote?.assetType === 'MUTUAL_FUND' || quote?.instrumentType === 'MUTUAL_FUND' || (assetType === 'DEBT' && (assetCategory?.includes('Fund') || assetCategory?.includes('Liquid'))) || (assetCategory?.includes('Cap') || assetCategory?.includes('Index Mutual Fund'));
  const isBond = quote?.assetType === 'BOND' || quote?.instrumentType === 'BOND' || assetCategory === 'Corporate Debt' || (assetType === 'DEBT' && !isMF);

  if (!quote || quote.price === null || quote.price === undefined || quote.quoteStatus === 'UNAVAILABLE' || quote.status === 'UNAVAILABLE') {
    const unavailableLabel = isMF
      ? 'Latest NAV unavailable'
      : isBond
      ? 'Latest trade unavailable'
      : 'Live quote unavailable';

    const sourceName = quote?.source || (isMF ? 'AMFI Official Directory' : (isBond ? 'NSE Corporate Bond Platform (CBRICS)' : 'Market Feed'));

    return (
      <div className="p-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-[var(--color-text-muted)] italic">{unavailableLabel}</span>
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-500/10 border border-zinc-500/30 text-zinc-500">
            UNAVAILABLE
          </span>
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-[var(--color-text-muted)] pt-0.5">
          <span>Source: {sourceName}</span>
          <span className="italic">Verified Registry</span>
        </div>
      </div>
    );
  }

  const isPositive = (quote.changePct ?? 0) >= 0;
  const quoteStatus = quote.quoteStatus || (
    isMF ? 'EOD_NAV' : (
      isBond ? 'LAST_TRADED' : (
        quote.isLive ? 'LIVE' : (quote.status === 'DELAYED' ? 'DELAYED' : 'LAST_TRADED')
      )
    )
  );

  const renderBadge = () => {
    switch (quoteStatus) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        );
      case 'DELAYED':
        return (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent-strong)]">
            15M DELAY
          </span>
        );
      case 'EOD_NAV':
        return (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-600">
            LATEST NAV
          </span>
        );
      case 'LAST_TRADED':
      default:
        return (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-600">
            LAST TRADED
          </span>
        );
    }
  };

  const currencySymbol = quote.currency === 'USD' ? '$' : '₹';
  const formattedPrice = `${currencySymbol}${quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const provenanceSource = quote.source || (isMF ? 'AMFI' : (isBond ? 'NSE CBRICS' : 'Exchange Feed'));
  const dateOrTime = isMF
    ? `NAV date: ${quote.navDate || quote.asOf || 'Published'}`
    : isBond
    ? `Trade date: ${quote.asOf || quote.timestamp || 'Reported'}`
    : `Updated: ${quote.displayTimestampIst ? quote.displayTimestampIst.split(',')[1]?.trim() || quote.displayTimestampIst : (quote.asOf || 'Market Hours')}`;

  return (
    <div className="p-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[var(--color-text-primary)] text-sm sm:text-base">
            {formattedPrice}
          </span>
          {quote.changePct !== null && quote.changePct !== undefined && (
            <span className={`font-mono text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{quote.changePct.toFixed(2)}%
            </span>
          )}
        </div>
        {renderBadge()}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)] border-t border-[var(--color-border-subtle)] pt-1">
        <span className="truncate max-w-[170px]">{dateOrTime}</span>
        <span className="truncate max-w-[140px] font-medium text-[var(--color-text-muted)]">Source: {provenanceSource}</span>
      </div>
    </div>
  );
};

// Backwards-compatible alias for existing components
export const MarketFreshnessBadge = ProvenanceMarketBadge;

// Deterministic Why Selected Expandable Panel
export const WhySelectedPanel: React.FC<{
  asset: RecommendedAsset;
  factors?: WhyChosenFactor[];
}> = ({ asset, factors = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const topFactors: WhyChosenFactor[] = factors.slice(0, 3);

  return (
    <div className="space-y-2 pt-2 border-t border-[var(--color-border-subtle)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Why Selected</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-bold text-[var(--color-accent-strong)] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{isExpanded ? 'Hide factors' : 'View selection factors'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Concise human-readable factor highlights */}
      <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
        {topFactors.length > 0 ? (
          topFactors.map((f: WhyChosenFactor, i: number) => (
            <li key={i} className="flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-[var(--color-text-primary)] font-medium">{f.factor}:</strong> {f.evidence}
              </span>
            </li>
          ))
        ) : (
          <li className="flex items-start gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{asset.whyFitsProfile || asset.reasonSelected || asset.description}</span>
          </li>
        )}
      </ul>

      {/* Expandable factors matrix */}
      {isExpanded && (
        <div className="mt-2.5 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-3 text-xs">
          <p className="text-[var(--color-text-primary)] font-medium leading-relaxed pb-2 border-b border-[var(--color-border-subtle)]">
            {asset.whyFitsProfile || asset.reasonSelected || asset.description}
          </p>

          {/* Factor Details Matrix */}
          {factors.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">
                Selection Factor Matrix
              </span>
              <div className="space-y-1.5">
                {factors.map((factor: WhyChosenFactor, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[var(--color-text-primary)]">{factor.factor}</span>
                      <span className="font-mono text-emerald-600 font-semibold">+{factor.contribution.toFixed(1)} pts</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">{factor.evidence}</p>
                    {factor.dataSource && (
                      <p className="text-[10.5px] text-[var(--color-text-muted)] italic">Source: {factor.dataSource}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic role & characteristics */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--color-border-subtle)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">
              Portfolio Characteristics
            </span>
            <div className="grid grid-cols-1 gap-1 text-[11px] text-[var(--color-text-secondary)]">
              <div><strong className="text-[var(--color-text-primary)]">Strategic Role:</strong> {asset.portfolioRole || 'Core Portfolio Allocation'}</div>
              <div><strong className="text-[var(--color-text-primary)]">Risk Level:</strong> {asset.riskLevel}</div>
              <div><strong className="text-[var(--color-text-primary)]">Category:</strong> {asset.category}</div>
              {asset.benchmark && <div><strong className="text-[var(--color-text-primary)]">Benchmark:</strong> {asset.benchmark}</div>}
              {asset.expenseRatio && <div><strong className="text-[var(--color-text-primary)]">Expense Ratio:</strong> {asset.expenseRatio}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Radial Suitability Ring Component
const SuitabilityRadial: React.FC<{ score: number; size?: number }> = ({ score, size = 58 }) => {
  const strokeWidth = 5;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * (Math.min(100, Math.max(0, score)) / 100);

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--color-border-subtle)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--color-accent)" strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-[var(--color-text-primary)] text-sm leading-none">{score}</span>
        <span className="text-[8.5px] text-[var(--color-accent-strong)] font-bold uppercase mt-0.5">FIT</span>
      </div>
    </div>
  );
};

export const InvestmentRecommendationsView: React.FC = () => {
  const { 
    user, 
    strategy, 
    formatCurrency, 
    runAiAnalysis, 
    setActiveView
  } = useFintechStore();

  const candidateSymbols = useMemo(() => {
    const syms = new Set<string>();
    if (strategy?.allocations) {
      strategy.allocations.forEach(a => {
        if (a.name) syms.add(a.name);
        if (a.ticker) syms.add(a.ticker);
      });
    }
    syms.add('NIFTY 50');
    syms.add('GOLDBEES');
    syms.add('MON100');
    return Array.from(syms);
  }, [strategy?.allocations]);
  
  const { quotes, refetch: refetchQuotes } = useMarketQuotes(candidateSymbols, 30000);

  const [activeTab, setActiveTab] = useState<RecommendationTab>('blueprint');

  if (!user?.onboardingCompleted) {
    return (
      <div className="text-center space-y-3 max-w-lg mx-auto my-12 p-8 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)]">
        <Shield className="w-8 h-8 mx-auto text-[var(--color-accent-strong)]" />
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Complete Discovery Onboarding First</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Complete your investor discovery profile to synthesize your multi-asset portfolio mandate.
        </p>
        <button
          onClick={() => setActiveView('onboarding')}
          className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:brightness-105 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>Complete Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const suitability = strategy.suitabilityFactors;
  const recommendedSIP = strategy.recommendedMonthlyInvestment;
  const flexibleBuffer = strategy.remainingFlexibleBuffer;

  // Identify Top Recommendation (highest suitability score)
  const sortedAllocations = [...strategy.allocations].sort((a, b) => (b.suitabilityScore || 0) - (a.suitabilityScore || 0));
  const topRecommendation = sortedAllocations[0];

  // Group allocations into buckets
  const coreAssets = strategy.allocations.filter(a => (a.bucket === 'CORE' || a.category.includes('Index') || a.category.includes('Flexi')));
  const growthAssets = strategy.allocations.filter(a => (a.bucket === 'LONG_TERM_GROWTH' || a.category.includes('Global') || a.category.includes('Mid')));
  const safetyAssets = strategy.allocations.filter(a => (a.bucket === 'SAFETY' || a.category.includes('Liquid') || a.category.includes('Debt') || a.category.includes('Gold')));

  return (
    <div className="space-y-8 pb-12 font-sans">
      
      {/* 1. Strategy Summary Header */}
      <section className="financial-section-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--color-accent-strong)]" />
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Institutional Investment Strategy</h1>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Multi-asset portfolio blueprint calibrated for risk-adjusted alpha, tax efficiency, and long-term compounding.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                refetchQuotes();
                runAiAnalysis();
              }}
              className="px-3 py-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95 shadow-xs"
              title="Recalculate Strategy & Refresh NAVs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[var(--color-accent-strong)]" />
              <span>Refresh NAVs</span>
            </button>

            <button
              onClick={() => setActiveView('market')}
              className="px-3 py-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95 shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-[var(--color-accent-strong)]" />
              <span>Market Universe</span>
            </button>

            <button
              onClick={() => setActiveView('ai')}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] hover:brightness-105 text-[var(--color-accent-text)] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Consult VestIQ</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar - Minimalist Segmented Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border-subtle)] overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'blueprint'
                ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-xs'
                : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Allocation Blueprint & Instruments</span>
          </button>

          <button
            onClick={() => setActiveTab('engine')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'engine'
                ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-xs'
                : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Multi-Asset Recommendation Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('scenario')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'scenario'
                ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-xs'
                : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>What-If Scenario Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('rebalance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rebalance'
                ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-xs'
                : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Portfolio Rebalancing Advisory</span>
          </button>
        </div>
      </section>

      {/* Render Active View Tab */}
      {activeTab === 'engine' && <RecommendationCard />}
      {activeTab === 'scenario' && <ScenarioSimulatorView />}
      {activeTab === 'rebalance' && <PortfolioRebalanceView />}

      {activeTab === 'blueprint' && (
        <>

      {/* 2. Top Strategy Metric Row */}
      <section className="financial-section-card p-6 sm:p-8 space-y-6">
        <div className="pb-3 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">
            Institutional Portfolio Calibration
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Risk parameters and monthly deployment allocation targets
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 min-w-0">
          {/* Risk Mandate */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Risk Mandate</span>
            <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
              {suitability.effectiveRiskCategory || 'Moderate'}
            </div>
            <div className="flex gap-2 text-xs text-[var(--color-text-secondary)] pt-0.5">
              <span>Capacity: <strong className="text-[var(--color-text-primary)] font-mono">{suitability.riskCapacityScore}/100</strong></span>
              <span>·</span>
              <span>Tolerance: <strong className="text-[var(--color-text-primary)] font-mono">{suitability.riskToleranceScore}/100</strong></span>
            </div>
          </div>

          {/* Recommended Monthly Deployment */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Monthly Deployment</span>
            <div className="text-xl sm:text-2xl font-black text-[var(--color-accent-strong)] font-mono">
              {formatCurrency(recommendedSIP)}/mo
            </div>
            <div className="flex justify-between text-xs text-[var(--color-text-secondary)] pt-0.5">
              <span>Buffer: {formatCurrency(flexibleBuffer)}</span>
              <span className="text-emerald-600 font-mono font-semibold">{strategy.expectedReturnRange}</span>
            </div>
          </div>

          {/* Portfolio Diversification */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Diversification</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] font-mono">{strategy.diversificationScore || 88}</span>
              <span className="text-xs text-[var(--color-text-muted)] font-mono">/100</span>
            </div>
            <div className="text-xs text-emerald-600 font-semibold pt-0.5">
              {strategy.allocations.length} Diversified Assets
            </div>
          </div>

          {/* Asset Structure */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Asset Structure</span>
            <div className="flex items-center gap-1.5 pt-0.5 flex-wrap text-xs">
              <span className="text-[var(--color-text-primary)] font-bold">Core Index</span>
              <span className="text-[var(--color-text-muted)]">·</span>
              <span className="text-[var(--color-text-primary)] font-bold">Global ETF</span>
              <span className="text-[var(--color-text-muted)]">·</span>
              <span className="text-[var(--color-text-primary)] font-bold">Hedges</span>
            </div>
            <span className="text-xs text-[var(--color-text-secondary)] block pt-0.5">Non-overlapping allocation</span>
          </div>
        </div>
      </section>

      {/* 3. TOP RECOMMENDATION SPOTLIGHT */}
      {topRecommendation && (
        <section className="financial-section-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-[var(--color-accent-strong)]">
                  Core Allocation Foundation
                </span>
                <span className="text-[var(--color-text-muted)]">·</span>
                <span className="text-[var(--color-text-secondary)]">{topRecommendation.category}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
                {topRecommendation.name}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <SuitabilityRadial score={topRecommendation.suitabilityScore || 94} />
              <div className="text-right">
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Target SIP</span>
                <div className="text-lg sm:text-xl font-bold text-[var(--color-accent-strong)] font-mono">
                  {topRecommendation.percentage}% ({formatCurrency(topRecommendation.monthlyAmount)}/mo)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
            {/* Left: Role, Rationale, & Market Quote */}
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Strategic Portfolio Role</span>
                <p className="text-[var(--color-text-primary)] font-bold text-sm">{topRecommendation.portfolioRole || 'Core Equity Compounding Foundation'}</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {topRecommendation.whyFitsProfile || topRecommendation.reasonSelected}
                </p>
              </div>

              {/* Market Quote & Provenance */}
              <div>
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Market Valuation & Provenance</span>
                <ProvenanceMarketBadge
                  quote={quotes[topRecommendation.ticker || ''] || quotes[topRecommendation.name] || quotes[topRecommendation.id] || null}
                  assetCategory={topRecommendation.category}
                  assetType={topRecommendation.assetType}
                />
              </div>

              {/* Structured Why Selected Panel for Top Recommendation */}
              <WhySelectedPanel asset={topRecommendation} />

              {/* Direct Zero-Commission Advantage */}
              <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <strong className="text-emerald-600">Fiduciary Direct Plan:</strong> Direct AMC or zero-brokerage platforms save 0.5%–1.5% in recurring annual distributor commissions.
                </div>
                <button
                  onClick={() => setActiveTab('engine')}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-accent-strong)] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Launch Recommendation Engine</span>
                </button>
              </div>
            </div>

            {/* Right: Historical Performance Chart */}
            <div className="lg:col-span-6">
              <HistoricalPerformanceChart
                symbol={topRecommendation.ticker || topRecommendation.name}
                assetName={topRecommendation.name}
                category={topRecommendation.category}
                color={topRecommendation.color}
              />
            </div>
          </div>
        </section>
      )}

      {/* 4. RECOMMENDATION BUCKETS (Core, Global / Growth, Safety / Liquidity) */}
      <section className="financial-section-card p-6 sm:p-8 space-y-8">
        
        {/* Core Investments */}
        {coreAssets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
              <Layers className="w-4 h-4 text-[var(--color-accent-strong)]" />
              <span className="font-bold text-[var(--color-text-primary)] text-xs uppercase tracking-wider">CORE INVESTMENTS (INDEX & LARGE-CAP)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              {coreAssets.map((asset) => (
                <div key={asset.id} className="p-4 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: asset.color, flexShrink: 0, display: 'inline-block' }} />
                        <span className="text-[10.5px] text-[var(--color-text-secondary)] uppercase font-bold">{asset.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{asset.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-[var(--color-accent-strong)] font-mono block">{asset.percentage}%</span>
                      <div className="text-xs text-[var(--color-text-secondary)] font-mono">{formatCurrency(asset.monthlyAmount)}/mo</div>
                    </div>
                  </div>

                  <ProvenanceMarketBadge
                    quote={quotes[asset.ticker || ''] || quotes[asset.name] || quotes[asset.id] || null}
                    assetCategory={asset.category}
                    assetType={asset.assetType}
                  />

                  <WhySelectedPanel asset={asset} />

                  <HistoricalPerformanceChart
                    symbol={asset.ticker || asset.name}
                    assetName={asset.name}
                    category={asset.category}
                    color={asset.color}
                  />

                  <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate max-w-[180px]">{asset.keyRisks || 'Market Volatility'}</span>
                    </div>
                    <span>Fit: <strong className="text-[var(--color-accent-strong)]">{asset.suitabilityScore}/100</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global / Growth Investments */}
        {growthAssets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
              <TrendingUp className="w-4 h-4 text-[var(--color-accent-strong)]" />
              <span className="font-bold text-[var(--color-text-primary)] text-xs uppercase tracking-wider">GLOBAL & GROWTH SATELLITES</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              {growthAssets.map((asset) => (
                <div key={asset.id} className="p-4 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: asset.color, flexShrink: 0, display: 'inline-block' }} />
                        <span className="text-[10.5px] text-[var(--color-text-secondary)] uppercase font-bold">{asset.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{asset.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-[var(--color-accent-strong)] font-mono block">{asset.percentage}%</span>
                      <div className="text-xs text-[var(--color-text-secondary)] font-mono">{formatCurrency(asset.monthlyAmount)}/mo</div>
                    </div>
                  </div>

                  <ProvenanceMarketBadge
                    quote={quotes[asset.ticker || ''] || quotes[asset.name] || quotes[asset.id] || null}
                    assetCategory={asset.category}
                    assetType={asset.assetType}
                  />

                  <WhySelectedPanel asset={asset} />

                  <HistoricalPerformanceChart
                    symbol={asset.ticker || asset.name}
                    assetName={asset.name}
                    category={asset.category}
                    color={asset.color}
                  />

                  <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate max-w-[180px]">{asset.keyRisks || 'Currency & Tech Volatility'}</span>
                    </div>
                    <span>Fit: <strong className="text-[var(--color-accent-strong)]">{asset.suitabilityScore}/100</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety & Liquidity */}
        {safetyAssets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
              <Shield className="w-4 h-4 text-[var(--color-accent-strong)]" />
              <span className="font-bold text-[var(--color-text-primary)] text-xs uppercase tracking-wider">SAFETY, DEBT & COMMODITY HEDGES</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              {safetyAssets.map((asset) => (
                <div key={asset.id} className="p-4 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: asset.color, flexShrink: 0, display: 'inline-block' }} />
                        <span className="text-[10.5px] text-[var(--color-text-secondary)] uppercase font-bold">{asset.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{asset.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-[var(--color-accent-strong)] font-mono block">{asset.percentage}%</span>
                      <div className="text-xs text-[var(--color-text-secondary)] font-mono">{formatCurrency(asset.monthlyAmount)}/mo</div>
                    </div>
                  </div>

                  <ProvenanceMarketBadge
                    quote={quotes[asset.ticker || ''] || quotes[asset.name] || quotes[asset.id] || null}
                    assetCategory={asset.category}
                    assetType={asset.assetType}
                  />

                  <WhySelectedPanel asset={asset} />

                  <HistoricalPerformanceChart
                    symbol={asset.ticker || asset.name}
                    assetName={asset.name}
                    category={asset.category}
                    color={asset.color}
                  />

                  <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate max-w-[180px]">{asset.keyRisks || 'Inflation Risk'}</span>
                    </div>
                    <span>Fit: <strong className="text-[var(--color-accent-strong)]">{asset.suitabilityScore}/100</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* 5. Zero-Commission Execution Guide - Open Editorial Section */}
      <div className="pt-6 border-t border-[var(--color-border-subtle)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Independent Direct Platforms</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">SmartVest provides decision-support models and does not execute trades or hold funds. Execute directly through registered third-party platforms.</p>
          </div>
          <span className="text-[10.5px] font-bold text-[var(--color-accent-strong)] uppercase tracking-wider shrink-0">Non-Broker Disclosure</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RECOMMENDED_PLATFORMS.map((platform) => (
            <a
              key={platform.id}
              href={platform.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-lg bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] flex flex-col justify-between gap-3 text-[var(--color-text-primary)] no-underline transition-all cursor-pointer shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">{platform.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{platform.tagline}</p>
              </div>

              <div className="pt-2 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-accent-strong)] font-semibold">
                {platform.badge}
              </div>
            </a>
          ))}
        </div>
      </div>
      </>
      )}

    </div>
  );
};
