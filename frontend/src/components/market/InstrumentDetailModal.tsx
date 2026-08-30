import React, { useState, useEffect, useCallback } from "react";
import {
  X, Sparkles, Bookmark, BookmarkCheck, ShieldCheck, RefreshCw,
  TrendingUp, BarChart2, DollarSign, Info, AlertCircle, Building2, Globe
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
  <div className="p-3.5 rounded-xl bg-[#F8F9FC] border border-[#E7E9F0] space-y-0.5">
    <span className="text-[10.5px] text-[#667085] font-semibold uppercase tracking-wider block">{label}</span>
    <div className={`text-[15px] sm:text-[16px] font-bold font-mono ${positive ? "text-emerald-700" : negative ? "text-rose-700" : "text-[#172033]"}`}>{value}</div>
    {sub && <span className="text-[11px] text-[#667085] block truncate">{sub}</span>}
  </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; badge?: string; source?: string | null }> = ({ icon, title, badge, source }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-[#E7E9F0]">
    <span className="text-teal-600">{icon}</span>
    <h3 className="text-[13px] font-bold text-[#172033] uppercase tracking-wider flex-1">{title}</h3>
    {badge && <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">{badge}</span>}
    {source && <span className="text-[10.5px] text-[#94A3B8]">via {source}</span>}
  </div>
);

const Row: React.FC<{ label: string; value: string | React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9] last:border-0">
    <span className="text-[12px] text-[#667085]">{label}</span>
    <span className={`text-[12.5px] font-semibold text-[#172033] ${mono ? "font-mono" : ""}`}>{value}</span>
  </div>
);

const UnavailableNotice: React.FC<{ msg?: string }> = ({ msg }) => (
  <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-[#667085]">
    <Info className="w-4 h-4 text-slate-400 shrink-0" />
    <span>{msg ?? "Not available from current provider."}</span>
  </div>
);
// ── Technical Indicators ──────────────────────────────────────────────────────
function calcRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 2) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i-1];
    if (d >= 0) gains += d; else losses -= d;
  }
  let avgG = gains / period, avgL = losses / period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i-1];
    avgG = (avgG * (period - 1) + Math.max(0, d)) / period;
    avgL = (avgL * (period - 1) + Math.max(0, -d)) / period;
  }
  if (avgL === 0) return 100;
  return 100 - 100 / (1 + avgG / avgL);
}
function calcSMA(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  return closes.slice(-period).reduce((a, b) => a + b, 0) / period;
}
function calcEMA(closes: number[], period: number): number[] {
  if (!closes.length) return [];
  const k = 2 / (period + 1);
  const emas: number[] = [closes[0]];
  for (let i = 1; i < closes.length; i++) emas.push(closes[i] * k + emas[i-1] * (1 - k));
  return emas;
}
function calcMACD(closes: number[]): { macd: number; signal: number; histogram: number } | null {
  if (closes.length < 35) return null;
  const ema12 = calcEMA(closes, 12), ema26 = calcEMA(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const sig = calcEMA(macdLine, 9);
  const last = macdLine.length - 1;
  return { macd: macdLine[last], signal: sig[last], histogram: macdLine[last] - sig[last] };
}
function calcVolatility(closes: number[]): number | null {
  if (closes.length < 20) return null;
  const rets = closes.slice(1).map((v, i) => Math.log(v / closes[i]));
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rets.length;
  return Math.sqrt(variance * 252) * 100;
}
function calcMaxDrawdown(closes: number[]): number | null {
  if (closes.length < 2) return null;
  let peak = closes[0], maxDD = 0;
  for (const c of closes) {
    if (c > peak) peak = c;
    const dd = ((peak - c) / peak) * 100;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

// ============================================================
// Main Component
// ============================================================
export const InstrumentDetailModal: React.FC<InstrumentDetailModalProps> = ({
  instrument, isOpen, onClose, isWatchlisted = false, onToggleWatchlist, onAskVestIQ,
}) => {
  const { user } = useFintechStore();
  const [bundle, setBundle] = useState<InstrumentResearchBundle | null>(null);
  const [isLoadingResearch, setIsLoadingResearch] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [evalResult, setEvalResult] = useState<{ score: number; verdict: string; riskFit: string; rationale: string } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  type TabKey = "overview" | "fundamentals" | "valuation" | "risk" | "dividends" | "fund";
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [technicals, setTechnicals] = useState<{
    rsi: number | null; sma50: number | null; sma200: number | null;
    macd: { macd: number; signal: number; histogram: number } | null;
    volatility: number | null; maxDrawdown: number | null; currentPrice: number | null;
  } | null>(null);

  useEffect(() => {
    if (!instrument || !isOpen) return;
    setBundle(null); setResearchError(null); setTechnicals(null); setEvalResult(null); setActiveTab("overview");
    setIsLoadingResearch(true);
    marketApi.getResearch(instrument.canonicalId || instrument.symbol)
      .then(data => { setBundle(data); setResearchError(null); })
      .catch(() => { setResearchError("Research data temporarily unavailable."); })
      .finally(() => setIsLoadingResearch(false));
  }, [instrument?.canonicalId, instrument?.symbol, isOpen]);

  useEffect(() => {
    if (!instrument || !isOpen) return;
    marketApi.getCandles(instrument.symbol, "1y", "1d")
      .then(data => {
        if (!data.observations?.length || data.observations.length < 20) return;
        const closes = data.observations.map(o => o.close).filter(c => c > 0);
        if (closes.length < 20) return;
        setTechnicals({
          rsi: calcRSI(closes), sma50: calcSMA(closes, 50), sma200: calcSMA(closes, 200),
          macd: calcMACD(closes), volatility: calcVolatility(closes),
          maxDrawdown: calcMaxDrawdown(closes), currentPrice: closes[closes.length - 1],
        });
      }).catch(() => {});
  }, [instrument?.symbol, isOpen]);

  const handleEvaluate = useCallback(() => {
    if (!instrument || !user) return;
    setIsEvaluating(true);
    setTimeout(() => {
      const uR = user.riskTolerance || "Moderate", iR = instrument.riskLevel || "Moderate";
      let score = 78;
      if (uR === "Conservative" && iR === "High") score = 42;
      else if (uR === "Aggressive" && iR === "Low") score = 62;
      else if (uR === iR) score = 91;
      const verdict = score >= 80 ? "Recommended Fit" : score >= 60 ? "Selective Allocation" : "Sub-Optimal Fit";
      const rationale = `${instrument.name} (${instrument.symbol}) carries a ${iR} risk profile. Against your ${uR} mandate and ${user.investmentHorizon || "long-term"} horizon, this ${instrument.assetType.replace("_"," ").toLowerCase()} ${score >= 75 ? "aligns well with" : "may not fully match"} your investment objectives.`;
      setEvalResult({ score, verdict, riskFit: `${iR} Risk vs. ${uR} Mandate`, rationale });
      setIsEvaluating(false);
    }, 700);
  }, [instrument, user]);

  if (!isOpen || !instrument) return null;

  const quote = bundle?.quote ?? instrument.quote;
  const capabilities = bundle?.capabilities;
  const isMF = instrument.assetType === "MUTUAL_FUND";
  const isIndex = instrument.assetType === "INDEX";
  const isETF = instrument.assetType === "ETF";
  const curSym = (instrument.currency === "USD" || quote?.currency === "USD") ? "$" : "₹";
  const isPositive = (quote?.changePct ?? 0) >= 0;

  const tabs: { key: TabKey; label: string }[] = [{ key: "overview", label: "Overview" }];
  if (capabilities?.hasFundamentals) tabs.push({ key: "fundamentals", label: "Fundamentals" });
  if (capabilities?.hasValuation) tabs.push({ key: "valuation", label: "Valuation" });
  if (technicals?.rsi !== null && !isMF && !isIndex) tabs.push({ key: "risk", label: "Risk & Technicals" });
  else if (capabilities?.hasRisk) tabs.push({ key: "risk", label: "Risk" });
  if (capabilities?.hasDividends) tabs.push({ key: "dividends", label: "Dividends" });
  if (capabilities?.hasETFData || capabilities?.hasMFData) tabs.push({ key: "fund", label: isMF ? "Fund Details" : "ETF Details" });

  return (
    <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm'
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className='bg-white w-full sm:max-w-4xl max-h-[96vh] sm:max-h-[92vh] sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl border border-[#E7E9F0] overflow-hidden'>

        <div className='px-5 py-4 border-b border-[#E7E9F0] bg-[#F8F9FC] flex items-start justify-between gap-3 shrink-0'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-black text-[15px] shrink-0'>
              {instrument.symbol.slice(0,2).toUpperCase()}
            </div>
            <div className='min-w-0'>
              <h2 className='text-[17px] sm:text-[19px] font-bold text-[#172033] tracking-tight'>{instrument.name}</h2>
              <div className='flex items-center gap-1.5 text-[11.5px] text-[#667085] font-mono mt-0.5 flex-wrap'>
                <span className='font-bold text-[#344054]'>{instrument.symbol}</span>
                <span>·</span><span>{instrument.exchange}</span>
                {instrument.country && <><span>·</span><Globe className='w-3 h-3' /><span>{instrument.country}</span></>}
                <span>·</span><span className='text-teal-700'>{instrument.currency}</span>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            {onToggleWatchlist && (
              <button type='button' onClick={() => onToggleWatchlist(instrument.canonicalId)}
                className={'p-2 rounded-lg border cursor-pointer ' + (isWatchlisted ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-[#E7E9F0] text-[#667085]')}>
                {isWatchlisted ? <BookmarkCheck className='w-5 h-5' /> : <Bookmark className='w-5 h-5' />}
              </button>
            )}
            <button type='button' onClick={onClose} className='p-2 rounded-lg hover:bg-slate-100 text-[#667085] cursor-pointer'><X className='w-5 h-5' /></button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto'>
          <div className='px-5 py-4 border-b border-[#E7E9F0] bg-white'>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              <div className='p-3.5 rounded-xl bg-[#F8F9FC] border border-[#E7E9F0] col-span-2 sm:col-span-1 space-y-0.5'>
                <span className='text-[10.5px] text-[#667085] font-semibold uppercase tracking-wider block'>{isMF ? 'Latest NAV' : 'Price'}</span>
                <div className='text-[22px] font-black text-[#172033] font-mono leading-tight'>
                  {quote?.price != null ? (curSym + quote.price.toLocaleString('en-IN', {minimumFractionDigits:2,maximumFractionDigits:2})) : <span className='text-slate-400 text-[15px]'>Loading…</span>}
                </div>
                {quote?.changePct != null && (
                  <div className={'flex items-center gap-1 text-[12.5px] font-mono font-bold ' + (isPositive ? 'text-emerald-600' : 'text-rose-600')}>
                    {isPositive ? '+' : ''}{quote.changePct.toFixed(2)}%
                  </div>
                )}
              </div>
              {!isMF && <>
                <StatCell label='Prev Close' value={quote?.prevClose != null ? curSym+quote.prevClose.toFixed(2) : 'n/a'} />
                <StatCell label='Day Range' value={quote?.high != null && quote?.low != null ? curSym+quote.low.toFixed(2)+' - '+curSym+quote.high.toFixed(2) : 'n/a'} />
                <StatCell label='Volume' value={quote?.volume != null ? (quote.volume >= 1e6 ? (quote.volume/1e6).toFixed(2)+'M' : (quote.volume/1e3).toFixed(1)+'K') : 'n/a'} />
              </>}
              {isMF && <>
                <StatCell label='Prev NAV' value={quote?.prevClose != null ? curSym+quote.prevClose.toFixed(4) : 'n/a'} />
                <StatCell label='NAV Date' value={quote?.navDate ?? quote?.asOf ?? 'n/a'} />
                <StatCell label='Source' value={quote?.source ? quote.source.split(' ')[0] : 'AMFI'} />
              </>}
            </div>
            {bundle?.risk && !isMF && (
              <div className='mt-2.5 flex flex-wrap gap-3 text-[12px] text-[#667085]'>
                {bundle.risk.fiftyTwoWeekHigh != null && <span>52W H: <strong className='text-[#172033] font-mono'>{curSym}{bundle.risk.fiftyTwoWeekHigh.toFixed(2)}</strong></span>}
                {bundle.risk.fiftyTwoWeekLow  != null && <span>52W L: <strong className='text-[#172033] font-mono'>{curSym}{bundle.risk.fiftyTwoWeekLow.toFixed(2)}</strong></span>}
                {bundle.risk.beta             != null && <span>Beta: <strong className='text-[#172033] font-mono'>{bundle.risk.beta.toFixed(2)}</strong></span>}
              </div>
            )}
            <div className='mt-2 flex items-center gap-1.5 text-[11px] text-[#94A3B8]'>
              <span className={'w-1.5 h-1.5 rounded-full ' + (quote?.freshness === 'REALTIME' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
              <span className='uppercase text-[10.5px]'>{quote?.freshness ?? 'n/a'}</span>
              <span>·</span><span>Source: {quote?.source ?? instrument.provider}</span>
              {isLoadingResearch && <><RefreshCw className='w-3 h-3 animate-spin text-teal-500 ml-1' /><span className='text-teal-600 text-[10.5px]'>Loading research…</span></>}
            </div>
          </div>

          <div className='px-5 py-4 border-b border-[#E7E9F0]'>
            <UniversalInstrumentChart symbol={instrument.symbol} assetType={instrument.assetType} currency={curSym} defaultPeriod='1Y' />
          </div>

          {tabs.length > 1 && (
            <div className='px-5 pt-3 pb-2 border-b border-[#E7E9F0] flex items-center gap-1 overflow-x-auto shrink-0'>
              {tabs.map(t => (
                <button key={t.key} type='button' onClick={() => setActiveTab(t.key)}
                  className={'px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold whitespace-nowrap cursor-pointer ' + (activeTab === t.key ? 'bg-teal-600 text-white' : 'text-[#667085] hover:bg-slate-100')}>
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <div className='px-5 py-4 space-y-5'>
            {activeTab === 'overview' && (
              <div className='space-y-5'>
                <div className='space-y-2'>
                  <SectionHeader icon={<Info className='w-4 h-4' />} title='Instrument Specifications' />
                  <div className='bg-[#F8F9FC] border border-[#E7E9F0] rounded-xl p-4'>
                    <Row label='Symbol' value={instrument.symbol} mono />
                    <Row label='Asset Class' value={instrument.assetClass} />
                    <Row label='Exchange' value={instrument.exchange} />
                    {instrument.sector    && <Row label='Sector'    value={instrument.sector} />}
                    {instrument.industry  && <Row label='Industry'  value={instrument.industry} />}
                    {instrument.fundHouse && <Row label='Fund AMC'  value={instrument.fundHouse} />}
                    {instrument.benchmark && <Row label='Benchmark' value={instrument.benchmark} />}
                    <Row label='Currency' value={instrument.currency} mono />
                    <Row label='Provider' value={instrument.provider} />
                    {bundle?.sources?.research && <Row label='Research Source' value={bundle.sources.research} />}
                    {bundle?.sources?.freshness && bundle.sources.freshness !== 'UNAVAILABLE' && <Row label='Freshness' value={bundle.sources.freshness} />}
                  </div>
                </div>

                {isETF && bundle?.etfData && (
                  <div className='space-y-2'>
                    <SectionHeader icon={<BarChart2 className='w-4 h-4' />} title='ETF Overview' />
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
                      {bundle.etfData.issuer        && <StatCell label='Issuer'   value={bundle.etfData.issuer} />}
                      {bundle.etfData.category      && <StatCell label='Category' value={bundle.etfData.category} />}
                      {bundle.etfData.expenseRatio != null && <StatCell label='Expense Ratio' value={bundle.etfData.expenseRatio.toFixed(2)+'%'} />}
                      {bundle.etfData.aum          != null && <StatCell label='AUM' value={bundle.etfData.aum >= 1e9 ? curSym+(bundle.etfData.aum/1e9).toFixed(2)+'B' : curSym+(bundle.etfData.aum/1e6).toFixed(2)+'M'} />}
                      {bundle.etfData.nav          != null && <StatCell label='NAV' value={curSym+bundle.etfData.nav.toFixed(2)} />}
                      {bundle.etfData.inceptionDate && <StatCell label='Inception' value={bundle.etfData.inceptionDate} />}
                    </div>
                  </div>
                )}

                {isMF && bundle?.mfData && (
                  <div className='space-y-2'>
                    <SectionHeader icon={<Building2 className='w-4 h-4' />} title='Fund Overview' />
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
                      {bundle.mfData.issuer        && <StatCell label='Fund House' value={bundle.mfData.issuer} />}
                      {bundle.mfData.category      && <StatCell label='Category'   value={bundle.mfData.category} />}
                      {bundle.mfData.expenseRatio != null && <StatCell label='Expense Ratio' value={bundle.mfData.expenseRatio.toFixed(2)+'%'} />}
                      {bundle.mfData.aum          != null && <StatCell label='AUM' value={bundle.mfData.aum >= 1e9 ? curSym+(bundle.mfData.aum/1e9).toFixed(2)+'B' : curSym+(bundle.mfData.aum/1e6).toFixed(2)+'M'} />}
                      {bundle.mfData.inceptionDate && <StatCell label='Inception' value={bundle.mfData.inceptionDate} />}
                    </div>
                    {(bundle.mfData.ytdReturn != null || bundle.mfData.threeYearReturn != null || bundle.mfData.fiveYearReturn != null) && (
                      <div className='grid grid-cols-3 gap-2.5 mt-2'>
                        {bundle.mfData.ytdReturn       != null && <StatCell label='YTD'    value={bundle.mfData.ytdReturn.toFixed(1)+'%'}       positive={bundle.mfData.ytdReturn>=0}       negative={bundle.mfData.ytdReturn<0} />}
                        {bundle.mfData.threeYearReturn != null && <StatCell label='3Y Avg' value={bundle.mfData.threeYearReturn.toFixed(1)+'%'} positive={bundle.mfData.threeYearReturn>=0} negative={bundle.mfData.threeYearReturn<0} />}
                        {bundle.mfData.fiveYearReturn  != null && <StatCell label='5Y Avg' value={bundle.mfData.fiveYearReturn.toFixed(1)+'%'}  positive={bundle.mfData.fiveYearReturn>=0}  negative={bundle.mfData.fiveYearReturn<0} />}
                      </div>
                    )}
                  </div>
                )}

                <div className='space-y-2'>
                  <SectionHeader icon={<ShieldCheck className='w-4 h-4' />} title='Profile Suitability' />
                  {!evalResult ? (
                    <div className='bg-[#F8F9FC] border border-[#E7E9F0] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3'>
                      <ShieldCheck className='w-6 h-6 text-teal-600 shrink-0' />
                      <p className='text-[12.5px] text-[#667085] flex-1'>Check risk compatibility and strategic fit against your investor profile.</p>
                      <button type='button' onClick={handleEvaluate} disabled={isEvaluating}
                        className='px-4 py-1.5 rounded-lg bg-teal-600 text-white font-semibold text-[12.5px] hover:bg-teal-700 cursor-pointer shrink-0'>
                        {isEvaluating ? 'Evaluating…' : 'Evaluate Fit'}
                      </button>
                    </div>
                  ) : (
                    <div className='bg-teal-50/70 border border-teal-300 rounded-xl p-4 space-y-2'>
                      <div className='flex items-center justify-between pb-2 border-b border-teal-200'>
                        <div><span className='text-[10.5px] font-bold uppercase text-teal-800 block'>Fit Assessment</span><div className='text-[16px] font-bold text-[#172033]'>{evalResult.verdict}</div></div>
                        <div className='text-right'><span className='text-[10.5px] font-bold text-teal-800 uppercase block'>Score</span><div className='text-[20px] font-black text-teal-700 font-mono'>{evalResult.score}/100</div></div>
                      </div>
                      <p className='text-[12.5px] text-[#344054] leading-relaxed'>{evalResult.rationale}</p>
                    </div>
                  )}
                </div>

                {researchError && (
                  <div className='flex items-center gap-2 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-[#667085]'>
                    <AlertCircle className='w-4 h-4 text-slate-400 shrink-0' />
                    <span>{researchError}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'fundamentals' && (
              <div className='space-y-4'>
                <SectionHeader icon={<BarChart2 className='w-4 h-4' />} title='Financial Fundamentals' source={bundle?.sources?.research} />
                {bundle?.fundamentals ? (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 bg-[#F8F9FC] border border-[#E7E9F0] rounded-xl p-4'>
                    <div>
                      {bundle.fundamentals.revenue        != null && <Row label='Revenue' value={curSym+(bundle.fundamentals.revenue>=1e9?(bundle.fundamentals.revenue/1e9).toFixed(2)+'B':(bundle.fundamentals.revenue/1e6).toFixed(2)+'M')} />}
                      {bundle.fundamentals.revenueGrowth  != null && <Row label='Revenue Growth' value={bundle.fundamentals.revenueGrowth.toFixed(1)+'%'} />}
                      {bundle.fundamentals.grossProfit    != null && <Row label='Gross Profit' value={curSym+(bundle.fundamentals.grossProfit/1e9).toFixed(2)+'B'} />}
                      {bundle.fundamentals.ebitda         != null && <Row label='EBITDA' value={curSym+(bundle.fundamentals.ebitda/1e9).toFixed(2)+'B'} />}
                      {bundle.fundamentals.netIncome      != null && <Row label='Net Income' value={curSym+(bundle.fundamentals.netIncome>=1e9?(bundle.fundamentals.netIncome/1e9).toFixed(2)+'B':(bundle.fundamentals.netIncome/1e6).toFixed(2)+'M')} />}
                      {bundle.fundamentals.eps            != null && <Row label='EPS (TTM)' value={curSym+bundle.fundamentals.eps.toFixed(2)} mono />}
                      {bundle.fundamentals.forwardEPS     != null && <Row label='Forward EPS' value={curSym+bundle.fundamentals.forwardEPS.toFixed(2)} mono />}
                      {bundle.fundamentals.freeCashFlow   != null && <Row label='Free Cash Flow' value={curSym+(bundle.fundamentals.freeCashFlow/1e9).toFixed(2)+'B'} />}
                    </div>
                    <div>
                      {bundle.fundamentals.profitMargin    != null && <Row label='Profit Margin'    value={bundle.fundamentals.profitMargin.toFixed(1)+'%'} />}
                      {bundle.fundamentals.operatingMargin != null && <Row label='Operating Margin' value={bundle.fundamentals.operatingMargin.toFixed(1)+'%'} />}
                      {bundle.fundamentals.grossMargin     != null && <Row label='Gross Margin'     value={bundle.fundamentals.grossMargin.toFixed(1)+'%'} />}
                      {bundle.fundamentals.roe             != null && <Row label='ROE'              value={bundle.fundamentals.roe.toFixed(1)+'%'} />}
                      {bundle.fundamentals.roa             != null && <Row label='ROA'              value={bundle.fundamentals.roa.toFixed(1)+'%'} />}
                      {bundle.fundamentals.debtToEquity    != null && <Row label='Debt/Equity' value={bundle.fundamentals.debtToEquity.toFixed(2)+'x'} mono />}
                      {bundle.fundamentals.currentRatio    != null && <Row label='Current Ratio' value={bundle.fundamentals.currentRatio.toFixed(2)+'x'} mono />}
                      {bundle.fundamentals.bookValuePerShare != null && <Row label='Book Value/Share' value={curSym+bundle.fundamentals.bookValuePerShare.toFixed(2)} mono />}
                    </div>
                  </div>
                ) : <UnavailableNotice />}
              </div>
            )}

            {activeTab === 'valuation' && (
              <div className='space-y-4'>
                <SectionHeader icon={<DollarSign className='w-4 h-4' />} title='Valuation Metrics' source={bundle?.sources?.research} />
                {bundle?.valuation ? (
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
                    {bundle.valuation.peRatio         != null && <StatCell label='P/E (TTM)'    value={bundle.valuation.peRatio.toFixed(2)+'x'} />}
                    {bundle.valuation.forwardPE       != null && <StatCell label='Forward P/E'  value={bundle.valuation.forwardPE.toFixed(2)+'x'} />}
                    {bundle.valuation.pbRatio         != null && <StatCell label='Price/Book'   value={bundle.valuation.pbRatio.toFixed(2)+'x'} />}
                    {bundle.valuation.psRatio         != null && <StatCell label='Price/Sales'  value={bundle.valuation.psRatio.toFixed(2)+'x'} />}
                    {bundle.valuation.evEbitda        != null && <StatCell label='EV/EBITDA'    value={bundle.valuation.evEbitda.toFixed(2)+'x'} />}
                    {bundle.valuation.peg             != null && <StatCell label='PEG Ratio'    value={bundle.valuation.peg.toFixed(2)+'x'} />}
                    {bundle.valuation.marketCap       != null && <StatCell label='Market Cap'   value={bundle.valuation.marketCap>=1e12?curSym+(bundle.valuation.marketCap/1e12).toFixed(2)+'T':bundle.valuation.marketCap>=1e9?curSym+(bundle.valuation.marketCap/1e9).toFixed(2)+'B':curSym+(bundle.valuation.marketCap/1e6).toFixed(2)+'M'} />}
                    {bundle.valuation.enterpriseValue != null && <StatCell label='Ent. Value'   value={bundle.valuation.enterpriseValue>=1e12?curSym+(bundle.valuation.enterpriseValue/1e12).toFixed(2)+'T':bundle.valuation.enterpriseValue>=1e9?curSym+(bundle.valuation.enterpriseValue/1e9).toFixed(2)+'B':curSym+(bundle.valuation.enterpriseValue/1e6).toFixed(2)+'M'} />}
                  </div>
                ) : <UnavailableNotice />}
              </div>
            )}

            {activeTab === 'risk' && (
              <div className='space-y-5'>
                {bundle?.risk && (
                  <div className='space-y-2'>
                    <SectionHeader icon={<TrendingUp className='w-4 h-4' />} title='Risk Metrics' source={bundle.sources?.research} />
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
                      {bundle.risk.beta             != null && <StatCell label='Beta'          value={bundle.risk.beta.toFixed(2)} sub='vs. Market' />}
                      {bundle.risk.fiftyTwoWeekHigh != null && <StatCell label='52W High'      value={curSym+bundle.risk.fiftyTwoWeekHigh.toFixed(2)} />}
                      {bundle.risk.fiftyTwoWeekLow  != null && <StatCell label='52W Low'       value={curSym+bundle.risk.fiftyTwoWeekLow.toFixed(2)} />}
                      {bundle.risk.averageVolume    != null && <StatCell label='Avg Volume'    value={bundle.risk.averageVolume>=1e6?(bundle.risk.averageVolume/1e6).toFixed(2)+'M':(bundle.risk.averageVolume/1e3).toFixed(1)+'K'} />}
                    </div>
                  </div>
                )}
                {technicals && !isMF && !isIndex && (
                  <div className='space-y-2'>
                    <SectionHeader icon={<BarChart2 className='w-4 h-4' />} title='Technical Analysis' badge='Calculated' source='1Y Observations' />
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
                      {technicals.rsi        != null && <StatCell label='RSI (14)' value={technicals.rsi.toFixed(1)} sub={technicals.rsi>70?'Overbought':technicals.rsi<30?'Oversold':'Neutral'} positive={technicals.rsi<30} negative={technicals.rsi>70} />}
                      {technicals.sma50      != null && technicals.currentPrice != null && <StatCell label='vs SMA 50' value={((technicals.currentPrice-technicals.sma50)/technicals.sma50*100).toFixed(1)+'%'} sub={'SMA50: '+curSym+technicals.sma50.toFixed(2)} positive={technicals.currentPrice>technicals.sma50} negative={technicals.currentPrice<technicals.sma50} />}
                      {technicals.sma200     != null && technicals.currentPrice != null && <StatCell label='vs SMA 200' value={((technicals.currentPrice-technicals.sma200)/technicals.sma200*100).toFixed(1)+'%'} sub={'SMA200: '+curSym+technicals.sma200.toFixed(2)} positive={technicals.currentPrice>technicals.sma200} negative={technicals.currentPrice<technicals.sma200} />}
                      {technicals.volatility  != null && <StatCell label='Volatility (Ann.)' value={technicals.volatility.toFixed(1)+'%'} sub='From daily returns' />}
                      {technicals.maxDrawdown != null && <StatCell label='Max Drawdown 1Y' value={'-'+technicals.maxDrawdown.toFixed(1)+'%'} negative />}
                      {technicals.macd        != null && <StatCell label='MACD' value={technicals.macd.macd.toFixed(2)} sub={'Signal: '+technicals.macd.signal.toFixed(2)} positive={technicals.macd.histogram>0} negative={technicals.macd.histogram<0} />}
                    </div>
                    <div className='text-[11px] text-[#94A3B8] flex items-center gap-1'><Info className='w-3 h-3' /><span>Deterministic calculations from authentic 1Y observations. Not investment advice.</span></div>
                  </div>
                )}
                {!bundle?.risk && !technicals && <UnavailableNotice msg='Risk and technical data unavailable.' />}
              </div>
            )}

            {activeTab === 'dividends' && (
              <div className='space-y-4'>
                <SectionHeader icon={<DollarSign className='w-4 h-4' />} title='Dividends' source={bundle?.sources?.research} />
                {bundle?.dividends ? (
                  <div className='bg-[#F8F9FC] border border-[#E7E9F0] rounded-xl p-4'>
                    {bundle.dividends.yield          != null && <Row label='Dividend Yield'    value={bundle.dividends.yield.toFixed(2)+'%'} />}
                    {bundle.dividends.annualDividend != null && <Row label='Annual Dividend'   value={curSym+bundle.dividends.annualDividend.toFixed(2)} />}
                    {bundle.dividends.payoutRatio    != null && <Row label='Payout Ratio'      value={bundle.dividends.payoutRatio.toFixed(1)+'%'} />}
                    {bundle.dividends.exDividendDate          && <Row label='Ex-Dividend Date' value={bundle.dividends.exDividendDate} />}
                    {bundle.dividends.lastDividend   != null && <Row label='Last Dividend'     value={curSym+bundle.dividends.lastDividend.toFixed(2)} />}
                  </div>
                ) : <UnavailableNotice />}
              </div>
            )}

            {activeTab === 'fund' && (
              <div className='space-y-4'>
                <SectionHeader icon={<Building2 className='w-4 h-4' />} title={isMF ? 'Mutual Fund Details' : 'ETF Details'} source={bundle?.sources?.research} />
                {(bundle?.etfData || bundle?.mfData) ? (() => {
                  const d = bundle?.mfData ?? bundle?.etfData!;
                  return (
                    <div className='bg-[#F8F9FC] border border-[#E7E9F0] rounded-xl p-4'>
                      {d.issuer          && <Row label={isMF?'Fund House':'Issuer'} value={d.issuer} />}
                      {d.category        && <Row label='Category'       value={d.category} />}
                      {d.expenseRatio   != null && <Row label='Expense Ratio'  value={d.expenseRatio.toFixed(2)+'%'} />}
                      {d.aum            != null && <Row label='AUM' value={d.aum>=1e9?curSym+(d.aum/1e9).toFixed(2)+'B':curSym+(d.aum/1e6).toFixed(2)+'M'} />}
                      {d.nav            != null && <Row label='NAV' value={curSym+d.nav.toFixed(4)} mono />}
                      {d.inceptionDate   && <Row label='Inception Date' value={d.inceptionDate} />}
                      {d.ytdReturn      != null && <Row label='YTD Return'     value={d.ytdReturn.toFixed(2)+'%'} />}
                      {d.threeYearReturn != null && <Row label='3Y Avg Return' value={d.threeYearReturn.toFixed(2)+'%'} />}
                      {d.fiveYearReturn  != null && <Row label='5Y Avg Return' value={d.fiveYearReturn.toFixed(2)+'%'} />}
                    </div>
                  );
                })() : <UnavailableNotice />}
              </div>
            )}

          </div>
        </div>

        <div className='px-5 py-3.5 border-t border-[#E7E9F0] bg-[#F8F9FC] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0'>
          <div className='text-[11.5px] text-[#667085]'>Authentic market observations for research only. Not investment advice.</div>
          <div className='flex items-center gap-2 w-full sm:w-auto'>
            {onAskVestIQ && (
              <button type='button' onClick={() => { onAskVestIQ(instrument); onClose(); }}
                className='flex-1 sm:flex-none px-4 py-2 rounded-lg bg-teal-600 text-white font-bold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-teal-700'>
                <Sparkles className='w-4 h-4' /><span>Ask VestIQ</span>
              </button>
            )}
            <button type='button' onClick={onClose} className='flex-1 sm:flex-none px-4 py-2 rounded-lg border border-[#E7E9F0] bg-white text-[#172033] font-semibold text-[13px] hover:bg-slate-50 cursor-pointer'>Close</button>
          </div>
        </div>

      </div>
    </div>
  );
};