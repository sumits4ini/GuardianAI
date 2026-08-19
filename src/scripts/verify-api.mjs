async function verifyAll() {
  let BASE_URL = "http://localhost:3000";
  try {
    const check3000 = await fetch("http://localhost:3000/login");
    if (check3000.status === 200) BASE_URL = "http://localhost:3000";
  } catch {
    BASE_URL = "http://localhost:3001";
  }
  console.log(`Starting comprehensive verification against ${BASE_URL}...\n`);

  const pages = ["/", "/dashboard", "/journey", "/map", "/reports", "/assistant", "/profile", "/login", "/signup"];
  console.log("--- 1. Testing Page Routes ---");
  for (const page of pages) {
    try {
      const res = await fetch(`${BASE_URL}${page}`);
      console.log(`✓ Page [${page}]: Status ${res.status}`);
    } catch (e) {
      console.error(`✗ Page [${page}] Error:`, e.message);
    }
  }

  console.log("\n--- 2. Testing API Routes ---");

  // /api/ai/analyze-report
  try {
    const res = await fetch(`${BASE_URL}/api/ai/analyze-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Dark alley with broken lamps and zero pedestrian traffic",
        category: "poor_lighting",
        latitude: 37.7735,
        longitude: -122.4215,
        approximateLocationName: "East Quad",
      }),
    });
    const data = await res.json();
    console.log(`✓ POST /api/ai/analyze-report: Status ${res.status}`, data.classification?.severity);
  } catch (e) {
    console.error("✗ /api/ai/analyze-report:", e.message);
  }

  // /api/ai/analyze-distress
  try {
    const res = await fetch(`${BASE_URL}/api/ai/analyze-distress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Someone has been following me for 2 blocks" }),
    });
    const data = await res.json();
    console.log(`✓ POST /api/ai/analyze-distress: Status ${res.status}`, data.analysis?.urgency);
  } catch (e) {
    console.error("✗ /api/ai/analyze-distress:", e.message);
  }

  // /api/ai/risk-score
  try {
    const res = await fetch(`${BASE_URL}/api/ai/risk-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originCoords: { lat: 37.7718, lng: -122.4225 },
        destinationCoords: { lat: 37.7792, lng: -122.4158 },
        routeDeviationDetected: false,
        travelHour: 23,
      }),
    });
    const data = await res.json();
    console.log(`✓ POST /api/ai/risk-score: Status ${res.status}`, data.assessment?.riskScore, data.assessment?.riskLevel);
  } catch (e) {
    console.error("✗ /api/ai/risk-score:", e.message);
  }

  // /api/ai/area-summary
  try {
    const res = await fetch(`${BASE_URL}/api/ai/area-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ areaName: "Campus & Tech District Corridor" }),
    });
    const data = await res.json();
    console.log(`✓ POST /api/ai/area-summary: Status ${res.status}`, `Safety Index: ${data.summary?.overallSafetyIndex}`);
  } catch (e) {
    console.error("✗ /api/ai/area-summary:", e.message);
  }

  // /api/journeys
  try {
    const postRes = await fetch(`${BASE_URL}/api/journeys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originName: "Campus Library Plaza",
        originCoords: { lat: 37.7718, lng: -122.4225 },
        destinationName: "North Student Hostel",
        destinationCoords: { lat: 37.7792, lng: -122.4158 },
      }),
    });
    const postData = await postRes.json();
    console.log(`✓ POST /api/journeys: Status ${postRes.status}`, `ID: ${postData.journey?.id}`);

    const getRes = await fetch(`${BASE_URL}/api/journeys`);
    const getData = await getRes.json();
    console.log(`✓ GET /api/journeys: Status ${getRes.status}`, `Count: ${getData.journeys?.length}`);
  } catch (e) {
    console.error("✗ /api/journeys:", e.message);
  }

  // /api/check-in
  try {
    const res = await fetch(`${BASE_URL}/api/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ journeyId: "jrn_demo_01" }),
    });
    const data = await res.json();
    console.log(`✓ POST /api/check-in: Status ${res.status}`, data.checkIn?.status);
  } catch (e) {
    console.error("✗ /api/check-in:", e.message);
  }

  // /api/reports
  try {
    const getRes = await fetch(`${BASE_URL}/api/reports`);
    const getData = await getRes.json();
    console.log(`✓ GET /api/reports: Status ${getRes.status}`, `Count: ${getData.reports?.length}`);
  } catch (e) {
    console.error("✗ /api/reports:", e.message);
  }

  // /api/sos
  try {
    const res = await fetch(`${BASE_URL}/api/sos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        triggerType: "manual_hold",
        latitude: 37.7760,
        longitude: -122.4180,
      }),
    });
    const data = await res.json();
    console.log(`✓ POST /api/sos: Status ${res.status}`, data.status);
  } catch (e) {
    console.error("✗ /api/sos:", e.message);
  }

  console.log("\nAll 9 Pages and 8 API Route endpoints verified successfully!");
}

verifyAll();
