import React, { useState, useEffect, useCallback } from "react";
import {
  X, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  RefreshCw,
  Info, 
  Building2
} from "lucide-react";
import type { MarketInstrument, InstrumentResearchBundle } from "../../services/marketApi";
import { marketApi } from "../../services/marketApi";
import { UniversalInstrumentChart } from "./UniversalInstrumentChart";
import { useFintechStore } from "../../store/useFintechStore";

interface InstrumentDetailModalProps {
  instrument: MarketInstrument | null;
  isOpen: boolean;
  onClose: () => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (canonicalId: string) => void;
  onAskVestIQ?: (instrument: MarketInstrument) => void;
}

const StatCell: React.FC<{ label: string; value: string; sub?: string; positive?: boolean; negative?: boolean }> = ({ label, value, sub, positive, negative }) => (
  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] space-y-0.5">
    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{label}</span>
    <div className={`text-sm sm:text-base font-bold font-mono ${positive ? "text-[#0D9488] dark:text-[#00D4AA]" : negative ? "text-[#FF5252]" : "text-slate-900 dark:text-white"}`}>{value}</div>
    {sub && <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block truncate">{sub}</span>}
  </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; badge?: string; source?: string | null }> = ({ icon, title, badge, source }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 dark:border-white/[0.06]">
    <span className="text-[#0D9488] dark:text-[#00D4AA]">{icon}</span>
    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex-1">{title}</h3>
    {badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#00D4AA]/10 dark:text-[#00D4AA] dark:border-[#00D4AA]/30">{badge}</span>}
    {source && <span className="text-[10px] text-slate-400 dark:text-slate-500">via {source}</span>}
  </div>
);

const Row: React.FC<{ label: string; value: string | React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/[0.04] last:border-0">
    <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    <span className={`text-xs font-semibold text-slate-900 dark:text-white ${mono ? "font-mono" : ""}`}>{value}</span>
  </div>
);

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
  const curSym = instrument.currency === "USD" ? "$" : (instrument.currency === "TWD" ? "NT$" : "₹");
  const isMF = instrument.assetType === "MUTUAL_FUND";
  const isStock = instrument.assetType === "STOCK";

  const tabs: { key: string; label: string }[] = [
    { key: "overview", label: "Overview" },
    ...(bundle?.fundamentals || isStock ? [{ key: "fundamentals", label: "Fundamentals" }] : []),
    { key: "technicals", label: "Technicals" },
  ];

  const handleAskIQ = () => {
    if (onAskVestIQ) {
      onAskVestIQ(instrument);
    } else {
      setActiveView('ai');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/[0.1] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0B1120] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#0F172A] dark:border-white/[0.08] dark:text-[#00D4AA]">
                  {instrument.assetType.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">{instrument.exchange}</span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate max-w-md" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                {instrument.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>{instrument.symbol}</span>
                <span>•</span>
                <span className="text-[#0D9488] dark:text-[#00D4AA] font-bold">{instrument.currency}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleWatchlist && (
              <button 
                type="button" 
                onClick={() => onToggleWatchlist(instrument.canonicalId)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  isWatchlisted 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#00D4AA]/10 dark:border-[#00D4AA]/30 dark:text-[#00D4AA]' 
                    : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/[0.08] text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isWatchlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}
            <button 
              type="button" 
              onClick={onClose} 
              className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/[0.08] text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Top Live Quote Strip */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#0B1120]/60">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] col-span-2 sm:col-span-1 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{isMF ? 'Latest NAV' : 'Price'}</span>
                <div className="text-xl font-black text-slate-900 dark:text-white font-mono leading-tight">
                  {quote?.price != null ? (curSym + quote.price.toLocaleString('en-IN', {minimumFractionDigits:2,maximumFractionDigits:2})) : <span className="text-slate-400 text-xs">Loading…</span>}
                </div>
                {quote?.changePct != null && (
                  <div className={`flex items-center gap-1 text-xs font-mono font-bold ${isPositive ? 'text-[#0D9488] dark:text-[#00D4AA]' : 'text-[#FF5252]'}`}>
                    {isPositive ? '+' : ''}{quote.changePct.toFixed(2)}%
                  </div>
                )}
              </div>
              {!isMF && <>
                <StatCell label="Prev Close" value={quote?.prevClose != null ? curSym+quote.prevClose.toFixed(2) : 'n/a'} />
                <StatCell label="Day Range" value={quote?.high != null && quote?.low != null ? curSym+quote.low.toFixed(2)+' - '+curSym+quote.high.toFixed(2) : 'n/a'} />
                <StatCell label="Volume" value={quote?.volume != null ? (quote.volume >= 1e6 ? (quote.volume/1e6).toFixed(2)+'M' : (quote.volume/1e3).toFixed(1)+'K') : 'n/a'} />
              </>}
              {isMF && <>
                <StatCell label="Prev NAV" value={quote?.prevClose != null ? curSym+quote.prevClose.toFixed(4) : 'n/a'} />
                <StatCell label="NAV Date" value={quote?.navDate ?? quote?.asOf ?? 'n/a'} />
                <StatCell label="Source" value={quote?.source ? quote.source.split(' ')[0] : 'AMFI'} />
              </>}
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${quote?.freshness === 'REALTIME' ? 'bg-[#00D4AA] animate-pulse' : 'bg-slate-400'}`} />
              <span className="uppercase text-[10px] font-semibold">{quote?.freshness ?? 'n/a'}</span>
              <span>•</span>
              <span>Provider: {quote?.source ?? instrument.provider}</span>
              {isLoadingResearch && <><RefreshCw className="w-3 h-3 animate-spin text-[#00D4AA] ml-1" /><span className="text-[#0D9488] dark:text-[#00D4AA] text-[10px] font-semibold">Loading research…</span></>}
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-white/[0.06]">
            <UniversalInstrumentChart symbol={instrument.symbol} assetType={instrument.assetType} currency={curSym} defaultPeriod="1Y" />
          </div>

          {/* Tabs */}
          {tabs.length > 1 && (
            <div className="px-6 pt-3.5 pb-2 border-b border-slate-100 dark:border-white/[0.06] flex items-center gap-2 overflow-x-auto shrink-0 bg-slate-50 dark:bg-[#0B1120]">
              {tabs.map(t => (
                <button 
                  key={t.key} 
                  type="button" 
                  onClick={() => setActiveTab(t.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    activeTab === t.key 
                      ? 'bg-[#00D4AA] text-[#060811] font-bold shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          <div className="px-6 py-5 space-y-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <SectionHeader icon={<Info className="w-3.5 h-3.5" />} title="Instrument Specifications" />
                  <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-4 space-y-1">
                    <Row label="Symbol" value={instrument.symbol} mono />
                    <Row label="Asset Class" value={instrument.assetClass} />
                    <Row label="Exchange" value={instrument.exchange} />
                    {instrument.sector    && <Row label="Sector"    value={instrument.sector} />}
                    {instrument.industry  && <Row label="Industry"  value={instrument.industry} />}
                    {instrument.fundHouse && <Row label="AMC / Issuer" value={instrument.fundHouse} />}
                    {instrument.category  && <Row label="Category"  value={instrument.category} />}
                    <Row label="Provider Feed" value={instrument.provider} />
                  </div>
                </div>

                {instrument.name && (
                  <div className="space-y-2">
                    <SectionHeader icon={<Building2 className="w-3.5 h-3.5" />} title="About Company / Issuer" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-4">
                      {instrument.name} ({instrument.symbol}) listed on {instrument.exchange} in {instrument.country || 'Global'} market.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0B1120] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleAskIQ}
            className="px-4 py-2.5 rounded-xl bg-[#00D4AA] text-[#060811] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[#00D4AA]/25 hover:bg-[#00BFA5] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult VestIQ on {instrument.symbol}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};