import { SafetyJourney, Coordinates, CommunityReport } from "@/types";
import { calculateDistanceKm } from "@/lib/utils";

export type AnomalyType =
  | "ROUTE_DEVIATION"
  | "UNEXPECTED_STOP"
  | "UNUSUAL_DELAY"
  | "MISSED_CHECK_IN"
  | "OVERDUE_ARRIVAL"
  | "ELEVATED_RISK_AREA_ENTRY";

export interface JourneyAnomaly {
  type: AnomalyType;
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  recommendedPrompt: string;
  detectedAt: string;
}

export interface AnomalyDetectionResult {
  hasAnomaly: boolean;
  anomalies: JourneyAnomaly[];
  primaryAnomaly: JourneyAnomaly | null;
  aggregateAnomalyRiskScore: number;
  anomalyType?: string;
}

export interface AnomalyDetectionOptions {
  journey: SafetyJourney | null;
  currentCoords?: Coordinates;
  previousCoords?: Coordinates;
  nearbyReports?: CommunityReport[];
  isStationary?: boolean;
  stationaryDurationMins?: number;
  nowDate?: Date;
}

/**
 * ============================================================================
 * INTELLIGENT JOURNEY ANOMALY DETECTION ENGINE
 * ============================================================================
 *
 * Evaluates spatio-temporal anomalies along active journey corridors:
 * 1. Route Deviation: User diverged from planned corridor path.
 * 2. Unexpected Stop: Stationary for > 5 minutes outside arrival area.
 * 3. Unusual Delay: Journey elapsed duration exceeds 150% of expected duration.
 * 4. Missed Check-in: Scheduled check-in interval has elapsed.
 * 5. Overdue Arrival: Current timestamp exceeds expected arrival.
 * 6. Elevated Risk Area Entry: User within 300m of verified high/critical reports.
 *
 * NOTE: An anomaly NEVER automatically triggers SOS.
 * Progression: ANOMALY -> Explain -> Elevate contextual risk -> Ask for check-in -> Provide SOS.
 */
