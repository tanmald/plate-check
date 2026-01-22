-- Migration: Enhanced meal templates for improved plan parsing
-- Adds support for: meal options, optional meals, pre-workout, meal times, references, snack categories

-- Add new columns to meal_templates
ALTER TABLE public.meal_templates
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS optional_addons TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pre_workout BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS scheduled_time TEXT,
ADD COLUMN IF NOT EXISTS references_meal TEXT,
ADD COLUMN IF NOT EXISTS snack_time_category TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.meal_templates.name IS 'Display name for the meal (e.g., "Breakfast", "Morning Snack")';
COMMENT ON COLUMN public.meal_templates.options IS 'Array of {number, description, foods[]} for numbered meal options (e.g., Option 1, Option 2)';
COMMENT ON COLUMN public.meal_templates.optional_addons IS 'Items marked as optional, "if desired", or "if hungry"';
COMMENT ON COLUMN public.meal_templates.is_optional IS 'True if the entire meal is optional (e.g., "Supper - Optional")';
COMMENT ON COLUMN public.meal_templates.is_pre_workout IS 'True if this is a pre-workout meal/snack';
COMMENT ON COLUMN public.meal_templates.scheduled_time IS 'Extracted time from plan (e.g., "8:00 AM", "upon waking")';
COMMENT ON COLUMN public.meal_templates.references_meal IS 'Reference to another meal if rules are inherited (e.g., "same as lunch")';
COMMENT ON COLUMN public.meal_templates.snack_time_category IS 'For snacks: morning, afternoon, or evening based on time or order';

-- Add new columns to meal_slots (for advanced PRD model)
ALTER TABLE public.meal_slots
ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pre_workout BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS scheduled_time TEXT,
ADD COLUMN IF NOT EXISTS references_slot_name TEXT;

COMMENT ON COLUMN public.meal_slots.is_optional IS 'True if the meal slot is optional';
COMMENT ON COLUMN public.meal_slots.is_pre_workout IS 'True if this is a pre-workout meal/snack';
COMMENT ON COLUMN public.meal_slots.scheduled_time IS 'Scheduled time for this meal slot';
COMMENT ON COLUMN public.meal_slots.references_slot_name IS 'Name of another slot if rules are inherited';

-- Add check constraint for snack_time_category
ALTER TABLE public.meal_templates
ADD CONSTRAINT chk_snack_time_category
CHECK (snack_time_category IS NULL OR snack_time_category IN ('morning', 'afternoon', 'evening'));

-- Add index for filtering by meal type and optional status
CREATE INDEX IF NOT EXISTS idx_meal_templates_type_optional
ON public.meal_templates(type, is_optional);
