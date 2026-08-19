import { NextRequest, NextResponse } from "next/server";
import { CreateJourneySchema } from "@/lib/validations/journey";
import { SafetyJourney } from "@/types";

// In-memory persistent store for demo fallback
let journeysStore: SafetyJourney[] = [];

export async function GET() {
  return NextResponse.json({
    success: true,
    journeys: journeysStore,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateJourneySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid journey payload", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { originName, originCoords, destinationName, destinationCoords, expectedDurationMins, checkInIntervalMins } = validated.data;
    const now = new Date();
    const expectedArrival = new Date(now.getTime() + expectedDurationMins * 60000).toISOString();
    const nextCheckInDue = new Date(now.getTime() + checkInIntervalMins * 60000).toISOString();

    const newJourney: SafetyJourney = {
      id: `jrn_${Date.now()}`,
      userId: "usr_guardian_01",
      originName,
      originCoords,
      destinationName,
      destinationCoords,
      currentCoords: originCoords,
      startTime: now.toISOString(),
      expectedArrival,
      status: "active",
      currentRiskScore: 12,
      currentRiskLevel: "SAFE",
      lastCheckIn: now.toISOString(),
      checkInIntervalMins,
      nextCheckInDue,
      routeDeviationDetected: false,
      createdAt: now.toISOString(),
    };

    journeysStore = [newJourney, ...journeysStore];

    return NextResponse.json({
      success: true,
      journey: newJourney,
    });
  } catch (error) {
    console.error("Create journey API error:", error);
    return NextResponse.json(
      { error: "Failed to create safety journey", message: String(error) },
      { status: 500 }
    );
  }
}
