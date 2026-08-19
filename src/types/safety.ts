export type RiskLevel = 'SAFE' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type EscalationLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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

export interface SOSAlert {
  id: string;
  sessionId?: string;
  userId: string;
  triggerType: 'manual_hold' | 'manual_slide' | 'ai_escalation' | 'missed_checkin' | 'distress_ai_prompt' | 'demo_sos_click';
  latitude: number;
  longitude: number;
  status: 'active' | 'resolved' | 'false_alarm';
  triggeredAt: string;
  resolvedAt?: string;
}
