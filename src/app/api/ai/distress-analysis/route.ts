import { NextRequest, NextResponse } from "next/server";
import { analyzeDistressWithAI } from "@/lib/ai/gemini";
import { z } from "zod";

const DistressSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  journeyContext: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = DistressSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid distress message payload" },
        { status: 400 }
      );
    }

    const analysis = await analyzeDistressWithAI(
      validated.data.message,
      validated.data.journeyContext
    );

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Distress Analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze distress signal", message: String(error) },
      { status: 500 }
    );
  }
}
