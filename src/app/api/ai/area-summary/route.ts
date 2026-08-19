import { NextRequest, NextResponse } from "next/server";
import { generateAreaSummaryWithGemini } from "@/lib/ai/risk-engine";
import { INITIAL_COMMUNITY_REPORTS } from "@/lib/store/mock-data";
import { z } from "zod";

const AreaSummarySchema = z.object({
  areaName: z.string().min(2, "Area name is required"),
  reports: z.array(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = AreaSummarySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid area payload", details: validated.error.format() },
        { status: 400 }
      );
    }

    const reports = validated.data.reports || INITIAL_COMMUNITY_REPORTS;
    const summary = await generateAreaSummaryWithGemini(validated.data.areaName, reports);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Area summary API error:", error);
    return NextResponse.json(
      { error: "Failed to generate area summary", message: String(error) },
      { status: 500 }
    );
  }
}
