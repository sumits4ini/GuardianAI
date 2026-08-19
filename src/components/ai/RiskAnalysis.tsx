"use client";

import React from "react";
import { RiskAssessment } from "@/types";
import { Sparkles, AlertCircle } from "lucide-react";
import { getRiskColor } from "@/lib/utils";

interface RiskAnalysisProps {
  assessment: RiskAssessment;
}

export function RiskAnalysis({ assessment }: RiskAnalysisProps) {
  const riskTheme = getRiskColor(assessment.riskLevel);

  return (
    <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Predictive AI Risk Analysis
          </h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${riskTheme.badge}`}>
          {assessment.riskLevel} ({assessment.riskScore}/100)
        </span>
      </div>

      <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
        {assessment.reasoning}
      </p>

      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
          Detected Environmental Signals:
        </span>
        {assessment.signals.map((sig, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <span>{sig}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
