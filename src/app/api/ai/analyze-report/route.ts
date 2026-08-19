import { NextRequest, NextResponse } from "next/server";
import { classifyCommunityReportWithAI } from "@/lib/ai/gemini";
import { CreateReportSchema } from "@/lib/validations/report";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateReportSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid report payload", details: validated.error.format() },
        { status: 400 }
      );
    }

    const classification = await classifyCommunityReportWithAI(
      validated.data.description,
      validated.data.category
    );

    return NextResponse.json({
      success: true,
      classification,
    });
  } catch (error) {
    console.error("Analyze report API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze community report", message: String(error) },
      { status: 500 }
    );
  }
}
