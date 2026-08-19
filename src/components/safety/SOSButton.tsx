"use client";

import React, { useState, useRef } from "react";
import { useGuardian } from "@/lib/store/demo-context";
import { ShieldAlert, AlertOctagon, ChevronRight } from "lucide-react";

export function SOSButton() {
  const { triggerSOS } = useGuardian();
  const [mode, setMode] = useState<"slide" | "hold">("slide");
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);

  const startHold = () => {
    setIsHolding(true);
    setHoldProgress(0);
    const startTime = Date.now();
    const duration = 2000;

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        setIsHolding(false);
        triggerSOS("manual_hold");
      }
    }, 20);
  };

  const endHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleSliderMove = (clientX: number) => {
    if (!isDragging || !sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const maxDrag = rect.width - 56;
    const current = Math.max(0, Math.min(maxDrag, clientX - rect.left - 28));
    setSliderPosition(current);

    if (current >= maxDrag * 0.92) {
      setIsDragging(false);
      setSliderPosition(0);
      triggerSOS("manual_slide");
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/40 shadow-xl shadow-rose-950/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300">
              Emergency SOS Beacon
            </h3>
            <p className="text-[10px] text-slate-400">
              Instant trusted contacts dispatch & GPS beacon
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
          <button
            type="button"
            onClick={() => setMode("slide")}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              mode === "slide" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Slide
          </button>
          <button
            type="button"
            onClick={() => setMode("hold")}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              mode === "hold" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Hold 2s
          </button>
        </div>
      </div>

      {mode === "slide" ? (
        <div
          ref={sliderTrackRef}
          onMouseMove={(e) => isDragging && handleSliderMove(e.clientX)}
          onMouseUp={() => { setIsDragging(false); setSliderPosition(0); }}
          onMouseLeave={() => { setIsDragging(false); setSliderPosition(0); }}
          onTouchMove={(e) => isDragging && handleSliderMove(e.touches[0].clientX)}
          onTouchEnd={() => { setIsDragging(false); setSliderPosition(0); }}
          className="relative w-full h-14 bg-slate-950 rounded-xl border border-rose-500/30 overflow-hidden flex items-center select-none"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold tracking-wider uppercase text-rose-300/70 flex items-center gap-1">
              Slide to Activate SOS
              <ChevronRight className="w-4 h-4 animate-pulse" />
            </span>
          </div>

          <div
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            style={{ transform: `translateX(${sliderPosition}px)` }}
            className="absolute left-1 w-12 h-12 rounded-lg bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 flex items-center justify-center text-white cursor-grab active:cursor-grabbing shadow-lg shadow-rose-600/50 transition-transform duration-75 z-10"
          >
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          className="relative w-full h-14 rounded-xl bg-slate-950 border border-rose-500/40 overflow-hidden flex items-center justify-center group select-none active:scale-[0.99] transition-transform"
        >
          <div
            style={{ width: `${holdProgress}%` }}
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-rose-600 to-red-600 transition-all duration-75 opacity-90"
          />
          <div className="relative z-10 flex items-center gap-2 text-rose-200 group-hover:text-white font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className={`w-5 h-5 ${isHolding ? "animate-spin" : ""}`} />
            <span>
              {isHolding ? `Hold for SOS (${Math.round(holdProgress)}%)` : "Press & Hold for 2s to Trigger SOS"}
            </span>
          </div>
        </button>
      )}

      <div className="mt-2 text-center">
        <span className="text-[10px] text-slate-500 font-mono">
          Protected against accidental activation • Manual SOS overrides AI
        </span>
      </div>
    </div>
  );
}
