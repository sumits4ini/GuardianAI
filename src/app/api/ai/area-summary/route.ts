import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { INITIAL_COMMUNITY_REPORTS } from "@/lib/store/mock-data";
import { CommunityReport } from "@/types";
import { z } from "zod";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const AreaSummarySchema = z.object({
  areaName: z.string().min(2, "Area name is required"),
  reports: z.array(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = AreaSummarySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid area payload", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { areaName } = validated.data;
    const reports: CommunityReport[] = validated.data.reports || INITIAL_COMMUNITY_REPORTS;

    const highSeverityCount = reports.filter((r) => r.severity === "HIGH" || r.severity === "CRITICAL").length;
    const categoryCounts: Record<string, number> = {};
    reports.forEach((r) => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    const dominantHazards = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, count]) => `${cat.replace("_", " ")} (${count} reports)`);

    const baselineSafetyIndex = Math.max(25, Math.min(95, 95 - (reports.length * 6 + highSeverityCount * 14)));

    let lightingRating: "Good" | "Moderate" | "Poor" = reports.some((r) => r.category === "poor_lighting") ? "Poor" : "Good";
    let aiSafetyAdvice =
      highSeverityCount > 0
        ? "Recent reports indicate elevated concern primarily associated with poor lighting and suspicious activity. Stick to illuminated main avenues."
        : "Area is generally well-traveled. Follow standard pedestrian corridors and complete periodic check-ins.";

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `${SYSTEM_PROMPTS.AREA_SUMMARY}

AREA NAME: "${areaName}"
ACTUAL COMMUNITY REPORTS IN THIS AREA (NO PII):
${JSON.stringify(
  reports.slice(0, 8).map((r) => ({
    category: r.category,
    severity: r.severity,
    approximateLocation: r.approximateLocationName,
    time: r.createdAt,
  })),
  null,
  2
)}

Explain the major safety concerns, dominant categories, lighting conditions, and practical recommendations. Return ONLY raw JSON.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleanJson = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
        const parsed = JSON.parse(cleanJson);

        return NextResponse.json({
          success: true,
          summary: {
            locationName: parsed.locationName || areaName,
            overallSafetyIndex: parsed.overallSafetyIndex || baselineSafetyIndex,
            dominantHazards: parsed.dominantHazards || dominantHazards,
            lightingRating: parsed.lightingRating || lightingRating,
            pedestrianDensity: parsed.pedestrianDensity || "Moderate",
            aiSafetyAdvice: parsed.aiSafetyAdvice || aiSafetyAdvice,
            activeReportsCount: reports.length,
          },
          aiAvailable: true,
        });
      } catch (err) {
        console.warn("Gemini area summary fallback:", err);
      }
    }

    // Deterministic Baseline Area Summary Fallback
    return NextResponse.json({
      success: true,
      summary: {
        locationName: areaName,
        overallSafetyIndex: baselineSafetyIndex,
        dominantHazards: dominantHazards.length > 0 ? dominantHazards : ["No dominant hazards reported"],
        lightingRating,
        pedestrianDensity: "Moderate",
        aiSafetyAdvice,
        activeReportsCount: reports.length,
      },
      aiAvailable: false,
      notice: "AI analysis unavailable — showing baseline area summary.",
    });
  } catch (error) {
    console.error("Area summary API error:", error);
    return NextResponse.json(
      { error: "Failed to generate area summary", message: String(error) },
      { status: 500 }
    );
  }
}
