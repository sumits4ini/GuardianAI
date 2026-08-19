import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { alertId, resolutionNotes } = body;
    const now = new Date();

    return NextResponse.json({
      success: true,
      alertId: alertId || `sos_resolved_${Date.now()}`,
      status: "RESOLVED",
      message: "SOS resolved. You're marked safe.",
      resolvedAt: now.toISOString(),
      resolutionNotes: resolutionNotes || "User marked safe manually.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to resolve SOS alert", message: "Internal server error" },
      { status: 500 }
    );
  }
}
