# Front-End Developer — Real-Time Stock Screener

Institutional-grade, real-time financial stock screener built with **Next.js 14**, **TypeScript**, **Zustand**, **TanStack Table**, **TanStack Virtual**, **TradingView Lightweight Charts**, and **IndexedDB**.

## ✨ Features

- ⚡ **Real-Time Streaming Simulation**: High-frequency ticks generated via Geometric Brownian Motion (GBM) with `requestAnimationFrame` render batching.
- 🚀 **High Performance Table**: Virtualized scrolling over 5,000+ equities with granular cell-level memoization and sub-300ms flash animations.
- 🎯 **Advanced Filter Engine**: 30+ criteria multi-filter pipeline evaluated in under 15ms.
- 📊 **Interactive Technical Charts**: Candlestick charts powered by TradingView Lightweight Charts with overlays for SMA, EMA, Bollinger Bands, RSI, and Volume.
- 💾 **IndexedDB Persistence**: Offline resilience and instant client-side state hydration.
- 🌗 **Dark Mode & Institutional UI**: Responsive design with full keyboard shortcuts and export capabilities (CSV / JSON).

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **State Management**: Zustand + Immer
- **Data & Tables**: TanStack React Table v8 + TanStack React Virtual v3
- **Charts**: TradingView Lightweight Charts v5
- **Styling**: Tailwind CSS & Lucide Icons

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/NoeHerreradev/Front-End-Developer-Real-Time-Stock-Screener.git
cd Front-End-Developer-Real-Time-Stock-Screener
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Documentation

- [Architecture & Design Details](ARCHITECTURE.md)
- [Performance & Benchmark Report](PERFORMANCE_REPORT.md)
