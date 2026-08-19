import { CommunityReport } from "@/types";

export interface EmergingRiskTrend {
  trend: "INCREASING" | "STABLE" | "DECREASING";
  trendBadge: string;
  changePercentage: number;
  recentCount: number;
  previousCount: number;
  explanation: string;
  disclaimer: string;
}

/**
 * Emerging Risk Trend Analyzer
 * Compares recent report activity with prior baseline period.
 * Categorizes velocity into INCREASING, STABLE, or DECREASING.
 */
export function calculateEmergingRiskTrend(
  reports: CommunityReport[],
  recentWindowHours: number = 48
): EmergingRiskTrend {
  const now = Date.now();
  const windowMs = recentWindowHours * 60 * 60 * 1000;
  const recentBoundary = now - windowMs;
  const previousBoundary = now - windowMs * 2;

  let recentCount = 0;
  let previousCount = 0;
  let recentSevereCount = 0;

  reports.forEach((r) => {
    const time = new Date(r.createdAt).getTime();
    if (time >= recentBoundary) {
      recentCount++;
      if (r.severity === "HIGH" || r.severity === "CRITICAL") {
        recentSevereCount++;
      }
    } else if (time >= previousBoundary) {
      previousCount++;
    }
  });

  // Calculate percentage delta
  let changePercentage = 0;
  if (previousCount === 0) {
    changePercentage = recentCount > 0 ? 100 : 0;
  } else {
    changePercentage = Math.round(((recentCount - previousCount) / previousCount) * 100);
  }

  let trend: "INCREASING" | "STABLE" | "DECREASING" = "STABLE";
  let trendBadge = "→ Risk stable";
  let explanation = "Report activity is consistent with historical corridor baseline.";

  if (changePercentage >= 25 || (recentCount >= 3 && recentSevereCount >= 2)) {
    trend = "INCREASING";
    trendBadge = "↑ Risk increasing";
    explanation = "Report activity has increased compared with the previous period.";
  } else if (changePercentage <= -25 && previousCount >= 2) {
    trend = "DECREASING";
    trendBadge = "↓ Risk decreasing";
    explanation = "Fewer incident reports logged compared with the previous period.";
  }

  return {
    trend,
    trendBadge,
    changePercentage,
    recentCount,
    previousCount,
    explanation,
    disclaimer: "Community observation trends are based on submitted user reports and do not represent official law enforcement statistics.",
  };
}
