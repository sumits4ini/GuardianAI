import { CommunityReport } from "@/types";

export interface AnonymousCommunityReport {
  id: string;
  category: string;
  description: string;
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  latitude: number;
  longitude: number;
  approximateLocationName: string;
  createdAt: string;
  verifiedCount?: number;
  aiClassification?: {
    category: string;
    severity: string;
    confidence: number;
  };
}

/**
 * Anonymizes a single community safety report before sending to public map/feed.
 * Strips all personal identifiers (name, email, phone, user_id) and applies
 * privacy-preserving coordinate rounding (~100m fuzzy precision).
 */
export function anonymizeCommunityReport(report: Partial<CommunityReport>): AnonymousCommunityReport {
  // Round to 3 decimal places (~110m precision) to protect exact residence/origin locations
  const fuzzyLat = report.latitude !== undefined ? Number(report.latitude.toFixed(3)) : 37.7749;
  const fuzzyLng = report.longitude !== undefined ? Number(report.longitude.toFixed(3)) : -122.4194;

  return {
    id: report.id || `rep_${Date.now()}`,
    category: report.category || "other",
    description: report.description || "Community safety observation",
    severity: (report.severity as any) || "MODERATE",
    latitude: fuzzyLat,
    longitude: fuzzyLng,
    approximateLocationName: report.approximateLocationName || "Community Corridor Area",
    createdAt: report.createdAt || new Date().toISOString(),
    verifiedCount: report.verifiedCount || 1,
    aiClassification: report.aiClassification ? {
      category: report.aiClassification.category,
      severity: report.aiClassification.severity,
      confidence: report.aiClassification.confidence ?? 0.9,
    } : undefined,
  };
}

/**
 * Anonymizes an array of community reports for public consumption.
 */
export function anonymizeCommunityReports(reports: CommunityReport[]): AnonymousCommunityReport[] {
  return reports.map(anonymizeCommunityReport);
}
