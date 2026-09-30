"use client";

import { SCREENER_PRESETS, ScreenerPreset } from "@/lib/filter-engine";
import { Sparkles, Bookmark, Flame, DollarSign, RefreshCw } from "lucide-react";

interface PresetSelectorProps {
  activePresetId: string | null;
  onSelectPreset: (preset: ScreenerPreset) => void;
  onClearPreset: () => void;
}

export function PresetSelector({
  activePresetId,
  onSelectPreset,
  onClearPreset,
}: PresetSelectorProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case "value_stocks":
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case "growth_momentum":
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case "dividend_aristocrats":
        return <Sparkles className="w-3.5 h-3.5 text-blue-400" />;
      case "oversold_reversal":
        return <RefreshCw className="w-3.5 h-3.5 text-purple-400" />;
      case "short_squeeze_candidates":
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Bookmark className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        Presets:
      </span>

      {SCREENER_PRESETS.map((preset) => {
        const isActive = activePresetId === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => {
              if (isActive) {
                onClearPreset();
              } else {
                onSelectPreset(preset);
              }
            }}
            title={preset.description}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all shrink-0 font-medium ${
              isActive
                ? "bg-blue-600/20 border-blue-500 text-blue-300 font-semibold shadow-sm"
                : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
            }`}
          >
            {getIcon(preset.id)}
            <span>{preset.name}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse ml-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}
