import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser, mockMeals, mockAnalysisResult } from "@/lib/test-data";
import { uploadMealPhoto, getMealPhotoSignedUrl } from "@/lib/storage";
import { analyzeMeal, AnalyzeMealResponse } from "@/lib/api";
import { getLocalDateString } from "@/lib/date";

// detection_confidence is a NUMERIC column; the AI response gives a label.
const CONFIDENCE_TO_NUMBER: Record<string, number> = {
  high: 0.9,
  medium: 0.6,
  low: 0.3,
};

// Extended response type that includes the meal log ID for corrections
export interface MealLogResult extends AnalyzeMealResponse {
    mealLogId?: string;
}

interface MealLogRow {
  id: string;
  adherence_score: number | null;
  scoring_result: {
    detectedFoods?: AnalyzeMealResponse["detectedFoods"];
    missingRequired?: string[];
    feedback?: string;
    confidence?: AnalyzeMealResponse["confidence"];
    suggestedSwaps?: AnalyzeMealResponse["suggestedSwaps"];
  } | null;
}

/**
 * Fetch a previously saved meal log by ID, for the "tap a logged meal to
 * view its analysis" flow (as opposed to the fresh photo → analysis flow,
 * which already has the result in memory).
 */
export function useMealLog(mealLogId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["meal-log", mealLogId],
    queryFn: async (): Promise<MealLogResult | null> => {
      if (!mealLogId) return null;

      const { data, error } = await supabase
        .from("meal_logs")
        .select("id, adherence_score, scoring_result")
        .eq("id", mealLogId)
        .maybeSingle<MealLogRow>();

      if (error) throw error;
      if (!data) return null;

      const result = data.scoring_result;
      return {
        score: data.adherence_score ?? 0,
        detectedFoods: result?.detectedFoods ?? [],
        missingRequired: result?.missingRequired ?? [],
        feedback: result?.feedback ?? "",
        confidence: result?.confidence ?? "medium",
        suggestedSwaps: result?.suggestedSwaps ?? [],
        mealLogId: data.id,
      };
    },
    enabled: !!mealLogId && !!user && !isTestUser(user?.email),
  });
}

export interface Meal {
    id: string;
    type: "breakfast" | "lunch" | "dinner" | "snack";
    name: string;
    time: string;
    score: number;
    imageUrl?: string;
    foods: string[];
    feedback?: string;
}

export function useMeals(date?: string) {
    const { user } = useAuth();

  return useQuery({
        queryKey: ["meals", user?.id, date],
        queryFn: async () => {
                // Return mock data for test users
          if (isTestUser(user?.email)) {
                    return mockMeals;
          }

          // Fetch real data from database
          if (!user?.id) return [];

          let query = supabase
                  .from("meal_logs")
                  .select(`
                            id,
                                      meal_type,
                                                logged_at,
                                                          adherence_score,
                                                                    photo_path,
                                                                              detected_foods,
                                                                                        scoring_result
                                                                                                `)
                  .eq("user_id", user.id);

          if (date) {
            query = query.eq("local_date", date);
          }

          const { data, error } = await query.order("logged_at", { ascending: false });

          if (error) throw error;

          // Transform database format to app format
          return (data || []).map((meal) => ({
                    id: meal.id,
                    type: meal.meal_type as "breakfast" | "lunch" | "dinner" | "snack",
                    name: meal.meal_type
                      ? meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)
                                : "Meal",
                    time: new Date(meal.logged_at).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                    }),
                    score: meal.adherence_score || 0,
                    imageUrl: meal.photo_path || undefined,
                    foods: meal.detected_foods || [],
                    feedback: (meal.scoring_result as { feedback?: string } | null)?.feedback || undefined,
          }));
        },
        enabled: !!user,
  });
}

export function useTodayMeals() {
    const today = getLocalDateString();
    return useMeals(today);
}

/**
 * Hook for creating a new meal log
 * Handles: photo upload → AI analysis → database insert
 */
export function useCreateMealLog() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

  return useMutation({
        mutationFn: async ({
                photoFile,
                mealType,
                planId,
        }: {
                photoFile: File;
                mealType: string;
                planId?: string;
        }): Promise<MealLogResult> => {
                if (!user?.id) {
                          throw new Error("User not authenticated");
                }

          // Test user path: Return mock data with simulated delay
          if (isTestUser(user.email)) {
                    await new Promise((resolve) => setTimeout(resolve, 2500));
                    return { ...mockAnalysisResult, mealLogId: "mock-meal-id" };
          }

          // Real user path: Upload photo → call Edge Function → save to DB
          try {
                    // Step 1: Upload photo to storage (bucket is private)
                  const { path: photoPath } = await uploadMealPhoto(photoFile);

                  // Step 2: Get a short-lived signed URL so OpenAI can read the photo
                  const signedPhotoUrl = await getMealPhotoSignedUrl(photoPath);

                  // Step 3: Call analyze-meal Edge Function
                  const analysisResult = await analyzeMeal({
                              imageUrl: signedPhotoUrl,
                              mealType,
                              userId: user.id,
                              planId,
                  });

                  const now = new Date();

                  // Step 4: Save to meal_logs table
                  const { data: insertedMeal, error: dbError } = await supabase
                      .from("meal_logs")
                      .insert({
                                    user_id: user.id,
                                    meal_type: mealType,
                                    photo_path: photoPath,
                                    adherence_score: analysisResult.score,
                                    detected_foods: analysisResult.detectedFoods.map((f) => f.name),
                                    detection_confidence: CONFIDENCE_TO_NUMBER[analysisResult.confidence] ?? 0.6,
                                    scoring_result: {
                                                    detectedFoods: analysisResult.detectedFoods,
                                                    missingRequired: analysisResult.missingRequired,
                                                    feedback: analysisResult.feedback,
                                                    confidence: analysisResult.confidence,
                                                    suggestedSwaps: analysisResult.suggestedSwaps,
                                    },
                                    status: "scored",
                                    logged_at: now.toISOString(),
                                    local_date: getLocalDateString(now),
                                    scored_at: now.toISOString(),
                      })
                      .select("id")
                      .single();

                  if (dbError) throw dbError;

                  // Return the analysis result with meal log ID for corrections
                  return {
                              ...analysisResult,
                              mealLogId: insertedMeal?.id,
                  };
          } catch (error) {
                    console.error("Error creating meal log:", error);
                    throw error;
          }
        },
        onSuccess: () => {
                // Invalidate meal + progress queries so the new score shows up immediately
          queryClient.invalidateQueries({ queryKey: ["meals"] });
          queryClient.invalidateQueries({ queryKey: ["daily-progress"] });
          queryClient.invalidateQueries({ queryKey: ["weekly-progress"] });
        },
  });
}
