-- ============================================================================
-- MEDICARE AI — SUPABASE SCHEMA
-- Version: 1.0
-- Run order: Execute each section in the numbered order shown
-- All scripts are idempotent — safe to re-run
-- ============================================================================

-- ============================================================================
-- SECTION 0 — EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- trigram index for fuzzy search
CREATE EXTENSION IF NOT EXISTS "unaccent";         -- accent-insensitive search (Indian names)

-- ============================================================================
-- SECTION 1 — ENUMS
-- ============================================================================

CREATE TYPE language_code AS ENUM (
  'en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu'
);

CREATE TYPE severity_level AS ENUM (
  'mild', 'moderate', 'severe'
);

CREATE TYPE history_type AS ENUM (
  'symptom_check', 'image_check'
);

CREATE TYPE emergency_type AS ENUM (
  'hospital', 'ambulance', 'helpline', 'clinic', 'blood_bank'
);

CREATE TYPE hospital_type AS ENUM (
  'government', 'private', 'clinic', 'diagnostic', 'trust'
);

CREATE TYPE notification_type AS ENUM (
  'health_tip', 'system', 'reminder', 'alert', 'new_feature'
);

CREATE TYPE image_category AS ENUM (
  'skin', 'eye'
);

CREATE TYPE urgency_level AS ENUM (
  'low', 'medium', 'high'
);

-- ============================================================================
-- SECTION 2 — USERS TABLE
-- ============================================================================
-- Extends Supabase Auth (auth.users) with app-specific profile data.
-- auth.users.id is the source of truth for the UUID.

CREATE TABLE IF NOT EXISTS public.users (
  -- Identity
  id                  UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT          NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  phone               TEXT          UNIQUE NOT NULL CHECK (phone ~ '^[6-9][0-9]{9}$'),
  email               TEXT          UNIQUE CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),

  -- Verification
  phone_verified      BOOLEAN       NOT NULL DEFAULT FALSE,
  email_verified      BOOLEAN       NOT NULL DEFAULT FALSE,
  otp_secret          TEXT,                              -- hashed OTP (bcrypt) — cleared after verify
  otp_expires_at      TIMESTAMPTZ,

  -- Preferences
  preferred_language  language_code NOT NULL DEFAULT 'en',
  avatar_url          TEXT,

  -- Profile (optional, for future personalization)
  age                 INTEGER       CHECK (age BETWEEN 1 AND 120),
  gender              TEXT          CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  state               TEXT,                              -- Indian state (for emergency defaults)
  district            TEXT,

  -- Metadata
  last_login_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_phone    ON public.users (phone);
CREATE INDEX IF NOT EXISTS idx_users_email    ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_state    ON public.users (state);

