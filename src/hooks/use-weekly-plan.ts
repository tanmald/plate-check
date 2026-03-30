import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser, mockWeeklyPlan } from "@/lib/test-data";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface WeeklyPlanEntry {
  id: string;
  dayOfWeek: number; // 0=Mon, 6=Sun
  mealType: MealType;
  mealName: string;
  ingredients: string[];
  templateId: string | null;
  notes: string | null;
}

export interface WeeklyPlan {
  id: string;
  weekStartDate: string;
  entries: WeeklyPlanEntry[];
}

// Returns the Monday date string (YYYY-MM-DD) for any given date
export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // shift Sunday back 6 days
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export function useWeeklyPlan(weekStartDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["weekly-plan", user?.id, weekStartDate],
    queryFn: async (): Promise<WeeklyPlan | null> => {
      if (isTestUser(user?.email)) {
        if (mockWeeklyPlan.weekStartDate === weekStartDate) {
          return mockWeeklyPlan as WeeklyPlan;
        }
        return { id: `mock-${weekStartDate}`, weekStartDate, entries: [] };
      }

      if (!user?.id) return null;

      const { data: planData, error: planError } = await supabase
        .from("weekly_meal_plans")
        .select("id, week_start_date")
        .eq("user_id", user.id)
        .eq("week_start_date", weekStartDate)
        .maybeSingle();

      if (planError) throw planError;
      if (!planData) return { id: "", weekStartDate, entries: [] };

      const { data: entries, error: entriesError } = await supabase
        .from("weekly_plan_entries")
        .select("*")
        .eq("plan_id", planData.id)
        .order("day_of_week", { ascending: true });

      if (entriesError) throw entriesError;

      return {
        id: planData.id,
        weekStartDate,
        entries: (entries || []).map((e) => ({
          id: e.id,
          dayOfWeek: e.day_of_week,
          mealType: e.meal_type as MealType,
          mealName: e.meal_name,
          ingredients: e.ingredients || [],
          templateId: e.template_id,
          notes: e.notes,
        })),
      };
    },
    enabled: !!user,
  });
}

interface UpsertEntryInput {
  weekStartDate: string;
  dayOfWeek: number;
  mealType: MealType;
  mealName: string;
  ingredients: string[];
  entryId?: string; // if updating existing
}

export function useUpsertWeeklyPlanEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertEntryInput) => {
      if (isTestUser(user?.email)) {
        await new Promise((r) => setTimeout(r, 400));
        return { id: `mock-entry-${Date.now()}`, ...input };
      }

      if (!user?.id) throw new Error("Not authenticated");

      // Ensure the weekly plan row exists (upsert)
      const { data: plan, error: planError } = await supabase
        .from("weekly_meal_plans")
        .upsert(
          { user_id: user.id, week_start_date: input.weekStartDate },
          { onConflict: "user_id,week_start_date" }
        )
        .select("id")
        .single();

      if (planError) throw planError;

      if (input.entryId) {
        // Update existing entry
        const { data, error } = await supabase
          .from("weekly_plan_entries")
          .update({
            meal_name: input.mealName,
            ingredients: input.ingredients,
          })
          .eq("id", input.entryId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new entry
        const { data, error } = await supabase
          .from("weekly_plan_entries")
          .insert({
            plan_id: plan.id,
            day_of_week: input.dayOfWeek,
            meal_type: input.mealType,
            meal_name: input.mealName,
            ingredients: input.ingredients,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({
        queryKey: ["weekly-plan", user?.id, input.weekStartDate],
      });
    },
  });
}

export function useDeleteWeeklyPlanEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, weekStartDate }: { entryId: string; weekStartDate: string }) => {
      if (isTestUser(user?.email)) {
        await new Promise((r) => setTimeout(r, 300));
        return { entryId, weekStartDate };
      }

      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("weekly_plan_entries")
        .delete()
        .eq("id", entryId);

      if (error) throw error;
      return { entryId, weekStartDate };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["weekly-plan", user?.id, result.weekStartDate],
      });
    },
  });
}
