"use client";

import React from "react";
import { CommunityReport } from "@/types";
import { Sparkles, MapPin } from "lucide-react";

interface ReportCardProps {
  report: CommunityReport;
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
            report.severity === 'CRITICAL' || report.severity === 'HIGH'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : report.severity === 'MODERATE'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          }`}>
            {report.category.replace('_', ' ')}
          </span>
          <span className="text-[10px] text-slate-500">•</span>
          <span className="text-[11px] text-slate-400">📍 {report.approximateLocationName}</span>
        </div>

        <span className="text-[10px] text-slate-500">
          {Math.round((Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60))}m ago
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-snug">{report.description}</p>

      {report.aiClassification && (
        <div className="text-[10px] text-indigo-300 bg-indigo-950/40 px-2 py-1 rounded border border-indigo-500/20 flex items-center gap-1.5 mt-1">
          <Sparkles className="w-3 h-3 text-indigo-400 flex-shrink-0" />
          <span>AI Insight: {report.aiClassification.reasoning}</span>
        </div>
      )}
    </div>
  );
}
