import { z } from "zod";
import { RiskLevel, EscalationLevel } from "@/types";

export const AIRiskAssessmentSchema = z.object({
  riskScore: z.number().int().min(0).max(100),
  riskLevel: z.enum(["SAFE", "MODERATE", "HIGH", "CRITICAL"]),
  confidence: z.number().min(0.0).max(1.0),
  signals: z.array(z.string()).min(1),
  reasoning: z.string().min(5),
  recommendedAction: z.string().min(5),
  escalationLevel: z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("NONE"),
  aiAvailable: z.boolean().default(true),
});

export type AIRiskAssessmentData = z.infer<typeof AIRiskAssessmentSchema>;

export const SafetySignalSchema = z.object({
  type: z.enum([
    "JOURNEY_ACTIVE",
    "CHECK_IN_RECENT",
    "CHECK_IN_OVERDUE",
    "ARRIVAL_OVERDUE",
    "NEARBY_REPORT",
    "HIGH_SEVERITY_REPORT",
    "SOS_ACTIVE",
    "ROUTE_DEVIATION",
    "STATIONARY_DELAY",
  ]),
  severity: z.enum(["INFO", "LOW", "MODERATE", "HIGH", "CRITICAL"]),
  description: z.string(),
  timestamp: z.string(),
});

export type SafetySignalData = z.infer<typeof SafetySignalSchema>;

export const DistressAnalysisSchema = z.object({
  riskLevel: z.enum(["SAFE", "MODERATE", "HIGH", "CRITICAL"]),
  urgency: z.enum(["LOW", "MODERATE", "HIGH", "IMMEDIATE"]),
  signals: z.array(z.string()),
  recommendedActions: z.array(z.string()),
  safeAdvice: z.string(),
  shouldTriggerSOSPrompt: z.boolean(),
  nearestActionGuide: z.string().optional(),
});

export const AreaSummarySchema = z.object({
  locationName: z.string(),
  overallSafetyIndex: z.number().min(0).max(100),
  dominantHazards: z.array(z.string()),
  lightingRating: z.enum(["Good", "Moderate", "Poor"]),
  pedestrianDensity: z.enum(["High", "Moderate", "Low"]),
  aiSafetyAdvice: z.string(),
  activeReportsCount: z.number().int().min(0),
});

/**
 * Validates arbitrary AI response against AIRiskAssessmentSchema.
 * Returns parsed object or null if invalid.
 */
export function validateAIRiskAssessment(raw: unknown): AIRiskAssessmentData | null {
  if (!raw || typeof raw !== "object") return null;
  const result = AIRiskAssessmentSchema.safeParse(raw);
  if (!result.success) {
    console.warn("AI Risk Assessment validation failed:", result.error.format());
    return null;
  }
  return result.data;
}

/**
 * Validates Distress Analysis output from AI.
 */
export function validateDistressAnalysis(raw: unknown) {
  if (!raw || typeof raw !== "object") return null;
  const result = DistressAnalysisSchema.safeParse(raw);
  if (!result.success) {
    console.warn("AI Distress Analysis validation failed:", result.error.format());
    return null;
  }
  return result.data;
}
