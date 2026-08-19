import { CommunityReport, Coordinates, RiskAssessment, RiskLevel, EscalationLevel } from "@/types";
import { calculateDistanceKm, getRiskLevelFromScore } from "@/lib/utils";

export interface RiskCalculationContext {
  originCoords: Coordinates;
  destinationCoords: Coordinates;
  currentCoords?: Coordinates;
  travelHour: number; // 0 - 23
  startTime: string;
  expectedArrival: string;
  lastCheckInTime: string;
  checkInIntervalMins: number;
  routeDeviationDetected: boolean;
  nearbyReports: CommunityReport[];
}

/**
 * Deterministic Safety Risk Calculator Engine
 * Aggregates spatial proximity to hazards, temporal vulnerability, route deviation, and check-in adherence.
 */
export function calculateSafetyRisk(context: RiskCalculationContext): RiskAssessment {
  let score = 10; // Baseline safe score
  const signals: string[] = [];

  // 1. Temporal Vulnerability (Time of day)
  const hour = context.travelHour;
  if (hour >= 23 || hour <= 4) {
    score += 22;
    signals.push(`Late night travel window (${hour}:00) — significantly reduced ambient pedestrian foot traffic`);
  } else if (hour >= 20 || hour <= 6) {
    score += 12;
    signals.push(`Evening transit window (${hour}:00) — reduced natural surveillance`);
  } else {
    signals.push(`Daytime transit window — standard baseline visibility`);
  }

  // 2. Spatial Hazard Density (Nearby Community Reports)
  let criticalCount = 0;
  let highCount = 0;
  let moderateCount = 0;

  if (context.nearbyReports && context.nearbyReports.length > 0) {
    context.nearbyReports.forEach((rep) => {
      if (rep.severity === "CRITICAL") {
        criticalCount++;
        score += 22;
      } else if (rep.severity === "HIGH") {
        highCount++;
        score += 15;
      } else if (rep.severity === "MODERATE") {
        moderateCount++;
        score += 8;
      } else {
        score += 4;
      }
    });

    if (criticalCount > 0 || highCount > 0) {
      signals.push(`${criticalCount + highCount} severe safety hazard(s) reported within 1.5km radius`);
    }
    if (moderateCount > 0) {
      signals.push(`${moderateCount} moderate hazard(s) reported along active corridor`);
    }
  }

  // 3. Route Deviation Anomaly
  if (context.routeDeviationDetected) {
    score += 28;
    signals.push("Unexpected route deviation detected from planned travel corridor");
  }

  // 4. Scheduled Check-In Adherence
  const lastCheckInMs = new Date(context.lastCheckInTime).getTime();
  const nowMs = new Date().getTime();
  const elapsedSinceCheckInMins = (nowMs - lastCheckInMs) / (1000 * 60);

  if (elapsedSinceCheckInMins > context.checkInIntervalMins + 8) {
    score += 24;
    signals.push(`Scheduled check-in overdue by ${Math.round(elapsedSinceCheckInMins - context.checkInIntervalMins)} mins`);
  } else if (elapsedSinceCheckInMins > context.checkInIntervalMins) {
    score += 10;
    signals.push("Scheduled check-in reminder due now");
  }

  // 5. Normalization (Clamp 5 - 98)
  const finalScore = Math.min(98, Math.max(5, score));
  const riskLevel: RiskLevel = getRiskLevelFromScore(finalScore);

  let reasoning = "";
  let recommendedAction = "";
  let escalationLevel: EscalationLevel = "NONE";

  if (riskLevel === "SAFE") {
    reasoning = "Journey is progressing normally within the planned corridor with minimal environmental hazards.";
    recommendedAction = "Maintain standard awareness and complete scheduled check-ins.";
    escalationLevel = "NONE";
  } else if (riskLevel === "MODERATE") {
    reasoning = "Moderate environmental or temporal risk factors detected along the transit corridor.";
    recommendedAction = "Stay on illuminated main boulevards and monitor battery levels.";
    escalationLevel = "LOW";
  } else if (riskLevel === "HIGH") {
    reasoning = "Elevated risk signals detected: cluster of recent incident reports or significant route irregularities.";
    recommendedAction = "Send a live status check-in to your primary trusted contact and avoid dark alleyways.";
    escalationLevel = "MEDIUM";
  } else {
    reasoning = "Critical safety anomaly: severe route detour or overdue check-in near active high-hazard zones.";
    recommendedAction = "Perform an immediate safety check-in or prepare one-tap SOS beacon.";
    escalationLevel = "HIGH";
  }

  return {
    riskScore: finalScore,
    riskLevel,
    confidence: 0.94,
    signals,
    reasoning,
    recommendedAction,
    escalationLevel,
    evaluatedAt: new Date().toISOString(),
  };
}
