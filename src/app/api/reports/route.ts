import { NextRequest, NextResponse } from "next/server";
import { CreateReportSchema } from "@/lib/validations/report";
import { classifyCommunityReportWithAI } from "@/lib/ai/gemini";
import { INITIAL_COMMUNITY_REPORTS } from "@/lib/store/mock-data";
import { CommunityReport } from "@/types";

let reportsStore: CommunityReport[] = [...INITIAL_COMMUNITY_REPORTS];

export async function GET() {
  return NextResponse.json({
    success: true,
    reports: reportsStore,
  });
}

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

    const { description, category, latitude, longitude, approximateLocationName, severity } = validated.data;
    const aiClassification = await classifyCommunityReportWithAI(description, category);

    const newReport: CommunityReport = {
      id: `rep_${Date.now()}`,
      category,
      description,
      latitude,
      longitude,
      approximateLocationName,
      severity: severity || aiClassification.severity,
      aiClassification,
      aiConfidence: aiClassification.confidence,
      status: "active",
      createdAt: new Date().toISOString(),
      verifiedCount: 1,
    };

    reportsStore = [newReport, ...reportsStore];

    return NextResponse.json({
      success: true,
      report: newReport,
    });
  } catch (error) {
    console.error("Create report API error:", error);
    return NextResponse.json(
      { error: "Failed to create community report", message: String(error) },
      { status: 500 }
    );
  }
}
