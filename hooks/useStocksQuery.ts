import { useQuery } from "@tanstack/react-query";
import { Stock } from "@/types/stock";
import { generateStockUniverse } from "@/lib/mock-data";

interface StocksApiResponse {
  success: boolean;
  count: number;
  timestamp: number;
  data: Stock[];
}

export const STOCKS_QUERY_KEY = ["stocks", "universe"] as const;

export function useStocksQuery() {
  return useQuery<Stock[], Error>({
    queryKey: STOCKS_QUERY_KEY,
    queryFn: async () => {
      // In-browser or client-side direct fallback / API fetch
      try {
        const response = await fetch("/api/stocks");
        if (!response.ok) {
          throw new Error(`API HTTP error! Status: ${response.status}`);
        }
        const json: StocksApiResponse = await response.json();
        return json.data;
      } catch (err) {
        // Fallback to local deterministic generator if running in static or offline mode
        console.warn("API route unreachable, generating universe on client:", err);
        return generateStockUniverse(5200);
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
