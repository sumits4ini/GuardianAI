"use client";

import React, { useState, useEffect } from "react";
import { SafetyJourney } from "@/types";
import { formatTimeRemaining, formatTime } from "@/lib/utils";
import { Navigation, MapPin, Clock, ShieldCheck, Activity, AlertTriangle } from "lucide-react";

interface JourneyCardProps {
  journey: SafetyJourney;
  onCheckIn: () => Promise<void>;
  onComplete: () => void;
}

export function JourneyCard({ journey, onCheckIn, onComplete }: JourneyCardProps) {
  const [isCheckedInEffect, setIsCheckedInEffect] = useState(false);
  const [etaRemaining, setEtaRemaining] = useState<string>("");
  const [checkInRemaining, setCheckInRemaining] = useState<string>("");

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
    await onCheckIn();
    setTimeout(() => setIsCheckedInEffect(false), 2000);
  };

  return (
    <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Active Journey Corridor
          </span>
        </div>

        <button
          onClick={onComplete}
          className="text-[11px] font-semibold text-slate-300 hover:text-emerald-400 bg-slate-900/90 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/80 flex items-center gap-1 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>I Have Arrived</span>
        </button>
      </div>

      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
        <div className="flex items-start gap-2 text-xs">
          <Navigation className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Origin</span>
            <span className="text-slate-200 font-medium">{journey.originName}</span>
          </div>
        </div>
        <div className="w-px h-2.5 bg-slate-700 ml-2" />
        <div className="flex items-start gap-2 text-xs">
          <MapPin className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Destination</span>
            <span className="text-slate-200 font-semibold">{journey.destinationName}</span>
          </div>
        </div>
      </div>

      {journey.routeDeviationDetected && (
        <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-2 text-xs text-rose-300 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>Route deviation detected from planned corridor.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-0.5">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>ETA</span>
          </div>
          <span className="font-bold text-white font-mono">{formatTime(journey.expectedArrival)}</span>
          <span className="text-[10px] text-indigo-300 font-mono block">{etaRemaining}</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-0.5">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>Next Check-in</span>
          </div>
          <span className="font-bold text-white font-mono">{formatTime(journey.nextCheckInDue)}</span>
          <span className="text-[10px] text-amber-300 font-mono block">{checkInRemaining}</span>
        </div>
      </div>

      <button
        onClick={handleCheckIn}
        disabled={isCheckedInEffect}
        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
          isCheckedInEffect
            ? "bg-emerald-500 text-white"
            : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-md"
        }`}
      >
        <ShieldCheck className="w-4 h-4" />
        <span>{isCheckedInEffect ? "Check-in Confirmed!" : "Check In Now — I am Safe"}</span>
      </button>
    </div>
  );
}
