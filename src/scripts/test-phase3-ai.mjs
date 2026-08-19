import { calculateBaselineSafetyRisk } from "../lib/ai/risk-engine";
import { validateAIRiskAssessment } from "../lib/ai/validators";
import { extractSafetySignals } from "../lib/ai/safety-signals";
import { detectJourneyAnomalies } from "../lib/ai/anomaly-engine";

async function runPhase3AITests() {
  console.log("==================================================");
  console.log("🛡️ GUARDIANAI — PHASE 3 INITIAL AI & SAFETY TESTS");
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

  // 1. Test Deterministic Baseline Scoring (All 4 Scenarios)
  console.log("--- 1. Testing Deterministic Baseline Safety Engine ---");
  
  // Scenario A: SAFE (Daytime, on track, zero hazards)
  const safeResult = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "RECENT",
    arrivalStatus: "ON_TIME",
    travelHour: 14,
    nearbyReports: [],
    routeDeviationDetected: false,
  });
  assert(
    safeResult.riskScore <= 25 && safeResult.riskLevel === "SAFE",
    `SAFE scenario produces score <= 25 (Got ${safeResult.riskScore}, ${safeResult.riskLevel})`
  );

  // Scenario B: MODERATE (Evening window, 1 moderate report)
  const modResult = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "PENDING",
    arrivalStatus: "ON_TIME",
    travelHour: 21,
    nearbyReports: [{ category: "poor_lighting", severity: "MODERATE" }],
    routeDeviationDetected: false,
  });
  assert(
    modResult.riskScore >= 26 && modResult.riskScore <= 50 && modResult.riskLevel === "MODERATE",
    `MODERATE scenario produces score 26-50 (Got ${modResult.riskScore}, ${modResult.riskLevel})`
  );

  // Scenario C: HIGH (Arrival overdue, late night, 1 high-severity incident)
  const highResult = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "PENDING",
    arrivalStatus: "OVERDUE",
    travelHour: 23,
    nearbyReports: [{ category: "harassment", severity: "HIGH" }],
    routeDeviationDetected: false,
  });
  assert(
    highResult.riskScore >= 51 && highResult.riskScore <= 75 && highResult.riskLevel === "HIGH",
    `HIGH scenario produces score 51-75 (Got ${highResult.riskScore}, ${highResult.riskLevel})`
  );

  // Scenario D: CRITICAL (SOS Active or Overdue check-in + Route detour + Severe incident)
  const critResult = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "OVERDUE",
    arrivalStatus: "OVERDUE",
    routeDeviationDetected: true,
    travelHour: 23,
    nearbyReports: [{ category: "assault", severity: "CRITICAL" }],
  });
  assert(
    critResult.riskScore >= 76 && critResult.riskLevel === "CRITICAL",
    `CRITICAL scenario produces score >= 76 (Got ${critResult.riskScore}, ${critResult.riskLevel})`
  );

  // 2. Test AI Output Validator (Zod Schema)
  console.log("\n--- 2. Testing AI Response Validation & Sanitization ---");
  const validAI = {
    riskScore: 64,
    riskLevel: "HIGH",
    confidence: 0.84,
    signals: ["Overdue arrival by 15 mins", "Late night travel window"],
    reasoning: "Arrival time passed without destination check-in.",
    recommendedAction: "Send status check-in to primary contact.",
    escalationLevel: "MEDIUM",
  };
  assert(validateAIRiskAssessment(validAI) !== null, "Valid AI output passes validation schema");

  const invalidScore = { ...validAI, riskScore: 150 }; // Out of bounds > 100
  assert(validateAIRiskAssessment(invalidScore) === null, "Rejects out-of-bounds risk score (> 100)");

  const invalidConfidence = { ...validAI, confidence: 2.5 }; // Out of bounds > 1.0
  assert(validateAIRiskAssessment(invalidConfidence) === null, "Rejects out-of-bounds confidence (> 1.0)");

  const invalidLevel = { ...validAI, riskLevel: "EXTREME_DANGER" }; // Invalid enum
  assert(validateAIRiskAssessment(invalidLevel) === null, "Rejects unlisted risk level enum");

  // 3. Test POST /api/ai/risk-score (API Endpoint)
  console.log("\n--- 3. Testing AI Risk Score Endpoint ---");
  try {
    const res = await fetch(`${BASE_URL}/api/ai/risk-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyStatus: "ACTIVE",
        checkInStatus: "OVERDUE",
        arrivalStatus: "ON_TIME",
        travelHour: 22,
        nearbyReports: [
          { category: "poor_lighting", severity: "MODERATE", approximateLocationName: "East Quad" },
        ],
      }),
    });
    const data = await res.json();

    assert(res.status === 200 && data.success, "POST /api/ai/risk-score returns HTTP 200");
    assert(
      typeof data.riskScore === "number" && data.riskScore >= 0 && data.riskScore <= 100,
      "Response contains validated riskScore (0-100)"
    );
    assert(
      ["SAFE", "MODERATE", "HIGH", "CRITICAL"].includes(data.riskLevel),
      "Response contains valid riskLevel"
    );
    assert(
      Array.isArray(data.signals) && data.signals.length > 0,
      "Response includes explainability signals ('Why is my score high?')"
    );
    assert(
      typeof data.reasoning === "string" && data.reasoning.length > 5,
      "Response includes contextual reasoning narrative"
    );
    assert(
      typeof data.recommendedAction === "string" && data.recommendedAction.length > 5,
      "Response includes recommended safety action"
    );
  } catch (e) {
    assert(false, `AI risk score API failed: ${e.message}`);
  }

  // 4. Test Safety Assistant API (POST /api/ai/assistant)
  console.log("\n--- 4. Testing AI Safety Assistant ---");
  try {
    const res = await fetch(`${BASE_URL}/api/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Why is my risk score high?",
        safetyContext: {
          riskScore: 68,
          riskLevel: "HIGH",
          signals: ["Overdue check-in by 12 mins", "Late night travel window"],
        },
      }),
    });
    const data = await res.json();

    assert(res.status === 200 && data.success, "Safety Assistant responds to 'Why is my risk high?'");
    assert(
      data.reply && data.reply.length > 10,
      "Assistant provides meaningful safety explanation"
    );
  } catch (e) {
    assert(false, `Safety assistant API failed: ${e.message}`);
  }

  // 5. Test Safety Assistant High Danger / SOS Prompt
  console.log("\n--- 5. Testing Distress Cue & SOS Prompting ---");
  try {
    const res = await fetch(`${BASE_URL}/api/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "A man is following me down a dark alley, I am really scared",
        safetyContext: {
          riskScore: 82,
          riskLevel: "CRITICAL",
        },
      }),
    });
    const data = await res.json();

    assert(res.status === 200 && data.shouldShowSOSPrompt === true, "Distress cues trigger shouldShowSOSPrompt = true");
  } catch (e) {
    assert(false, `Distress assistant test failed: ${e.message}`);
  }

  // 6. Test Anomaly Engine Foundation
  console.log("\n--- 6. Testing Baseline Anomaly Engine ---");
  const pastJourney = {
    id: "jrn_test_01",
    destination: "Student Housing",
    expectedArrival: new Date(Date.now() - 20 * 60000).toISOString(),
    status: "ACTIVE",
    lastCheckIn: new Date(Date.now() - 25 * 60000).toISOString(),
    checkInIntervalMins: 10,
    routeDeviationDetected: true,
  };
  const anomaly = detectJourneyAnomalies(pastJourney);
  assert(anomaly.hasAnomaly === true, "Detects corridor deviation anomaly");
  assert(anomaly.anomalyType === "CORRIDOR_DEVIATION", "Identifies anomalyType correctly");

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runPhase3AITests();
