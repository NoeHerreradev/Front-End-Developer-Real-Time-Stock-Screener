"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useStocksQuery } from "@/hooks/useStocksQuery";
import { useStockStore } from "@/store/useStockStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { evaluateFilterEngine, ExtendedFilterCriteria, ScreenerPreset } from "@/lib/filter-engine";
import { StockTable } from "@/components/screener/StockTable";
import { StockDetailDrawer } from "@/components/screener/StockDetailDrawer";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { LazyTradingViewChart } from "@/components/charts/LazyTradingViewChart";
import {
  saveUniverseToIDB,
  loadUniverseFromIDB,
  saveWatchlistToIDB,
  loadWatchlistFromIDB,
} from "@/lib/indexed-db";
import { Stock, SortableField } from "@/types/stock";
import {
  TrendingUp,
  Activity,
  Layers,
  Zap,
  BarChart3,
  Search,
  Star,
  RefreshCw,
  LineChart,
  HardDrive,
  Wifi,
  WifiOff,
} from "lucide-react";
import { formatMarketCap } from "@/lib/formatters";

export default function ScreenerPage() {
  const { data: initialStocks, isLoading, error } = useStocksQuery();
  const stocks = useStockStore((state) => state.stocks);
  const setStocks = useStockStore((state) => state.setStocks);
  const applyTickDeltas = useStockStore((state) => state.applyTickDeltas);
  const isStreaming = useStockStore((state) => state.isStreaming);
  const setIsStreaming = useStockStore((state) => state.setIsStreaming);
  const watchlist = useStockStore((state) => state.watchlist);
  const toggleWatchlist = useStockStore((state) => state.toggleWatchlist);
  const sort = useStockStore((state) => state.sort);
  const setSort = useStockStore((state) => state.setSort);

  // IndexedDB State & Network Status
  const [idbHydrated, setIdbHydrated] = useState(false);
  const [idbSyncTime, setIdbSyncTime] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const streamFrequency = 30; // 30 Hz target streaming throughput

  // UI State
  const [criteria, setCriteria] = useState<ExtendedFilterCriteria>({
    searchQuery: "",
    sectors: [],
    exchanges: [],
    marketCapCategories: [],
    technicalSignals: [],
    onlyWatchlist: false,
  });
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [inspectedStock, setInspectedStock] = useState<Stock | null>(null);
  const [isChartVisible, setIsChartVisible] = useState(true);

  // 1. Offline & IndexedDB Initial Hydration
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Hydrate from IndexedDB first for instantaneous offline launch
    loadUniverseFromIDB().then(({ stocks: cachedStocks, lastSync }) => {
      if (cachedStocks.length > 0 && stocks.length === 0) {
        setStocks(cachedStocks);
        setIdbSyncTime(lastSync);
        setIdbHydrated(true);
      }
    });

    loadWatchlistFromIDB().then((cachedWatchlist) => {
      if (cachedWatchlist && cachedWatchlist.length > 0) {
        for (const ticker of cachedWatchlist) {
          if (!watchlist.includes(ticker)) {
            toggleWatchlist(ticker);
          }
        }
      }
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 2. Sync React Query data into Zustand and persist to IndexedDB
  useEffect(() => {
    if (initialStocks && initialStocks.length > 0) {
      setStocks(initialStocks);
      saveUniverseToIDB(initialStocks).then((success) => {
        if (success) {
          setIdbSyncTime(Date.now());
          setIdbHydrated(true);
        }
      });
    }
  }, [initialStocks, setStocks]);

  // 3. Persist Watchlist changes to IndexedDB
  useEffect(() => {
    if (watchlist.length > 0) {
      saveWatchlistToIDB(watchlist);
    }
  }, [watchlist]);

  // 4. WebSocket Feed using Geometric Brownian Motion + requestAnimationFrame Batching
  const handleBatchTicks = useCallback(
    (deltas: any[]) => {
      applyTickDeltas(deltas);
    },
    [applyTickDeltas]
  );

  const {
    status: wsStatus,
    ticksPerSecond,
    rAFFramesCount,
  } = useWebSocket({
    universe: stocks,
    enabled: isStreaming,
    frequencyHz: streamFrequency,
    batchSize: 30,
    onBatchTicks: handleBatchTicks,
  });

  // Keep inspected and selected stock in sync with live ticks
  const activeInspectedStock = useMemo(() => {
    if (!inspectedStock) return null;
    return stocks.find((s) => s.ticker === inspectedStock.ticker) || inspectedStock;
  }, [inspectedStock, stocks]);

  const activeSelectedStock = useMemo(() => {
    if (!selectedStock) {
      return stocks[0] || null;
    }
    return stocks.find((s) => s.ticker === selectedStock.ticker) || selectedStock;
  }, [selectedStock, stocks]);

  // 5. Execute 30+ Criteria Filter Engine (<15ms)
  const filterResult = useMemo(() => {
    const fullCriteria: ExtendedFilterCriteria = {
      ...criteria,
      watchlistTickers: watchlist,
    };
    return evaluateFilterEngine(stocks, fullCriteria);
  }, [stocks, criteria, watchlist]);

  // 6. Sort Filtered Results
  const sortedStocks = useMemo(() => {
    const list = [...filterResult.stocks];
    const { field, direction } = sort;
    const factor = direction === "asc" ? 1 : -1;

    list.sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "string" && typeof valB === "string") {
        return valA.localeCompare(valB) * factor;
      }
      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * factor;
      }
      return 0;
    });

    return list;
  }, [filterResult.stocks, sort]);

  // Handle Preset Selection
  const handleApplyPreset = useCallback((preset: ScreenerPreset) => {
    setActivePresetId(preset.id);
    setCriteria((prev) => ({
      searchQuery: prev.searchQuery,
      onlyWatchlist: prev.onlyWatchlist,
      ...preset.criteria,
    }));
  }, []);

  // Handle Filter Reset
  const handleResetFilters = useCallback(() => {
    setActivePresetId(null);
    setCriteria({
      searchQuery: "",
      sectors: [],
      exchanges: [],
      marketCapCategories: [],
      technicalSignals: [],
      onlyWatchlist: false,
    });
  }, []);

  // Market Breadth Statistics
  const marketStats = useMemo(() => {
    if (stocks.length === 0) return { totalCap: 0, gainers: 0, losers: 0, avgRsi: 0 };
    let totalCap = 0;
    let gainers = 0;
    let losers = 0;
    let sumRsi = 0;

    for (const s of stocks) {
      totalCap += s.marketCap;
      if (s.changePercent >= 0) gainers++;
      else losers++;
      sumRsi += s.rsi14;
    }

    return {
      totalCap,
      gainers,
      losers,
      avgRsi: Math.round((sumRsi / stocks.length) * 10) / 10,
    };
  }, [stocks]);

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 p-4 lg:p-7 font-sans flex flex-col">
      <div className="max-w-[1750px] w-full mx-auto space-y-5 flex-1 flex flex-col">
        {/* Header Title & Streaming Controls */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
              <BarChart3 className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                Real-Time Stock Screener
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Institutional Multi-Asset Platform
                </span>
              </h1>
              <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                GBM Stochastic Feed • requestAnimationFrame Batching • Celdas Memoizadas (300ms Flash) • Persistencia IndexedDB
              </p>
            </div>
          </div>

          {/* WebSockets Status, IndexedDB Status & Controls */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
            {/* Online / Offline Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono border ${
                isOnline
                  ? "bg-slate-900 border-slate-800 text-slate-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}
            >
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{isOnline ? "Online" : "Offline (IndexedDB)"}</span>
            </div>

            {/* IndexedDB Cache Indicator */}
            {idbHydrated && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
                title={`Sincronizado en IndexedDB: ${idbSyncTime ? new Date(idbSyncTime).toLocaleTimeString() : "OK"}`}
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                <span>IndexedDB Activo</span>
              </div>
            )}

            {/* Chart Toggle */}
            <button
              onClick={() => setIsChartVisible(!isChartVisible)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                isChartVisible
                  ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>{isChartVisible ? "Ocultar Gráfico" : "Mostrar Gráfico"}</span>
            </button>

            {/* WebSocket Stream Throughput HUD */}
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  wsStatus === "OPEN"
                    ? "bg-emerald-400 animate-ping"
                    : "bg-slate-600"
                }`}
              />
              <span>{ticksPerSecond} ticks/s</span>
              <span className="text-slate-600">|</span>
              <span className="text-blue-400">rAF: {rAFFramesCount}</span>
            </div>

            {/* Streaming Toggle Button */}
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold font-mono transition-all ${
                isStreaming
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isStreaming ? "fill-emerald-400 animate-pulse" : ""}`} />
              {isStreaming ? "Feed GBM Activo" : "Feed Pausado"}
            </button>
          </div>
        </header>

        {/* Market KPI Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/90 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Universo Evaluado</span>
              <Layers className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {isLoading && !idbHydrated ? "Cargando..." : `${stocks.length.toLocaleString()} Acciones`}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Filtradas: <span className="text-emerald-400 font-mono font-bold">{filterResult.totalMatched.toLocaleString()}</span> ({((filterResult.totalMatched / (stocks.length || 1)) * 100).toFixed(1)}%)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/90 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Cap. Total Mercado</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {formatMarketCap(marketStats.totalCap)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Promedio RSI: <span className="text-slate-200 font-mono">{marketStats.avgRsi}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/90 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Amplitud (24h)</span>
              <Activity className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-bold font-mono flex items-center gap-2">
              <span className="text-emerald-400">▲ {marketStats.gainers}</span>
              <span className="text-slate-600">/</span>
              <span className="text-rose-400">▼ {marketStats.losers}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Ratio Bull/Bear: <span className="text-slate-200 font-mono">{(marketStats.gainers / (marketStats.losers || 1)).toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/90 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Mi Watchlist</span>
              <Star className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-300 font-mono">
              {watchlist.length} Acciones
            </div>
            <button
              onClick={() =>
                setCriteria((prev) => ({ ...prev, onlyWatchlist: !prev.onlyWatchlist }))
              }
              className="text-[11px] text-amber-400 hover:text-amber-300 underline mt-1 text-left"
            >
              {criteria.onlyWatchlist ? "Ver todo el universo" : "Filtrar solo mi Watchlist"}
            </button>
          </div>
        </div>

        {/* Live Connected TradingView Chart for Selected Grid Stock */}
        {isChartVisible && activeSelectedStock && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <LazyTradingViewChart
              stock={activeSelectedStock}
              height={380}
              showRSI={true}
            />
          </div>
        )}

        {/* Quick Search & Filter Controls Bar */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3.5 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por símbolo o empresa..."
                value={criteria.searchQuery || ""}
                onChange={(e) =>
                  setCriteria((prev) => ({ ...prev, searchQuery: e.target.value }))
                }
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
              />
            </div>

            {/* Watchlist Quick Toggle Button */}
            <button
              onClick={() =>
                setCriteria((prev) => ({ ...prev, onlyWatchlist: !prev.onlyWatchlist }))
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors shrink-0 ${
                criteria.onlyWatchlist
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${criteria.onlyWatchlist ? "fill-amber-400 text-amber-400" : ""}`} />
              Watchlist ({watchlist.length})
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono shrink-0">
            Mostrando <span className="text-white font-bold">{sortedStocks.length.toLocaleString()}</span> resultados
          </div>
        </div>

        {/* Advanced Filter Engine Panel (30+ Criteria) */}
        <FilterPanel
          criteria={criteria}
          onUpdateCriteria={setCriteria}
          onResetAll={handleResetFilters}
          onApplyPreset={handleApplyPreset}
          activePresetId={activePresetId}
          totalMatched={filterResult.totalMatched}
          totalEvaluated={filterResult.totalEvaluated}
          executionTimeMs={filterResult.executionTimeMs}
        />

        {/* Virtualized High-Density Grid */}
        <div className="flex-1 min-h-[480px]">
          {isLoading && !idbHydrated ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 border border-slate-800 rounded-xl bg-slate-900/40 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-sm font-mono">Generando y evaluando universo de 5,000+ acciones...</span>
            </div>
          ) : error && stocks.length === 0 ? (
            <div className="h-96 flex items-center justify-center border border-rose-900/40 rounded-xl bg-rose-950/20 text-rose-400">
              Error al cargar datos del screener: {error.message}
            </div>
          ) : (
            <StockTable
              stocks={sortedStocks}
              watchlist={watchlist}
              selectedTicker={activeSelectedStock?.ticker}
              onSelectStock={(stk) => setSelectedStock(stk)}
              onToggleWatchlist={toggleWatchlist}
              onInspectStock={(stk) => setInspectedStock(stk)}
              sortField={sort.field}
              sortDirection={sort.direction}
              onSortChange={(field: SortableField) => setSort(field)}
            />
          )}
        </div>
      </div>

      {/* Stock Detailed Inspector Drawer */}
      <StockDetailDrawer
        stock={activeInspectedStock}
        isOpen={!!activeInspectedStock}
        onClose={() => setInspectedStock(null)}
        isWatchlisted={
          activeInspectedStock ? watchlist.includes(activeInspectedStock.ticker) : false
        }
        onToggleWatchlist={toggleWatchlist}
      />
    </main>
  );
}
