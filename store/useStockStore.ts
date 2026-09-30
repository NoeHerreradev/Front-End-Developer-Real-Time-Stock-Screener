/**
 * STATE STORE: ZUSTAND + IMMER
 * High-performance state management for Stock Screener filters, real-time deltas,
 * sorting, active views, and watchlist management.
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  Exchange,
  MarketCapCategory,
  NumericRange,
  ScreenerFilterState,
  Sector,
  SortConfig,
  Stock,
  StockTickDelta,
  TechnicalSignal,
} from "@/types/stock";

interface StockStoreState {
  // Data
  stocks: Stock[];
  stockMap: Record<string, Stock>; // O(1) ticker lookup
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;

  // Real-time Streaming State
  isStreaming: boolean;
  tickFrequencyMs: number;
  recentTicksCount: number;

  // Watchlist & Selection
  watchlist: string[]; // array of tickers
  selectedTicker: string | null;

  // Screener Filter State
  filters: ScreenerFilterState;

  // Sorting
  sort: SortConfig;

  // UI / View State
  viewMode: "table" | "grid" | "heatmap";
  density: "compact" | "comfortable";
}

interface StockStoreActions {
  // Data initialization & Delta updates
  setStocks: (stocks: Stock[]) => void;
  applyTickDeltas: (deltas: StockTickDelta[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Real-time streaming toggle
  setIsStreaming: (isStreaming: boolean) => void;
  setTickFrequencyMs: (ms: number) => void;

  // Filter mutations (using Immer for zero-overhead deep mutative syntax)
  setSearchQuery: (query: string) => void;
  toggleSector: (sector: Sector) => void;
  setSectors: (sectors: Sector[]) => void;
  toggleExchange: (exchange: Exchange) => void;
  toggleMarketCapCategory: (category: MarketCapCategory) => void;
  setNumericRange: (
    key: keyof Omit<
      ScreenerFilterState,
      "searchQuery" | "sectors" | "exchanges" | "marketCapCategories" | "technicalSignal"
    >,
    range: Partial<NumericRange>
  ) => void;
  setTechnicalSignal: (signal: TechnicalSignal | "All") => void;
  resetFilters: () => void;

  // Sort mutations
  setSort: (field: SortConfig["field"]) => void;
  setSortConfig: (config: SortConfig) => void;

  // Watchlist & Selection
  toggleWatchlist: (ticker: string) => void;
  setSelectedTicker: (ticker: string | null) => void;

  // UI preferences
  setViewMode: (mode: "table" | "grid" | "heatmap") => void;
  setDensity: (density: "compact" | "comfortable") => void;
}

export const initialFilterState: ScreenerFilterState = {
  searchQuery: "",
  sectors: [],
  exchanges: [],
  marketCapCategories: [],
  price: { min: null, max: null },
  marketCap: { min: null, max: null },
  peRatio: { min: null, max: null },
  dividendYield: { min: null, max: null },
  volume: { min: null, max: null },
  relativeVolume: { min: null, max: null },
  rsi14: { min: null, max: null },
  beta: { min: null, max: null },
  changePercent: { min: null, max: null },
  shortInterestPercent: { min: null, max: null },
  distanceFrom52wHigh: { min: null, max: null },
  distanceFrom52wLow: { min: null, max: null },
  technicalSignal: "All",
};

export const useStockStore = create<StockStoreState & StockStoreActions>()(
  immer((set) => ({
    // Initial State
    stocks: [],
    stockMap: {},
    isLoading: false,
    error: null,
    lastUpdated: null,
    isStreaming: true,
    tickFrequencyMs: 1000,
    recentTicksCount: 0,
    watchlist: ["AAPL", "NVDA", "MSFT", "TSLA", "META"],
    selectedTicker: null,
    filters: initialFilterState,
    sort: {
      field: "marketCap",
      direction: "desc",
    },
    viewMode: "table",
    density: "comfortable",

    // Actions
    setStocks: (stocks) =>
      set((state) => {
        state.stocks = stocks;
        const map: Record<string, Stock> = {};
        for (const stock of stocks) {
          map[stock.ticker] = stock;
        }
        state.stockMap = map;
        state.lastUpdated = Date.now();
        state.isLoading = false;
        state.error = null;
      }),

    applyTickDeltas: (deltas) =>
      set((state) => {
        const now = Date.now();
        for (const delta of deltas) {
          const stock = state.stockMap[delta.ticker];
          if (stock) {
            stock.price = delta.price;
            stock.change = delta.change;
            stock.changePercent = delta.changePercent;
            stock.volume = delta.volume;
            stock.dayHigh = delta.dayHigh;
            stock.dayLow = delta.dayLow;
            stock.bid = delta.bid;
            stock.ask = delta.ask;
            stock.rsi14 = delta.rsi14;
            stock.lastUpdated = delta.timestamp;

            // Update latest sparkline point or append
            if (stock.sparkline.length > 0) {
              const lastPoint = stock.sparkline[stock.sparkline.length - 1];
              if (lastPoint && now - lastPoint.time < 30000) {
                lastPoint.price = delta.price;
              } else {
                stock.sparkline.push({ time: now, price: delta.price });
                if (stock.sparkline.length > 25) {
                  stock.sparkline.shift();
                }
              }
            }
          }
        }
        state.recentTicksCount += deltas.length;
        state.lastUpdated = now;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
        state.isLoading = false;
      }),

    setIsStreaming: (isStreaming) =>
      set((state) => {
        state.isStreaming = isStreaming;
      }),

    setTickFrequencyMs: (ms) =>
      set((state) => {
        state.tickFrequencyMs = ms;
      }),

    setSearchQuery: (query) =>
      set((state) => {
        state.filters.searchQuery = query;
      }),

    toggleSector: (sector) =>
      set((state) => {
        const idx = state.filters.sectors.indexOf(sector);
        if (idx >= 0) {
          state.filters.sectors.splice(idx, 1);
        } else {
          state.filters.sectors.push(sector);
        }
      }),

    setSectors: (sectors) =>
      set((state) => {
        state.filters.sectors = sectors;
      }),

    toggleExchange: (exchange) =>
      set((state) => {
        const idx = state.filters.exchanges.indexOf(exchange);
        if (idx >= 0) {
          state.filters.exchanges.splice(idx, 1);
        } else {
          state.filters.exchanges.push(exchange);
        }
      }),

    toggleMarketCapCategory: (category) =>
      set((state) => {
        const idx = state.filters.marketCapCategories.indexOf(category);
        if (idx >= 0) {
          state.filters.marketCapCategories.splice(idx, 1);
        } else {
          state.filters.marketCapCategories.push(category);
        }
      }),

    setNumericRange: (key, range) =>
      set((state) => {
        state.filters[key] = {
          ...state.filters[key],
          ...range,
        };
      }),

    setTechnicalSignal: (signal) =>
      set((state) => {
        state.filters.technicalSignal = signal;
      }),

    resetFilters: () =>
      set((state) => {
        state.filters = initialFilterState;
      }),

    setSort: (field) =>
      set((state) => {
        if (state.sort.field === field) {
          state.sort.direction = state.sort.direction === "asc" ? "desc" : "asc";
        } else {
          state.sort.field = field;
          // Default to descending for numeric financial metrics, ascending for strings
          state.sort.direction = field === "ticker" || field === "name" || field === "sector" ? "asc" : "desc";
        }
      }),

    setSortConfig: (config) =>
      set((state) => {
        state.sort = config;
      }),

    toggleWatchlist: (ticker) =>
      set((state) => {
        const idx = state.watchlist.indexOf(ticker);
        if (idx >= 0) {
          state.watchlist.splice(idx, 1);
        } else {
          state.watchlist.push(ticker);
        }
      }),

    setSelectedTicker: (ticker) =>
      set((state) => {
        state.selectedTicker = ticker;
      }),

    setViewMode: (mode) =>
      set((state) => {
        state.viewMode = mode;
      }),

    setDensity: (density) =>
      set((state) => {
        state.density = density;
      }),
  }))
);
