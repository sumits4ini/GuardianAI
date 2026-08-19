-- ==========================================================
-- GuardianAI - Seed Data for Local Supabase Testing
-- ==========================================================

-- Insert Initial Community Hazard Reports
INSERT INTO public.safety_reports (
  id,
  category,
  description,
  latitude,
  longitude,
  approximate_location_name,
  severity,
  ai_classification,
  ai_confidence,
  status,
  verified_count,
  created_at
) VALUES 
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'harassment',
  'Group of 3 individuals shouting aggressive comments at solo commuters near the underpass entrance.',
  37.7762,
  -122.4178,
  '4th St Underpass & Metro Alley',
  'HIGH',
  '{"category": "harassment", "severity": "HIGH", "riskScoreContribution": 28, "reasoning": "Active pattern of confrontational behavior near a transit chokepoint."}'::jsonb,
  0.94,
  'verified',
  7,
  NOW() - INTERVAL '35 minutes'
),
(
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'poor_lighting',
  '4 consecutive streetlight outages along the pedestrian pathway. Very dark corridor between East Quad and Parking B.',
  37.7735,
  -122.4215,
  'East Quad Walkway',
  'MODERATE',
  '{"category": "poor_lighting", "severity": "MODERATE", "riskScoreContribution": 16, "reasoning": "Severely reduced ambient visibility during evening and night hours."}'::jsonb,
  0.91,
  'verified',
  12,
  NOW() - INTERVAL '2 hours'
),
(
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'isolated_area',
  'Industrial service road with blocked pedestrian sightlines and no emergency call boxes.',
  37.7785,
  -122.4142,
  'Warehouse Service Lane B',
  'HIGH',
  '{"category": "isolated_area", "severity": "HIGH", "riskScoreContribution": 24, "reasoning": "Extremely low foot traffic, no surveillance, high vulnerability corridor."}'::jsonb,
  0.89,
  'active',
  4,
  NOW() - INTERVAL '5 hours'
),
(
  'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'suspicious_activity',
  'Unoccupied vehicle idling in a no-parking blind spot with tinted windows for over 90 minutes.',
  37.7721,
  -122.4165,
  'Pine & 6th Ave Corner',
  'MODERATE',
  '{"category": "suspicious_activity", "severity": "MODERATE", "riskScoreContribution": 14, "reasoning": "Persistent stationary presence in a low-visibility residential turn."}'::jsonb,
  0.86,
  'active',
  3,
  NOW() - INTERVAL '55 minutes'
),
(
  'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'theft',
  'Phone snatching incident reported by a solo jogger; suspect fled toward the train tracks.',
  37.7771,
  -122.4231,
  'North Canal Jogging Track',
  'HIGH',
  '{"category": "theft", "severity": "HIGH", "riskScoreContribution": 26, "reasoning": "Recent opportunistic physical crime within the last hour."}'::jsonb,
  0.95,
  'verified',
  9,
  NOW() - INTERVAL '48 minutes'
);
