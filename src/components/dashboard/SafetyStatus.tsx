"use client";

import React from "react";
import { RiskLevel, EscalationLevel, OverallSafetyState } from "@/types";
import { ShieldCheck, AlertTriangle, ShieldAlert, Compass, Clock } from "lucide-react";
import { getRiskColor } from "@/lib/utils";

interface SafetyStatusProps {
  level: RiskLevel;
  escalation: EscalationLevel;
  isJourneyActive: boolean;
  overallState?: OverallSafetyState;
}

export function SafetyStatus({
  level,
  escalation,
  isJourneyActive,
  overallState,
}: SafetyStatusProps) {
  const riskTheme = getRiskColor(level);

  const getStateConfig = () => {
    switch (overallState) {
      case "SOS_ACTIVE":
        return {
          title: "EMERGENCY SOS ACTIVE",
          subtitle: "Emergency beacon dispatched to trusted network",
          badge: "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/50 animate-pulse",
          icon: <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 animate-pulse" />,
        };
      case "ATTENTION_REQUIRED":
        return {
          title: "ATTENTION REQUIRED",
          subtitle: "Expected arrival time has passed. Please confirm safety.",
          badge: "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/50",
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
        };
      case "CHECK_IN_OVERDUE":
        return {
          title: "CHECK-IN OVERDUE",
          subtitle: "Scheduled corridor check-in is due now",
          badge: "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/50",
          icon: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
        };
      case "JOURNEY_ACTIVE":
        return {
          title: "ACTIVE JOURNEY CORRIDOR",
          subtitle: "Corridor tracking & anomaly monitoring enabled",
          badge: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40",
          icon: <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" style={{ animationDuration: "10s" }} />,
        };
      case "SAFE":
      default:
        return {
          title: "SAFETY NET STANDBY",
          subtitle: "Background ambient safety active. No hazards nearby.",
          badge: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        };
    }
  };

  const stateCfg = getStateConfig();

  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl border ${stateCfg.badge}`}>
          {stateCfg.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {stateCfg.title}
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${riskTheme.badge}`}>
              {level} RISK
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {stateCfg.subtitle}
          </p>
        </div>
      </div>

      <div className="text-right hidden sm:block">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
          Escalation Tier
        </span>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 font-mono">
          {escalation}
        </span>
      </div>
    </div>
  );
}
