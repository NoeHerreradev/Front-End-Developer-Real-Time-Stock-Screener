"use client";

import dynamic from "next/dynamic";
import { Stock } from "@/types/stock";
import { RefreshCw } from "lucide-react";

interface LazyTradingViewChartProps {
  stock: Stock;
  height?: number;
  showRSI?: boolean;
}

export const LazyTradingViewChart = dynamic(
  () => import("./TradingViewChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full flex flex-col items-center justify-center gap-3 bg-[#090d16] border border-slate-800 rounded-xl text-slate-400 font-mono text-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span>Cargando TradingView Lightweight-Charts & Indicadores...</span>
      </div>
    ),
  }
) as unknown as React.FC<LazyTradingViewChartProps>;
