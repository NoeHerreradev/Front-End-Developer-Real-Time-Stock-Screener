/**
 * LIB: SYNTHETIC REAL-TIME STOCK MARKET UNIVERSE GENERATOR
 * Generates 5,000+ realistic equities with financial fundamentals,
 * technical indicators, valuations, and intraday sparkline series.
 */

import {
  Exchange,
  MarketCapCategory,
  Sector,
  Stock,
  StockTickDelta,
  TechnicalSignal,
} from "@/types/stock";

// Real-world reference sectors and realistic sub-industries
const SECTOR_INDUSTRIES: Record<Sector, string[]> = {
  Technology: [
    "Semiconductors",
    "Software - Infrastructure",
    "Software - Application",
    "Consumer Electronics",
    "Information Technology Services",
    "Computer Hardware",
    "Communication Equipment",
    "Electronic Components",
  ],
  Healthcare: [
    "Biotechnology",
    "Drug Manufacturers - General",
    "Medical Devices",
    "Healthcare Plans",
    "Diagnostics & Research",
    "Medical Instruments & Supplies",
    "Medical Care Facilities",
  ],
  "Financial Services": [
    "Banks - Diversified",
    "Banks - Regional",
    "Asset Management",
    "Credit Services",
    "Insurance - Diversified",
    "Capital Markets",
    "Financial Data & Stock Exchanges",
  ],
  "Consumer Cyclical": [
    "Internet Retail",
    "Auto Manufacturers",
    "Apparel Retail",
    "Restaurants",
    "Home Improvement Retail",
    "Footwear & Accessories",
    "Travel Services",
    "Specialty Retail",
  ],
  "Communication Services": [
    "Internet Content & Information",
    "Telecom Services",
    "Entertainment",
    "Electronic Gaming & Multimedia",
    "Advertising Agencies",
    "Publishing",
  ],
  Industrials: [
    "Aerospace & Defense",
    "Specialty Industrial Machinery",
    "Integrated Freight & Logistics",
    "Railroads",
    "Airlines",
    "Building Products & Equipment",
    "Electrical Equipment & Parts",
    "Conglomerates",
  ],
  "Consumer Defensive": [
    "Beverages - Non-Alcoholic",
    "Packaged Foods",
    "Discount Stores",
    "Household & Personal Products",
    "Tobacco",
    "Food Distribution",
    "Confectioners",
  ],
  Energy: [
    "Oil & Gas Integrated",
    "Oil & Gas E&P",
    "Oil & Gas Refining & Marketing",
    "Oil & Gas Equipment & Services",
    "Thermal Coal",
    "Uranium",
    "Clean Energy Infrastructure",
  ],
  "Real Estate": [
    "REIT - Specialty",
    "REIT - Industrial",
    "REIT - Residential",
    "REIT - Retail",
    "REIT - Office",
    "REIT - Healthcare Facilities",
    "Real Estate Services",
  ],
  "Basic Materials": [
    "Specialty Chemicals",
    "Copper & Base Metals",
    "Gold & Precious Metals",
    "Steel & Iron",
    "Agricultural Inputs",
    "Building Materials",
    "Aluminum",
  ],
  Utilities: [
    "Utilities - Regulated Electric",
    "Utilities - Diversified",
    "Utilities - Renewable",
    "Utilities - Regulated Gas",
    "Utilities - Regulated Water",
  ],
};

const EXCHANGES: Exchange[] = ["NASDAQ", "NYSE", "AMEX", "CBOE", "BATS"];

// Seed anchors for major benchmark stocks
interface AnchorStock {
  ticker: string;
  name: string;
  sector: Sector;
  industry: string;
  exchange: Exchange;
  basePrice: number;
  baseMarketCap: number;
}

