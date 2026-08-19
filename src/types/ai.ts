import { RiskLevel, EscalationLevel } from "./safety";
import { ReportCategory, ReportSeverity } from "./report";
import { Coordinates } from "./journey";

export interface DistressAnalysisResult {
  riskLevel: RiskLevel;
  urgency: 'LOW' | 'MODERATE' | 'HIGH' | 'IMMEDIATE';
  signals: string[];
  recommendedActions: string[];
  safeAdvice: string;
  shouldTriggerSOSPrompt: boolean;
  nearestActionGuide?: string;
}

export interface DistressChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  message: string;
  timestamp: string;
  analysis?: DistressAnalysisResult;
}

export interface AreaSummaryResult {
  locationName: string;
  overallSafetyIndex: number; // 0 - 100
  dominantHazards: string[];
  lightingRating: 'Good' | 'Moderate' | 'Poor';
  pedestrianDensity: 'High' | 'Moderate' | 'Low';
  aiSafetyAdvice: string;
  activeReportsCount: number;
}

export interface RouteOption {
  id: string;
  name: string;
  description: string;
  distanceKm: number;
  durationMins: number;
  lightingLevel: 'well-lit' | 'moderate' | 'poor';
  crowdLevel: 'high' | 'moderate' | 'low';
  riskScore: number;
  riskLevel: RiskLevel;
  reportedIncidentsCount: number;
  coordinates: [number, number][];
}

export interface RouteComparisonResult {
  recommendedRouteId: string;
  reasoning: string;
  routes: RouteOption[];
  safetyTip: string;
}
