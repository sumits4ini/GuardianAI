export type JourneyStatus =
  | 'ACTIVE'
  | 'COMPLETED'
  | 'ATTENTION_REQUIRED'
  | 'CANCELLED'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'alert';

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
  userId: string;
  journeyId: string;
  sessionId?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  isDeviation?: boolean;
  timestamp: string;
  recordedAt?: string;
}

export interface SafetyJourney {
  id: string;
  userId: string;
  user_id?: string;
  startLocation: string;
  start_location?: string;
  originName: string;
  originCoords: Coordinates;
  destination: string;
  destinationName: string;
  destinationLatitude: number;
  destination_latitude?: number;
  destinationLongitude: number;
  destination_longitude?: number;
  destinationCoords: Coordinates;
  currentCoords?: Coordinates;
  startedAt: string;
  started_at?: string;
  startTime: string;
  expectedArrival: string;
  expected_arrival?: string;
  status: JourneyStatus;
  lastCheckIn: string;
  last_check_in?: string;
  completedAt?: string;
  completed_at?: string;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
  currentRiskScore: number;
  currentRiskLevel: 'SAFE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  checkInIntervalMins: number;
  nextCheckInDue?: string;
  routeDeviationDetected?: boolean;
}
