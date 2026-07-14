-- The on_meal_scored trigger only re-aggregated daily_progress when a meal
-- log's status TRANSITIONED to 'scored'. User corrections (use-update-meal-log)
-- change adherence_score on a row whose status is already 'scored', so the
-- day's average/buckets silently went stale after any correction.
--
-- This replaces the trigger function so it also fires when adherence_score
-- changes while the row is already scored. The aggregation body is unchanged
-- from the initial schema migration.
--
-- NOT applied against a live database in this session — review and test in
-- staging before deploying to production.

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
  -- Fire on the transition to 'scored' (first scoring) OR when the score of
  -- an already-scored meal changes (user corrections).
  IF NEW.status = 'scored' AND (
       OLD.status IS DISTINCT FROM 'scored'
       OR NEW.adherence_score IS DISTINCT FROM OLD.adherence_score
     ) THEN
    meal_date := DATE(NEW.logged_at);

    SELECT
      ROUND(AVG(adherence_score)),
      COUNT(*),
      COUNT(*) FILTER (WHERE adherence_score >= 70),
      COUNT(*) FILTER (WHERE adherence_score >= 40 AND adherence_score < 70),
      COUNT(*) FILTER (WHERE adherence_score < 40)
    INTO total_score, meal_count, on_plan_count, needs_attention_count, off_plan_count
    FROM public.meal_logs
    WHERE user_id = NEW.user_id
      AND DATE(logged_at) = meal_date
      AND status = 'scored';

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
