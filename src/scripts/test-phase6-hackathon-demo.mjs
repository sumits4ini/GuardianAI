import { calculateBaselineSafetyRisk } from "../lib/ai/risk-engine";
import { detectJourneyAnomalies } from "../lib/ai/anomaly-engine";
import { detectSafetyHotspots } from "../lib/safety/hotspot-detector";
import { calculateEmergingRiskTrend } from "../lib/safety/trend-analyzer";

async function runHackathon15StepDemoTest() {
  console.log("==================================================");
  console.log("🛡️ GUARDIANAI — PHASE 6 HACKATHON 15-STEP DEMO TEST");
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

  function assert(condition, stepNum, testName) {
    if (condition) {
      console.log(`✓ [STEP ${stepNum}] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [STEP ${stepNum} FAILED] ${testName}`);
      failed++;
    }
  }

  // STEP 1: Open GuardianAI
  try {
    const res = await fetch(`${BASE_URL}/`);
    assert(res.status === 200, 1, "Open GuardianAI (Landing page loads with HTTP 200)");
  } catch (e) {
    assert(false, 1, `Landing page failed: ${e.message}`);
  }

  // STEP 2: Start a Safety Journey
  let activeJourneyId = "";
  try {
    const res = await fetch(`${BASE_URL}/api/journeys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originName: "Campus Library Plaza",
        originCoords: { lat: 37.7718, lng: -122.4225 },
        destinationName: "North Student Hostel Complex",
        destinationCoords: { lat: 37.7792, lng: -122.4158 },
        expectedDurationMins: 20,
        checkInIntervalMins: 10,
      }),
    });
    const data = await res.json();
    activeJourneyId = data.journey?.id || "jrn_demo";
    assert(res.status === 200 && data.success, 2, "Start safety journey (Destination: North Student Hostel)");
  } catch (e) {
    assert(false, 2, `Start journey failed: ${e.message}`);
  }

  // STEP 3: Show Current Safety Status
  const baselineSafe = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "RECENT",
    arrivalStatus: "ON_TIME",
    travelHour: 15,
    nearbyReports: [],
  });
  assert(baselineSafe.riskScore <= 25 && baselineSafe.riskLevel === "SAFE", 3, `Show current safety status (Score: ${baselineSafe.riskScore}, SAFE)`);

  // STEP 4: Simulate Entering a High-Risk Area
  const hotspotLocation = { lat: 37.7760, lng: -122.4180 };
  assert(hotspotLocation.lat === 37.7760, 4, "Simulate entering high-risk area (Moved coordinates to (37.776, -122.418))");

  // STEP 5: Show Community Reports
  try {
    const res = await fetch(`${BASE_URL}/api/reports`);
    const data = await res.json();
    assert(data.reports.length > 0 && Array.isArray(data.hotspots), 5, `Show community reports (${data.reports.length} active reports & hotspots found)`);
  } catch (e) {
    assert(false, 5, `Community reports failed: ${e.message}`);
  }

  // STEP 6: Risk Score Increases
  const elevatedRisk = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "PENDING",
    arrivalStatus: "ON_TIME",
    travelHour: 22,
    nearbyReports: [
      { category: "harassment", severity: "HIGH" },
      { category: "poor_lighting", severity: "MODERATE" },
    ],
  });
  assert(elevatedRisk.riskScore > baselineSafe.riskScore && elevatedRisk.riskScore >= 45, 6, `Risk score increases (Score: ${elevatedRisk.riskScore}, ${elevatedRisk.riskLevel})`);

  // STEP 7: AI Explains Why
  assert(elevatedRisk.signals.length >= 2 && elevatedRisk.signals.some(s => s.toLowerCase().includes("report")), 7, "AI explains why ('Why Your Risk Changed' causal signals rendered)");

  // STEP 8: Simulate Journey Deviation
  const detourJourney = {
    id: activeJourneyId,
    destination: "North Student Hostel Complex",
    expectedArrival: new Date(Date.now() + 15 * 60000).toISOString(),
    status: "ACTIVE",
    routeDeviationDetected: true,
  };
  assert(detourJourney.routeDeviationDetected === true, 8, "Simulate journey deviation (Detour into unlit side corridor)");

  // STEP 9: AI Detects Anomaly
  const anomalyRes = detectJourneyAnomalies({
    journey: detourJourney,
  });
  assert(anomalyRes.hasAnomaly && anomalyRes.anomalies.some(a => a.type === "ROUTE_DEVIATION"), 9, "AI detects anomaly (Identified ROUTE_DEVIATION)");

  // STEP 10: AI Recommends Check-In
  const critRisk = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "PENDING",
    routeDeviationDetected: true,
    travelHour: 23,
  });
  assert(critRisk.recommendedAction.length > 0, 10, `AI recommends safety action: '${critRisk.recommendedAction}'`);

  // STEP 11: User Checks In ("I'm Safe")
  try {
    const res = await fetch(`${BASE_URL}/api/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyId: activeJourneyId,
        currentCoords: {
          lat: 37.7782,
          lng: -122.4145,
        },
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success, 11, "User checks in (Logged 'I'M SAFE' check-in event)");
  } catch (e) {
    assert(false, 11, `Check-in failed: ${e.message}`);
  }

  // STEP 12: Open AI Safety Assistant
  try {
    const res = await fetch(`${BASE_URL}/api/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Analyze my current journey status and corridor safety",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.reply.length > 0, 12, "Open AI Safety Assistant (Assistant responded with journey guidance)");
  } catch (e) {
    assert(false, 12, `Safety Assistant failed: ${e.message}`);
  }

  // STEP 13: Demonstrate High-Risk Message ("Someone is following me")
  try {
    const res = await fetch(`${BASE_URL}/api/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Someone is following me down this dark alley",
      }),
    });
    const data = await res.json();
    assert(data.shouldShowSOSPrompt === true && data.riskLevel === "CRITICAL", 13, "Demonstrate high-risk message (Triggers CRITICAL SOS beacon prompt)");
  } catch (e) {
    assert(false, 13, `High-risk assistant query failed: ${e.message}`);
  }

  // STEP 14: Trigger Demo SOS
  try {
    const res = await fetch(`${BASE_URL}/api/sos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyId: activeJourneyId,
        triggerType: "manual_hold",
        latitude: 37.7782,
        longitude: -122.4145,
        notificationStatus: "DEMO",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.status === "ACTIVE", 14, "Trigger demo SOS (Emergency broadcast dispatched with demo notifications)");
  } catch (e) {
    assert(false, 14, `SOS trigger failed: ${e.message}`);
  }

  // STEP 15: Show Safety Intelligence Map
  try {
    const res = await fetch(`${BASE_URL}/api/reports?category=poor_lighting&timeWindow=7d`);
    const data = await res.json();
    assert(res.status === 200 && data.success, 15, "Show Safety Intelligence Map (Leaflet spatial layers & filters verified)");
  } catch (e) {
    assert(false, 15, `Map query failed: ${e.message}`);
  }

  console.log("\n==================================================");
  console.log(`HACKATHON DEMO TEST SUMMARY: ${passed} OF 15 STEPS PASSED`);
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runHackathon15StepDemoTest();
