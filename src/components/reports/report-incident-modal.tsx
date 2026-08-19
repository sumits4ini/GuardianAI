"use client";

import React, { useState } from "react";
import { useGuardian } from "@/lib/store/demo-context";
import { ReportCategory, ReportSeverity } from "@/types";
import { 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  X, 
  EyeOff, 
  AlertTriangle,
  Lightbulb,
  Radio,
  HelpCircle
} from "lucide-react";

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function ReportIncidentModal({ isOpen, onClose }: ReportIncidentModalProps) {
  const { addCommunityReport, currentCoords } = useGuardian();

  const [category, setCategory] = useState<ReportCategory>("poor_lighting");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("Near Current Transit Corridor");
  const [severity, setSeverity] = useState<ReportSeverity>("MODERATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    await addCommunityReport({
      category,
      description,
      approximateLocationName: locationName,
      severity,
      latitude: currentCoords.lat + (Math.random() - 0.5) * 0.002,
      longitude: currentCoords.lng + (Math.random() - 0.5) * 0.002,
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setDescription("");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-elevated p-6 border border-slate-700 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Report Community Safety Hazard
            </h2>
            <p className="text-xs text-slate-400">
              Contribute anonymized safety intelligence to protect other commuters
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-white">
              Report Successfully Submitted & Analyzed
            </h3>
            <p className="text-xs text-slate-400">
              AI classified severity and updated community safety risk layers.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Category Selection Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Incident Category
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-left border transition-all ${
                      category === cat.value
                        ? "bg-indigo-600/30 border-indigo-500 text-white shadow-sm"
                        : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Incident Description & Context
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="Describe what you observed (e.g. 3 broken streetlights, aggressive loitering, dark alleyway detour)..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Location input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Approximate Landmark / Street Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 pl-9 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Privacy notice banner */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
              <EyeOff className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>
                Your identity and exact personal location are scrubbed to protect your privacy.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? "Classifying with AI..." : "Submit Community Report"}</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
