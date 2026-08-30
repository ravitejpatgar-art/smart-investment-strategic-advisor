import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Activity, 
  Layers, 
  Globe, 
  RefreshCw, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  Clock
} from 'lucide-react';
import { 
  marketApi, 
  type MarketInstrument, 
  type MarketInstrumentsResponse,
  type MarketCoverageResponse
} from '../../services/marketApi';
import { useFintechStore } from '../../store/useFintechStore';
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
  const { setActiveView } = useFintechStore();

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

    if (selectedCategory === 'WATCHLIST') {
      try {
        const list = await marketApi.getWatchlist();
        setWatchlist(list);
        setWatchlistIds(new Set(list.map((item) => item.canonicalId)));
        
        let filtered = list;
        if (debouncedQuery) {
          const q = debouncedQuery.toLowerCase();
          filtered = list.filter(
            (i) => i.name.toLowerCase().includes(q) || i.symbol.toLowerCase().includes(q) || i.canonicalId.toLowerCase().includes(q)
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
      } catch (err: any) {
        setInstrumentsData(null);
        if (err?.response?.status === 401) {
          setError('AUTH_ERROR: Please log in to view and manage your personalized watchlist.');
        } else if (!err?.response) {
          setError('BACKEND_OFFLINE: Unable to connect to SmartVest market service.');
        } else {
          setError('PROVIDER_UNAVAILABLE: Watchlist is temporarily unavailable.');
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      let assetTypeParam: string | undefined = undefined;
      let marketParam: string | undefined = undefined;

      if (selectedCategory === 'INDIAN_STOCKS') {
        assetTypeParam = 'STOCK';
        marketParam = 'INDIA';
      } else if (selectedCategory === 'US_STOCKS') {
        assetTypeParam = 'STOCK';
        marketParam = 'US';
      } else if (selectedCategory === 'ETFS') {
        assetTypeParam = 'ETF';
      } else if (selectedCategory === 'MUTUAL_FUNDS') {
        assetTypeParam = 'MUTUAL_FUND';
      } else if (selectedCategory === 'INDICES') {
        assetTypeParam = 'INDEX';
      } else if (selectedCategory === 'COMMODITIES') {
        assetTypeParam = 'COMMODITY';
      }

      const res = await marketApi.getInstruments({
        q: debouncedQuery || undefined,
        asset_type: assetTypeParam,
        market: marketParam,
        page,
        limit
      });
      setInstrumentsData(res);
    } catch (err: any) {
      setInstrumentsData(null);
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        setError('TIMEOUT: Market data feeds timed out. Please retry.');
      } else if (!err?.response) {
        setError('BACKEND_OFFLINE: Unable to connect to SmartVest market data service.');
      } else if (err?.response?.status === 401) {
        setError('AUTH_ERROR: Authentication required to access market directory.');
      } else if (err?.response?.status === 503 || err?.response?.status === 502) {
        setError('PROVIDER_UNAVAILABLE: Market directory feeds are temporarily unavailable.');
      } else {
        setError(err?.response?.data?.detail || 'BAD_RESPONSE: Failed to retrieve market directory.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, selectedCategory, page]);

  useEffect(() => {
    fetchCoverage();
    fetchOverview();
    fetchWatchlist();
  }, [fetchCoverage, fetchOverview, fetchWatchlist]);

  useEffect(() => {
    fetchInstruments();
  }, [fetchInstruments]);

  // Watchlist Toggle
  const handleToggleWatchlist = async (canonicalId: string) => {
    const isCurrentlyWatchlisted = watchlistIds.has(canonicalId);
    try {
      if (isCurrentlyWatchlisted) {
        await marketApi.removeFromWatchlist(canonicalId);
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.delete(canonicalId);
          return next;
        });
        setWatchlist((prev) => prev.filter((i) => i.canonicalId !== canonicalId));
      } else {
        await marketApi.addToWatchlist(canonicalId);
        setWatchlistIds((prev) => new Set(prev).add(canonicalId));
        fetchWatchlist();
      }
    } catch {
      // Non-blocking
    }
  };

  // Open Detail Modal
  const handleOpenDetail = (instrument: MarketInstrument) => {
    setSelectedInstrument(instrument);
    setIsModalOpen(true);
  };

  // Ask VestIQ Handoff
  const handleAskVestIQ = (instrument: MarketInstrument) => {
    const query = `Analyze ${instrument.name} (${instrument.symbol}) in the context of my financial profile and risk mandate.`;
    if (onOpenVestIQWithQuery) {
      onOpenVestIQWithQuery(query);
    } else {
      setActiveView('ai');
    }
  };

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'ALL', label: 'All Instruments' },
    { id: 'INDIAN_STOCKS', label: 'Indian Stocks' },
    { id: 'US_STOCKS', label: 'US Stocks' },
    { id: 'ETFS', label: 'ETFs' },
    { id: 'MUTUAL_FUNDS', label: 'Mutual Funds' },
    { id: 'INDICES', label: 'Indices' },
    { id: 'COMMODITIES', label: 'Gold & Commodities' },
    { id: 'WATCHLIST', label: `My Watchlist (${watchlist.length})` }
  ];

  const formatSyncTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
             d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' IST';
    } catch {
      return '29 Aug 2026, 16:00 IST';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* 1. TOP HEADER & PROMINENT SEARCH BAR */}
      <div className="bg-white border border-[#E7E9F0] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-600" />
              <h1 className="text-xl sm:text-[24px] font-bold text-[#172033] tracking-tight">
                Global Market Terminal
              </h1>
            </div>
            <p className="text-[13.5px] text-[#667085] pt-0.5 max-w-2xl">
              Search and research stocks, ETFs, mutual funds and global market instruments available through SmartVest's connected market providers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchCoverage();
                fetchInstruments();
              }}
              disabled={isLoading}
              className="p-2 rounded-lg border border-[#E7E9F0] hover:bg-slate-50 text-[#667085] hover:text-[#172033] cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Dynamic Coverage Status Metadata Bar */}
        {coverageData && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-[#F1F5F9] text-[12px] text-[#667085]">
            <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span>{coverageData.total_instruments} Instruments Available</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>Coverage:</span>
              <strong className="text-[#172033]">{coverageData.exchanges_count} Exchanges</strong>
              <span>({coverageData.exchanges.join(', ')})</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <strong className="text-[#172033]">{coverageData.countries_count} Countries</strong>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-[#667085]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last synchronized: {formatSyncTime(coverageData.last_synced_at)}</span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, ticker, fund name, ETF, index, or keyword (e.g. TSMC, Nvidia, Microsoft, Parag Parikh, SPY, Nifty 50)..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-2xs"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-2xs font-bold'
                  : 'bg-[#F8F9FC] border border-[#E7E9F0] text-[#667085] hover:text-[#172033] hover:bg-slate-100'
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
            <h2 className="text-[14.5px] font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Key Benchmarks & Indices</span>
            </h2>
            <div className="flex items-center gap-3 text-[12px] text-[#667085]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>NSE: {overview?.india_status?.status || 'OPEN'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
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
                className="p-3.5 rounded-xl bg-white border border-[#E7E9F0] hover:border-teal-300 transition-all cursor-pointer shadow-xs space-y-1 group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[12.5px] font-bold text-[#172033] group-hover:text-teal-700">{idx.symbol}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[#667085]">NSE</span>
                </div>
                <div className="text-[17px] sm:text-[19px] font-black text-[#172033] font-mono">
                  ₹{idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 1 }) || '—'}
                </div>
                <div className={`text-[12px] font-mono font-bold ${(idx.changePct ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
                className="p-3.5 rounded-xl bg-white border border-[#E7E9F0] hover:border-teal-300 transition-all cursor-pointer shadow-xs space-y-1 group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[12.5px] font-bold text-[#172033] group-hover:text-teal-700">{idx.symbol}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-mono">US</span>
                </div>
                <div className="text-[17px] sm:text-[19px] font-black text-[#172033] font-mono">
                  ${idx.price?.toLocaleString('en-US', { maximumFractionDigits: 1 }) || '—'}
                </div>
                <div className={`text-[12px] font-mono font-bold ${(idx.changePct ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
                className="p-3.5 rounded-xl bg-white border border-[#E7E9F0] hover:border-teal-300 transition-all cursor-pointer shadow-xs space-y-1 group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[12.5px] font-bold text-[#172033] group-hover:text-teal-700">{idx.symbol}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-yellow-50 text-yellow-800 font-mono">MCX</span>
                </div>
                <div className="text-[17px] sm:text-[19px] font-black text-[#172033] font-mono">
                  ₹{idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '—'}
                </div>
                <div className={`text-[12px] font-mono font-bold ${(idx.changePct ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
            <Layers className="w-4 h-4 text-teal-600" />
            <h2 className="text-[16px] font-bold text-[#172033] tracking-tight">
              {selectedCategory === 'WATCHLIST' ? 'Saved Watchlist' : (debouncedQuery ? `Search Results for "${debouncedQuery}"` : 'Market Directory')}
            </h2>
            {!error && !isLoading && instrumentsData && (
              <span className="text-[12px] text-[#667085] font-mono">
                ({instrumentsData.total} Instruments)
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white border border-[#E7E9F0] rounded-xl p-12 flex flex-col items-center justify-center space-y-2 text-[#667085]">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <span className="text-[14px] font-medium">Scanning live market feeds & providers...</span>
          </div>
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[15px] font-bold text-[#172033]">Market Directory Unavailable</h3>
              <p className="text-[13.5px] text-[#667085] max-w-md mx-auto">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchInstruments()}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-[13px] font-semibold hover:bg-teal-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : !instrumentsData?.items || instrumentsData.items.length === 0 ? (
          <div className="bg-white border border-[#E7E9F0] rounded-xl p-12 text-center space-y-2">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-[16px] font-bold text-[#172033]">No matching instruments found in the current provider coverage.</h3>
            <p className="text-[13px] text-[#667085] max-w-md mx-auto">
              Try another symbol, company name, exchange or spelling (e.g. TSMC, Nvidia, Microsoft, Parag Parikh, SPY, Nifty 50).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                  className="bg-white border border-[#E7E9F0] hover:border-teal-400 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer group relative"
                >
                  {/* Top Row: Symbol, Asset Type, Watchlist */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase border ${
                          item.assetType === 'STOCK' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          item.assetType === 'ETF' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                          item.assetType === 'MUTUAL_FUND' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          item.assetType === 'INDEX' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          'bg-yellow-50 text-yellow-800 border-yellow-200'
                        }`}>
                          {item.assetType.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] font-mono text-[#667085] uppercase">
                          {item.exchange}
                        </span>
                        {item.country && (
                          <span className="text-[10px] font-mono px-1 rounded bg-slate-100 text-slate-600">
                            {item.country}
                          </span>
                        )}
                      </div>
                      <h3 className="text-[15.5px] font-bold text-[#172033] group-hover:text-teal-700 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <span className="text-[12px] font-mono text-[#667085]">
                        {item.symbol}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWatchlist(item.canonicalId);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                        isWatchlisted
                          ? 'bg-teal-50 border-teal-300 text-teal-700'
                          : 'bg-[#F8F9FC] border-[#E7E9F0] text-[#98A2B3] hover:text-[#172033]'
                      }`}
                      title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      {isWatchlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Price & Change Row */}
                  <div className="flex items-baseline justify-between pt-1 border-t border-[#F1F5F9]">
                    <div>
                      <span className="text-[11px] text-[#667085] uppercase font-semibold block">
                        {isMf ? 'Latest NAV' : 'Price'}
                      </span>
                      <div className="text-[17px] font-black text-[#172033] font-mono">
                        {quote?.price !== null && quote?.price !== undefined
                          ? `${curr}${quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : 'Available on request'}
                      </div>
                    </div>

                    <div className="text-right">
                      {quote?.changePct !== null && quote?.changePct !== undefined ? (
                        <div className={`text-[13px] font-mono font-bold ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPos ? '+' : ''}{quote.changePct.toFixed(2)}%
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">HISTORICAL</span>
                      )}
                      <span className="text-[10.5px] text-[#98A2B3] block truncate max-w-[140px]">
                        {item.category || item.sector || item.fundHouse || 'Market Asset'}
                      </span>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between text-[12px] pt-2 border-t border-[#F1F5F9] text-teal-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect & Research</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. PAGINATION CONTROLS */}
        {!error && !isLoading && instrumentsData && instrumentsData.totalPages > 1 && selectedCategory !== 'WATCHLIST' && (
          <div className="flex items-center justify-between pt-4 border-t border-[#E7E9F0] text-xs">
            <span className="text-[#667085]">
              Showing page <strong>{instrumentsData.page}</strong> of <strong>{instrumentsData.totalPages}</strong> ({instrumentsData.total} items)
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#E7E9F0] bg-white text-[#172033] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={!instrumentsData.hasMore}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E9F0] bg-white text-[#172033] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-semibold flex items-center gap-1 cursor-pointer"
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
