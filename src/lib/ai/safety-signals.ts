import { SafetySignalData } from "./validators";
import { CommunityReport, SafetyJourney, Coordinates } from "@/types";
import { calculateDistanceKm } from "@/lib/utils";

export type SafetySignalType =
  | "JOURNEY_ACTIVE"
  | "CHECK_IN_RECENT"
  | "CHECK_IN_OVERDUE"
  | "ARRIVAL_OVERDUE"
  | "NEARBY_REPORT"
  | "HIGH_SEVERITY_REPORT"
  | "SOS_ACTIVE"
  | "ROUTE_DEVIATION"
  | "STATIONARY_DELAY";

export interface SafetySignalContext {
  journey?: SafetyJourney | null;
  currentCoords?: Coordinates;
  nearbyReports?: CommunityReport[];
  travelHour?: number;
  sosActive?: boolean;
  now?: Date;
}

/**
 * Extracts normalized safety signals from active context.
 * Used for deterministic scoring, explainability, and prompt generation.
 */
export function extractSafetySignals(context: SafetySignalContext): SafetySignalData[] {
  const signals: SafetySignalData[] = [];
  const now = context.now || new Date();
  const nowMs = now.getTime();

  // 1. SOS Active
  if (context.sosActive) {
    signals.push({
      type: "SOS_ACTIVE",
      severity: "CRITICAL",
      description: "Emergency SOS broadcast is currently active",
      timestamp: now.toISOString(),
    });
  }

  // 2. Journey-specific Signals
  if (context.journey && (context.journey.status === "ACTIVE" || context.journey.status === "ATTENTION_REQUIRED")) {
    signals.push({
      type: "JOURNEY_ACTIVE",
      severity: "INFO",
      description: `Active corridor protection to ${context.journey.destinationName || context.journey.destination}`,
      timestamp: context.journey.startedAt || now.toISOString(),
    });

    // Check Expected Arrival Overdue
    const arrivalMs = new Date(context.journey.expectedArrival).getTime();
    if (nowMs > arrivalMs) {
      const overdueMins = Math.round((nowMs - arrivalMs) / 60000);
      signals.push({
        type: "ARRIVAL_OVERDUE",
        severity: "HIGH",
        description: `Expected arrival time exceeded by ${overdueMins} mins without completion`,
        timestamp: now.toISOString(),
      });
    }

    // Check Check-in Status
    if (context.journey.lastCheckIn) {
      const lastCheckInMs = new Date(context.journey.lastCheckIn).getTime();
      const elapsedMins = (nowMs - lastCheckInMs) / 60000;
      const interval = context.journey.checkInIntervalMins || 10;

      if (elapsedMins > interval + 5) {
        signals.push({
          type: "CHECK_IN_OVERDUE",
          severity: "HIGH",
          description: `Scheduled corridor check-in is overdue by ${Math.round(elapsedMins - interval)} mins`,
          timestamp: now.toISOString(),
        });
      } else if (elapsedMins <= 5) {
        signals.push({
          type: "CHECK_IN_RECENT",
          severity: "LOW",
          description: `Safety check-in recorded ${Math.round(elapsedMins)} min(s) ago`,
          timestamp: context.journey.lastCheckIn,
        });
      }
    }

    // Route Deviation
    if (context.journey.routeDeviationDetected) {
      signals.push({
        type: "ROUTE_DEVIATION",
        severity: "CRITICAL",
        description: "Significant route deviation detected from planned transit corridor",
        timestamp: now.toISOString(),
      });
    }
  }

  // 3. Nearby Safety Reports
  if (context.nearbyReports && context.nearbyReports.length > 0) {
    const highSev = context.nearbyReports.filter(
      (r) => r.severity === "HIGH" || r.severity === "CRITICAL"
    );
    const modSev = context.nearbyReports.filter((r) => r.severity === "MODERATE");

    if (highSev.length > 0) {
      signals.push({
        type: "HIGH_SEVERITY_REPORT",
        severity: "CRITICAL",
        description: `${highSev.length} high-severity hazard(s) reported in immediate vicinity (${highSev.map((h) => h.category.replace("_", " ")).slice(0, 2).join(", ")})`,
        timestamp: highSev[0].createdAt,
      });
    }

    if (modSev.length > 0) {
      signals.push({
        type: "NEARBY_REPORT",
        severity: "MODERATE",
        description: `${modSev.length} community safety incident(s) reported within corridor radius`,
        timestamp: modSev[0].createdAt,
      });
    }
  }

  // 4. Temporal Signal
  const hour = context.travelHour !== undefined ? context.travelHour : now.getHours();
  if (hour >= 23 || hour <= 4) {
    signals.push({
      type: "NEARBY_REPORT",
      severity: "MODERATE",
      description: `Late night travel window (${hour}:00) with reduced pedestrian foot traffic`,
      timestamp: now.toISOString(),
    });
  }

  return signals;
}
