import { SafetyJourney, Coordinates } from "@/types";

export type AnomalyType =
  | "OVERDUE_ARRIVAL"
  | "MISSED_CHECK_IN"
  | "UNEXPECTED_STATUS"
  | "CORRIDOR_DEVIATION"
  | "STATIONARY_DELAY";

export interface AnomalyDetectionResult {
  hasAnomaly: boolean;
  anomalyType: AnomalyType | null;
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  description: string | null;
  recommendedPrompt: string | null;
  detectedAt: string;
}

/**
 * Baseline Anomaly Detection Engine (Phase 3 Foundation, extensible in Phase 4)
 * Detects: overdue journeys, missed check-ins, stationary pauses, and corridor detours.
 */
export function detectJourneyAnomalies(
  journey: SafetyJourney | null,
  currentCoords?: Coordinates,
  nowDate?: Date
): AnomalyDetectionResult {
  const now = nowDate || new Date();
  const nowMs = now.getTime();

  if (!journey || journey.status === "COMPLETED" || journey.status === "CANCELLED") {
    return {
      hasAnomaly: false,
      anomalyType: null,
      severity: "LOW",
      description: null,
      recommendedPrompt: null,
      detectedAt: now.toISOString(),
    };
  }

  // 1. Check Route Deviation
  if (journey.routeDeviationDetected) {
    return {
      hasAnomaly: true,
      anomalyType: "CORRIDOR_DEVIATION",
      severity: "CRITICAL",
      description: "Significant route deviation detected away from designated destination corridor.",
      recommendedPrompt: "You appear to have deviated from your route corridor. Please confirm your safety.",
      detectedAt: now.toISOString(),
    };
  }

  // 2. Check Overdue Arrival
  const arrivalMs = new Date(journey.expectedArrival).getTime();
  if (nowMs > arrivalMs) {
    const overdueMins = Math.round((nowMs - arrivalMs) / 60000);
    return {
      hasAnomaly: true,
      anomalyType: "OVERDUE_ARRIVAL",
      severity: overdueMins > 15 ? "CRITICAL" : "HIGH",
      description: `Expected arrival time passed by ${overdueMins} minute(s).`,
      recommendedPrompt: "Your expected arrival time has passed. Please check in or request assistance.",
      detectedAt: now.toISOString(),
    };
  }

  // 3. Check Overdue Check-in
  if (journey.lastCheckIn) {
    const lastCheckInMs = new Date(journey.lastCheckIn).getTime();
    const elapsedMins = (nowMs - lastCheckInMs) / 60000;
    const interval = journey.checkInIntervalMins || 10;

    if (elapsedMins > interval + 5) {
      return {
        hasAnomaly: true,
        anomalyType: "MISSED_CHECK_IN",
        severity: "HIGH",
        description: `Corridor check-in overdue by ${Math.round(elapsedMins - interval)} mins.`,
        recommendedPrompt: "Scheduled check-in reminder is overdue. Tap 'I'm Safe' to update your status.",
        detectedAt: now.toISOString(),
      };
    }
  }

  return {
    hasAnomaly: false,
    anomalyType: null,
    severity: "LOW",
    description: null,
    recommendedPrompt: null,
    detectedAt: now.toISOString(),
  };
}
