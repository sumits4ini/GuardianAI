"use client";

import React from "react";
import { AlertCircle, Sparkles } from "lucide-react";

interface RiskFactorsProps {
  signals: string[];
  reasoning: string;
}

export function RiskFactors({ signals, reasoning }: RiskFactorsProps) {
  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Explainable Risk Signals ({signals.length})
        </h3>
      </div>

      <p className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
        {reasoning}
      </p>

      <div className="space-y-1.5">
        {signals.map((sig, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <span>{sig}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