const ANCHOR_STOCKS: AnchorStock[] = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", industry: "Consumer Electronics", exchange: "NASDAQ", basePrice: 228.5, baseMarketCap: 3480000000000 },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology", industry: "Software - Infrastructure", exchange: "NASDAQ", basePrice: 428.2, baseMarketCap: 3180000000000 },
  { ticker: "NVDA", name: "NVIDIA Corp.", sector: "Technology", industry: "Semiconductors", exchange: "NASDAQ", basePrice: 121.4, baseMarketCap: 2980000000000 },
  { ticker: "GOOGL", name: "Alphabet Inc. (Class A)", sector: "Communication Services", industry: "Internet Content & Information", exchange: "NASDAQ", basePrice: 164.8, baseMarketCap: 2050000000000 },
  { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical", industry: "Internet Retail", exchange: "NASDAQ", basePrice: 187.9, baseMarketCap: 1960000000000 },
  { ticker: "META", name: "Meta Platforms Inc.", sector: "Communication Services", industry: "Internet Content & Information", exchange: "NASDAQ", basePrice: 568.3, baseMarketCap: 1440000000000 },
  { ticker: "TSLA", name: "Tesla Inc.", sector: "Consumer Cyclical", industry: "Auto Manufacturers", exchange: "NASDAQ", basePrice: 254.2, baseMarketCap: 810000000000 },
  { ticker: "BRK.A", name: "Berkshire Hathaway Inc.", sector: "Financial Services", industry: "Insurance - Diversified", exchange: "NYSE", basePrice: 684200.0, baseMarketCap: 990000000000 },
  { ticker: "LLY", name: "Eli Lilly and Co.", sector: "Healthcare", industry: "Drug Manufacturers - General", exchange: "NYSE", basePrice: 890.1, baseMarketCap: 846000000000 },
  { ticker: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial Services", industry: "Banks - Diversified", exchange: "NYSE", basePrice: 212.4, baseMarketCap: 605000000000 },
  { ticker: "V", name: "Visa Inc.", sector: "Financial Services", industry: "Credit Services", exchange: "NYSE", basePrice: 272.8, baseMarketCap: 554000000000 },
  { ticker: "UNH", name: "UnitedHealth Group Inc.", sector: "Healthcare", industry: "Healthcare Plans", exchange: "NYSE", basePrice: 585.6, baseMarketCap: 540000000000 },
  { ticker: "XOM", name: "Exxon Mobil Corp.", sector: "Energy", industry: "Oil & Gas Integrated", exchange: "NYSE", basePrice: 116.3, baseMarketCap: 462000000000 },
  { ticker: "HD", name: "The Home Depot Inc.", sector: "Consumer Cyclical", industry: "Home Improvement Retail", exchange: "NYSE", basePrice: 395.4, baseMarketCap: 392000000000 },
  { ticker: "MA", name: "Mastercard Inc.", sector: "Financial Services", industry: "Credit Services", exchange: "NYSE", basePrice: 489.1, baseMarketCap: 454000000000 },
  { ticker: "COST", name: "Costco Wholesale Corp.", sector: "Consumer Defensive", industry: "Discount Stores", exchange: "NASDAQ", basePrice: 896.7, baseMarketCap: 398000000000 },
  { ticker: "PG", name: "Procter & Gamble Co.", sector: "Consumer Defensive", industry: "Household & Personal Products", exchange: "NYSE", basePrice: 172.5, baseMarketCap: 405000000000 },
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", industry: "Drug Manufacturers - General", exchange: "NYSE", basePrice: 161.2, baseMarketCap: 388000000000 },
  { ticker: "AMD", name: "Advanced Micro Devices", sector: "Technology", industry: "Semiconductors", exchange: "NASDAQ", basePrice: 156.3, baseMarketCap: 252000000000 },
  { ticker: "CRM", name: "Salesforce Inc.", sector: "Technology", industry: "Software - Application", exchange: "NYSE", basePrice: 274.5, baseMarketCap: 265000000000 },
  { ticker: "NFLX", name: "Netflix Inc.", sector: "Communication Services", industry: "Entertainment", exchange: "NASDAQ", basePrice: 712.4, baseMarketCap: 306000000000 },
  { ticker: "ABBV", name: "AbbVie Inc.", sector: "Healthcare", industry: "Drug Manufacturers - General", exchange: "NYSE", basePrice: 194.2, baseMarketCap: 343000000000 },
  { ticker: "CVX", name: "Chevron Corp.", sector: "Energy", industry: "Oil & Gas Integrated", exchange: "NYSE", basePrice: 148.9, baseMarketCap: 275000000000 },
  { ticker: "KO", name: "The Coca-Cola Co.", sector: "Consumer Defensive", industry: "Beverages - Non-Alcoholic", exchange: "NYSE", basePrice: 71.3, baseMarketCap: 307000000000 },
  { ticker: "PEP", name: "PepsiCo Inc.", sector: "Consumer Defensive", industry: "Beverages - Non-Alcoholic", exchange: "NASDAQ", basePrice: 173.8, baseMarketCap: 238000000000 },
  { ticker: "LIN", name: "Linde plc", sector: "Basic Materials", industry: "Specialty Chemicals", exchange: "NASDAQ", basePrice: 462.1, baseMarketCap: 221000000000 },
  { ticker: "NEE", name: "NextEra Energy Inc.", sector: "Utilities", industry: "Utilities - Regulated Electric", exchange: "NYSE", basePrice: 84.5, baseMarketCap: 174000000000 },
  { ticker: "PLD", name: "Prologis Inc.", sector: "Real Estate", industry: "REIT - Industrial", exchange: "NYSE", basePrice: 124.8, baseMarketCap: 115000000000 },
  { ticker: "CAT", name: "Caterpillar Inc.", sector: "Industrials", industry: "Specialty Industrial Machinery", exchange: "NYSE", basePrice: 382.4, baseMarketCap: 185000000000 },
  { ticker: "GE", name: "GE Aerospace", sector: "Industrials", industry: "Aerospace & Defense", exchange: "NYSE", basePrice: 188.6, baseMarketCap: 204000000000 },
];

// Helper: Pseudo-random number generator with deterministic seed support
class PRNG {
  private seed: number;

  constructor(seed = 133742) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  choice<T>(arr: readonly T[]): T {
    const idx = Math.floor(this.next() * arr.length);
    return arr[idx]!;
  }
}

/**
 * Assigns Cap Category from numerical market cap
 */
export function getMarketCapCategory(cap: number): MarketCapCategory {
  if (cap >= 200_000_000_000) return "Mega";
  if (cap >= 10_000_000_000) return "Large";
  if (cap >= 2_000_000_000) return "Mid";
  if (cap >= 300_000_000) return "Small";
  if (cap >= 50_000_000) return "Micro";
  return "Nano";
}

/**
 * Generates an intraday sparkline sequence reflecting today's price trajectory
 */
function generateSparkline(
  currentPrice: number,
  changePercent: number,
  prng: PRNG,
  pointsCount = 20
): { time: number; price: number }[] {
  const points: { time: number; price: number }[] = [];
  const openPrice = currentPrice / (1 + changePercent / 100);
  const now = Date.now();
  const timeStep = (6.5 * 3600 * 1000) / pointsCount; // 6.5 market hours
  let walker = openPrice;

  for (let i = 0; i < pointsCount; i++) {
    const progress = i / (pointsCount - 1);
    const target = openPrice + (currentPrice - openPrice) * progress;
    const noise = (prng.next() - 0.5) * (currentPrice * 0.015);
    walker = Math.max(0.01, target + noise);
    if (i === pointsCount - 1) walker = currentPrice;

    points.push({
      time: now - (pointsCount - 1 - i) * timeStep,
      price: Math.round(walker * 100) / 100,
    });
  }

  return points;
}

/**
 * Derives Technical Signal rating based on RSI and moving averages
 */
function deriveTechnicalSignal(rsi: number, price: number, sma50: number): TechnicalSignal {
  if (rsi > 70 && price > sma50) return "Strong Buy";
  if (rsi > 55 && price >= sma50) return "Buy";
  if (rsi < 30 && price < sma50) return "Strong Sell";
  if (rsi < 45 && price < sma50) return "Sell";
  return "Neutral";
}

/**
 * Generates Ticker symbol for synthetic additions
 */
function generateTickerSymbol(index: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let num = index;
  let ticker = "";
  
  // Create 3 to 4 letter unique tickers
  for (let i = 0; i < 4; i++) {
    ticker = chars[num % 26] + ticker;
    num = Math.floor(num / 26);
  }
  return ticker;
}

const COMPANY_PREFIXES = [
  "Apex", "Vertex", "Quantum", "Nova", "Stellar", "Omni", "Global", "Pacific",
  "Atlas", "Aero", "Bio", "Cyber", "Synapse", "Aura", "Vanguard", "Pinnacle",
  "Summit", "Beacon", "Crest", "Horizon", "Kinetic", "Alpha", "Titan", "Solar",
  "Infra", "Core", "Dynamic", "Astra", "Echo", "Helios", "Zenith", "Stratosphere",
  "Nexus", "Optima", "Prime", "Valence", "Pulse", "Terra", "Matrix", "Fusion"
];

const COMPANY_SUFFIXES = [
  "Technologies", "Therapeutics", "Holdings", "Energy", "Financial", "Capital",
  "Systems", "Networks", "Industries", "Pharma", "Logistics", "Digital",
  "Solutions", "Enterprises", "Resources", "Robotics", "Biosciences", "Dynamics",
  "Semiconductors", "Communications", "Corp.", "Inc.", "Group", "International"
];

/**
 * Builds a Universe of 5,000+ synthetic stocks with realistic financial and technical metrics
 * @param count Number of stocks to generate (defaults to 5,200)
 * @param seed Seed for deterministic generation
 */
export function generateStockUniverse(count = 5200, seed = 42890): Stock[] {
  const prng = new PRNG(seed);
  const stocks: Stock[] = [];
  const sectors = Object.keys(SECTOR_INDUSTRIES) as Sector[];
  const usedTickers = new Set<string>();

  // 1. First add the 30 anchor mega-stocks
  for (const anchor of ANCHOR_STOCKS) {
    usedTickers.add(anchor.ticker);
    
    const changePercent = Math.round(prng.range(-4.5, 5.2) * 100) / 100;
    const price = Math.round(anchor.basePrice * (1 + prng.range(-0.02, 0.02)) * 100) / 100;
    const previousClose = Math.round((price / (1 + changePercent / 100)) * 100) / 100;
    const change = Math.round((price - previousClose) * 100) / 100;
    const dayLow = Math.round(Math.min(price, previousClose) * (1 - prng.range(0.005, 0.02)) * 100) / 100;
    const dayHigh = Math.round(Math.max(price, previousClose) * (1 + prng.range(0.005, 0.02)) * 100) / 100;
    const rsi14 = Math.round(prng.range(28, 76) * 10) / 10;
    const beta = Math.round(prng.range(0.65, 1.85) * 100) / 100;
    const volume = Math.floor(prng.range(15_000_000, 75_000_000));
    const avgVolume3Month = Math.floor(volume * prng.range(0.8, 1.25));
    const relativeVolume = Math.round((volume / avgVolume3Month) * 100) / 100;

    const peRatio = anchor.sector === "Technology" 
      ? Math.round(prng.range(26, 68) * 10) / 10
      : Math.round(prng.range(12, 32) * 10) / 10;

    const dividendYield = anchor.sector === "Utilities" || anchor.sector === "Real Estate" || anchor.sector === "Consumer Defensive"
      ? Math.round(prng.range(2.1, 5.4) * 100) / 100
      : Math.round(prng.range(0.0, 2.2) * 100) / 100;

    const fiftyTwoWeekHigh = Math.round(Math.max(price, dayHigh) * prng.range(1.02, 1.35) * 100) / 100;
    const fiftyTwoWeekLow = Math.round(Math.min(price, dayLow) * prng.range(0.65, 0.95) * 100) / 100;

    const sma50 = Math.round(price * prng.range(0.92, 1.08) * 100) / 100;
    const sma200 = Math.round(price * prng.range(0.85, 1.15) * 100) / 100;

    const spread = Math.round(Math.max(0.01, price * 0.0002) * 100) / 100;
    const bid = Math.round((price - spread / 2) * 100) / 100;
    const ask = Math.round((price + spread / 2) * 100) / 100;

    stocks.push({
      id: `stock_${anchor.ticker}`,
      ticker: anchor.ticker,
      name: anchor.name,
      exchange: anchor.exchange,
      sector: anchor.sector,
      industry: anchor.industry,
      country: "USA",
      currency: "USD",
      price,
      change,
      changePercent,
      previousClose,
      open: Math.round(previousClose * (1 + prng.range(-0.01, 0.01)) * 100) / 100,
      dayHigh,
      dayLow,
      bid,
      ask,
      bidSize: Math.floor(prng.range(100, 1500)),
      askSize: Math.floor(prng.range(100, 1500)),
      spread,
      lastUpdated: Date.now() - Math.floor(prng.range(100, 15000)),
      volume,
      avgVolume3Month,
      relativeVolume,
      volumeWeightedAveragePrice: Math.round(((dayHigh + dayLow + price) / 3) * 100) / 100,
      marketCap: anchor.baseMarketCap,
      marketCapCategory: getMarketCapCategory(anchor.baseMarketCap),
      sharesOutstanding: Math.floor(anchor.baseMarketCap / price),
      floatShares: Math.floor((anchor.baseMarketCap / price) * 0.92),
      enterpriseValue: Math.round(anchor.baseMarketCap * prng.range(0.95, 1.15)),
      peRatio,
      forwardPE: peRatio ? Math.round(peRatio * prng.range(0.85, 1.1) * 10) / 10 : null,
      pegRatio: Math.round(prng.range(0.9, 2.8) * 100) / 100,
      priceToBook: Math.round(prng.range(2.5, 18.0) * 10) / 10,
      priceToSales: Math.round(prng.range(2.0, 15.0) * 10) / 10,
      evToEbitda: Math.round(prng.range(10.0, 35.0) * 10) / 10,
      dividendYield,
      dividendRate: Math.round(((price * dividendYield) / 100) * 100) / 100,
      payoutRatio: dividendYield > 0 ? Math.round(prng.range(20, 65) * 10) / 10 : null,
      eps: Math.round((price / (peRatio || 25)) * 100) / 100,
      epsGrowth5Y: Math.round(prng.range(4.0, 35.0) * 10) / 10,
      revenueGrowthYoY: Math.round(prng.range(2.0, 42.0) * 10) / 10,
      grossMargin: Math.round(prng.range(35, 78) * 10) / 10,
      operatingMargin: Math.round(prng.range(15, 45) * 10) / 10,
      netMargin: Math.round(prng.range(10, 32) * 10) / 10,
      roe: Math.round(prng.range(12, 48) * 10) / 10,
      roa: Math.round(prng.range(5, 22) * 10) / 10,
      debtToEquity: Math.round(prng.range(0.2, 2.5) * 100) / 100,
      currentRatio: Math.round(prng.range(1.1, 3.2) * 100) / 100,
      freeCashFlow: Math.round(anchor.baseMarketCap * prng.range(0.03, 0.08)),
      rsi14,
      beta,
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
      fiftyTwoWeekChange: Math.round(prng.range(-20, 85) * 10) / 10,
      distanceFrom52wHigh: Math.round(((price - fiftyTwoWeekHigh) / fiftyTwoWeekHigh) * 10000) / 100,
      distanceFrom52wLow: Math.round(((price - fiftyTwoWeekLow) / fiftyTwoWeekLow) * 10000) / 100,
      sma20: Math.round(price * prng.range(0.97, 1.03) * 100) / 100,
      sma50,
      sma200,
      macd: {
        macd: Math.round(prng.range(-4.0, 6.0) * 100) / 100,
        signal: Math.round(prng.range(-3.0, 5.0) * 100) / 100,
        histogram: Math.round(prng.range(-1.5, 1.5) * 100) / 100,
      },
      bollingerBands: {
        upper: Math.round(price * 1.06 * 100) / 100,
        middle: price,
        lower: Math.round(price * 0.94 * 100) / 100,
      },
      atr14: Math.round(price * prng.range(0.015, 0.035) * 100) / 100,
      volatility30d: Math.round(prng.range(16, 42) * 10) / 10,
      shortInterestPercent: Math.round(prng.range(0.8, 4.5) * 100) / 100,
      shortRatio: Math.round(prng.range(1.1, 4.2) * 10) / 10,
      analystRatingScore: Math.round(prng.range(1.2, 3.4) * 10) / 10,
      analystConsensus: "Buy",
      technicalSummary: deriveTechnicalSignal(rsi14, price, sma50),
      sparkline: generateSparkline(price, changePercent, prng),
    });
  }

  // 2. Synthetically generate the remaining equities up to the target count
  const remainingCount = Math.max(0, count - ANCHOR_STOCKS.length);
  for (let i = 0; i < remainingCount; i++) {
    // Generate distinct ticker
    let ticker = generateTickerSymbol(i + 100);
    while (usedTickers.has(ticker)) {
      ticker = generateTickerSymbol(Math.floor(prng.range(1000, 999999)));
    }
    usedTickers.add(ticker);

    const sector = prng.choice(sectors);
    const industries = SECTOR_INDUSTRIES[sector];
    const industry = prng.choice(industries);
    const exchange = prng.choice(EXCHANGES);

    // Realistic log-normal market cap distribution: from $20M nano to $120B large
    const capExponent = prng.range(7.3, 11.1); // 10^7.3 (~$20M) to 10^11.1 (~$125B)
    const marketCap = Math.round(Math.pow(10, capExponent));
    const marketCapCategory = getMarketCapCategory(marketCap);

    // Realistic price distribution ($3.50 to $480.00)
    const priceRaw = Math.pow(10, prng.range(0.55, 2.68));
    const price = Math.round(priceRaw * 100) / 100;

    // Daily change percent (-14% to +16%, normal skew)
    const changeSkew = (prng.next() + prng.next() + prng.next() - 1.5) * 6.5;
    const changePercent = Math.round(changeSkew * 100) / 100;
    const previousClose = Math.round((price / (1 + changePercent / 100)) * 100) / 100;
    const change = Math.round((price - previousClose) * 100) / 100;

    const dayIntraVolatility = prng.range(0.01, 0.05);
    const dayLow = Math.round(Math.min(price, previousClose) * (1 - dayIntraVolatility * prng.range(0.3, 1.0)) * 100) / 100;
    const dayHigh = Math.round(Math.max(price, previousClose) * (1 + dayIntraVolatility * prng.range(0.3, 1.0)) * 100) / 100;

    // Volume scaled by market cap
    const avgVolume3Month = Math.floor(Math.pow(10, prng.range(4.5, 7.2)));
    const volumeMultiplier = prng.range(0.4, 2.8);
    const volume = Math.floor(avgVolume3Month * volumeMultiplier);
    const relativeVolume = Math.round((volume / avgVolume3Month) * 100) / 100;

    // RSI: standard distribution 18 to 82
    const rsi14 = Math.round(prng.range(18, 82) * 10) / 10;
    
    // Beta: mean ~ 1.05
    const beta = Math.round(prng.range(0.25, 2.85) * 100) / 100;

    // P/E Ratio: 15% unprofitable/early stage (null), else 6 - 85
    const isUnprofitable = prng.next() < 0.15;
    const peRatio = isUnprofitable ? null : Math.round(prng.range(6.5, 75.0) * 10) / 10;
    const forwardPE = peRatio ? Math.round(peRatio * prng.range(0.8, 1.2) * 10) / 10 : null;

    // Dividend Yield
    const paysDividend = (sector === "Utilities" || sector === "Real Estate" || sector === "Financial Services")
      ? prng.next() > 0.15
      : prng.next() > 0.65;
    const dividendYield = paysDividend ? Math.round(prng.range(0.8, 6.8) * 100) / 100 : 0;
    const dividendRate = Math.round(((price * dividendYield) / 100) * 100) / 100;

    // 52-Week Range
    const fiftyTwoWeekHigh = Math.round(Math.max(price, dayHigh) * prng.range(1.02, 1.65) * 100) / 100;
    const fiftyTwoWeekLow = Math.round(Math.min(price, dayLow) * prng.range(0.45, 0.97) * 100) / 100;
    const fiftyTwoWeekChange = Math.round(prng.range(-45, 110) * 10) / 10;
    const distanceFrom52wHigh = Math.round(((price - fiftyTwoWeekHigh) / fiftyTwoWeekHigh) * 10000) / 100;
    const distanceFrom52wLow = Math.round(((price - fiftyTwoWeekLow) / fiftyTwoWeekLow) * 10000) / 100;

    // Moving Averages
    const sma20 = Math.round(price * prng.range(0.95, 1.05) * 100) / 100;
    const sma50 = Math.round(price * prng.range(0.88, 1.12) * 100) / 100;
    const sma200 = Math.round(price * prng.range(0.75, 1.25) * 100) / 100;

    // Spread & Bids
    const spreadPct = marketCapCategory === "Nano" || marketCapCategory === "Micro" ? 0.003 : 0.0005;
    const spread = Math.round(Math.max(0.01, price * spreadPct) * 100) / 100;
    const bid = Math.round((price - spread / 2) * 100) / 100;
    const ask = Math.round((price + spread / 2) * 100) / 100;

    // Company Name synthesis
    const prefix = prng.choice(COMPANY_PREFIXES);
    const suffix = prng.choice(COMPANY_SUFFIXES);
    const name = `${prefix} ${suffix}`;

    // Short interest
    const shortInterestPercent = Math.round(prng.range(0.5, 22.5) * 100) / 100;
    const shortRatio = Math.round(prng.range(0.8, 8.5) * 10) / 10;

    const analystScore = Math.round(prng.range(1.0, 5.0) * 10) / 10;
    const analystConsensus: TechnicalSignal =
      analystScore <= 1.8 ? "Strong Buy" :
      analystScore <= 2.6 ? "Buy" :
      analystScore <= 3.4 ? "Neutral" :
      analystScore <= 4.2 ? "Sell" : "Strong Sell";

    const technicalSummary = deriveTechnicalSignal(rsi14, price, sma50);
    const sharesOutstanding = Math.floor(marketCap / price);

    stocks.push({
      id: `stock_${ticker}`,
      ticker,
      name,
      exchange,
      sector,
      industry,
      country: "USA",
      currency: "USD",
      price,
      change,
      changePercent,
      previousClose,
      open: Math.round(previousClose * (1 + prng.range(-0.02, 0.02)) * 100) / 100,
      dayHigh,
      dayLow,
      bid,
      ask,
      bidSize: Math.floor(prng.range(50, 800)),
      askSize: Math.floor(prng.range(50, 800)),
      spread,
      lastUpdated: Date.now() - Math.floor(prng.range(50, 20000)),
      volume,
      avgVolume3Month,
      relativeVolume,
      volumeWeightedAveragePrice: Math.round(((dayHigh + dayLow + price) / 3) * 100) / 100,
      marketCap,
      marketCapCategory,
      sharesOutstanding,
      floatShares: Math.floor(sharesOutstanding * prng.range(0.75, 0.98)),
      enterpriseValue: Math.round(marketCap * prng.range(0.9, 1.3)),
      peRatio,
      forwardPE,
      pegRatio: peRatio ? Math.round(prng.range(0.7, 3.5) * 100) / 100 : null,
      priceToBook: Math.round(prng.range(0.8, 22.0) * 10) / 10,
      priceToSales: Math.round(prng.range(0.5, 18.0) * 10) / 10,
      evToEbitda: isUnprofitable ? null : Math.round(prng.range(6.0, 40.0) * 10) / 10,
      dividendYield,
      dividendRate,
      payoutRatio: dividendYield > 0 ? Math.round(prng.range(15, 80) * 10) / 10 : null,
      eps: peRatio ? Math.round((price / peRatio) * 100) / 100 : Math.round(prng.range(-4.5, -0.1) * 100) / 100,
      epsGrowth5Y: Math.round(prng.range(-15.0, 45.0) * 10) / 10,
      revenueGrowthYoY: Math.round(prng.range(-10.0, 60.0) * 10) / 10,
      grossMargin: Math.round(prng.range(20, 85) * 10) / 10,
      operatingMargin: Math.round(prng.range(-12, 40) * 10) / 10,
      netMargin: Math.round(prng.range(-15, 30) * 10) / 10,
      roe: Math.round(prng.range(-10, 50) * 10) / 10,
      roa: Math.round(prng.range(-5, 25) * 10) / 10,
      debtToEquity: Math.round(prng.range(0.1, 4.0) * 100) / 100,
      currentRatio: Math.round(prng.range(0.7, 4.5) * 100) / 100,
      freeCashFlow: Math.round(marketCap * prng.range(-0.02, 0.1)),
      rsi14,
      beta,
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
      fiftyTwoWeekChange,
      distanceFrom52wHigh,
      distanceFrom52wLow,
      sma20,
      sma50,
      sma200,
      macd: {
        macd: Math.round(prng.range(-3.5, 4.5) * 100) / 100,
        signal: Math.round(prng.range(-2.8, 3.8) * 100) / 100,
        histogram: Math.round(prng.range(-1.2, 1.2) * 100) / 100,
      },
      bollingerBands: {
        upper: Math.round(price * 1.08 * 100) / 100,
        middle: price,
        lower: Math.round(price * 0.92 * 100) / 100,
      },
      atr14: Math.round(price * prng.range(0.02, 0.06) * 100) / 100,
      volatility30d: Math.round(prng.range(18, 65) * 10) / 10,
      shortInterestPercent,
      shortRatio,
      analystRatingScore: analystScore,
      analystConsensus,
      technicalSummary,
      sparkline: generateSparkline(price, changePercent, prng),
    });
  }

  return stocks;
}

/**
 * Singleton cache for the universe to avoid expensive re-computations
 */
let cachedUniverse: Stock[] | null = null;

export function getStockUniverse(): Stock[] {
  if (!cachedUniverse) {
    cachedUniverse = generateStockUniverse(5200);
  }
  return cachedUniverse;
}

/**
 * Simulates high-frequency WebSocket tick delta updates across a random subset of stocks
 */
export function generateMarketTicks(
  universe: Stock[],
  tickBatchSize = 25
): StockTickDelta[] {
  const deltas: StockTickDelta[] = [];
  const total = universe.length;
  if (total === 0) return deltas;

  for (let i = 0; i < tickBatchSize; i++) {
    const randomIndex = Math.floor(Math.random() * total);
    const stock = universe[randomIndex];
    if (!stock) continue;

    // Micro price fluctuation (-0.5% to +0.5%)
    const pctChange = (Math.random() - 0.495) * 0.008;
    const newPrice = Math.max(0.05, Math.round(stock.price * (1 + pctChange) * 100) / 100);
    const priceDiff = Math.round((newPrice - stock.price) * 100) / 100;
    const newChange = Math.round((stock.change + priceDiff) * 100) / 100;
    const newChangePercent = Math.round(((newPrice - stock.previousClose) / stock.previousClose) * 10000) / 100;
    const volumeDelta = Math.floor(Math.random() * 500) + 10;
    const newVolume = stock.volume + volumeDelta;
    const newDayHigh = Math.max(stock.dayHigh, newPrice);
    const newDayLow = Math.min(stock.dayLow, newPrice);
    const spread = Math.max(0.01, Math.round(newPrice * 0.0004 * 100) / 100);
    const newRsi = Math.min(99, Math.max(1, Math.round((stock.rsi14 + (pctChange > 0 ? 0.2 : -0.2)) * 10) / 10));

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
      timestamp: Date.now(),
    });
  }

  return deltas;
}
