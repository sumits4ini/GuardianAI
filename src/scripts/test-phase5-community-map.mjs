import { anonymizeCommunityReport, anonymizeCommunityReports } from "../lib/safety/privacy-anonymizer";
import { detectSafetyHotspots } from "../lib/safety/hotspot-detector";
import { calculateEmergingRiskTrend } from "../lib/safety/trend-analyzer";

async function runPhase5CommunityMapTests() {
  console.log("==================================================");
  console.log("🛡️ GUARDIANAI — PHASE 5 COMMUNITY & MAP INTELLIGENCE");
  console.log("==================================================\n");

  let BASE_URL = "http://localhost:3000";
  try {
    const check3000 = await fetch("http://localhost:3000/login");
    if (check3000.status === 200) BASE_URL = "http://localhost:3000";
  } catch {
    BASE_URL = "http://localhost:3001";
  }
  console.log(`Using Dev Server: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Test Privacy & Anonymization Engine
  console.log("--- 1. Testing Privacy Anonymization & PII Stripping ---");
  const rawReportWithPII = {
    id: "rep_secret_123",
    user_id: "usr_uuid_private_456",
    userName: "Alice Smith",
    userEmail: "alice@example.com",
    userPhone: "+1-555-0199",
    category: "poor_lighting",
    description: "Dark alleyway behind transit center",
    latitude: 37.77492918471,
    longitude: -122.41941659124,
    approximateLocationName: "Civic Transit Plaza",
    severity: "MODERATE",
    createdAt: new Date().toISOString(),
  };

  const anonReport = anonymizeCommunityReport(rawReportWithPII);
  assert(!anonReport.user_id && !anonReport.userName && !anonReport.userEmail && !anonReport.userPhone, "Strips all user PII (name, email, phone, user_id)");
  assert(anonReport.latitude === 37.775 && anonReport.longitude === -122.419, "Applies fuzzy coordinate precision (~100m) to preserve reporter location privacy");
  assert(anonReport.approximateLocationName === "Civic Transit Plaza", "Preserves approximate community location name");

  // 2. Test Spatial Hotspot Clustering Engine
  console.log("\n--- 2. Testing Spatial Hotspot Detection Engine ---");
  const clusterReports = [
    {
      id: "r1",
      category: "harassment",
      severity: "HIGH",
      latitude: 37.7800,
      longitude: -122.4100,
      approximateLocationName: "North Plaza",
      createdAt: new Date().toISOString(),
    },
    {
      id: "r2",
      category: "poor_lighting",
      severity: "MODERATE",
      latitude: 37.7802,
      longitude: -122.4103,
      approximateLocationName: "North Plaza Alley",
      createdAt: new Date().toISOString(),
    },
    {
      id: "r3",
      category: "theft",
      severity: "HIGH",
      latitude: 37.7801,
      longitude: -122.4101,
      approximateLocationName: "North Plaza Metro",
      createdAt: new Date().toISOString(),
    },
  ];

  const hotspots = detectSafetyHotspots(clusterReports, 0.45);
  assert(hotspots.length === 1, "Correctly clusters 3 nearby reports into 1 spatial hotspot");
  assert(hotspots[0].reportsCount === 3, "Hotspot captures report count of 3");
  assert(hotspots[0].dominantCategories.length > 0, "Extracts dominant hazard categories");
  assert(hotspots[0].riskScore > 40, "Calculates elevated hotspot risk score");

  // 3. Test Emerging Risk Trend Analyzer
  console.log("\n--- 3. Testing Emerging Risk Trend Analyzer ---");
  const now = Date.now();
  const recentReports = [
    { id: "t1", category: "harassment", severity: "HIGH", createdAt: new Date(now - 2 * 3600000).toISOString() },
    { id: "t2", category: "theft", severity: "HIGH", createdAt: new Date(now - 4 * 3600000).toISOString() },
    { id: "t3", category: "poor_lighting", severity: "MODERATE", createdAt: new Date(now - 6 * 3600000).toISOString() },
  ];

  const trendIncreasing = calculateEmergingRiskTrend(recentReports, 48);
  assert(trendIncreasing.trend === "INCREASING", "Detects 'INCREASING' risk trend on surge of recent high-severity reports");
  assert(trendIncreasing.trendBadge === "↑ Risk increasing", "Generates user-friendly trend badge ('↑ Risk increasing')");
  assert(trendIncreasing.disclaimer.includes("official law enforcement"), "Includes mandatory advisory disclaimer");

  // 4. Test Reports API with Multi-Layer Filtering
  console.log("\n--- 4. Testing Reports API Endpoints & Filtering ---");
  try {
    // GET all reports
    const res = await fetch(`${BASE_URL}/api/reports`);
    const data = await res.json();
    assert(res.status === 200 && data.success, "GET /api/reports returns HTTP 200");
    assert(Array.isArray(data.reports) && data.reports.length > 0, "Returns list of public reports");
    assert(Array.isArray(data.hotspots), "Returns computed spatial hotspots");
    assert(data.riskTrend && typeof data.riskTrend.trendBadge === "string", "Returns emerging risk trend analysis");

    // GET with Category filter
    const resFilteredCat = await fetch(`${BASE_URL}/api/reports?category=poor_lighting`);
    const dataCat = await resFilteredCat.json();
    assert(dataCat.reports.every(r => r.category === "poor_lighting"), "Category filter works for 'poor_lighting'");

    // GET with Time Window filter
    const resFilteredTime = await fetch(`${BASE_URL}/api/reports?timeWindow=7d`);
    const dataTime = await resFilteredTime.json();
    assert(resFilteredTime.status === 200, "Time window filter works for '7d'");
  } catch (e) {
    assert(false, `Reports API failed: ${e.message}`);
  }

  // 5. Test AI Area Summary API ("Analyze This Area")
  console.log("\n--- 5. Testing AI Area Summary API ---");
  try {
    const res = await fetch(`${BASE_URL}/api/ai/area-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        areaName: "Downtown Financial Corridor",
        reports: clusterReports,
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success, "POST /api/ai/area-summary returns HTTP 200");
    assert(typeof data.summary.overallSafetyIndex === "number", "Returns overallSafetyIndex (0-100)");
    assert(Array.isArray(data.summary.dominantHazards), "Returns dominant hazards list");
    assert(typeof data.summary.aiSafetyAdvice === "string", "Returns contextual AI safety advice");
  } catch (e) {
    assert(false, `AI Area summary failed: ${e.message}`);
  }

  // 6. Test Safe Corridor Route Comparison API
  console.log("\n--- 6. Testing Safe Corridor Route Comparison API ---");
  try {
    const res = await fetch(`${BASE_URL}/api/ai/route-comparison`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: "Campus Library",
        destination: "University Station",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success, "POST /api/ai/route-comparison returns HTTP 200");
    assert(Array.isArray(data.routes) && data.routes.length === 2, "Returns comparison between 2 distinct routes");
    assert(data.recommendedRouteId === "route_safe", "Recommends illuminated corridor ('route_safe')");
    assert(typeof data.aiExplanation === "string", "Returns explainable AI trade-off analysis");
    assert(data.disclaimer.includes("No route is guaranteed safe"), "Includes required advisory safety disclaimer");
  } catch (e) {
    assert(false, `Route comparison API failed: ${e.message}`);
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runPhase5CommunityMapTests();
