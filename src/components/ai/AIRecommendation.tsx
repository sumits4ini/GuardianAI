"use client";

import React from "react";
import { Navigation, ArrowUpRight } from "lucide-react";

interface AIRecommendationProps {
  recommendedAction: string;
  onExecute?: () => void;
}

export function AIRecommendation({ recommendedAction, onExecute }: AIRecommendationProps) {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 dark:from-indigo-950/40 via-white dark:via-slate-900 to-white dark:to-slate-950 border border-indigo-200 dark:border-indigo-500/30 space-y-2 shadow-sm transition-colors">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
        <Navigation className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>AI Actionable Safety Recommendation</span>
      </div>

      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
        {recommendedAction}
      </p>

      {onExecute && (
        <button
          onClick={onExecute}
          className="mt-2 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <span>Acknowledge Action</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
