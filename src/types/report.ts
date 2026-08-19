import { RiskLevel } from "./safety";

export type ReportCategory = 
  | 'harassment'
  | 'suspicious_activity'
  | 'poor_lighting'
  | 'unsafe_road'
  | 'accident'
  | 'theft'
  | 'isolated_area'
  | 'other';

export type ReportSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface AIClassification {
  category: ReportCategory;
  severity: ReportSeverity;
  riskScoreContribution: number;
  reasoning: string;
  confidence?: number;
}

export interface CommunityReport {
  id: string;
  userId?: string;
  category: ReportCategory;
  description: string;
  latitude: number;
  longitude: number;
  approximateLocationName: string;
  severity: ReportSeverity;
  aiClassification?: AIClassification;
  aiConfidence?: number;
  status: 'active' | 'verified' | 'resolved';
  createdAt: string;
  verifiedCount?: number;
}
