import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser } from "@/lib/test-data";

interface TemplateUpdates {
  name?: string;
  scheduledTime?: string | null;
  calories?: string;
  protein?: string;
  isOptional?: boolean;
  isPreWorkout?: boolean;
  requiredFoods?: string[];
  allowedFoods?: string[];
  optionalAddons?: string[];
}

export function useUpdateMealTemplate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      updates,
    }: {
      templateId: string;
      updates: TemplateUpdates;
    }) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Test user path: Simulate update with delay
      if (isTestUser(user.email)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { success: true, templateId };
      }

      // Parse calories into min/max
      let caloriesMin: number | null = null;
      let caloriesMax: number | null = null;
      if (updates.calories) {
        const parts = updates.calories.split("-").map((s) => parseInt(s.trim()));
        caloriesMin = parts[0] || null;
        caloriesMax = parts[1] || parts[0] || null;
      }

      // Parse protein value
      const proteinValue = updates.protein?.replace(/[^\d.-]/g, "") || null;

      // Prepare update payload
      const updatePayload: Record<string, unknown> = {};

      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.scheduledTime !== undefined) updatePayload.scheduled_time = updates.scheduledTime;
      if (updates.isOptional !== undefined) updatePayload.is_optional = updates.isOptional;
      if (updates.isPreWorkout !== undefined) updatePayload.is_pre_workout = updates.isPreWorkout;
      if (updates.requiredFoods !== undefined) updatePayload.required_foods = updates.requiredFoods;
      if (updates.allowedFoods !== undefined) updatePayload.allowed_foods = updates.allowedFoods;
      if (updates.optionalAddons !== undefined) updatePayload.optional_addons = updates.optionalAddons;
      if (updates.calories !== undefined) {
        updatePayload.calories_min = caloriesMin;
        updatePayload.calories_max = caloriesMax;
      }
      if (updates.protein !== undefined) {
        updatePayload.macros = proteinValue ? { protein: proteinValue } : null;
      }

      // Update template in database
      const { data, error } = await supabase
        .from("meal_templates")
        .update(updatePayload)
        .eq("id", templateId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, templateId, data };
    },
    onSuccess: () => {
      // Invalidate nutrition plan queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["nutrition-plan"] });
    },
  });
}

interface CreateTemplateParams {
  planId: string;
  template: {
    type: string;
    name: string;
    scheduledTime?: string | null;
    calories?: string;
    protein?: string;
    isOptional?: boolean;
    isPreWorkout?: boolean;
    requiredFoods: string[];
    allowedFoods: string[];
    optionalAddons: string[];
  };
}

export function useCreateMealTemplate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, template }: CreateTemplateParams) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Test user path: Simulate creation with delay
      if (isTestUser(user.email)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { success: true, id: `mock-${Date.now()}` };
      }

      // Parse calories into min/max
      let caloriesMin: number | null = null;
      let caloriesMax: number | null = null;
      if (template.calories) {
        const parts = template.calories.split("-").map((s) => parseInt(s.trim()));
        caloriesMin = parts[0] || null;
        caloriesMax = parts[1] || parts[0] || null;
      }

      // Parse protein value
      const proteinValue = template.protein?.replace(/[^\d.-]/g, "") || null;

      const { data, error } = await supabase
        .from("meal_templates")
        .insert({
          user_id: user.id,
          plan_id: planId,
          type: template.type || "meal",
          name: template.name,
          scheduled_time: template.scheduledTime || null,
          calories_min: caloriesMin,
          calories_max: caloriesMax,
          macros: proteinValue ? { protein: proteinValue } : null,
          is_optional: template.isOptional || false,
          is_pre_workout: template.isPreWorkout || false,
          required_foods: template.requiredFoods,
          allowed_foods: template.allowedFoods,
          optional_addons: template.optionalAddons,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, id: data.id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-plan"] });
    },
  });
}
