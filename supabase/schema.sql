-- ==========================================================
-- GuardianAI - Predictive AI Safety Intelligence
-- PostgreSQL Schema & Row Level Security (RLS) Policies
-- ==========================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  emergency_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit own profile" 
  ON public.profiles 
  FOR ALL 
  USING (auth.uid() = id);

-- 2. Trusted Contacts Table
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  relationship TEXT NOT NULL,
  notify_on_high_risk BOOLEAN NOT NULL DEFAULT TRUE,
  notify_on_sos BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their trusted contacts" 
  ON public.trusted_contacts 
  FOR ALL 
  USING (auth.uid() = user_id);

-- 3. Safety Sessions (Journeys) Table
CREATE TABLE IF NOT EXISTS public.safety_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin_name TEXT NOT NULL,
  origin_lat DOUBLE PRECISION NOT NULL,
  origin_lng DOUBLE PRECISION NOT NULL,
  destination_name TEXT NOT NULL,
  destination_lat DOUBLE PRECISION NOT NULL,
  destination_lng DOUBLE PRECISION NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_arrival TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled', 'alert')),
  current_risk_score INTEGER NOT NULL DEFAULT 10,
  current_risk_level TEXT NOT NULL CHECK (current_risk_level IN ('SAFE', 'MODERATE', 'HIGH', 'CRITICAL')),
  last_check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_in_interval_mins INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.safety_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their safety sessions" 
  ON public.safety_sessions 
  FOR ALL 
  USING (auth.uid() = user_id);

-- 4. Location Events Table (Breadcrumb Trail)
CREATE TABLE IF NOT EXISTS public.location_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.safety_sessions(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  is_deviation BOOLEAN NOT NULL DEFAULT FALSE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.location_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage location events for own sessions" 
  ON public.location_events 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.safety_sessions 
      WHERE id = location_events.session_id AND user_id = auth.uid()
    )
  );

-- 5. Community Safety Reports (Anonymized)
CREATE TABLE IF NOT EXISTS public.safety_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN (
    'harassment', 'suspicious_activity', 'poor_lighting', 'unsafe_road', 'accident', 'theft', 'isolated_area', 'other'
  )),
  description TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  approximate_location_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
  ai_classification JSONB,
  ai_confidence DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'verified', 'resolved')),
  verified_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view anonymized reports
CREATE POLICY "Anyone can view active safety reports" 
  ON public.safety_reports 
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Authenticated users can insert reports
CREATE POLICY "Authenticated users can submit reports" 
  ON public.safety_reports 
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- 6. Risk Assessments Log
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.safety_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('SAFE', 'MODERATE', 'HIGH', 'CRITICAL')),
  confidence DOUBLE PRECISION NOT NULL,
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  reasoning TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  escalation_level TEXT NOT NULL CHECK (escalation_level IN ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view risk assessments for own sessions" 
  ON public.risk_assessments 
  FOR ALL 
  USING (auth.uid() = user_id);

-- 7. SOS Alerts Table
CREATE TABLE IF NOT EXISTS public.sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.safety_sessions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual_hold', 'manual_slide', 'ai_escalation', 'missed_checkin', 'distress_ai_prompt', 'demo_sos_click')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own SOS alerts" 
  ON public.sos_alerts 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Spatial Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_safety_reports_coords ON public.safety_reports (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_location_events_session ON public.location_events (session_id);
