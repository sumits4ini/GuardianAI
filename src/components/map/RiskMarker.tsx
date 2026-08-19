import React from "react";
import { ReportSeverity, ReportCategory } from "@/types";

export interface RiskMarkerProps {
  category: ReportCategory;
  severity: ReportSeverity;
  description: string;
  approxLocation: string;
}

export function getRiskMarkerColor(severity: ReportSeverity): string {
  switch (severity) {
    case "CRITICAL": return "#ef4444";
    case "HIGH": return "#f97316";
    case "MODERATE": return "#f59e0b";
    default: return "#3b82f6";
  }
}

export function getRiskMarkerIcon(category: ReportCategory): string {
  switch (category) {
    case "harassment": return "⚠️";
    case "poor_lighting": return "💡";
    case "suspicious_activity": return "👁️";
    case "isolated_area": return "🚧";
    case "theft": return "🛑";
    case "unsafe_road": return "🛠️";
    case "accident": return "🚨";
    default: return "📍";
  }
}
