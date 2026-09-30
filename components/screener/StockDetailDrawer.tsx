"use client";

import { Stock } from "@/types/stock";
import {
  formatPrice,
  formatPercent,
  formatMarketCap,
  formatVolume,
  formatRatio,
} from "@/lib/formatters";
import { LazyTradingViewChart } from "@/components/charts/LazyTradingViewChart";
import {
  X,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  DollarSign,
  BarChart3,
} from "lucide-react";

interface StockDetailDrawerProps {
  stock: Stock | null;
  isOpen: boolean;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (ticker: string) => void;
}

export function StockDetailDrawer({
  stock,
  isOpen,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
}: StockDetailDrawerProps) {
  if (!isOpen || !stock) return null;

  const isPositive = stock.change >= 0;
  const fiftyTwoWeekRangeProgress = Math.min(
    100,
    Math.max(
      0,
      ((stock.price - stock.fiftyTwoWeekLow) /
        (stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow || 1)) *
        100
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-[#0d1322] border-l border-slate-800 h-full shadow-2xl flex flex-col text-slate-100 overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/60">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                {stock.ticker}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {stock.exchange}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                {stock.marketCapCategory} Cap
              </span>
            </div>
            <h2 className="text-base text-slate-300 font-medium">{stock.name}</h2>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>{stock.sector}</span>
              <span>•</span>
              <span>{stock.industry}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatchlist(stock.ticker)}
              className={`p-2 rounded-lg border transition-all ${
                isWatchlisted
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
              }`}
              title={isWatchlisted ? "Remover de watchlist (Espacio)" : "Agregar a watchlist (Espacio)"}
            >
              <Star className={`w-5 h-5 ${isWatchlisted ? "fill-amber-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Price Hero */}
        <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-800/80 flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold font-mono text-white">
              {formatPrice(stock.price)}
            </span>
            <div
              className={`flex items-center gap-1 font-mono text-sm font-semibold ${
                isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{formatPercent(stock.changePercent)}</span>
              <span className="text-xs">(${stock.change.toFixed(2)})</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            VWAP: <span className="text-slate-200">${stock.volumeWeightedAveragePrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* TradingView Lightweight Chart View */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Gráfico de Velas & Indicadores Técnicos</span>
            </div>
            <LazyTradingViewChart stock={stock} height={360} showRSI={true} />
          </div>

          {/* 52-Week Range Bar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>52W Low: ${stock.fiftyTwoWeekLow.toFixed(2)}</span>
              <span className="text-slate-300 font-semibold">Rango de 52 Semanas</span>
              <span>52W High: ${stock.fiftyTwoWeekHigh.toFixed(2)}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
                style={{ width: `${fiftyTwoWeekRangeProgress}%` }}
              />
            </div>
          </div>

          {/* Key Fundamentals Grid */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span>Valoración & Fundamentales</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Cap. Bursátil</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {formatMarketCap(stock.marketCap)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">P/E Ratio (TTM)</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {formatRatio(stock.peRatio)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Forward P/E</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {formatRatio(stock.forwardPE)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">PEG Ratio</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {formatRatio(stock.pegRatio)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Price to Book (P/B)</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {formatRatio(stock.priceToBook)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Dividend Yield</div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  {stock.dividendYield > 0 ? `${stock.dividendYield.toFixed(2)}%` : "0.00%"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">EPS (TTM)</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  ${stock.eps.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">ROE (Retorno s/ Cap)</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {stock.roe.toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Deuda / Capital</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {stock.debtToEquity.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Indicadores Técnicos & Momentum</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">RSI (14)</div>
                <div className="text-sm font-bold font-mono mt-0.5">
                  <span
                    className={
                      stock.rsi14 > 70
                        ? "text-rose-400"
                        : stock.rsi14 < 30
                        ? "text-emerald-400"
                        : "text-white"
                    }
                  >
                    {stock.rsi14.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Beta (5Y Mensual)</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {stock.beta.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Volumen Relativo (RVol)</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {stock.relativeVolume.toFixed(2)}x
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">SMA (50)</div>
                <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                  ${stock.sma50.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">SMA (200)</div>
                <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                  ${stock.sma200.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Señal Técnica</div>
                <div className="text-sm font-bold font-mono text-blue-400 mt-0.5">
                  {stock.technicalSummary}
                </div>
              </div>
            </div>
          </div>

          {/* Liquidity & Order Book Summary */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Liquidez & Libro de Órdenes</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Bid (Size)</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    ${stock.bid.toFixed(2)} ({stock.bidSize})
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Ask (Size)</span>
                  <span className="font-mono text-rose-400 font-semibold">
                    ${stock.ask.toFixed(2)} ({stock.askSize})
                  </span>
                </div>
                <div className="flex justify-between text-xs border-t border-slate-800 pt-1">
                  <span className="text-slate-400">Spread</span>
                  <span className="font-mono text-slate-300">${stock.spread.toFixed(2)}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Volumen</span>
                  <span className="font-mono text-white font-semibold">
                    {formatVolume(stock.volume)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Promedio 3M</span>
                  <span className="font-mono text-slate-300">
                    {formatVolume(stock.avgVolume3Month)}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-t border-slate-800 pt-1">
                  <span className="text-slate-400">Short Float</span>
                  <span className="font-mono text-slate-300">{stock.shortInterestPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400 flex items-center justify-between font-mono">
          <div className="flex items-center gap-4">
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Espacio</kbd> Watchlist</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Esc</kbd> Cerrar</span>
          </div>
          <span className="text-[11px] text-slate-500">Tick: {new Date(stock.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
