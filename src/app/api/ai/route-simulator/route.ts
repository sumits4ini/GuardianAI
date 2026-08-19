import { NextRequest, NextResponse } from "next/server";
import { RouteComparisonResult, RouteOption } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
  try {
    const { origin, destination } = await req.json();

    const originLat = origin?.coords?.lat || 37.7749;
    const originLng = origin?.coords?.lng || -122.4194;
    const destLat = destination?.coords?.lat || 37.7792;
    const destLng = destination?.coords?.lng || -122.4158;

    // Route A: Fastest Standard Shortcut (Direct, but cuts through unlit alleys and past recent incident cluster)
    const routeA: RouteOption = {
      id: "route_fastest",
      name: "Shortest Transit Line (Industrial Alley Detour)",
      description: "Direct line cutting through 4th St underpass and rear service lane.",
      distanceKm: 1.4,
      durationMins: 14,
      lightingLevel: "poor",
      crowdLevel: "low",
      riskScore: 72,
      riskLevel: "HIGH",
      reportedIncidentsCount: 3,
      coordinates: [
        [originLat, originLng],
        [originLat + 0.0015, originLng + 0.0018],
        [originLat + 0.0035, originLng + 0.0028],
        [destLat, destLng]
      ]
    };

    // Route B: GuardianAI Recommended Safety Corridor (Main illuminated avenue, high foot traffic, campus patrol beat)
    const routeB: RouteOption = {
      id: "route_safety_corridor",
      name: "Guardian Safe Corridor (Grand Avenue & Quad Walk)",
      description: "Well-lit commercial boulevard with continuous pedestrian density, streetlamps, and active shopfronts.",
      distanceKm: 1.8,
      durationMins: 19,
      lightingLevel: "well-lit",
      crowdLevel: "high",
      riskScore: 18,
      riskLevel: "SAFE",
      reportedIncidentsCount: 0,
      coordinates: [
        [originLat, originLng],
        [originLat + 0.0008, originLng - 0.0015],
        [originLat + 0.0028, originLng - 0.0012],
        [destLat + 0.0004, destLng - 0.0008],
        [destLat, destLng]
      ]
    };

    let aiReasoning = "Route B adds approximately 5 minutes of travel time but reduces predictive safety risk by 75% due to continuous street lighting, commercial storefront surveillance, and zero active incident reports.";
    let safetyTip = "Traveling 5 minutes longer on well-lit avenues significantly reduces exposure to isolated choke points.";

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Compare these two travel routes for a solo pedestrian at evening:
Route A (14 mins, 1.4km, passes through unlit alley and 3 recent harassment reports, Risk Score 72).
Route B (19 mins, 1.8km, well-lit main avenue, active stores, zero incidents, Risk Score 18).

Provide a 2-sentence comparative AI reasoning and 1 actionable safety tip in JSON format:
{
  "reasoning": string,
  "safetyTip": string
}`;
        const res = await model.generateContent(prompt);
        const clean = res.response.text().trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
        const parsed = JSON.parse(clean);
        if (parsed.reasoning) aiReasoning = parsed.reasoning;
        if (parsed.safetyTip) safetyTip = parsed.safetyTip;
      } catch (err) {
        console.warn("Route comparison AI fallback:", err);
      }
    }

    const result: RouteComparisonResult = {
      recommendedRouteId: "route_safety_corridor",
      reasoning: aiReasoning,
      routes: [routeB, routeA],
      safetyTip,
    };

    return NextResponse.json({
      success: true,
      comparison: result,
    });
  } catch (error) {
    console.error("Route simulator API error:", error);
    return NextResponse.json(
      { error: "Failed to simulate routes", message: String(error) },
      { status: 500 }
    );
  }
}
