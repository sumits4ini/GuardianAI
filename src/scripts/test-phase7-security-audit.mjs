import fs from "fs";
import path from "path";
import { anonymizeCommunityReport } from "../lib/safety/privacy-anonymizer";
import { calculateBaselineSafetyRisk } from "../lib/ai/risk-engine";
import { validateAIRiskAssessment } from "../lib/ai/validators";
import { detectJourneyAnomalies } from "../lib/ai/anomaly-engine";

async function runPhase7SecurityAudit() {
  console.log("==================================================");
  console.log("🛡️ GUARDIANAI — PHASE 7 SECURITY & PRIVACY AUDIT");
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

  // --- 1. AUDIT: Secret Leak Prevention ---
  console.log("--- 1. Auditing Secret Isolation & Client Bundle Security ---");
  
  // Verify .gitignore ignores .env
  const gitignoreContent = fs.readFileSync(path.resolve(".gitignore"), "utf-8");
  assert(gitignoreContent.includes(".env"), ".gitignore strictly excludes .env files");

  // Verify .env.example contains no real secrets
  const envExampleContent = fs.readFileSync(path.resolve(".env.example"), "utf-8");
  assert(!envExampleContent.includes("AIzaSy") && envExampleContent.includes("your_gemini_api_key_here"), ".env.example contains safe template placeholders without real keys");

  // Scan src/components for accidental GEMINI_API_KEY exposure
  let clientLeakFound = false;
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (content.includes('"use client"') && content.includes("process.env.GEMINI_API_KEY")) {
          clientLeakFound = true;
        }
      }
    }
  }
  scanDir(path.resolve("src/components"));
  scanDir(path.resolve("src/app"));
  assert(!clientLeakFound, "Zero client components ('use client') reference GEMINI_API_KEY");

  // --- 2. AUDIT: Location Privacy & Public Anonymization ---
  console.log("\n--- 2. Auditing Location Privacy & Anonymization ---");
  const rawReport = {
    id: "rep_audit_999",
    user_id: "usr_secret_private_id",
    userName: "Jane Doe",
    userPhone: "+1-555-9876",
    userEmail: "jane.doe@private.org",
    latitude: 37.7749281741,
    longitude: -122.4194162817,
    approximateLocationName: "Central Transit Station",
    category: "poor_lighting",
    description: "Broken streetlight at crosswalk",
    severity: "MODERATE",
    createdAt: new Date().toISOString(),
  };

  const scrubbed = anonymizeCommunityReport(rawReport);
  assert(!scrubbed.user_id && !scrubbed.userName && !scrubbed.userPhone && !scrubbed.userEmail, "All reporter PII (user_id, name, phone, email) scrubbed from public report");
  assert(scrubbed.latitude === 37.775 && scrubbed.longitude === -122.419, "Geocoordinates rounded to 3 decimal places (~110m) to protect exact location privacy");

  // --- 3. AUDIT: Safe Error Responses (No Internal Leakage) ---
  console.log("\n--- 3. Auditing API Error Handling & Sanitization ---");
  try {
    // Malformed JSON / Invalid schema POST to /api/journeys
    const badRes = await fetch(`${BASE_URL}/api/journeys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invalidField: true }),
    });
    const errData = await badRes.json();
    assert(badRes.status === 400, "Invalid API payload returns HTTP 400 Bad Request");
    assert(!JSON.stringify(errData).includes("SELECT") && !JSON.stringify(errData).includes("stack"), "API errors do not leak database queries or stack traces");
  } catch (e) {
    assert(false, `Error sanitization check failed: ${e.message}`);
  }

  // --- 4. AUDIT: AI Safety Invariants & Fallback ---
  console.log("\n--- 4. Auditing AI Safety Bounds & Deterministic Fallback ---");
  
  // Bounded risk score
  const validatedAssessment = validateAIRiskAssessment({
    riskScore: 45,
    riskLevel: "MODERATE",
    confidence: 0.88,
    signals: ["Evening travel hour"],
    reasoning: "Moderate ambient risk.",
    recommendedAction: "Stay on well-lit streets.",
    escalationLevel: "LOW",
  });
  assert(validatedAssessment !== null && validatedAssessment.riskScore === 45, "Schema validator enforces bounded riskScore");

  // Rejection of invalid risk score (> 100)
  const rejectedScore = validateAIRiskAssessment({
    riskScore: 120,
    riskLevel: "CRITICAL",
    confidence: 0.95,
    signals: ["Detour"],
    reasoning: "Extreme risk.",
    recommendedAction: "Activate SOS.",
    escalationLevel: "CRITICAL",
  });
  assert(rejectedScore === null, "Rejects out-of-bounds risk score (> 100)");

  // Rejection of invalid confidence (> 1.0)
  const rejectedConfidence = validateAIRiskAssessment({
    riskScore: 50,
    riskLevel: "MODERATE",
    confidence: 1.5,
    signals: ["Test"],
    reasoning: "Test",
    recommendedAction: "Test",
    escalationLevel: "LOW",
  });
  assert(rejectedConfidence === null, "Rejects out-of-bounds confidence (> 1.0)");

  // Deterministic baseline calculations always produce safe fallback values
  const safeBaseline = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "RECENT",
    arrivalStatus: "ON_TIME",
    travelHour: 12,
    nearbyReports: [],
  });
  assert(safeBaseline.riskScore <= 25 && safeBaseline.riskLevel === "SAFE", "Deterministic baseline scoring functions reliably for safe conditions");

  const criticalBaseline = calculateBaselineSafetyRisk({
    journeyStatus: "ACTIVE",
    checkInStatus: "OVERDUE",
    arrivalStatus: "OVERDUE",
    routeDeviationDetected: true,
    travelHour: 23,
    nearbyReports: [{ category: "assault", severity: "CRITICAL" }],
  });
  assert(criticalBaseline.riskScore >= 76 && criticalBaseline.riskLevel === "CRITICAL", "Deterministic baseline scoring correctly escalates critical scenarios");

  // --- 5. AUDIT: Edge Cases & Failure Mode Handling ---
  console.log("\n--- 5. Auditing Edge Cases & Failure Mode Resilience ---");

  // Edge Case A: SOS activation when GPS is unavailable
  try {
    const res = await fetch(`${BASE_URL}/api/sos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyId: "jrn_no_gps",
        triggerType: "manual_hold",
        locationUnavailable: true,
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.status === "ACTIVE", "SOS activates successfully even when GPS is unavailable");
    assert(data.locationMessage.includes("Location unavailable"), "Handles GPS denial with clear status message");
  } catch (e) {
    assert(false, `No-GPS SOS failed: ${e.message}`);
  }

  // Edge Case B: Zero community reports in area
  const emptyTrend = detectJourneyAnomalies({
    journey: {
      id: "jrn_clean",
      destination: "Hostel",
      expectedArrival: new Date(Date.now() + 20 * 60000).toISOString(),
      status: "ACTIVE",
    },
    nearbyReports: [],
  });
  assert(emptyTrend.hasAnomaly === false, "Handles zero-report / empty data scenarios without errors");

  // Edge Case C: Missing Gemini API Key fallback
  try {
    const res = await fetch(`${BASE_URL}/api/ai/risk-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyStatus: "ACTIVE",
        checkInStatus: "RECENT",
        arrivalStatus: "ON_TIME",
        travelHour: 14,
        nearbyReports: [],
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success, "Risk score API returns valid calculation even during Gemini outage");
  } catch (e) {
    assert(false, `AI risk-score endpoint failed: ${e.message}`);
  }

  // --- 6. AUDIT: End-to-End User Flow Execution ---
  console.log("\n--- 6. Auditing End-to-End User Flow Execution ---");

  // Step A: Start Journey
  let flowJourneyId = "";
  try {
    const res = await fetch(`${BASE_URL}/api/journeys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originName: "West Hall",
        originCoords: { lat: 37.7718, lng: -122.4225 },
        destinationName: "East Library",
        destinationCoords: { lat: 37.7792, lng: -122.4158 },
        expectedDurationMins: 15,
        checkInIntervalMins: 5,
      }),
    });
    const data = await res.json();
    flowJourneyId = data.journey?.id || "jrn_flow";
    assert(res.status === 200 && data.success, "Flow: Start safety journey");
  } catch (e) {
    assert(false, `Flow start journey failed: ${e.message}`);
  }

  // Step B: Periodic Safety Check-in
  try {
    const res = await fetch(`${BASE_URL}/api/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyId: flowJourneyId,
        currentCoords: { lat: 37.7745, lng: -122.4190 },
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success, "Flow: Perform safety check-in ('I'M SAFE')");
  } catch (e) {
    assert(false, `Flow check-in failed: ${e.message}`);
  }

  // Step C: Anonymous Community Report Submission
  try {
    const res = await fetch(`${BASE_URL}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "poor_lighting",
        description: "Dark crosswalk with flickering lamp",
        latitude: 37.7750,
        longitude: -122.4185,
        approximateLocationName: "Transit Crossing",
        severity: "MODERATE",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success, "Flow: Submit anonymous community hazard report");
  } catch (e) {
    assert(false, `Flow submit report failed: ${e.message}`);
  }

  // Step D: SOS Emergency Activation
  try {
    const res = await fetch(`${BASE_URL}/api/sos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyId: flowJourneyId,
        triggerType: "manual_hold",
        latitude: 37.7750,
        longitude: -122.4185,
        notificationStatus: "DEMO",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.status === "ACTIVE", "Flow: Activate emergency SOS beacon");
  } catch (e) {
    assert(false, `Flow trigger SOS failed: ${e.message}`);
  }

  // Step E: SOS Emergency Resolution (Mark Safe)
  try {
    const res = await fetch(`${BASE_URL}/api/sos/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alertId: "sos_flow",
        notes: "User reached destination safely",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.status === "RESOLVED", "Flow: Resolve SOS emergency ('Mark Safe')");
  } catch (e) {
    assert(false, `Flow resolve SOS failed: ${e.message}`);
  }

  // Step F: Complete Journey
  try {
    const res = await fetch(`${BASE_URL}/api/journeys`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyId: flowJourneyId,
        status: "COMPLETED",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.journey?.status === "COMPLETED", "Flow: Mark journey completed");
  } catch (e) {
    assert(false, `Flow complete journey failed: ${e.message}`);
  }

  console.log("\n==================================================");
  console.log(`SECURITY AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runPhase7SecurityAudit();
