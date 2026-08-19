"use client";

import React from "react";
import { ReportCategory } from "@/types";

interface MapFiltersProps {
  selectedCategory: ReportCategory | "all";
  onSelectCategory: (cat: ReportCategory | "all") => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
}

const CATEGORIES: { label: string; value: ReportCategory | "all" }[] = [
  { label: "All Hazards", value: "all" },
  { label: "Harassment", value: "harassment" },
  { label: "Lighting", value: "poor_lighting" },
  { label: "Suspicious", value: "suspicious_activity" },
  { label: "Isolated", value: "isolated_area" },
  { label: "Theft", value: "theft" },
];

export function MapFilters({
  selectedCategory,
  onSelectCategory,
  showHeatmap,
  onToggleHeatmap,
}: MapFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl glass-panel border border-slate-800 text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onSelectCategory(cat.value)}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
              selectedCategory === cat.value
                ? "bg-indigo-600 border-indigo-400 text-white shadow-sm"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <button
        onClick={onToggleHeatmap}
        className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
          showHeatmap
            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
            : "bg-slate-900/80 text-slate-400 border-slate-800"
        }`}
      >
        Risk Perimeter {showHeatmap ? "ON" : "OFF"}
      </button>
    </div>
  );
}
