import { NextRequest, NextResponse } from "next/server";
import { CheckInSchema } from "@/lib/validations/journey";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CheckInSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid check-in payload", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { journeyId, currentCoords } = validated.data;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nextCheckInDue = new Date(now.getTime() + 10 * 60000).toISOString();

    const locationEvent = currentCoords ? {
      id: `loc_${Date.now()}`,
      journeyId,
      latitude: currentCoords.lat,
      longitude: currentCoords.lng,
      accuracy: currentCoords.accuracy || 15,
      timestamp: now.toISOString(),
    } : null;

    return NextResponse.json({
      success: true,
      message: `✓ You're checked in (Last check-in: ${formattedTime})`,
      checkIn: {
        journeyId,
        recordedAt: now.toISOString(),
        formattedTime,
        nextCheckInDue,
        status: "CHECKED_IN_SAFE",
        locationEvent,
      },
    });
  } catch (error) {
    console.error("Check-in API error:", error);
    return NextResponse.json(
      { error: "Failed to record check-in", message: "Internal server error" },
      { status: 500 }
    );
  }
}
