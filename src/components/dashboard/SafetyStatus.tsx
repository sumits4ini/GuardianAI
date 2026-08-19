"use client";

import React from "react";
import { RiskLevel, EscalationLevel } from "@/types";
import { ShieldCheck, AlertTriangle, ShieldAlert, Radio } from "lucide-react";
import { getRiskColor } from "@/lib/utils";

interface SafetyStatusProps {
  level: RiskLevel;
  escalation: EscalationLevel;
  isJourneyActive: boolean;
}

export function SafetyStatus({ level, escalation, isJourneyActive }: SafetyStatusProps) {
  const riskTheme = getRiskColor(level);

  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl border ${riskTheme.badge}`}>
          {level === "SAFE" ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : level === "MODERATE" ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Safety Net Status
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${riskTheme.badge}`}>
              {level}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isJourneyActive ? "Active Journey Corridor Protection" : "Standby Safety Monitoring"}
          </p>
        </div>
      </div>

      <div className="text-right">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
          Escalation Tier
        </span>
        <span className="text-xs font-bold text-indigo-300 font-mono">
          {escalation}
        </span>
      </div>
    </div>
  );
}
