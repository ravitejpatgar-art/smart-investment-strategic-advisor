import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Clock,
  Filter,
  Sparkles,
  X,
  RotateCcw
} from 'lucide-react';
import { 
  marketApi, 
  type MarketInstrument, 
  type MarketInstrumentsResponse, 
  type MarketCoverageResponse 
} from '../../services/marketApi';
import { InstrumentDetailModal } from './InstrumentDetailModal';
import { Badge } from '../common/Badge';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { useFintechStore } from '../../store/useFintechStore';

type CategoryFilter = 
  | 'ALL' 
  | 'STOCKS' 
  | 'ETFS' 
  | 'MUTUAL_FUNDS' 
  | 'WATCHLIST';

interface MarketExplorerViewProps {
  onOpenVestIQWithQuery?: (query: string) => void;
}

export const MarketExplorerView: React.FC<MarketExplorerViewProps> = ({ onOpenVestIQWithQuery }) => {
  const { setActiveView } = useFintechStore();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [selectedExchange, setSelectedExchange] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const limit = 24;

  // Data State
  const [instrumentsData, setInstrumentsData] = useState<MarketInstrumentsResponse | null>(null);
  const [coverageData, setCoverageData] = useState<MarketCoverageResponse | null>(null);
  const [watchlist, setWatchlist] = useState<MarketInstrument[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected Instrument Detail Terminal
  const [selectedInstrument, setSelectedInstrument] = useState<MarketInstrument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search query (300ms)
  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when category, exchange, country or currency changes
  const handleCategoryChange = (cat: CategoryFilter) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleExchangeChange = (ex: string) => {
    setSelectedExchange(ex);
    setPage(1);
  };

  const handleCountryChange = (c: string) => {
    setSelectedCountry(c);
    setPage(1);
  };

  const handleCurrencyChange = (cur: string) => {
    setSelectedCurrency(cur);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedCategory('ALL');
    setSelectedExchange('ALL');
    setSelectedCountry('ALL');
    setSelectedCurrency('ALL');
    setPage(1);
  };

  const isFiltered = useMemo(() => {
    return (
      debouncedQuery.trim() !== '' ||
      selectedCategory !== 'ALL' ||
      selectedExchange !== 'ALL' ||
      selectedCountry !== 'ALL' ||
      selectedCurrency !== 'ALL'
    );
  }, [debouncedQuery, selectedCategory, selectedExchange, selectedCountry, selectedCurrency]);

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
      // Non-blocking
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
              (i.category && i.category.toLowerCase().includes(q)) ||
              (i.isin && i.isin.toLowerCase().includes(q))
          );
        }
        if (selectedExchange !== 'ALL') {
          filtered = filtered.filter((i) => i.exchange.toUpperCase() === selectedExchange.toUpperCase());
        }
        if (selectedCountry !== 'ALL') {
          filtered = filtered.filter((i) => i.country?.toUpperCase() === selectedCountry.toUpperCase());
        }
        if (selectedCurrency !== 'ALL') {
          filtered = filtered.filter((i) => i.currency?.toUpperCase() === selectedCurrency.toUpperCase());
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

        if (selectedCategory === 'STOCKS') {
          queryParams.assetType = 'STOCK';
        } else if (selectedCategory === 'ETFS') {
          queryParams.assetType = 'ETF';
        } else if (selectedCategory === 'MUTUAL_FUNDS') {
          queryParams.assetType = 'MUTUAL_FUND';
        }

        if (selectedExchange !== 'ALL') {
          queryParams.exchange = selectedExchange;
        }
        if (selectedCountry !== 'ALL') {
          queryParams.country = selectedCountry;
        }
        if (selectedCurrency !== 'ALL') {
          queryParams.currency = selectedCurrency;
        }

        const data = await marketApi.getInstruments(queryParams);
        setInstrumentsData(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load market directory.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, selectedCategory, selectedExchange, selectedCountry, selectedCurrency, page]);

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
    } else {
      setActiveView('ai');
    }
  };

  const categories: { id: CategoryFilter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'All', count: coverageData?.total_instruments },
    { id: 'STOCKS', label: 'Stocks', count: coverageData?.stocks_count ?? coverageData?.by_asset_type?.STOCK },
    { id: 'ETFS', label: 'ETFs', count: coverageData?.etfs_count ?? coverageData?.by_asset_type?.ETF },
    { id: 'MUTUAL_FUNDS', label: 'Mutual Funds', count: coverageData?.mutual_funds_count ?? coverageData?.by_asset_type?.MUTUAL_FUND },
    { id: 'WATCHLIST', label: 'Watchlist', count: watchlist.length },
  ];

  const exchanges = [
    { code: 'ALL', label: 'All Exchanges' },
    { code: 'NSE', label: 'NSE (India)' },
    { code: 'BSE', label: 'BSE (India)' },
    { code: 'AMFI', label: 'AMFI (Mutual Funds)' },
    { code: 'NASDAQ', label: 'NASDAQ (US)' },
    { code: 'NYSE', label: 'NYSE (US)' },
    { code: 'LSE', label: 'LSE (UK)' },
    { code: 'XETRA', label: 'XETRA (Germany)' },
  ];

  const countries = [
    { code: 'ALL', label: 'All Countries' },
    { code: 'IN', label: 'India' },
    { code: 'US', label: 'United States' },
    { code: 'GB', label: 'United Kingdom' },
    { code: 'DE', label: 'Germany' },
    { code: 'JP', label: 'Japan' },
    { code: 'TW', label: 'Taiwan' },
  ];

  const currencies = [
    { code: 'ALL', label: 'All Currencies' },
    { code: 'INR', label: 'INR (₹)' },
    { code: 'USD', label: 'USD ($)' },
    { code: 'EUR', label: 'EUR (€)' },
    { code: 'GBP', label: 'GBP (£)' },
    { code: 'TWD', label: 'TWD (NT$)' },
  ];

  const formatSyncTime = (isoString?: string) => {
    if (!isoString) return 'Realtime';
    try {
      const dt = new Date(isoString);
      return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Realtime';
    }
  };

  const getFreshnessVariant = (status?: string, freshness?: string): "live" | "delayed" | "fallback" | "stale" | "demo" | "unavailable" => {
    const s = (status || freshness || "").toUpperCase();
    if (s === "LIVE" || s === "REALTIME") return "live";
    if (s === "DELAYED") return "delayed";
    if (s === "FALLBACK" || s === "LATEST_AVAILABLE" || s === "HISTORICAL") return "fallback";
    if (s === "DEMO" || s === "MODEL_ASSUMPTION") return "demo";
    if (s === "STALE") return "stale";
    return "unavailable";
  };

  const totalResults = instrumentsData?.total ?? 0;
  const totalPages = instrumentsData?.totalPages ?? Math.max(1, Math.ceil(totalResults / limit));
  const startItem = totalResults === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalResults);

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* 1. MARKET TERMINAL HEADER & TELEMETRY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        
        {/* Top Title & Quick Actions Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Market Terminal</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-semibold uppercase tracking-wider">
                    Institutional Workspace
                  </span>
                </h1>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Discover, track, and research 16,921+ global stocks, ETFs, mutual fund schemes, and key benchmarks with institutional-grade data integrity.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (onOpenVestIQWithQuery) {
                  onOpenVestIQWithQuery("Provide a comprehensive market summary and identify standout strategic investment opportunities.");
                } else {
                  setActiveView('ai');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-[#00D4AA] text-[#0F172A] hover:bg-teal-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Consult VestIQ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                fetchCoverage();
                fetchOverview();
                fetchInstruments();
              }}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* Dynamic Catalog & Coverage Status Bar */}
        {coverageData && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span>{coverageData.total_instruments.toLocaleString()} Instruments Universe</span>
            </div>
            <span className="text-slate-300">•</span>
            <div>
              <span>Stocks: </span>
              <strong className="text-slate-800 font-mono">{(coverageData.stocks_count ?? coverageData.by_asset_type?.STOCK ?? 2562).toLocaleString()}</strong>
            </div>
            <span className="text-slate-300">•</span>
            <div>
              <span>ETFs: </span>
              <strong className="text-slate-800 font-mono">{(coverageData.etfs_count ?? coverageData.by_asset_type?.ETF ?? 24).toLocaleString()}</strong>
            </div>
            <span className="text-slate-300">•</span>
            <div>
              <span>Mutual Funds: </span>
              <strong className="text-slate-800 font-mono">{(coverageData.mutual_funds_count ?? coverageData.by_asset_type?.MUTUAL_FUND ?? 14329).toLocaleString()}</strong>
            </div>
            <span className="text-slate-300">•</span>
            <div>
              <strong className="text-slate-800 font-mono">{coverageData.exchanges_count} Exchanges</strong> ({coverageData.countries_count} Countries)
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Synced {formatSyncTime(coverageData.last_synced_at)}</span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stocks, ETFs, mutual funds, ISIN, ticker (e.g. AAPL, AMD, RELIANCE, SPY, VOO, Nippon India, HDFC Flexi Cap)..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:bg-white placeholder:text-slate-400 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls: Category Tabs & Selectors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#00D4AA] text-[#0F172A] font-bold shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                    selectedCategory === cat.id ? 'bg-[#0F172A]/10 text-[#0F172A]' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {cat.count.toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Secondary Dropdowns & Reset */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-600">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={selectedExchange}
                onChange={(e) => handleExchangeChange(e.target.value)}
                className="bg-transparent text-slate-900 font-medium text-xs focus:outline-none cursor-pointer"
                aria-label="Filter by exchange"
              >
                {exchanges.map((ex) => (
                  <option key={ex.code} value={ex.code}>{ex.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-600">
              <Globe className="w-3 h-3 text-slate-400" />
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="bg-transparent text-slate-900 font-medium text-xs focus:outline-none cursor-pointer"
                aria-label="Filter by country"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-600">
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="bg-transparent text-slate-900 font-medium text-xs focus:outline-none cursor-pointer"
                aria-label="Filter by currency"
              >
                {currencies.map((cur) => (
                  <option key={cur.code} value={cur.code}>{cur.label}</option>
                ))}
              </select>
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MARKET OVERVIEW SECTION (Key Benchmarks & Indices) */}
      {!isFiltered && overview && !error && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Key Benchmarks & Global Indices</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>NSE: {overview?.india_status?.status || 'OPEN'}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>NASDAQ: {overview?.us_status?.status || 'OPEN'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 cursor-pointer hover:border-teal-400 hover:shadow-md transition-all shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-900">{idx.symbol}</span>
                  <span className="text-[9.5px] uppercase px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">NSE</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                  ₹{idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 1 }) || '—'}
                </div>
                <div className={`text-xs font-mono font-semibold ${(idx.changePct ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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
                className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-900">{idx.symbol}</span>
                  <span className="text-[9.5px] uppercase px-1.5 py-0.2 rounded bg-blue-50 border border-blue-200 text-blue-700 font-mono">NASDAQ</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                  ${idx.price?.toLocaleString('en-US', { maximumFractionDigits: 1 }) || '—'}
                </div>
                <div className={`text-xs font-mono font-semibold ${(idx.changePct ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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
                className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-900">{idx.symbol}</span>
                  <span className="text-[9.5px] uppercase px-1.5 py-0.2 rounded bg-amber-50 border border-amber-200 text-amber-800 font-mono">MCX</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                  ₹{idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '—'}
                </div>
                <div className={`text-xs font-mono font-semibold ${(idx.changePct ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {(idx.changePct ?? 0) >= 0 ? '+' : ''}{idx.changePct?.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DISCOVERY & INSTRUMENT CARDS GRID */}
      <div className="space-y-4">
        
        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {selectedCategory === 'WATCHLIST' 
                ? 'Saved Watchlist' 
                : debouncedQuery 
                ? `Search Results for "${debouncedQuery}"` 
                : 'Market Catalog'}
            </h2>
            {!error && !isLoading && (
              <span className="text-xs text-slate-500 font-mono">
                ({totalResults.toLocaleString()} items)
              </span>
            )}
          </div>

          {!error && !isLoading && totalResults > 0 && (
            <span className="text-xs text-slate-500">
              Showing <strong className="text-slate-800 font-mono">{startItem}–{endItem}</strong> of <strong className="text-slate-800 font-mono">{totalResults.toLocaleString()}</strong>
            </span>
          )}
        </div>

        {/* Loading Skeleton Grid */}
        {isLoading || isSearching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5 w-3/4">
                    <Skeleton variant="text" width="40%" height={14} />
                    <Skeleton variant="text" width="80%" height={18} />
                    <Skeleton variant="text" width="50%" height={12} />
                  </div>
                  <Skeleton variant="rectangular" width={28} height={28} className="rounded-lg" />
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                  <Skeleton variant="text" width="35%" height={20} />
                  <Skeleton variant="text" width="25%" height={14} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Market Directory Unavailable</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <button
              type="button"
              onClick={() => fetchInstruments()}
              className="px-4 py-2 bg-[#00D4AA] text-[#0F172A] rounded-xl text-xs font-bold cursor-pointer hover:bg-teal-400 shadow-xs"
            >
              Retry Connection
            </button>
          </div>
        ) : !instrumentsData?.items || instrumentsData.items.length === 0 ? (
          <EmptyState
            title="No matching instruments found"
            description="Try searching by a different ticker (e.g. AAPL, AMD, RELIANCE, SPY), fund name (e.g. Nippon India, HDFC Flexi Cap), or ISIN."
            actionLabel="Reset Search & Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {instrumentsData.items.map((item) => {
              const quote = item.quote;
              const isWatchlisted = watchlistIds.has(item.canonicalId);
              const isPos = (quote?.changePct ?? 0) >= 0;
              const curr = item.currency === 'USD' ? '$' : (item.currency === 'TWD' ? 'NT$' : (item.currency === 'GBP' ? '£' : (item.currency === 'EUR' ? '€' : '₹')));
              const isMf = item.assetType === 'MUTUAL_FUND';
              const isEtf = item.assetType === 'ETF';
              const displayNav = item.nav ?? quote?.price;
              const displayPrice = quote?.price;
              const hasPrice = displayPrice !== null && displayPrice !== undefined;
              const hasNav = displayNav !== null && displayNav !== undefined;

              return (
                <div
                  key={item.canonicalId}
                  onClick={() => handleOpenDetail(item)}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between gap-3.5 cursor-pointer hover:border-teal-400 hover:shadow-md transition-all shadow-xs group"
                >
                  {/* Top Row: Symbol, Badges, Watchlist */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge 
                          variant={isMf ? 'purple' as any : isEtf ? 'blue' : 'teal'} 
                          size="sm"
                        >
                          {item.assetType.replace('_', ' ')}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                          {item.exchange}
                        </span>
                        {item.country && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                            {item.country}
                          </span>
                        )}
                        {item.plan && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                            {item.plan}
                          </span>
                        )}
                        {item.option && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                            {item.option}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 truncate max-w-[220px] group-hover:text-teal-700 transition-colors" title={item.name}>
                        {item.name}
                      </h3>

                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <span className="font-semibold text-slate-700">{item.symbol}</span>
                        {item.isin && (
                          <span className="text-[10.5px] text-slate-400">ISIN: {item.isin}</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWatchlist(item.canonicalId);
                      }}
                      className={`p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        isWatchlisted
                          ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      aria-label={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      {isWatchlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Price & Change Row */}
                  <div className="flex items-baseline justify-between pt-2.5 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        {isMf ? 'Latest NAV' : 'Price'}
                      </span>
                      <div className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                        {isMf ? (
                          hasNav ? `₹${displayNav?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'NAV Unavailable'
                        ) : (
                          hasPrice ? `${curr}${displayPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'On Request'
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {isMf ? (
                        <div className="text-[10px] font-mono text-slate-500">
                          {item.navDate || quote?.asOf ? `As of ${item.navDate || quote?.asOf}` : 'AMFI NAV'}
                        </div>
                      ) : quote?.changePct !== null && quote?.changePct !== undefined ? (
                        <div className={`text-xs font-mono font-bold ${isPos ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isPos ? '+' : ''}{quote.changePct.toFixed(2)}%
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {quote?.freshness || 'HISTORICAL'}
                        </span>
                      )}
                      <span className="text-[10.5px] text-slate-500 block truncate max-w-[140px]">
                        {item.fundHouse || item.sector || item.category || 'Institutional Asset'}
                      </span>
                    </div>
                  </div>

                  {/* Footer Action & Freshness Strip */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Badge 
                        variant={getFreshnessVariant(quote?.status, quote?.freshness)} 
                        size="sm"
                        showDot
                      >
                        {quote?.status ?? quote?.freshness ?? 'LATEST_AVAILABLE'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-teal-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect & Research</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. SERVER-SIDE PAGINATION CONTROLS */}
        {!error && !isLoading && totalPages > 1 && selectedCategory !== 'WATCHLIST' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs">
            <span className="text-slate-500">
              Showing page <strong className="text-slate-900 font-mono">{page}</strong> of <strong className="text-slate-900 font-mono">{totalPages}</strong> ({totalResults.toLocaleString()} items)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 font-mono text-xs">
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  let pageNum = idx + 1;
                  if (totalPages > 5) {
                    if (page > 3 && page < totalPages - 2) {
                      pageNum = page - 2 + idx;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    }
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        page === pageNum
                          ? 'bg-[#00D4AA] text-[#0F172A] shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. INSTRUMENT DETAIL RESEARCH TERMINAL MODAL */}
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
