import { NextRequest, NextResponse } from "next/server";
import { evaluateJourneyRiskWithAI, JourneyRiskContext } from "@/lib/ai/gemini";
import { z } from "zod";

const RiskAssessmentSchema = z.object({
  originName: z.string(),
  destinationName: z.string(),
  originCoords: z.object({ lat: z.number(), lng: z.number() }),
  destinationCoords: z.object({ lat: z.number(), lng: z.number() }),
  currentCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  startTime: z.string(),
  expectedArrival: z.string(),
  lastCheckInTime: z.string(),
  checkInIntervalMins: z.number().default(10),
  routeDeviationDetected: z.boolean().default(false),
  nearbyReports: z.array(z.any()).default([]),
  travelHour: z.number().default(new Date().getHours()),
  userDistressNotes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RiskAssessmentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid safety context payload", details: validated.error.format() },
        { status: 400 }
      );
    }

    const context: JourneyRiskContext = validated.data;
    const assessment = await evaluateJourneyRiskWithAI(context);

    return NextResponse.json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error("Risk Assessment API error:", error);
    return NextResponse.json(
      { error: "Failed to compute risk assessment", message: String(error) },
      { status: 500 }
    );
  }
}
