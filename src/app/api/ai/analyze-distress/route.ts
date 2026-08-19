import { NextRequest, NextResponse } from "next/server";
import { analyzeDistressWithGemini } from "@/lib/ai/risk-engine";
import { z } from "zod";

const DistressSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  locationContext: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    destination: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = DistressSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid distress payload", details: validated.error.format() },
        { status: 400 }
      );
    }

    const analysis = await analyzeDistressWithGemini(
      validated.data.message,
      validated.data.locationContext
    );

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Analyze distress API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze distress signal", message: String(error) },
      { status: 500 }
    );
  }
}
