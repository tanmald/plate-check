-- Migration: Add DELETE RLS policies for nutrition plans and meal templates
-- This allows users to delete their own nutrition plans

-- Policy for deleting nutrition plans
CREATE POLICY "Users can delete own nutrition plans"
  ON nutrition_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Policy for deleting meal templates
CREATE POLICY "Users can delete own meal templates"
  ON meal_templates FOR DELETE
  USING (auth.uid() = user_id);