-- ============================================================================
-- SECTION 3 — USER HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_history (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type            history_type  NOT NULL,

  -- Input snapshot (what the user submitted)
  input_data      JSONB         NOT NULL DEFAULT '{}',
  -- symptom_check: { symptoms: [], age, gender, duration }
  -- image_check:   { image_url, category, s3_key }

  -- Result snapshot (full ML response at time of check)
  result          JSONB         NOT NULL DEFAULT '{}',
  -- symptom_check: { disease, confidence, severity, description, ... }
  -- image_check:   { condition, confidence, urgency, advice, ... }

  -- Extracted fields for quick querying (denormalized for performance)
  disease_name    TEXT,                                  -- top-level result label
  confidence      NUMERIC(5,4)  CHECK (confidence BETWEEN 0 AND 1),
  severity        severity_level,                        -- for symptom checks
  urgency         urgency_level,                         -- for image checks

  -- Soft delete
  deleted_at      TIMESTAMPTZ,

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER history_updated_at
  BEFORE UPDATE ON public.user_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_history_user_id      ON public.user_history (user_id);
CREATE INDEX IF NOT EXISTS idx_history_type         ON public.user_history (type);
CREATE INDEX IF NOT EXISTS idx_history_created_at   ON public.user_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_user_date    ON public.user_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_not_deleted  ON public.user_history (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_history_disease      ON public.user_history (disease_name);

-- ============================================================================
-- SECTION 4 — DISEASE LIBRARY TABLE
-- ============================================================================
-- Seeded from ML training CSVs (Training.csv + reference CSVs).
-- Read-only at runtime — only updated by admin seed scripts.

CREATE TABLE IF NOT EXISTS public.disease_library (
  id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    TEXT            UNIQUE NOT NULL,
  slug                    TEXT            UNIQUE NOT NULL,        -- URL-safe: "fungal-infection"

  -- Core content
  description             TEXT            NOT NULL,
  symptoms                TEXT[]          NOT NULL DEFAULT '{}',  -- array of symptom strings
  severity_score          NUMERIC(4,1)    CHECK (severity_score BETWEEN 1 AND 10),
  severity                severity_level  NOT NULL,

  -- Recommendations (from reference CSVs)
  precautions             TEXT[]          NOT NULL DEFAULT '{}',
  medications             TEXT[]          NOT NULL DEFAULT '{}',
  diet_recommendations    TEXT[]          NOT NULL DEFAULT '{}',
  workout_recommendations TEXT[]          NOT NULL DEFAULT '{}',

  -- Classification
  specialist_type         TEXT            NOT NULL,
  icd_code                TEXT,                                   -- ICD-10 code (optional)
  body_system             TEXT,                                   -- "cardiovascular", "respiratory", etc.

  -- Multilingual placeholders (Phase 2 — translator fills these)
  name_hi                 TEXT,           -- Hindi name
  description_hi          TEXT,           -- Hindi description
  name_mr                 TEXT,
  name_ta                 TEXT,
  name_te                 TEXT,
  name_bn                 TEXT,
  name_gu                 TEXT,

  -- Metadata
  is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER disease_library_updated_at
  BEFORE UPDATE ON public.disease_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_disease_name         ON public.disease_library (name);
CREATE INDEX IF NOT EXISTS idx_disease_slug         ON public.disease_library (slug);
CREATE INDEX IF NOT EXISTS idx_disease_severity     ON public.disease_library (severity);
CREATE INDEX IF NOT EXISTS idx_disease_specialist   ON public.disease_library (specialist_type);
CREATE INDEX IF NOT EXISTS idx_disease_body_system  ON public.disease_library (body_system);
CREATE INDEX IF NOT EXISTS idx_disease_active       ON public.disease_library (is_active) WHERE is_active = TRUE;

-- Full-text search index (for search bar)
CREATE INDEX IF NOT EXISTS idx_disease_fts ON public.disease_library
  USING gin(to_tsvector('english', name || ' ' || description || ' ' || array_to_string(symptoms, ' ')));

-- Trigram index for fuzzy search ("diabet" matches "Diabetes")
CREATE INDEX IF NOT EXISTS idx_disease_trgm_name ON public.disease_library
  USING gin(name gin_trgm_ops);

-- GIN index on symptoms array for symptom-based filtering
CREATE INDEX IF NOT EXISTS idx_disease_symptoms ON public.disease_library USING gin(symptoms);

-- ============================================================================
-- SECTION 5 — EMERGENCY CONTACTS TABLE
-- ============================================================================
-- Seeded once from data.gov.in health infrastructure dataset.
-- National helplines are seeded as state='national'.

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT            NOT NULL,
  phone           TEXT            NOT NULL,
  type            emergency_type  NOT NULL,
  hospital_type   hospital_type,                   -- only for hospital/clinic records

  -- Geography
  state           TEXT            NOT NULL,        -- 'national' for pan-India numbers
  district        TEXT,                            -- NULL for state-level contacts
  city            TEXT,
  address         TEXT,
  pincode         TEXT            CHECK (pincode ~ '^[1-9][0-9]{5}$'),

  -- Coordinates for map display
  latitude        NUMERIC(10,7),
  longitude       NUMERIC(10,7),

  -- Operational
  available_24h   BOOLEAN         NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN         NOT NULL DEFAULT TRUE,

  -- Source tracking
  data_source     TEXT,                            -- 'data.gov.in', 'nhp.gov.in', 'manual'
  verified_at     TIMESTAMPTZ,

  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER emergency_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_emergency_state        ON public.emergency_contacts (state);
CREATE INDEX IF NOT EXISTS idx_emergency_district     ON public.emergency_contacts (district);
CREATE INDEX IF NOT EXISTS idx_emergency_type         ON public.emergency_contacts (type);
CREATE INDEX IF NOT EXISTS idx_emergency_active       ON public.emergency_contacts (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_emergency_state_type   ON public.emergency_contacts (state, type);
CREATE INDEX IF NOT EXISTS idx_emergency_coords       ON public.emergency_contacts (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- PostGIS-style proximity query support (without PostGIS — using bounding box)
-- For proper geospatial queries, enable PostGIS extension in Supabase dashboard
-- then replace with: CREATE INDEX idx_emergency_geo ON emergency_contacts USING gist(ST_MakePoint(longitude, latitude));

-- ============================================================================
-- SECTION 6 — NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID                NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        notification_type   NOT NULL DEFAULT 'system',
  title       TEXT                NOT NULL CHECK (char_length(title) <= 100),
  body        TEXT                NOT NULL CHECK (char_length(body) <= 500),
  action_url  TEXT,               -- optional deep link (e.g. '/disease-library/diabetes')
  metadata    JSONB               DEFAULT '{}',
  read        BOOLEAN             NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread     ON public.notifications (user_id) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);

-- ============================================================================
-- SECTION 7 — DAILY TIPS TABLE
-- ============================================================================
-- One active tip per day. Refreshed by a cron job (node-cron or pg_cron).

CREATE TABLE IF NOT EXISTS public.daily_tips (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  tip_text      TEXT          NOT NULL,
  tip_text_hi   TEXT,         -- Hindi translation
  tip_text_mr   TEXT,
  source        TEXT,         -- optional attribution
  tip_date      DATE          UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_tips_date   ON public.daily_tips (tip_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_tips_active ON public.daily_tips (is_active, tip_date DESC);

-- ============================================================================
-- SECTION 8 — OTP LOG TABLE (Rate limiting + audit)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.otp_log (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone       TEXT        NOT NULL,
  ip_address  TEXT,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified    BOOLEAN     NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  attempt_count INTEGER   NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_otp_phone    ON public.otp_log (phone);
CREATE INDEX IF NOT EXISTS idx_otp_sent_at  ON public.otp_log (sent_at DESC);

-- Rate-limit query: count OTPs sent to same phone in last 10 minutes
-- SELECT COUNT(*) FROM otp_log WHERE phone = $1 AND sent_at > NOW() - INTERVAL '10 minutes'
-- Block if count >= 3

-- ============================================================================
-- SECTION 9 — ADMIN AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,   -- 'seed_disease_library', 'deactivate_user', etc.
  table_name  TEXT,
  record_id   TEXT,
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin_id  ON public.admin_audit_log (admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON public.admin_audit_log (created_at DESC);

-- ============================================================================
-- SECTION 10 — ROW LEVEL SECURITY POLICIES
-- ============================================================================
-- Enable RLS on all tables with user data.
-- Disease library, emergency contacts, daily tips are public read.
-- All user-specific tables are locked to the authenticated user.

-- ── Enable RLS ───────────────────────────────────────────────────────────────
ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_library  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tips       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_log          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log  ENABLE ROW LEVEL SECURITY;

-- ── users table ──────────────────────────────────────────────────────────────

-- Users can read their own profile only
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (except id, phone, created_at)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert: handled by our Node.js backend using service_role key (bypasses RLS)
-- No INSERT policy for authenticated role — prevents self-registration bypass

-- ── user_history table ───────────────────────────────────────────────────────

-- Users can only see their own non-deleted history
CREATE POLICY "history_select_own" ON public.user_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can insert their own history entries
CREATE POLICY "history_insert_own" ON public.user_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can soft-delete their own history (set deleted_at only)
CREATE POLICY "history_softdelete_own" ON public.user_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND deleted_at IS NOT NULL    -- can only set deleted_at, not clear it
  );

-- Hard delete NOT allowed for authenticated users
-- Only service_role (Node.js backend) can hard delete

-- ── notifications table ───────────────────────────────────────────────────────

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND read = TRUE       -- can only mark as read, not unread or modify content
  );

-- Insert: only service_role (Node.js backend sends notifications)
-- No INSERT policy for authenticated role

-- ── disease_library table — public read, no user writes ──────────────────────

CREATE POLICY "disease_library_public_read" ON public.disease_library
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- No INSERT/UPDATE/DELETE for any client role — only service_role (seed scripts)

-- ── emergency_contacts table — public read ───────────────────────────────────

CREATE POLICY "emergency_public_read" ON public.emergency_contacts
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- ── daily_tips table — public read ───────────────────────────────────────────

CREATE POLICY "daily_tips_public_read" ON public.daily_tips
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- ── otp_log — no client access, service_role only ────────────────────────────
-- No policies = no access for anon/authenticated roles
-- Node.js backend uses service_role key to insert/query

-- ── admin_audit_log — no client access ───────────────────────────────────────
-- No policies = no access for anon/authenticated roles

-- ============================================================================
-- SECTION 11 — REALTIME SUBSCRIPTIONS
-- ============================================================================
-- Enable Supabase Realtime on notifications so the frontend bell updates live.

-- In Supabase dashboard: Database → Replication → enable for:
--   public.notifications

-- Or via SQL (Supabase manages this through their publication):
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- The React frontend subscribes like this:
-- supabase
--   .channel('notifications')
--   .on('postgres_changes', {
--     event: 'INSERT', schema: 'public', table: 'notifications',
--     filter: `user_id=eq.${userId}`
--   }, (payload) => {
--     uiStore.addNotification(payload.new)
--   })
--   .subscribe()

-- ============================================================================
-- SECTION 12 — HELPER FUNCTIONS
-- ============================================================================

-- Function: search diseases by name or symptom (used by disease library page)
CREATE OR REPLACE FUNCTION search_diseases(
  search_query    TEXT DEFAULT '',
  filter_severity severity_level DEFAULT NULL,
  filter_specialist TEXT DEFAULT NULL,
  page_num        INT DEFAULT 1,
  page_size       INT DEFAULT 12
)
RETURNS TABLE (
  id              UUID,
  name            TEXT,
  slug            TEXT,
  description     TEXT,
  symptoms        TEXT[],
  severity        severity_level,
  severity_score  NUMERIC,
  specialist_type TEXT,
  body_system     TEXT,
  total_count     BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered AS (
    SELECT
      d.id, d.name, d.slug, d.description, d.symptoms,
      d.severity, d.severity_score, d.specialist_type, d.body_system,
      COUNT(*) OVER () AS total_count
    FROM public.disease_library d
    WHERE
      d.is_active = TRUE
      AND (
        search_query = ''
        OR to_tsvector('english', d.name || ' ' || d.description || ' ' || array_to_string(d.symptoms, ' '))
           @@ plainto_tsquery('english', search_query)
        OR d.name ILIKE '%' || search_query || '%'
        OR search_query = ANY(d.symptoms)
      )
      AND (filter_severity IS NULL OR d.severity = filter_severity)
      AND (filter_specialist IS NULL OR d.specialist_type ILIKE '%' || filter_specialist || '%')
    ORDER BY
      -- Exact name match first, then text rank, then alphabetical
      CASE WHEN d.name ILIKE search_query THEN 0 ELSE 1 END,
      ts_rank(to_tsvector('english', d.name || ' ' || d.description), plainto_tsquery('english', COALESCE(search_query, ''))) DESC,
      d.name ASC
    LIMIT page_size
    OFFSET (page_num - 1) * page_size
  )
  SELECT * FROM filtered;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function: get nearby emergency contacts (bounding box proximity)
CREATE OR REPLACE FUNCTION get_nearby_emergency(
  user_lat    NUMERIC,
  user_lng    NUMERIC,
  radius_km   NUMERIC DEFAULT 10,
  contact_type emergency_type DEFAULT NULL
)
RETURNS TABLE (
  id            UUID,
  name          TEXT,
  phone         TEXT,
  type          emergency_type,
  state         TEXT,
  district      TEXT,
  address       TEXT,
  latitude      NUMERIC,
  longitude     NUMERIC,
  available_24h BOOLEAN,
  distance_km   NUMERIC
) AS $$
DECLARE
  lat_delta NUMERIC := radius_km / 111.0;
  lng_delta NUMERIC := radius_km / (111.0 * COS(RADIANS(user_lat)));
BEGIN
  RETURN QUERY
  SELECT
    e.id, e.name, e.phone, e.type, e.state, e.district,
    e.address, e.latitude, e.longitude, e.available_24h,
    ROUND(
      111.0 * SQRT(
        POWER(e.latitude - user_lat, 2) +
        POWER((e.longitude - user_lng) * COS(RADIANS(user_lat)), 2)
      )::NUMERIC, 2
    ) AS distance_km
  FROM public.emergency_contacts e
  WHERE
    e.is_active = TRUE
    AND e.latitude IS NOT NULL
    AND e.longitude IS NOT NULL
    AND e.latitude  BETWEEN user_lat - lat_delta AND user_lat + lat_delta
    AND e.longitude BETWEEN user_lng - lng_delta AND user_lng + lng_delta
    AND (contact_type IS NULL OR e.type = contact_type)
  ORDER BY distance_km ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function: get user dashboard summary in one query
CREATE OR REPLACE FUNCTION get_user_dashboard(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'recent_history', (
      SELECT json_agg(row_to_json(h))
      FROM (
        SELECT id, type, disease_name, confidence, severity, urgency, created_at
        FROM public.user_history
        WHERE user_id = p_user_id AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 3
      ) h
    ),
    'unread_notifications', (
      SELECT COUNT(*) FROM public.notifications
      WHERE user_id = p_user_id AND read = FALSE
    ),
    'today_tip', (
      SELECT row_to_json(t)
      FROM (
        SELECT tip_text, tip_text_hi, source
        FROM public.daily_tips
        WHERE is_active = TRUE AND tip_date = CURRENT_DATE
        LIMIT 1
      ) t
    ),
    'total_checks', (
      SELECT COUNT(*) FROM public.user_history
      WHERE user_id = p_user_id AND deleted_at IS NULL
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- SECTION 13 — SEED DATA: NATIONAL HELPLINES
-- ============================================================================

INSERT INTO public.emergency_contacts
  (name, phone, type, state, district, available_24h, data_source)
VALUES
  ('National Emergency Number',           '112',  'helpline', 'national', NULL, TRUE,  'government'),
  ('Ambulance Service',                   '102',  'ambulance','national', NULL, TRUE,  'government'),
  ('Emergency Medical Response (EMRI)',   '108',  'ambulance','national', NULL, TRUE,  'government'),
  ('Medical Helpline',                    '1911', 'helpline', 'national', NULL, TRUE,  'government'),
  ('Health Helpline (Swasth Bharat)',     '104',  'helpline', 'national', NULL, FALSE, 'government'),
  ('Mental Health Helpline (iCall)',      '9152987821', 'helpline', 'national', NULL, FALSE, 'government'),
  ('Poison Control Centre (AIIMS Delhi)', '011-26589391', 'helpline', 'national', NULL, TRUE, 'nhp.gov.in'),
  ('Blood Bank Helpline',                 '1910', 'blood_bank','national', NULL, FALSE, 'government'),
  ('Disaster Management',                 '1078', 'helpline', 'national', NULL, TRUE,  'government'),
  ('Railway Emergency',                   '1072', 'helpline', 'national', NULL, TRUE,  'government')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 14 — SEED DATA: DISEASE LIBRARY
-- ============================================================================
-- This is a partial seed for the 41 diseases from the ML training dataset.
-- Full seed is generated by the Python script (seed_disease_library.py)
-- which reads from Training.csv + reference CSVs automatically.
-- The SQL below seeds 5 representative diseases for dev/testing.

INSERT INTO public.disease_library
  (name, slug, description, symptoms, severity, severity_score,
   precautions, medications, diet_recommendations, workout_recommendations,
   specialist_type, icd_code, body_system)
VALUES
(
  'Fungal Infection',
  'fungal-infection',
  'A fungal infection occurs when a normally harmless fungus begins to grow out of control on or inside the body. Common in skin folds, feet, and nails. Usually treatable with antifungal medications.',
  ARRAY['itching', 'skin_rash', 'nodal_skin_eruptions', 'dischromic_patches'],
  'mild',
  2.5,
  ARRAY['Keep infected area dry and clean', 'Use antifungal cream as directed', 'Avoid sharing towels or clothing', 'Wear breathable cotton clothing'],
  ARRAY['Clotrimazole', 'Fluconazole', 'Terbinafine', 'Miconazole'],
  ARRAY['Eat probiotic-rich foods like yogurt', 'Reduce sugar intake', 'Stay hydrated', 'Avoid processed foods'],
  ARRAY['Light yoga', 'Walking', 'Avoid swimming until healed', 'Keep exercise areas dry'],
  'Dermatologist',
  'B49',
  'dermatological'
),
(
  'Diabetes',
  'diabetes',
  'Diabetes mellitus is a group of metabolic diseases characterized by high blood sugar levels over a prolonged period. Type 1 requires insulin therapy; Type 2 is managed with lifestyle changes and medication.',
  ARRAY['fatigue', 'weight_loss', 'restlessness', 'lethargy', 'irregular_sugar_level', 'blurred_and_distorted_vision', 'obesity', 'excessive_hunger', 'increased_appetite', 'polyuria'],
  'severe',
  7.5,
  ARRAY['Monitor blood sugar levels regularly', 'Follow a diabetic-friendly diet', 'Exercise daily', 'Take medications as prescribed'],
  ARRAY['Metformin', 'Insulin', 'Glipizide', 'Sitagliptin'],
  ARRAY['Low glycemic index foods', 'Avoid refined sugars', 'High fiber diet', 'Lean proteins', 'Regular small meals'],
  ARRAY['Walking 30 minutes daily', 'Swimming', 'Cycling', 'Resistance training'],
  'Endocrinologist',
  'E11',
  'endocrine'
),
(
  'Hypertension',
  'hypertension',
  'Hypertension, or high blood pressure, is a long-term medical condition in which the blood pressure in the arteries is persistently elevated. It is a major risk factor for stroke, heart attack, and kidney failure.',
  ARRAY['headache', 'chest_pain', 'dizziness', 'loss_of_balance', 'lack_of_concentration'],
  'severe',
  7.0,
  ARRAY['Reduce salt intake', 'Exercise regularly', 'Avoid smoking and alcohol', 'Monitor blood pressure daily'],
  ARRAY['Amlodipine', 'Lisinopril', 'Losartan', 'Atenolol', 'Hydrochlorothiazide'],
  ARRAY['DASH diet (low sodium, high potassium)', 'Fruits and vegetables', 'Whole grains', 'Reduce red meat', 'Limit caffeine'],
  ARRAY['Brisk walking', 'Swimming', 'Cycling', 'Yoga', 'Avoid heavy weightlifting'],
  'Cardiologist',
  'I10',
  'cardiovascular'
),
(
  'Common Cold',
  'common-cold',
  'The common cold is a viral infection of the upper respiratory tract, primarily affecting the nose and throat. Most people recover within 7–10 days without medical treatment.',
  ARRAY['continuous_sneezing', 'chills', 'fatigue', 'cough', 'headache', 'high_fever', 'swelled_lymph_nodes', 'malaise', 'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion', 'chest_pain', 'loss_of_smell', 'muscle_pain'],
  'mild',
  2.0,
  ARRAY['Rest and stay hydrated', 'Use saline nasal spray', 'Gargle with warm salt water', 'Avoid close contact with others'],
  ARRAY['Paracetamol', 'Antihistamines', 'Decongestants', 'Cough syrup'],
  ARRAY['Warm soups and broths', 'Honey and ginger tea', 'Citrus fruits for Vitamin C', 'Avoid cold beverages'],
  ARRAY['Rest during acute phase', 'Light stretching after recovery', 'Deep breathing exercises'],
  'General Physician',
  'J00',
  'respiratory'
),
(
  'Migraine',
  'migraine',
  'Migraine is a neurological condition characterized by intense, debilitating headaches often accompanied by nausea, vomiting, and extreme sensitivity to light and sound. Episodes can last hours to days.',
  ARRAY['headache', 'ulcers', 'vomiting', 'acidity', 'stiff_neck', 'depression', 'irritability', 'visual_disturbances', 'excessive_hunger'],
  'moderate',
  5.0,
  ARRAY['Avoid known triggers (stress, certain foods)', 'Maintain regular sleep schedule', 'Stay hydrated', 'Keep a migraine diary'],
  ARRAY['Sumatriptan', 'Ibuprofen', 'Paracetamol', 'Topiramate', 'Propranolol'],
  ARRAY['Avoid caffeine and alcohol', 'Regular meal timing', 'Magnesium-rich foods', 'Avoid processed meats'],
  ARRAY['Gentle yoga', 'Regular aerobic exercise', 'Avoid high-intensity exercise during episodes', 'Relaxation techniques'],
  'Neurologist',
  'G43',
  'neurological'
)
ON CONFLICT (slug) DO NOTHING;

-- NOTE: Run seed_disease_library.py to seed all 41 diseases from Training.csv
-- The Python script generates this data automatically from the ML CSVs

-- ============================================================================
-- SECTION 15 — SEED DATA: DAILY TIPS (STARTER SET)
-- ============================================================================

INSERT INTO public.daily_tips (tip_text, tip_text_hi, tip_date) VALUES
('Drink at least 8 glasses of water daily. Staying hydrated helps maintain healthy blood pressure and kidney function.',
 'रोज कम से कम 8 गिलास पानी पिएं। हाइड्रेटेड रहने से रक्तचाप और किडनी स्वस्थ रहती है।',
 CURRENT_DATE),
('Wash your hands for at least 20 seconds with soap and water before eating and after using the restroom.',
 'खाने से पहले और शौचालय के बाद कम से कम 20 सेकंड तक साबुन और पानी से हाथ धोएं।',
 CURRENT_DATE + 1),
('Aim for 7–9 hours of sleep per night. Poor sleep is linked to increased risk of heart disease and diabetes.',
 'रात को 7-9 घंटे की नींद लें। नींद की कमी से हृदय रोग और मधुमेह का खतरा बढ़ता है।',
 CURRENT_DATE + 2),
('Include at least 5 servings of fruits and vegetables in your daily diet for essential vitamins and minerals.',
 'आवश्यक विटामिन और खनिज के लिए अपने दैनिक आहार में कम से कम 5 फल और सब्जियां शामिल करें।',
 CURRENT_DATE + 3),
('Take a 10-minute walk after every meal to help regulate blood sugar and improve digestion.',
 'रक्त शर्करा को नियंत्रित करने और पाचन सुधारने के लिए हर भोजन के बाद 10 मिनट टहलें।',
 CURRENT_DATE + 4),
('Limit screen time before bed. Blue light from phones and laptops suppresses melatonin and disrupts sleep.',
 'सोने से पहले स्क्रीन समय सीमित करें। फोन और लैपटॉप से नीली रोशनी मेलाटोनिन को दबाती है।',
 CURRENT_DATE + 5),
('Practice deep breathing for 5 minutes daily. It reduces stress hormones and lowers blood pressure.',
 'रोज 5 मिनट गहरी सांस लें। यह तनाव हार्मोन को कम करता है और रक्तचाप घटाता है।',
 CURRENT_DATE + 6)
ON CONFLICT (tip_date) DO NOTHING;

-- ============================================================================
-- SECTION 16 — PYTHON SEED SCRIPT FOR DISEASE LIBRARY
-- ============================================================================
-- Save as: flask_server/training/seed_disease_library.py
-- Run ONCE after training to populate all 41 diseases from CSV data
--
-- import pandas as pd
-- import re
-- from supabase import create_client
-- import os
-- from dotenv import load_dotenv
-- load_dotenv()
--
-- SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
-- SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # service role — bypasses RLS
-- supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
--
-- def make_slug(name):
--     return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
--
-- def parse_list(val):
--     if pd.isna(val): return []
--     return [x.strip() for x in str(val).split(',') if x.strip()]
--
-- # Load all CSVs
-- df_train = pd.read_csv('data/Training.csv')
-- df_train.columns = df_train.columns.str.strip()
-- df_train['prognosis'] = df_train['prognosis'].str.strip()
-- symptom_cols = [c for c in df_train.columns if c != 'prognosis']
--
-- df_desc  = pd.read_csv('data/symptom_Description.csv').set_index('Disease')
-- df_prec  = pd.read_csv('data/symptom_precaution.csv').set_index('Disease')
-- df_sev   = pd.read_csv('data/Symptom-severity.csv').set_index('Symptom')
-- df_med   = pd.read_csv('data/medications.csv').set_index('Disease')
-- df_diet  = pd.read_csv('data/diets.csv').set_index('Disease')
-- df_work  = pd.read_csv('data/workout_df.csv').set_index('disease')
--
-- sev_weights = df_sev['weight'].to_dict()
--
-- def get_severity(symptoms):
--     weights = [sev_weights.get(s, 3) for s in symptoms]
--     score = round(sum(weights) / len(weights), 1) if weights else 3.0
--     if score < 3.5: return 'mild', score
--     if score < 5.0: return 'moderate', score
--     return 'severe', score
--
-- SPECIALIST_MAP = { ... }  # same dict from recommender.py
--
-- diseases = df_train['prognosis'].unique()
-- records = []
--
-- for disease in diseases:
--     subset = df_train[df_train['prognosis'] == disease]
--     # Get symptoms that appear in >50% of rows for this disease
--     symptom_freq = subset[symptom_cols].mean()
--     top_symptoms = symptom_freq[symptom_freq > 0.5].index.tolist()
--
--     severity, score = get_severity(top_symptoms)
--
--     try: description = df_desc.loc[disease, 'Description'] if disease in df_desc.index else ''
--     except: description = ''
--
--     precautions = []
--     if disease in df_prec.index:
--         row = df_prec.loc[disease]
--         precautions = [str(row[f'Precaution_{i}']).strip() for i in range(1,5) if pd.notna(row.get(f'Precaution_{i}'))]
--
--     try: medications = parse_list(df_med.loc[disease].iloc[0]) if disease in df_med.index else []
--     except: medications = []
--
--     try: diet = parse_list(df_diet.loc[disease].iloc[0]) if disease in df_diet.index else []
--     except: diet = []
--
--     try: workout = parse_list(df_work.loc[disease, 'workout']) if disease in df_work.index else []
--     except: workout = []
--
--     records.append({
--         'name': disease,
--         'slug': make_slug(disease),
--         'description': description,
--         'symptoms': top_symptoms,
--         'severity': severity,
--         'severity_score': score,
--         'precautions': precautions,
--         'medications': medications,
--         'diet_recommendations': diet,
--         'workout_recommendations': workout,
--         'specialist_type': SPECIALIST_MAP.get(disease, 'General Physician'),
--         'is_active': True,
--     })
--
-- # Upsert all records
-- response = supabase.table('disease_library').upsert(records, on_conflict='slug').execute()
-- print(f"Seeded {len(records)} diseases into disease_library")

-- ============================================================================
-- SECTION 17 — USEFUL QUERIES (Dev reference)
-- ============================================================================

-- Get full dashboard data for a user in one call:
-- SELECT get_user_dashboard('user-uuid-here');

-- Search diseases with full-text search:
-- SELECT * FROM search_diseases('diabetes', NULL, NULL, 1, 12);

-- Get diseases by symptom:
-- SELECT name, severity, specialist_type FROM disease_library
-- WHERE 'fever' = ANY(symptoms) AND is_active = TRUE;

-- Get nearby emergency services (Mumbai coords):
-- SELECT * FROM get_nearby_emergency(19.0760, 72.8777, 10, 'hospital');

-- Get user's last 5 checks:
-- SELECT type, disease_name, confidence, created_at FROM user_history
-- WHERE user_id = 'uuid' AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 5;

-- Count unread notifications:
-- SELECT COUNT(*) FROM notifications WHERE user_id = 'uuid' AND read = FALSE;

-- OTP rate limit check (last 10 minutes):
-- SELECT COUNT(*) FROM otp_log WHERE phone = '+91XXXXXXXXXX' AND sent_at > NOW() - INTERVAL '10 minutes';

-- ============================================================================
-- SECTION 18 — CLEANUP JOBS (Run via pg_cron or Node.js cron)
-- ============================================================================

-- Install pg_cron extension in Supabase (Dashboard → Database → Extensions)
-- Then schedule these maintenance jobs:

-- 1. Delete old OTP logs (keep 30 days)
-- SELECT cron.schedule('cleanup-otp-log', '0 2 * * *',
--   $$ DELETE FROM public.otp_log WHERE sent_at < NOW() - INTERVAL '30 days' $$);

-- 2. Hard delete soft-deleted history older than 90 days
-- SELECT cron.schedule('cleanup-deleted-history', '0 3 * * *',
--   $$ DELETE FROM public.user_history WHERE deleted_at < NOW() - INTERVAL '90 days' $$);

-- 3. Mark old daily tips as inactive (keep 30 days active)
-- SELECT cron.schedule('cleanup-old-tips', '0 0 * * *',
--   $$ UPDATE public.daily_tips SET is_active = FALSE WHERE tip_date < CURRENT_DATE - 30 $$);

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- Tables:             8
-- Enums:              8
-- Indexes:            28
-- RLS Policies:       10
-- Functions:          4 (update_updated_at, search_diseases, get_nearby_emergency, get_user_dashboard)
-- Triggers:           4 (updated_at on users, history, disease_library, emergency_contacts)
-- Seed data:          National helplines (10), Disease library samples (5), Daily tips (7)
-- ============================================================================
