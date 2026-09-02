import React, { useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Layers
} from 'lucide-react';
import { RECOMMENDED_PLATFORMS } from '../../services/strategyEngine';
import { useMarketQuotes } from '../../hooks/useMarketQuotes';
import type { MarketQuote } from '../../services/marketApi';
import { HistoricalPerformanceChart } from './HistoricalPerformanceChart';

// Minimal inline price display
const InlinePrice: React.FC<{ quote?: MarketQuote | null }> = ({ quote }) => {
  if (!quote || quote.freshness === 'UNAVAILABLE' || quote.price === null) {
    return <span className="text-xs text-slate-400">Price unavailable</span>;
  }
  const isPositive = (quote.changePct ?? 0) >= 0;
  return (
    <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
      {quote.currency === 'USD' ? '$' : '₹'}
      {quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      {quote.changePct !== null && quote.changePct !== undefined && (
        <span className={`ml-1.5 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {isPositive ? '+' : ''}{quote.changePct.toFixed(2)}%
        </span>
      )}
    </span>
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
      });
    }
    syms.add('NIFTY 50');
    syms.add('GOLDBEES');
    syms.add('MON100');
    return Array.from(syms);
  }, [strategy?.allocations]);
  
  const { quotes, refetch: refetchQuotes } = useMarketQuotes(candidateSymbols, 30000);

  if (!user?.onboardingCompleted) {
    return (
      <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
        <Sparkles className="w-7 h-7 mx-auto text-[#0D9488]" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Complete your profile first</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complete your investor profile to generate your portfolio strategy.
        </p>
        <button
          onClick={() => setActiveView('onboarding')}
          className="px-4 py-2 rounded-lg bg-[#0D9488] text-white font-medium text-sm inline-flex items-center gap-1.5 cursor-pointer"
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

  const renderAssetRow = (asset: typeof coreAssets[0]) => (
    <div 
      key={asset.id} 
      className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 min-w-0 overflow-hidden"
    >
      {/* Information on left */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: asset.color, flexShrink: 0, display: 'inline-block' }} />
            <span className="text-[10.5px] text-slate-400 uppercase font-semibold tracking-wide">{asset.category}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Fit: <strong className="text-[#0D9488] dark:text-[#00D4AA]">{asset.suitabilityScore}/100</strong>
            </span>
          </div>

          <div className="lg:hidden text-right">
            <span className="text-base font-bold text-[#0D9488] dark:text-[#00D4AA] font-mono">{asset.percentage}%</span>
            <span className="text-xs text-slate-400 font-mono ml-2">({formatCurrency(asset.monthlyAmount)}/mo)</span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">{asset.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
            {asset.whyFitsProfile || asset.reasonSelected || asset.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Live Price / NAV</span>
            <InlinePrice quote={quotes[asset.name] || quotes[asset.ticker || ''] || null} />
          </div>

          {asset.keyRisks && (
            <div className="hidden sm:block">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Key Risk</span>
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[200px] block">{asset.keyRisks}</span>
            </div>
          )}

          <div className="hidden lg:block ml-auto text-right shrink-0">
            <div className="text-lg font-bold text-[#0D9488] dark:text-[#00D4AA] font-mono">{asset.percentage}%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{formatCurrency(asset.monthlyAmount)}/mo</div>
          </div>
        </div>
      </div>

      {/* Chart on right (Desktop) / stacked on Mobile */}
      <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 min-w-0 overflow-hidden">
        <HistoricalPerformanceChart
          symbol={asset.ticker || asset.name}
          assetName={asset.name}
          category={asset.category}
          color={asset.color}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12 font-sans max-w-7xl mx-auto">
      
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Investment Strategy</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Multi-asset allocation calibrated to your risk capacity and financial goals
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { refetchQuotes(); runAiAnalysis(); }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setActiveView('ai')}
            className="px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask VestIQ</span>
          </button>
        </div>
      </div>

      {/* ── SUMMARY METRICS ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 dark:divide-white/[0.06] border border-slate-100 dark:border-white/[0.06] rounded-xl bg-white dark:bg-[#0B1120]">
        <div className="px-5 py-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide block">Risk</span>
          <div className="text-base font-semibold text-slate-900 dark:text-white">{suitability.effectiveRiskCategory || 'Moderate'}</div>
          <div className="text-xs text-slate-400">Capacity: {suitability.riskCapacityScore}/100</div>
        </div>

        <div className="px-5 py-4 space-y-1">
          <span className="text-[11px] text-[#0D9488] dark:text-[#00D4AA] font-medium uppercase tracking-wide block">Monthly SIP</span>
          <div className="text-base font-semibold text-[#0D9488] dark:text-[#00D4AA] font-mono">{formatCurrency(recommendedSIP)}/mo</div>
          <div className="text-xs text-slate-400">Buffer: {formatCurrency(flexibleBuffer)}</div>
        </div>

        <div className="px-5 py-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide block">Diversification</span>
          <div className="text-base font-semibold text-slate-900 dark:text-white font-mono">{strategy.diversificationScore || 88}<span className="text-xs text-slate-400 font-normal"> /100</span></div>
          <div className="text-xs text-slate-400">{strategy.allocations.length} assets selected</div>
        </div>

        <div className="px-5 py-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide block">Expected Return</span>
          <div className="text-base font-semibold text-slate-900 dark:text-white">{strategy.expectedReturnRange}</div>
          <div className="text-xs text-slate-400">CAGR estimate</div>
        </div>
      </div>

      {/* ── PRIMARY RECOMMENDATION ── */}
      {topRecommendation && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 uppercase tracking-wide">
              Primary Recommendation
            </span>
            <span className="text-xs text-slate-400">{topRecommendation.category}</span>
          </div>

          <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Info (7 cols) */}
              <div className="lg:col-span-7 min-w-0 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white truncate">{topRecommendation.name}</h2>
                  <div className="sm:text-right shrink-0">
                    <div className="text-sm font-bold text-[#0D9488] dark:text-[#00D4AA] font-mono">
                      {topRecommendation.percentage}% · {formatCurrency(topRecommendation.monthlyAmount)}/mo
                    </div>
                    <div className="text-[11px] text-slate-400">Fit: {topRecommendation.suitabilityScore}/100</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide block">Portfolio Role</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{topRecommendation.portfolioRole || 'Core Equity Compounding Foundation'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {topRecommendation.whyFitsProfile || topRecommendation.reasonSelected}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide block">Live Price / NAV</span>
                  <InlinePrice quote={quotes[topRecommendation.name] || quotes[topRecommendation.ticker || ''] || null} />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="text-[#0D9488] dark:text-[#00D4AA] font-medium">Direct Plan: </span>
                  Save 0.5%–1.5% annually by investing via direct AMC or zero-brokerage platforms.
                </p>
              </div>

              {/* Right: Chart (5 cols) */}
              <div className="lg:col-span-5 min-w-0 w-full overflow-hidden">
                <HistoricalPerformanceChart
                  symbol={topRecommendation.ticker || topRecommendation.name}
                  assetName={topRecommendation.name}
                  category={topRecommendation.category}
                  color={topRecommendation.color}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSET BUCKETS ── */}
      <div className="space-y-8">

        {coreAssets.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Core — Index & Large-Cap</span>
            </div>
            <div className="space-y-4">
              {coreAssets.map(renderAssetRow)}
            </div>
          </div>
        )}

        {growthAssets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Growth — Global & Mid-Cap Satellites</span>
            </div>
            <div className="space-y-4">
              {growthAssets.map(renderAssetRow)}
            </div>
          </div>
        )}

        {safetyAssets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Safety — Debt, Gold & Liquidity</span>
            </div>
            <div className="space-y-4">
              {safetyAssets.map(renderAssetRow)}
            </div>
          </div>
        )}

      </div>

      {/* ── EXECUTION PLATFORMS ── */}
      <div className="space-y-3">
        <div className="pb-2 border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Zero-Commission Direct Platforms</span>
          <span className="text-[10px] text-[#0D9488] dark:text-[#00D4AA]">Fiduciary</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RECOMMENDED_PLATFORMS.map((platform) => (
            <a
              key={platform.id}
              href={platform.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-lg border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0B1120] hover:border-slate-300 dark:hover:border-white/[0.12] flex flex-col justify-between gap-2 no-underline transition-colors cursor-pointer"
            >
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{platform.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{platform.tagline}</p>
              </div>
              <div className="text-[11px] text-[#0D9488] dark:text-[#00D4AA] font-medium border-t border-slate-100 dark:border-white/[0.04] pt-2">
                {platform.badge}
              </div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};
