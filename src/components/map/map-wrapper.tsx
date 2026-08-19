"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Compass } from "lucide-react";

const SafetyMapView = dynamic(() => import("./safety-map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-3 p-6">
      <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
      </div>
      <div className="text-center">
        <span className="text-xs font-bold text-white block">Loading Spatial Safety Intelligence Map...</span>
        <span className="text-[10px] text-slate-500">Rendering OpenStreetMap tiles & safety hazard layers</span>
      </div>
    </div>
  ),
});

export function SafetyMap() {
  return <SafetyMapView />;
}
