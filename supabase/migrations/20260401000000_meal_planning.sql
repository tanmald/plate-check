-- Weekly meal planning and shopping list tables

-- Weekly meal plan: one row per user per week
CREATE TABLE public.weekly_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- One row per meal slot per day within a weekly plan
CREATE TABLE public.weekly_plan_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.weekly_meal_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Mon, 6=Sun
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_name TEXT NOT NULL,
  ingredients TEXT[] DEFAULT '{}',
  template_id UUID REFERENCES public.meal_templates(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping list: one per user per week, shared with collaborators
CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_plan_id UUID REFERENCES public.weekly_meal_plans(id) ON DELETE SET NULL,
  week_start_date DATE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Lista de compras',
  share_code TEXT UNIQUE DEFAULT upper(left(replace(gen_random_uuid()::text, '-', ''), 6)),
  collaborator_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual shopping list items (granular rows enable Realtime per-item updates)
CREATE TABLE public.shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Outros',
  quantity TEXT,
  checked BOOLEAN NOT NULL DEFAULT false,
  checked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source_days TEXT[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_weekly_meal_plans_user ON public.weekly_meal_plans(user_id, week_start_date DESC);
CREATE INDEX idx_weekly_plan_entries_plan ON public.weekly_plan_entries(plan_id, day_of_week);
CREATE INDEX idx_shopping_lists_user ON public.shopping_lists(user_id, week_start_date DESC);
CREATE INDEX idx_shopping_lists_share_code ON public.shopping_lists(share_code);
CREATE INDEX idx_shopping_list_items_list ON public.shopping_list_items(list_id, sort_order);

-- Row Level Security
ALTER TABLE public.weekly_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plan_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- weekly_meal_plans: only owner
CREATE POLICY "own_weekly_plans"
  ON public.weekly_meal_plans FOR ALL
  USING (auth.uid() = user_id);

-- weekly_plan_entries: only owner (via parent plan)
CREATE POLICY "own_weekly_entries"
  ON public.weekly_plan_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.weekly_meal_plans
      WHERE id = weekly_plan_entries.plan_id AND user_id = auth.uid()
    )
  );

-- shopping_lists: owner OR collaborator
CREATE POLICY "list_access"
  ON public.shopping_lists FOR ALL
  USING (
    auth.uid() = user_id OR
    auth.uid() = ANY(collaborator_ids)
  );

-- shopping_list_items: owner OR collaborator (via parent list)
CREATE POLICY "list_items_access"
  ON public.shopping_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE id = shopping_list_items.list_id
        AND (user_id = auth.uid() OR auth.uid() = ANY(collaborator_ids))
    )
  );

-- updated_at triggers (reuses existing update_updated_at_column function)
CREATE TRIGGER trg_weekly_meal_plans_updated_at
  BEFORE UPDATE ON public.weekly_meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_weekly_plan_entries_updated_at
  BEFORE UPDATE ON public.weekly_plan_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_shopping_list_items_updated_at
  BEFORE UPDATE ON public.shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
