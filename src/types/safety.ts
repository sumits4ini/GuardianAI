export type RiskLevel = 'SAFE' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type EscalationLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type OverallSafetyState =
  | 'SAFE'
  | 'JOURNEY_ACTIVE'
  | 'CHECK_IN_OVERDUE'
  | 'ATTENTION_REQUIRED'
  | 'SOS_ACTIVE';

export interface RiskSignal {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  weight?: number;
}

export interface RiskAssessment {
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidence: number; // 0.0 - 1.0
  signals: string[];
  detailedSignals?: RiskSignal[];
  reasoning: string;
  recommendedAction: string;
  escalationLevel: EscalationLevel;
  evaluatedAt: string;
}

export type SOSStatus = 'ACTIVE' | 'RESOLVED' | 'CANCELLED' | 'active' | 'resolved' | 'false_alarm';

export interface SOSAlert {
  id: string;
  userId: string;
  user_id?: string;
  journeyId?: string;
  journey_id?: string;
  sessionId?: string;
  triggerType: 'manual_hold' | 'manual_slide' | 'ai_escalation' | 'missed_checkin' | 'distress_ai_prompt' | 'demo_sos_click';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  status: SOSStatus;
  triggeredAt: string;
  triggered_at?: string;
  resolvedAt?: string;
  resolved_at?: string;
  createdAt: string;
  created_at?: string;
  notificationStatus?: 'DEMO' | 'SENT' | 'FAILED';
  locationUnavailable?: boolean;
}
