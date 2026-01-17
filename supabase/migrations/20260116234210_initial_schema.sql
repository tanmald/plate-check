-- Note: Using gen_random_uuid() which is built-in to PostgreSQL (no extension needed)

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plan uploads (raw files)
CREATE TABLE public.plan_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded', -- uploaded, ocr_completed, parsed, confirmed
  extracted_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition plans (parsed structure)
CREATE TABLE public.nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES public.plan_uploads(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  source TEXT, -- e.g., "Dr. Smith Nutrition Clinic"
  daily_targets JSONB, -- { calories: 1800, protein: 120, carbs: 180, fat: 60 }
  is_active BOOLEAN DEFAULT true,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal slots (PRD Section 7.3.2: MealSlot)
CREATE TABLE public.meal_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.nutrition_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Breakfast", "Lunch", "Dinner", "Snack"
  time_window TEXT, -- e.g., "6:00 AM - 10:00 AM"
  icon TEXT, -- emoji icon
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Options (PRD Section 7.3.2: Option)
-- Multiple options per meal slot (e.g., Option 1, Option 2)
CREATE TABLE public.meal_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_slot_id UUID NOT NULL REFERENCES public.meal_slots(id) ON DELETE CASCADE,
  option_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meal_slot_id, option_number)
);

-- Constraints (PRD Section 7.3.2: Constraint)
CREATE TABLE public.meal_constraints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES public.meal_options(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'required', 'allowed', 'disallowed', 'portion', 'macro'
  target TEXT, -- food name or category
  portion_value NUMERIC,
  portion_unit TEXT, -- 'grams', 'oz', 'cups', 'tbsp', 'pieces'
  is_approximate BOOLEAN DEFAULT false,
  raw_text TEXT, -- original text from plan
  confidence NUMERIC DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- References (PRD Section 7.3.2: Reference)
-- Cross-references between meal slots (e.g., "same as lunch protein")
CREATE TABLE public.meal_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_slot_id UUID NOT NULL REFERENCES public.meal_slots(id) ON DELETE CASCADE,
  target_slot_id UUID NOT NULL REFERENCES public.meal_slots(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'same_as', 'similar_to', 'excluding'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal templates (simplified view for scoring)
CREATE TABLE public.meal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.nutrition_plans(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.meal_options(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  required_foods TEXT[] DEFAULT '{}',
  allowed_foods TEXT[] DEFAULT '{}',
  disallowed_foods TEXT[] DEFAULT '{}',
  calories_min INTEGER,
  calories_max INTEGER,
  macros JSONB, -- { protein: 30, carbs: 45, fat: 15 }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal logs (user's logged meals)
CREATE TABLE public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  photo_path TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded', -- uploaded, foods_detected, scored
  detected_foods JSONB, -- [{ name, confidence, category, matched }]
  detection_confidence NUMERIC,
  adherence_score INTEGER,
  scoring_result JSONB, -- full ScoringResult object
  user_corrections JSONB, -- user edits to detected foods
  notes TEXT,
  scored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily progress aggregations (for performance)
CREATE TABLE public.daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  average_score INTEGER,
  meals_logged INTEGER DEFAULT 0,
  meals_on_plan INTEGER DEFAULT 0, -- score >= 70
  meals_needs_attention INTEGER DEFAULT 0, -- score 40-69
  meals_off_plan INTEGER DEFAULT 0, -- score < 40
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Weekly progress aggregations
CREATE TABLE public.weekly_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  average_score INTEGER,
  meals_logged INTEGER DEFAULT 0,
  meals_on_plan INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- Indexes for performance
CREATE INDEX idx_plan_uploads_user_id ON public.plan_uploads(user_id);
CREATE INDEX idx_nutrition_plans_user_id ON public.nutrition_plans(user_id);
CREATE INDEX idx_meal_slots_plan_id ON public.meal_slots(plan_id);
CREATE INDEX idx_meal_options_slot_id ON public.meal_options(meal_slot_id);
CREATE INDEX idx_meal_constraints_option_id ON public.meal_constraints(option_id);
CREATE INDEX idx_meal_templates_user_id ON public.meal_templates(user_id);
CREATE INDEX idx_meal_templates_plan_id ON public.meal_templates(plan_id);
CREATE INDEX idx_meal_logs_user_id ON public.meal_logs(user_id);
CREATE INDEX idx_meal_logs_logged_at ON public.meal_logs(logged_at DESC);
CREATE INDEX idx_daily_progress_user_date ON public.daily_progress(user_id, date DESC);
CREATE INDEX idx_weekly_progress_user_date ON public.weekly_progress(user_id, week_start_date DESC);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_progress ENABLE ROW LEVEL SECURITY;

-- User profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Plan uploads: users can only see/manage their own uploads
CREATE POLICY "Users can view own plan uploads" ON public.plan_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plan uploads" ON public.plan_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plan uploads" ON public.plan_uploads
  FOR UPDATE USING (auth.uid() = user_id);

-- Nutrition plans: users can only see/manage their own plans
CREATE POLICY "Users can view own plans" ON public.nutrition_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" ON public.nutrition_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON public.nutrition_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Meal slots: users can only see slots from their plans
CREATE POLICY "Users can view meal slots from own plans" ON public.meal_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.nutrition_plans
      WHERE id = meal_slots.plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert meal slots to own plans" ON public.meal_slots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nutrition_plans
      WHERE id = meal_slots.plan_id AND user_id = auth.uid()
    )
  );

-- Meal options: users can only see options from their plans
CREATE POLICY "Users can view meal options from own plans" ON public.meal_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_slots
      JOIN public.nutrition_plans ON meal_slots.plan_id = nutrition_plans.id
      WHERE meal_options.meal_slot_id = meal_slots.id AND nutrition_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert meal options to own plans" ON public.meal_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_slots
      JOIN public.nutrition_plans ON meal_slots.plan_id = nutrition_plans.id
      WHERE meal_options.meal_slot_id = meal_slots.id AND nutrition_plans.user_id = auth.uid()
    )
  );

-- Meal constraints: users can only see constraints from their plans
CREATE POLICY "Users can view meal constraints from own plans" ON public.meal_constraints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_options
      JOIN public.meal_slots ON meal_options.meal_slot_id = meal_slots.id
      JOIN public.nutrition_plans ON meal_slots.plan_id = nutrition_plans.id
      WHERE meal_constraints.option_id = meal_options.id AND nutrition_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert meal constraints to own plans" ON public.meal_constraints
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_options
      JOIN public.meal_slots ON meal_options.meal_slot_id = meal_slots.id
      JOIN public.nutrition_plans ON meal_slots.plan_id = nutrition_plans.id
      WHERE meal_constraints.option_id = meal_options.id AND nutrition_plans.user_id = auth.uid()
    )
  );

