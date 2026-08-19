import { NextRequest, NextResponse } from "next/server";
import { CreateReportSchema } from "@/lib/validations/report";
import { classifyCommunityReportWithAI } from "@/lib/ai/gemini";
import { INITIAL_COMMUNITY_REPORTS } from "@/lib/store/mock-data";
import { CommunityReport } from "@/types";
import { anonymizeCommunityReports, anonymizeCommunityReport } from "@/lib/safety/privacy-anonymizer";
import { detectSafetyHotspots } from "@/lib/safety/hotspot-detector";
import { calculateEmergingRiskTrend } from "@/lib/safety/trend-analyzer";

let reportsStore: CommunityReport[] = [...INITIAL_COMMUNITY_REPORTS];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");
    const timeWindow = searchParams.get("timeWindow"); // '24h', '7d', 'all'

    let filtered = [...reportsStore];

    // 1. Filter by category
    if (category && category !== "all") {
      filtered = filtered.filter((r) => r.category.toLowerCase() === category.toLowerCase());
    }

    // 2. Filter by severity
    if (severity && severity !== "all") {
      filtered = filtered.filter((r) => r.severity?.toUpperCase() === severity.toUpperCase());
    }

    // 3. Filter by time window
    if (timeWindow && timeWindow !== "all") {
      const now = Date.now();
      const cutoffHours = timeWindow === "24h" ? 24 : timeWindow === "7d" ? 168 : 0;
      if (cutoffHours > 0) {
        const cutoffMs = now - cutoffHours * 60 * 60 * 1000;
        filtered = filtered.filter((r) => new Date(r.createdAt).getTime() >= cutoffMs);
      }
    }

    // Privacy-preserving anonymization (Strips user IDs, emails, phone numbers)
    const anonymousReports = anonymizeCommunityReports(filtered);

    // Compute spatial hotspots and emerging risk trends
    const hotspots = detectSafetyHotspots(filtered);
    const riskTrend = calculateEmergingRiskTrend(filtered);

    return NextResponse.json({
      success: true,
      count: anonymousReports.length,
      reports: anonymousReports,
      hotspots,
      riskTrend,
    });
  } catch (error) {
    console.error("GET reports API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch community reports", message: String(error) },
      { status: 500 }
    );
  }
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

    // Return strictly anonymized report to client
    const anonymousReport = anonymizeCommunityReport(newReport);

    return NextResponse.json({
      success: true,
      report: anonymousReport,
    });
  } catch (error) {
    console.error("Create report API error:", error);
    return NextResponse.json(
      { error: "Failed to create community report", message: String(error) },
      { status: 500 }
    );
  }
}
