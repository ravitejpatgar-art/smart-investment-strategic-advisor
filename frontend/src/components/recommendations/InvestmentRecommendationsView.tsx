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
  if (!quote || quote.freshness === 'UNAVAILABLE' || quote.status === 'UNAVAILABLE' || quote.price === null || quote.price === undefined) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0A1022] border border-white/[0.06] text-xs text-[#8A94A6]">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
        <span>Market price unavailable</span>
      </div>
    );
  }

  const isPositive = (quote.changePct ?? 0) >= 0;
  const status = quote.status || (quote.freshness === 'REALTIME' ? 'LIVE' : (quote.freshness === 'DELAYED' ? 'DELAYED' : (quote.freshness === 'MODEL_ASSUMPTION' ? 'DEMO' : 'FALLBACK')));

  const renderBadge = () => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA]">
            LIVE
          </span>
        );
      case 'DELAYED':
        return (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#1E88E5]/10 border border-[#1E88E5]/30 text-[#1E88E5]">
            15M DELAY
          </span>
        );
      case 'DEMO':
        return (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6]">
            DEMO
          </span>
        );
      case 'FALLBACK':
      default:
        return (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B]">
            {quote.assetType === 'MUTUAL_FUND' ? 'LATEST NAV' : 'FALLBACK'}
          </span>
        );
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0A1022] border border-white/[0.06] text-xs">
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-white text-xs sm:text-sm">
          {quote.currency === 'USD' ? '$' : '₹'}
          {quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        {quote.changePct !== null && quote.changePct !== undefined && (
          <span className={`font-mono text-xs font-semibold ${isPositive ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
            {isPositive ? '+' : ''}{quote.changePct.toFixed(2)}%
          </span>
        )}
      </div>

      {renderBadge()}
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
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#00D4AA" strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-white text-sm leading-none">{score}</span>
        <span className="text-[8.5px] text-[#00D4AA] font-bold uppercase mt-0.5">FIT</span>
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

  const cardStyle = {
    background: '#101827',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
  };

  if (!user?.onboardingCompleted) {
    return (
      <div style={{ ...cardStyle, padding: 32 }} className="text-center space-y-3 max-w-lg mx-auto my-12">
        <Sparkles className="w-8 h-8 mx-auto text-[#00D4AA]" />
        <h2 className="text-xl font-bold text-white">Complete Discovery Onboarding First</h2>
        <p className="text-xs text-[#8A94A6]">
          Complete your investor discovery profile to synthesize your multi-asset portfolio mandate.
        </p>
        <button
          onClick={() => setActiveView('onboarding')}
          className="px-4 py-2 rounded-lg bg-[#00D4AA] text-[#050816] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
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
    <div className="space-y-6 pb-12 font-sans">
      
      {/* 1. Strategy Summary Header */}
      <div style={{ ...cardStyle, padding: '20px 24px' }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00D4AA]" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Institutional Investment Strategy</h1>
          </div>
          <p className="text-xs text-[#8A94A6]">
            Multi-asset portfolio blueprint calibrated for risk-adjusted alpha, tax efficiency, and long-term compounding.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              refetchQuotes();
              runAiAnalysis();
            }}
            className="px-3 py-2 rounded-lg bg-[#0A1022] border border-white/[0.08] text-[#8A94A6] hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Recalculate Strategy & Refresh NAVs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00D4AA]" />
            <span>Refresh NAVs</span>
          </button>

          <button
            onClick={() => setActiveView('ai')}
            className="px-4 py-2 rounded-lg bg-[#00D4AA] text-[#050816] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult VestIQ</span>
          </button>
        </div>
      </div>

      {/* 2. Top Strategy Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Final Advisory Risk */}
        <div style={{ ...cardStyle, padding: '16px 18px' }} className="space-y-1">
          <span className="text-[10.5px] text-[#8A94A6] font-bold uppercase tracking-wider block">Risk Mandate</span>
          <div className="text-xl font-bold text-white">
            {suitability.effectiveRiskCategory || 'Moderate'}
          </div>
          <div className="flex gap-2 text-xs text-[#8A94A6]">
            <span>Cap: <strong className="text-white font-mono">{suitability.riskCapacityScore}/100</strong></span>
            <span>Tol: <strong className="text-white font-mono">{suitability.riskToleranceScore}/100</strong></span>
          </div>
        </div>

        {/* Recommended Monthly Deployment */}
        <div style={{ ...cardStyle, padding: '16px 18px' }} className="space-y-1">
          <span className="text-[10.5px] text-[#00D4AA] font-bold uppercase tracking-wider block">Monthly Deployment</span>
          <div className="text-xl font-bold text-[#00D4AA] font-mono">
            {formatCurrency(recommendedSIP)}/mo
          </div>
          <div className="flex justify-between text-xs text-[#8A94A6]">
            <span>Buffer: {formatCurrency(flexibleBuffer)}</span>
            <span className="text-[#00D4AA] font-mono">{strategy.expectedReturnRange}</span>
          </div>
        </div>

        {/* Portfolio Diversification */}
        <div style={{ ...cardStyle, padding: '16px 18px' }} className="space-y-1">
          <span className="text-[10.5px] text-[#8A94A6] font-bold uppercase tracking-wider block">Diversification</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-white font-mono">{strategy.diversificationScore || 88}</span>
            <span className="text-xs text-[#8A94A6]">/ 100</span>
          </div>
          <div className="text-xs text-[#00D4AA] font-semibold">
            {strategy.allocations.length} Selected Assets
          </div>
        </div>

        {/* Curated Basket Mix */}
        <div style={{ ...cardStyle, padding: '16px 18px' }} className="space-y-1">
          <span className="text-[10.5px] text-[#8A94A6] font-bold uppercase tracking-wider block">Asset Structure</span>
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-[#00D4AA]/10 text-[#00D4AA] font-bold border border-[#00D4AA]/30">Core Index</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1E88E5]/10 text-[#1E88E5] font-bold border border-[#1E88E5]/30">Global</span>
            <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[#8A94A6] font-bold border border-white/[0.08]">Hedges</span>
          </div>
          <span className="text-[11px] text-[#8A94A6] block">Non-overlapping allocation</span>
        </div>

      </div>

      {/* 3. TOP RECOMMENDATION SPOTLIGHT COMPONENT */}
      {topRecommendation && (
        <div style={{ ...cardStyle, padding: '20px 24px' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-white/[0.06]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30 uppercase tracking-wider">
                  Core Allocation Foundation
                </span>
                <span className="text-xs text-[#8A94A6]">| {topRecommendation.category}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {topRecommendation.name}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <SuitabilityRadial score={topRecommendation.suitabilityScore || 94} />
              <div className="text-right">
                <span className="text-[10.5px] text-[#8A94A6] font-bold uppercase tracking-wider block">Target SIP</span>
                <div className="text-lg font-bold text-[#00D4AA] font-mono">
                  {topRecommendation.percentage}% ({formatCurrency(topRecommendation.monthlyAmount)}/mo)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Role, Rationale, & Market Quote */}
            <div className="lg:col-span-6 space-y-3">
              <div className="p-3.5 rounded-lg bg-[#0A1022] border border-white/[0.06] space-y-1">
                <span className="text-[10.5px] text-[#8A94A6] font-bold uppercase tracking-wider block">Strategic Portfolio Role</span>
                <p className="text-white font-semibold text-xs">{topRecommendation.portfolioRole || 'Core Equity Compounding Foundation'}</p>
                <p className="text-xs text-[#8A94A6] leading-relaxed">
                  {topRecommendation.whyFitsProfile || topRecommendation.reasonSelected}
                </p>
              </div>

              {/* Live Quote Data */}
              <div>
                <span className="text-[10.5px] text-[#8A94A6] font-bold uppercase tracking-wider block mb-1.5">Live Indicative Price / NAV</span>
                <MarketFreshnessBadge quote={quotes[topRecommendation.name] || quotes[topRecommendation.ticker || ''] || null} />
              </div>

              {/* Direct Zero-Commission Advantage */}
              <div className="p-3 rounded-lg bg-[#0A1022] border border-white/[0.06] text-xs text-[#8A94A6] leading-relaxed">
                <strong className="text-[#00D4AA]">Fiduciary Direct Plan:</strong> Direct AMC or zero-brokerage platforms save 0.5%–1.5% in recurring annual distributor commissions.
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
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <Layers className="w-4 h-4 text-[#00D4AA]" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">CORE INVESTMENTS (INDEX & LARGE-CAP)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coreAssets.map((asset) => (
                <div key={asset.id} style={{ ...cardStyle, padding: 18 }} className="flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: asset.color, flexShrink: 0, display: 'inline-block' }} />
                        <span className="text-[10.5px] text-[#8A94A6] uppercase font-bold">{asset.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{asset.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-[#00D4AA] font-mono block">{asset.percentage}%</span>
                      <div className="text-xs text-[#8A94A6] font-mono">{formatCurrency(asset.monthlyAmount)}/mo</div>
                    </div>
                  </div>

                  <MarketFreshnessBadge quote={quotes[asset.name] || quotes[asset.ticker || ''] || null} />

                  <p className="text-xs text-[#8A94A6] leading-relaxed line-clamp-2">
                    {asset.whyFitsProfile || asset.reasonSelected || asset.description}
                  </p>

                  <HistoricalPerformanceChart
                    symbol={asset.ticker || asset.name}
                    assetName={asset.name}
                    category={asset.category}
                    color={asset.color}
                  />

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs text-[#8A94A6]">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate max-w-[180px]">{asset.keyRisks || 'Market Volatility'}</span>
                    </div>
                    <span>Fit: <strong className="text-[#00D4AA]">{asset.suitabilityScore}/100</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global / Growth Investments */}
        {growthAssets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <TrendingUp className="w-4 h-4 text-[#1E88E5]" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">GLOBAL & GROWTH SATELLITES</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {growthAssets.map((asset) => (
                <div key={asset.id} style={{ ...cardStyle, padding: 18 }} className="flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: asset.color, flexShrink: 0, display: 'inline-block' }} />
                        <span className="text-[10.5px] text-[#8A94A6] uppercase font-bold">{asset.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{asset.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-[#00D4AA] font-mono block">{asset.percentage}%</span>
                      <div className="text-xs text-[#8A94A6] font-mono">{formatCurrency(asset.monthlyAmount)}/mo</div>
                    </div>
                  </div>

                  <MarketFreshnessBadge quote={quotes[asset.name] || quotes[asset.ticker || ''] || null} />

                  <p className="text-xs text-[#8A94A6] leading-relaxed line-clamp-2">
                    {asset.whyFitsProfile || asset.reasonSelected || asset.description}
                  </p>

                  <HistoricalPerformanceChart
                    symbol={asset.ticker || asset.name}
                    assetName={asset.name}
                    category={asset.category}
                    color={asset.color}
                  />

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs text-[#8A94A6]">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate max-w-[180px]">{asset.keyRisks || 'Currency & Tech Volatility'}</span>
                    </div>
                    <span>Fit: <strong className="text-[#00D4AA]">{asset.suitabilityScore}/100</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety & Liquidity */}
        {safetyAssets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <Shield className="w-4 h-4 text-[#8A94A6]" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">SAFETY, DEBT & COMMODITY HEDGES</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safetyAssets.map((asset) => (
                <div key={asset.id} style={{ ...cardStyle, padding: 18 }} className="flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: asset.color, flexShrink: 0, display: 'inline-block' }} />
                        <span className="text-[10.5px] text-[#8A94A6] uppercase font-bold">{asset.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{asset.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-[#00D4AA] font-mono block">{asset.percentage}%</span>
                      <div className="text-xs text-[#8A94A6] font-mono">{formatCurrency(asset.monthlyAmount)}/mo</div>
                    </div>
                  </div>

                  <MarketFreshnessBadge quote={quotes[asset.name] || quotes[asset.ticker || ''] || null} />

                  <p className="text-xs text-[#8A94A6] leading-relaxed line-clamp-2">
                    {asset.whyFitsProfile || asset.reasonSelected || asset.description}
                  </p>

                  <HistoricalPerformanceChart
                    symbol={asset.ticker || asset.name}
                    assetName={asset.name}
                    category={asset.category}
                    color={asset.color}
                  />

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs text-[#8A94A6]">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate max-w-[180px]">{asset.keyRisks || 'Inflation Risk'}</span>
                    </div>
                    <span>Fit: <strong className="text-[#00D4AA]">{asset.suitabilityScore}/100</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 5. Zero-Commission Execution Guide */}
      <div style={{ ...cardStyle, padding: '20px 24px' }}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Zero-Commission Direct Platforms</h3>
            <p className="text-xs text-[#8A94A6] mt-0.5">Execute direct mutual funds and ETFs without intermediary distributor fees.</p>
          </div>
          <span className="text-[10.5px] font-bold text-[#00D4AA] uppercase tracking-wider">Fiduciary Execution</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {RECOMMENDED_PLATFORMS.map((platform) => (
            <a
              key={platform.id}
              href={platform.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-lg bg-[#0A1022] hover:bg-[#141F36] border border-white/[0.08] hover:border-[#00D4AA]/40 flex flex-col justify-between gap-3 text-white no-underline transition-all cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{platform.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#8A94A6]" />
                </div>
                <p className="text-xs text-[#8A94A6] leading-relaxed">{platform.tagline}</p>
              </div>

              <div className="pt-2 border-t border-white/[0.06] text-[11px] text-[#00D4AA] font-semibold">
                {platform.badge}
              </div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};
