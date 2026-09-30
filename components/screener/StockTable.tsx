"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Stock, SortableField } from "@/types/stock";
import {
  formatMarketCap,
} from "@/lib/formatters";
import {
  MemoizedPriceCell,
  MemoizedChangePercentCell,
  MemoizedChangeCell,
  MemoizedRsiCell,
  MemoizedVolumeCell,
  MemoizedRatioCell,
} from "./StockTableCells";
import {
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";

interface StockTableProps {
  stocks: Stock[];
  watchlist: string[];
  onToggleWatchlist: (ticker: string) => void;
  onInspectStock: (stock: Stock) => void;
  onSelectStock?: (stock: Stock) => void;
  selectedTicker?: string | null;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSortChange: (field: SortableField) => void;
}

const ROW_HEIGHT = 36; // Strict 36px fixed row height
const OVERSCAN = 15; // Strict 15 rows overscan

export function StockTable({
  stocks,
  watchlist,
  onToggleWatchlist,
  onInspectStock,
  onSelectStock,
  selectedTicker,
  sortField,
  sortDirection,
  onSortChange,
}: StockTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Sync selected index when selectedTicker prop changes from outside
  useEffect(() => {
    if (selectedTicker && stocks.length > 0) {
      const idx = stocks.findIndex((s) => s.ticker === selectedTicker);
      if (idx >= 0 && idx !== selectedIndex) {
        setSelectedIndex(idx);
      }
    }
  }, [selectedTicker, stocks, selectedIndex]);

  // Keep selected index within valid bounds when filtered list changes
  useEffect(() => {
    if (selectedIndex >= stocks.length && stocks.length > 0) {
      setSelectedIndex(stocks.length - 1);
    }
  }, [stocks.length, selectedIndex]);

  // Notify parent on active selection change
  useEffect(() => {
    const current = stocks[selectedIndex];
    if (current && onSelectStock) {
      onSelectStock(current);
    }
  }, [selectedIndex, stocks, onSelectStock]);

  // Table Columns Definition with Pinned 'Símbolo' (Ticker) column
  const columns = useMemo<ColumnDef<Stock, any>[]>(
    () => [
      {
        id: "watchlist",
        header: "★",
        size: 38,
        cell: ({ row }) => {
          const isStarred = watchlist.includes(row.original.ticker);
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(row.original.ticker);
              }}
              aria-label={
                isStarred
                  ? `Remover ${row.original.ticker} de la watchlist`
                  : `Agregar ${row.original.ticker} a la watchlist`
              }
              className="p-1 text-slate-500 hover:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors flex items-center justify-center w-full rounded"
            >
              <Star
                aria-hidden="true"
                className={`w-3.5 h-3.5 ${
                  isStarred
                    ? "fill-amber-400 text-amber-400"
                    : "hover:text-slate-300"
                }`}
              />
            </button>
          );
        },
      },
      {
        accessorKey: "ticker",
        id: "ticker",
        header: "Símbolo",
        size: 110,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5 font-mono font-bold text-blue-400">
              <span>{row.original.ticker}</span>
              <span className="text-[10px] font-normal px-1 py-0.2 rounded bg-slate-800/90 text-slate-400">
                {row.original.exchange}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        id: "name",
        header: "Empresa",
        size: 190,
        cell: ({ row }) => (
          <div className="truncate text-slate-200 text-xs" title={row.original.name}>
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "sector",
        id: "sector",
        header: "Sector",
        size: 160,
        cell: ({ row }) => (
          <div className="truncate text-slate-400 text-xs" title={row.original.sector}>
            {row.original.sector}
          </div>
        ),
      },
      {
        accessorKey: "price",
        id: "price",
        header: "Precio",
        size: 95,
        cell: ({ row }) => (
          <MemoizedPriceCell
            price={row.original.price}
            lastUpdated={row.original.lastUpdated}
          />
        ),
      },
      {
        accessorKey: "changePercent",
        id: "changePercent",
        header: "Var %",
        size: 90,
        cell: ({ row }) => (
          <MemoizedChangePercentCell
            change={row.original.change}
            changePercent={row.original.changePercent}
            lastUpdated={row.original.lastUpdated}
          />
        ),
      },
      {
        accessorKey: "change",
        id: "change",
        header: "Var $",
        size: 85,
        cell: ({ row }) => (
          <MemoizedChangeCell
            change={row.original.change}
            lastUpdated={row.original.lastUpdated}
          />
        ),
      },
      {
        accessorKey: "marketCap",
        id: "marketCap",
        header: "Cap. Bursátil",
        size: 115,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-slate-300">
            {formatMarketCap(row.original.marketCap)}
          </div>
        ),
      },
      {
        accessorKey: "peRatio",
        id: "peRatio",
        header: "P/E",
        size: 80,
        cell: ({ row }) => <MemoizedRatioCell value={row.original.peRatio} />,
      },
      {
        accessorKey: "rsi14",
        id: "rsi14",
        header: "RSI (14)",
        size: 90,
        cell: ({ row }) => <MemoizedRsiCell rsi14={row.original.rsi14} />,
      },
      {
        accessorKey: "beta",
        id: "beta",
        header: "Beta",
        size: 75,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-slate-300">
            {row.original.beta.toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "volume",
        id: "volume",
        header: "Volumen",
        size: 95,
        cell: ({ row }) => <MemoizedVolumeCell volume={row.original.volume} />,
      },
      {
        accessorKey: "relativeVolume",
        id: "relativeVolume",
        header: "RVol",
        size: 75,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-slate-300">
            {row.original.relativeVolume.toFixed(2)}x
          </div>
        ),
      },
      {
        accessorKey: "dividendYield",
        id: "dividendYield",
        header: "Div %",
        size: 80,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-slate-300">
            {row.original.dividendYield > 0
              ? `${row.original.dividendYield.toFixed(2)}%`
              : "—"}
          </div>
        ),
      },
    ],
    [watchlist, onToggleWatchlist]
  );

  // TanStack Table Instance with Column Pinning for Símbolo
  const table = useReactTable({
    data: stocks,
    columns,
    state: {
      columnPinning: {
        left: ["watchlist", "ticker"],
      },
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  // TanStack Virtualizer with 36px fixed height and 15 overscan rows
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  // Ensure highlighted row is scrolled into view
  const scrollToIndex = useCallback(
    (index: number) => {
      rowVirtualizer.scrollToIndex(index, { align: "auto" });
    },
    [rowVirtualizer]
  );

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (stocks.length === 0) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = Math.min(prev + 1, stocks.length - 1);
            scrollToIndex(next);
            return next;
          });
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = Math.max(prev - 1, 0);
            scrollToIndex(next);
            return next;
          });
          break;
        }
        case "PageDown": {
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = Math.min(prev + 15, stocks.length - 1);
            scrollToIndex(next);
            return next;
          });
          break;
        }
        case "PageUp": {
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = Math.max(prev - 15, 0);
            scrollToIndex(next);
            return next;
          });
          break;
        }
        case "Home": {
          e.preventDefault();
          setSelectedIndex(0);
          scrollToIndex(0);
          break;
        }
        case "End": {
          e.preventDefault();
          const last = stocks.length - 1;
          setSelectedIndex(last);
          scrollToIndex(last);
          break;
        }
        case " ": {
          // Space: Toggle watchlist
          e.preventDefault();
          const currentStock = stocks[selectedIndex];
          if (currentStock) {
            onToggleWatchlist(currentStock.ticker);
          }
          break;
        }
        case "Enter": {
          // Enter: Inspect stock
          e.preventDefault();
          const currentStock = stocks[selectedIndex];
          if (currentStock) {
            onInspectStock(currentStock);
          }
          break;
        }
        default:
          break;
      }
    },
    [stocks, selectedIndex, scrollToIndex, onToggleWatchlist, onInspectStock]
  );

  const flatHeaders = table.getFlatHeaders();

  return (
    <div className="flex flex-col h-full bg-[#0d1322] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Keyboard Shortcut Indicator Bar & Accessibility Status */}
      <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Navegación Accesible:
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700">↑</kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700">↓</kbd> Moverse
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700">Enter</kbd> Inspeccionar
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700">Espacio</kbd> Watchlist
          </span>
        </div>
        <div className="text-slate-400 text-right" aria-live="polite">
          Fila: <span className="text-blue-400 font-bold">{selectedIndex + 1}</span> / {stocks.length.toLocaleString()}
        </div>
      </div>

      {/* Virtual Table Scroll Container with WCAG 2.1 AA Grid Roles */}
      <div
        ref={tableContainerRef}
        role="grid"
        aria-label="Tabla de cotizaciones en tiempo real del screener de acciones"
        aria-rowcount={stocks.length}
        aria-colcount={columns.length}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="flex-1 overflow-auto outline-none focus:ring-1 focus:ring-blue-500/50 relative custom-scrollbar"
        style={{ height: "480px" }}
      >
        <div style={{ height: `${totalSize + ROW_HEIGHT}px`, width: "100%", minWidth: "1280px", position: "relative" }}>
          {/* Table Header Group */}
          <div
            role="rowgroup"
            className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur border-b border-slate-800"
          >
            <div
              role="row"
              aria-rowindex={1}
              className="flex text-xs font-semibold text-slate-400 font-mono select-none h-[36px]"
            >
              {flatHeaders.map((header, colIndex) => {
                const isPinned = header.column.getIsPinned();
                const isLeft = isPinned === "left";
                const isSortable =
                  header.id !== "watchlist" &&
                  header.id !== "name" &&
                  header.id !== "sector";

                const isCurrentSort = sortField === header.id;

                return (
                  <div
                    key={header.id}
                    role="columnheader"
                    aria-colindex={colIndex + 1}
                    aria-sort={
                      isCurrentSort
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    onClick={() => isSortable && onSortChange(header.id as SortableField)}
                    style={{
                      width: `${header.getSize()}px`,
                      left: isLeft ? (header.id === "ticker" ? "38px" : "0px") : undefined,
                    }}
                    className={`px-2 flex items-center shrink-0 h-full ${
                      isSortable ? "cursor-pointer hover:text-slate-200" : ""
                    } ${
                      isLeft
                        ? "sticky z-30 bg-slate-950 border-r border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]"
                        : ""
                    } ${
                      header.id === "price" ||
                      header.id === "changePercent" ||
                      header.id === "change" ||
                      header.id === "marketCap" ||
                      header.id === "peRatio" ||
                      header.id === "rsi14" ||
                      header.id === "beta" ||
                      header.id === "volume" ||
                      header.id === "relativeVolume" ||
                      header.id === "dividendYield"
                        ? "justify-end text-right"
                        : "justify-start"
                    }`}
                  >
                    <span className="truncate">{flexRender(header.column.columnDef.header, header.getContext())}</span>
                    {isSortable && (
                      <span className="ml-1 text-slate-500 shrink-0">
                        {isCurrentSort ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="w-3 h-3 text-blue-400" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-blue-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Virtual Body Rows */}
          <div role="rowgroup">
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;
              const isSelected = selectedIndex === virtualRow.index;
              const stock = row.original;

              return (
                <div
                  key={row.id}
                  role="row"
                  aria-rowindex={virtualRow.index + 2} // Header is row 1
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelectedIndex(virtualRow.index);
                    if (onSelectStock) onSelectStock(stock);
                  }}
                  onDoubleClick={() => onInspectStock(stock)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${ROW_HEIGHT}px`,
                    transform: `translateY(${virtualRow.start + ROW_HEIGHT}px)`,
                  }}
                  className={`flex items-center border-b border-slate-800/80 cursor-pointer transition-colors text-xs select-none ${
                    isSelected
                      ? "bg-blue-600/25 text-white font-medium border-l-2 border-l-blue-500 shadow-inner"
                      : "hover:bg-slate-800/40 text-slate-300"
                  }`}
                >
                  {row.getVisibleCells().map((cell, colIndex) => {
                    const isPinned = cell.column.getIsPinned();
                    const isLeft = isPinned === "left";

                    return (
                      <div
                        key={cell.id}
                        role="gridcell"
                        aria-colindex={colIndex + 1}
                        style={{
                          width: `${cell.column.getSize()}px`,
                          left: isLeft ? (cell.column.id === "ticker" ? "38px" : "0px") : undefined,
                        }}
                        className={`px-2 flex items-center shrink-0 h-full ${
                          isLeft
                            ? `sticky z-10 border-r border-slate-800/80 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] ${
                                isSelected ? "bg-[#16233d]" : "bg-[#0d1322]"
                              }`
                            : ""
                        } ${
                          cell.column.id === "price" ||
                          cell.column.id === "changePercent" ||
                          cell.column.id === "change" ||
                          cell.column.id === "marketCap" ||
                          cell.column.id === "peRatio" ||
                          cell.column.id === "rsi14" ||
                          cell.column.id === "beta" ||
                          cell.column.id === "volume" ||
                          cell.column.id === "relativeVolume" ||
                          cell.column.id === "dividendYield"
                            ? "justify-end text-right"
                            : "justify-start"
                        }`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
