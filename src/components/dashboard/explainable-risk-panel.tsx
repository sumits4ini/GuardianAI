"use client";

import React from "react";
import { RiskAssessment } from "@/types";
import { Sparkles, ArrowUpRight, AlertCircle, CheckCircle2, Navigation, Bell } from "lucide-react";
import { getRiskColor } from "@/lib/utils";

interface ExplainableRiskPanelProps {
  assessment: RiskAssessment;
  onTakeAction?: (actionText: string) => void;
}

export function ExplainableRiskPanel({
  assessment,
  onTakeAction,
}: ExplainableRiskPanelProps) {
  const riskTheme = getRiskColor(assessment.riskLevel);

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl glass-panel-elevated border border-slate-800">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              AI Explainable Risk Analysis
            </h3>
            <p className="text-[11px] text-slate-400">
              Proactive multi-signal reasoning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">Escalation:</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            assessment.escalationLevel === 'HIGH' || assessment.escalationLevel === 'CRITICAL'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : assessment.escalationLevel === 'MEDIUM'
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}>
            {assessment.escalationLevel}
          </span>
        </div>
      </div>

      {/* AI Reasoning Text Block */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
        <span className="font-semibold text-indigo-300 block mb-1">
          Predictive Context Assessment:
        </span>
        {assessment.reasoning}
      </div>

      {/* Detected Signals List */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
          Active Safety Signals ({assessment.signals.length})
        </span>
        <div className="space-y-2">
          {assessment.signals.map((signal, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
            >
              <AlertCircle className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <span>{signal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommended Action Card */}
      <div className="mt-1 p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-indigo-400" />
            AI Recommended Action
          </span>
        </div>

        <p className="text-xs text-slate-200 font-medium">
          {assessment.recommendedAction}
        </p>

        {onTakeAction && (
          <button
            onClick={() => onTakeAction(assessment.recommendedAction)}
            className="mt-3 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Acknowledge / Execute Step</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}