-- Meal references: users can only see references from their plans
CREATE POLICY "Users can view meal references from own plans" ON public.meal_references
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_slots
      JOIN public.nutrition_plans ON meal_slots.plan_id = nutrition_plans.id
      WHERE meal_references.source_slot_id = meal_slots.id AND nutrition_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert meal references to own plans" ON public.meal_references
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_slots
      JOIN public.nutrition_plans ON meal_slots.plan_id = nutrition_plans.id
      WHERE meal_references.source_slot_id = meal_slots.id AND nutrition_plans.user_id = auth.uid()
    )
  );

-- Meal templates: users can only see/manage their own templates
CREATE POLICY "Users can view own meal templates" ON public.meal_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal templates" ON public.meal_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal templates" ON public.meal_templates
  FOR UPDATE USING (auth.uid() = user_id);

-- Meal logs: users can only see/manage their own logs
CREATE POLICY "Users can view own meal logs" ON public.meal_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal logs" ON public.meal_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal logs" ON public.meal_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily progress: users can only see their own progress
CREATE POLICY "Users can view own daily progress" ON public.daily_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily progress" ON public.daily_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily progress" ON public.daily_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Weekly progress: users can only see their own progress
CREATE POLICY "Users can view own weekly progress" ON public.weekly_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly progress" ON public.weekly_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly progress" ON public.weekly_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_uploads_updated_at BEFORE UPDATE ON public.plan_uploads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_plans_updated_at BEFORE UPDATE ON public.nutrition_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_templates_updated_at BEFORE UPDATE ON public.meal_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_logs_updated_at BEFORE UPDATE ON public.meal_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_progress_updated_at BEFORE UPDATE ON public.daily_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_progress_updated_at BEFORE UPDATE ON public.weekly_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update daily progress when meal is scored
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
    meal_date := DATE(NEW.logged_at);

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
      AND DATE(logged_at) = meal_date
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

CREATE TRIGGER on_meal_scored
  AFTER INSERT OR UPDATE ON public.meal_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_progress();
