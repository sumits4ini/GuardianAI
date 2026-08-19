"use client";

import { useGuardian } from "@/lib/store/demo-context";
import { Coordinates } from "@/types";

export function useJourney() {
  const {
    activeJourney,
    currentCoords,
    startJourney,
    completeJourney,
    cancelJourney,
    performCheckIn,
  } = useGuardian();

  return {
    activeJourney,
    currentCoords,
    isJourneyActive: !!activeJourney && activeJourney.status === "active",
    startJourney: (
      originName: string,
      originCoords: Coordinates,
      destName: string,
      destCoords: Coordinates,
      durationMins?: number,
      checkInIntervalMins?: number
    ) => startJourney(originName, originCoords, destName, destCoords, durationMins, checkInIntervalMins),
    completeJourney,
    cancelJourney,
    performCheckIn,
  };
}
