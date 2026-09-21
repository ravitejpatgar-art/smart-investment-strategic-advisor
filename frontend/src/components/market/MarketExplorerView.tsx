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
  MessageSquareText,
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
  const { setActiveView, strategy } = useFintechStore();

  // Cross-reference user strategy allocations for portfolio integration
  const userOwnedMap = useMemo(() => {
    const map = new Map<string, { weight: number; role: string }>();
    if (strategy?.allocations) {
      strategy.allocations.forEach(alloc => {
        const wt = alloc.percentage || 0;
        const role = alloc.portfolioRole || alloc.category || 'Core Portfolio';
        if (alloc.ticker) map.set(alloc.ticker.toUpperCase(), { weight: wt, role });
        if (alloc.name) map.set(alloc.name.toUpperCase(), { weight: wt, role });
        if (alloc.id) map.set(alloc.id.toUpperCase(), { weight: wt, role });
        if (alloc.suggestedInstruments) {
          alloc.suggestedInstruments.forEach(inst => map.set(inst.toUpperCase(), { weight: wt, role }));
        }
      });
    }
    return map;
  }, [strategy]);

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
    if (searchQuery === debouncedQuery) return;
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, debouncedQuery]);

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
    { id: 'ALL', label: 'All', count: coverageData?.total_instruments ?? coverageData?.instrumentCount },
    { id: 'STOCKS', label: 'Stocks', count: coverageData?.stocks_count ?? coverageData?.stockCount ?? coverageData?.by_asset_type?.STOCK },
    { id: 'ETFS', label: 'ETFs', count: coverageData?.etfs_count ?? coverageData?.etfCount ?? coverageData?.by_asset_type?.ETF },
    { id: 'MUTUAL_FUNDS', label: 'Mutual Funds', count: coverageData?.mutual_funds_count ?? coverageData?.mutualFundCount ?? coverageData?.by_asset_type?.MUTUAL_FUND },
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

  const totalResults = instrumentsData?.total ?? 0;
  const totalPages = instrumentsData?.totalPages ?? Math.max(1, Math.ceil(totalResults / limit));
  const startItem = totalResults === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalResults);

  return (
    <div className="space-y-8 pb-12 font-sans">
      
      {/* 1. MARKET TERMINAL HEADER & TELEMETRY */}
      <section className="financial-section-card p-5 sm:p-6 space-y-5">
        
        {/* Top Title & Quick Actions Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-[var(--color-accent-strong)]" />
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
                <span>Market Terminal</span>
                <span className="text-xs text-[var(--color-text-muted)] font-normal hidden sm:inline">· Institutional Workspace</span>
              </h1>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
              Discover, track, and research global stocks, ETFs, mutual fund schemes, and key benchmarks with institutional-grade data integrity.
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
              className="px-3.5 py-2 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:brightness-105 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
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
              className="px-3.5 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[var(--color-accent-strong)] ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* Dynamic Catalog & Coverage Status Bar */}
        {coverageData && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-1.5 text-[var(--color-text-primary)] font-semibold">
              <Database className="w-3.5 h-3.5 text-[var(--color-accent-strong)]" />
              <span>{Number(coverageData.total_instruments ?? coverageData.instrumentCount ?? 0).toLocaleString()} Instruments Universe</span>
            </div>
            <span className="text-[var(--color-text-muted)]">·</span>
            <div>
              <span>Stocks: </span>
              <strong className="text-[var(--color-text-primary)] font-mono">{Number(coverageData.stocks_count ?? coverageData.stockCount ?? coverageData.by_asset_type?.STOCK ?? 0).toLocaleString()}</strong>
            </div>
            <span className="text-[var(--color-text-muted)]">·</span>
            <div>
              <span>ETFs: </span>
              <strong className="text-[var(--color-text-primary)] font-mono">{Number(coverageData.etfs_count ?? coverageData.etfCount ?? coverageData.by_asset_type?.ETF ?? 0).toLocaleString()}</strong>
            </div>
            <span className="text-[var(--color-text-muted)]">·</span>
            <div>
              <span>Mutual Funds: </span>
              <strong className="text-[var(--color-text-primary)] font-mono">{Number(coverageData.mutual_funds_count ?? coverageData.mutualFundCount ?? coverageData.by_asset_type?.MUTUAL_FUND ?? 0).toLocaleString()}</strong>
            </div>
            <span className="text-[var(--color-text-muted)]">·</span>
            <div>
              <strong className="text-[var(--color-text-primary)] font-mono">{coverageData.exchanges_count ?? coverageData.exchangeCount ?? coverageData.exchanges?.length ?? 0} Exchanges</strong> ({coverageData.countries_count ?? coverageData.countryCount ?? coverageData.countries?.length ?? 0} Countries)
            </div>
            <span className="text-[var(--color-text-muted)]">·</span>
            <div className="flex items-center gap-1 text-[var(--color-text-secondary)]">
              <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
              <span>Synced {formatSyncTime(coverageData.last_synced_at ?? coverageData.lastSyncedAt)}</span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative pt-2">
          <style>{`
            .market-search-input,
            .market-search-input:focus,
            .market-search-input:active {
              color: var(--color-input-text) !important;
              -webkit-text-fill-color: var(--color-input-text) !important;
              caret-color: var(--color-accent) !important;
              opacity: 1 !important;
            }
            .market-search-input::placeholder {
              color: var(--color-input-placeholder) !important;
              -webkit-text-fill-color: var(--color-input-placeholder) !important;
            }
          `}</style>
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stocks, ETFs, mutual funds, ISIN, ticker (e.g. AAPL, AMD, RELIANCE, SPY, VOO, Nippon India, HDFC Flexi Cap)..."
            className="market-search-input w-full pl-10 pr-10 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-input-text)] caret-[var(--color-accent)] font-medium text-xs sm:text-sm focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-input-placeholder)] shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5 cursor-pointer"
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] font-bold'
                    : 'bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]'
                }`}
              >
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-normal ${
                    selectedCategory === cat.id ? 'bg-[var(--color-accent-text)]/20 text-[var(--color-accent-text)]' : 'bg-[var(--color-border)]/50 text-[var(--color-text-secondary)]'
                  }`}>
                    {cat.count.toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Secondary Dropdowns & Reset */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-lg px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">
              <Filter className="w-3 h-3 text-[var(--color-text-muted)]" />
              <select
                value={selectedExchange}
                onChange={(e) => handleExchangeChange(e.target.value)}
                className="bg-transparent text-[var(--color-text-primary)] font-medium text-xs focus:outline-none cursor-pointer"
                aria-label="Filter by exchange"
              >
                {exchanges.map((ex) => (
                  <option key={ex.code} value={ex.code} className="bg-[var(--color-card)] text-[var(--color-text-primary)]">{ex.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-lg px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">
              <Globe className="w-3 h-3 text-[var(--color-text-muted)]" />
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="bg-transparent text-[var(--color-text-primary)] font-medium text-xs focus:outline-none cursor-pointer"
                aria-label="Filter by country"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[var(--color-card)] text-[var(--color-text-primary)]">{c.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-lg px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="bg-transparent text-[var(--color-text-primary)] font-medium text-xs focus:outline-none cursor-pointer"
                aria-label="Filter by currency"
              >
                {currencies.map((cur) => (
                  <option key={cur.code} value={cur.code} className="bg-[var(--color-card)] text-[var(--color-text-primary)]">{cur.label}</option>
                ))}
              </select>
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. MARKET OVERVIEW SECTION (Key Benchmarks & Indices) */}
      {!isFiltered && overview && !error && (
        <section className="financial-section-card-interactive p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>Key Benchmarks & Global Indices</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>NSE: {overview?.india_status?.status || 'OPEN'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>NASDAQ: {overview?.us_status?.status || 'OPEN'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[var(--color-border-subtle)]">
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
                className="space-y-0.5 cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">{idx.symbol}</span>
                  <span className="text-[9.5px] uppercase px-1.5 py-0.2 rounded bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-mono">NSE</span>
                </div>
                <div className="text-base sm:text-xl font-bold text-[var(--color-text-primary)] font-mono">
                  ₹{idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 1 }) || '—'}
                </div>
                <div className={`text-xs font-mono font-semibold ${(idx.changePct ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
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
                className="space-y-0.5 cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">{idx.symbol}</span>
                  <span className="text-[9.5px] uppercase px-1.5 py-0.2 rounded bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-mono">NASDAQ</span>
                </div>
                <div className="text-base sm:text-xl font-bold text-[var(--color-text-primary)] font-mono">
                  ${idx.price?.toLocaleString('en-US', { maximumFractionDigits: 1 }) || '—'}
                </div>
                <div className={`text-xs font-mono font-semibold ${(idx.changePct ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
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
                className="space-y-0.5 cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">{idx.symbol}</span>
                  <span className="text-[9.5px] uppercase px-1.5 py-0.2 rounded bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-mono">MCX</span>
                </div>
                <div className="text-base sm:text-xl font-bold text-[var(--color-text-primary)] font-mono">
                  ₹{idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '—'}
                </div>
                <div className={`text-xs font-mono font-semibold ${(idx.changePct ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {(idx.changePct ?? 0) >= 0 ? '+' : ''}{idx.changePct?.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. DISCOVERY & INSTRUMENT CARDS GRID */}
      <section className="financial-section-card p-5 sm:p-6 space-y-4 min-w-0">
        
        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--color-accent)]" />
            <h2 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              {selectedCategory === 'WATCHLIST' 
                ? 'Saved Watchlist' 
                : debouncedQuery 
                ? `Search Results for "${debouncedQuery}"` 
                : 'Market Catalog'}
            </h2>
            {!error && !isLoading && (
              <span className="text-xs text-[var(--color-text-muted)] font-mono">
                ({totalResults.toLocaleString()} items)
              </span>
            )}
          </div>

          {!error && !isLoading && totalResults > 0 && (
            <span className="text-xs text-[var(--color-text-muted)]">
              Showing <strong className="text-[var(--color-text-primary)] font-mono">{startItem}–{endItem}</strong> of <strong className="text-[var(--color-text-primary)] font-mono">{totalResults.toLocaleString()}</strong>
            </span>
          )}
        </div>

        {/* Loading Skeleton Ledger */}
        {isLoading || isSearching ? (
          <div className="divide-y divide-[var(--color-border-subtle)] border-t border-b border-[var(--color-border-subtle)]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1.5 w-1/3">
                  <Skeleton variant="text" width="35%" height={16} />
                  <Skeleton variant="text" width="75%" height={12} />
                </div>
                <div className="w-1/4">
                  <Skeleton variant="text" width="50%" height={14} />
                </div>
                <div className="w-1/4 text-right space-y-1 flex flex-col items-end">
                  <Skeleton variant="text" width="45%" height={16} />
                  <Skeleton variant="text" width="25%" height={12} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-8 text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Market Directory Unavailable</h3>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">{error}</p>
            <button
              type="button"
              onClick={() => fetchInstruments()}
              className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-accent-text)] rounded-lg text-xs font-bold cursor-pointer hover:brightness-105"
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
          <>
          <div className="overflow-x-auto border-t border-b border-[var(--color-border-subtle)]">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3.5 font-semibold">Instrument & Identifier</th>
                  <th className="py-3 px-3 font-semibold">Asset Class</th>
                  <th className="py-3 px-3 font-semibold">Exchange</th>
                  <th className="py-3 px-3 font-semibold text-right">Price / NAV</th>
                  <th className="py-3 px-3 font-semibold text-right">24h Change</th>
                  <th className="py-3 px-3 font-semibold">Analytical Signal</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Watchlist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
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

                  const signal = item.signalBadge?.long_term_signal || item.signalBadge?.signal || item.signal || 'HOLD';
                  const isInsufficient = signal === 'INSUFFICIENT DATA';
                  const confidence = isInsufficient ? 0 : (item.signalBadge?.confidence ?? item.confidence ?? 75);

                  const symUpper = (item.symbol || '').toUpperCase();
                  const tickerUpper = (item.ticker || '').toUpperCase();
                  const nameUpper = (item.name || '').toUpperCase();
                  const isOwned = Boolean(userOwnedMap.has(symUpper) || userOwnedMap.has(tickerUpper) || userOwnedMap.has(nameUpper));
                  const ownedInfo = userOwnedMap.get(symUpper) || userOwnedMap.get(tickerUpper) || userOwnedMap.get(nameUpper);

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

                  return (
                    <tr
                      key={item.canonicalId}
                      onClick={() => handleOpenDetail(item)}
                      className="hover:bg-[var(--color-surface-soft)]/60 cursor-pointer transition-colors group"
                    >
                      {/* 1. Instrument / Identifier */}
                      <td className="py-3 px-3.5 max-w-[280px]">
                        <div className="flex items-center gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors font-mono text-xs sm:text-sm">
                                {item.symbol}
                              </span>
                              {isOwned && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30 font-semibold">
                                  Portfolio {ownedInfo?.weight ? `${ownedInfo.weight}%` : ''}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[var(--color-text-secondary)] truncate" title={item.name}>
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Asset Class */}
                      <td className="py-3 px-3">
                        <Badge 
                          variant={isMf ? 'purple' as any : isEtf ? 'blue' : 'teal'} 
                          size="sm"
                        >
                          {item.assetType.replace('_', ' ')}
                        </Badge>
                      </td>

                      {/* 3. Exchange & Country */}
                      <td className="py-3 px-3 font-mono text-xs text-[var(--color-text-secondary)]">
                        <span>{item.exchange}</span>
                        {item.country && <span className="text-[10px] text-[var(--color-text-muted)] ml-1">({item.country})</span>}
                      </td>

                      {/* 4. Price / NAV */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-xs sm:text-sm text-[var(--color-text-primary)]">
                        {isMf ? (
                          hasNav ? `₹${displayNav?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'
                        ) : (
                          hasPrice ? `${curr}${displayPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'
                        )}
                      </td>

                      {/* 5. 24h Change */}
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold">
                        {quote?.changePct !== null && quote?.changePct !== undefined ? (
                          <span className={isPos ? 'text-emerald-500' : 'text-rose-500'}>
                            {isPos ? '+' : ''}{quote.changePct.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">—</span>
                        )}
                      </td>

                      {/* 6. Analytical Signal */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide uppercase border ${getSignalColor(signal)}`}>
                            {signal}
                          </span>
                          {!isInsufficient && (
                            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                              {confidence}%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 7. Watchlist Action */}
                      <td className="py-3 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWatchlist(item.canonicalId);
                          }}
                          className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all inline-flex items-center justify-center ${
                            isWatchlisted
                              ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)]'
                              : 'bg-[var(--color-surface-soft)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                          }`}
                          aria-label={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                          title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          {isWatchlisted ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Compliance Disclaimer Banner */}
          <div className="mt-4 p-3 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-lg text-center text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            Market signals are quantitative analytical indicators based on price history, technical models, and fundamental data. They do not constitute financial advice.
          </div>
        </>
        )}

        {/* 4. SERVER-SIDE PAGINATION CONTROLS */}
        {!error && !isLoading && totalPages > 1 && selectedCategory !== 'WATCHLIST' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--color-border)] text-xs">
            <span className="text-[var(--color-text-secondary)]">
              Showing page <strong className="text-[var(--color-text-primary)] font-mono">{page}</strong> of <strong className="text-[var(--color-text-primary)] font-mono">{totalPages}</strong> ({totalResults.toLocaleString()} items)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-colors"
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
                          ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)]'
                          : 'bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)]'
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
                className="px-3.5 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

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
