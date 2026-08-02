-- Challenges feature: generic task-engine tables + 75 Hard as the launch challenge
-- See docs/FEATURE_CHALLENGES.md for the full spec.

-- Catalog of challenges (seeded below; user-created challenges later)
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- One row per user attempt at a challenge (restarts reuse the same row —
-- see restart_count below and on challenge_daily_logs)
CREATE TABLE public.challenge_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'failed', 'completed', 'abandoned')),
  started_at DATE NOT NULL DEFAULT CURRENT_DATE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  current_day INTEGER NOT NULL DEFAULT 1,
  restart_count INTEGER NOT NULL DEFAULT 0,
  failed_on_day INTEGER,
  failed_reason TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Only one *active* run per user per challenge at a time
CREATE UNIQUE INDEX idx_challenge_enrollments_one_active
  ON public.challenge_enrollments(user_id, challenge_id)
  WHERE status = 'active';

CREATE INDEX idx_challenge_enrollments_user ON public.challenge_enrollments(user_id, status);

-- Per-day task state. Scoped by (enrollment_id, restart_count, day_number)
-- rather than just (enrollment_id, day_number) so a restart's Day 1 doesn't
-- collide with the previous run's Day 1 — history from every run stays
-- queryable for the history grid.
CREATE TABLE public.challenge_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.challenge_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restart_count INTEGER NOT NULL DEFAULT 0,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  tasks JSONB NOT NULL DEFAULT '{}'::jsonb,
  all_complete BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  photo_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (enrollment_id, restart_count, day_number)
);

CREATE INDEX idx_challenge_daily_logs_enrollment ON public.challenge_daily_logs(enrollment_id, restart_count, day_number);

-- Row Level Security
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_daily_logs ENABLE ROW LEVEL SECURITY;

-- Challenges: a readable catalog for any signed-in user, no write access from the client
CREATE POLICY "Anyone signed in can view the challenge catalog" ON public.challenges
  FOR SELECT USING (auth.role() = 'authenticated');

-- Challenge enrollments: owner only (explicit per-action policies, incl. DELETE)
CREATE POLICY "Users can view own enrollments" ON public.challenge_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enrollments" ON public.challenge_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments" ON public.challenge_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own enrollments" ON public.challenge_enrollments
  FOR DELETE USING (auth.uid() = user_id);

-- Challenge daily logs: owner only (explicit per-action policies, incl. DELETE)
CREATE POLICY "Users can view own challenge daily logs" ON public.challenge_daily_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge daily logs" ON public.challenge_daily_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge daily logs" ON public.challenge_daily_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenge daily logs" ON public.challenge_daily_logs
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at triggers (reuses existing update_updated_at_column function)
CREATE TRIGGER trg_challenge_enrollments_updated_at
  BEFORE UPDATE ON public.challenge_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_challenge_daily_logs_updated_at
  BEFORE UPDATE ON public.challenge_daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('challenge-photos', 'challenge-photos', false, 5242880, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own challenge photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'challenge-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own challenge photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'challenge-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own challenge photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'challenge-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own challenge photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'challenge-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Seed the 75 Hard catalog row. Task types are generic (meal_adherence,
-- counter, activity, photo) so a "75 Soft" variant or custom challenges are
-- just different `rules` rows later — no code change needed.
INSERT INTO public.challenges (slug, name, description, duration_days, rules)
VALUES (
  '75-hard',
  '75 Hard',
  'Follow a diet with zero deviations (no alcohol, no cheat meals), drink a gallon of water, complete two 45-minute workouts (one outdoors), read 10 pages of non-fiction, and take a daily progress photo — every day for 75 days. Miss anything and you restart at Day 1.',
  75,
  '{
    "fail_policy": "restart",
    "tasks": [
      { "key": "diet",     "type": "meal_adherence", "label": "Follow your plan, no alcohol, no cheat meals",
        "config": { "min_meal_score": 70, "all_planned_meals_logged": true } },
      { "key": "water",    "type": "counter", "label": "Drink 3.8 L of water",
        "config": { "goal": 3800, "unit": "ml", "quick_add": [250, 500, 750] } },
      { "key": "workout1", "type": "activity", "label": "45-min workout",
        "config": { "min_minutes": 45 } },
      { "key": "workout2", "type": "activity", "label": "45-min workout — outdoors",
        "config": { "min_minutes": 45, "outdoor_required": true } },
      { "key": "reading",  "type": "counter", "label": "Read 10 pages of non-fiction",
        "config": { "goal": 10, "unit": "pages" } },
      { "key": "photo",    "type": "photo", "label": "Progress photo",
        "config": {} }
    ]
  }'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
