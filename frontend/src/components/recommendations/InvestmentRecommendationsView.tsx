import React, { useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Layers
} from 'lucide-react';
import { RECOMMENDED_PLATFORMS } from '../../services/strategyEngine';
import { useMarketQuotes } from '../../hooks/useMarketQuotes';
import type { MarketQuote } from '../../services/marketApi';
import { HistoricalPerformanceChart } from './HistoricalPerformanceChart';

// Market Freshness Badge Component
const MarketFreshnessBadge: React.FC<{ quote?: MarketQuote | null }> = ({ quote }) => {
  if (!quote || quote.freshness === 'UNAVAILABLE' || quote.price === null) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[13px] text-[#667085]">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        <span>Market price unavailable</span>
      </div>
    );
  }

  const freshness = quote.freshness;
  const isPositive = (quote.changePct ?? 0) >= 0;

  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[14px]">
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-[#172033] text-[15px]">
          {quote.currency === 'USD' ? '$' : '₹'}
          {quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        {quote.changePct !== null && quote.changePct !== undefined && (
          <span className={`font-mono text-[13px] font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? '+' : ''}{quote.changePct.toFixed(2)}%
          </span>
        )}
      </div>

      <span className="text-[11.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white text-[#172033] border border-[#E7E9F0] shadow-xs">
        {freshness === 'REALTIME' ? 'LIVE' : (freshness === 'DELAYED' ? '15M DELAY' : 'LATEST NAV')}
      </span>
    </div>
  );
};

// Radial Suitability Ring Component
const SuitabilityRadial: React.FC<{ score: number; size?: number }> = ({ score, size = 64 }) => {
  const strokeWidth = 5.5;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * (Math.min(100, Math.max(0, score)) / 100);

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#14B8A6" strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black font-mono text-[#172033] text-[15px] leading-none">{score}</span>
        <span className="text-[10px] text-[#667085] font-bold uppercase leading-none mt-0.5">FIT</span>
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
      <div className="p-8 rounded-2xl bg-white border border-[#E7E9F0] text-center space-y-3 max-w-lg mx-auto my-12 shadow-xs">
        <Sparkles className="w-8 h-8 text-teal-600 mx-auto" />
        <h2 className="text-[20px] font-bold text-[#172033]">Complete Onboarding First</h2>
        <p className="text-[14px] text-[#667085]">
          Complete your financial profile to receive your personalized multi-factor investment blueprint.
        </p>
        <button
          onClick={() => setActiveView('onboarding')}
          className="glow-btn-primary px-4 py-2.5 rounded-lg text-white font-bold text-[14px] inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>Complete Profile</span>
          <ArrowRight className="w-4 h-4" />
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
    <div className="space-y-6 pb-12">
      
      {/* 1. Strategy Summary Header */}
      <div className="bg-white border border-[#E7E9F0] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl sm:text-[26px] font-bold text-[#172033] tracking-tight">Your SmartVest Strategy</h1>
          </div>
          <p className="text-[14px] text-[#667085]">
            Fiduciary multi-asset blueprint calibrated for compound growth and downside protection.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              refetchQuotes();
              runAiAnalysis();
            }}
            className="p-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] hover:bg-slate-100 transition-colors cursor-pointer text-[13.5px] font-semibold flex items-center gap-1.5 shadow-xs"
            title="Recalculate Strategy & Refresh NAVs"
          >
            <RefreshCw className="w-4 h-4 text-teal-600" />
            <span className="hidden sm:inline">Refresh NAVs</span>
          </button>

          <button
            onClick={() => setActiveView('ai')}
            className="glow-btn-primary px-4 py-2.5 rounded-lg text-white font-bold text-[14px] flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask VestIQ Why Recommended</span>
          </button>
        </div>
      </div>

      {/* 2. Top Strategy Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        
        {/* Final Advisory Risk */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E7E9F0] space-y-1.5 shadow-xs">
          <span className="text-[12px] text-[#667085] font-semibold uppercase tracking-wider block">Final Advisory Risk</span>
          <div className="text-[22px] sm:text-[24px] font-black text-[#172033] leading-tight">
            {suitability.effectiveRiskCategory || 'Moderate'}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#667085]">
            <span>Cap: <strong className="text-[#172033] font-mono">{suitability.riskCapacityScore}/100</strong></span>
            <span>•</span>
            <span>Tol: <strong className="text-[#172033] font-mono">{suitability.riskToleranceScore}/100</strong></span>
          </div>
        </div>

        {/* Recommended Monthly Deployment */}
        <div className="p-4 sm:p-5 rounded-xl bg-teal-50/60 border border-teal-200 space-y-1.5 shadow-xs">
          <span className="text-[12px] text-teal-800 font-semibold uppercase tracking-wider block">Monthly Deployment</span>
          <div className="text-[22px] sm:text-[24px] font-black text-teal-700 font-mono leading-tight">
            {formatCurrency(recommendedSIP)}/mo
          </div>
          <div className="flex items-center justify-between text-[12px] text-teal-800 font-semibold">
            <span>Buffer: {formatCurrency(flexibleBuffer)}</span>
            <span className="text-teal-700 font-bold">{strategy.expectedReturnRange}</span>
          </div>
        </div>

        {/* Portfolio Diversification */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E7E9F0] space-y-1.5 shadow-xs">
          <span className="text-[12px] text-[#667085] font-semibold uppercase tracking-wider block">Diversification Score</span>
          <div className="text-[22px] sm:text-[24px] font-black text-[#172033] font-mono flex items-baseline gap-1 leading-tight">
            <span>{strategy.diversificationScore || 88}</span>
            <span className="text-[13px] text-[#98A2B3] font-normal">/ 100</span>
          </div>
          <div className="text-[12px] text-teal-700 font-medium truncate">
            {strategy.allocations.length} Curated Assets
          </div>
        </div>

        {/* Curated Basket Mix */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E7E9F0] space-y-1.5 shadow-xs">
          <span className="text-[12px] text-[#667085] font-semibold uppercase tracking-wider block">Curated Basket Mix</span>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              {strategy.allocations.filter(a => a.category.includes('Stock') || a.category.includes('Equity') && !a.category.includes('Fund')).length || 1} Stock
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[11px] font-bold">
              {strategy.allocations.filter(a => a.category.includes('ETF') || a.category.includes('Gold')).length || 2} ETFs
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px] font-bold">
              {strategy.allocations.filter(a => a.category.includes('Fund') || a.category.includes('Debt') || a.category.includes('Hybrid')).length || 3} MFs
            </span>
          </div>
          <span className="text-[11.5px] text-[#667085] block pt-1 font-medium">Compact & Anti-Overlap</span>
        </div>

      </div>

      {/* 3. TOP RECOMMENDATION SPOTLIGHT COMPONENT */}
      {topRecommendation && (
        <div className="bg-white border border-teal-300 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E9F0]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                  TOP RECOMMENDATION SPOTLIGHT
                </span>
                <span className="text-[13px] text-[#667085] font-medium">• {topRecommendation.category}</span>
              </div>
              <h2 className="text-[20px] sm:text-[22px] font-bold text-[#172033] tracking-tight">
                {topRecommendation.name}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <SuitabilityRadial score={topRecommendation.suitabilityScore || 94} />
              <div className="text-right">
                <span className="text-[12px] text-[#667085] font-semibold block uppercase">Target Allocation</span>
                <div className="text-[18px] sm:text-[20px] font-black text-teal-700 font-mono">
                  {topRecommendation.percentage}% ({formatCurrency(topRecommendation.monthlyAmount)}/mo)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Role, Rationale, & Market Quote */}
            <div className="lg:col-span-6 space-y-3">
              <div className="p-3.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] space-y-1">
                <span className="text-[12px] text-[#667085] font-semibold uppercase block">Strategic Portfolio Role</span>
                <p className="text-[#172033] font-semibold text-[14.5px]">{topRecommendation.portfolioRole || 'Core Equity Compounding Foundation'}</p>
                <p className="text-[#667085] text-[13.5px] leading-relaxed pt-1">
                  {topRecommendation.whyFitsProfile || topRecommendation.reasonSelected}
                </p>
              </div>

              {/* Live Quote Data */}
              <div className="space-y-1">
                <span className="text-[12px] text-[#667085] font-semibold uppercase block">Live Indicative Price / NAV</span>
                <MarketFreshnessBadge quote={quotes[topRecommendation.name] || quotes[topRecommendation.ticker || ''] || null} />
              </div>

              {/* Direct Zero-Commission Advantage */}
              <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-[13px] text-teal-900 leading-relaxed">
                <strong className="text-teal-800">Fiduciary Direct-Plan Advantage:</strong> Invest directly via AMC or Zero-Commission platforms to save 0.5%–1.5% in recurring annual distributor commissions.
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
        </div>
      )}

      {/* 4. RECOMMENDATION BUCKETS (Core, Global / Growth, Safety / Liquidity) */}
      <div className="space-y-6">
        
        {/* Core Investments */}
        {coreAssets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-[#E7E9F0]">
              <Layers className="w-4 h-4 text-teal-600" />
              <span className="font-bold text-[#172033] uppercase tracking-wider text-[17px]">CORE INVESTMENTS (INDEX & MULTI-CAP)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coreAssets.map((asset) => (
                <div key={asset.id} className="bg-white border border-[#E7E9F0] rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
                        <span className="text-[12px] text-[#667085] uppercase font-semibold">{asset.category}</span>
                      </div>
                      <h3 className="text-[17px] font-bold text-[#172033]">{asset.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[18px] font-black text-teal-700 font-mono">{asset.percentage}%</span>
                      <div className="text-[12.5px] text-[#667085] font-mono font-semibold">{formatCurrency(asset.monthlyAmount)}/mo</div>
                    </div>
                  </div>

                  <MarketFreshnessBadge quote={quotes[asset.name] || quotes[asset.ticker || ''] || null} />

                  <p className="text-[13.5px] text-[#667085] line-clamp-2 leading-relaxed">
                    {asset.whyFitsProfile || asset.reasonSelected || asset.description}
                  </p>

                  <HistoricalPerformanceChart
                    symbol={asset.ticker || asset.name}
                    assetName={asset.name}
                    category={asset.category}
                    color={asset.color}
                  />

                  <div className="pt-2.5 border-t border-[#E7E9F0] flex items-center justify-between text-[12.5px] text-[#667085]">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate max-w-[200px]">{asset.keyRisks || 'Market Volatility'}</span>
                    </div>
                    <span>Fit: <strong className="text-teal-700 font-bold">{asset.suitabilityScore}/100</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global / Growth Investments */}
        {growthAssets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-[#E7E9F0]">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              <span className="font-bold text-[#172033] uppercase tracking-wider text-[17px]">GLOBAL & GROWTH SATELLITES</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {growthAssets.map((asset) => (
                <div key={asset.id} className="bg-white border border-[#E7E9F0] rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
                        <span className="text-[12px] text-[#667085] uppercase font-semibold">{asset.category}</span>
                      </div>
                      <h3 className="text-[17px] font-bold text-[#172033]">{asset.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[18px] font-black text-teal-700 font-mono">{asset.percentage}%</span>
                      <div className="text-[12.5px] text-[#667085] font-mono font-semibold">{formatCurrency(asset.monthlyAmount)}/mo</div>
                    </div>
                  </div>

                  <MarketFreshnessBadge quote={quotes[asset.name] || quotes[asset.ticker || ''] || null} />

                  <p className="text-[13.5px] text-[#667085] line-clamp-2 leading-relaxed">
                    {asset.whyFitsProfile || asset.reasonSelected || asset.description}
                  </p>

                  <HistoricalPerformanceChart
                    symbol={asset.ticker || asset.name}
                    assetName={asset.name}
                    category={asset.category}
                    color={asset.color}
                  />

                  <div className="pt-2.5 border-t border-[#E7E9F0] flex items-center justify-between text-[12.5px] text-[#667085]">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate max-w-[200px]">{asset.keyRisks || 'Currency & Tech Volatility'}</span>
                    </div>
                    <span>Fit: <strong className="text-teal-700 font-bold">{asset.suitabilityScore}/100</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety & Liquidity */}
        {safetyAssets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-[#E7E9F0]">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-[#172033] uppercase tracking-wider text-[17px]">SAFETY, DEBT & COMMODITY HEDGES</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safetyAssets.map((asset) => (
                <div key={asset.id} className="bg-white border border-[#E7E9F0] rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
                        <span className="text-[12px] text-[#667085] uppercase font-semibold">{asset.category}</span>
                      </div>
                      <h3 className="text-[17px] font-bold text-[#172033]">{asset.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[18px] font-black text-teal-700 font-mono">{asset.percentage}%</span>
                      <div className="text-[12.5px] text-[#667085] font-mono font-semibold">{formatCurrency(asset.monthlyAmount)}/mo</div>
                    </div>
                  </div>

                  <MarketFreshnessBadge quote={quotes[asset.name] || quotes[asset.ticker || ''] || null} />

                  <p className="text-[13.5px] text-[#667085] line-clamp-2 leading-relaxed">
                    {asset.whyFitsProfile || asset.reasonSelected || asset.description}
                  </p>

                  <HistoricalPerformanceChart
                    symbol={asset.ticker || asset.name}
                    assetName={asset.name}
                    category={asset.category}
                    color={asset.color}
                  />

                  <div className="pt-2.5 border-t border-[#E7E9F0] flex items-center justify-between text-[12.5px] text-[#667085]">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate max-w-[200px]">{asset.keyRisks || 'Inflation Risk'}</span>
                    </div>
                    <span>Fit: <strong className="text-teal-700 font-bold">{asset.suitabilityScore}/100</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 5. Zero-Commission Execution Guide */}
      <div className="bg-white border border-[#E7E9F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E9F0]">
          <div className="space-y-0.5">
            <h3 className="text-[18px] font-bold text-[#172033] uppercase tracking-wider">Zero-Commission Direct Platforms</h3>
            <p className="text-[13.5px] text-[#667085]">Execute direct mutual funds and ETFs without distributor commissions.</p>
          </div>
          <span className="text-[12px] text-[#667085] uppercase tracking-wider font-semibold">SEBI Registered</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {RECOMMENDED_PLATFORMS.map((platform) => (
            <a
              key={platform.id}
              href={platform.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] hover:border-teal-400 hover:bg-white transition-all group flex flex-col justify-between space-y-2.5 cursor-pointer shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-bold text-[#172033] group-hover:text-teal-700 transition-colors">{platform.name}</span>
                  <ExternalLink className="w-4 h-4 text-[#98A2B3] group-hover:text-teal-600 transition-colors" />
                </div>
                <p className="text-[13px] text-[#667085] leading-relaxed">{platform.tagline}</p>
              </div>

              <div className="pt-2 border-t border-[#E7E9F0] text-[12px] text-teal-700 font-semibold">
                {platform.badge}
              </div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};
