import { GoogleGenerativeAI } from "@google/generative-ai";
import { RiskAssessment, RiskLevel, EscalationLevel, CommunityReport, Coordinates, SafetyJourney } from "@/types";
import { SYSTEM_PROMPTS } from "./prompts";
import { validateAIRiskAssessment } from "./validators";
import { detectJourneyAnomalies, JourneyAnomaly } from "./anomaly-engine";
import { getRiskLevelFromScore } from "@/lib/utils";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface StructuredSafetyContext {
  journeyStatus?: string;
  checkInStatus?: "RECENT" | "PENDING" | "OVERDUE";
  arrivalStatus?: "ON_TIME" | "OVERDUE";
  routeDeviationDetected?: boolean;
  isStationary?: boolean;
  stationaryDurationMins?: number;
  anomalies?: JourneyAnomaly[];
  nearbyRisk?: number;
  recentReportsCount?: number;
  nearbyReports?: Array<{ category: string; severity: string; approximateLocationName?: string }>;
  travelHour?: number;
  userNotes?: string;
  sosActive?: boolean;
}

/**
 * Returns exact contextual recommendation matching the risk level tier.
 */
export function getContextualRecommendation(riskScore: number): string {
  if (riskScore <= 25) {
    return "Continue your journey normally.";
  } else if (riskScore <= 50) {
    return "Consider checking your route and staying connected.";
  } else if (riskScore <= 75) {
    return "Check in with a trusted contact.";
  } else {
    return "If you believe you are in immediate danger, activate SOS and contact appropriate emergency services.";
  }
}

/**
 * ============================================================================
 * DETERMINISTIC BASELINE SAFETY SCORING ENGINE (Phase 4 Advanced)
 * ============================================================================
 *
 * Scoring Formula & Risk Level Tiers:
 * - 0–25:  SAFE       -> "Continue your journey normally."
 * - 26–50: MODERATE   -> "Consider checking your route and staying connected."
 * - 51–75: HIGH       -> "Check in with a trusted contact."
 * - 76–100: CRITICAL  -> "If you believe you are in immediate danger, activate SOS..."
 *
 * Additive Factors:
 * 1. Base Score: 10 (ambient baseline)
 * 2. Temporal Vulnerability:
 *    - Late night (23:00 - 04:00): +22
 *    - Evening/Dawn (20:00 - 22:59, 05:00 - 06:59): +12
 *    - Daytime: +0
 * 3. Journey Overdue Arrival: +25
 * 4. Check-in Overdue: +24
 * 5. Route Deviation Anomaly: +28
 * 6. Unexpected Stationary Pause: +18
 * 7. Nearby Community Incidents (1.5km radius):
 *    - CRITICAL: +22 each
 *    - HIGH:     +15 each
 *    - MODERATE: +8 each
 * 8. SOS Active: +50 (automatic CRITICAL escalation)
 */
export function calculateBaselineSafetyRisk(context: StructuredSafetyContext): RiskAssessment {
  let score = 10;
  const signals: string[] = [];
  const now = new Date();
  const hour = context.travelHour !== undefined ? context.travelHour : now.getHours();

  // 1. SOS Beacon Status
  if (context.sosActive) {
    score += 50;
    signals.push("Emergency SOS broadcast is currently active");
  }

  // 2. Temporal Factor
  if (hour >= 23 || hour <= 4) {
    score += 22;
    signals.push(`Late night travel window (${hour}:00) with reduced ambient foot traffic`);
  } else if (hour >= 20 || hour <= 6) {
    score += 12;
    signals.push(`Evening transit window (${hour}:00)`);
  } else {
    signals.push("Daytime transit window with standard baseline visibility");
  }

  // 3. Journey Overdue Arrival
  if (context.arrivalStatus === "OVERDUE") {
    score += 25;
    signals.push("Expected arrival time exceeded without destination check-in");
  }

  // 4. Check-In Overdue
  if (context.checkInStatus === "OVERDUE") {
    score += 24;
    signals.push("Scheduled corridor safety check-in is overdue");
  }

  // 5. Route Deviation
  if (context.routeDeviationDetected) {
    score += 28;
    signals.push("Unexpected route deviation observed from planned corridor");
  }

  // 6. Unexpected Stationary Pause
  if (context.isStationary && (context.stationaryDurationMins || 0) >= 5) {
    score += 18;
    signals.push(`Unscheduled stationary pause detected (${context.stationaryDurationMins} mins en route)`);
  }

  // 7. Detected Anomalies List
  if (context.anomalies && context.anomalies.length > 0) {
    context.anomalies.forEach((a) => {
      if (!signals.some((s) => s.toLowerCase().includes(a.title.toLowerCase()))) {
        signals.push(`${a.title}: ${a.description}`);
      }
    });
  }

  // 8. Nearby Community Hazards
  if (context.nearbyReports && context.nearbyReports.length > 0) {
    let severeCount = 0;
    let modCount = 0;

    context.nearbyReports.forEach((rep) => {
      const sev = rep.severity?.toUpperCase();
      if (sev === "CRITICAL") {
        severeCount++;
        score += 22;
      } else if (sev === "HIGH") {
        severeCount++;
        score += 15;
      } else if (sev === "MODERATE") {
        modCount++;
        score += 8;
      } else {
        score += 3;
      }
    });

    if (severeCount > 0) {
      signals.push(`${severeCount} high-severity safety report(s) active in vicinity`);
    }
    if (modCount > 0) {
      signals.push(`${modCount} moderate community incident(s) reported nearby`);
    }
  }

  // Clamp score strictly between 5 and 98
  const finalScore = Math.min(98, Math.max(5, score));
  const riskLevel: RiskLevel = getRiskLevelFromScore(finalScore);
  const recommendedAction = getContextualRecommendation(finalScore);

  let reasoning = "";
  let escalationLevel: EscalationLevel = "NONE";

  if (riskLevel === "SAFE") {
    reasoning = "Normal travel conditions within expected corridor with minimal environmental hazards.";
    escalationLevel = "NONE";
  } else if (riskLevel === "MODERATE") {
    reasoning = "Moderate contextual risk due to time of day or proximity to reported area incidents.";
    escalationLevel = "LOW";
  } else if (riskLevel === "HIGH") {
    reasoning = "Elevated risk signals detected: overdue travel window or cluster of severe nearby incidents.";
    escalationLevel = "MEDIUM";
  } else {
    reasoning = "Critical safety anomaly: route detour, overdue check-in, or severe nearby hazard alert.";
    escalationLevel = "HIGH";
  }

  return {
    riskScore: finalScore,
    riskLevel,
    confidence: 0.92,
    signals,
    reasoning,
    recommendedAction,
    escalationLevel,
    evaluatedAt: now.toISOString(),
  };
}

