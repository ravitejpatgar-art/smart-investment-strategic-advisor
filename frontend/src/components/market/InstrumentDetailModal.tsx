import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Sparkles,
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
  Scale
} from "lucide-react";
import type { MarketInstrument, InstrumentResearchBundle, MarketResearchSignal } from "../../services/marketApi";
import { marketApi } from "../../services/marketApi";
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
  const { setActiveView } = useFintechStore();
  const [bundle, setBundle] = useState<InstrumentResearchBundle | null>(null);
  const [isLoadingResearch, setIsLoadingResearch] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const loadResearch = useCallback(async (inst: MarketInstrument) => {
    setIsLoadingResearch(true);
    try {
      const data = await marketApi.getResearch(inst.symbol);
      setBundle(data);
    } catch {
      // Non-blocking
    } finally {
      setIsLoadingResearch(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && instrument) {
      setBundle(null);
      setActiveTab("overview");
      loadResearch(instrument);
    }
  }, [isOpen, instrument, loadResearch]);

  if (!isOpen || !instrument) return null;

  const quote = instrument.quote ?? bundle?.quote;
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

  const tabs: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview & Chart", icon: <Info className="w-3.5 h-3.5" /> },
    { key: "signal", label: "Research Signal", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
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
    const s = (freshness || status || "UNAVAILABLE").toUpperCase();
    if (s === "REALTIME" || s === "LIVE") {
      return <Badge variant="live">LIVE</Badge>;
    }
    if (s === "DELAYED") {
      return <Badge variant="delayed">DELAYED (15M)</Badge>;
    }
    if (s === "LATEST_NAV" || isMF) {
      return <Badge variant="fallback">LATEST NAV ({quote?.navDate || "OFFICIAL"})</Badge>;
    }
    if (s === "LATEST_AVAILABLE" || s === "HISTORICAL" || s === "FALLBACK") {
      return <Badge variant="fallback">LATEST AVAILABLE</Badge>;
    }
    if (s === "STALE") {
      return <Badge variant="stale">STALE</Badge>;
    }
    return <Badge variant="unavailable">UNAVAILABLE</Badge>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">{instrument.name}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {instrument.symbol}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 uppercase">
                {instrument.assetType}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {instrument.exchange}
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
                  <span>Loading deep research...</span>
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
              <Sparkles className="w-3.5 h-3.5" />
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

        {/* Live Quote Banner */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-baseline gap-3">
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
            {isMF && quote?.navDate && (
              <span className="text-xs text-slate-500 font-sans">
                As of NAV Date: <strong>{quote.navDate}</strong>
              </span>
            )}
          </div>

          {/* Quick Signal Pill */}
          {researchSignal && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Research Signal:</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider ${
                researchSignal.signal === "BUY"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : researchSignal.signal === "SELL"
                  ? "bg-red-100 text-red-800 border border-red-300"
                  : researchSignal.signal === "HOLD"
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}>
                {researchSignal.signal}
              </span>
            </div>
          )}
        </div>

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
                <StatCell label="Volume" value={quote?.volume ? Number(quote.volume).toLocaleString() : "N/A"} />
                <StatCell label="Market Cap" value={valuation?.marketCap ? formatCurrencyAmount(valuation.marketCap, instrument.currency) : "N/A"} />
              </div>

              {/* Research Signal Summary Card */}
              {researchSignal && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-700" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Market Research Signal</h4>
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
                    {researchSignal.disclaimer}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MARKET RESEARCH SIGNAL DETAIL */}
          {activeTab === "signal" && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Model Decision</span>
                    <div className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5 flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-xl text-base sm:text-lg font-bold font-mono uppercase tracking-wider ${
                        researchSignal?.signal === "BUY" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                        researchSignal?.signal === "SELL" ? "bg-red-100 text-red-800 border border-red-300" :
                        researchSignal?.signal === "HOLD" ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-slate-200 text-slate-800 border border-slate-300"
                      }`}>
                        {researchSignal?.signal ?? "INSUFFICIENT DATA"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Data Coverage</span>
                    <div className="text-lg font-bold font-mono text-slate-900">
                      {researchSignal?.coveragePct ?? 0}%
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#00D4AA] h-2 rounded-full transition-all"
                    style={{ width: `${researchSignal?.coveragePct ?? 0}%` }}
                  />
                </div>

                {/* Key Reasons */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Evaluated Market Factors & Rationale</h4>
                  <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800">
                    {researchSignal?.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-teal-600 font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Methodology */}
                <div className="space-y-1 text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">Methodology Summary</span>
                  <p className="leading-relaxed text-slate-600">
                    {researchSignal?.methodology ?? "Multi-factor quantitative model evaluating trend alignment (SMA 20/50/200), momentum (RSI/MACD), valuation multiples (P/E, PEG), and capital profitability (ROE)."}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-500 flex justify-between items-center">
                    <span>Generated: {researchSignal?.dataTimestamp || "Live"}</span>
                    <span>Freshness: <strong className="uppercase">{bundle?.sources?.freshness || "LATEST_AVAILABLE"}</strong></span>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {researchSignal?.disclaimer || "Market research signals are quantitative model outputs based on historical and published data. They do not constitute personalized investment advice or guaranteed return forecasts."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STOCK FUNDAMENTALS */}
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

          {/* TAB 4: ETF & FUND PROFILE */}
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

          {/* TAB 5: TECHNICAL INDICATORS */}
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

          {/* TAB 6: ANALYST CONSENSUS & NEWS */}
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
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Provider: <strong className="text-slate-800 font-semibold">{bundle?.sources?.research || "SmartVest Institutional Feed"}</strong>
          </span>
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