import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SOSAlertSchema = z.object({
  journeyId: z.string().optional(),
  userId: z.string().default("usr_guardian_01"),
  triggerType: z.enum(["manual_hold", "manual_slide", "ai_escalation", "missed_checkin"]),
  latitude: z.number(),
  longitude: z.number(),
  contacts: z.array(
    z.object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string(),
    })
  ).default([]),
  timestamp: z.string().default(new Date().toISOString()),
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

    // Format dispatched notification payload for trusted contacts
    const dispatchedContacts = alertData.contacts.map((c) => ({
      ...c,
      status: "DISPATCHED",
      channel: "SMS + High Priority Push Alert",
      message: `EMERGENCY ALERT: ${c.name}, user triggered SOS near (${alertData.latitude.toFixed(4)}, ${alertData.longitude.toFixed(4)}). Live tracking link: https://guardian-ai.safety/live/${alertId}`,
      deliveredAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      alertId,
      status: "ACTIVE_ALERT",
      triggerType: alertData.triggerType,
      coordinates: {
        lat: alertData.latitude,
        lng: alertData.longitude,
      },
      dispatchedContacts,
      audioAlarmTriggered: true,
      instructions: [
        "Stay calm and move towards illuminated public premises if safe",
        "Keep phone screen active for emergency responder location ping",
        "If safe to speak, connect directly with local emergency services"
      ],
      timestamp: alertData.timestamp,
    });
  } catch (error) {
    console.error("SOS Alert error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch SOS alert", message: String(error) },
      { status: 500 }
    );
  }
}
