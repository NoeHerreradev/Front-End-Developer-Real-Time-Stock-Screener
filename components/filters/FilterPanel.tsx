"use client";

import React, { useState } from "react";
import {
  Exchange,
  MarketCapCategory,
  NumericRange,
  Sector,
  TechnicalSignal,
} from "@/types/stock";
import { ExtendedFilterCriteria, ScreenerPreset } from "@/lib/filter-engine";
import { DualRangeSlider } from "./DualRangeSlider";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import { PresetSelector } from "./PresetSelector";
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Activity,
  BarChart2,
  PieChart,
} from "lucide-react";

interface FilterPanelProps {
  criteria: ExtendedFilterCriteria;
  onUpdateCriteria: (updater: (prev: ExtendedFilterCriteria) => ExtendedFilterCriteria) => void;
  onResetAll: () => void;
  onApplyPreset: (preset: ScreenerPreset) => void;
  activePresetId: string | null;
  totalMatched: number;
  totalEvaluated: number;
  executionTimeMs: number;
}

const ALL_SECTORS: Sector[] = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Consumer Cyclical",
  "Communication Services",
  "Industrials",
  "Consumer Defensive",
  "Energy",
  "Real Estate",
  "Basic Materials",
  "Utilities",
];

const ALL_EXCHANGES: Exchange[] = ["NASDAQ", "NYSE", "AMEX", "CBOE", "BATS"];

const ALL_CAPS: MarketCapCategory[] = ["Mega", "Large", "Mid", "Small", "Micro", "Nano"];

const ALL_SIGNALS: TechnicalSignal[] = [
  "Strong Buy",
  "Buy",
  "Neutral",
  "Sell",
  "Strong Sell",
];

