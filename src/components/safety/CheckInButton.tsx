"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface CheckInButtonProps {
  onCheckIn: () => Promise<void>;
}

export function CheckInButton({ onCheckIn }: CheckInButtonProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await onCheckIn();
    setLoading(false);
    setIsCheckedIn(true);
    setTimeout(() => setIsCheckedIn(false), 2500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || isCheckedIn}
      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
        isCheckedIn
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
          : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20"
      }`}
    >
      <CheckCircle2 className="w-4 h-4" />
      <span>{isCheckedIn ? "Safety Check-In Confirmed!" : "Check In Now — I am Safe"}</span>
    </button>
  );
}
