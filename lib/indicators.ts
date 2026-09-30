/**
 * TECHNICAL ANALYSIS MATHEMATICAL ENGINE
 * Pure TypeScript implementations of quantitative indicators:
 * SMA, EMA, Bollinger Bands, RSI (Wilder's Smoothing), and Volume Analysis.
 */

export interface CandleData {
  time: string; // 'YYYY-MM-DD' or timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorPoint {
  time: string;
  value: number;
}

export interface BollingerBandsPoint {
  time: string;
  upper: number;
  middle: number;
  lower: number;
}

export interface VolumeBarPoint {
  time: string;
  value: number;
  color: string;
}

/**
 * Simple Moving Average (SMA)
 * SMA = (P1 + P2 + ... + Pn) / n
 */
export function calculateSMA(
  data: CandleData[],
  period: number
): IndicatorPoint[] {
  if (data.length < period || period <= 0) return [];
  const results: IndicatorPoint[] = [];

  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!item) continue;
    sum += item.close;

    if (i >= period) {
      const oldItem = data[i - period];
      if (oldItem) {
        sum -= oldItem.close;
      }
    }

    if (i >= period - 1) {
      results.push({
        time: item.time,
        value: Math.round((sum / period) * 100) / 100,
      });
    }
  }

  return results;
}

/**
 * Exponential Moving Average (EMA)
 * Multiplier = 2 / (period + 1)
 * EMA_today = (Price_today * Multiplier) + (EMA_yesterday * (1 - Multiplier))
 */
export function calculateEMA(
  data: CandleData[],
  period: number
): IndicatorPoint[] {
  if (data.length < period || period <= 0) return [];
  const results: IndicatorPoint[] = [];
  const multiplier = 2 / (period + 1);

  // 1. Initial SMA for the first period elements
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    const item = data[i];
    if (item) initialSum += item.close;
  }
  let prevEMA = initialSum / period;

  const firstValidItem = data[period - 1];
  if (firstValidItem) {
    results.push({
      time: firstValidItem.time,
      value: Math.round(prevEMA * 100) / 100,
    });
  }

  // 2. Compute recursive EMA for remaining elements
  for (let i = period; i < data.length; i++) {
    const item = data[i];
    if (!item) continue;
    const currentEMA = item.close * multiplier + prevEMA * (1 - multiplier);
    results.push({
      time: item.time,
      value: Math.round(currentEMA * 100) / 100,
    });
    prevEMA = currentEMA;
  }

  return results;
}

/**
 * Bollinger Bands
 * Middle Band = SMA(period)
 * Upper Band = Middle Band + (multiplier * StandardDeviation)
 * Lower Band = Middle Band - (multiplier * StandardDeviation)
 */
export function calculateBollingerBands(
  data: CandleData[],
  period = 20,
  multiplier = 2
): BollingerBandsPoint[] {
  if (data.length < period || period <= 0) return [];
  const results: BollingerBandsPoint[] = [];

  for (let i = period - 1; i < data.length; i++) {
    const windowSlice = data.slice(i - period + 1, i + 1);
    const sum = windowSlice.reduce((acc, curr) => acc + curr.close, 0);
    const mean = sum / period;

    // Variance & Standard Deviation
    const variance =
      windowSlice.reduce((acc, curr) => acc + Math.pow(curr.close - mean, 2), 0) /
      period;
    const stdDev = Math.sqrt(variance);

    const currentItem = data[i];
    if (!currentItem) continue;

    results.push({
      time: currentItem.time,
      upper: Math.round((mean + multiplier * stdDev) * 100) / 100,
      middle: Math.round(mean * 100) / 100,
      lower: Math.round((mean - multiplier * stdDev) * 100) / 100,
    });
  }

  return results;
}

/**
 * Relative Strength Index (RSI - 14)
 * Uses J. Welles Wilder's Smoothing Technique:
 * RS = Smoothed Average Gain / Smoothed Average Loss
 * RSI = 100 - (100 / (1 + RS))
 */
export function calculateRSI(
  data: CandleData[],
  period = 14
): IndicatorPoint[] {
  if (data.length <= period) return [];
  const results: IndicatorPoint[] = [];

  let gains = 0;
  let losses = 0;

  // 1. Calculate initial average gain/loss over first `period`
  for (let i = 1; i <= period; i++) {
    const current = data[i];
    const prev = data[i - 1];
    if (!current || !prev) continue;

    const change = current.close - prev.close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const firstItem = data[period];
  if (firstItem) {
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    let rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
    results.push({
      time: firstItem.time,
      value: Math.round(rsi * 10) / 10,
    });
  }

  // 2. Wilder's exponential smoothing for the rest of the series
  for (let i = period + 1; i < data.length; i++) {
    const current = data[i];
    const prev = data[i - 1];
    if (!current || !prev) continue;

    const change = current.close - prev.close;
    const currentGain = change > 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    let rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

    results.push({
      time: current.time,
      value: Math.round(Math.min(100, Math.max(0, rsi)) * 10) / 10,
    });
  }

  return results;
}

/**
 * Formats volume data with institutional color coding (Bullish vs Bearish)
 */
export function calculateVolumeBars(data: CandleData[]): VolumeBarPoint[] {
  return data.map((d) => {
    const isBullish = d.close >= d.open;
    return {
      time: d.time,
      value: d.volume,
      color: isBullish ? "rgba(16, 185, 129, 0.45)" : "rgba(239, 68, 68, 0.45)",
    };
  });
}
