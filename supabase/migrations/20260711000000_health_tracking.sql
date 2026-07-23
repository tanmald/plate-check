-- Health tracking: Apple Health data ingested via Health Auto Export webhook.
-- Raw samples land in health_samples; the ingest-health edge function aggregates
-- them into health_daily and computes recovery/sleep/strain scores.

-- Per-user ingest tokens for the webhook (Health Auto Export cannot do Supabase
-- JWT auth, so it sends a per-user API key in the x-api-key header). Only the
-- SHA-256 hash is stored; the plaintext is shown once at generation time.
CREATE TABLE public.health_ingest_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  token_prefix TEXT NOT NULL, -- first chars of the plaintext, for display only
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Raw health samples (append-only via upsert; Health Auto Export re-sends
-- overlapping windows, so the unique constraint makes ingestion idempotent)
CREATE TABLE public.health_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric TEXT NOT NULL, -- Health Auto Export metric name, e.g. 'heart_rate_variability'
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  local_date DATE NOT NULL, -- day in the device's timezone (taken from the raw date string)
  qty NUMERIC, -- value for scalar metrics
  payload JSONB, -- full data point for structured metrics (sleep_analysis, workouts)
  units TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, metric, recorded_at)
);

-- Daily aggregates + computed scores (NULL score = insufficient data / calibrating)
CREATE TABLE public.health_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  -- recovery inputs (overnight values)
  hrv_ms NUMERIC,
  resting_hr NUMERIC,
  respiratory_rate NUMERIC,
  wrist_temp NUMERIC,
  wrist_temp_delta NUMERIC, -- vs personal baseline
  spo2 NUMERIC,
  -- sleep (session ending on this date)
  sleep_start TIMESTAMP WITH TIME ZONE,
  sleep_end TIMESTAMP WITH TIME ZONE,
  sleep_duration_min NUMERIC,
  sleep_deep_min NUMERIC,
  sleep_rem_min NUMERIC,
  sleep_core_min NUMERIC,
  sleep_awake_min NUMERIC,
  sleep_efficiency NUMERIC, -- 0-1: asleep / (asleep + awake)
  -- activity
  steps NUMERIC,
  active_energy_kcal NUMERIC,
  exercise_minutes NUMERIC,
  stand_hours NUMERIC,
  vo2_max NUMERIC,
  workouts JSONB DEFAULT '[]',
  -- computed scores
  recovery_score INTEGER,
  sleep_score INTEGER,
  strain_score INTEGER,
  score_detail JSONB, -- component breakdown + baselines used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_health_samples_user_metric_date
  ON public.health_samples(user_id, metric, local_date DESC);
CREATE INDEX idx_health_daily_user_date
  ON public.health_daily(user_id, date DESC);

-- Enable RLS (the edge function writes with the service-role key, which bypasses
-- RLS; these policies cover the client read path and token management)
ALTER TABLE public.health_ingest_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_daily ENABLE ROW LEVEL SECURITY;

-- Ingest tokens: users manage their own token
CREATE POLICY "Users can view own ingest token" ON public.health_ingest_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ingest token" ON public.health_ingest_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ingest token" ON public.health_ingest_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ingest token" ON public.health_ingest_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Health samples: users can only read their own samples
CREATE POLICY "Users can view own health samples" ON public.health_samples
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health samples" ON public.health_samples
  FOR DELETE USING (auth.uid() = user_id);

-- Health daily: users can only read their own aggregates
CREATE POLICY "Users can view own health daily" ON public.health_daily
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health daily" ON public.health_daily
  FOR DELETE USING (auth.uid() = user_id);

-- Keep updated_at fresh
CREATE TRIGGER update_health_daily_updated_at BEFORE UPDATE ON public.health_daily
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
