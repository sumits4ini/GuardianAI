"use client";

import React, { useState, useEffect } from "react";
import { SafetyJourney, Coordinates } from "@/types";
import { formatTimeRemaining, formatTime } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  Navigation, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Users,
  Plus
} from "lucide-react";

interface JourneyCardProps {
  journey: SafetyJourney;
  onCheckIn: (coords?: Coordinates) => Promise<{ success: boolean; message: string; timestamp: string }>;
  onComplete: () => void;
  onCancel?: () => void;
  onExtend?: (mins: number) => void;
  onTriggerSOS?: () => void;
}

export function JourneyCard({
  journey,
  onCheckIn,
  onComplete,
  onCancel,
  onExtend,
  onTriggerSOS,
}: JourneyCardProps) {
  const { trustedContacts } = useAuth();
  const [isCheckedInEffect, setIsCheckedInEffect] = useState(false);
  const [confirmationText, setConfirmationText] = useState<string | null>(null);
  const [etaRemaining, setEtaRemaining] = useState<string>("");
  const [checkInRemaining, setCheckInRemaining] = useState<string>("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      const arrival = new Date(journey.expectedArrival).getTime();
      const overdue = now > arrival;
      setIsOverdue(overdue);

      if (overdue) {
        setEtaRemaining("Expected arrival passed");
      } else {
        setEtaRemaining(formatTimeRemaining(journey.expectedArrival));
      }

      if (journey.nextCheckInDue) {
        setCheckInRemaining(formatTimeRemaining(journey.nextCheckInDue));
      }
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [journey.expectedArrival, journey.nextCheckInDue]);

  const handleCheckInClick = async () => {
    setIsCheckedInEffect(true);
    const res = await onCheckIn();
    setConfirmationText(res.message || "✓ You're checked in");
    setTimeout(() => {
      setIsCheckedInEffect(false);
    }, 2000);
  };

  const isAttentionRequired = journey.status === "ATTENTION_REQUIRED" || isOverdue;

  return (
    <div className={`p-5 rounded-2xl glass-panel-elevated border space-y-3.5 transition-all ${
      isAttentionRequired 
        ? "border-amber-500/60 shadow-lg shadow-amber-500/10 bg-amber-950/20" 
        : "border-slate-800"
    }`}>
      
      {/* Header with Active Indicator and End Journey CTA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isAttentionRequired ? "bg-amber-400" : "bg-emerald-400"
            }`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              isAttentionRequired ? "bg-amber-500" : "bg-emerald-500"
            }`}></span>
          </span>
          <span className={`text-xs font-bold uppercase tracking-wider ${
            isAttentionRequired ? "text-amber-400" : "text-emerald-400"
          }`}>
            {isAttentionRequired ? "Attention Required" : "Active Safety Journey"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onComplete}
            className="text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/30 px-2.5 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1 transition-colors"
            title="Mark Journey Completed"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>I&apos;m Safe (End)</span>
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="text-[11px] font-semibold text-slate-400 hover:text-rose-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 transition-colors"
              title="Cancel Journey"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Overdue Warning Alert Box */}
      {isAttentionRequired && (
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 space-y-2 animate-in fade-in">
          <div className="flex items-start gap-2 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold block">Your expected arrival time has passed. Please check in.</span>
              <span className="text-[11px] text-amber-300/80">
                Confirm your safety or request assistance from trusted contacts.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCheckInClick}
              className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>I&apos;m Safe</span>
            </button>

            {onExtend && (
              <button
                onClick={() => onExtend(10)}
                className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
              >
                +10 Mins
              </button>
            )}

            {onTriggerSOS && (
              <button
                onClick={onTriggerSOS}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Get Help</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Origin & Destination Route Summary */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
        <div className="flex items-start gap-2 text-xs">
          <Navigation className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Starting Point</span>
            <span className="text-slate-200 font-medium truncate block">
              {journey.originName || journey.startLocation || "Current Location"}
            </span>
          </div>
        </div>

        <div className="w-px h-2.5 bg-slate-700 ml-2" />

        <div className="flex items-start gap-2 text-xs">
          <MapPin className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Destination</span>
            <span className="text-slate-200 font-semibold truncate block">
              {journey.destinationName || journey.destination}
            </span>
          </div>
        </div>
      </div>

      {/* Timers & Status Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-0.5">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>Expected Arrival</span>
          </div>
          <span className="font-bold text-white font-mono">{formatTime(journey.expectedArrival)}</span>
          <span className={`text-[10px] font-mono block ${isAttentionRequired ? "text-amber-400 font-bold" : "text-indigo-300"}`}>
            {etaRemaining}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-0.5">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Last Check-In</span>
          </div>
          <span className="font-bold text-white font-mono">{formatTime(journey.lastCheckIn)}</span>
          <span className="text-[10px] text-slate-400 block truncate">
            Every {journey.checkInIntervalMins || 10}m
          </span>
        </div>
      </div>

      {/* Check-In Confirmation Banner */}
      {confirmationText && (
        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{confirmationText}</span>
        </div>
      )}

      {/* Primary Check-in Button */}
      <button
        onClick={handleCheckInClick}
        disabled={isCheckedInEffect}
        className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
          isCheckedInEffect
            ? "bg-emerald-500 text-white scale-[0.99]"
            : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 text-white shadow-emerald-600/20"
        }`}
      >
        <ShieldCheck className="w-4 h-4" />
        <span>{isCheckedInEffect ? "✓ Check-in Confirmed" : "I'M SAFE — Check In Now"}</span>
      </button>

      {/* Trusted Contacts in Corridor */}
      {trustedContacts && trustedContacts.length > 0 && (
        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Emergency Network: <strong>{trustedContacts.length} contacts active</strong></span>
          </div>
          <span className="text-[10px] text-indigo-300">Ready</span>
        </div>
      )}

    </div>
  );
}
