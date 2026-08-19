"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DemoControllerBar } from "@/components/demo/demo-controller-bar";
import { SafetyMap } from "@/components/map/SafetyMap";
import { MapFilters } from "@/components/map/MapFilters";
import { SOSEmergencyModal } from "@/components/sos/sos-emergency-modal";
import { RouteSimulatorModal } from "@/components/simulation/route-simulator-modal";
import { useGuardian } from "@/lib/store/demo-context";
import { ReportCategory } from "@/types";
import { MapPin, SlidersHorizontal, TrendingUp } from "lucide-react";

export default function MapPage() {
  const { communityReports } = useGuardian();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | "all">("all");
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  const highHazards = communityReports.filter((r) => r.severity === "HIGH" || r.severity === "CRITICAL").length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-16 lg:pb-0">
      <Navbar />
      <DemoControllerBar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Spatial Safety Intelligence Map</h1>
                <p className="text-xs text-slate-400">Real-time open street tiles, hazard markers & risk perimeters</p>
              </div>
            </div>

            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Simulate Safer Routes</span>
            </button>
          </div>

          <MapFilters
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            showHeatmap={showHeatmap}
            onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
          />

          <div className="h-[480px] w-full">
            <SafetyMap />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Active Reports</span>
              <span className="text-xl font-extrabold text-white font-mono">{communityReports.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">High Hazard Hotspots</span>
              <span className="text-xl font-extrabold text-rose-400 font-mono">{highHazards}</span>
            </div>
            <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Corridor Illumination</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">82%</span>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
      <SOSEmergencyModal />
      <RouteSimulatorModal isOpen={isSimulatorOpen} onClose={() => setIsSimulatorOpen(false)} />
    </div>
  );
}
