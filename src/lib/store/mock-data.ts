import { CommunityReport, SafetyJourney, TrustedContact, UserProfile } from "@/types";

export const INITIAL_USER_PROFILE: UserProfile = {
  id: "usr_guardian_01",
  fullName: "Alex Rivera",
  phone: "+1 (555) 439-8821",
  emergencyNotes: "Blood Type: O+ | Severe Penicillin Allergy | Carry Asthma Inhaler",
  contacts: [
    {
      id: "cnt_01",
      name: "Maya Rivera",
      phone: "+1 (555) 892-3341",
      email: "maya.rivera@example.com",
      relationship: "Sister",
      notifyOnHighRisk: true,
      notifyOnSos: true,
    },
    {
      id: "cnt_02",
      name: "Jordan Lee",
      phone: "+1 (555) 304-9912",
      email: "jordan.lee@example.com",
      relationship: "Roommate / Travel Partner",
      notifyOnHighRisk: true,
      notifyOnSos: true,
    },
    {
      id: "cnt_03",
      name: "Campus Safety Escort Desk",
      phone: "+1 (555) 019-2831",
      email: "safety@campus-dispatch.edu",
      relationship: "Campus Security Desk",
      notifyOnHighRisk: false,
      notifyOnSos: true,
    },
  ],
};

// Base coordinates around a vibrant university / urban tech corridor (Downtown / Innovation District)
export const DEFAULT_CENTER = {
  lat: 37.7749,
  lng: -122.4194,
};

export const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: "rep_01",
    category: "harassment",
    description: "Group of 3 individuals shouting aggressive comments at solo commuters near the underpass entrance.",
    latitude: 37.7762,
    longitude: -122.4178,
    approximateLocationName: "4th St Underpass & Metro Alley",
    severity: "HIGH",
    aiClassification: {
      category: "harassment",
      severity: "HIGH",
      riskScoreContribution: 28,
      reasoning: "Active pattern of confrontational behavior near a transit chokepoint.",
    },
    aiConfidence: 0.94,
    status: "verified",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 mins ago
    verifiedCount: 7,
  },
  {
    id: "rep_02",
    category: "poor_lighting",
    description: "4 consecutive streetlight outages along the pedestrian pathway. Very dark corridor between East Quad and Parking B.",
    latitude: 37.7735,
    longitude: -122.4215,
    approximateLocationName: "East Quad Walkway",
    severity: "MODERATE",
    aiClassification: {
      category: "poor_lighting",
      severity: "MODERATE",
      riskScoreContribution: 16,
      reasoning: "Severely reduced ambient visibility during evening and night hours.",
    },
    aiConfidence: 0.91,
    status: "verified",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    verifiedCount: 12,
  },
  {
    id: "rep_03",
    category: "isolated_area",
    description: "Industrial service road with blocked pedestrian sightlines and no emergency call boxes.",
    latitude: 37.7785,
    longitude: -122.4142,
    approximateLocationName: "Warehouse Service Lane B",
    severity: "HIGH",
    aiClassification: {
      category: "isolated_area",
      severity: "HIGH",
      riskScoreContribution: 24,
      reasoning: "Extremely low foot traffic, no surveillance, high vulnerability corridor.",
    },
    aiConfidence: 0.89,
    status: "active",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    verifiedCount: 4,
  },
  {
    id: "rep_04",
    category: "suspicious_activity",
    description: "Unoccupied vehicle idling in a no-parking blind spot with tinted windows for over 90 minutes.",
    latitude: 37.7721,
    longitude: -122.4165,
    approximateLocationName: "Pine & 6th Ave Corner",
    severity: "MODERATE",
    aiClassification: {
      category: "suspicious_activity",
      severity: "MODERATE",
      riskScoreContribution: 14,
      reasoning: "Persistent stationary presence in a low-visibility residential turn.",
    },
    aiConfidence: 0.86,
    status: "active",
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    verifiedCount: 3,
  },
  {
    id: "rep_05",
    category: "theft",
    description: "Phone snatching incident reported by a solo jogger; suspect fled toward the train tracks.",
    latitude: 37.7771,
    longitude: -122.4231,
    approximateLocationName: "North Canal Jogging Track",
    severity: "HIGH",
    aiClassification: {
      category: "theft",
      severity: "HIGH",
      riskScoreContribution: 26,
      reasoning: "Recent opportunistic physical crime within the last hour.",
    },
    aiConfidence: 0.95,
    status: "verified",
    createdAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    verifiedCount: 9,
  },
  {
    id: "rep_06",
    category: "unsafe_road",
    description: "Sidewalk completely torn up for utility trenching; pedestrians forced onto narrow unlit roadway without sidewalk.",
    latitude: 37.7712,
    longitude: -122.4255,
    approximateLocationName: "8th & Elm Street Corridor",
    severity: "LOW",
    aiClassification: {
      category: "unsafe_road",
      severity: "LOW",
      riskScoreContribution: 8,
      reasoning: "Physical infrastructure hazard requiring minor detour.",
    },
    aiConfidence: 0.88,
    status: "active",
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    verifiedCount: 5,
  }
];

export const PRESET_JOURNEYS = [
  {
    name: "Campus Library -> North Student Hostel",
    origin: {
      name: "Main Campus Library Plaza",
      coords: { lat: 37.7718, lng: -122.4225 },
    },
    destination: {
      name: "North Student Hostel Complex",
      coords: { lat: 37.7792, lng: -122.4158 },
    },
    defaultDurationMins: 22,
    checkInIntervalMins: 10,
  },
  {
    name: "Tech Innovation Hub -> Downtown Metro Station",
    origin: {
      name: "Innovation Research Lab",
      coords: { lat: 37.7788, lng: -122.4248 },
    },
    destination: {
      name: "Central Metro Transit Hub",
      coords: { lat: 37.7732, lng: -122.4135 },
    },
    defaultDurationMins: 18,
    checkInIntervalMins: 8,
  },
  {
    name: "Evening Shift Hospital -> Residential Quad",
    origin: {
      name: "City Medical Center - West Wing",
      coords: { lat: 37.7705, lng: -122.4172 },
    },
    destination: {
      name: "Oakridge Residential Apartments",
      coords: { lat: 37.7776, lng: -122.4219 },
    },
    defaultDurationMins: 25,
    checkInIntervalMins: 10,
  }
];
