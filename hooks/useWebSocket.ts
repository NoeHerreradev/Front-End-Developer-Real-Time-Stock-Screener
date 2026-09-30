/**
 * HOOK: useWebSocket REAL-TIME STREAMING FEED
 * Simulates high-frequency market data WebSocket feeds using Geometric Brownian Motion (GBM)
 * and batches incoming updates with requestAnimationFrame (rAF) to eliminate React re-render thrashing.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Stock, StockTickDelta } from "@/types/stock";
import { generateGBMTicks } from "@/lib/gbm";

export type WebSocketStatus = "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED";

interface UseWebSocketOptions {
  universe: Stock[];
  enabled: boolean;
  frequencyHz?: number; // Target dispatch frequency in Hz (e.g. 10 - 60 Hz)
  batchSize?: number; // Number of ticks per interval
  onBatchTicks: (deltas: StockTickDelta[]) => void;
}

export interface UseWebSocketReturn {
  status: WebSocketStatus;
  ticksPerSecond: number;
  totalTicksReceived: number;
  rAFFramesCount: number;
  reconnect: () => void;
  pause: () => void;
  resume: () => void;
}

export function useWebSocket({
  universe,
  enabled,
  frequencyHz = 20,
  batchSize = 25,
  onBatchTicks,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState<WebSocketStatus>("CLOSED");
  const [ticksPerSec, setTicksPerSec] = useState<number>(0);
  const [totalTicks, setTotalTicks] = useState<number>(0);
  const [rAFFrames, setRAFFrames] = useState<number>(0);

  // High-frequency tick buffer for requestAnimationFrame batching
  const tickBufferRef = useRef<StockTickDelta[]>([]);
  const rAFIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Telemetry counters
  const ticksThisSecondRef = useRef<number>(0);
  const telemetryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Latest callback reference to avoid re-triggering effects
  const onBatchTicksRef = useRef(onBatchTicks);
  onBatchTicksRef.current = onBatchTicks;

  // 1. requestAnimationFrame Batching Loop
  const scheduleBatchFlush = useCallback(() => {
    if (rAFIdRef.current !== null) return;

    rAFIdRef.current = requestAnimationFrame(() => {
      rAFIdRef.current = null;

      if (tickBufferRef.current.length > 0) {
        const batch = tickBufferRef.current;
        tickBufferRef.current = [];
        onBatchTicksRef.current(batch);
        setRAFFrames((prev) => prev + 1);
      }
    });
  }, []);

  // 2. High-Frequency Market Tick Producer (Simulated WebSocket Server Stream)
  const startStream = useCallback(() => {
    if (universe.length === 0) return;

    setStatus("CONNECTING");
    const connectTimer = setTimeout(() => {
      setStatus("OPEN");
    }, 150);

    const intervalMs = Math.max(16, Math.floor(1000 / frequencyHz));

    intervalIdRef.current = setInterval(() => {
      if (universe.length === 0) return;

      // Produce GBM ticks
      const deltas = generateGBMTicks(universe, batchSize);
      if (deltas.length > 0) {
        // Enqueue into tick buffer
        tickBufferRef.current.push(...deltas);
        ticksThisSecondRef.current += deltas.length;
        setTotalTicks((prev) => prev + deltas.length);

        // Schedule rAF batch flush
        scheduleBatchFlush();
      }
    }, intervalMs);

    return () => clearTimeout(connectTimer);
  }, [universe, frequencyHz, batchSize, scheduleBatchFlush]);

  const stopStream = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (rAFIdRef.current !== null) {
      cancelAnimationFrame(rAFIdRef.current);
      rAFIdRef.current = null;
    }
    setStatus("CLOSED");
  }, []);

  // 3. Telemetry 1-second throughput sampler
  useEffect(() => {
    telemetryIntervalRef.current = setInterval(() => {
      setTicksPerSec(ticksThisSecondRef.current);
      ticksThisSecondRef.current = 0;
    }, 1000);

    return () => {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
      }
    };
  }, []);

  // 4. Main lifecycle synchronization
  useEffect(() => {
    if (enabled && universe.length > 0) {
      startStream();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [enabled, universe.length, startStream, stopStream]);

  const reconnect = useCallback(() => {
    stopStream();
    setTimeout(() => {
      startStream();
    }, 200);
  }, [stopStream, startStream]);

  return {
    status,
    ticksPerSecond: ticksPerSec,
    totalTicksReceived: totalTicks,
    rAFFramesCount: rAFFrames,
    reconnect,
    pause: stopStream,
    resume: startStream,
  };
}
