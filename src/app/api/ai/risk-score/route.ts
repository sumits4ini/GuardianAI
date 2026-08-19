import { NextRequest, NextResponse } from "next/server";
import { evaluateRiskWithGemini, StructuredSafetyContext } from "@/lib/ai/risk-engine";
import { z } from "zod";

const RiskScoreRequestSchema = z.object({
  journeyStatus: z.string().optional(),
  checkInStatus: z.enum(["RECENT", "PENDING", "OVERDUE"]).optional(),
  arrivalStatus: z.enum(["ON_TIME", "OVERDUE"]).optional(),
  routeDeviationDetected: z.boolean().default(false),
  nearbyRisk: z.number().optional(),
  recentReportsCount: z.number().optional(),
  nearbyReports: z.array(z.any()).default([]),
  travelHour: z.number().optional(),
  userNotes: z.string().optional(),
  sosActive: z.boolean().default(false),
  // Backward compatibility fields
  originCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  destinationCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  startTime: z.string().optional(),
  expectedArrival: z.string().optional(),
  lastCheckInTime: z.string().optional(),
  checkInIntervalMins: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RiskScoreRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid risk context payload", details: validated.error.format() },
        { status: 400 }
      );
    }

    const data = validated.data;
    const now = new Date();

    // Determine arrival status if not directly provided
    let arrivalStatus = data.arrivalStatus;
    if (!arrivalStatus && data.expectedArrival) {
      arrivalStatus = now.getTime() > new Date(data.expectedArrival).getTime() ? "OVERDUE" : "ON_TIME";
    }

    // Determine check-in status if not directly provided
    let checkInStatus = data.checkInStatus;
    if (!checkInStatus && data.lastCheckInTime && data.checkInIntervalMins) {
      const elapsedMins = (now.getTime() - new Date(data.lastCheckInTime).getTime()) / 60000;
      if (elapsedMins > data.checkInIntervalMins + 5) {
        checkInStatus = "OVERDUE";
      } else if (elapsedMins <= 5) {
        checkInStatus = "RECENT";
      } else {
        checkInStatus = "PENDING";
      }
    }

    const context: StructuredSafetyContext = {
      journeyStatus: data.journeyStatus || "ACTIVE",
      checkInStatus: checkInStatus || "PENDING",
      arrivalStatus: arrivalStatus || "ON_TIME",
      routeDeviationDetected: data.routeDeviationDetected,
      nearbyRisk: data.nearbyRisk,
      recentReportsCount: data.recentReportsCount || data.nearbyReports.length,
      nearbyReports: data.nearbyReports.map((r: any) => ({
        category: r.category || "hazard",
        severity: r.severity || "MODERATE",
        approximateLocationName: r.approximateLocationName,
      })),
      travelHour: data.travelHour !== undefined ? data.travelHour : now.getHours(),
      userNotes: data.userNotes,
      sosActive: data.sosActive,
    };

    const assessment = await evaluateRiskWithGemini(context);

    return NextResponse.json({
      success: true,
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel,
      confidence: assessment.confidence,
      signals: assessment.signals,
      reasoning: assessment.reasoning,
      recommendedAction: assessment.recommendedAction,
      aiAvailable: assessment.aiAvailable,
      notice: assessment.notice,
      assessment,
    });
  } catch (error) {
    console.error("Risk score API error:", error);
    return NextResponse.json(
      { error: "Failed to compute risk score", message: String(error) },
      { status: 500 }
    );
  }
}
