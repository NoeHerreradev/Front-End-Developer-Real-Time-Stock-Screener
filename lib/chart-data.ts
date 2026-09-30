/**
 * HISTORICAL OHLCV CANDLESTICK DATA GENERATOR
 * Generates realistic daily historical price series for TradingView lightweight-charts.
 */

import { Stock } from "@/types/stock";
import { CandleData } from "./indicators";

/**
 * Deterministic pseudo-random number generator for consistent candle series per ticker
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateHistoricalCandles(
  stock: Stock,
  daysCount = 120
): CandleData[] {
  const candles: CandleData[] = [];
  const seed = hashString(stock.ticker);
  let random = (seed % 10000) / 10000;

  const getNextRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };

  const endDate = new Date();
  const currentPrice = stock.price;
  const startPrice = stock.price / (1 + stock.fiftyTwoWeekChange / 100);

  let walkerPrice = startPrice;
  const avgDailyVolume = stock.avgVolume3Month;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);

    // Skip weekends
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = d.toISOString().split("T")[0]!;

    // Trend interpolation towards currentPrice
    const progress = (daysCount - 1 - i) / (daysCount - 1);
    const targetTrendPrice = startPrice + (currentPrice - startPrice) * progress;
    const dailyVolatility = (stock.volatility30d / 100 / Math.sqrt(252)) * stock.beta;
    
    // Daily return
    const noise = (getNextRandom() + getNextRandom() - 1.0) * dailyVolatility * 2.2;
    const meanReversion = (targetTrendPrice - walkerPrice) * 0.08;
    const openPrice = walkerPrice;
    let closePrice = Math.max(0.5, openPrice * (1 + noise + meanReversion));

    if (i === 0) {
      closePrice = currentPrice;
    }

    const intraHighNoise = getNextRandom() * (openPrice * dailyVolatility * 1.5);
    const intraLowNoise = getNextRandom() * (openPrice * dailyVolatility * 1.5);

    const highPrice = Math.max(openPrice, closePrice) + intraHighNoise;
    const lowPrice = Math.max(0.2, Math.min(openPrice, closePrice) - intraLowNoise);

    const volNoise = 0.6 + getNextRandom() * 0.9;
    const candleVolume = Math.floor(avgDailyVolume * volNoise);

    candles.push({
      time: dateStr,
      open: Math.round(openPrice * 100) / 100,
      high: Math.round(highPrice * 100) / 100,
      low: Math.round(lowPrice * 100) / 100,
      close: Math.round(closePrice * 100) / 100,
      volume: candleVolume,
    });

    walkerPrice = closePrice;
  }

  return candles;
}
