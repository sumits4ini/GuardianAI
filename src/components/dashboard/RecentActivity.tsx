"use client";

import React from "react";
import { CommunityReport } from "@/types";
import { MapPin, Clock, AlertTriangle } from "lucide-react";

interface RecentActivityProps {
  reports: CommunityReport[];
}

export function RecentActivity({ reports }: RecentActivityProps) {
  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          Recent Corridor Safety Activity
        </h3>
        <span className="text-[10px] font-mono text-slate-500">LIVE FEED</span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {reports.slice(0, 4).map((r) => (
          <div key={r.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white capitalize">{r.category.replace('_', ' ')}</span>
              <span className="text-[10px] text-slate-500">
                {Math.round((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60))}m ago
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">{r.description}</p>
            <div className="text-[10px] text-slate-400">📍 {r.approximateLocationName}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
