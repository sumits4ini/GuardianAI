"use client";

import { useState, useEffect, useCallback } from "react";
import { Coordinates } from "@/types";
import { DEFAULT_CENTER } from "@/lib/store/mock-data";

export function useUserLocation(enableSimulation: boolean = false) {
  const [coordinates, setCoordinates] = useState<Coordinates>(DEFAULT_CENTER);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState<boolean>(false);

  useEffect(() => {
    if (enableSimulation) return;

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setIsWatching(true);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoordinates({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed || undefined,
          heading: pos.coords.heading || undefined,
          timestamp: pos.timestamp,
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsWatching(false);
    };
  }, [enableSimulation]);

  const setManualCoordinates = useCallback((newCoords: Coordinates) => {
    setCoordinates(newCoords);
  }, []);

  return {
    coordinates,
    error,
    isWatching,
    setManualCoordinates,
  };
}
