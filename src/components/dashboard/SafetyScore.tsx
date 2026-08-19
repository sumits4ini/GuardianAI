"use client";

import React from "react";
import { RiskLevel } from "@/types";
import { getRiskColor } from "@/lib/utils";
import { ShieldCheck, AlertTriangle, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

interface SafetyScoreProps {
  score: number;
  level: RiskLevel;
  confidence: number;
  isEvaluating?: boolean;
  onRefresh?: () => void;
}

export function SafetyScore({
  score,
  level,
  confidence,
  isEvaluating,
  onRefresh,
}: SafetyScoreProps) {
  const riskTheme = getRiskColor(level);
  const strokeDashoffset = 440 - (440 * score) / 100;

  const getScoreColorHex = () => {
    switch (level) {
      case "SAFE": return "#10b981";
      case "MODERATE": return "#f59e0b";
      case "HIGH": return "#f97316";
      case "CRITICAL": return "#ef4444";
    }
  };

  const getStatusIcon = () => {
    switch (level) {
      case "SAFE": return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case "MODERATE": return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case "HIGH": return <AlertTriangle className="w-5 h-5 text-orange-400 animate-bounce" />;
      case "CRITICAL": return <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />;
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border ${riskTheme.border} ${riskTheme.bg} ${riskTheme.glow} transition-all duration-500 overflow-hidden`}>
      <div className="w-full flex items-center justify-between mb-3 z-10">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Safety Risk Score
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700/60">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>AI: {Math.round(confidence * 100)}%</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isEvaluating}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Re-evaluate Risk Context"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* SVG Circle Gauge */}
      <div className="relative flex items-center justify-center w-44 h-44 my-1">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-800/80"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke={getScoreColorHex()}
            strokeWidth="11"
            strokeDasharray="440"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
            {score}
          </span>
          <span className="text-[11px] font-medium text-slate-400 -mt-1">
            out of 100
          </span>
          
          <div className={`mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${riskTheme.badge}`}>
            {level}
          </div>
        </div>
      </div>

      <div className="w-full text-center mt-2 z-10">
        <p className="text-xs text-slate-300 font-medium">
          {level === "SAFE" && "Standard conditions — low environmental risk detected."}
          {level === "MODERATE" && "Elevated awareness advised — moderate signals detected."}
          {level === "HIGH" && "Proactive caution recommended — multiple hazard cues."}
          {level === "CRITICAL" && "High risk anomaly — please check in or activate safety alert."}
        </p>
        <p className="text-[10px] text-slate-500 mt-1 font-mono">
          *Safety indicator based on available context, not a guaranteed prediction.
        </p>
      </div>
    </div>
  );
}
