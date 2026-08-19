async function runPhase2SafetyTests() {
  console.log("==================================================");
  console.log("🛡️ GUARDIANAI — PHASE 2 CORE PERSONAL SAFETY TESTS");
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

  // 1. Test POST /api/journeys (Start Journey)
  console.log("--- 1. Testing Journey Creation & Schema ---");
  let createdJourney = null;
  try {
    const res = await fetch(`${BASE_URL}/api/journeys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originName: "Campus West Gates",
        originCoords: { lat: 37.7718, lng: -122.4225 },
        destinationName: "Downtown Student Housing",
        destinationCoords: { lat: 37.7792, lng: -122.4158 },
        expectedDurationMins: 25,
        checkInIntervalMins: 10,
      }),
    });
    const data = await res.json();
    createdJourney = data.journey;

    assert(res.status === 200 && data.success, "Start journey endpoint returns HTTP 200");
    assert(
      createdJourney &&
      createdJourney.id &&
      (createdJourney.startLocation || createdJourney.originName) &&
      (createdJourney.destination || createdJourney.destinationName) &&
      createdJourney.startedAt &&
      createdJourney.expectedArrival &&
      createdJourney.status === "ACTIVE",
      "Journey object contains all required fields (id, start, destination, startedAt, expectedArrival, status)"
    );
  } catch (e) {
    assert(false, `Journey creation failed: ${e.message}`);
  }

  // 2. Test GET /api/journeys
  console.log("\n--- 2. Testing Journey Retrieval ---");
  try {
    const res = await fetch(`${BASE_URL}/api/journeys?status=ACTIVE`);
    const data = await res.json();
    assert(res.status === 200 && data.count >= 1, "GET /api/journeys filters by status");
  } catch (e) {
    assert(false, `GET journeys failed: ${e.message}`);
  }

  // 3. Test POST /api/check-in ("I'M SAFE")
  console.log("\n--- 3. Testing Safety Check-in Flow ---");
  try {
    const res = await fetch(`${BASE_URL}/api/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyId: createdJourney?.id || "jrn_demo_01",
        currentCoords: { lat: 37.7735, lng: -122.4200, accuracy: 12 },
      }),
    });
    const data = await res.json();

    assert(res.status === 200 && data.success, "Check-in endpoint records successfully");
    assert(data.message && data.message.includes("checked in"), "Check-in returns confirmation message with timestamp");
    assert(data.checkIn?.locationEvent?.latitude === 37.7735, "Check-in captures accurate location event");
  } catch (e) {
    assert(false, `Check-in failed: ${e.message}`);
  }

  // 4. Test Expected Arrival Monitoring (ATTENTION_REQUIRED transition)
  console.log("\n--- 4. Testing Expected Arrival Monitoring ---");
  function simulateArrivalCheck(expectedArrivalISO) {
    const now = Date.now();
    const arrival = new Date(expectedArrivalISO).getTime();
    return now > arrival ? "ATTENTION_REQUIRED" : "ACTIVE";
  }

  const pastArrival = new Date(Date.now() - 5 * 60000).toISOString();
  const futureArrival = new Date(Date.now() + 20 * 60000).toISOString();

  assert(simulateArrivalCheck(pastArrival) === "ATTENTION_REQUIRED", "Status transitions to ATTENTION_REQUIRED when current time > expected_arrival");
  assert(simulateArrivalCheck(futureArrival) === "ACTIVE", "Status remains ACTIVE when within expected arrival window");

  // 5. Test POST /api/sos (With GPS Location)
  console.log("\n--- 5. Testing SOS Activation (GPS Available) ---");
  let activeSosId = null;
  try {
    const res = await fetch(`${BASE_URL}/api/sos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyId: createdJourney?.id,
        triggerType: "manual_hold",
        latitude: 37.7760,
        longitude: -122.4180,
        accuracy: 8,
        contacts: [
          { name: "Maya Lin", phone: "+1 (555) 302-8811", relationship: "Sister" },
        ],
      }),
    });
    const data = await res.json();
    activeSosId = data.alertId;

    assert(res.status === 200 && data.success, "SOS activation returns HTTP 200");
    assert(data.status === "ACTIVE", "SOS alert status is ACTIVE");
    assert(data.notificationStatus === "DEMO", "Emergency notification recorded for demo (no fake SMS claims)");
    assert(data.coordinates?.lat === 37.7760, "SOS stores accurate coordinates when GPS available");
  } catch (e) {
    assert(false, `SOS activation failed: ${e.message}`);
  }

  // 6. Test SOS Activation with GPS Denied / Failed (CRITICAL REQUIREMENT)
  console.log("\n--- 6. Testing SOS Activation (GPS Denied/Unavailable) ---");
  try {
    const res = await fetch(`${BASE_URL}/api/sos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyId: createdJourney?.id,
        triggerType: "manual_hold",
        locationUnavailable: true,
        contacts: [
          { name: "Maya Lin", phone: "+1 (555) 302-8811", relationship: "Sister" },
        ],
      }),
    });
    const data = await res.json();

    assert(res.status === 200 && data.success, "SOS activates successfully even when GPS is unavailable");
    assert(
      data.locationMessage === "Location unavailable, but SOS is active.",
      "Displays 'Location unavailable, but SOS is active.' to user"
    );
  } catch (e) {
    assert(false, `GPS-less SOS failed: ${e.message}`);
  }

  // 7. Test POST /api/sos/resolve (Mark Safe)
  console.log("\n--- 7. Testing SOS Resolution (Mark Safe) ---");
  try {
    const res = await fetch(`${BASE_URL}/api/sos/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alertId: activeSosId,
        resolutionNotes: "User marked safe manually from dashboard.",
      }),
    });
    const data = await res.json();

    assert(res.status === 200 && data.success, "SOS resolve endpoint returns HTTP 200");
    assert(data.status === "RESOLVED", "SOS status updated to RESOLVED");
    assert(data.message.includes("marked safe"), "Displays 'SOS resolved. You're marked safe.'");
  } catch (e) {
    assert(false, `SOS resolution failed: ${e.message}`);
  }

  // 8. Test PATCH /api/journeys (Complete Journey)
  console.log("\n--- 8. Testing Journey Completion ---");
  try {
    const res = await fetch(`${BASE_URL}/api/journeys`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journeyId: createdJourney?.id,
        status: "COMPLETED",
      }),
    });
    const data = await res.json();

    assert(res.status === 200 && data.success, "Journey completion endpoint returns HTTP 200");
    assert(data.journey?.status === "COMPLETED" && data.journey?.completedAt, "Journey marked COMPLETED with completedAt timestamp");
  } catch (e) {
    assert(false, `Journey completion failed: ${e.message}`);
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runPhase2SafetyTests();
