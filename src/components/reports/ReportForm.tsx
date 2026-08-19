"use client";

import React, { useState } from "react";
import { ReportCategory, ReportSeverity } from "@/types";
import { Sparkles, MapPin, EyeOff, ShieldCheck } from "lucide-react";

interface ReportFormProps {
  onSubmitReport: (
    category: ReportCategory,
    description: string,
    approxLocation: string,
    severity?: ReportSeverity
  ) => Promise<void>;
}

const CATEGORIES: { label: string; value: ReportCategory; icon: string }[] = [
  { label: "Harassment / Stalking", value: "harassment", icon: "⚠️" },
  { label: "Poor / Broken Lighting", value: "poor_lighting", icon: "💡" },
  { label: "Suspicious Activity", value: "suspicious_activity", icon: "👁️" },
  { label: "Isolated / Unsafe Area", value: "isolated_area", icon: "🚧" },
  { label: "Theft / Snatching", value: "theft", icon: "🛑" },
  { label: "Unsafe Road / Sidewalk", value: "unsafe_road", icon: "🛠️" },
  { label: "Accident / Hazard", value: "accident", icon: "🚨" },
  { label: "Other Hazard", value: "other", icon: "📍" },
];

export function ReportForm({ onSubmitReport }: ReportFormProps) {
  const [category, setCategory] = useState<ReportCategory>("poor_lighting");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("Near Current Transit Corridor");
  const [severity, setSeverity] = useState<ReportSeverity>("MODERATE");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    await onSubmitReport(category, description, locationName, severity);
    setLoading(false);
    setSuccess(true);
    setDescription("");
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Submit Community Safety Hazard</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Anonymized observation to inform spatial safety scoring</p>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-500/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Report submitted successfully and classified by AI!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Hazard Category</label>
          <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`p-2 rounded-xl text-xs font-medium text-left border transition-all truncate flex items-center gap-1.5 shadow-sm ${
                  category === cat.value
                    ? "bg-indigo-100 dark:bg-indigo-600/30 border-indigo-300 dark:border-indigo-500 text-indigo-900 dark:text-white"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe what you observed (e.g., 3 broken streetlights, aggressive loitering)..."
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Approximate Location</label>
          <div className="relative">
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2 pl-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
            <MapPin className="w-4 h-4 text-amber-500 dark:text-amber-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
          <EyeOff className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span>Identity and exact user coords are scrubbed for privacy.</span>
        </div>

        <button
          type="submit"
          disabled={loading || !description.trim()}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? "Analyzing Hazard with AI..." : "Submit Hazard Report"}</span>
        </button>
      </form>
    </div>
  );
}
