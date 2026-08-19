import { GoogleGenerativeAI } from "@google/generative-ai";
import { RiskAssessment, CommunityReport, Coordinates, DistressAnalysisResult, AreaSummaryResult } from "@/types";
import { SYSTEM_PROMPTS } from "./prompts";
import { calculateSafetyRisk, RiskCalculationContext } from "@/lib/safety/risk-calculator";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Server-Side AI Risk Assessment Engine
 * Calls Gemini 1.5/Flash model, falling back to deterministic risk engine if offline/unconfigured
 */
export async function evaluateRiskWithGemini(
  context: RiskCalculationContext & {
    originName: string;
    destinationName: string;
    userDistressNotes?: string;
  }
): Promise<RiskAssessment> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `${SYSTEM_PROMPTS.RISK_ASSESSMENT}

CONTEXT:
- Origin: ${context.originName}
- Destination: ${context.destinationName}
- Time of Day: ${context.travelHour}:00
- Start Time: ${context.startTime}
- Expected Arrival: ${context.expectedArrival}
- Last Check-in: ${context.lastCheckInTime} (Interval: ${context.checkInIntervalMins}m)
- Route Deviation: ${context.routeDeviationDetected ? "YES - Detour detected" : "NO - On track"}
- Nearby Community Reports: ${JSON.stringify(context.nearbyReports.map((r) => ({
  category: r.category,
  severity: r.severity,
  desc: r.description,
  loc: r.approximateLocationName,
})))}
- User Notes: ${context.userDistressNotes || "None"}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleanJson);

      return {
        riskScore: Math.min(100, Math.max(0, Math.round(parsed.riskScore))),
        riskLevel: parsed.riskLevel,
        confidence: parsed.confidence || 0.92,
        signals: Array.isArray(parsed.signals) ? parsed.signals : ["Environmental context analyzed"],
        reasoning: parsed.reasoning,
        recommendedAction: parsed.recommendedAction,
        escalationLevel: parsed.escalationLevel || "NONE",
        evaluatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn("Gemini API evaluation failed, utilizing deterministic safety fallback:", err);
    }
  }

  // Fallback to high-precision deterministic calculation
  return calculateSafetyRisk(context);
}

/**
 * Server-Side AI Distress Reasoning Engine
 */
export async function analyzeDistressWithGemini(
  message: string,
  locationContext?: { latitude?: number; longitude?: number; destination?: string }
): Promise<DistressAnalysisResult> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `${SYSTEM_PROMPTS.DISTRESS_ANALYSIS}

USER DISTRESS MESSAGE: "${message}"
LOCATION CONTEXT: ${JSON.stringify(locationContext || {})}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn("Gemini distress analysis fallback:", err);
    }
  }

  const lower = message.toLowerCase();
  const isHighDanger = /follow|chase|threat|attack|hurt|danger|weapon|grabbed|scared|emergency|help me/i.test(lower);
  const isModerate = /dark|lost|uncomfortable|strange|weird|car broke|stopped|creepy/i.test(lower);

  if (isHighDanger) {
    return {
      riskLevel: "CRITICAL",
      urgency: "IMMEDIATE",
      signals: ["Direct expression of physical threat or pursuit", "Elevated distress urgency"],
      recommendedActions: [
        "Move immediately into the nearest illuminated business, store, or crowded lobby",
        "Trigger one-tap SOS to broadcast live location coordinates to your trusted contacts",
        "If in immediate physical danger, connect directly to local emergency services (112/911)"
      ],
      safeAdvice: "Stay in well-lit areas, keep moving toward active premises, and do not isolate yourself.",
      shouldTriggerSOSPrompt: true,
      nearestActionGuide: "Head toward nearest open commercial storefront or populated transit hub.",
    };
  }

  if (isModerate) {
    return {
      riskLevel: "MODERATE",
      urgency: "MODERATE",
      signals: ["Disorientation or uncomfortable surroundings", "Preventative safety check"],
      recommendedActions: [
        "Confirm your location on the GuardianAI live map",
        "Send a quick check-in to your primary trusted contact",
        "Remain on well-lit main corridors"
      ],
      safeAdvice: "Take a calm assessment of your surroundings. Stay on main lit roads and share your status with your trusted contacts.",
      shouldTriggerSOSPrompt: false,
      nearestActionGuide: "Proceed along main arterial roads with working streetlamps.",
    };
  }

  return {
    riskLevel: "SAFE",
    urgency: "LOW",
    signals: ["Standard safety query"],
    recommendedActions: [
      "Keep journey tracking active until arrival",
      "Ensure your device battery remains charged"
    ],
    safeAdvice: "You are on track. Let us know if you observe any unusual safety conditions along your route.",
    shouldTriggerSOSPrompt: false,
  };
}

/**
 * Server-Side AI Area Safety Intelligence Summary Engine
 */
export async function generateAreaSummaryWithGemini(
  areaName: string,
  reports: CommunityReport[]
): Promise<AreaSummaryResult> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `${SYSTEM_PROMPTS.AREA_SUMMARY}

AREA NAME: ${areaName}
COMMUNITY REPORTS IN AREA: ${JSON.stringify(reports.map(r => ({
  category: r.category,
  severity: r.severity,
  desc: r.description
})))}`;

      const result = await model.generateContent(prompt);
      const cleanJson = result.response.text().trim().replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn("Gemini area summary fallback:", err);
    }
  }

  const highCount = reports.filter(r => r.severity === 'HIGH' || r.severity === 'CRITICAL').length;
  const safetyIndex = Math.max(25, 95 - (reports.length * 8 + highCount * 12));

  return {
    locationName: areaName,
    overallSafetyIndex: safetyIndex,
    dominantHazards: reports.slice(0, 3).map(r => `${r.category.replace('_', ' ')} (${r.approximateLocationName})`),
    lightingRating: reports.some(r => r.category === 'poor_lighting') ? 'Poor' : 'Good',
    pedestrianDensity: 'Moderate',
    aiSafetyAdvice: highCount > 0
      ? "Exercise heightened awareness near underpasses and secondary alleys after 8 PM."
      : "Area is generally well-traveled. Follow standard pedestrian corridors.",
    activeReportsCount: reports.length,
  };
}
