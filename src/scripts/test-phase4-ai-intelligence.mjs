import { calculateBaselineSafetyRisk, getContextualRecommendation } from "../lib/ai/risk-engine";
import { validateAIRiskAssessment } from "../lib/ai/validators";
import { detectJourneyAnomalies } from "../lib/ai/anomaly-engine";

async function runPhase4AITests() {
  console.log("==================================================");
  console.log("🛡️ GUARDIANAI — PHASE 4 ADVANCED AI INTELLIGENCE");
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

  // 1. Test Full Risk Spectrum & Contextual Recommendations
  console.log("--- 1. Testing Risk Tiers & Contextual Recommendations ---");
  
  // Tier 1: SAFE (0–25)
  const safeRes = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "RECENT",
    arrivalStatus: "ON_TIME",
    travelHour: 14,
    nearbyReports: [],
  });
  assert(safeRes.riskScore <= 25 && safeRes.riskLevel === "SAFE", "Score falls in SAFE tier (0-25)");
  assert(safeRes.recommendedAction === "Continue your journey normally.", "SAFE recommendation: 'Continue your journey normally.'");

  // Tier 2: MODERATE (26–50)
  const modRes = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "PENDING",
    arrivalStatus: "ON_TIME",
    travelHour: 21,
    nearbyReports: [{ category: "poor_lighting", severity: "MODERATE" }],
  });
  assert(modRes.riskScore >= 26 && modRes.riskScore <= 50 && modRes.riskLevel === "MODERATE", "Score falls in MODERATE tier (26-50)");
  assert(modRes.recommendedAction === "Consider checking your route and staying connected.", "MODERATE recommendation: 'Consider checking your route...'");

  // Tier 3: HIGH (51–75)
  const highRes = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "PENDING",
    arrivalStatus: "OVERDUE",
    travelHour: 23,
    nearbyReports: [{ category: "harassment", severity: "HIGH" }],
  });
  assert(highRes.riskScore >= 51 && highRes.riskScore <= 75 && highRes.riskLevel === "HIGH", "Score falls in HIGH tier (51-75)");
  assert(highRes.recommendedAction === "Check in with a trusted contact.", "HIGH recommendation: 'Check in with a trusted contact.'");

  // Tier 4: CRITICAL (76–100)
  const critRes = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "OVERDUE",
    arrivalStatus: "OVERDUE",
    routeDeviationDetected: true,
    travelHour: 23,
    nearbyReports: [{ category: "assault", severity: "CRITICAL" }],
  });
  assert(critRes.riskScore >= 76 && critRes.riskLevel === "CRITICAL", "Score falls in CRITICAL tier (76-100)");
  assert(critRes.recommendedAction.includes("activate SOS"), "CRITICAL recommendation prompts SOS activation");

  // 2. Intelligent Journey Anomaly Detection Suite
  console.log("\n--- 2. Testing Intelligent Journey Anomaly Detection ---");

  // Anomaly A: Route Deviation
  const devAnomaly = detectJourneyAnomalies({
    journey: {
      id: "jrn_01",
      destination: "Hostel",
      expectedArrival: new Date(Date.now() + 20 * 60000).toISOString(),
      status: "ACTIVE",
      routeDeviationDetected: true,
    },
  });
  assert(devAnomaly.hasAnomaly && devAnomaly.anomalies.some(a => a.type === "ROUTE_DEVIATION"), "Detects ROUTE_DEVIATION anomaly");

  // Anomaly B: Unexpected Stationary Pause
  const stopAnomaly = detectJourneyAnomalies({
    journey: {
      id: "jrn_02",
      destination: "Hostel",
      destinationLatitude: 37.7790,
      destinationLongitude: -122.4150,
      expectedArrival: new Date(Date.now() + 20 * 60000).toISOString(),
      status: "ACTIVE",
    },
    currentCoords: { lat: 37.7720, lng: -122.4200 }, // Far from destination
    isStationary: true,
    stationaryDurationMins: 8,
  });
  assert(stopAnomaly.hasAnomaly && stopAnomaly.anomalies.some(a => a.type === "UNEXPECTED_STOP"), "Detects UNEXPECTED_STOP anomaly (stationary > 5 mins en route)");

  // Anomaly C: Overdue Arrival
  const overdueAnomaly = detectJourneyAnomalies({
    journey: {
      id: "jrn_03",
      destination: "Hostel",
      expectedArrival: new Date(Date.now() - 10 * 60000).toISOString(),
      status: "ACTIVE",
    },
  });
  assert(overdueAnomaly.hasAnomaly && overdueAnomaly.anomalies.some(a => a.type === "OVERDUE_ARRIVAL"), "Detects OVERDUE_ARRIVAL anomaly");

  // Anomaly D: Missed Check-in
  const checkInAnomaly = detectJourneyAnomalies({
    journey: {
      id: "jrn_04",
      destination: "Hostel",
      expectedArrival: new Date(Date.now() + 20 * 60000).toISOString(),
      lastCheckIn: new Date(Date.now() - 25 * 60000).toISOString(),
      checkInIntervalMins: 10,
      status: "ACTIVE",
    },
  });
  assert(checkInAnomaly.hasAnomaly && checkInAnomaly.anomalies.some(a => a.type === "MISSED_CHECK_IN"), "Detects MISSED_CHECK_IN anomaly");

  // Anomaly E: High Hazard Zone Proximity
  const hazardEntryAnomaly = detectJourneyAnomalies({
    journey: {
      id: "jrn_05",
      destination: "Hostel",
      expectedArrival: new Date(Date.now() + 20 * 60000).toISOString(),
      status: "ACTIVE",
    },
    currentCoords: { lat: 37.7750, lng: -122.4180 },
    nearbyReports: [
      { id: "r1", latitude: 37.7752, longitude: -122.4181, category: "harassment", severity: "HIGH" },
    ],
  });
  assert(hazardEntryAnomaly.hasAnomaly && hazardEntryAnomaly.anomalies.some(a => a.type === "ELEVATED_RISK_AREA_ENTRY"), "Detects ELEVATED_RISK_AREA_ENTRY (< 300m from high threat)");

  // 3. Zero-PII Enforcement & API Risk Score Endpoint Testing
  console.log("\n--- 3. Testing Zero-PII API Risk Score Endpoint ---");
  try {
    const res = await fetch(`${BASE_URL}/api/ai/risk-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyStatus: "ACTIVE",
        checkInStatus: "RECENT",
        arrivalStatus: "ON_TIME",
        travelHour: 15,
        nearbyReports: [],
      }),
    });
    const data = await res.json();

    assert(res.status === 200 && data.success, "POST /api/ai/risk-score returns HTTP 200");
    assert(data.riskScore <= 25 && data.riskLevel === "SAFE", "Daytime safe journey returns SAFE riskScore <= 25");
    assert(data.recommendedAction === "Continue your journey normally.", "Returns exact contextual recommendation");
    assert(Array.isArray(data.signals) && data.signals.length > 0, "Provides explainability signals ('Why Your Risk Changed')");
  } catch (e) {
    assert(false, `API Risk score failed: ${e.message}`);
  }

  // 4. Test Safety Assistant (All 5 Target Scenarios)
  console.log("\n--- 4. Testing AI Safety Assistant Scenarios ---");

  // Scenario 1: "Someone is following me."
  try {
    const res = await fetch(`${BASE_URL}/api/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Someone is following me down this dark street" }),
    });
    const data = await res.json();
    assert(data.shouldShowSOSPrompt === true && data.riskLevel === "CRITICAL", "Scenario 1 ('Someone is following me') triggers CRITICAL SOS prompt");
  } catch (e) {
    assert(false, `Scenario 1 failed: ${e.message}`);
  }

  // Scenario 2: "I am lost."
  try {
    const res = await fetch(`${BASE_URL}/api/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "I took a wrong turn and I am lost" }),
    });
    const data = await res.json();
    assert(data.reply.includes("map") || data.reply.includes("corner") || data.reply.includes("avenue"), "Scenario 2 ('I am lost') gives grounding navigational guidance");
  } catch (e) {
    assert(false, `Scenario 2 failed: ${e.message}`);
  }

  // Scenario 3: "My friend hasn't reached home."
  try {
    const res = await fetch(`${BASE_URL}/api/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "My friend hasn't reached home and it's late" }),
    });
    const data = await res.json();
    assert(data.reply.includes("friend") || data.reply.includes("check-in"), "Scenario 3 ('My friend hasn't reached home') provides third-party check-in advice");
  } catch (e) {
    assert(false, `Scenario 3 failed: ${e.message}`);
  }

  // Scenario 4: "This area feels unsafe."
  try {
    const res = await fetch(`${BASE_URL}/api/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "This area feels unsafe and deserted" }),
    });
    const data = await res.json();
    assert(data.shouldShowSOSPrompt === true, "Scenario 4 ('This area feels unsafe') arms SOS beacon prompt");
  } catch (e) {
    assert(false, `Scenario 4 failed: ${e.message}`);
  }

  // Scenario 5: "Why did my risk score change?"
  try {
    const res = await fetch(`${BASE_URL}/api/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Why did my risk score change?",
        safetyContext: {
          riskScore: 65,
          riskLevel: "HIGH",
          signals: ["Expected arrival time passed by 12 mins", "Late night travel window"],
        },
      }),
    });
    const data = await res.json();
    assert(data.reply.includes("Expected arrival time passed") || data.reply.includes("risk score"), "Scenario 5 ('Why did risk change') explains using causal signals");
  } catch (e) {
    assert(false, `Scenario 5 failed: ${e.message}`);
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runPhase4AITests();
