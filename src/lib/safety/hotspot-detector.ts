import { CommunityReport, RiskLevel } from "@/types";
import { calculateDistanceKm, getRiskLevelFromScore } from "@/lib/utils";

export interface SafetyHotspot {
  id: string;
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  radiusMeters: number;
  riskScore: number;
  riskLevel: RiskLevel;
  reportsCount: number;
  dominantCategories: string[];
  recentActivitySummary: string;
  trend: "INCREASING" | "STABLE" | "DECREASING";
  reports: CommunityReport[];
}

/**
 * Spatial Hotspot Detection Engine
 * Clusters nearby safety reports within a 450-meter radius, calculates aggregate risk,
 * identifies dominant hazard categories, and determines trend.
 */
export function detectSafetyHotspots(
  reports: CommunityReport[],
  clusterRadiusKm: number = 0.45
): SafetyHotspot[] {
  if (!reports || reports.length === 0) return [];

  const visited = new Set<string>();
  const hotspots: SafetyHotspot[] = [];

  for (let i = 0; i < reports.length; i++) {
    const root = reports[i];
    if (visited.has(root.id)) continue;

    const cluster: CommunityReport[] = [root];
    visited.add(root.id);

    for (let j = i + 1; j < reports.length; j++) {
      const candidate = reports[j];
      if (visited.has(candidate.id)) continue;

      const dist = calculateDistanceKm(root.latitude, root.longitude, candidate.latitude, candidate.longitude);
      if (dist <= clusterRadiusKm) {
        cluster.push(candidate);
        visited.add(candidate.id);
      }
    }

    // Only create a hotspot if there are 2 or more reports in proximity, or 1 critical report
    const hasCritical = cluster.some((r) => r.severity === "CRITICAL");
    if (cluster.length >= 2 || hasCritical) {
      // Calculate centroid
      const avgLat = cluster.reduce((sum, r) => sum + r.latitude, 0) / cluster.length;
      const avgLng = cluster.reduce((sum, r) => sum + r.longitude, 0) / cluster.length;

      // Calculate aggregate risk score
      let score = 15;
      let severeCount = 0;
      const catCounts: Record<string, number> = {};

      cluster.forEach((r) => {
        catCounts[r.category] = (catCounts[r.category] || 0) + 1;
        if (r.severity === "CRITICAL") {
          score += 24;
          severeCount++;
        } else if (r.severity === "HIGH") {
          score += 16;
          severeCount++;
        } else if (r.severity === "MODERATE") {
          score += 8;
        } else {
          score += 4;
        }
      });

      const clampedScore = Math.min(95, Math.max(20, score));
      const riskLevel = getRiskLevelFromScore(clampedScore);

      // Dominant categories sorted by frequency
      const dominant = Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([cat]) => cat.replace("_", " "));

      // Primary approximate area name
      const primaryLocName = cluster[0].approximateLocationName || `Quadrant (${avgLat.toFixed(3)}, ${avgLng.toFixed(3)})`;

      hotspots.push({
        id: `hotspot_${hotspots.length + 1}`,
        name: `${primaryLocName} Cluster`,
        center: { lat: avgLat, lng: avgLng },
        radiusMeters: Math.round(clusterRadiusKm * 1000),
        riskScore: clampedScore,
        riskLevel,
        reportsCount: cluster.length,
        dominantCategories: dominant,
        recentActivitySummary: `${cluster.length} incident(s) reported, primarily ${dominant.join(" + ")}.`,
        trend: severeCount >= 2 ? "INCREASING" : "STABLE",
        reports: cluster,
      });
    }
  }

  return hotspots.sort((a, b) => b.riskScore - a.riskScore);
}
