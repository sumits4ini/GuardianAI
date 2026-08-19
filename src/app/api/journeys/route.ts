import { NextRequest, NextResponse } from "next/server";
import { CreateJourneySchema } from "@/lib/validations/journey";
import { SafetyJourney, JourneyStatus } from "@/types";

// In-memory store for fast evaluation & fallback
let journeysStore: SafetyJourney[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let filtered = journeysStore;
  if (status) {
    filtered = journeysStore.filter(
      (j) => j.status.toUpperCase() === status.toUpperCase()
    );
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    journeys: filtered,
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

    const {
      originName,
      originCoords,
      destinationName,
      destinationCoords,
      expectedDurationMins,
      checkInIntervalMins,
    } = validated.data;

    const now = new Date();
    const expectedArrival = new Date(now.getTime() + expectedDurationMins * 60000).toISOString();
    const nextCheckInDue = new Date(now.getTime() + checkInIntervalMins * 60000).toISOString();
    const journeyId = `jrn_${Date.now()}`;

    const newJourney: SafetyJourney = {
      id: journeyId,
      userId: body.userId || "usr_guardian_01",
      user_id: body.userId || "usr_guardian_01",
      startLocation: originName,
      start_location: originName,
      originName,
      originCoords,
      destination: destinationName,
      destinationName,
      destinationLatitude: destinationCoords.lat,
      destination_latitude: destinationCoords.lat,
      destinationLongitude: destinationCoords.lng,
      destination_longitude: destinationCoords.lng,
      destinationCoords,
      currentCoords: originCoords,
      startedAt: now.toISOString(),
      started_at: now.toISOString(),
      startTime: now.toISOString(),
      expectedArrival,
      expected_arrival: expectedArrival,
      status: "ACTIVE",
      currentRiskScore: 12,
      currentRiskLevel: "SAFE",
      lastCheckIn: now.toISOString(),
      last_check_in: now.toISOString(),
      checkInIntervalMins,
      nextCheckInDue,
      routeDeviationDetected: false,
      createdAt: now.toISOString(),
      created_at: now.toISOString(),
      updatedAt: now.toISOString(),
      updated_at: now.toISOString(),
    };

    journeysStore = [newJourney, ...journeysStore];

    return NextResponse.json({
      success: true,
      journey: newJourney,
    });
  } catch (error) {
    console.error("Create journey API error:", error);
    return NextResponse.json(
      { error: "Failed to create safety journey", message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { journeyId, status, additionalMinutes } = body;

    if (!journeyId) {
      return NextResponse.json({ error: "Missing journeyId" }, { status: 400 });
    }

    const now = new Date();
    let updated: SafetyJourney;
    const idx = journeysStore.findIndex((j) => j.id === journeyId);

    if (idx === -1) {
      updated = {
        id: journeyId,
        userId: "usr_guardian_01",
        startLocation: "Starting Location",
        destination: "Destination",
        originName: "Starting Location",
        originCoords: { lat: 37.7718, lng: -122.4225 },
        destinationName: "Destination",
        destinationCoords: { lat: 37.7792, lng: -122.4158 },
        destinationLatitude: 37.7792,
        destinationLongitude: -122.4158,
        startedAt: new Date(Date.now() - 20 * 60000).toISOString(),
        startTime: new Date(Date.now() - 20 * 60000).toISOString(),
        expectedArrival: now.toISOString(),
        status: (status as JourneyStatus) || "COMPLETED",
        completedAt: now.toISOString(),
        completed_at: now.toISOString(),
        lastCheckIn: now.toISOString(),
        currentRiskScore: 10,
        currentRiskLevel: "SAFE",
        checkInIntervalMins: 10,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      journeysStore.push(updated);
    } else {
      const current = journeysStore[idx];
      let newExpected = current.expectedArrival;
      if (additionalMinutes) {
        newExpected = new Date(new Date(current.expectedArrival).getTime() + additionalMinutes * 60000).toISOString();
      }

      updated = {
        ...current,
        status: (status as JourneyStatus) || current.status,
        expectedArrival: newExpected,
        expected_arrival: newExpected,
        completedAt: status === "COMPLETED" ? now.toISOString() : current.completedAt,
        completed_at: status === "COMPLETED" ? now.toISOString() : current.completed_at,
        updatedAt: now.toISOString(),
        updated_at: now.toISOString(),
      };
      journeysStore[idx] = updated;
    }

    return NextResponse.json({
      success: true,
      journey: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update journey status", message: "Internal server error" },
      { status: 500 }
    );
  }
}
