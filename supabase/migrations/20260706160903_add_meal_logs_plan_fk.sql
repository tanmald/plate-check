-- Adds meal_logs.plan_id so a scored meal log can be traced back to the plan
-- it was scored against (useful for auditing and for plan versioning later).
--
-- meal_template_id is intentionally NOT added yet: a plan can have multiple
-- templates of the same meal type (e.g. two snack options), and the
-- analyze-meal edge function does not currently pick one specific template
-- as "the" match — it scores against all templates of that type. Wiring up a
-- specific template reference needs an edge-function change first.
--
-- Note: docs/APP_REVIEW.md also flags meal_slots/meal_options/meal_constraints/
-- meal_references and weekly_progress as dead schema (nothing in the app
-- reads or writes them — confirmed via repo-wide search). Dropping them is
-- deliberately NOT part of this migration; that's a separate, explicitly-
-- confirmed decision given it's an irreversible data-destroying change.
--
-- NOT applied against a live database in this session (no Supabase
-- credentials/CLI available here) — review and test in staging before
-- deploying to production.

ALTER TABLE public.meal_logs
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.nutrition_plans(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_meal_logs_plan_id ON public.meal_logs(plan_id);
