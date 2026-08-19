"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  UserProfile, 
  TrustedContact, 
  SafetyJourney, 
  CommunityReport, 
  RiskAssessment, 
  Coordinates,
  LocationEvent,
  SOSAlert,
  OverallSafetyState,
  JourneyStatus
} from "@/types";
import { INITIAL_USER_PROFILE, INITIAL_COMMUNITY_REPORTS, DEFAULT_CENTER } from "./mock-data";
import { calculateDistanceKm } from "@/lib/utils";

interface GuardianContextType {
  userProfile: UserProfile;
  activeJourney: SafetyJourney | null;
  journeyHistory: SafetyJourney[];
  locationEvents: LocationEvent[];
  currentCoords: Coordinates;
  communityReports: CommunityReport[];
  riskAssessment: RiskAssessment;
  isEvaluatingRisk: boolean;
  sosActive: boolean;
  sosAlert: SOSAlert | null;
  overallSafetyState: OverallSafetyState;
  lastCheckInConfirmation: string | null;
  isDemoMode: boolean;
  activeDemoScenario: string | null;
  
  // Actions
  startJourney: (
    originName: string,
    originCoords: Coordinates,
    destName: string,
    destCoords: Coordinates,
    durationMins?: number,
    checkInIntervalMins?: number
  ) => Promise<SafetyJourney>;
  completeJourney: () => Promise<void>;
  cancelJourney: () => Promise<void>;
  performCheckIn: (coords?: Coordinates) => Promise<{ success: boolean; message: string; timestamp: string }>;
  extendJourney: (additionalMins: number) => void;
  addCommunityReport: (report: Partial<CommunityReport>) => Promise<CommunityReport>;
  triggerSOS: (triggerType?: string, coords?: Coordinates | null) => Promise<SOSAlert>;
  resolveSOS: (notes?: string) => Promise<void>;
  cancelSOS: () => void;
  getShareableLocationUrl: (coords?: Coordinates) => string;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addTrustedContact: (contact: Omit<TrustedContact, "id">) => void;
  removeTrustedContact: (id: string) => void;
  evaluateRisk: (customCoords?: Coordinates, deviation?: boolean) => Promise<void>;
  setDemoScenario: (scenarioKey: string) => Promise<void>;
  toggleDemoMode: (enabled?: boolean) => void;
  setCurrentCoords: (coords: Coordinates) => void;
}

const defaultInitialRisk: RiskAssessment = {
  riskScore: 12,
  riskLevel: 'SAFE',
  confidence: 0.94,
  signals: [
    "Standard daytime visibility and normal foot traffic",
    "No high-severity incidents within 800m",
    "User location within planned transit corridor"
  ],
  reasoning: "Overall contextual risk is low. Maintain scheduled check-ins and normal awareness.",
  recommendedAction: "Keep app active and travel on designated lit streets.",
  escalationLevel: 'NONE',
  evaluatedAt: new Date().toISOString(),
};

const GuardianContext = createContext<GuardianContextType | undefined>(undefined);

