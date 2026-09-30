/**
 * TYPES: STOCK SCREENER DOMAIN MODEL
 * Institutional-grade TypeScript definitions for Real-Time Stock Screener
 */

export type Sector =
  | "Technology"
  | "Healthcare"
  | "Financial Services"
  | "Consumer Cyclical"
  | "Communication Services"
  | "Industrials"
  | "Consumer Defensive"
  | "Energy"
  | "Real Estate"
  | "Basic Materials"
  | "Utilities";

export type Exchange = "NASDAQ" | "NYSE" | "AMEX" | "CBOE" | "BATS";

export type MarketCapCategory =
  | "Mega"      // > $200B
  | "Large"     // $10B - $200B
  | "Mid"       // $2B - $10B
  | "Small"     // $300M - $2B
  | "Micro"     // $50M - $300M
  | "Nano";     // < $50M

export type TechnicalSignal = "Strong Buy" | "Buy" | "Neutral" | "Sell" | "Strong Sell";

export interface SparklinePoint {
  time: number;
  price: number;
}

export interface MACD {
  macd: number;
  signal: number;
  histogram: number;
}

export interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
}

/**
 * Main Stock entity containing real-time market data, valuation ratios,
 * technical indicators, and fundamental metrics.
 */
export interface Stock {
  // Identification
  id: string;
  ticker: string;
  name: string;
  exchange: Exchange;
  sector: Sector;
  industry: string;
  country: string;
  currency: string;
  description?: string;

  // Real-time Pricing & Quote
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  spread: number;
  lastUpdated: number; // Timestamp ms

  // Liquidity & Volume
  volume: number;
  avgVolume3Month: number;
  relativeVolume: number; // RVol = volume / avgVolume
  volumeWeightedAveragePrice: number; // VWAP

  // Valuation & Capitalization
  marketCap: number;
  marketCapCategory: MarketCapCategory;
  sharesOutstanding: number;
  floatShares: number;
  enterpriseValue: number;

  // Fundamental Valuation Ratios
  peRatio: number | null; // Price / Earnings (TTM)
  forwardPE: number | null;
  pegRatio: number | null;
  priceToBook: number | null; // P/B
  priceToSales: number | null; // P/S
  evToEbitda: number | null;
  dividendYield: number; // Percentage (e.g., 2.35 for 2.35%)
  dividendRate: number;
  payoutRatio: number | null;

  // Financial Health & Margins
  eps: number; // EPS TTM
  epsGrowth5Y: number; // %
  revenueGrowthYoY: number; // %
  grossMargin: number; // %
  operatingMargin: number; // %
  netMargin: number; // %
  roe: number; // Return on Equity %
  roa: number; // Return on Assets %
  debtToEquity: number;
  currentRatio: number;
  freeCashFlow: number;

  // Technical Metrics & Volatility
  rsi14: number; // Relative Strength Index (0 - 100)
  beta: number; // 5Y Monthly Beta
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekChange: number; // %
  distanceFrom52wHigh: number; // %
  distanceFrom52wLow: number; // %
  sma20: number;
  sma50: number;
  sma200: number;
  macd: MACD;
  bollingerBands: BollingerBands;
  atr14: number; // Average True Range
  volatility30d: number; // Annualized %

  // Short Interest & Sentiment
  shortInterestPercent: number; // % of float
  shortRatio: number; // Days to cover
  analystRatingScore: number; // 1.0 (Strong Buy) to 5.0 (Strong Sell)
  analystConsensus: TechnicalSignal;
  technicalSummary: TechnicalSignal;

  // Visual / Charting Sparkline Data (e.g. 20 data points)
  sparkline: SparklinePoint[];
}

/**
 * Filter Range Definition for numerical criteria
 */
export interface NumericRange {
  min: number | null;
  max: number | null;
}

/**
 * Screener Filter State definition
 */
export interface ScreenerFilterState {
  searchQuery: string;
  sectors: Sector[];
  exchanges: Exchange[];
  marketCapCategories: MarketCapCategory[];
  
  // Numerical Range Filters
  price: NumericRange;
  marketCap: NumericRange;
  peRatio: NumericRange;
  dividendYield: NumericRange;
  volume: NumericRange;
  relativeVolume: NumericRange;
  rsi14: NumericRange;
  beta: NumericRange;
  changePercent: NumericRange;
  shortInterestPercent: NumericRange;
  distanceFrom52wHigh: NumericRange;
  distanceFrom52wLow: NumericRange;

  // Categorical / Signals
  technicalSignal: TechnicalSignal | "All";
}

/**
 * Sorting Configuration
 */
export type SortableField = keyof Pick<
  Stock,
  | "ticker"
  | "name"
  | "price"
  | "change"
  | "changePercent"
  | "volume"
  | "relativeVolume"
  | "marketCap"
  | "peRatio"
  | "dividendYield"
  | "rsi14"
  | "beta"
  | "sector"
  | "industry"
>;

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortableField;
  direction: SortDirection;
}

/**
 * Real-time Streaming Tick / Delta update
 */
export interface StockTickDelta {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  bid: number;
  ask: number;
  rsi14: number;
  timestamp: number;
}
