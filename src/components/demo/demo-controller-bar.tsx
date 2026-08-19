"use client";

import React, { useState } from "react";
import { useGuardian } from "@/lib/store/demo-context";
import { 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  Navigation, 
  Clock, 
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Activity
} from "lucide-react";

export function DemoControllerBar() {
  const { 
    isDemoMode, 
    activeDemoScenario, 
    setDemoScenario, 
    triggerSOS, 
    activeJourney,
    startJourney,
    evaluateRisk,
    resetDemoState,
  } = useGuardian();

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isDemoMode) return null;

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    await evaluateRisk();
    setIsAnalyzing(false);
  };

  return (
    <div className="w-full bg-slate-100/90 dark:bg-slate-950 border-b border-slate-200 dark:border-indigo-500/30 px-3 py-2 backdrop-blur-md sticky top-16 z-40 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5">
        
        {/* Title & Demo Tag */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                HACKATHON DEMO CONTROLLER
              </span>
              <span className="text-[9px] font-extrabold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">
                1-CLICK SIMULATIONS
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          
          {/* Start Journey */}
          {!activeJourney && (
            <button
              onClick={() => {
                startJourney(
                  "Campus Library Plaza",
                  { lat: 37.7718, lng: -122.4225 },
                  "North Student Hostel Complex",
                  { lat: 37.7792, lng: -122.4158 },
                  20,
                  10
                );
              }}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Start Journey</span>
            </button>
          )}

          {/* 1. Normal Safe Journey */}
          <button
            onClick={() => setDemoScenario("safe_commute")}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all ${
              activeDemoScenario === "safe_commute"
                ? "bg-emerald-600 border-emerald-500 text-white font-bold"
                : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50"
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Safe Corridor</span>
          </button>

          {/* 2. High-Risk Area / Approaching Hotspot */}
          <button
            onClick={() => setDemoScenario("hotspot_proximity")}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all ${
              activeDemoScenario === "hotspot_proximity"
                ? "bg-amber-600 border-amber-500 text-white font-bold"
                : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500/50"
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>High-Risk Area</span>
          </button>

          {/* 3. Route Deviation */}
          <button
            onClick={() => setDemoScenario("route_deviation")}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all ${
              activeDemoScenario === "route_deviation"
                ? "bg-orange-600 border-orange-500 text-white font-bold"
                : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500/50"
            }`}
          >
            <Navigation className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            <span>Route Detour</span>
          </button>

          {/* 4. Missed Check-in */}
          <button
            onClick={() => setDemoScenario("missed_checkin")}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all ${
              activeDemoScenario === "missed_checkin"
                ? "bg-rose-600 border-rose-500 text-white font-bold"
                : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-500/50"
            }`}
          >
            <Clock className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>Missed Check-in</span>
          </button>

          {/* 5. Run AI Risk Analysis */}
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/40 shadow-sm transition-all disabled:opacity-50"
          >
            <Activity className={`w-3 h-3 ${isAnalyzing ? "animate-spin" : ""}`} />
            <span>{isAnalyzing ? "Analyzing..." : "Analyze Risk"}</span>
          </button>

          {/* 6. Trigger Demo SOS */}
          <button
            onClick={() => triggerSOS("demo_controller_click")}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 shadow-sm transition-all"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Trigger SOS</span>
          </button>

          {/* 7. Reset Demo */}
          <button
            onClick={() => {
              if (resetDemoState) resetDemoState();
              else setDemoScenario("safe_commute");
            }}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-all"
            title="Reset to pristine state"
          >
            <RotateCcw className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span>Reset</span>
          </button>

        </div>

      </div>
    </div>
  );
}
