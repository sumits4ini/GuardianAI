"use client";

import React, { useState } from "react";
import { RiskAssessment } from "@/types";
import { getRiskColor } from "@/lib/utils";
import { 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Activity
} from "lucide-react";

interface AISafetyCardProps {
  assessment: RiskAssessment & { 
    aiAvailable?: boolean; 
    notice?: string;
    anomalies?: Array<{ type: string; title: string; description: string; severity: string }>;
  };
  isEvaluating: boolean;
  onRefresh: () => Promise<void>;
  onTriggerSOS?: () => void;
  onCheckIn?: () => void;
}

export function AISafetyCard({
  assessment,
  isEvaluating,
  onRefresh,
  onTriggerSOS,
}: AISafetyCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const riskTheme = getRiskColor(assessment.riskLevel);
  const isHighRisk = assessment.riskLevel === "HIGH" || assessment.riskLevel === "CRITICAL";

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <div className={`p-5 rounded-2xl glass-panel-elevated border transition-all space-y-4 shadow-sm ${
      isHighRisk 
        ? "border-rose-300 dark:border-rose-500/50 shadow-xl shadow-rose-500/10 bg-gradient-to-b from-rose-50 dark:from-rose-950/30 via-white dark:via-slate-900 to-white dark:to-slate-950" 
        : "border-slate-200 dark:border-slate-800"
    }`}>
      
      {/* Top Header: AI Status Badge & Analyze Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>AI Safety Intelligence</span>
              {assessment.aiAvailable !== false ? (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40">
                  GEMINI 1.5 FLASH
                </span>
              ) : (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40">
                  BASELINE ENGINE
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Continuous context-aware safety evaluation</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefreshClick}
          disabled={isEvaluating || isRefreshing}
          className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          title="Run Contextual Safety Analysis"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating || isRefreshing ? "animate-spin text-indigo-600 dark:text-indigo-400" : ""}`} />
          <span>{isEvaluating || isRefreshing ? "Analyzing..." : "Analyze Again"}</span>
        </button>
      </div>

      {/* Fallback notice banner */}
      {assessment.notice && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span>{assessment.notice}</span>
        </div>
      )}

      {/* Primary Score & Confidence Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Safety Risk Score */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Safety Risk Score
            </span>
            <Activity className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {assessment.riskScore}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">/ 100</span>
          </div>
          <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 mt-1 rounded border ${riskTheme.badge}`}>
            {assessment.riskLevel}
          </span>
        </div>

        {/* AI Confidence & Model Evaluation */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              AI Confidence
            </span>
            <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-300">
              {Math.round((assessment.confidence || 0.92) * 100)}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 font-medium">
            Multi-Signal Verification
          </span>
        </div>

      </div>

      {/* Explainable AI: WHY YOUR RISK CHANGED */}
      <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span className="uppercase tracking-wider text-[11px]">Why Your Risk Changed:</span>
        </div>

        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-0.5">
          {assessment.signals && assessment.signals.length > 0 ? (
            assessment.signals.map((signal, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5 font-bold">•</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{signal}</span>
              </li>
            ))
          ) : (
            <li className="text-[11px] text-slate-500 dark:text-slate-400">Standard ambient travel conditions detected.</li>
          )}
        </ul>

        {assessment.reasoning && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-800/60">
            &ldquo;{assessment.reasoning}&rdquo;
          </p>
        )}
      </div>

      {/* Contextual AI Recommendation */}
      {assessment.recommendedAction && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 flex items-start gap-2.5 text-xs">
          <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold text-indigo-800 dark:text-indigo-200 block text-[11px] uppercase tracking-wider">
              AI Recommendation
            </span>
            <p className="text-xs text-slate-800 dark:text-slate-100 mt-0.5 font-medium leading-snug">
              &ldquo;{assessment.recommendedAction}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Prominent ACTIVATE SOS Button on High / Critical Risk */}
      {isHighRisk && onTriggerSOS && (
        <div className="pt-1 space-y-2">
          <button
            type="button"
            onClick={onTriggerSOS}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 border border-rose-400 animate-pulse transition-all active:scale-[0.99]"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>ACTIVATE EMERGENCY SOS BEACON</span>
          </button>
          <p className="text-[10px] text-center text-slate-500">
            Manual emergency trigger • Alerts your trusted contacts network
          </p>
        </div>
      )}

    </div>
  );
}
