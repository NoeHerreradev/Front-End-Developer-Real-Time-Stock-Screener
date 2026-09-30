/**
 * INDEXEDDB PERSISTENCE LAYER
 * Fast, non-blocking browser storage for offline stock universe hydration & watchlists.
 */

import { Stock } from "@/types/stock";

const DB_NAME = "StockScreenerDB";
const DB_VERSION = 1;

const STORES = {
  STOCKS: "stocks_universe",
  WATCHLIST: "user_watchlist",
  METADATA: "sync_metadata",
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.STOCKS)) {
        const stockStore = db.createObjectStore(STORES.STOCKS, { keyPath: "ticker" });
        stockStore.createIndex("sector", "sector", { unique: false });
        stockStore.createIndex("marketCap", "marketCap", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.WATCHLIST)) {
        db.createObjectStore(STORES.WATCHLIST, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves the full 5,000+ stock universe to IndexedDB
 */
export async function saveUniverseToIDB(stocks: Stock[]): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORES.STOCKS, STORES.METADATA], "readwrite");
    const stockStore = tx.objectStore(STORES.STOCKS);
    const metaStore = tx.objectStore(STORES.METADATA);

    // Clear and batch write
    stockStore.clear();
    for (const stock of stocks) {
      stockStore.put(stock);
    }

    metaStore.put({
      key: "last_universe_sync",
      timestamp: Date.now(),
      count: stocks.length,
    });

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn("Failed to write universe to IndexedDB:", err);
    return false;
  }
}

/**
 * Loads the stock universe from IndexedDB
 */
export async function loadUniverseFromIDB(): Promise<{ stocks: Stock[]; lastSync: number | null }> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORES.STOCKS, STORES.METADATA], "readonly");
    const stockStore = tx.objectStore(STORES.STOCKS);
    const metaStore = tx.objectStore(STORES.METADATA);

    const getAllReq = stockStore.getAll();
    const getMetaReq = metaStore.get("last_universe_sync");

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        const stocks = (getAllReq.result as Stock[]) || [];
        const meta = getMetaReq.result as { timestamp: number } | undefined;
        resolve({
          stocks,
          lastSync: meta?.timestamp || null,
        });
      };
      tx.onerror = () => {
        resolve({ stocks: [], lastSync: null });
      };
    });
  } catch (err) {
    console.warn("Failed to load universe from IndexedDB:", err);
    return { stocks: [], lastSync: null };
  }
}

/**
 * Saves user watchlist to IndexedDB
 */
export async function saveWatchlistToIDB(watchlist: string[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.WATCHLIST, "readwrite");
    const store = tx.objectStore(STORES.WATCHLIST);
    store.put({ id: "current_watchlist", tickers: watchlist, updatedAt: Date.now() });
  } catch (err) {
    console.warn("Failed to save watchlist to IndexedDB:", err);
  }
}

/**
 * Loads user watchlist from IndexedDB
 */
export async function loadWatchlistFromIDB(): Promise<string[] | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.WATCHLIST, "readonly");
    const store = tx.objectStore(STORES.WATCHLIST);
    const request = store.get("current_watchlist");

    return new Promise((resolve) => {
      request.onsuccess = () => {
        if (request.result && Array.isArray(request.result.tickers)) {
          resolve(request.result.tickers);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
