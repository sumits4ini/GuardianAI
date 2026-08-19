export type JourneyStatus = 'idle' | 'active' | 'completed' | 'cancelled' | 'alert';

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp?: number;
}

export interface LocationEvent {
  id: string;
  sessionId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  isDeviation: boolean;
  recordedAt: string;
}

export interface SafetyJourney {
  id: string;
  userId: string;
  originName: string;
  originCoords: Coordinates;
  destinationName: string;
  destinationCoords: Coordinates;
  currentCoords?: Coordinates;
  startTime: string;
  expectedArrival: string;
  status: JourneyStatus;
  currentRiskScore: number;
  currentRiskLevel: 'SAFE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  lastCheckIn: string;
  checkInIntervalMins: number;
  nextCheckInDue: string;
  routeDeviationDetected: boolean;
  createdAt?: string;
}
