"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { formatPrice, formatPercent, formatChange, formatVolume, formatRatio } from "@/lib/formatters";

interface PriceCellProps {
  price: number;
  lastUpdated: number;
}

export const MemoizedPriceCell = memo(function MemoizedPriceCell({
  price,
  lastUpdated,
}: PriceCellProps) {
  const prevPriceRef = useRef<number>(price);
  const [flashClass, setFlashClass] = useState<string>("");

  useEffect(() => {
    if (prevPriceRef.current !== price) {
      const isUp = price > prevPriceRef.current;
      setFlashClass(isUp ? "flash-green-300" : "flash-red-300");

      const timer = setTimeout(() => {
        setFlashClass("");
      }, 300); // 300ms strict flash duration

      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [price, lastUpdated]);

  return (
    <div
      className={`text-right font-mono text-xs font-semibold px-1 py-0.5 rounded transition-colors ${flashClass || "text-slate-100"}`}
    >
      {formatPrice(price)}
    </div>
  );
});

interface ChangeCellProps {
  change: number;
  changePercent: number;
  lastUpdated: number;
}

export const MemoizedChangePercentCell = memo(function MemoizedChangePercentCell({
  changePercent,
  lastUpdated,
}: ChangeCellProps) {
  const isPositive = changePercent >= 0;
  const prevRef = useRef(changePercent);
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    if (prevRef.current !== changePercent) {
      setFlashClass(changePercent > prevRef.current ? "flash-green-300" : "flash-red-300");
      const timer = setTimeout(() => setFlashClass(""), 300);
      prevRef.current = changePercent;
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [changePercent, lastUpdated]);

  return (
    <div
      className={`text-right font-mono text-xs font-semibold px-1 py-0.5 rounded ${flashClass} ${
        isPositive ? "text-emerald-400" : "text-rose-400"
      }`}
    >
      {formatPercent(changePercent)}
    </div>
  );
});

export const MemoizedChangeCell = memo(function MemoizedChangeCell({
  change,
}: {
  change: number;
  lastUpdated: number;
}) {
  const isPositive = change >= 0;
  return (
    <div
      className={`text-right font-mono text-xs ${
        isPositive ? "text-emerald-400" : "text-rose-400"
      }`}
    >
      {formatChange(change)}
    </div>
  );
});

export const MemoizedRsiCell = memo(function MemoizedRsiCell({
  rsi14,
}: {
  rsi14: number;
}) {
  const isOverbought = rsi14 >= 70;
  const isOversold = rsi14 <= 30;

  return (
    <div className="text-right font-mono text-xs">
      <span
        className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
          isOverbought
            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
            : isOversold
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
            : "text-slate-300"
        }`}
      >
        {rsi14.toFixed(1)}
      </span>
    </div>
  );
});

export const MemoizedVolumeCell = memo(function MemoizedVolumeCell({
  volume,
}: {
  volume: number;
}) {
  return (
    <div className="text-right font-mono text-xs text-slate-400">
      {formatVolume(volume)}
    </div>
  );
});

export const MemoizedRatioCell = memo(function MemoizedRatioCell({
  value,
  decimals = 1,
}: {
  value: number | null;
  decimals?: number;
}) {
  return (
    <div className="text-right font-mono text-xs text-slate-300">
      {formatRatio(value, decimals)}
    </div>
  );
});
