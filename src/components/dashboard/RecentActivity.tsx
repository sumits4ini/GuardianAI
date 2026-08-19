"use client";

import React from "react";
import Link from "next/link";
import { CommunityReport } from "@/types";
import { calculateEmergingRiskTrend } from "@/lib/safety/trend-analyzer";
import { detectSafetyHotspots } from "@/lib/safety/hotspot-detector";
import { MapPin, TrendingUp, ChevronRight, Layers } from "lucide-react";

interface RecentActivityProps {
  reports: CommunityReport[];
}

export function RecentActivity({ reports }: RecentActivityProps) {
  const riskTrend = calculateEmergingRiskTrend(reports);
  const hotspots = detectSafetyHotspots(reports);

  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm transition-colors">
      
      {/* Header with Risk Trend Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Community Safety Intelligence</span>
        </h3>

        <div className={`px-2 py-0.5 rounded-lg border text-[10px] font-extrabold flex items-center gap-1 ${
          riskTrend.trend === "INCREASING"
            ? "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300"
            : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
        }`}>
          <TrendingUp className="w-3 h-3" />
          <span>{riskTrend.trendBadge}</span>
        </div>
      </div>

      {/* Hotspots Summary Counter */}
      {hotspots.length > 0 && (
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              <strong>{hotspots.length} Safety Hotspot{hotspots.length > 1 ? "s" : ""}</strong> identified nearby
            </span>
          </div>
          <Link
            href="/map"
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-0.5"
          >
            <span>View Map</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Anonymous Recent Reports Feed */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {reports.length > 0 ? (
          reports.slice(0, 4).map((r) => (
            <div key={r.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white capitalize">{r.category.replace('_', ' ')}</span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                  r.severity === "CRITICAL"
                    ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40"
                    : r.severity === "HIGH"
                    ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-500/40"
                    : "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40"
                }`}>
                  {r.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">{r.description}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>📍 {r.approximateLocationName}</span>
                <span className="italic">Anonymous Report</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-slate-500 text-xs">
            No active hazards reported in your corridor.
          </div>
        )}
      </div>

      {/* Full Map CTA */}
      <Link
        href="/map"
        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors block text-center"
      >
        <span>Open Safety Intelligence Map</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>

    </div>
  );
}
