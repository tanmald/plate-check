import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser, mockPlan, mockParsePlanResponse } from "@/lib/test-data";
import { uploadNutritionPlan } from "@/lib/storage";
import { parseNutritionPlan, ParsePlanResponse } from "@/lib/api";

export interface MealOption {
  number: number;
  description: string;
  foods: string[];
}

export interface MealTemplate {
  id: string;
  type: string;
  icon: string;
  name: string;
  options: MealOption[];
  requiredFoods: string[];
  allowedFoods: string[];
  optionalAddons: string[];
  calories: string;
  protein: string;
  isOptional: boolean;
  isPreWorkout: boolean;
  scheduledTime: string | null;
  referencesMeal: string | null;
  snackTimeCategory: string | null;
}

export interface NutritionPlan {
  id: string;
  name: string;
  uploadedAt: string;
  source: string;
  templates: MealTemplate[];
}

export function useNutritionPlan() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["nutrition-plan", user?.id],
    queryFn: async () => {
      // Return mock data for test users
      if (isTestUser(user?.email)) {
        return { plan: mockPlan, hasPlan: true };
      }

      // Fetch real data from database
      if (!user?.id) return { plan: null, hasPlan: false };

      // Get the most recent confirmed and active nutrition plan
      const { data: planData, error: planError } = await supabase
        .from("nutrition_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError && planError.code !== "PGRST116") throw planError;
      if (!planData) return { plan: null, hasPlan: false };

      // Get meal templates for this plan
      const { data: templatesData, error: templatesError } = await supabase
        .from("meal_templates")
        .select(`
          id,
          type,
          name,
          options,
          required_foods,
          allowed_foods,
          optional_addons,
          calories_min,
          calories_max,
          macros,
          is_optional,
          is_pre_workout,
          scheduled_time,
          references_meal,
          snack_time_category
        `)
        .eq("plan_id", planData.id);

      if (templatesError) throw templatesError;

      // Transform to app format
      const templates: MealTemplate[] = (templatesData || []).map((t) => {
        const mealType = t.type || "meal";
        const proteinFromMacros = t.macros?.protein || "";
        const isPreWorkout = t.is_pre_workout || false;

        return {
          id: t.id,
          type: mealType,
          icon: isPreWorkout ? "💪" : getMealIcon(mealType),
          name: t.name || getMealName(mealType),
          options: (t.options as MealOption[]) || [],
          requiredFoods: t.required_foods || [],
          allowedFoods: t.allowed_foods || [],
          optionalAddons: t.optional_addons || [],
          calories: t.calories_min && t.calories_max
            ? `${t.calories_min}-${t.calories_max}`
            : t.calories_min || t.calories_max || "",
          protein: proteinFromMacros,
          isOptional: t.is_optional || false,
          isPreWorkout: isPreWorkout,
          scheduledTime: t.scheduled_time || null,
          referencesMeal: t.references_meal || null,
          snackTimeCategory: t.snack_time_category || null,
        };
      });

      const plan: NutritionPlan = {
        id: planData.id,
        name: planData.name,
        uploadedAt: new Date(planData.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        source: planData.source || "Uploaded Plan",
        templates,
      };

      return { plan, hasPlan: true };
    },
    enabled: !!user,
  });
}

export function getMealIcon(mealType: string): string {
  const icons: Record<string, string> = {
    breakfast: "☀️",
    lunch: "🌤️",
    dinner: "🌙",
    snack: "🍎",
    fasting: "💧",
  };
  return icons[mealType] || "🍽️";
}

export function getMealName(mealType: string): string {
  const names: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    fasting: "Fasting / Wake-up",
  };
  return names[mealType] || "Meal";
}

/**
 * "fasting" templates (e.g. "drink water on waking") aren't meals a user
 * photographs and logs — exclude them when counting how many meals a plan
 * expects per day.
 */
function isLoggableTemplate(template: MealTemplate): boolean {
  return template.type !== "fasting";
}

export function getLoggableMealCount(plan?: NutritionPlan | null): number | undefined {
  if (!plan) return undefined;
  const count = plan.templates.filter(isLoggableTemplate).length;
  return count > 0 ? count : undefined;
}

/**
 * Plan templates (excluding fasting) whose type has no matching entry in
 * `todayMeals` yet, deduplicated by type — used to show what's still
 * expected today without repeating e.g. multiple snack templates.
 */
export function getUnloggedTemplates(
  plan: NutritionPlan | null | undefined,
  todayMeals: { type: string }[]
): MealTemplate[] {
  if (!plan) return [];
  const loggedTypes = new Set(todayMeals.map((m) => m.type));
  const seenTypes = new Set<string>();

  return plan.templates.filter((t) => {
    if (!isLoggableTemplate(t) || loggedTypes.has(t.type) || seenTypes.has(t.type)) {
      return false;
    }
    seenTypes.add(t.type);
    return true;
  });
}

export function getNextUnloggedTemplate(
  plan: NutritionPlan | null | undefined,
  todayMeals: { type: string }[]
): MealTemplate | undefined {
  return getUnloggedTemplates(plan, todayMeals)[0];
}

/**
 * Rough daily targets derived from the plan's own templates: the midpoint
 * of each template's calorie range summed, and protein summed. Returns null
 * when the plan carries no numeric calorie/protein data at all, so callers
 * can show "no data" instead of a fabricated default.
 */
