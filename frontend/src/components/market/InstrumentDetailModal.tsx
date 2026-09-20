import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Info,
  Building2,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Percent,
  PieChart,
  ExternalLink,
  DollarSign,
  AlertTriangle,
  Scale,
  CheckCircle2,
  XCircle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  History,
  Compass,
  HelpCircle,
  FileText,
  RotateCcw
} from "lucide-react";
import type {
  MarketInstrument,
  InstrumentResearchBundle,
  MarketResearchSignal,
  InstitutionalSignal,
  InstitutionalPriceTargets,
  TechnicalReferenceLevels,
  MarketQuote
} from "../../services/marketApi";
import { marketApi, formatIstTimestamp } from "../../services/marketApi";
import { UniversalInstrumentChart } from "./UniversalInstrumentChart";
import { Badge } from "../common/Badge";
import { useFintechStore } from "../../store/useFintechStore";

interface InstrumentDetailModalProps {
  instrument: MarketInstrument | null;
  isOpen: boolean;
  onClose: () => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (canonicalId: string) => void;
  onAskVestIQ?: (instrument: MarketInstrument) => void;
}

const StatCell: React.FC<{
  label: string;
  value: string | React.ReactNode;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
}> = ({ label, value, sub, positive, negative }) => (
  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{label}</span>
    <div className={`text-sm sm:text-base font-bold font-mono ${positive ? "text-emerald-600" : negative ? "text-red-600" : "text-slate-900"}`}>
      {value ?? "N/A"}
    </div>
    {sub && <span className="text-[10.5px] text-slate-500 block truncate">{sub}</span>}
  </div>
);

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  badge?: string;
  source?: string | null;
}> = ({ icon, title, badge, source }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
    <span className="text-teal-700">{icon}</span>
    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex-1">{title}</h3>
    {badge && (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
        {badge}
      </span>
    )}
    {source && <span className="text-[10.5px] text-slate-500">via {source}</span>}
  </div>
);

const Row: React.FC<{ label: string; value: string | React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
    <span className="text-xs text-slate-500">{label}</span>
    <span className={`text-xs font-semibold text-slate-900 ${mono ? "font-mono" : ""}`}>
      {value !== null && value !== undefined && value !== "" ? value : "N/A"}
    </span>
  </div>
);