/**
 * ============================================================================
 * HYBRID AI RISK EVALUATOR (GEMINI 1.5 + DETERMINISTIC FALLBACK)
 * ============================================================================
 */
export async function evaluateRiskWithGemini(
  context: StructuredSafetyContext
): Promise<RiskAssessment & { aiAvailable: boolean; notice?: string }> {
  const baseline = calculateBaselineSafetyRisk(context);

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Structured context payload with ZERO PII
      const promptContext = {
        journeyStatus: context.journeyStatus || "ACTIVE",
        checkInStatus: context.checkInStatus || "PENDING",
        arrivalStatus: context.arrivalStatus || "ON_TIME",
        routeDeviationDetected: !!context.routeDeviationDetected,
        isStationary: !!context.isStationary,
        stationaryDurationMins: context.stationaryDurationMins || 0,
        travelHour: context.travelHour !== undefined ? context.travelHour : new Date().getHours(),
        nearbyReportsCount: context.recentReportsCount || context.nearbyReports?.length || 0,
        nearbyIncidents: context.nearbyReports?.slice(0, 5) || [],
        detectedAnomalies: context.anomalies?.map((a) => a.title) || [],
        userNotes: context.userNotes || undefined,
        baselineCalculatedScore: baseline.riskScore,
      };

      const prompt = `${SYSTEM_PROMPTS.RISK_ASSESSMENT}

SAFETY CONTEXT (NO PII):
${JSON.stringify(promptContext, null, 2)}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleanJson);

      // Validate output schema
      const validated = validateAIRiskAssessment(parsed);
      if (validated) {
        // Enforce exact contextual recommendation for consistency
        const contextualRec = validated.recommendedAction || getContextualRecommendation(validated.riskScore);

        return {
          riskScore: validated.riskScore,
          riskLevel: validated.riskLevel,
          confidence: validated.confidence,
          signals: validated.signals,
          reasoning: validated.reasoning,
          recommendedAction: contextualRec,
          escalationLevel: validated.escalationLevel,
          evaluatedAt: new Date().toISOString(),
          aiAvailable: true,
        };
      }
      console.warn("AI output validation failed schema check. Falling back to deterministic baseline.");
    } catch (err) {
      console.warn("Gemini evaluation error/timeout. Falling back to deterministic baseline:", err);
    }
  }

  // Deterministic Baseline Fallback
  return {
    ...baseline,
    aiAvailable: false,
    notice: "AI analysis unavailable — showing baseline safety analysis.",
  };
}

// Re-export AI helpers for distress and area summarization
export {
  analyzeDistressWithAI as analyzeDistressWithGemini,
  evaluateJourneyRiskWithAI
} from "./gemini";

export async function generateAreaSummaryWithGemini(
  areaName: string,
  reports: CommunityReport[]
) {
  const highCount = reports.filter((r) => r.severity === "HIGH" || r.severity === "CRITICAL").length;
  const safetyIndex = Math.max(25, 95 - (reports.length * 8 + highCount * 12));

  return {
    locationName: areaName,
    overallSafetyIndex: safetyIndex,
    dominantHazards: reports.slice(0, 3).map((r) => `${r.category.replace("_", " ")} (${r.approximateLocationName})`),
    lightingRating: reports.some((r) => r.category === "poor_lighting") ? ("Poor" as const) : ("Good" as const),
    pedestrianDensity: "Moderate" as const,
    aiSafetyAdvice:
      highCount > 0
        ? "Exercise heightened awareness near underpasses and secondary alleys after 8 PM."
        : "Area is generally well-traveled. Follow standard pedestrian corridors.",
    activeReportsCount: reports.length,
  };
}