export function detectJourneyAnomalies(
  optionsOrJourney: AnomalyDetectionOptions | SafetyJourney | null,
  legacyCoords?: Coordinates,
  legacyNowDate?: Date
): AnomalyDetectionResult {
  let options: AnomalyDetectionOptions;

  if (optionsOrJourney && ("status" in optionsOrJourney || "destination" in optionsOrJourney)) {
    // Positional / legacy signature
    options = {
      journey: optionsOrJourney as SafetyJourney,
      currentCoords: legacyCoords,
      nowDate: legacyNowDate,
    };
  } else {
    // Options object signature
    options = (optionsOrJourney as AnomalyDetectionOptions) || { journey: null };
  }

  const {
    journey,
    currentCoords,
    nearbyReports = [],
    isStationary = false,
    stationaryDurationMins = 0,
    nowDate,
  } = options;

  const now = nowDate || new Date();
  const nowMs = now.getTime();
  const anomalies: JourneyAnomaly[] = [];
  let aggregateRisk = 0;

  if (!journey || journey.status === "COMPLETED" || journey.status === "CANCELLED") {
    return {
      hasAnomaly: false,
      anomalies: [],
      primaryAnomaly: null,
      aggregateAnomalyRiskScore: 0,
    };
  }

  // 1. Route Deviation Anomaly
  if (journey.routeDeviationDetected) {
    anomalies.push({
      type: "ROUTE_DEVIATION",
      severity: "CRITICAL",
      title: "Route Corridor Deviation",
      description: "Significant route deviation detected away from planned corridor.",
      recommendedPrompt: "You appear to have diverged from your planned route. Please perform a safety check-in.",
      detectedAt: now.toISOString(),
    });
    aggregateRisk += 28;
  }

  // 2. Unexpected Stop Anomaly (Stationary for > 5 mins away from destination)
  if (isStationary && stationaryDurationMins >= 5) {
    const destLat = journey.destinationLatitude || journey.destinationCoords?.lat;
    const destLng = journey.destinationLongitude || journey.destinationCoords?.lng;
    let isNearDestination = false;

    if (currentCoords && destLat && destLng) {
      const distToDest = calculateDistanceKm(currentCoords.lat, currentCoords.lng, destLat, destLng);
      isNearDestination = distToDest < 0.15; // Within 150m of destination
    }

    if (!isNearDestination) {
      const severity = stationaryDurationMins >= 10 ? "HIGH" : "MODERATE";
      anomalies.push({
        type: "UNEXPECTED_STOP",
        severity,
        title: "Unexpected Stationary Pause",
        description: `Movement paused for ${stationaryDurationMins} minutes en route.`,
        recommendedPrompt: "Unscheduled stop detected. Confirm you are safe or extend your arrival time.",
        detectedAt: now.toISOString(),
      });
      aggregateRisk += stationaryDurationMins >= 10 ? 20 : 12;
    }
  }

  // 3. Overdue Arrival Anomaly
  const arrivalMs = new Date(journey.expectedArrival).getTime();
  if (nowMs > arrivalMs) {
    const overdueMins = Math.round((nowMs - arrivalMs) / 60000);
    const severity = overdueMins > 15 ? "CRITICAL" : "HIGH";
    anomalies.push({
      type: "OVERDUE_ARRIVAL",
      severity,
      title: "Expected Arrival Passed",
      description: `Expected arrival time exceeded by ${overdueMins} minute(s) without destination check-in.`,
      recommendedPrompt: "Your expected arrival time has passed. Please tap 'I'm Safe' or request assistance.",
      detectedAt: now.toISOString(),
    });
    aggregateRisk += overdueMins > 15 ? 26 : 22;
  }

  // 4. Missed Check-in Anomaly
  if (journey.lastCheckIn) {
    const lastCheckInMs = new Date(journey.lastCheckIn).getTime();
    const elapsedMins = (nowMs - lastCheckInMs) / 60000;
    const interval = journey.checkInIntervalMins || 10;

    if (elapsedMins > interval + 5) {
      anomalies.push({
        type: "MISSED_CHECK_IN",
        severity: "HIGH",
        title: "Corridor Check-In Overdue",
        description: `Scheduled check-in is overdue by ${Math.round(elapsedMins - interval)} minutes.`,
        recommendedPrompt: "Scheduled check-in reminder is overdue. Tap 'I'm Safe' to update your status.",
        detectedAt: now.toISOString(),
      });
      aggregateRisk += 20;
    }
  }

  // 5. Elevated Risk Area Entry (Proximity < 300m to high/critical reports)
  if (currentCoords && nearbyReports.length > 0) {
    const nearbyHighThreats = nearbyReports.filter((r) => {
      const isSevere = r.severity === "HIGH" || r.severity === "CRITICAL";
      if (!isSevere) return false;
      const d = calculateDistanceKm(currentCoords.lat, currentCoords.lng, r.latitude, r.longitude);
      return d <= 0.3; // within 300 meters
    });

    if (nearbyHighThreats.length > 0) {
      anomalies.push({
        type: "ELEVATED_RISK_AREA_ENTRY",
        severity: "HIGH",
        title: "High-Hazard Zone Proximity",
        description: `Entered within 300m of active ${nearbyHighThreats[0].category.replace("_", " ")} report.`,
        recommendedPrompt: "You are traveling near a recently reported incident. Stay on well-lit main avenues.",
        detectedAt: now.toISOString(),
      });
      aggregateRisk += 18;
    }
  }

  // 6. Unusual Delay (Elapsed duration > 150% of planned duration)
  if (journey.startedAt && journey.expectedArrival) {
    const startMs = new Date(journey.startedAt).getTime();
    const plannedDurationMs = arrivalMs - startMs;
    const elapsedDurationMs = nowMs - startMs;

    if (plannedDurationMs > 0 && elapsedDurationMs > plannedDurationMs * 1.5 && nowMs <= arrivalMs) {
      anomalies.push({
        type: "UNUSUAL_DELAY",
        severity: "MODERATE",
        title: "Unusual Journey Delay",
        description: "Travel progress is significantly slower than typical corridor baseline.",
        recommendedPrompt: "Your transit is taking longer than expected. Check your route or update ETA.",
        detectedAt: now.toISOString(),
      });
      aggregateRisk += 10;
    }
  }

  const primary = anomalies.length > 0 ? anomalies[0] : null;
  const legacyType = primary?.type === "ROUTE_DEVIATION" ? "CORRIDOR_DEVIATION" : primary?.type;

  return {
    hasAnomaly: anomalies.length > 0,
    anomalies,
    primaryAnomaly: primary,
    aggregateAnomalyRiskScore: Math.min(60, aggregateRisk),
    anomalyType: legacyType,
  };
}