function formatCurrencyAmount(num?: number | null, cur: string = 'USD'): string {
  if (num === null || num === undefined) return 'N/A';
  const prefix = cur === 'USD' ? '$' : (cur === 'TWD' ? 'NT$' : (cur === 'GBP' ? '£' : (cur === 'EUR' ? '€' : '₹')));
  if (Math.abs(num) >= 1e12) return `${prefix}${(num / 1e12).toFixed(2)}T`;
  if (Math.abs(num) >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e7 && cur === 'INR') return `${prefix}${(num / 1e7).toFixed(2)} Cr`;
  if (Math.abs(num) >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)}M`;
  if (Math.abs(num) >= 1e5 && cur === 'INR') return `${prefix}${(num / 1e5).toFixed(2)} Lakh`;
  if (Math.abs(num) >= 1e3) return `${prefix}${(num / 1e3).toFixed(1)}K`;
  return `${prefix}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const InstrumentDetailModal: React.FC<InstrumentDetailModalProps> = ({
  instrument, isOpen, onClose, isWatchlisted, onToggleWatchlist, onAskVestIQ
}) => {
  const { setActiveView, strategy } = useFintechStore();
  const [bundle, setBundle] = useState<InstrumentResearchBundle | null>(null);
  const [signalData, setSignalData] = useState<InstitutionalSignal | null>(null);
  const [modalQuote, setModalQuote] = useState<MarketQuote | null>(null);
  const [isLoadingResearch, setIsLoadingResearch] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const loadResearch = useCallback(async (inst: MarketInstrument) => {
    setIsLoadingResearch(true);
    try {
      const [resBundle, resSignal, resQuote] = await Promise.allSettled([
        marketApi.getResearch(inst.symbol),
        marketApi.getSignal(inst.symbol),
        marketApi.getQuote(inst.symbol)
      ]);
      if (resBundle.status === 'fulfilled') {
        setBundle(resBundle.value);
      }
      if (resSignal.status === 'fulfilled') {
        setSignalData(resSignal.value);
      }
      if (resQuote.status === 'fulfilled' && resQuote.value && resQuote.value.price !== null) {
        setModalQuote(resQuote.value);
      }
    } catch {
      // Non-blocking
    } finally {
      setIsLoadingResearch(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && instrument) {
      setBundle(null);
      setSignalData(null);
      setModalQuote(null);
      setActiveTab("overview");
      loadResearch(instrument);
    }
  }, [isOpen, instrument, loadResearch]);

  // Cross-reference user strategy allocations for portfolio integration
  const symUpper = (instrument?.symbol || '').toUpperCase();
  const tickerUpper = (instrument?.ticker || '').toUpperCase();
  const nameUpper = (instrument?.name || '').toUpperCase();

  const userOwnedInfo = useMemo(() => {
    if (!strategy?.allocations || !instrument) return null;
    for (const alloc of strategy.allocations) {
      const allocTicker = (alloc.ticker || '').toUpperCase();
      const allocName = (alloc.name || '').toUpperCase();
      const allocId = (alloc.id || '').toUpperCase();
      const insts = (alloc.suggestedInstruments || []).map(s => s.toUpperCase());

      if (
        (allocTicker && (allocTicker === symUpper || allocTicker === tickerUpper)) ||
        (allocName && (allocName === nameUpper || nameUpper.includes(allocName) || allocName.includes(nameUpper))) ||
        (allocId && (allocId === symUpper || allocId === tickerUpper)) ||
        insts.includes(symUpper) || insts.includes(tickerUpper)
      ) {
        return {
          weight: alloc.percentage || 0,
          role: alloc.portfolioRole || alloc.category || 'Core Asset',
          category: alloc.category || 'Portfolio'
        };
      }
    }
    return null;
  }, [strategy, symUpper, tickerUpper, nameUpper, instrument]);

  if (!isOpen || !instrument) return null;

  const quote = modalQuote ?? bundle?.quote ?? instrument.quote;
  const isPositive = (quote?.changePct ?? 0) >= 0;
  const curSym = instrument.currency === "USD" ? "$" : (instrument.currency === "TWD" ? "NT$" : (instrument.currency === "GBP" ? "£" : (instrument.currency === "EUR" ? "€" : "₹")));
  const isMF = instrument.assetType === "MUTUAL_FUND";
  const isETF = instrument.assetType === "ETF";
  const isStock = instrument.assetType === "STOCK";

  const fundamentals = bundle?.fundamentals;
  const valuation = bundle?.valuation;
  const dividends = bundle?.dividends;
  const risk = bundle?.risk;
  const cashFlow = bundle?.cashFlow;
  const earnings = bundle?.earnings;
  const ownership = bundle?.ownership;
  const profile = bundle?.profile;
  const analyst = bundle?.analystConsensus;
  const news = bundle?.news;
  const technicals = bundle?.technicals;
  const researchSignal: MarketResearchSignal | undefined = bundle?.researchSignal;

  // Institutional Signal & Price Targets
  const institutionalSignal: InstitutionalSignal | undefined = (signalData || bundle?.institutionalSignal) ?? undefined;
  const priceTargets: InstitutionalPriceTargets | undefined = (institutionalSignal?.priceTargets || bundle?.priceTargets) ?? undefined;
  
  // Primary Long-Term AI Research Signal
  const currentSignal = (
    institutionalSignal?.long_term_signal ||
    institutionalSignal?.horizons?.longTerm?.signal ||
    institutionalSignal?.overallSignal ||
    institutionalSignal?.signal ||
    (instrument.signalBadge as any)?.long_term_signal ||
    instrument.signalBadge?.signal ||
    instrument.signal ||
    "HOLD"
  );
  const isInsufficientData = currentSignal === 'INSUFFICIENT DATA' || institutionalSignal?.long_term_signal === 'INSUFFICIENT DATA';
  const currentConfidence = isInsufficientData ? 0 : (institutionalSignal?.confidence ?? instrument.signalBadge?.confidence ?? instrument.confidence ?? 75);
  const currentRiskScore = isInsufficientData ? "UNKNOWN" : (institutionalSignal?.riskScore || instrument.signalBadge?.riskScore || instrument.riskScore || "MEDIUM");

  // Core Thesis & Why Explanation
  const signalReason = institutionalSignal?.signal_reason || institutionalSignal?.why || institutionalSignal?.ai_explanation?.why;

  // Factors (Supporting & Negative)
  const supportingFactors = institutionalSignal?.supporting_factors || institutionalSignal?.ai_explanation?.supporting_factors || institutionalSignal?.reasons?.bullish || institutionalSignal?.factors?.bullish || [
    "Constructive momentum alignment across key moving averages",
    "Healthy return on equity and profitability profile",
    "Positive sector and market volume confirmation"
  ];
  const negativeFactors = institutionalSignal?.negative_factors || institutionalSignal?.ai_explanation?.negative_factors || institutionalSignal?.reasons?.bearish || institutionalSignal?.factors?.bearish || [
    "Overhead technical resistance zones",
    "Valuation multiple sensitive to macro rate shifts"
  ];

  // Consequences
  const consequences = institutionalSignal?.consequences || institutionalSignal?.potential_consequences || institutionalSignal?.ai_explanation?.consequences;

  // Risks & Why Signal Could Be Wrong
  const majorRisks = institutionalSignal?.major_risks || institutionalSignal?.risks || institutionalSignal?.ai_explanation?.risks || [];
  const whySignalCouldBeWrong = institutionalSignal?.why_signal_could_be_wrong || (institutionalSignal?.ai_explanation as any)?.why_signal_could_be_wrong || [];

  // What Would Change The Signal
  const signalUpgradeConditions = institutionalSignal?.signal_upgrade_conditions || [];
  const signalDowngradeConditions = institutionalSignal?.signal_downgrade_conditions || [];

  // Historical Depth
  const historicalDepthBars = institutionalSignal?.historical_depth_bars;
  const historicalYears = institutionalSignal?.historical_years;
  const longTermSufficiency = institutionalSignal?.long_term_history_sufficiency;
  const historicalDepthDisclosure = institutionalSignal?.historical_depth_disclosure;

  // Technical Reference Levels
  const techLevels: TechnicalReferenceLevels | undefined = institutionalSignal?.technical_reference_levels;

  // AI Narrative Explanation
  const aiExplanationText = institutionalSignal?.ai_explanation?.explanation;

  const instResearch = institutionalSignal?.institutionalResearch || institutionalSignal?.research;
  const signalHistoryList = institutionalSignal?.signalHistory || institutionalSignal?.history || [];

  // Portfolio Suggested Action
  const isOwned = Boolean(userOwnedInfo);
  let suggestedAction = 'HOLD';
  if (currentSignal === 'STRONG BUY') suggestedAction = 'BUY MORE';
  else if (currentSignal === 'BUY') suggestedAction = 'ACCUMULATE';
  else if (currentSignal === 'HOLD') suggestedAction = 'HOLD';
  else if (currentSignal === 'SELL') suggestedAction = 'REDUCE';
  else if (currentSignal === 'STRONG SELL') suggestedAction = 'EXIT';
  else if (currentSignal === 'INSUFFICIENT DATA') suggestedAction = 'MONITOR';

  const getSignalColor = (sig: string) => {
    switch (sig) {
      case 'STRONG BUY':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700';
      case 'BUY':
        return 'bg-emerald-600 text-white border-emerald-500';
      case 'HOLD':
        return 'bg-blue-600 text-white border-blue-500';
      case 'SELL':
        return 'bg-amber-600 text-white border-amber-500';
      case 'STRONG SELL':
        return 'bg-red-600 text-white border-red-500';
      case 'INSUFFICIENT DATA':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-700 text-white border-slate-600';
    }
  };

  const getActionColor = (act: string) => {
    switch (act) {
      case 'BUY MORE':
        return 'bg-emerald-900 text-emerald-200 border-emerald-700';
      case 'ACCUMULATE':
        return 'bg-emerald-700 text-emerald-100 border-emerald-600';
      case 'HOLD':
        return 'bg-blue-700 text-blue-100 border-blue-600';
      case 'REDUCE':
        return 'bg-amber-700 text-amber-100 border-amber-600';
      case 'EXIT':
        return 'bg-red-700 text-red-100 border-red-600';
      case 'MONITOR':
        return 'bg-slate-700 text-slate-200 border-slate-600';
      default:
        return 'bg-slate-700 text-slate-200 border-slate-600';
    }
  };

  const tabs: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview & Chart", icon: <Info className="w-3.5 h-3.5" /> },
    { key: "signal", label: "Signals & Targets", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { key: "vestiq_research", label: "Institutional Research", icon: <FileText className="w-3.5 h-3.5" /> },
    ...(isStock ? [{ key: "fundamentals", label: "Fundamentals", icon: <BarChart3 className="w-3.5 h-3.5" /> }] : []),
    ...(isETF || isMF ? [{ key: "fund_profile", label: isMF ? "Scheme Details" : "ETF Profile", icon: <PieChart className="w-3.5 h-3.5" /> }] : []),
    { key: "technicals", label: "Technicals", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: "analyst_news", label: "Analyst & News", icon: <Building2 className="w-3.5 h-3.5" /> }
  ];

  const handleAskIQ = () => {
    if (onAskVestIQ) {
      onAskVestIQ(instrument);
    } else {
      setActiveView('ai');
    }
  };

  const getFreshnessBadge = (freshness?: string, status?: string) => {
    if (isMF) {
      return <Badge variant="fallback">LATEST NAV ({quote?.navDate || "OFFICIAL"})</Badge>;
    }
    const mkt = (quote?.marketStatus || "").toUpperCase();
    if (mkt === "CLOSED" || mkt === "WEEKEND" || mkt === "HOLIDAY") {
      return <Badge variant="neutral">MARKET CLOSED</Badge>;
    }
    if (mkt === "PRE_OPEN") {
      return <Badge variant="neutral">PRE-OPEN</Badge>;
    }
    if (quote?.isStale === true) {
      return <Badge variant="stale">STALE</Badge>;
    }
    if (quote?.isLive === true) {
      return <Badge variant="live">LIVE</Badge>;
    }
    const s = (freshness || status || "UNAVAILABLE").toUpperCase();
    if (s === "DELAYED") return <Badge variant="delayed">DELAYED (15M)</Badge>;
    if (s === "STALE") return <Badge variant="stale">STALE</Badge>;
    if (s === "REALTIME" || s === "LIVE") return <Badge variant="live">LIVE</Badge>;
    if (s === "LATEST_AVAILABLE" || s === "HISTORICAL" || s === "FALLBACK") return <Badge variant="fallback">LATEST AVAILABLE</Badge>;
    return <Badge variant="unavailable">UNAVAILABLE</Badge>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto text-[var(--color-text-primary)] animate-scale-in">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-xl font-bold text-[var(--color-text-primary)] tracking-tight">{instrument.name}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {instrument.symbol}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 uppercase">
                {instrument.assetType}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {instrument.exchange}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {quote?.source || (isMF ? "AMFI" : "Angel One SmartAPI")}
              </span>
              {getFreshnessBadge(quote?.freshness, quote?.status)}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              {instrument.isin && <span>ISIN: <strong className="font-mono text-slate-700">{instrument.isin}</strong></span>}
              {instrument.sector && <span>• Sector: <strong className="text-slate-700">{instrument.sector}</strong></span>}
              {instrument.category && <span>• Category: <strong className="text-slate-700">{instrument.category}</strong></span>}
              {isLoadingResearch && (
                <span className="flex items-center gap-1 text-teal-700 font-medium">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Loading deep institutional research...</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleWatchlist && (
              <button
                type="button"
                onClick={() => onToggleWatchlist(instrument.canonicalId)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  isWatchlisted
                    ? "bg-teal-50 border-teal-300 text-teal-800"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                {isWatchlisted ? <BookmarkCheck className="w-4 h-4 text-teal-600" /> : <Bookmark className="w-4 h-4" />}
                <span className="hidden sm:inline">{isWatchlisted ? "Watching" : "Watch"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAskIQ}
              className="px-3 py-2 rounded-xl bg-[#00D4AA] text-[#0F172A] hover:bg-teal-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <span>Ask VestIQ</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Quote & Signal Banner */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            {isMF && (
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                NAV
              </span>
            )}
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {quote?.price !== null && quote?.price !== undefined
                ? `${curSym}${Number(quote.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: isMF ? 4 : 2 })}`
                : "Quote Unavailable"}
            </span>
            {quote?.change !== null && quote?.change !== undefined && (
              <span className={`text-sm font-bold font-mono ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                {isPositive ? "+" : ""}{Number(quote.change).toFixed(2)} ({isPositive ? "+" : ""}{Number(quote.changePct).toFixed(2)}%)
              </span>
            )}
            {isMF && quote?.navDate ? (
              <span className="text-xs text-slate-500 font-sans">
                As of NAV Date: <strong className="text-slate-700 font-mono">{quote.navDate}</strong>
              </span>
            ) : (quote?.displayTimestampIst || quote?.asOf || quote?.exchangeTimestamp || quote?.timestamp) ? (
              <span className="text-xs text-slate-500 font-sans">
                Timestamp: <strong className="text-slate-700 font-mono" title={quote?.exchangeTimestampUtc ? `UTC: ${quote.exchangeTimestampUtc}` : undefined}>
                  {quote.displayTimestampIst || (quote.exchangeTimestampUtc ? formatIstTimestamp(quote.exchangeTimestampUtc) : (quote.asOf || quote.exchangeTimestamp || quote.timestamp))}
                </strong>
              </span>
            ) : null}
            <span className={`text-[10.5px] font-mono px-2 py-0.5 rounded font-semibold ${
              quote?.isLive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
              quote?.isStale ? "bg-amber-50 text-amber-700 border border-amber-200" :
              "bg-slate-100 text-slate-600 border border-slate-200"
            }`}>
              {quote?.isLive ? "LIVE" : quote?.isStale ? "STALE" : "LATEST AVAILABLE"}
            </span>
          </div>

          {/* Quick Institutional Signal Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Signal:</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider border shadow-2xs ${getSignalColor(currentSignal)}`}>
                {currentSignal}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-600 hidden sm:block">
              Conf: <strong className="text-slate-900">{currentConfidence}%</strong>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${
              currentRiskScore === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
              currentRiskScore === 'LOW' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {currentRiskScore} RISK
            </span>
          </div>
        </div>

        {/* Portfolio Ownership Ribbon if owned */}
        {isOwned && (
          <div className="px-5 py-2.5 bg-teal-50 border-b border-teal-200 flex items-center justify-between flex-wrap gap-2 text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span className="font-bold">Portfolio Asset</span>
              <span className="text-teal-700">• Allocation Weight: <strong>{userOwnedInfo?.weight}%</strong></span>
              <span className="text-teal-700">• Role: <strong>{userOwnedInfo?.role}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold text-teal-800">Recommended Action:</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${getActionColor(suggestedAction)}`}>
                {suggestedAction}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center px-4 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "border-[#00D4AA] text-teal-900 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          
          {/* TAB 1: OVERVIEW & CHART */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Candlestick / NAV Chart */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <UniversalInstrumentChart
                  symbol={instrument.symbol}
                  assetType={instrument.assetType}
                  currency={curSym}
                  defaultPeriod="1Y"
                />
              </div>

              {/* Key Price Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCell label="Open" value={quote?.open ? `${curSym}${Number(quote.open).toFixed(2)}` : "N/A"} />
                <StatCell label="Day High" value={quote?.high ? `${curSym}${Number(quote.high).toFixed(2)}` : "N/A"} />
                <StatCell label="Day Low" value={quote?.low ? `${curSym}${Number(quote.low).toFixed(2)}` : "N/A"} />
                <StatCell label="Prev Close" value={quote?.prevClose ? `${curSym}${Number(quote.prevClose).toFixed(2)}` : "N/A"} />
                <StatCell label="52W High" value={risk?.fiftyTwoWeekHigh ? `${curSym}${Number(risk.fiftyTwoWeekHigh).toFixed(2)}` : "N/A"} />
                <StatCell label="52W Low" value={risk?.fiftyTwoWeekLow ? `${curSym}${Number(risk.fiftyTwoWeekLow).toFixed(2)}` : "N/A"} />
                {!isMF ? (
                  <StatCell label="Volume" value={quote?.volume ? Number(quote.volume).toLocaleString() : "N/A"} />
                ) : (
                  <StatCell label="Provenance" value={typeof institutionalSignal?.provenance === 'string' ? institutionalSignal.provenance : "AMFI Official NAV"} />
                )}
                <StatCell label="Market Cap" value={valuation?.marketCap ? formatCurrencyAmount(valuation.marketCap, instrument.currency) : "N/A"} />
              </div>

              {/* Institutional Price Targets / Reference Levels Preview */}
              {isInsufficientData ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Long-Term Model: Insufficient Data</h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    {signalReason || "Historical observation depth is limited. Quantitative technical reference levels are omitted until multi-year depth is verified."}
                  </p>
                </div>
              ) : (techLevels || priceTargets) ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-teal-700" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Technical Reference Levels</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("signal")}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Signal & Thesis</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {techLevels ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200 space-y-1">
                        <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Target 1 (Primary)</span>
                        <div className="text-base font-extrabold font-mono text-teal-950">
                          {curSym}{techLevels.target_1 !== undefined ? Number(techLevels.target_1).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                        </div>
                        {techLevels.target_1 !== undefined && techLevels.reference_price && (
                          <span className={`text-xs font-bold font-mono ${techLevels.target_1 >= techLevels.reference_price ? "text-emerald-600" : "text-red-600"}`}>
                            {techLevels.target_1 >= techLevels.reference_price ? "+" : ""}
                            {(((techLevels.target_1 - techLevels.reference_price) / techLevels.reference_price) * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target 2 (Extended)</span>
                        <div className="text-base font-extrabold font-mono text-slate-900">
                          {curSym}{techLevels.target_2 !== undefined ? Number(techLevels.target_2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                        </div>
                        {techLevels.target_2 !== undefined && techLevels.reference_price && (
                          <span className={`text-xs font-bold font-mono ${techLevels.target_2 >= techLevels.reference_price ? "text-emerald-600" : "text-red-600"}`}>
                            {techLevels.target_2 >= techLevels.reference_price ? "+" : ""}
                            {(((techLevels.target_2 - techLevels.reference_price) / techLevels.reference_price) * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Invalidation Level</span>
                        <div className="text-base font-extrabold font-mono text-slate-900">
                          {curSym}{techLevels.invalidation !== undefined ? Number(techLevels.invalidation).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                        </div>
                        {techLevels.invalidation !== undefined && techLevels.reference_price && (
                          <span className={`text-xs font-bold font-mono ${techLevels.invalidation >= techLevels.reference_price ? "text-emerald-600" : "text-red-600"}`}>
                            {techLevels.invalidation >= techLevels.reference_price ? "+" : ""}
                            {(((techLevels.invalidation - techLevels.reference_price) / techLevels.reference_price) * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ) : priceTargets ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Conservative (1-3m)</span>
                        <div className="text-base font-extrabold font-mono text-slate-900">
                          {curSym}{priceTargets.conservative.price ?? priceTargets.conservative.targetPrice}
                        </div>
                        <span className={`text-xs font-bold font-mono ${(priceTargets.conservative.upsidePct ?? priceTargets.conservative.upsidePercent ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {(priceTargets.conservative.upsidePct ?? priceTargets.conservative.upsidePercent ?? 0) >= 0 ? "+" : ""}{priceTargets.conservative.upsidePct ?? priceTargets.conservative.upsidePercent ?? 0}% Upside
                        </span>
                      </div>

                      <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200 space-y-1">
                        <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Base Case (6-12m)</span>
                        <div className="text-base font-extrabold font-mono text-teal-950">
                          {curSym}{priceTargets.base.price ?? priceTargets.base.targetPrice}
                        </div>
                        <span className={`text-xs font-bold font-mono ${(priceTargets.base.upsidePct ?? priceTargets.base.upsidePercent ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {(priceTargets.base.upsidePct ?? priceTargets.base.upsidePercent ?? 0) >= 0 ? "+" : ""}{priceTargets.base.upsidePct ?? priceTargets.base.upsidePercent ?? 0}% Upside
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Aggressive (12-24m)</span>
                        <div className="text-base font-extrabold font-mono text-slate-900">
                          {curSym}{priceTargets.aggressive.price ?? priceTargets.aggressive.targetPrice}
                        </div>
                        <span className={`text-xs font-bold font-mono ${(priceTargets.aggressive.upsidePct ?? priceTargets.aggressive.upsidePercent ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {(priceTargets.aggressive.upsidePct ?? priceTargets.aggressive.upsidePercent ?? 0) >= 0 ? "+" : ""}{priceTargets.aggressive.upsidePct ?? priceTargets.aggressive.upsidePercent ?? 0}% Upside
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Research Signal Summary Card */}
              {researchSignal && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-700" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Market Research Factors</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Coverage: <strong>{researchSignal.coveragePct}%</strong></span>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                        researchSignal.signal === "BUY" ? "bg-emerald-100 text-emerald-800" :
                        researchSignal.signal === "SELL" ? "bg-red-100 text-red-800" :
                        researchSignal.signal === "HOLD" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"
                      }`}>
                        {researchSignal.signal}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-700">
                    {researchSignal.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10.5px] text-slate-500 leading-relaxed">
                    Signals are AI-generated analytical insights based on market data, technical indicators and fundamental metrics. They are not financial advice.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI SIGNALS & TARGETS */}
          {activeTab === "signal" && (
            <div className="space-y-6">
              
              {/* Main Model Decision & Confidence Banner */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Primary Long-Term AI Research Signal</span>
                    <div className="mt-1 flex items-center gap-3">
                      <span className={`px-3.5 py-1.5 rounded-xl text-base sm:text-lg font-bold font-mono uppercase tracking-wider border shadow-sm ${getSignalColor(currentSignal)}`}>
                        {currentSignal}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border font-mono ${
                        currentRiskScore === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
                        currentRiskScore === 'LOW' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        currentRiskScore === 'UNKNOWN' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {currentRiskScore} RISK
                      </span>
                      {isMF && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          AMFI PROVENANCE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Signal Confidence</span>
                      <div className="text-2xl font-extrabold font-mono text-slate-900">
                        {currentConfidence}%
                      </div>
                    </div>
                    {institutionalSignal?.compositeScore !== undefined && !isInsufficientData && (
                      <div className="text-right border-l border-slate-200 pl-4">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Composite Score</span>
                        <div className={`text-2xl font-extrabold font-mono ${institutionalSignal.compositeScore >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {institutionalSignal.compositeScore >= 0 ? "+" : ""}{institutionalSignal.compositeScore}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#00D4AA] h-2 rounded-full transition-all"
                    style={{ width: `${currentConfidence}%` }}
                  />
                </div>

                {/* Historical Depth & Observation Evidence */}
                {(historicalYears !== undefined || historicalDepthBars !== undefined || longTermSufficiency) && (
                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <History className="w-3.5 h-3.5 text-teal-700" />
                      <span className="font-semibold text-slate-700">Long-term evidence:</span>
                      <span className="font-mono text-slate-900">
                        {historicalYears !== undefined ? `${historicalYears} years` : ''}
                        {historicalYears !== undefined && historicalDepthBars !== undefined ? ' / ' : ''}
                        {historicalDepthBars !== undefined ? `${historicalDepthBars.toLocaleString()} daily observations` : ''}
                      </span>
                    </div>
                    {longTermSufficiency && (
                      <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold font-mono uppercase tracking-wider border ${
                        longTermSufficiency === 'SUFFICIENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        longTermSufficiency === 'DEEP' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        longTermSufficiency === 'LIMITED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        Data Depth: {longTermSufficiency}
                      </span>
                    )}
                  </div>
                )}
                {historicalDepthDisclosure && (
                  <p className="text-[11px] text-slate-500 italic">
                    {historicalDepthDisclosure}
                  </p>
                )}

                {/* Portfolio Context if owned */}
                {isOwned && (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-teal-700" />
                      <span className="font-semibold text-teal-900">
                        Currently in your portfolio ({userOwnedInfo?.weight}% weight). Suggested rebalance action:
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-lg font-bold font-mono text-xs border ${getActionColor(suggestedAction)}`}>
                      {suggestedAction}
                    </span>
                  </div>
                )}
              </div>

              {/* Insufficient Data Notice (if applicable) */}
              {isInsufficientData && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Insufficient Historical Data for Long-Term Model</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {signalReason || "Historical observation depth is limited. Missing multi-year price data prevents reliable long-term factor scoring and target projection."}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Confidence is marked at 0%. Quant model requires a multi-year observation dataset before projecting price targets.
                  </div>
                </div>
              )}

              {/* 2. WHY Section (Actual API Explanation) */}
              {signalReason && (
                <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/80 space-y-2">
                  <span className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-teal-700" />
                    <span>Why This Signal: Long-Term Thesis</span>
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {signalReason}
                  </p>
                </div>
              )}

              {/* Execution Horizons (Long-Term is Primary Anchor) */}
              <div className="space-y-3">
                <SectionHeader icon={<Compass className="w-4 h-4" />} title="Execution Horizons (Long-Term is Primary Anchor)" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Short Term */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tactical Horizon</span>
                      <span className="text-[10px] text-slate-400 font-mono">1 – 30 Days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono uppercase border ${getSignalColor(institutionalSignal?.horizons?.shortTerm?.signal || currentSignal)}`}>
                        {institutionalSignal?.horizons?.shortTerm?.signal || currentSignal}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        Score: {institutionalSignal?.horizons?.shortTerm?.score ?? 60}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {institutionalSignal?.horizons?.shortTerm?.rationale || "RSI momentum and moving average positioning define short term tactical sentiment."}
                    </p>
                  </div>

                  {/* Swing */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Intermediate Swing</span>
                      <span className="text-[10px] text-slate-400 font-mono">1 – 6 Months</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono uppercase border ${getSignalColor(institutionalSignal?.horizons?.swing?.signal || currentSignal)}`}>
                        {institutionalSignal?.horizons?.swing?.signal || currentSignal}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        Score: {institutionalSignal?.horizons?.swing?.score ?? 65}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {institutionalSignal?.horizons?.swing?.rationale || "Intermediate trend conviction supported by volume profile and structural breakouts."}
                    </p>
                  </div>

                  {/* Long Term */}
                  <div className="p-4 rounded-xl bg-teal-50/60 border-2 border-teal-400 shadow-xs space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Long-Term Core</span>
                        <span className="px-1.5 py-0.2 rounded bg-teal-200 text-teal-900 text-[9px] font-bold">PRIMARY</span>
                      </span>
                      <span className="text-[10px] text-teal-700 font-mono">1 – 10 Years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono uppercase border shadow-2xs ${getSignalColor(currentSignal)}`}>
                        {currentSignal}
                      </span>
                      <span className="text-xs font-mono font-bold text-teal-950">
                        Score: {institutionalSignal?.horizons?.longTerm?.score ?? 70}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed pt-1">
                      {institutionalSignal?.horizons?.longTerm?.rationale || signalReason || "Secular fundamentals, profitability ratios, and balance sheet resilience support multi-year compound thesis."}
                    </p>
                  </div>

                </div>
              </div>

              {/* 11. Technical Reference Levels (Omitted on Insufficient Data) */}
              {!isInsufficientData && (techLevels || priceTargets) && (
                <div className="space-y-3">
                  <SectionHeader icon={<Target className="w-4 h-4" />} title="Technical Reference Levels" />
                  {techLevels ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Target 1 */}
                        <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-300 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Target 1 (Primary Objective)</span>
                            <span className="text-[10px] font-mono text-teal-700">6 – 12 Months</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-xl font-extrabold font-mono text-teal-950">
                              {curSym}{techLevels.target_1 !== undefined ? Number(techLevels.target_1).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                            </span>
                            {techLevels.target_1 !== undefined && techLevels.reference_price && (
                              <span className={`text-xs font-bold font-mono ${techLevels.target_1 >= techLevels.reference_price ? "text-emerald-600" : "text-red-600"}`}>
                                {techLevels.target_1 >= techLevels.reference_price ? "+" : ""}
                                {(((techLevels.target_1 - techLevels.reference_price) / techLevels.reference_price) * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed pt-1">
                            Primary technical target anchored by multi-period structure and ATR expansion band.
                          </p>
                        </div>

                        {/* Target 2 */}
                        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target 2 (Extended Objective)</span>
                            <span className="text-[10px] font-mono text-slate-400">12 – 24 Months</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-xl font-extrabold font-mono text-slate-900">
                              {curSym}{techLevels.target_2 !== undefined ? Number(techLevels.target_2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                            </span>
                            {techLevels.target_2 !== undefined && techLevels.reference_price && (
                              <span className={`text-xs font-bold font-mono ${techLevels.target_2 >= techLevels.reference_price ? "text-emerald-600" : "text-red-600"}`}>
                                {techLevels.target_2 >= techLevels.reference_price ? "+" : ""}
                                {(((techLevels.target_2 - techLevels.reference_price) / techLevels.reference_price) * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed pt-1">
                            Secondary extended objective based on secular momentum and multi-year valuation multiple.
                          </p>
                        </div>

                        {/* Invalidation */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Invalidation Level</span>
                            <span className="text-[10px] font-mono text-slate-400">Structural Floor</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-xl font-extrabold font-mono text-slate-900">
                              {curSym}{techLevels.invalidation !== undefined ? Number(techLevels.invalidation).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                            </span>
                            {techLevels.invalidation !== undefined && techLevels.reference_price && (
                              <span className={`text-xs font-bold font-mono ${techLevels.invalidation >= techLevels.reference_price ? "text-emerald-600" : "text-red-600"}`}>
                                {techLevels.invalidation >= techLevels.reference_price ? "+" : ""}
                                {(((techLevels.invalidation - techLevels.reference_price) / techLevels.reference_price) * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed pt-1">
                            Structural invalidation support below which the current long-term thesis is reconsidered.
                          </p>
                        </div>
                      </div>

                      {/* Reference Pricing & Note */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-3 font-mono text-slate-700">
                          <span>Reference Price: <strong>{curSym}{techLevels.reference_price}</strong></span>
                          {techLevels.risk_reward_ratio !== undefined && (
                            <span>• Risk/Reward Ratio: <strong>{techLevels.risk_reward_ratio}:1</strong></span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {techLevels.note || "Technical reference levels are quantitative price markers, not guaranteed long-term forecasts."}
                        </span>
                      </div>
                    </div>
                  ) : priceTargets ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conservative</span>
                          <span className="text-[10px] font-mono text-slate-500">{priceTargets.conservative.horizon}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-extrabold font-mono text-slate-900">
                            {curSym}{priceTargets.conservative.price ?? priceTargets.conservative.targetPrice}
                          </span>
                          <span className={`text-xs font-bold font-mono ${(priceTargets.conservative.upsidePct ?? priceTargets.conservative.upsidePercent ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {(priceTargets.conservative.upsidePct ?? priceTargets.conservative.upsidePercent ?? 0) >= 0 ? "+" : ""}{priceTargets.conservative.upsidePct ?? priceTargets.conservative.upsidePercent ?? 0}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                          {priceTargets.conservative.reasoning || priceTargets.reasoning || "Conservative target anchored by lower band support."}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-300 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Base Target</span>
                          <span className="text-[10px] font-mono text-teal-700">{priceTargets.base.horizon}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-extrabold font-mono text-teal-950">
                            {curSym}{priceTargets.base.price ?? priceTargets.base.targetPrice}
                          </span>
                          <span className={`text-xs font-bold font-mono ${(priceTargets.base.upsidePct ?? priceTargets.base.upsidePercent ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {(priceTargets.base.upsidePct ?? priceTargets.base.upsidePercent ?? 0) >= 0 ? "+" : ""}{priceTargets.base.upsidePct ?? priceTargets.base.upsidePercent ?? 0}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed pt-1">
                          {priceTargets.base.reasoning || priceTargets.reasoning || "Base target aligned with historical multiples and operating trajectory."}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aggressive</span>
                          <span className="text-[10px] font-mono text-slate-500">{priceTargets.aggressive.horizon}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-extrabold font-mono text-slate-900">
                            {curSym}{priceTargets.aggressive.price ?? priceTargets.aggressive.targetPrice}
                          </span>
                          <span className={`text-xs font-bold font-mono ${(priceTargets.aggressive.upsidePct ?? priceTargets.aggressive.upsidePercent ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {(priceTargets.aggressive.upsidePct ?? priceTargets.aggressive.upsidePercent ?? 0) >= 0 ? "+" : ""}{priceTargets.aggressive.upsidePct ?? priceTargets.aggressive.upsidePercent ?? 0}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                          {priceTargets.aggressive.reasoning || priceTargets.reasoning || "Aggressive valuation factoring multiple expansion and volume acceleration."}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* 3 & 4. Factors Checklist: Supporting vs Negative Factors */}
              <div className="space-y-3">
                <SectionHeader icon={<Scale className="w-4 h-4" />} title="Factor Breakdown & Checklist" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Supporting Factors */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Supporting Factors ({supportingFactors.length})</span>
                    </span>
                    <div className="space-y-1.5">
                      {supportingFactors.map((f: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-emerald-950">
                          <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                          <span className="leading-relaxed">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Negative Factors */}
                  <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 space-y-2.5">
                    <span className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Negative / Caution Factors ({negativeFactors.length})</span>
                    </span>
                    <div className="space-y-1.5">
                      {negativeFactors.map((f: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-red-950">
                          <span className="text-red-600 font-bold mt-0.5">✗</span>
                          <span className="leading-relaxed">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* 5. Potential Consequences & Holding Implications */}
              {consequences && (consequences.potential_upside_case || consequences.potential_downside_case || consequences.holding_implication) && (
                <div className="space-y-3">
                  <SectionHeader icon={<Compass className="w-4 h-4" />} title="Potential Consequences & Holding Implications" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {consequences.potential_upside_case && (
                      <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/70 space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Potential Upside Case</span>
                        </span>
                        <p className="text-xs text-emerald-950 leading-relaxed">
                          {consequences.potential_upside_case}
                        </p>
                      </div>
                    )}
                    {consequences.potential_downside_case && (
                      <div className="p-4 rounded-xl bg-red-50/40 border border-red-200/70 space-y-1.5">
                        <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Potential Downside Case</span>
                        </span>
                        <p className="text-xs text-red-950 leading-relaxed">
                          {consequences.potential_downside_case}
                        </p>
                      </div>
                    )}
                    {consequences.holding_implication && (
                      <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200/70 space-y-1.5">
                        <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                          <span>Holding Implication</span>
                        </span>
                        <p className="text-xs text-slate-800 leading-relaxed">
                          {consequences.holding_implication}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 6 & 7. Major Risks & Why Signal Could Be Wrong */}
              {((majorRisks && majorRisks.length > 0) || (whySignalCouldBeWrong && whySignalCouldBeWrong.length > 0)) && (
                <div className="space-y-3">
                  <SectionHeader icon={<ShieldAlert className="w-4 h-4" />} title="Risk Audit & Model Sensitivity" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {majorRisks && majorRisks.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Major Investment Risks ({majorRisks.length})</span>
                        </span>
                        <div className="space-y-1.5">
                          {majorRisks.map((riskItem: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-amber-950">
                              <span className="text-amber-600 font-bold mt-0.5">•</span>
                              <span className="leading-relaxed">{riskItem}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {whySignalCouldBeWrong && whySignalCouldBeWrong.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-slate-600" />
                          <span>Why This Signal Could Be Wrong ({whySignalCouldBeWrong.length})</span>
                        </span>
                        <div className="space-y-1.5">
                          {whySignalCouldBeWrong.map((item: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="text-teal-600 font-bold mt-0.5">?</span>
                              <span className="leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 8. What Would Change The Signal (Upgrade / Downgrade Conditions) */}
              {((signalUpgradeConditions && signalUpgradeConditions.length > 0) || (signalDowngradeConditions && signalDowngradeConditions.length > 0)) && (
                <div className="space-y-3">
                  <SectionHeader icon={<RotateCcw className="w-4 h-4" />} title="What Would Change This Signal" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {signalUpgradeConditions && signalUpgradeConditions.length > 0 && (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                          <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                          <span>Conditions For Signal Upgrade</span>
                        </span>
                        <div className="space-y-1.5">
                          {signalUpgradeConditions.map((cond: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="text-emerald-600 font-bold mt-0.5">↑</span>
                              <span className="leading-relaxed">{cond}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {signalDowngradeConditions && signalDowngradeConditions.length > 0 && (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                        <span className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                          <span>Conditions For Signal Downgrade</span>
                        </span>
                        <div className="space-y-1.5">
                          {signalDowngradeConditions.map((cond: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="text-red-600 font-bold mt-0.5">↓</span>
                              <span className="leading-relaxed">{cond}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Historical Signals Timeline */}
              {signalHistoryList.length > 0 && (
                <div className="space-y-3">
                  <SectionHeader icon={<History className="w-4 h-4" />} title="Signal History Tracking & Performance" />
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-4 p-2.5 bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <span>Date</span>
                      <span>Signal</span>
                      <span>Signal Price</span>
                      <span className="text-right">Return Since</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {signalHistoryList.map((h, i: number) => (
                        <div key={i} className="grid grid-cols-4 p-3 text-xs items-center font-mono">
                          <span className="text-slate-600">{h.date}</span>
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSignalColor(h.signal)}`}>
                              {h.signal}
                            </span>
                          </div>
                          <span className="text-slate-900">{h.price ? `${curSym}${h.price}` : "—"}</span>
                          <span className={`text-right font-bold ${
                            (h.returnSincePct ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}>
                            {(h.returnSincePct ?? 0) >= 0 ? "+" : ""}{h.returnSincePct ?? 0}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 12. Full AI Explanation Narrative */}
              {aiExplanationText && (
                <div className="space-y-3">
                  <SectionHeader icon={<FileText className="w-4 h-4" />} title="AI Research Synthesis & Model Narrative" />
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                      {aiExplanationText}
                    </div>
                  </div>
                </div>
              )}

              {/* Regulatory Disclaimer */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 leading-relaxed">
                Signals are quantitative analytical indicators based on market data, technical indicators, and fundamental metrics. They do not constitute financial advice.
              </div>

            </div>
          )}

          {/* TAB 3: INSTITUTIONAL RESEARCH (VESTIQ) */}
          {activeTab === "vestiq_research" && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-teal-700" />
                  <div>
                    <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider">VestIQ Institutional Research Dossier</h4>
                    <p className="text-xs text-teal-800">
                      Fundamental, quantitative, and competitive assessment compiled by VestIQ Advisory Engine.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAskIQ}
                  className="px-3 py-1.5 rounded-xl bg-[#00D4AA] text-[#0F172A] hover:bg-teal-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  <span>Ask VestIQ</span>
                </button>
              </div>

              {/* Comprehensive Research Dossier */}
              {aiExplanationText && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-700" />
                    <span>Quantitative Synthesis & Research Dossier</span>
                  </span>
                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                    {aiExplanationText}
                  </div>
                </div>
              )}

              {/* Valuation Summary */}
              {instResearch?.valuationSummary && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-teal-700" />
                    <span>Valuation & Intrinsic Assessment</span>
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {instResearch.valuationSummary}
                  </p>
                </div>
              )}

              {/* Bull Case vs Bear Case */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Bull Case */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Institutional Bull Case</span>
                  </span>
                  <div className="space-y-1.5">
                    {(instResearch?.bullCase ?? [
                      "Dominant market position and resilient moats",
                      "Strong operating cash flow generation",
                      "Multi-year secular demand catalysts"
                    ]).map((point: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-emerald-950">
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bear Case */}
                <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 space-y-2.5">
                  <span className="text-xs font-bold text-red-950 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Institutional Bear Case</span>
                  </span>
                  <div className="space-y-1.5">
                    {(instResearch?.bearCase ?? [
                      "Cyclical margin compression risks",
                      "Competitive reinvestment pressure",
                      "Valuation multiple contraction during macro shifts"
                    ]).map((point: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-red-950">
                        <span className="text-red-600 font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Growth Drivers & Risk Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Growth Drivers */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-teal-700" />
                    <span>Growth Drivers</span>
                  </span>
                  <div className="space-y-1.5">
                    {(instResearch?.growthDrivers ?? [
                      "Expansion into higher margin verticals",
                      "Operational leverage and efficiency gains"
                    ]).map((g: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-teal-600 font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>Risk Factors</span>
                  </span>
                  <div className="space-y-1.5">
                    {(instResearch?.riskFactors ?? [
                      "Macro interest rate sensitivity",
                      "Currency fluctuations and input cost inflation"
                    ]).map((r: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-amber-600 font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Regulatory Disclaimer */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 leading-relaxed">
                Signals are AI-generated analytical insights based on market data, technical indicators and fundamental metrics. They are not financial advice.
              </div>

            </div>
          )}

          {/* TAB 4: STOCK FUNDAMENTALS */}
          {activeTab === "fundamentals" && (
            <div className="space-y-6">
              {/* Valuation Ratios */}
              <div className="space-y-3">
                <SectionHeader icon={<Scale className="w-4 h-4" />} title="Valuation Multiples" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                  <Row label="Trailing P/E Ratio" value={valuation?.peRatio ? `${valuation.peRatio}x` : "N/A"} mono />
                  <Row label="Forward P/E Ratio" value={valuation?.forwardPE ? `${valuation.forwardPE}x` : "N/A"} mono />
                  <Row label="Price to Book (P/B)" value={valuation?.pbRatio ? `${valuation.pbRatio}x` : "N/A"} mono />
                  <Row label="Price to Sales (P/S)" value={valuation?.psRatio ? `${valuation.psRatio}x` : "N/A"} mono />
                  <Row label="EV / EBITDA" value={valuation?.evEbitda ? `${valuation.evEbitda}x` : "N/A"} mono />
                  <Row label="EV / Revenue" value={valuation?.evSales ? `${valuation.evSales}x` : "N/A"} mono />
                  <Row label="PEG Ratio" value={valuation?.peg ? `${valuation.peg}` : "N/A"} mono />
                  <Row label="Trailing EPS" value={fundamentals?.eps ? `${curSym}${fundamentals.eps}` : "N/A"} mono />
                  <Row label="Forward EPS" value={fundamentals?.forwardEPS ? `${curSym}${fundamentals.forwardEPS}` : "N/A"} mono />
                  <Row label="Book Value Per Share" value={fundamentals?.bookValuePerShare ? `${curSym}${fundamentals.bookValuePerShare}` : "N/A"} mono />
                </div>
              </div>

              {/* Profitability & Margins */}
              <div className="space-y-3">
                <SectionHeader icon={<TrendingUp className="w-4 h-4" />} title="Profitability & Returns" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                  <Row label="Return on Equity (ROE)" value={fundamentals?.roe ? `${fundamentals.roe}%` : "N/A"} mono />
                  <Row label="Return on Assets (ROA)" value={fundamentals?.roa ? `${fundamentals.roa}%` : "N/A"} mono />
                  <Row label="ROCE / Capital Employed" value={fundamentals?.roce ? `${fundamentals.roce}%` : "N/A"} mono />
                  <Row label="Invested Capital (ROIC)" value={fundamentals?.roic ? `${fundamentals.roic}%` : "N/A"} mono />
                  <Row label="Gross Margin" value={fundamentals?.grossMargin ? `${fundamentals.grossMargin}%` : "N/A"} mono />
                  <Row label="Operating Margin" value={fundamentals?.operatingMargin ? `${fundamentals.operatingMargin}%` : "N/A"} mono />
                  <Row label="Net Profit Margin" value={fundamentals?.profitMargin ? `${fundamentals.profitMargin}%` : "N/A"} mono />
                  <Row label="Revenue Growth (YoY)" value={fundamentals?.revenueGrowth ? `${fundamentals.revenueGrowth}%` : "N/A"} mono />
                </div>
              </div>

              {/* Financial Health & Balance Sheet */}
              <div className="space-y-3">
                <SectionHeader icon={<ShieldCheck className="w-4 h-4" />} title="Financial Health & Capital Structure" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                  <Row label="Total Debt" value={fundamentals?.totalDebt ? formatCurrencyAmount(fundamentals.totalDebt, instrument.currency) : "N/A"} mono />
                  <Row label="Total Cash" value={fundamentals?.totalCash ? formatCurrencyAmount(fundamentals.totalCash, instrument.currency) : "N/A"} mono />
                  <Row label="Net Debt" value={fundamentals?.netDebt !== undefined && fundamentals?.netDebt !== null ? formatCurrencyAmount(fundamentals.netDebt, instrument.currency) : "N/A"} mono />
                  <Row label="Debt to Equity" value={fundamentals?.debtToEquity ? `${fundamentals.debtToEquity}` : "N/A"} mono />
                  <Row label="Current Ratio" value={fundamentals?.currentRatio ? `${fundamentals.currentRatio}` : "N/A"} mono />
                  <Row label="Quick Ratio" value={fundamentals?.quickRatio ? `${fundamentals.quickRatio}` : "N/A"} mono />
                </div>
              </div>

              {/* Cash Flow */}
              <div className="space-y-3">
                <SectionHeader icon={<DollarSign className="w-4 h-4" />} title="Cash Flow & Capital Expenditure" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                  <Row label="Operating Cash Flow" value={cashFlow?.operatingCashFlow ? formatCurrencyAmount(cashFlow.operatingCashFlow, instrument.currency) : "N/A"} mono />
                  <Row label="Free Cash Flow" value={cashFlow?.freeCashFlow ? formatCurrencyAmount(cashFlow.freeCashFlow, instrument.currency) : "N/A"} mono />
                  <Row label="Capital Expenditure (CapEx)" value={cashFlow?.capitalExpenditure ? formatCurrencyAmount(cashFlow.capitalExpenditure, instrument.currency) : "N/A"} mono />
                </div>
              </div>

              {/* Dividends */}
              <div className="space-y-3">
                <SectionHeader icon={<Percent className="w-4 h-4" />} title="Dividends & Distributions" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                  <Row label="Dividend Yield" value={dividends?.yield ? `${dividends.yield}%` : "N/A"} mono />
                  <Row label="Annual Dividend" value={dividends?.annualDividend ? `${curSym}${dividends.annualDividend}` : "N/A"} mono />
                  <Row label="Payout Ratio" value={dividends?.payoutRatio ? `${dividends.payoutRatio}%` : "N/A"} mono />
                  <Row label="Ex-Dividend Date" value={dividends?.exDividendDate ?? "N/A"} />
                </div>
              </div>

              {/* Earnings & Growth */}
              {(earnings?.quarterlyEarningsGrowth || earnings?.quarterlyRevenueGrowth || earnings?.recentQuarter) && (
                <div className="space-y-3">
                  <SectionHeader icon={<TrendingUp className="w-4 h-4" />} title="Quarterly Earnings & Growth" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                    <Row label="Quarterly Earnings Growth (YoY)" value={earnings?.quarterlyEarningsGrowth ? `${earnings.quarterlyEarningsGrowth}%` : "N/A"} mono />
                    <Row label="Quarterly Revenue Growth (YoY)" value={earnings?.quarterlyRevenueGrowth ? `${earnings.quarterlyRevenueGrowth}%` : "N/A"} mono />
                    <Row label="Recent Reported Quarter" value={earnings?.recentQuarter ?? "N/A"} />
                    <Row label="Reported EPS" value={earnings?.eps ? `${curSym}${earnings.eps}` : "N/A"} mono />
                  </div>
                </div>
              )}

              {/* Risk & Volatility Metrics */}
              <div className="space-y-3">
                <SectionHeader icon={<AlertTriangle className="w-4 h-4" />} title="Risk & Volatility Profile" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                  <Row label="Beta (Market Sensitivity)" value={risk?.beta ? `${risk.beta}` : "N/A"} mono />
                  <Row label="52-Week Price Change" value={risk?.fiftyTwoWeekChange ? `${risk.fiftyTwoWeekChange}%` : "N/A"} mono />
                  <Row label="Shares Short / Short Ratio" value={risk?.shortRatio ? `${risk.shortRatio} days` : "N/A"} mono />
                </div>
              </div>

              {/* Ownership & Profile */}
              <div className="space-y-3">
                <SectionHeader icon={<Building2 className="w-4 h-4" />} title="Ownership & Corporate Profile" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                  <Row label="Institutional Ownership" value={ownership?.institutionalOwnership ? `${ownership.institutionalOwnership}%` : "N/A"} mono />
                  <Row label="Insider Ownership" value={ownership?.insiderOwnership ? `${ownership.insiderOwnership}%` : "N/A"} mono />
                  <Row label="Shares Outstanding" value={ownership?.sharesOutstanding ? Number(ownership.sharesOutstanding).toLocaleString() : "N/A"} mono />
                  <Row label="Headquarters" value={profile?.headquarters ?? "N/A"} />
                  <Row label="Full-Time Employees" value={profile?.fullTimeEmployees ? Number(profile.fullTimeEmployees).toLocaleString() : "N/A"} mono />
                  <Row label="Website" value={profile?.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-teal-700 underline">{profile.website}</a> : "N/A"} />
                </div>
                {profile?.description && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1">Company Description:</span>
                    {profile.description}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ETF & FUND PROFILE */}
          {(activeTab === "fund_profile") && (
            <div className="space-y-6">
              <div className="space-y-3">
                <SectionHeader icon={<PieChart className="w-4 h-4" />} title={isMF ? "Mutual Fund Scheme Characteristics" : "ETF Fund Profile"} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                  <Row label="Latest NAV" value={quote?.price ? `${curSym}${Number(quote.price).toFixed(4)}` : "N/A"} mono />
                  <Row label="NAV Date" value={quote?.navDate || "Latest Published"} />
                  <Row label="Expense Ratio" value={instrument.expenseRatio ? `${instrument.expenseRatio}%` : (bundle?.etfData?.expenseRatio ? `${bundle.etfData.expenseRatio}%` : "N/A")} mono />
                  <Row label="AUM / Fund Size" value={bundle?.etfData?.aum ? formatCurrencyAmount(bundle.etfData.aum, instrument.currency) : (instrument.aum ? formatCurrencyAmount(instrument.aum, instrument.currency) : "N/A")} mono />
                  <Row label="Fund House / Issuer" value={instrument.fundHouse || bundle?.etfData?.issuer || "N/A"} />
                  <Row label="Category" value={instrument.category || bundle?.etfData?.category || "N/A"} />
                  <Row label="Benchmark" value={instrument.benchmark || "N/A"} />
                  <Row label="Inception Date" value={bundle?.etfData?.inceptionDate || "N/A"} />
                </div>
              </div>

              {/* Fund Performance Returns */}
              <div className="space-y-3">
                <SectionHeader icon={<TrendingUp className="w-4 h-4" />} title="Historical Scheme Performance" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCell label="YTD Return" value={bundle?.etfData?.ytdReturn ? `${bundle.etfData.ytdReturn}%` : "N/A"} />
                  <StatCell label="3-Year Return (CAGR)" value={bundle?.etfData?.threeYearReturn ? `${bundle.etfData.threeYearReturn}%` : "N/A"} />
                  <StatCell label="5-Year Return (CAGR)" value={bundle?.etfData?.fiveYearReturn ? `${bundle.etfData.fiveYearReturn}%` : "N/A"} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TECHNICAL INDICATORS */}
          {activeTab === "technicals" && (
            <div className="space-y-6">
              {/* Moving Averages */}
              <div className="space-y-3">
                <SectionHeader icon={<TrendingUp className="w-4 h-4" />} title="Moving Averages" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCell label="SMA 20" value={technicals?.movingAverages?.sma20 ? `${curSym}${technicals.movingAverages.sma20}` : "N/A"} />
                  <StatCell label="SMA 50" value={technicals?.movingAverages?.sma50 ? `${curSym}${technicals.movingAverages.sma50}` : "N/A"} />
                  <StatCell label="SMA 100" value={technicals?.movingAverages?.sma100 ? `${curSym}${technicals.movingAverages.sma100}` : "N/A"} />
                  <StatCell label="SMA 200" value={technicals?.movingAverages?.sma200 ? `${curSym}${technicals.movingAverages.sma200}` : "N/A"} />
                  <StatCell label="EMA 20" value={technicals?.movingAverages?.ema20 ? `${curSym}${technicals.movingAverages.ema20}` : "N/A"} />
                  <StatCell label="EMA 50" value={technicals?.movingAverages?.ema50 ? `${curSym}${technicals.movingAverages.ema50}` : "N/A"} />
                </div>
              </div>

              {/* Momentum & Volatility */}
              <div className="space-y-3">
                <SectionHeader icon={<BarChart3 className="w-4 h-4" />} title="Momentum & Volatility Oscillators" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                  <Row label="Relative Strength Index (RSI 14)" value={technicals?.rsi ? `${technicals.rsi} (${technicals.rsiCondition})` : "N/A"} mono />
                  <Row label="MACD Line" value={technicals?.macd?.macd ? `${technicals.macd.macd}` : "N/A"} mono />
                  <Row label="MACD Signal" value={technicals?.macd?.signal ? `${technicals.macd.signal}` : "N/A"} mono />
                  <Row label="MACD Histogram" value={technicals?.macd?.histogram ? `${technicals.macd.histogram} (${technicals.macd.trend})` : "N/A"} mono />
                  <Row label="Bollinger Upper" value={technicals?.bollingerBands?.upper ? `${curSym}${technicals.bollingerBands.upper}` : "N/A"} mono />
                  <Row label="Bollinger Lower" value={technicals?.bollingerBands?.lower ? `${curSym}${technicals.bollingerBands.lower}` : "N/A"} mono />
                  <Row label="Average True Range (ATR 14)" value={technicals?.atr ? `${curSym}${technicals.atr}` : "N/A"} mono />
                  <Row label="Annualized Volatility" value={technicals?.volatilityAnnualizedPct ? `${technicals.volatilityAnnualizedPct}%` : "N/A"} mono />
                  <Row label="Max Drawdown" value={technicals?.maxDrawdownPct ? `-${technicals.maxDrawdownPct}%` : "N/A"} mono />
                </div>
              </div>

              {/* Support & Resistance */}
              {technicals?.supportResistance && (
                <div className="space-y-3">
                  <SectionHeader icon={<Scale className="w-4 h-4" />} title="Pivot Points Support & Resistance" />
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900">
                      <span className="text-[10px] text-red-600 font-bold uppercase block">R2</span>
                      <strong className="text-xs">{curSym}{technicals.supportResistance.r2}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200 text-red-900">
                      <span className="text-[10px] text-red-600 font-bold uppercase block">R1</span>
                      <strong className="text-xs">{curSym}{technicals.supportResistance.r1}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-900">
                      <span className="text-[10px] text-slate-600 font-bold uppercase block">Pivot</span>
                      <strong className="text-xs">{curSym}{technicals.supportResistance.pivot}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                      <span className="text-[10px] text-emerald-600 font-bold uppercase block">S1</span>
                      <strong className="text-xs">{curSym}{technicals.supportResistance.s1}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <span className="text-[10px] text-emerald-600 font-bold uppercase block">S2</span>
                      <strong className="text-xs">{curSym}{technicals.supportResistance.s2}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ANALYST CONSENSUS & NEWS */}
          {activeTab === "analyst_news" && (
            <div className="space-y-6">
              {/* Analyst Consensus */}
              <div className="space-y-3">
                <SectionHeader icon={<ShieldCheck className="w-4 h-4" />} title="Wall Street / Market Analyst Consensus" />
                {analyst ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Analyst Rating</span>
                      <div className="text-xl font-extrabold text-slate-900 font-mono">
                        {analyst.consensus || "N/A"}
                      </div>
                      <span className="text-xs text-slate-500 block">
                        Based on <strong>{analyst.analystCount || "multiple"}</strong> analyst opinions
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Mean Price Target</span>
                      <div className="text-xl font-extrabold text-slate-900 font-mono">
                        {analyst.targetPrice ? `${curSym}${analyst.targetPrice}` : "N/A"}
                      </div>
                      {analyst.upsidePercent !== undefined && analyst.upsidePercent !== null && (
                        <span className={`text-xs font-bold font-mono ${analyst.upsidePercent >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {analyst.upsidePercent >= 0 ? "+" : ""}{analyst.upsidePercent}% Upside Target
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                    Analyst consensus targets are not published for this instrument.
                  </div>
                )}
              </div>

              {/* News Items */}
              <div className="space-y-3">
                <SectionHeader icon={<Building2 className="w-4 h-4" />} title="Recent Market & Company Disclosures" />
                {news && news.length > 0 ? (
                  <div className="space-y-2">
                    {news.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors">
                        <a
                          href={item.link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-slate-900 hover:text-teal-700 flex items-center justify-between gap-2"
                        >
                          <span>{item.title}</span>
                          {item.link && <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                        </a>
                        <div className="text-[10.5px] text-slate-500 flex items-center gap-2 mt-1">
                          {item.publisher && <span>{item.publisher}</span>}
                          {item.publishTime && <span>• {item.publishTime}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                    No recent news disclosures available for this instrument.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span>
              Provider: <strong className="text-slate-800 font-semibold">{quote?.source || (isMF ? "AMFI" : "Angel One SmartAPI")}</strong>
            </span>
            <span>
              Exchange: <strong className="text-slate-800 font-mono">{instrument.exchange}</strong>
            </span>
            {(quote?.displayTimestampIst || quote?.asOf || quote?.exchangeTimestamp || quote?.timestamp) && (
              <span>
                Timestamp: <strong className="text-slate-800 font-mono" title={quote?.exchangeTimestampUtc ? `UTC: ${quote.exchangeTimestampUtc}` : undefined}>
                  {quote.displayTimestampIst || (quote.exchangeTimestampUtc ? formatIstTimestamp(quote.exchangeTimestampUtc) : (quote.asOf || quote.exchangeTimestamp || quote.timestamp))}
                </strong>
              </span>
            )}
            <span>
              State: <strong className="text-slate-800 font-mono">{quote?.isLive ? "LIVE" : quote?.isStale ? "STALE" : "LATEST AVAILABLE"}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer transition-colors"
          >
            Close Terminal
          </button>
        </div>

      </div>
    </div>
  );
};