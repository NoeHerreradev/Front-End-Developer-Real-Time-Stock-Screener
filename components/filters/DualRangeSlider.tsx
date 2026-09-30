"use client";

import React, { useCallback } from "react";
import { NumericRange } from "@/types/stock";
import { RotateCcw } from "lucide-react";

interface DualRangeSliderProps {
  label: string;
  minLimit: number;
  maxLimit: number;
  step?: number;
  unit?: string;
  value: NumericRange;
  onChange: (range: NumericRange) => void;
  formatValue?: (val: number) => string;
}

export function DualRangeSlider({
  label,
  minLimit,
  maxLimit,
  step = 1,
  unit = "",
  value,
  onChange,
  formatValue,
}: DualRangeSliderProps) {
  const currentMin = value.min ?? minLimit;
  const currentMax = value.max ?? maxLimit;
  const isFiltered = value.min !== null || value.max !== null;

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value === "" ? null : Number(e.target.value);
      onChange({ min: val, max: value.max });
    },
    [value.max, onChange]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value === "" ? null : Number(e.target.value);
      onChange({ min: value.min, max: val });
    },
    [value.min, onChange]
  );

  const handleSliderMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const newMin = Math.min(val, currentMax);
    onChange({ min: newMin === minLimit ? null : newMin, max: value.max });
  };

  const handleSliderMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const newMax = Math.max(val, currentMin);
    onChange({ min: value.min, max: newMax === maxLimit ? null : newMax });
  };

  const handleReset = () => {
    onChange({ min: null, max: null });
  };

  const displayFormat = (val: number) => {
    if (formatValue) return formatValue(val);
    return `${val}${unit}`;
  };

  const minPercent = ((currentMin - minLimit) / (maxLimit - minLimit)) * 100;
  const maxPercent = ((currentMax - minLimit) / (maxLimit - minLimit)) * 100;

  return (
    <div className="space-y-2 p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs">
      <div className="flex items-center justify-between text-slate-300">
        <span className="font-semibold text-slate-200">{label}</span>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {isFiltered && (
            <button
              onClick={handleReset}
              className="text-slate-500 hover:text-rose-400 transition-colors p-0.5"
              title="Resetear rango"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
          <span className="text-blue-400 font-bold">
            {value.min !== null ? displayFormat(value.min) : "Min"} —{" "}
            {value.max !== null ? displayFormat(value.max) : "Max"}
          </span>
        </div>
      </div>

      {/* Range Track */}
      <div className="relative h-1.5 w-full bg-slate-800 rounded-full my-3">
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${Math.max(0, minPercent)}%`,
            right: `${Math.max(0, 100 - maxPercent)}%`,
          }}
        />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={currentMin}
          onChange={handleSliderMin}
          className="absolute w-full -top-1.5 h-4 bg-transparent appearance-none pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-950 [&::-webkit-slider-thumb]:appearance-none"
        />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={currentMax}
          onChange={handleSliderMax}
          className="absolute w-full -top-1.5 h-4 bg-transparent appearance-none pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-950 [&::-webkit-slider-thumb]:appearance-none"
        />
      </div>

      {/* Numeric Inputs */}
      <div className="flex items-center justify-between gap-2 pt-1 font-mono">
        <div className="flex items-center gap-1">
          <span className="text-slate-500 text-[10px]">Min:</span>
          <input
            type="number"
            placeholder={minLimit.toString()}
            value={value.min ?? ""}
            onChange={handleMinChange}
            className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-[11px] focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-500 text-[10px]">Max:</span>
          <input
            type="number"
            placeholder={maxLimit.toString()}
            value={value.max ?? ""}
            onChange={handleMaxChange}
            className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-[11px] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