export function FilterPanel({
  criteria,
  onUpdateCriteria,
  onResetAll,
  onApplyPreset,
  activePresetId,
  totalMatched,
  totalEvaluated,
  executionTimeMs,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"market" | "valuation" | "technical" | "financial">("valuation");

  // Helper to mutate numerical range
  const updateRange = (
    key: keyof ExtendedFilterCriteria,
    range: NumericRange
  ) => {
    onUpdateCriteria((prev) => ({
      ...prev,
      [key]: range,
    }));
  };

  // Calculate total number of active criteria filters
  const activeFilterCount = Object.entries(criteria).reduce((acc, [key, val]) => {
    if (!val) return acc;
    if (key === "searchQuery" && val === "") return acc;
    if (key === "onlyWatchlist" && !val) return acc;
    if (Array.isArray(val) && val.length === 0) return acc;
    if (typeof val === "object" && "min" in val && "max" in val) {
      if (val.min !== null || val.max !== null) return acc + 1;
      return acc;
    }
    return acc + 1;
  }, 0);

  return (
    <div className="rounded-xl bg-[#0d1322] border border-slate-800 shadow-xl overflow-hidden transition-all">
      {/* Top Header Bar */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 hover:bg-blue-600/25 transition-all text-xs font-semibold font-mono"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros Avanzados (30+ Métricas)</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500 text-slate-950 font-bold text-[10px]">
                {activeFilterCount}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Execution Time Benchmark Badge */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              Coincidencias: <strong className="text-white">{totalMatched.toLocaleString()}</strong> / {totalEvaluated.toLocaleString()}
            </span>
            <span
              className={`px-2 py-1 rounded-md text-[11px] font-mono border ${
                executionTimeMs < 50
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
              title="Tiempo de ejecución del motor de filtros sobre 5,000+ acciones"
            >
              ⚡ {executionTimeMs.toFixed(1)}ms
            </span>
          </div>
        </div>

        {/* Presets and Clear Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <PresetSelector
            activePresetId={activePresetId}
            onSelectPreset={onApplyPreset}
            onClearPreset={onResetAll}
          />

          {activeFilterCount > 0 && (
            <button
              onClick={onResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all font-mono shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Full Filter Dashboard */}
      {isExpanded && (
        <div className="p-5 space-y-5 bg-[#0b101c] animate-in fade-in duration-200">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveTab("valuation")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "valuation"
                  ? "bg-blue-600 text-white font-semibold shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>1. Valoración & Ratios</span>
            </button>
            <button
              onClick={() => setActiveTab("technical")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "technical"
                  ? "bg-blue-600 text-white font-semibold shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>2. Indicadores Técnicos</span>
            </button>
            <button
              onClick={() => setActiveTab("financial")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "financial"
                  ? "bg-blue-600 text-white font-semibold shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>3. Crecimiento & Salud Financiera</span>
            </button>
            <button
              onClick={() => setActiveTab("market")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "market"
                  ? "bg-blue-600 text-white font-semibold shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>4. Mercado & Liquidez</span>
            </button>
          </div>

          {/* Tab 1: Valuation & Multiples */}
          {activeTab === "valuation" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
              <DualRangeSlider
                label="P/E Ratio (TTM)"
                minLimit={1}
                maxLimit={120}
                step={0.5}
                value={criteria.peRatio || { min: null, max: null }}
                onChange={(r) => updateRange("peRatio", r)}
              />
              <DualRangeSlider
                label="Forward P/E"
                minLimit={1}
                maxLimit={100}
                step={0.5}
                value={criteria.forwardPE || { min: null, max: null }}
                onChange={(r) => updateRange("forwardPE", r)}
              />
              <DualRangeSlider
                label="PEG Ratio"
                minLimit={0.1}
                maxLimit={5.0}
                step={0.1}
                value={criteria.pegRatio || { min: null, max: null }}
                onChange={(r) => updateRange("pegRatio", r)}
              />
              <DualRangeSlider
                label="Price / Book (P/B)"
                minLimit={0.1}
                maxLimit={25.0}
                step={0.1}
                value={criteria.priceToBook || { min: null, max: null }}
                onChange={(r) => updateRange("priceToBook", r)}
              />
              <DualRangeSlider
                label="Dividend Yield (%)"
                minLimit={0}
                maxLimit={12}
                step={0.1}
                unit="%"
                value={criteria.dividendYield || { min: null, max: null }}
                onChange={(r) => updateRange("dividendYield", r)}
              />
              <DualRangeSlider
                label="Price / Sales (P/S)"
                minLimit={0.1}
                maxLimit={25.0}
                step={0.1}
                value={criteria.priceToSales || { min: null, max: null }}
                onChange={(r) => updateRange("priceToSales", r)}
              />
              <DualRangeSlider
                label="EV / EBITDA"
                minLimit={2}
                maxLimit={60}
                step={0.5}
                value={criteria.evToEbitda || { min: null, max: null }}
                onChange={(r) => updateRange("evToEbitda", r)}
              />
              <DualRangeSlider
                label="Payout Ratio (%)"
                minLimit={0}
                maxLimit={100}
                step={1}
                unit="%"
                value={criteria.payoutRatio || { min: null, max: null }}
                onChange={(r) => updateRange("payoutRatio", r)}
              />
            </div>
          )}

          {/* Tab 2: Technical Indicators */}
          {activeTab === "technical" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
              <DualRangeSlider
                label="RSI (14 Días)"
                minLimit={0}
                maxLimit={100}
                step={1}
                value={criteria.rsi14 || { min: null, max: null }}
                onChange={(r) => updateRange("rsi14", r)}
              />
              <DualRangeSlider
                label="Beta (5Y Mensual)"
                minLimit={0.1}
                maxLimit={3.5}
                step={0.05}
                value={criteria.beta || { min: null, max: null }}
                onChange={(r) => updateRange("beta", r)}
              />
              <DualRangeSlider
                label="Dist. 52W High (%)"
                minLimit={-60}
                maxLimit={0}
                step={0.5}
                unit="%"
                value={criteria.distanceFrom52wHigh || { min: null, max: null }}
                onChange={(r) => updateRange("distanceFrom52wHigh", r)}
              />
              <DualRangeSlider
                label="Dist. 52W Low (%)"
                minLimit={0}
                maxLimit={120}
                step={1}
                unit="%"
                value={criteria.distanceFrom52wLow || { min: null, max: null }}
                onChange={(r) => updateRange("distanceFrom52wLow", r)}
              />
              <DualRangeSlider
                label="Interés Corto / Float (%)"
                minLimit={0}
                maxLimit={30}
                step={0.5}
                unit="%"
                value={criteria.shortInterestPercent || { min: null, max: null }}
                onChange={(r) => updateRange("shortInterestPercent", r)}
              />
              <DualRangeSlider
                label="Volatilidad 30D (%)"
                minLimit={10}
                maxLimit={100}
                step={1}
                unit="%"
                value={criteria.volatility30d || { min: null, max: null }}
                onChange={(r) => updateRange("volatility30d", r)}
              />
              <MultiSelectDropdown
                label="Señal Técnica"
                options={ALL_SIGNALS.map((s) => ({ value: s, label: s }))}
                selected={criteria.technicalSignals || []}
                onChange={(signals) =>
                  onUpdateCriteria((prev) => ({ ...prev, technicalSignals: signals }))
                }
                placeholder="Todas las señales"
              />
            </div>
          )}

          {/* Tab 3: Growth & Financial Health */}
          {activeTab === "financial" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
              <DualRangeSlider
                label="Crecimiento Ingresos YoY (%)"
                minLimit={-20}
                maxLimit={100}
                step={1}
                unit="%"
                value={criteria.revenueGrowthYoY || { min: null, max: null }}
                onChange={(r) => updateRange("revenueGrowthYoY", r)}
              />
              <DualRangeSlider
                label="Crecimiento EPS 5Y (%)"
                minLimit={-20}
                maxLimit={60}
                step={1}
                unit="%"
                value={criteria.epsGrowth5Y || { min: null, max: null }}
                onChange={(r) => updateRange("epsGrowth5Y", r)}
              />
              <DualRangeSlider
                label="Retorno s/ Capital (ROE %)"
                minLimit={-10}
                maxLimit={60}
                step={1}
                unit="%"
                value={criteria.roe || { min: null, max: null }}
                onChange={(r) => updateRange("roe", r)}
              />
              <DualRangeSlider
                label="Retorno s/ Activos (ROA %)"
                minLimit={-5}
                maxLimit={30}
                step={0.5}
                unit="%"
                value={criteria.roa || { min: null, max: null }}
                onChange={(r) => updateRange("roa", r)}
              />
              <DualRangeSlider
                label="Margen Bruto (%)"
                minLimit={10}
                maxLimit={90}
                step={1}
                unit="%"
                value={criteria.grossMargin || { min: null, max: null }}
                onChange={(r) => updateRange("grossMargin", r)}
              />
              <DualRangeSlider
                label="Margen Operativo (%)"
                minLimit={-15}
                maxLimit={50}
                step={1}
                unit="%"
                value={criteria.operatingMargin || { min: null, max: null }}
                onChange={(r) => updateRange("operatingMargin", r)}
              />
              <DualRangeSlider
                label="Deuda / Capital (D/E)"
                minLimit={0}
                maxLimit={5.0}
                step={0.1}
                value={criteria.debtToEquity || { min: null, max: null }}
                onChange={(r) => updateRange("debtToEquity", r)}
              />
              <DualRangeSlider
                label="Razón Corriente (Current Ratio)"
                minLimit={0.5}
                maxLimit={5.0}
                step={0.1}
                value={criteria.currentRatio || { min: null, max: null }}
                onChange={(r) => updateRange("currentRatio", r)}
              />
            </div>
          )}

          {/* Tab 4: Market & Categorical */}
          {activeTab === "market" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
              <MultiSelectDropdown
                label="Sectores"
                options={ALL_SECTORS.map((sec) => ({ value: sec, label: sec }))}
                selected={criteria.sectors || []}
                onChange={(sectors) =>
                  onUpdateCriteria((prev) => ({ ...prev, sectors }))
                }
                placeholder="Todos los sectores"
              />
              <MultiSelectDropdown
                label="Mercados / Exchanges"
                options={ALL_EXCHANGES.map((ex) => ({ value: ex, label: ex }))}
                selected={criteria.exchanges || []}
                onChange={(exchanges) =>
                  onUpdateCriteria((prev) => ({ ...prev, exchanges }))
                }
                placeholder="Todos los exchanges"
              />
              <MultiSelectDropdown
                label="Categoría de Cap."
                options={ALL_CAPS.map((cap) => ({ value: cap, label: `${cap} Cap` }))}
                selected={criteria.marketCapCategories || []}
                onChange={(caps) =>
                  onUpdateCriteria((prev) => ({ ...prev, marketCapCategories: caps }))
                }
                placeholder="Todas las categorías"
              />
              <DualRangeSlider
                label="Precio ($)"
                minLimit={1}
                maxLimit={1000}
                step={1}
                formatValue={(v) => `$${v}`}
                value={criteria.price || { min: null, max: null }}
                onChange={(r) => updateRange("price", r)}
              />
              <DualRangeSlider
                label="Variación 24h (%)"
                minLimit={-20}
                maxLimit={25}
                step={0.5}
                unit="%"
                value={criteria.changePercent || { min: null, max: null }}
                onChange={(r) => updateRange("changePercent", r)}
              />
              <DualRangeSlider
                label="Volumen Relativo (RVol)"
                minLimit={0.2}
                maxLimit={5.0}
                step={0.1}
                unit="x"
                value={criteria.relativeVolume || { min: null, max: null }}
                onChange={(r) => updateRange("relativeVolume", r)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
