import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SOSAlertSchema = z.object({
  journeyId: z.string().optional(),
  userId: z.string().default("usr_guardian_01"),
  triggerType: z.string().default("manual_hold"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accuracy: z.number().optional(),
  contacts: z.array(
    z.object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string(),
    })
  ).default([]),
  timestamp: z.string().default(new Date().toISOString()),
  notificationStatus: z.string().default("DEMO"),
  locationUnavailable: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = SOSAlertSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid SOS alert payload", details: validated.error.format() },
        { status: 400 }
      );
    }

    const alertData = validated.data;
    const alertId = `sos_${Date.now()}`;
    const hasLocation = typeof alertData.latitude === "number" && typeof alertData.longitude === "number";

    // Emergency notification architecture (Demo status recorded when real provider not configured)
    const notificationLog = alertData.contacts.map((c) => ({
      ...c,
      status: "DEMO_RECORDED",
      channel: "Emergency Broadcast (Demo Mode)",
      message: hasLocation
        ? `EMERGENCY ALERT: User triggered SOS near (${alertData.latitude?.toFixed(4)}, ${alertData.longitude?.toFixed(4)}). Live Location: https://maps.google.com/?q=${alertData.latitude},${alertData.longitude}`
        : `EMERGENCY ALERT: User triggered SOS (GPS location unavailable).`,
      notificationStatus: "DEMO",
      note: "Emergency notification recorded for demo.",
    }));

    return NextResponse.json({
      success: true,
      alertId,
      status: "ACTIVE",
      triggerType: alertData.triggerType,
      hasLocation,
      locationMessage: hasLocation
        ? "Location coordinates captured."
        : "Location unavailable, but SOS is active.",
      coordinates: hasLocation ? {
        lat: alertData.latitude,
        lng: alertData.longitude,
        accuracy: alertData.accuracy,
      } : null,
      notificationStatus: "DEMO",
      notificationMessage: "Emergency notification recorded for demo.",
      dispatchedContacts: notificationLog,
      instructions: [
        "Stay in or move toward well-lit public areas if safe to do so",
        "Keep your device powered and unlocked",
        "If you are safe, tap 'Mark Safe' below to resolve the alert"
      ],
      timestamp: alertData.timestamp,
    });
  } catch (error) {
    console.error("SOS Alert error:", error);
    return NextResponse.json(
      { error: "Failed to activate emergency SOS", message: "Internal server error" },
      { status: 500 }
    );
  }
}
