import { NextRequest, NextResponse } from "next/server";
import { classifyCommunityReportWithAI } from "@/lib/ai/gemini";
import { z } from "zod";

const ReportSchema = z.object({
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  approximateLocationName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ReportSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid report payload", details: validated.error.format() },
        { status: 400 }
      );
    }

    const aiResult = await classifyCommunityReportWithAI(
      validated.data.description,
      validated.data.category
    );

    return NextResponse.json({
      success: true,
      classification: aiResult,
    });
  } catch (error) {
    console.error("Report Classifier API error:", error);
    return NextResponse.json(
      { error: "Failed to classify report", message: String(error) },
      { status: 500 }
    );
  }
}
