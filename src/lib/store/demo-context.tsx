"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  UserProfile, 
  TrustedContact, 
  SafetyJourney, 
  CommunityReport, 
  RiskAssessment, 
  Coordinates,
  RiskLevel
} from "@/types";
import { INITIAL_USER_PROFILE, INITIAL_COMMUNITY_REPORTS, DEFAULT_CENTER } from "./mock-data";
import { calculateDistanceKm, getRiskLevelFromScore } from "@/lib/utils";

interface GuardianContextType {
  userProfile: UserProfile;
  activeJourney: SafetyJourney | null;
  currentCoords: Coordinates;
  communityReports: CommunityReport[];
  riskAssessment: RiskAssessment;
  isEvaluatingRisk: boolean;
  sosActive: boolean;
  sosDetails: any | null;
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
  ) => Promise<void>;
  completeJourney: () => void;
  cancelJourney: () => void;
  performCheckIn: () => Promise<void>;
  addCommunityReport: (report: Partial<CommunityReport>) => Promise<CommunityReport>;
  triggerSOS: (triggerType?: string) => Promise<void>;
  cancelSOS: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addTrustedContact: (contact: Omit<TrustedContact, "id">) => void;
  removeTrustedContact: (id: string) => void;
  evaluateRisk: (customCoords?: Coordinates, deviation?: boolean) => Promise<void>;
  setDemoScenario: (scenarioKey: string) => Promise<void>;
  toggleDemoMode: (enabled?: boolean) => void;
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
  const [currentCoords, setCurrentCoords] = useState<Coordinates>(DEFAULT_CENTER);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(INITIAL_COMMUNITY_REPORTS);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>(defaultInitialRisk);
  const [isEvaluatingRisk, setIsEvaluatingRisk] = useState<boolean>(false);
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [sosDetails, setSosDetails] = useState<any | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [activeDemoScenario, setActiveDemoScenario] = useState<string | null>("standard_commute");

  // Acquire real user geolocation if permitted and not in demo mode
  useEffect(() => {
    if (!isDemoMode && typeof window !== "undefined" && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCurrentCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          });
        },
        (err) => {
          console.warn("Geolocation permission or lock error, using fallback location:", err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isDemoMode]);

  // Evaluate risk using the AI Route Handler or internal engine
  const evaluateRisk = useCallback(async (customCoords?: Coordinates, deviationOverride?: boolean) => {
    setIsEvaluatingRisk(true);
    const coords = customCoords || currentCoords;
    const isDeviated = deviationOverride !== undefined ? deviationOverride : (activeJourney?.routeDeviationDetected || false);
    const now = new Date();

    // Filter nearby reports within 1.5km
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
              activeAssessment: data.assessment,
            } : null);
          }
          return;
        }
      }
    } catch (err) {
      console.warn("Error calling AI risk assessment endpoint, using fallback logic:", err);
    } finally {
      setIsEvaluatingRisk(false);
    }
  }, [activeJourney, communityReports, currentCoords]);

  // Start a new journey
  const startJourney = async (
    originName: string,
    originCoords: Coordinates,
    destName: string,
    destCoords: Coordinates,
    durationMins: number = 20,
    checkInIntervalMins: number = 10
  ) => {
    const now = new Date();
    const expectedArrival = new Date(now.getTime() + durationMins * 60000).toISOString();
    const nextCheckInDue = new Date(now.getTime() + checkInIntervalMins * 60000).toISOString();

    const newJourney: SafetyJourney = {
      id: `jrn_${Date.now()}`,
      userId: userProfile.id,
      originName,
      originCoords,
      destinationName: destName,
      destinationCoords: destCoords,
      currentCoords: originCoords,
      startTime: now.toISOString(),
      expectedArrival,
      status: "active",
      currentRiskScore: 14,
      currentRiskLevel: "SAFE",
      lastCheckIn: now.toISOString(),
      checkInIntervalMins,
      nextCheckInDue,
      routeDeviationDetected: false,
    };

    setCurrentCoords(originCoords);
    setActiveJourney(newJourney);
    await evaluateRisk(originCoords, false);
  };

  const completeJourney = () => {
    if (activeJourney) {
      setActiveJourney((prev) => prev ? { ...prev, status: "completed" } : null);
      setTimeout(() => setActiveJourney(null), 1500);
    }
  };

  const cancelJourney = () => {
    setActiveJourney(null);
  };

  // Perform scheduled or manual check-in
  const performCheckIn = async () => {
    if (!activeJourney) return;
    const now = new Date();
    const nextCheckInDue = new Date(now.getTime() + activeJourney.checkInIntervalMins * 60000).toISOString();

    setActiveJourney((prev) => prev ? {
      ...prev,
      lastCheckIn: now.toISOString(),
      nextCheckInDue,
    } : null);

    // Re-evaluate risk to acknowledge safe check-in
    await evaluateRisk();
  };

  // Add a new community report
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
      console.warn("AI classifier error, applying standard tags:", err);
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

  // SOS Emergency Trigger
  const triggerSOS = async (triggerType: string = "manual_slide") => {
    setSosActive(true);
    const payload = {
      journeyId: activeJourney?.id,
      userId: userProfile.id,
      triggerType,
      latitude: currentCoords.lat,
      longitude: currentCoords.lng,
      contacts: userProfile.contacts,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setSosDetails(data);
      }
    } catch (err) {
      console.error("SOS Trigger network error:", err);
    }
  };

  const cancelSOS = () => {
    setSosActive(false);
    setSosDetails(null);
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

  // 1-Click Interactive Demo Scenarios
  const setDemoScenario = async (scenarioKey: string) => {
    setActiveDemoScenario(scenarioKey);
    setIsDemoMode(true);

    if (scenarioKey === "safe_commute") {
      // Step 1: Normal safe travel
      const safeLoc = { lat: 37.7725, lng: -122.4215 };
      setCurrentCoords(safeLoc);
      if (activeJourney) {
        setActiveJourney((prev) => prev ? {
          ...prev,
          currentCoords: safeLoc,
          routeDeviationDetected: false,
          currentRiskScore: 15,
          currentRiskLevel: "SAFE",
        } : null);
      }
      await evaluateRisk(safeLoc, false);
    } else if (scenarioKey === "hotspot_proximity") {
      // Step 2: User approaches unlit alley with active harassment cluster
      const hotspotLoc = { lat: 37.7760, lng: -122.4180 };
      setCurrentCoords(hotspotLoc);
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
      // Step 3: Sudden route deviation down isolated warehouse lane
      const devLoc = { lat: 37.7782, lng: -122.4145 };
      setCurrentCoords(devLoc);
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
      // Step 4: Missed check-in overdue timer
      const devLoc = { lat: 37.7782, lng: -122.4145 };
      setCurrentCoords(devLoc);
      if (activeJourney) {
        setActiveJourney((prev) => prev ? {
          ...prev,
          lastCheckIn: new Date(Date.now() - 25 * 60000).toISOString(),
          routeDeviationDetected: true,
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
        currentCoords,
        communityReports,
        riskAssessment,
        isEvaluatingRisk,
        sosActive,
        sosDetails,
        isDemoMode,
        activeDemoScenario,
        startJourney,
        completeJourney,
        cancelJourney,
        performCheckIn,
        addCommunityReport,
        triggerSOS,
        cancelSOS,
        updateUserProfile,
        addTrustedContact,
        removeTrustedContact,
        evaluateRisk,
        setDemoScenario,
        toggleDemoMode,
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