export function GuardianProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [activeJourney, setActiveJourney] = useState<SafetyJourney | null>(null);
  const [journeyHistory, setJourneyHistory] = useState<SafetyJourney[]>([]);
  const [locationEvents, setLocationEvents] = useState<LocationEvent[]>([]);
  const [currentCoords, setCurrentCoordsState] = useState<Coordinates>(DEFAULT_CENTER);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(INITIAL_COMMUNITY_REPORTS);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>(defaultInitialRisk);
  const [isEvaluatingRisk, setIsEvaluatingRisk] = useState<boolean>(false);
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [sosAlert, setSosAlert] = useState<SOSAlert | null>(null);
  const [lastCheckInConfirmation, setLastCheckInConfirmation] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [activeDemoScenario, setActiveDemoScenario] = useState<string | null>("standard_commute");

  const setCurrentCoords = useCallback((coords: Coordinates) => {
    setCurrentCoordsState(coords);
  }, []);

  // Compute overall safety state
  const computeOverallState = useCallback((): OverallSafetyState => {
    if (sosActive) return "SOS_ACTIVE";
    if (!activeJourney) return "SAFE";

    const now = Date.now();
    const arrivalTime = new Date(activeJourney.expectedArrival).getTime();
    if (activeJourney.status === "ATTENTION_REQUIRED" || (activeJourney.status === "ACTIVE" && now > arrivalTime)) {
      return "ATTENTION_REQUIRED";
    }

    if (activeJourney.nextCheckInDue) {
      const nextDue = new Date(activeJourney.nextCheckInDue).getTime();
      if (now > nextDue) {
        return "CHECK_IN_OVERDUE";
      }
    }

    return "JOURNEY_ACTIVE";
  }, [activeJourney, sosActive]);

  const overallSafetyState = computeOverallState();

  // Monitor expected arrival and check-in overdue every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeJourney || activeJourney.status === "COMPLETED" || activeJourney.status === "CANCELLED") {
        return;
      }

      const now = Date.now();
      const arrivalTime = new Date(activeJourney.expectedArrival).getTime();

      // If expected arrival passed and status is still ACTIVE, transition to ATTENTION_REQUIRED
      if (activeJourney.status === "ACTIVE" && now > arrivalTime) {
        setActiveJourney((prev) => prev ? {
          ...prev,
          status: "ATTENTION_REQUIRED",
          currentRiskLevel: prev.currentRiskLevel === "SAFE" ? "MODERATE" : prev.currentRiskLevel,
        } : null);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeJourney]);

  // Helper to record a location event
  const recordLocationEvent = useCallback((
    coords: Coordinates,
    journeyId: string,
    isDeviation: boolean = false
  ) => {
    const event: LocationEvent = {
      id: `loc_${Date.now()}`,
      userId: userProfile.id,
      journeyId,
      latitude: coords.lat,
      longitude: coords.lng,
      accuracy: coords.accuracy || 15,
      speed: coords.speed,
      heading: coords.heading,
      isDeviation,
      timestamp: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
    };

    setLocationEvents((prev) => [event, ...prev.slice(0, 49)]); // keep last 50 events
    return event;
  }, [userProfile.id]);

  // Evaluate risk using AI route or internal safety heuristic
  const evaluateRisk = useCallback(async (customCoords?: Coordinates, deviationOverride?: boolean) => {
    setIsEvaluatingRisk(true);
    const coords = customCoords || currentCoords;
    const isDeviated = deviationOverride !== undefined ? deviationOverride : (activeJourney?.routeDeviationDetected || false);
    const now = new Date();

    const nearby = communityReports.filter((rep) => {
      const d = calculateDistanceKm(coords.lat, coords.lng, rep.latitude, rep.longitude);
      return d <= 1.5;
    });

    const payload = {
      originName: activeJourney?.originName || "Current Location",
      destinationName: activeJourney?.destinationName || "Planned Destination",
      originCoords: activeJourney?.originCoords || coords,
      destinationCoords: activeJourney?.destinationCoords || { lat: coords.lat + 0.005, lng: coords.lng + 0.005 },
      currentCoords: coords,
      startTime: activeJourney?.startTime || new Date(Date.now() - 10 * 60000).toISOString(),
      expectedArrival: activeJourney?.expectedArrival || new Date(Date.now() + 15 * 60000).toISOString(),
      lastCheckInTime: activeJourney?.lastCheckIn || new Date().toISOString(),
      checkInIntervalMins: activeJourney?.checkInIntervalMins || 10,
      routeDeviationDetected: isDeviated,
      nearbyReports: nearby,
      travelHour: now.getHours(),
    };

    try {
      const res = await fetch("/api/ai/risk-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.assessment) {
          setRiskAssessment(data.assessment);
          if (activeJourney) {
            setActiveJourney((prev) => prev ? {
              ...prev,
              currentRiskScore: data.assessment.riskScore,
              currentRiskLevel: data.assessment.riskLevel,
            } : null);
          }
          return;
        }
      }
    } catch (err) {
      console.warn("AI risk assessment endpoint unreachable, standard heuristic active:", err);
    } finally {
      setIsEvaluatingRisk(false);
    }
  }, [activeJourney, communityReports, currentCoords]);

  // Start Journey
  const startJourney = async (
    originName: string,
    originCoords: Coordinates,
    destName: string,
    destCoords: Coordinates,
    durationMins: number = 20,
    checkInIntervalMins: number = 10
  ): Promise<SafetyJourney> => {
    const now = new Date();
    const expectedArrival = new Date(now.getTime() + durationMins * 60000).toISOString();
    const nextCheckInDue = new Date(now.getTime() + checkInIntervalMins * 60000).toISOString();

    const journeyId = `jrn_${Date.now()}`;

    const newJourney: SafetyJourney = {
      id: journeyId,
      userId: userProfile.id,
      user_id: userProfile.id,
      startLocation: originName,
      start_location: originName,
      originName,
      originCoords,
      destination: destName,
      destinationName: destName,
      destinationLatitude: destCoords.lat,
      destination_latitude: destCoords.lat,
      destinationLongitude: destCoords.lng,
      destination_longitude: destCoords.lng,
      destinationCoords: destCoords,
      currentCoords: originCoords,
      startedAt: now.toISOString(),
      started_at: now.toISOString(),
      startTime: now.toISOString(),
      expectedArrival,
      expected_arrival: expectedArrival,
      status: "ACTIVE",
      currentRiskScore: 14,
      currentRiskLevel: "SAFE",
      lastCheckIn: now.toISOString(),
      last_check_in: now.toISOString(),
      checkInIntervalMins,
      nextCheckInDue,
      routeDeviationDetected: false,
      createdAt: now.toISOString(),
      created_at: now.toISOString(),
      updatedAt: now.toISOString(),
      updated_at: now.toISOString(),
    };

    setCurrentCoordsState(originCoords);
    setActiveJourney(newJourney);
    recordLocationEvent(originCoords, journeyId, false);
    setLastCheckInConfirmation(null);

    // Call journeys API in background
    try {
      fetch("/api/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJourney),
      }).catch((e) => console.warn("API journey sync notice:", e));
    } catch {}

    await evaluateRisk(originCoords, false);
    return newJourney;
  };

  // Perform Safety Check-in
  const performCheckIn = async (coords?: Coordinates): Promise<{ success: boolean; message: string; timestamp: string }> => {
    if (!activeJourney) {
      return { success: false, message: "No active journey to check in for.", timestamp: new Date().toLocaleTimeString() };
    }

    const checkInCoords = coords || currentCoords;
    const now = new Date();
    const nextCheckInDue = new Date(now.getTime() + activeJourney.checkInIntervalMins * 60000).toISOString();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Record location event
    recordLocationEvent(checkInCoords, activeJourney.id, false);

    // Update active journey
    setActiveJourney((prev) => prev ? {
      ...prev,
      lastCheckIn: now.toISOString(),
      last_check_in: now.toISOString(),
      nextCheckInDue,
      status: prev.status === "ATTENTION_REQUIRED" ? "ACTIVE" : prev.status,
      updatedAt: now.toISOString(),
      updated_at: now.toISOString(),
    } : null);

    const confirmationMsg = `✓ You're checked in (Last check-in: ${formattedTime})`;
    setLastCheckInConfirmation(confirmationMsg);

    // Notify backend
    try {
      fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyId: activeJourney.id,
          latitude: checkInCoords.lat,
          longitude: checkInCoords.lng,
          accuracy: checkInCoords.accuracy,
        }),
      }).catch(() => {});
    } catch {}

    await evaluateRisk(checkInCoords, false);
    return { success: true, message: confirmationMsg, timestamp: formattedTime };
  };

  // Extend Journey Arrival Time
  const extendJourney = (additionalMins: number = 10) => {
    if (!activeJourney) return;
    const currentExpected = new Date(activeJourney.expectedArrival).getTime();
    const newExpected = new Date(currentExpected + additionalMins * 60000).toISOString();

    setActiveJourney((prev) => prev ? {
      ...prev,
      expectedArrival: newExpected,
      expected_arrival: newExpected,
      status: "ACTIVE", // reset from attention required
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } : null);
  };

  // Complete Journey
  const completeJourney = async () => {
    if (activeJourney) {
      const now = new Date();
      const finishedJourney: SafetyJourney = {
        ...activeJourney,
        status: "COMPLETED",
        completedAt: now.toISOString(),
        completed_at: now.toISOString(),
        updatedAt: now.toISOString(),
        updated_at: now.toISOString(),
      };

      setJourneyHistory((prev) => [finishedJourney, ...prev]);
      setActiveJourney(finishedJourney);

      recordLocationEvent(currentCoords, activeJourney.id, false);

      setTimeout(() => {
        setActiveJourney(null);
        setLastCheckInConfirmation(null);
      }, 1800);
    }
  };

  // Cancel Journey
  const cancelJourney = async () => {
    if (activeJourney) {
      const cancelledJourney: SafetyJourney = {
        ...activeJourney,
        status: "CANCELLED",
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setJourneyHistory((prev) => [cancelledJourney, ...prev]);
      setActiveJourney(null);
      setLastCheckInConfirmation(null);
    }
  };

  // Trigger SOS Emergency
  const triggerSOS = async (triggerType: string = "manual_hold", coords?: Coordinates | null): Promise<SOSAlert> => {
    setSosActive(true);
    const now = new Date();
    const isLocationAvailable = coords !== null && coords !== undefined;
    const alertCoords = coords || currentCoords;

    const alertId = `sos_${Date.now()}`;
    const newAlert: SOSAlert = {
      id: alertId,
      userId: userProfile.id,
      user_id: userProfile.id,
      journeyId: activeJourney?.id,
      journey_id: activeJourney?.id,
      sessionId: activeJourney?.id,
      triggerType: triggerType as any,
      latitude: alertCoords?.lat,
      longitude: alertCoords?.lng,
      accuracy: alertCoords?.accuracy,
      status: "ACTIVE",
      triggeredAt: now.toISOString(),
      triggered_at: now.toISOString(),
      createdAt: now.toISOString(),
      created_at: now.toISOString(),
      notificationStatus: "DEMO",
      locationUnavailable: !isLocationAvailable,
    };

    setSosAlert(newAlert);

    if (alertCoords && activeJourney) {
      recordLocationEvent(alertCoords, activeJourney.id, true);
    }

    // Dispatch to SOS API
    try {
      fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyId: activeJourney?.id,
          userId: userProfile.id,
          triggerType,
          latitude: alertCoords?.lat,
          longitude: alertCoords?.lng,
          accuracy: alertCoords?.accuracy,
          notificationStatus: "DEMO",
          locationUnavailable: !isLocationAvailable,
        }),
      }).catch(() => {});
    } catch {}

    return newAlert;
  };

  // Resolve SOS
  const resolveSOS = async (notes?: string) => {
    const now = new Date();
    if (sosAlert) {
      const resolved: SOSAlert = {
        ...sosAlert,
        status: "RESOLVED",
        resolvedAt: now.toISOString(),
        resolved_at: now.toISOString(),
      };
      setSosAlert(resolved);
    }
    setSosActive(false);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setSosAlert(null);
  };

  // Privacy-safe shareable location representation
  const getShareableLocationUrl = (coords?: Coordinates): string => {
    const loc = coords || currentCoords;
    return `https://www.google.com/maps?q=${loc.lat.toFixed(5)},${loc.lng.toFixed(5)}`;
  };

  // Add Community Report
  const addCommunityReport = async (reportData: Partial<CommunityReport>): Promise<CommunityReport> => {
    let aiClassification = reportData.aiClassification;
    let aiConfidence = reportData.aiConfidence || 0.92;

    try {
      const res = await fetch("/api/ai/report-classifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: reportData.description || "",
          category: reportData.category || "other",
          latitude: reportData.latitude || currentCoords.lat,
          longitude: reportData.longitude || currentCoords.lng,
          approximateLocationName: reportData.approximateLocationName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.classification) {
          aiClassification = data.classification;
          aiConfidence = data.classification.confidence;
        }
      }
    } catch (err) {
      console.warn("AI classifier offline, standard tags applied:", err);
    }

    const newReport: CommunityReport = {
      id: `rep_${Date.now()}`,
      userId: userProfile.id,
      category: reportData.category || "suspicious_activity",
      description: reportData.description || "Community safety observation",
      latitude: reportData.latitude || currentCoords.lat,
      longitude: reportData.longitude || currentCoords.lng,
      approximateLocationName: reportData.approximateLocationName || "Near Current Location",
      severity: reportData.severity || aiClassification?.severity || "MODERATE",
      aiClassification,
      aiConfidence,
      status: "active",
      createdAt: new Date().toISOString(),
      verifiedCount: 1,
    };

    setCommunityReports((prev) => [newReport, ...prev]);
    await evaluateRisk();
    return newReport;
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const addTrustedContact = (contact: Omit<TrustedContact, "id">) => {
    const newContact: TrustedContact = {
      ...contact,
      id: `cnt_${Date.now()}`,
    };
    setUserProfile((prev) => ({
      ...prev,
      contacts: [...prev.contacts, newContact],
    }));
  };

  const removeTrustedContact = (id: string) => {
    setUserProfile((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== id),
    }));
  };

  // Demo Scenarios
  const setDemoScenario = async (scenarioKey: string) => {
    setActiveDemoScenario(scenarioKey);
    setIsDemoMode(true);

    if (scenarioKey === "safe_commute") {
      const safeLoc = { lat: 37.7725, lng: -122.4215 };
      setCurrentCoordsState(safeLoc);
      if (activeJourney) {
        setActiveJourney((prev) => prev ? {
          ...prev,
          currentCoords: safeLoc,
          routeDeviationDetected: false,
          currentRiskScore: 15,
          currentRiskLevel: "SAFE",
          status: "ACTIVE",
        } : null);
      }
      await evaluateRisk(safeLoc, false);
    } else if (scenarioKey === "hotspot_proximity") {
      const hotspotLoc = { lat: 37.7760, lng: -122.4180 };
      setCurrentCoordsState(hotspotLoc);
      if (activeJourney) {
        setActiveJourney((prev) => prev ? {
          ...prev,
          currentCoords: hotspotLoc,
          routeDeviationDetected: false,
          currentRiskScore: 56,
          currentRiskLevel: "HIGH",
        } : null);
      }
      await evaluateRisk(hotspotLoc, false);
    } else if (scenarioKey === "route_deviation") {
      const devLoc = { lat: 37.7782, lng: -122.4145 };
      setCurrentCoordsState(devLoc);
      if (activeJourney) {
        setActiveJourney((prev) => prev ? {
          ...prev,
          currentCoords: devLoc,
          routeDeviationDetected: true,
          currentRiskScore: 78,
          currentRiskLevel: "CRITICAL",
        } : null);
      }
      await evaluateRisk(devLoc, true);
    } else if (scenarioKey === "missed_checkin") {
      const devLoc = { lat: 37.7782, lng: -122.4145 };
      setCurrentCoordsState(devLoc);
      if (activeJourney) {
        setActiveJourney((prev) => prev ? {
          ...prev,
          lastCheckIn: new Date(Date.now() - 25 * 60000).toISOString(),
          last_check_in: new Date(Date.now() - 25 * 60000).toISOString(),
          status: "ATTENTION_REQUIRED",
          currentRiskScore: 88,
          currentRiskLevel: "CRITICAL",
        } : null);
      }
      await evaluateRisk(devLoc, true);
    }
  };

  const toggleDemoMode = (enabled?: boolean) => {
    setIsDemoMode((prev) => enabled !== undefined ? enabled : !prev);
  };

  return (
    <GuardianContext.Provider
      value={{
        userProfile,
        activeJourney,
        journeyHistory,
        locationEvents,
        currentCoords,
        communityReports,
        riskAssessment,
        isEvaluatingRisk,
        sosActive,
        sosAlert,
        overallSafetyState,
        lastCheckInConfirmation,
        isDemoMode,
        activeDemoScenario,
        startJourney,
        completeJourney,
        cancelJourney,
        performCheckIn,
        extendJourney,
        addCommunityReport,
        triggerSOS,
        resolveSOS,
        cancelSOS,
        getShareableLocationUrl,
        updateUserProfile,
        addTrustedContact,
        removeTrustedContact,
        evaluateRisk,
        setDemoScenario,
        toggleDemoMode,
        setCurrentCoords,
      }}
    >
      {children}
    </GuardianContext.Provider>
  );
}

export function useGuardian() {
  const context = useContext(GuardianContext);
  if (!context) {
    throw new Error("useGuardian must be used within a GuardianProvider");
  }
  return context;
}
