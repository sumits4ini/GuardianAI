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
    const nextCheckInDue = new Date(now.getTime() + 10 * 60000).toISOString();

    return NextResponse.json({
      success: true,
      checkIn: {
        journeyId,
        recordedAt: now.toISOString(),
        nextCheckInDue,
        status: "CHECKED_IN_SAFE",
        coordinates: currentCoords,
      },
    });
  } catch (error) {
    console.error("Check-in API error:", error);
    return NextResponse.json(
      { error: "Failed to record check-in", message: String(error) },
      { status: 500 }
    );
  }
}
