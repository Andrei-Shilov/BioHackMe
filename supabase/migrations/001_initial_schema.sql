-- ═══════════════════════════════════════════════════════════════
-- Lumina Health — Initial Database Schema
-- Migration: 001_initial_schema
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ──────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
  'patient', 'expert', 'reviewer', 'admin'
);

CREATE TYPE subscription_tier AS ENUM (
  'essential', 'plus', 'premium', 'pro_bono', 'corporate'
);

CREATE TYPE triage_level AS ENUM (
  'green', 'yellow', 'red'
);

CREATE TYPE protocol_type AS ENUM (
  'mini', 'full', 'ai_interactive'
);

CREATE TYPE protocol_status AS ENUM (
  'draft', 'pending_moderation', 'pending_ethics_review', 'approved', 'rejected'
);

CREATE TYPE appointment_status AS ENUM (
  'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
);

CREATE TYPE payout_status AS ENUM (
  'pending', 'processing', 'paid', 'failed'
);

CREATE TYPE accessor_type AS ENUM (
  'doctor', 'ai', 'admin', 'researcher'
);

-- ─── USERS & PROFILES ───────────────────────────────────────────

CREATE TABLE users (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             text UNIQUE NOT NULL,
  role              user_role NOT NULL DEFAULT 'patient',
  subscription_tier subscription_tier NOT NULL DEFAULT 'essential',
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_profiles (
  user_id       uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  age           int CHECK (age > 0 AND age < 150),
  weight_kg     numeric(5,1),
  conditions    text[] NOT NULL DEFAULT '{}',
  allergies     text[] NOT NULL DEFAULT '{}',
  avatar_url    text,
  date_of_birth date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── HEALTH DATA ────────────────────────────────────────────────

CREATE TABLE health_metrics (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        text NOT NULL,        -- e.g. 'blood_pressure_systolic'
  value       numeric NOT NULL,
  unit        text NOT NULL,
  source      text,                 -- 'apple_health' | 'google_fit' | 'manual'
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mood_logs (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood_score  smallint NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_health_metrics_user_type ON health_metrics(user_id, type, recorded_at DESC);
CREATE INDEX idx_mood_logs_user           ON mood_logs(user_id, created_at DESC);

-- ─── EXPERTS & DOCTORS ──────────────────────────────────────────

CREATE TABLE experts (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  license_number  text NOT NULL,
  specialties     text[] NOT NULL DEFAULT '{}',
  bio             text,
  video_url       text,
  consultation_price_usd numeric(8,2),
  languages       text[] NOT NULL DEFAULT '{ru}',
  rating          numeric(3,2) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  review_count    int DEFAULT 0,
  is_verified     boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE expert_ethics_profiles (
  expert_id              uuid PRIMARY KEY REFERENCES experts(id) ON DELETE CASCADE,
  lgbtq_friendly         boolean NOT NULL DEFAULT false,
  no_insurance_required  boolean NOT NULL DEFAULT false,
  transparent_pricing    boolean NOT NULL DEFAULT false,
  ethics_rating          smallint DEFAULT 3 CHECK (ethics_rating BETWEEN 1 AND 5),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE doctor_availability (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id   uuid NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  slot_datetime timestamptz NOT NULL,
  is_booked   boolean NOT NULL DEFAULT false,
  duration_min smallint NOT NULL DEFAULT 30
);

CREATE INDEX idx_availability_expert_slot ON doctor_availability(expert_id, slot_datetime);

-- ─── PROTOCOLS ──────────────────────────────────────────────────

CREATE TABLE protocols (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id    uuid NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  category     text NOT NULL,
  type         protocol_type NOT NULL DEFAULT 'mini',
  status       protocol_status NOT NULL DEFAULT 'draft',
  price_usd    numeric(8,2) NOT NULL DEFAULT 0,
  rating       numeric(3,2) DEFAULT 0,
  usage_count  int NOT NULL DEFAULT 0,
  is_verified  boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE protocol_steps (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id uuid NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  step_order  int NOT NULL,
  title       text NOT NULL,
  content     text NOT NULL,
  video_url   text,
  checklist   text[] NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE protocol_reviews (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id uuid NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES users(id),
  status      text NOT NULL CHECK (status IN ('approved', 'rejected', 'needs_changes')),
  feedback    text,
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE protocol_purchases (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  protocol_id   uuid NOT NULL REFERENCES protocols(id),
  purchased_at  timestamptz NOT NULL DEFAULT now(),
  price_paid    numeric(8,2) NOT NULL,
  stripe_charge_id text,
  UNIQUE(user_id, protocol_id)
);

CREATE TABLE conflict_of_interest_disclosures (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id     uuid NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  expert_id       uuid NOT NULL REFERENCES experts(id),
  has_conflict    boolean NOT NULL DEFAULT false,
  disclosure_text text,
  disclosed_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_protocols_status   ON protocols(status);
CREATE INDEX idx_protocols_category ON protocols(category);
CREATE INDEX idx_protocols_expert   ON protocols(expert_id);

-- ─── APPOINTMENTS ────────────────────────────────────────────────

CREATE TABLE appointments (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id       uuid NOT NULL REFERENCES experts(id),
  scheduled_at    timestamptz NOT NULL,
  duration_min    smallint NOT NULL DEFAULT 30,
  status          appointment_status NOT NULL DEFAULT 'scheduled',
  notes           text,
  price_usd       numeric(8,2),
  video_call_url  text,
  stripe_charge_id text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id, scheduled_at DESC);
CREATE INDEX idx_appointments_doctor  ON appointments(doctor_id, scheduled_at DESC);

-- ─── AI SESSIONS ─────────────────────────────────────────────────

CREATE TABLE ai_sessions (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  triage_level triage_level,
  summary      text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai_messages (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('user', 'assistant')),
  content    text NOT NULL,
  metadata   jsonb,         -- triage result, confidence, source
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_sessions_user ON ai_sessions(user_id, created_at DESC);

-- ─── SUBSCRIPTIONS & PAYMENTS ────────────────────────────────────

CREATE TABLE subscriptions (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier         subscription_tier NOT NULL,
  start_date   timestamptz NOT NULL DEFAULT now(),
  end_date     timestamptz,
  stripe_id    text UNIQUE,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE expert_payouts (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id           uuid NOT NULL REFERENCES experts(id),
  amount_usd          numeric(10,2) NOT NULL,
  period_start        date NOT NULL,
  period_end          date NOT NULL,
  status              payout_status NOT NULL DEFAULT 'pending',
  stripe_transfer_id  text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- Pro Bono fund (tracks contributions)
CREATE TABLE pro_bono_contributions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id),
  amount_usd      numeric(8,2) NOT NULL,
  period          date NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── PRIVACY & DATA ACCESS LOG ───────────────────────────────────

CREATE TABLE data_access_logs (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accessor_id   uuid NOT NULL,
  accessor_type accessor_type NOT NULL,
  accessed_at   timestamptz NOT NULL DEFAULT now(),
  purpose       text NOT NULL,
  data_types    text[] NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_data_access_user ON data_access_logs(user_id, accessed_at DESC);

-- ─── CONSENT MANAGEMENT ──────────────────────────────────────────

CREATE TABLE user_consents (
  user_id              uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  ai_training          boolean NOT NULL DEFAULT false,
  analytics            boolean NOT NULL DEFAULT false,
  marketing            boolean NOT NULL DEFAULT false,
  health_data_sharing  boolean NOT NULL DEFAULT false,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_protocols_updated_at
  BEFORE UPDATE ON protocols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────

ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions      ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users: own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Profiles: own data" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Health metrics: own data" ON health_metrics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Mood logs: own data" ON mood_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Appointments: patient or doctor" ON appointments
  FOR ALL USING (
    auth.uid() = patient_id
    OR auth.uid() IN (SELECT user_id FROM experts WHERE id = doctor_id)
  );

CREATE POLICY "AI sessions: own data" ON ai_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "AI messages: via session" ON ai_messages
  FOR ALL USING (
    session_id IN (SELECT id FROM ai_sessions WHERE user_id = auth.uid())
  );

CREATE POLICY "Data access log: own data" ON data_access_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Consents: own data" ON user_consents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Purchases: own data" ON protocol_purchases
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Subscriptions: own data" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Protocols are publicly readable when approved
CREATE POLICY "Protocols: public read approved" ON protocols
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Protocols: expert manages own" ON protocols
  FOR ALL USING (
    expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid())
  );
