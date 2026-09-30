"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

interface MultiSelectOption<T extends string> {
  value: T;
  label: string;
  badge?: string;
}

interface MultiSelectDropdownProps<T extends string> {
  label: string;
  options: MultiSelectOption<T>[];
  selected: T[];
  onChange: (selected: T[]) => void;
  placeholder?: string;
}

export function MultiSelectDropdown<T extends string>({
  label,
  options,
  selected,
  onChange,
  placeholder = "Seleccionar...",
}: MultiSelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (val: T) => {
    if (selected.includes(val)) {
      onChange(selected.filter((item) => item !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative text-xs" ref={containerRef}>
      <label className="block text-slate-400 font-medium mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-1.5 bg-slate-950 border rounded-lg transition-colors ${
          selected.length > 0
            ? "border-blue-500/60 text-white"
            : "border-slate-800 text-slate-400 hover:border-slate-700"
        }`}
      >
        <span className="truncate">
          {selected.length === 0
            ? placeholder
            : selected.length === 1
            ? options.find((o) => o.value === selected[0])?.label || selected[0]
            : `${selected.length} seleccionados`}
        </span>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selected.length > 0 && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              title="Limpiar"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${
              isOpen ? "rotate-180 text-blue-400" : "text-slate-500"
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] max-h-56 overflow-y-auto rounded-lg bg-slate-900 border border-slate-700 shadow-2xl p-1 custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400 border-b border-slate-800">
            <span>Opciones</span>
            <button
              onClick={() => onChange(options.map((o) => o.value))}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Todos
            </button>
          </div>

          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-blue-600/20 text-blue-300 font-semibold"
                    : "hover:bg-slate-800/80 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "border-slate-700 bg-slate-950"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className="truncate">{option.label}</span>
                </div>
                {option.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    {option.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
