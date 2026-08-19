"use client";

import React from "react";
import { useGuardian } from "@/lib/store/demo-context";
import { 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  Navigation, 
  Clock, 
  ShieldAlert,
  Sparkles,
  Info
} from "lucide-react";

export function DemoControllerBar() {
  const { 
    isDemoMode, 
    activeDemoScenario, 
    setDemoScenario, 
    triggerSOS, 
    activeJourney,
    startJourney 
  } = useGuardian();

  if (!isDemoMode) return null;

  const scenarios = [
    {
      id: "safe_commute",
      label: "1. Normal Safe Journey",
      desc: "Baseline transit on lit path (Score: ~14)",
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
      color: "hover:border-emerald-500/50",
    },
    {
      id: "hotspot_proximity",
      label: "2. Approaching Hotspot",
      desc: "Clustering 2 recent harassment reports (Score: ~56)",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
      color: "hover:border-amber-500/50",
    },
    {
      id: "route_deviation",
      label: "3. Route Deviation Anomaly",
      desc: "Detour into unlit warehouse lane (Score: ~78)",
      icon: <Navigation className="w-3.5 h-3.5 text-orange-400" />,
      color: "hover:border-orange-500/50",
    },
    {
      id: "missed_checkin",
      label: "4. Overdue Check-in",
      desc: "Missed scheduled safety timer (Score: ~88)",
      icon: <Clock className="w-3.5 h-3.5 text-rose-400" />,
      color: "hover:border-rose-500/50",
    },
  ];

  return (
    <div className="w-full bg-indigo-950/70 border-b border-indigo-500/30 px-4 py-2.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Hackathon Demo Simulation Mode
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                JUDGES QUICK-TEST
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Click scenarios to test live AI reasoning and anomaly triggers in real-time
            </p>
          </div>
        </div>

        {/* Action Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
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
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Start Journey</span>
            </button>
          )}

          {scenarios.map((sc) => {
            const isActive = activeDemoScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setDemoScenario(sc.id)}
                title={sc.desc}
                className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                  isActive
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30 font-bold"
                    : `bg-slate-900/90 border-slate-700 text-slate-300 ${sc.color}`
                }`}
              >
                {sc.icon}
                <span>{sc.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => triggerSOS("demo_sos_click")}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white border border-rose-500/40 shadow-sm transition-all"
            title="Simulate Instant Emergency SOS Dispatch"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Test SOS</span>
          </button>
        </div>

      </div>
    </div>
  );
}
