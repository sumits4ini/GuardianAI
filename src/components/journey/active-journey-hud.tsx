"use client";

import React, { useState, useEffect } from "react";
import { SafetyJourney } from "@/types";
import { useGuardian } from "@/lib/store/demo-context";
import { formatTimeRemaining, formatTime } from "@/lib/utils";
import { 
  Navigation, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  XSquare,
  Activity,
  Flame
} from "lucide-react";

interface ActiveJourneyHUDProps {
  journey: SafetyJourney;
  onOpenReportModal?: () => void;
}

export function ActiveJourneyHUD({ journey, onOpenReportModal }: ActiveJourneyHUDProps) {
  const { performCheckIn, completeJourney, cancelJourney, isEvaluatingRisk } = useGuardian();
  const [isCheckedInEffect, setIsCheckedInEffect] = useState(false);
  const [etaRemaining, setEtaRemaining] = useState<string>("");
  const [checkInRemaining, setCheckInRemaining] = useState<string>("");

  // Live timer tick
  useEffect(() => {
    const updateTimers = () => {
      setEtaRemaining(formatTimeRemaining(journey.expectedArrival));
      setCheckInRemaining(formatTimeRemaining(journey.nextCheckInDue));
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [journey.expectedArrival, journey.nextCheckInDue]);

  const handleCheckIn = async () => {
    setIsCheckedInEffect(true);
    await performCheckIn();
    setTimeout(() => setIsCheckedInEffect(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl glass-panel-elevated border border-slate-800 relative overflow-hidden">
      
      {/* Live tracking indicator pulse */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Active Safety Journey
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={completeJourney}
            className="text-[11px] font-semibold text-slate-300 hover:text-emerald-400 bg-slate-900/90 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/80 flex items-center gap-1 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>I Have Arrived</span>
          </button>

          <button
            onClick={cancelJourney}
            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Cancel Journey Tracking"
          >
            <XSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Origin -> Destination Route Details */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
        <div className="flex items-start gap-2 text-xs">
          <Navigation className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Origin</span>
            <span className="text-slate-200 font-medium">{journey.originName}</span>
          </div>
        </div>

        <div className="w-px h-3 bg-slate-700 ml-2" />

        <div className="flex items-start gap-2 text-xs">
          <MapPin className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Destination</span>
            <span className="text-slate-200 font-semibold">{journey.destinationName}</span>
          </div>
        </div>
      </div>

      {/* Journey Anomaly Detected Banner */}
      {journey.routeDeviationDetected && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-rose-300 block">Potential Journey Anomaly Detected</span>
            <p className="text-rose-200/90 text-[11px] mt-0.5">
              Route deviation observed from standard path. Please perform a quick check-in to confirm you are safe.
            </p>
          </div>
        </div>
      )}

      {/* Timers Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Expected Arrival</span>
          </div>
          <div className="text-sm font-bold text-white font-mono">
            {formatTime(journey.expectedArrival)}
          </div>
          <span className="text-[10px] text-indigo-300 font-mono">
            {etaRemaining}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Next Check-in</span>
          </div>
          <div className="text-sm font-bold text-white font-mono">
            {formatTime(journey.nextCheckInDue)}
          </div>
          <span className="text-[10px] text-amber-300 font-mono">
            {checkInRemaining}
          </span>
        </div>
      </div>

      {/* Action Check-in Button */}
      <button
        onClick={handleCheckIn}
        disabled={isCheckedInEffect || isEvaluatingRisk}
        className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
          isCheckedInEffect
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
            : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20"
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>
          {isCheckedInEffect ? "Safety Check-In Confirmed!" : "Check In Now — I am Safe"}
        </span>
      </button>

    </div>
  );
}
