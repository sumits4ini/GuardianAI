"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Clock, Navigation, ArrowRight, Check, Sparkles } from "lucide-react";
import { getRiskColor } from "@/lib/utils";

interface RouteComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  originName?: string;
  destinationName?: string;
}

export function RouteComparisonModal({
  isOpen,
  onClose,
  originName = "Current Location",
  destinationName = "Downtown Transit Center",
}: RouteComparisonModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("route_safe");

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    fetch("/api/ai/route-comparison", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: originName,
        destination: destinationName,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setData(json);
          setSelectedRouteId(json.recommendedRouteId || "route_safe");
        }
      })
      .catch((err) => console.error("Route comparison fetch error:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, originName, destinationName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Safe Corridor Route Comparison</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40">
                  AI ADVISORY
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {originName} <ArrowRight className="inline w-3 h-3 text-slate-400" /> {destinationName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Evaluating lighting, foot traffic, and incident hazards...</p>
          </div>
        ) : data ? (
          <div className="space-y-4">
            
            {/* Routes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {data.routes.map((route: any) => {
                const isSelected = selectedRouteId === route.id;
                const isSafe = route.id === "route_safe";
                const riskTheme = getRiskColor(route.riskLevel);

                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/10"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {isSafe && (
                      <span className="absolute -top-2.5 right-4 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white dark:text-slate-950 shadow-sm flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Recommended
                      </span>
                    )}

                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white pr-6">{route.name}</h4>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 dark:border-slate-700"
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-bold">{route.durationMins} min</span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">{route.distanceKm} km</div>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${riskTheme.badge}`}>
                          Risk {route.riskScore}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Lighting: </span>
                          <span className="text-slate-800 dark:text-slate-200">{route.lightingRating}</span>
                        </div>

                        {route.advantages && (
                          <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                            ✓ {route.advantages[0]}
                          </div>
                        )}
                        {route.disadvantages && (
                          <div className="text-amber-700 dark:text-amber-400/90 font-medium">
                            ⚠ {route.disadvantages[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Explanation Box */}
            {data.aiExplanation && (
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>AI Corridor Intelligence</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                  &ldquo;{data.aiExplanation}&rdquo;
                </p>
              </div>
            )}

            {/* Mandatory Safety Disclaimer */}
            <p className="text-[10px] text-slate-500 text-center italic">
              {data.disclaimer}
            </p>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
              >
                Select {selectedRouteId === "route_safe" ? "Safest Corridor" : "Direct Route"}
              </button>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
