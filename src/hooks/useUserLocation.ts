"use client";

import { useState, useEffect, useCallback } from "react";
import { Coordinates } from "@/types";
import { DEFAULT_CENTER } from "@/lib/store/mock-data";

export type LocationPermissionStatus = "prompt" | "granted" | "denied" | "unsupported";

export function useUserLocation(enableSimulation: boolean = false) {
  const [coordinates, setCoordinates] = useState<Coordinates>(DEFAULT_CENTER);
  const [accuracy, setAccuracy] = useState<number | undefined>(15);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>("prompt");
  const [isWatching, setIsWatching] = useState<boolean>(false);

  // Check browser permissions query if supported
  useEffect(() => {
    if (typeof window !== "undefined" && "permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          setPermissionStatus(result.state as LocationPermissionStatus);
          result.onchange = () => {
            setPermissionStatus(result.state as LocationPermissionStatus);
          };
        })
        .catch(() => {
          // Permissions query not supported for geolocation on some engines
        });
    }
  }, []);

  const translateGeolocationError = (err: GeolocationPositionError): string => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setPermissionStatus("denied");
        return "Location permission denied. Safety features and SOS remain fully functional with approximate location.";
      case err.POSITION_UNAVAILABLE:
        return "GPS satellite signal temporarily unavailable. Using approximate area coordinates.";
      case err.TIMEOUT:
        return "Location request timed out. Retrying in background.";
      default:
        return "Unable to determine precise GPS location.";
    }
  };

  // On-demand explicit location request
  const requestCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      setPermissionStatus("unsupported");
      return null;
    }

    setLoading(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: Coordinates = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed || undefined,
            heading: pos.coords.heading || undefined,
            timestamp: pos.timestamp,
          };
          setCoordinates(coords);
          setAccuracy(pos.coords.accuracy);
          setError(null);
          setPermissionStatus("granted");
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          const friendly = translateGeolocationError(err);
          setError(friendly);
          setLoading(false);
          // Return null so callers know GPS failed, but can continue with fallback coords
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 10000,
        }
      );
    });
  }, []);

  // Continuous watch during active journeys
  useEffect(() => {
    if (enableSimulation) return;
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setPermissionStatus("unsupported");
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
        setAccuracy(pos.coords.accuracy);
        setError(null);
        setPermissionStatus("granted");
      },
      (err) => {
        const friendly = translateGeolocationError(err);
        setError(friendly);
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
    setAccuracy(newCoords.accuracy || 10);
  }, []);

  return {
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    coordinates,
    accuracy,
    loading,
    error,
    permissionStatus,
    isWatching,
    requestCurrentLocation,
    setManualCoordinates,
    clearError: () => setError(null),
  };
}
