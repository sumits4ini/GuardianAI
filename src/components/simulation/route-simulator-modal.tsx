"use client";

import React, { useState, useEffect } from "react";
import { RouteComparisonResult, RouteOption } from "@/types";
import { useGuardian } from "@/lib/store/demo-context";
import { 
  SlidersHorizontal, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Lightbulb, 
  Users, 
  Navigation, 
  Sparkles, 
  X, 
  Check 
} from "lucide-react";
import { getRiskColor } from "@/lib/utils";

interface RouteSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RouteSimulatorModal({ isOpen, onClose }: RouteSimulatorModalProps) {
  const { currentCoords, activeJourney, startJourney } = useGuardian();
  
  const [isLoading, setIsLoading] = useState(false);
  const [comparison, setComparison] = useState<RouteComparisonResult | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("route_safety_corridor");

  useEffect(() => {
    if (isOpen) {
      fetchRouteComparison();
    }
  }, [isOpen]);

  const fetchRouteComparison = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/route-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: { coords: currentCoords },
          destination: { coords: activeJourney?.destinationCoords || { lat: 37.7792, lng: -122.4158 } },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComparison(data.comparison);
        setSelectedRouteId(data.comparison.recommendedRouteId);
      }
    } catch (err) {
      console.warn("Failed to load route simulation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel-elevated p-6 border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                AI Route Safety Simulator
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                PROACTIVE COMPARISON
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluates speed vs illuminated pedestrian safety factors
            </p>
          </div>
        </div>

        {/* AI Insight Box */}
        {comparison && (
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 mb-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Comparative Safety Analysis</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {comparison.reasoning}
            </p>
            <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{comparison.safetyTip}</span>
            </div>
          </div>
        )}

        {/* Route Cards Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Computing route safety factors and street illumination metrics...</p>
            </div>
          ) : (
            comparison?.routes.map((route) => {
              const isSelected = selectedRouteId === route.id;
              const isRecommended = comparison.recommendedRouteId === route.id;
              const riskColor = getRiskColor(route.riskLevel);

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected ? "bg-cyan-500 border-cyan-400 text-slate-950" : "border-slate-600"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          {route.name}
                          {isRecommended && (
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              RECOMMENDED SAFE ROUTE
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{route.description}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded border ${riskColor.badge}`}>
                        RISK {route.riskScore}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{route.durationMins} mins</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Navigation className="w-3.5 h-3.5 text-slate-400" />
                      <span>{route.distanceKm} km</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span className="capitalize">{route.lightingLevel}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="capitalize">{route.crowdLevel} Density</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            Advisory risk rating based on community reporting
          </span>
          <button
            onClick={() => {
              onClose();
              // If not active, start the selected preset route
              const chosen = comparison?.routes.find((r) => r.id === selectedRouteId);
              if (chosen) {
                startJourney(
                  "Main Campus Plaza",
                  { lat: chosen.coordinates[0][0], lng: chosen.coordinates[0][1] },
                  chosen.name,
                  { lat: chosen.coordinates[chosen.coordinates.length - 1][0], lng: chosen.coordinates[chosen.coordinates.length - 1][1] },
                  chosen.durationMins
                );
              }
            }}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all"
          >
            Apply Route & Start Journey
          </button>
        </div>

      </div>
    </div>
  );
}