export function computeDailyTargets(
  templates: MealTemplate[]
): { calories: number; protein: number } | null {
  const loggable = templates.filter(isLoggableTemplate);

  let caloriesSum = 0;
  let hasCalories = false;
  let proteinSum = 0;
  let hasProtein = false;

  for (const t of loggable) {
    if (t.calories) {
      const values = t.calories
        .split("-")
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !Number.isNaN(n));
      if (values.length > 0) {
        caloriesSum += values.reduce((a, b) => a + b, 0) / values.length;
        hasCalories = true;
      }
    }
    if (t.protein) {
      // Split on "-" *before* stripping non-numeric characters, so a range
      // like "20-30g" averages to 25 instead of the digits "20" and "30"
      // being concatenated into 2030 by a single strip-then-parse pass.
      const values = t.protein
        .split("-")
        .map((s) => parseFloat(s.replace(/[^\d.]/g, "")))
        .filter((n) => !Number.isNaN(n));
      if (values.length > 0) {
        proteinSum += values.reduce((a, b) => a + b, 0) / values.length;
        hasProtein = true;
      }
    }
  }

  if (!hasCalories && !hasProtein) return null;

  return {
    calories: hasCalories ? Math.round(caloriesSum) : 0,
    protein: hasProtein ? Math.round(proteinSum) : 0,
  };
}

export function useCreateNutritionPlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planData: { name: string; source: string; templates: MealTemplate[] }) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Create the plan
      const { data: plan, error: planError } = await supabase
        .from("nutrition_plans")
        .insert({
          user_id: user.id,
          name: planData.name,
          source: planData.source,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create templates
      const templates = planData.templates.map((t) => {
        const caloriesParts = t.calories.split("-").map((s) => parseInt(s.trim()) || null);
        const proteinValue = t.protein.replace(/[^\d.-]/g, "");

        return {
          user_id: user.id,
          plan_id: plan.id,
          type: t.type,
          required_foods: t.requiredFoods,
          allowed_foods: t.allowedFoods,
          calories_min: caloriesParts[0] || null,
          calories_max: caloriesParts[1] || caloriesParts[0] || null,
          macros: proteinValue ? { protein: proteinValue } : null,
        };
      });

      const { error: templatesError } = await supabase
        .from("meal_templates")
        .insert(templates);

      if (templatesError) throw templatesError;

      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-plan"] });
    },
  });
}

/**
 * Hook for importing a nutrition plan file
 * Handles: file upload → Edge Function parsing (does NOT save to DB yet)
 * Returns ParsePlanResponse for user review before confirmation
 */
export function useImportNutritionPlan() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ file }: { file: File }): Promise<ParsePlanResponse> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Test user path: Return mock data with simulated delay
      if (isTestUser(user.email)) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return mockParsePlanResponse;
      }

      // Real user path: Upload file → call Edge Function
      try {
        // Step 1: Upload file to storage
        const { path: filePath } = await uploadNutritionPlan(file);

        // Step 2: Get a signed URL for the Edge Function to access
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("nutrition-plans")
          .createSignedUrl(filePath, 3600); // 1 hour

        if (signedUrlError) throw signedUrlError;

        // Step 3: Determine file type for Edge Function
        const fileType = getSimpleFileType(file.type || file.name);

        // Step 4: Call parse-nutrition-plan Edge Function
        const parsedPlan = await parseNutritionPlan({
          fileUrl: signedUrlData.signedUrl,
          userId: user.id,
          fileType,
        });

        return parsedPlan;
      } catch (error) {
        console.error("Error importing nutrition plan:", error);
        throw error;
      }
    },
  });
}

/**
 * Hook for confirming a parsed nutrition plan
 * The Edge Function already created the plan and templates in the database.
 * This hook just marks the plan as confirmed after user review.
 */
export function useConfirmNutritionPlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (parsedPlan: ParsePlanResponse) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      try {
        // Update the nutrition plan to mark it as confirmed
        const { data: plan, error: planError } = await supabase
          .from("nutrition_plans")
          .update({
            is_active: true,
            confirmed_at: new Date().toISOString(),
          })
          .eq("id", parsedPlan.planId)
          .eq("user_id", user.id)
          .select()
          .single();

        if (planError) throw planError;

        return plan;
      } catch (error) {
        console.error("Error confirming nutrition plan:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate nutrition plan queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["nutrition-plan"] });
    },
  });
}

/**
 * Hook for deleting (soft delete) a nutrition plan
 * Sets is_active = false rather than hard deleting to preserve data
 */
export function useDeleteNutritionPlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Test user path: Simulate deletion with delay
      if (isTestUser(user.email)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { success: true };
      }

      // Get the active plan first
      const { data: activePlan, error: fetchError } = await supabase
        .from("nutrition_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!activePlan) {
        throw new Error("No active plan found");
      }

      // Soft delete: Set is_active = false
      const { error: updateError } = await supabase
        .from("nutrition_plans")
        .update({ is_active: false })
        .eq("id", activePlan.id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate nutrition plan queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["nutrition-plan"] });
    },
  });
}

/**
 * Hook for updating a nutrition plan's name
 */
export function useUpdateNutritionPlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, name }: { planId: string; name: string }) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Test user path: Simulate update with delay
      if (isTestUser(user.email)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { success: true };
      }

      const { error } = await supabase
        .from("nutrition_plans")
        .update({ name })
        .eq("id", planId)
        .eq("user_id", user.id);

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-plan"] });
    },
  });
}

/**
 * Helper to detect simple file type for Edge Function
 * Returns "pdf", "image", or "text"
 */
function getSimpleFileType(mimeTypeOrFilename: string): "pdf" | "image" | "text" {
  const str = mimeTypeOrFilename.toLowerCase();

  if (str.includes("pdf") || str.endsWith(".pdf")) {
    return "pdf";
  }

  if (
    str.includes("image") ||
    str.endsWith(".jpg") ||
    str.endsWith(".jpeg") ||
    str.endsWith(".png") ||
    str.endsWith(".gif") ||
    str.endsWith(".webp")
  ) {
    return "image";
  }

  return "text";
}
