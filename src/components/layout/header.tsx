"use client";

import React from "react";
import { Shield, Radio, Sparkles, Users, MapPin, SlidersHorizontal } from "lucide-react";
import { useGuardian } from "@/lib/store/demo-context";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface HeaderProps {
  onOpenDistressChat: () => void;
  onOpenReportModal: () => void;
  onOpenContactsModal: () => void;
  onOpenSimulatorModal: () => void;
}

export function Header({
  onOpenDistressChat,
  onOpenReportModal,
  onOpenContactsModal,
  onOpenSimulatorModal,
}: HeaderProps) {
  const { isDemoMode, toggleDemoMode } = useGuardian();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 glass-panel transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-primary to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse-glow" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                GuardianAI
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                PROACTIVE AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Predictive Safety Intelligence Net
            </p>
          </div>
        </div>

        {/* Action Controls & AI Assistants */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          <ThemeToggle />

          {/* Demo Mode Toggle Badge */}
          <button
            onClick={() => toggleDemoMode()}
            className={`hidden md:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              isDemoMode 
                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-500/50 text-indigo-800 dark:text-indigo-300 shadow-sm" 
                : "bg-slate-100 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
            title="Toggle Demo Simulation Bar"
          >
            <Radio className={`w-3.5 h-3.5 ${isDemoMode ? "text-indigo-600 dark:text-indigo-400 animate-pulse" : ""}`} />
            <span>Demo Mode</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isDemoMode ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
              {isDemoMode ? "ON" : "OFF"}
            </span>
          </button>

          {/* Route Simulator Button */}
          <button
            onClick={onOpenSimulatorModal}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            title="Simulate & Compare Route Safety"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Route AI</span>
          </button>

          {/* Report Community Incident */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-amber-700 dark:text-amber-300 transition-colors shadow-sm"
            title="Submit Anonymized Safety Report"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Report Hazard</span>
          </button>

          {/* AI Distress Assistant Launcher */}
          <button
            onClick={onOpenDistressChat}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-900 dark:text-indigo-200 transition-all shadow-sm"
            title="Open AI Safety Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-medium">AI Assistant</span>
          </button>

          {/* Trusted Contacts */}
          <button
            onClick={onOpenContactsModal}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
            title="Manage Trusted Contacts"
          >
            <Users className="w-4 h-4" />
          </button>

        </div>
      </div>
    </header>
  );
}
