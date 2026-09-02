import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Activity, 
  Layers, 
  RefreshCw, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  marketApi, 
  type MarketInstrument, 
  type MarketInstrumentsResponse,
  type MarketCoverageResponse
} from '../../services/marketApi';
import { InstrumentDetailModal } from './InstrumentDetailModal';

type CategoryFilter = 
  | 'ALL' 
  | 'INDIAN_STOCKS' 
  | 'US_STOCKS' 
  | 'ETFS' 
  | 'MUTUAL_FUNDS' 
  | 'INDICES' 
  | 'COMMODITIES'
  | 'WATCHLIST';

export const MarketExplorerView: React.FC<{ onOpenVestIQWithQuery?: (query: string) => void }> = ({ onOpenVestIQWithQuery }) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [page, setPage] = useState(1);
  const limit = 18;

  // Data State
  const [instrumentsData, setInstrumentsData] = useState<MarketInstrumentsResponse | null>(null);
  const [coverageData, setCoverageData] = useState<MarketCoverageResponse | null>(null);
  const [watchlist, setWatchlist] = useState<MarketInstrument[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Instrument Modal
  const [selectedInstrument, setSelectedInstrument] = useState<MarketInstrument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search query (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Market Coverage Metadata
  const fetchCoverage = useCallback(async () => {
    try {
      const data = await marketApi.getCoverage();
      setCoverageData(data);
    } catch {
      // Non-blocking
    }
  }, []);

  // Fetch Market Overview
  const fetchOverview = useCallback(async () => {
    try {
      const data = await marketApi.getOverview();
      setOverview(data);
    } catch {
      // Non-blocking
    }
  }, []);

  // Fetch Watchlist
  const fetchWatchlist = useCallback(async () => {
    try {
      const list = await marketApi.getWatchlist();
      setWatchlist(list);
      setWatchlistIds(new Set(list.map((item) => item.canonicalId)));
    } catch {
      // Non-blocking unauthenticated
    }
  }, []);

  // Fetch Instruments Directory
  const fetchInstruments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (selectedCategory === 'WATCHLIST') {
        const list = await marketApi.getWatchlist();
        let filtered = list;
        if (debouncedQuery.trim()) {
          const q = debouncedQuery.toLowerCase();
          filtered = list.filter(
            (i) =>
              i.symbol.toLowerCase().includes(q) ||
              i.name.toLowerCase().includes(q) ||
              (i.category && i.category.toLowerCase().includes(q))
          );
        }
        setInstrumentsData({
          items: filtered,
          total: filtered.length,
          page: 1,
          limit: 100,
          totalPages: 1,
          hasMore: false
        });
      } else {
        const queryParams: any = {
          q: debouncedQuery.trim() || undefined,
          page,
          limit
        };

        if (selectedCategory === 'INDIAN_STOCKS') {
          queryParams.market = 'INDIA';
          queryParams.assetType = 'STOCK';
        } else if (selectedCategory === 'US_STOCKS') {
          queryParams.market = 'US';
          queryParams.assetType = 'STOCK';
        } else if (selectedCategory === 'ETFS') {
          queryParams.assetType = 'ETF';
        } else if (selectedCategory === 'MUTUAL_FUNDS') {
          queryParams.assetType = 'MUTUAL_FUND';
        } else if (selectedCategory === 'INDICES') {
          queryParams.assetType = 'INDEX';
        } else if (selectedCategory === 'COMMODITIES') {
          queryParams.assetType = 'COMMODITY';
        }

        const data = await marketApi.getInstruments(queryParams);
        setInstrumentsData(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load market directory.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, selectedCategory, page, coverageData]);

  // Initial load
  useEffect(() => {
    fetchCoverage();
    fetchOverview();
    fetchWatchlist();
  }, [fetchCoverage, fetchOverview, fetchWatchlist]);

  // Refetch when filters / page change
  useEffect(() => {
    fetchInstruments();
  }, [fetchInstruments]);

  // Real-Time 15-Second Background Market Refresh
  useEffect(() => {
    const liveTimer = setInterval(() => {
      fetchOverview();
      fetchInstruments();
    }, 15000);
    return () => clearInterval(liveTimer);
  }, [fetchOverview, fetchInstruments]);

  // Toggle watchlist
  const handleToggleWatchlist = async (canonicalId: string) => {
    try {
      if (watchlistIds.has(canonicalId)) {
        await marketApi.removeFromWatchlist(canonicalId);
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.delete(canonicalId);
          return next;
        });
        setWatchlist((prev) => prev.filter((item) => item.canonicalId !== canonicalId));
      } else {
        await marketApi.addToWatchlist(canonicalId);
        setWatchlistIds((prev) => new Set(prev).add(canonicalId));
        fetchWatchlist();
      }
    } catch {
      // Non-blocking
    }
  };

  const handleOpenDetail = (instrument: MarketInstrument) => {
    setSelectedInstrument(instrument);
    setIsModalOpen(true);
  };

  const handleAskVestIQ = (instrument: MarketInstrument) => {
    setIsModalOpen(false);
    if (onOpenVestIQWithQuery) {
      onOpenVestIQWithQuery(`Analyze ${instrument.name} (${instrument.symbol}) and its strategic fit in my portfolio.`);
    }
  };

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'ALL', label: 'All Instruments' },
    { id: 'INDIAN_STOCKS', label: 'Indian Equities (NSE)' },
    { id: 'US_STOCKS', label: 'US Equities (NASDAQ/NYSE)' },
    { id: 'ETFS', label: 'ETFs' },
    { id: 'MUTUAL_FUNDS', label: 'Mutual Funds (NAV)' },
    { id: 'INDICES', label: 'Benchmarks & Indices' },
    { id: 'COMMODITIES', label: 'Commodities (Gold/Silver)' },
    { id: 'WATCHLIST', label: `Watchlist (${watchlist.length})` },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto">
      
      {/* 1. TOP HEADER & SEARCH BAR */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Market Universe & Explorer</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Research stocks, ETFs, mutual funds, and market benchmarks across verified feeds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchCoverage();
                fetchInstruments();
              }}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0D9488] ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Feeds</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, ticker, fund name, ETF, index, or keyword..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0D9488] transition-colors placeholder:text-slate-400"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#0D9488] text-white font-semibold'
                  : 'bg-slate-100 dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MARKET OVERVIEW SECTION (Key Benchmarks & Indices) */}
      {!debouncedQuery && selectedCategory === 'ALL' && overview && !error && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#0D9488] dark:text-[#00D4AA]" />
              <span>Key Benchmarks & Indices</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
                <span>NSE: {overview?.india_status?.status || 'OPEN'}</span>
              </span>
              <span className="text-slate-300 dark:text-white/[0.1]">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                <span>NASDAQ: {overview?.us_status?.status || 'OPEN'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {overview?.indices?.india?.slice(0, 2).map((idx: any) => (
              <div 
                key={idx.symbol}
                onClick={() => handleOpenDetail({
                  canonicalId: `INDEX:${idx.symbol}`,
                  symbol: idx.symbol,
                  name: idx.name || idx.symbol,
                  assetType: 'INDEX',
                  assetClass: 'INDEX',
                  market: 'INDIA',
                  exchange: 'NSE',
                  currency: 'INR',
                  provider: 'IndianEquitiesProvider',
                  status: 'ACTIVE',
                  quote: idx
                })}
                className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-xl p-4 space-y-1 cursor-pointer hover:border-[#0D9488]/50 dark:hover:border-[#00D4AA]/50 transition-all min-w-0 overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{idx.symbol}</span>
                  <span className="text-[9.5px] uppercase px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 font-mono">NSE</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
                  ₹{idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 1 }) || '—'}
                </div>
                <div className={`text-xs font-mono font-bold ${(idx.changePct ?? 0) >= 0 ? 'text-[#0D9488] dark:text-[#00D4AA]' : 'text-[#FF5252]'}`}>
                  {(idx.changePct ?? 0) >= 0 ? '+' : ''}{idx.changePct?.toFixed(2)}%
                </div>
              </div>
            ))}

            {overview?.indices?.us?.slice(0, 1).map((idx: any) => (
              <div 
                key={idx.symbol}
                onClick={() => handleOpenDetail({
                  canonicalId: `INDEX:${idx.symbol}`,
                  symbol: idx.symbol,
                  name: idx.name || idx.symbol,
                  assetType: 'INDEX',
                  assetClass: 'INDEX',
                  market: 'US',
                  exchange: 'NASDAQ',
                  currency: 'USD',
                  provider: 'USEquitiesProvider',
                  status: 'ACTIVE',
                  quote: idx
                })}
                className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-xl p-4 space-y-1 cursor-pointer hover:border-[#38BDF8]/50 transition-all min-w-0 overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{idx.symbol}</span>
                  <span className="text-[9.5px] uppercase px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-[#38BDF8]/10 border border-sky-200 dark:border-[#38BDF8]/30 dark:text-[#38BDF8] font-mono">US</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
                  ${idx.price?.toLocaleString('en-US', { maximumFractionDigits: 1 }) || '—'}
                </div>
                <div className={`text-xs font-mono font-bold ${(idx.changePct ?? 0) >= 0 ? 'text-[#0D9488] dark:text-[#00D4AA]' : 'text-[#FF5252]'}`}>
                  {(idx.changePct ?? 0) >= 0 ? '+' : ''}{idx.changePct?.toFixed(2)}%
                </div>
              </div>
            ))}

            {overview?.indices?.commodities?.slice(0, 1).map((idx: any) => (
              <div 
                key={idx.symbol}
                onClick={() => handleOpenDetail({
                  canonicalId: `COMMODITY:${idx.symbol}`,
                  symbol: idx.symbol,
                  name: idx.name || idx.symbol,
                  assetType: 'COMMODITY',
                  assetClass: 'COMMODITY',
                  market: 'INDIA',
                  exchange: 'MCX',
                  currency: 'INR',
                  provider: 'GoldProvider',
                  status: 'ACTIVE',
                  quote: idx
                })}
                className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-xl p-4 space-y-1 cursor-pointer hover:border-amber-500/50 transition-all min-w-0 overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{idx.symbol}</span>
                  <span className="text-[9.5px] uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 dark:text-amber-400 font-mono">MCX</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
                  ₹{idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '—'}
                </div>
                <div className={`text-xs font-mono font-bold ${(idx.changePct ?? 0) >= 0 ? 'text-[#0D9488] dark:text-[#00D4AA]' : 'text-[#FF5252]'}`}>
                  {(idx.changePct ?? 0) >= 0 ? '+' : ''}{idx.changePct?.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DISCOVERY & INSTRUMENT CARDS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0D9488] dark:text-[#00D4AA]" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {selectedCategory === 'WATCHLIST' ? 'Saved Watchlist' : (debouncedQuery ? `Search Results for "${debouncedQuery}"` : 'Market Directory')}
            </h2>
            {!error && !isLoading && instrumentsData && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                ({instrumentsData.total} Instruments)
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-12 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#00D4AA]" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Scanning live market feeds & providers...</span>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-6 text-center space-y-2">
            <AlertCircle className="w-5 h-5 text-[#FF5252] mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Market Directory Unavailable</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{error}</p>
            <button
              type="button"
              onClick={() => fetchInstruments()}
              className="px-4 py-2 bg-[#00D4AA] text-[#060811] rounded-xl text-xs font-bold cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : !instrumentsData?.items || instrumentsData.items.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-12 text-center space-y-2">
            <Search className="w-6 h-6 mx-auto text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No matching instruments found.</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try another symbol, company name, exchange or spelling (e.g. TSMC, Nvidia, Microsoft, Parag Parikh, SPY, Nifty 50).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {instrumentsData.items.map((item) => {
              const quote = item.quote;
              const isWatchlisted = watchlistIds.has(item.canonicalId);
              const isPos = (quote?.changePct ?? 0) >= 0;
              const curr = item.currency === 'USD' ? '$' : (item.currency === 'TWD' ? 'NT$' : '₹');
              const isMf = item.assetType === 'MUTUAL_FUND';

              return (
                <div
                  key={item.canonicalId}
                  onClick={() => handleOpenDetail(item)}
                  className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-xl p-5 flex flex-col justify-between gap-3 cursor-pointer hover:border-[#0D9488]/50 dark:hover:border-[#00D4AA]/50 transition-all min-w-0 overflow-hidden"
                >
                  {/* Top Row: Symbol, Asset Type, Watchlist */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#0B1120] dark:border-white/[0.08] dark:text-[#00D4AA]">
                          {item.assetType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                          {item.exchange}
                        </span>
                        {item.country && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400">
                            {item.country}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[190px]">
                        {item.name}
                      </h3>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block">
                        {item.symbol}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWatchlist(item.canonicalId);
                      }}
                      className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        isWatchlisted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#00D4AA]/10 dark:border-[#00D4AA]/30 dark:text-[#00D4AA]'
                          : 'bg-slate-50 dark:bg-[#0B1120] border-slate-200 dark:border-white/[0.06] text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      {isWatchlisted ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Price & Change Row */}
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        {isMf ? 'Latest NAV' : 'Price'}
                      </span>
                      <div className="text-base font-black text-slate-900 dark:text-white font-mono">
                        {quote?.price !== null && quote?.price !== undefined
                          ? `${curr}${quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : 'Available on request'}
                      </div>
                    </div>

                    <div className="text-right">
                      {quote?.changePct !== null && quote?.changePct !== undefined ? (
                        <div className={`text-xs font-mono font-bold ${isPos ? 'text-[#0D9488] dark:text-[#00D4AA]' : 'text-[#FF5252]'}`}>
                          {isPos ? '+' : ''}{quote.changePct.toFixed(2)}%
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">HISTORICAL</span>
                      )}
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[130px]">
                        {item.category || item.sector || item.fundHouse || 'Market Asset'}
                      </span>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between text-xs text-[#0D9488] dark:text-[#00D4AA] font-semibold pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                    <span>Inspect & Research</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. PAGINATION CONTROLS */}
        {!error && !isLoading && instrumentsData && (instrumentsData.totalPages ?? 1) > 1 && selectedCategory !== 'WATCHLIST' && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/[0.06] text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing page <strong className="text-slate-900 dark:text-white font-mono">{instrumentsData.page}</strong> of <strong className="text-slate-900 dark:text-white font-mono">{instrumentsData.totalPages ?? 1}</strong> ({instrumentsData.total} items)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                disabled={!instrumentsData.hasMore}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. INSTRUMENT DETAIL MODAL */}
      <InstrumentDetailModal
        instrument={selectedInstrument}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isWatchlisted={selectedInstrument ? watchlistIds.has(selectedInstrument.canonicalId) : false}
        onToggleWatchlist={handleToggleWatchlist}
        onAskVestIQ={handleAskVestIQ}
      />

    </div>
  );
};
