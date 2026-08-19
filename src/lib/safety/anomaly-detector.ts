import { Coordinates } from "@/types";
import { calculateDistanceKm } from "@/lib/utils";

/**
 * Anomaly Detection Engine
 * Calculates whether user current coordinates deviate from the expected polyline corridor
 */
export function detectRouteAnomaly(
  current: Coordinates,
  origin: Coordinates,
  destination: Coordinates,
  maxToleranceKm: number = 0.6
): {
  isDeviated: boolean;
  perpendicularDistanceKm: number;
  anomalyDescription?: string;
} {
  // Calculate cross-track distance using vector geometry approximation
  const totalJourneyDist = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const distFromOrigin = calculateDistanceKm(origin.lat, origin.lng, current.lat, current.lng);
  const distToDest = calculateDistanceKm(current.lat, current.lng, destination.lat, destination.lng);

  // If distance to origin + distance to dest is substantially greater than direct path, deviation occurred
  const detourRatio = (distFromOrigin + distToDest) / (totalJourneyDist || 0.001);
  const estimatedPerpendicularDist = Math.max(0, (distFromOrigin + distToDest - totalJourneyDist) * 0.5);

  const isDeviated = estimatedPerpendicularDist > maxToleranceKm || detourRatio > 1.45;

  return {
    isDeviated,
    perpendicularDistanceKm: Number(estimatedPerpendicularDist.toFixed(2)),
    anomalyDescription: isDeviated
      ? `User location is ${estimatedPerpendicularDist.toFixed(2)}km off planned transit corridor`
      : undefined,
  };
}

/**
 * Detects unexpected prolonged stationary stops during active transit
 */
export function detectStationaryDelay(
  lastMovementTime: string,
  thresholdMins: number = 12
): boolean {
  const elapsedMins = (Date.now() - new Date(lastMovementTime).getTime()) / (1000 * 60);
  return elapsedMins > thresholdMins;
}
