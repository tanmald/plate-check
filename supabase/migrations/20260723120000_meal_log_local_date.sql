-- Fix P0 #7 (day-boundary mismatch): daily_progress was bucketed by
-- DATE(logged_at), which is UTC, while the client's streak/label logic used
-- the user's local timezone. Add a local_date column the client sets at
-- insert time, and bucket the daily-progress trigger by it instead.

ALTER TABLE public.meal_logs ADD COLUMN local_date DATE;

CREATE INDEX idx_meal_logs_user_local_date ON public.meal_logs(user_id, local_date);

-- Backfill existing rows with their UTC date as a best-effort default.
UPDATE public.meal_logs SET local_date = DATE(logged_at) WHERE local_date IS NULL;

CREATE OR REPLACE FUNCTION update_daily_progress()
RETURNS TRIGGER AS $$
DECLARE
  meal_date DATE;
  total_score INTEGER;
  meal_count INTEGER;
  on_plan_count INTEGER;
  needs_attention_count INTEGER;
  off_plan_count INTEGER;
BEGIN
  -- Only trigger when status changes to 'scored'
  IF NEW.status = 'scored' AND (OLD.status IS NULL OR OLD.status != 'scored') THEN
    meal_date := COALESCE(NEW.local_date, DATE(NEW.logged_at));

    -- Calculate aggregates for the day
    SELECT
      ROUND(AVG(adherence_score)),
      COUNT(*),
      COUNT(*) FILTER (WHERE adherence_score >= 70),
      COUNT(*) FILTER (WHERE adherence_score >= 40 AND adherence_score < 70),
      COUNT(*) FILTER (WHERE adherence_score < 40)
    INTO total_score, meal_count, on_plan_count, needs_attention_count, off_plan_count
    FROM public.meal_logs
    WHERE user_id = NEW.user_id
      AND COALESCE(local_date, DATE(logged_at)) = meal_date
      AND status = 'scored';

    -- Upsert daily progress
    INSERT INTO public.daily_progress (
      user_id, date, average_score, meals_logged,
      meals_on_plan, meals_needs_attention, meals_off_plan
    )
    VALUES (
      NEW.user_id, meal_date, total_score, meal_count,
      on_plan_count, needs_attention_count, off_plan_count
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
      average_score = EXCLUDED.average_score,
      meals_logged = EXCLUDED.meals_logged,
      meals_on_plan = EXCLUDED.meals_on_plan,
      meals_needs_attention = EXCLUDED.meals_needs_attention,
      meals_off_plan = EXCLUDED.meals_off_plan,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
