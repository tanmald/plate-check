-- Flexible challenge mode: a second catalog entry whose runs never fail.
--
-- The original 75 Hard is all-or-nothing by design (miss a task at midnight →
-- back to Day 1). This adds a variant that tracks the same six tasks but
-- treats a missed day as just a paler square in the heatmap, so a single
-- skipped evening walk doesn't erase weeks of history. Both challenges live
-- side by side; the user picks one at enrollment.
--
-- No new columns: per-day intensity is derived from the existing
-- `challenge_daily_logs.tasks` JSONB at read time.

-- The original index was scoped per-challenge, which was correct while the
-- catalog held a single row. With two challenges it would permit two
-- concurrently-active enrollments, and `useActiveChallenge` reads them with
-- `.maybeSingle()` — which errors on more than one row. Make "one active run
-- at a time" a real constraint rather than a UI convention.
DROP INDEX IF EXISTS idx_challenge_enrollments_one_active;
CREATE UNIQUE INDEX idx_challenge_enrollments_one_active
  ON public.challenge_enrollments(user_id)
  WHERE status = 'active';

-- Same six tasks and configs as 75-hard; only `fail_policy` differs.
INSERT INTO public.challenges (slug, name, description, duration_days, rules)
VALUES (
  '75-flex',
  '75 Flexible',
  'The same six daily habits as 75 Hard — follow your plan, drink a gallon of water, two 45-minute workouts (one outdoors), 10 pages of non-fiction, and a progress photo — but missing a day never ends the run. You still finish on Day 75, and you see exactly how many days you completed.',
  75,
  '{
    "fail_policy": "none",
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
