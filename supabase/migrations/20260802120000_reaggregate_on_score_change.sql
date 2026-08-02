-- The daily-progress trigger only fired when a meal log first reached
-- status = 'scored'. Saving user corrections changes adherence_score while the
-- status stays 'scored', so the day's average silently kept the pre-correction
-- number. Re-aggregate whenever the score changes too.

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
  IF NEW.status = 'scored' AND (
    OLD.status IS NULL
    OR OLD.status != 'scored'
    OR OLD.adherence_score IS DISTINCT FROM NEW.adherence_score
    OR OLD.local_date IS DISTINCT FROM NEW.local_date
  ) THEN
    meal_date := COALESCE(NEW.local_date, DATE(NEW.logged_at));

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
