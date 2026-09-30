/**
 * GEOMETRIC BROWNIAN MOTION (GBM) STOCHASTIC ENGINE
 * Simulates institutional-grade continuous-time stochastic financial asset price paths.
 * Formula: S(t + dt) = S(t) * exp((mu - 0.5 * sigma^2) * dt + sigma * sqrt(dt) * Z)
 * where Z ~ N(0, 1) generated via the Box-Muller transform.
 */

import { Stock, StockTickDelta } from "@/types/stock";

/**
 * Standard Normal Random Variable Generator using the Box-Muller Transform
 */
export function gaussianRandom(mean = 0, stdev = 1): number {
  let u = 1 - Math.random(); // Subtraction avoids 0
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

export interface GBMSimulationConfig {
  dt: number; // Time step in years (e.g. 1 second = 1 / (252 * 6.5 * 3600) ~ 1.7e-7)
  drift: number; // Annualized expected return (mu, e.g. 0.08 for 8%)
  volatilityMultiplier?: number;
}

const DEFAULT_CONFIG: GBMSimulationConfig = {
  dt: 1 / (252 * 6.5 * 3600), // 1 second of market trading time
  drift: 0.075, // 7.5% annual equity risk premium
  volatilityMultiplier: 1.0,
};

/**
 * Computes the next stochastic price for a single stock using Geometric Brownian Motion
 */
export function nextGBMPrice(
  stock: Stock,
  config: GBMSimulationConfig = DEFAULT_CONFIG
): number {
  const currentPrice = stock.price;
  const annualVol = Math.max(0.1, (stock.volatility30d / 100) * (stock.beta || 1.0));
  const sigma = annualVol * (config.volatilityMultiplier || 1.0);
  const mu = config.drift;
  const dt = config.dt;

  const z = gaussianRandom(0, 1);
  const driftTerm = (mu - 0.5 * Math.pow(sigma, 2)) * dt;
  const diffusionTerm = sigma * Math.sqrt(dt) * z;

  const returnMultiplier = Math.exp(driftTerm + diffusionTerm);
  const newPrice = Math.max(0.01, currentPrice * returnMultiplier);

  return Math.round(newPrice * 100) / 100;
}

/**
 * Generates high-frequency batch of tick deltas over a subset of stocks using GBM
 */
export function generateGBMTicks(
  universe: Stock[],
  batchSize = 35,
  config: GBMSimulationConfig = DEFAULT_CONFIG
): StockTickDelta[] {
  const deltas: StockTickDelta[] = [];
  const len = universe.length;
  if (len === 0) return deltas;

  const now = Date.now();

  for (let i = 0; i < batchSize; i++) {
    const idx = Math.floor(Math.random() * len);
    const stock = universe[idx];
    if (!stock) continue;

    const newPrice = nextGBMPrice(stock, config);
    if (newPrice === stock.price) continue;

    const priceDiff = Math.round((newPrice - stock.price) * 100) / 100;
    const newChange = Math.round((stock.change + priceDiff) * 100) / 100;
    const newChangePercent =
      Math.round(((newPrice - stock.previousClose) / stock.previousClose) * 10000) / 100;

    const volumeIncrement = Math.floor(Math.random() * 800) + 20;
    const newVolume = stock.volume + volumeIncrement;
    const newDayHigh = Math.max(stock.dayHigh, newPrice);
    const newDayLow = Math.min(stock.dayLow, newPrice);
    const spread = Math.max(0.01, Math.round(newPrice * 0.0004 * 100) / 100);

    const rsiDelta = priceDiff > 0 ? 0.15 : -0.15;
    const newRsi = Math.min(99, Math.max(1, Math.round((stock.rsi14 + rsiDelta) * 10) / 10));

    deltas.push({
      ticker: stock.ticker,
      price: newPrice,
      change: newChange,
      changePercent: newChangePercent,
      volume: newVolume,
      dayHigh: newDayHigh,
      dayLow: newDayLow,
      bid: Math.round((newPrice - spread / 2) * 100) / 100,
      ask: Math.round((newPrice + spread / 2) * 100) / 100,
      rsi14: newRsi,
      timestamp: now,
    });
  }

  return deltas;
}
