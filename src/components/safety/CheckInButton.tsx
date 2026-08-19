"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Coordinates } from "@/types";

interface CheckInButtonProps {
  onCheckIn: (coords?: Coordinates) => Promise<{ success: boolean; message: string; timestamp: string }>;
  lastCheckIn?: string;
  disabled?: boolean;
}

export function CheckInButton({ onCheckIn, lastCheckIn, disabled }: CheckInButtonProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationMsg, setConfirmationMsg] = useState<string | null>(null);

  const handleClick = async () => {
    if (disabled || loading) return;
    setLoading(true);
    const res = await onCheckIn();
    setLoading(false);
    setIsCheckedIn(true);
    setConfirmationMsg(res.message || "✓ You're checked in");
    setTimeout(() => setIsCheckedIn(false), 3000);
  };

  return (
    <div className="space-y-1.5 w-full">
      <button
        onClick={handleClick}
        disabled={loading || isCheckedIn || disabled}
        className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
          isCheckedIn
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50"
            : disabled
            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
            : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/25 border border-emerald-500/40"
        }`}
      >
        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
        <span className="tracking-wide">
          {loading ? "Recording Location..." : isCheckedIn ? "✓ You're Checked In" : "I'M SAFE — CHECK IN NOW"}
        </span>
      </button>

      {confirmationMsg && isCheckedIn && (
        <p className="text-[11px] text-emerald-300 text-center font-medium animate-in fade-in">
          {confirmationMsg}
        </p>
      )}
    </div>
  );
}
