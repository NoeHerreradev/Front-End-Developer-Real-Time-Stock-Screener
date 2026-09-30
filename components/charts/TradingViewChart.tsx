"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  IChartApi,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  CandlestickData,
  HistogramData,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";
import { Stock } from "@/types/stock";
import { generateHistoricalCandles } from "@/lib/chart-data";
import {
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
  calculateRSI,
  calculateVolumeBars,
} from "@/lib/indicators";
import {
  formatPrice,
  formatPercent,
  formatVolume,
} from "@/lib/formatters";

interface TradingViewChartProps {
  stock: Stock;
  height?: number;
  showRSI?: boolean;
}

export default function TradingViewChart({
  stock,
  height = 420,
  showRSI = true,
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);

  const chartInstanceRef = useRef<IChartApi | null>(null);
  const rsiChartInstanceRef = useRef<IChartApi | null>(null);

  // Overlay Visibility Toggles
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showEMA9, setShowEMA9] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [isRSIExpanded, setIsRSIExpanded] = useState(showRSI);

  // Tooltip / Crosshair hovering data
  const [crosshairInfo, setCrosshairInfo] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
  } | null>(null);

  // 1. Generate OHLCV Series
  const candles = useMemo(() => {
    return generateHistoricalCandles(stock, 160);
  }, [stock]);

  // 2. Pure Math Technical Indicators Calculation
  const sma20Data = useMemo(() => calculateSMA(candles, 20), [candles]);
  const sma50Data = useMemo(() => calculateSMA(candles, 50), [candles]);
  const ema9Data = useMemo(() => calculateEMA(candles, 9), [candles]);
  const bollingerData = useMemo(() => calculateBollingerBands(candles, 20, 2), [candles]);
  const rsiData = useMemo(() => calculateRSI(candles, 14), [candles]);
  const volumeData = useMemo(() => calculateVolumeBars(candles), [candles]);

  // Latest snapshot metrics
  const latestCandle = candles[candles.length - 1];

  // Initialize and update TradingView Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up existing instances safely
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.remove();
      } catch {
        // chart was already disposed
      }
      chartInstanceRef.current = null;
    }

    const container = chartContainerRef.current;
    container.innerHTML = "";

    // Create Main Candlestick Chart Instance
    const chart = createChart(container, {
      width: container.clientWidth,
      height: isRSIExpanded ? height - 120 : height,
      layout: {
        background: { type: ColorType.Solid, color: "#090d16" },
        textColor: "#94a3b8",
        fontSize: 11,
        fontFamily: "JetBrains Mono, monospace, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(30, 41, 59, 0.5)", style: 1 },
        horzLines: { color: "rgba(30, 41, 59, 0.5)", style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(148, 163, 184, 0.4)",
          width: 1,
          style: 3,
        },
        horzLine: {
          color: "rgba(148, 163, 184, 0.4)",
          width: 1,
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: "#1e293b",
        scaleMargins: {
          top: 0.1,
          bottom: 0.25,
        },
      },
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartInstanceRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    candleSeries.setData(candles as unknown as CandlestickData[]);

    // 2. Volume Series (Histogram on bottom margin)
    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "", // Overlay scale
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.75,
          bottom: 0,
        },
      });

      volumeSeries.setData(volumeData as unknown as HistogramData[]);
    }

    // 3. Technical Overlays (SMA 20, SMA 50, EMA 9, Bollinger Bands)
    if (showSMA20) {
      const sma20Series = chart.addSeries(LineSeries, {
        color: "#fbbf24", // Amber
        lineWidth: 2,
        title: "SMA 20",
      });
      sma20Series.setData(sma20Data as unknown as LineData[]);
    }

    if (showSMA50) {
      const sma50Series = chart.addSeries(LineSeries, {
        color: "#3b82f6", // Blue
        lineWidth: 2,
        title: "SMA 50",
      });
      sma50Series.setData(sma50Data as unknown as LineData[]);
    }

    if (showEMA9) {
      const ema9Series = chart.addSeries(LineSeries, {
        color: "#a855f7", // Purple
        lineWidth: 2,
        title: "EMA 9",
      });
      ema9Series.setData(ema9Data as unknown as LineData[]);
    }

    if (showBollinger) {
      const bbUpper = chart.addSeries(LineSeries, {
        color: "rgba(6, 182, 212, 0.7)",
        lineWidth: 1,
        lineStyle: 2,
        title: "BB Upper",
      });
      const bbMiddle = chart.addSeries(LineSeries, {
        color: "rgba(6, 182, 212, 0.9)",
        lineWidth: 1,
        title: "BB Mid",
      });
      const bbLower = chart.addSeries(LineSeries, {
        color: "rgba(6, 182, 212, 0.7)",
        lineWidth: 1,
        lineStyle: 2,
        title: "BB Lower",
      });

      bbUpper.setData(
        bollingerData.map((b) => ({ time: b.time, value: b.upper })) as unknown as LineData[]
      );
      bbMiddle.setData(
        bollingerData.map((b) => ({ time: b.time, value: b.middle })) as unknown as LineData[]
      );
      bbLower.setData(
        bollingerData.map((b) => ({ time: b.time, value: b.lower })) as unknown as LineData[]
      );
    }

    // Crosshair Hover Tooltip handler
    chart.subscribeCrosshairMove((param) => {
      if (
        !param.time ||
        !param.point ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        setCrosshairInfo(null);
        return;
      }

      const candlePoint = param.seriesData.get(candleSeries) as unknown as CandlestickData;
      if (candlePoint) {
        const timeStr = typeof param.time === "string" ? param.time : new Date((param.time as UTCTimestamp) * 1000).toISOString().split("T")[0]!;
        const change = candlePoint.close - candlePoint.open;
        const matchingCandle = candles.find((c) => c.time === timeStr);

        setCrosshairInfo({
          time: timeStr,
          open: candlePoint.open,
          high: candlePoint.high,
          low: candlePoint.low,
          close: candlePoint.close,
          volume: matchingCandle ? matchingCandle.volume : 0,
          change,
        });
      }
    });

    // Auto-fit contents
    chart.timeScale().fitContent();

    // Resize Observer for dynamic responsive resizing
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0]) return;
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      try {
        chart.remove();
      } catch {
        // ignore if already disposed
      }
      chartInstanceRef.current = null;
    };
  }, [
    candles,
    height,
    isRSIExpanded,
    showVolume,
    showSMA20,
    showSMA50,
    showEMA9,
    showBollinger,
    sma20Data,
    sma50Data,
    ema9Data,
    bollingerData,
    volumeData,
  ]);

  // Initialize and update RSI Sub-chart
  useEffect(() => {
    if (!isRSIExpanded || !rsiContainerRef.current) return;

    if (rsiChartInstanceRef.current) {
      try {
        rsiChartInstanceRef.current.remove();
      } catch {
        // ignore if already disposed
      }
      rsiChartInstanceRef.current = null;
    }

    const container = rsiContainerRef.current;
    container.innerHTML = "";

    const rsiChart = createChart(container, {
      width: container.clientWidth,
      height: 110,
      layout: {
        background: { type: ColorType.Solid, color: "#090d16" },
        textColor: "#64748b",
        fontSize: 10,
        fontFamily: "JetBrains Mono, monospace",
      },
      grid: {
        vertLines: { color: "rgba(30, 41, 59, 0.4)", style: 1 },
        horzLines: { color: "rgba(30, 41, 59, 0.4)", style: 1 },
      },
      rightPriceScale: {
        borderColor: "#1e293b",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: "#1e293b",
        visible: false,
      },
    });

    rsiChartInstanceRef.current = rsiChart;

    const rsiSeries = rsiChart.addSeries(LineSeries, {
      color: "#818cf8", // Indigo
      lineWidth: 2,
      title: "RSI (14)",
    });

    rsiSeries.setData(rsiData as unknown as LineData[]);

    // Overbought (70) and Oversold (30) reference lines
    const overboughtLine = rsiChart.addSeries(LineSeries, {
      color: "rgba(239, 68, 68, 0.5)",
      lineWidth: 1,
      lineStyle: 3,
    });
    overboughtLine.setData(
      rsiData.map((r) => ({ time: r.time, value: 70 })) as unknown as LineData[]
    );

    const oversoldLine = rsiChart.addSeries(LineSeries, {
      color: "rgba(16, 185, 129, 0.5)",
      lineWidth: 1,
      lineStyle: 3,
    });
    oversoldLine.setData(
      rsiData.map((r) => ({ time: r.time, value: 30 })) as unknown as LineData[]
    );

    rsiChart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0]) return;
      const { width } = entries[0].contentRect;
      rsiChart.applyOptions({ width });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      try {
        rsiChart.remove();
      } catch {
        // ignore if already disposed
      }
      rsiChartInstanceRef.current = null;
    };
  }, [rsiData, isRSIExpanded]);

  return (
    <div className="flex flex-col bg-[#090d16] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Chart Header Bar */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Stock Symbol & Price Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-white">{stock.ticker}</span>
            <span className="text-xs font-mono text-slate-400">{stock.name}</span>
          </div>
          <span className="text-base font-bold font-mono text-white">
            {formatPrice(stock.price)}
          </span>
          <span
            className={`text-xs font-mono font-semibold ${
              stock.change >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {formatPercent(stock.changePercent)}
          </span>
        </div>

        {/* Technical Overlays Toggle Bar */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-2 py-0.8 rounded border transition-colors ${
              showSMA20
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
          >
            SMA 20
          </button>
          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-2 py-0.8 rounded border transition-colors ${
              showSMA50
                ? "bg-blue-500/20 text-blue-300 border-blue-500/50 font-bold"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
          >
            SMA 50
          </button>
          <button
            onClick={() => setShowEMA9(!showEMA9)}
            className={`px-2 py-0.8 rounded border transition-colors ${
              showEMA9
                ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
          >
            EMA 9
          </button>
          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2 py-0.8 rounded border transition-colors ${
              showBollinger
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
          >
            Bollinger (20,2)
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-0.8 rounded border transition-colors ${
              showVolume
                ? "bg-slate-700/60 text-slate-200 border-slate-600 font-bold"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
          >
            Volumen
          </button>
          <button
            onClick={() => setIsRSIExpanded(!isRSIExpanded)}
            className={`px-2 py-0.8 rounded border transition-colors ${
              isRSIExpanded
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 font-bold"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
          >
            RSI (14)
          </button>
        </div>
      </div>

      {/* Dynamic Crosshair Floating HUD Bar */}
      <div className="px-3.5 py-1.5 bg-slate-950/90 border-b border-slate-850 text-[11px] font-mono flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span>Fecha: <strong className="text-slate-200">{crosshairInfo?.time || latestCandle?.time || "—"}</strong></span>
          <span>O: <strong className="text-slate-200">${(crosshairInfo?.open || latestCandle?.open || 0).toFixed(2)}</strong></span>
          <span>H: <strong className="text-slate-200">${(crosshairInfo?.high || latestCandle?.high || 0).toFixed(2)}</strong></span>
          <span>L: <strong className="text-slate-200">${(crosshairInfo?.low || latestCandle?.low || 0).toFixed(2)}</strong></span>
          <span>C: <strong className="text-slate-200">${(crosshairInfo?.close || latestCandle?.close || 0).toFixed(2)}</strong></span>
          <span>Vol: <strong className="text-slate-200">{formatVolume(crosshairInfo?.volume || latestCandle?.volume || 0)}</strong></span>
        </div>

        {/* Current RSI value indicator */}
        <div className="flex items-center gap-2">
          <span>RSI (14):</span>
          <span
            className={`font-bold ${
              stock.rsi14 > 70
                ? "text-rose-400"
                : stock.rsi14 < 30
                ? "text-emerald-400"
                : "text-indigo-300"
            }`}
          >
            {stock.rsi14.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Main Candlestick Chart Viewport */}
      <div className="relative w-full">
        <div ref={chartContainerRef} className="w-full" />
      </div>

      {/* RSI Sub-Chart Viewport */}
      {isRSIExpanded && (
        <div className="border-t border-slate-800/80 bg-slate-950/40 relative">
          <div className="absolute top-1 left-3 z-10 text-[10px] font-mono text-slate-400 flex items-center gap-2">
            <span>RSI (14)</span>
            <span className="text-rose-400/80">70 (Sobrecompra)</span>
            <span className="text-emerald-400/80">30 (Sobreventa)</span>
          </div>
          <div ref={rsiContainerRef} className="w-full" />
        </div>
      )}
    </div>
  );
}
