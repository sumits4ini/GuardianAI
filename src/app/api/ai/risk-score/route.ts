import { NextRequest, NextResponse } from "next/server";
import { evaluateRiskWithGemini } from "@/lib/ai/risk-engine";
import { z } from "zod";

const RiskScoreRequestSchema = z.object({
  originName: z.string().default("Current Origin"),
  destinationName: z.string().default("Planned Destination"),
  originCoords: z.object({ lat: z.number(), lng: z.number() }),
  destinationCoords: z.object({ lat: z.number(), lng: z.number() }),
  currentCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  startTime: z.string().default(new Date().toISOString()),
  expectedArrival: z.string().default(new Date(Date.now() + 20 * 60000).toISOString()),
  lastCheckInTime: z.string().default(new Date().toISOString()),
  checkInIntervalMins: z.number().default(10),
  routeDeviationDetected: z.boolean().default(false),
  nearbyReports: z.array(z.any()).default([]),
  travelHour: z.number().default(new Date().getHours()),
  userDistressNotes: z.string().optional(),
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

    const assessment = await evaluateRiskWithGemini(validated.data);

    return NextResponse.json({
      success: true,
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
