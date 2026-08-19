"use client";

import { useGuardian } from "@/lib/store/demo-context";

export function useSafetyRisk() {
  const {
    riskAssessment,
    isEvaluatingRisk,
    evaluateRisk,
    communityReports,
  } = useGuardian();

  return {
    riskScore: riskAssessment.riskScore,
    riskLevel: riskAssessment.riskLevel,
    confidence: riskAssessment.confidence,
    signals: riskAssessment.signals,
    reasoning: riskAssessment.reasoning,
    recommendedAction: riskAssessment.recommendedAction,
    escalationLevel: riskAssessment.escalationLevel,
    isEvaluating: isEvaluatingRisk,
    reEvaluate: evaluateRisk,
    communityReports,
  };
}
