import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser, mockMeals, mockAnalysisResult } from "@/lib/test-data";
import { uploadMealPhoto } from "@/lib/storage";
import { analyzeMeal, AnalyzeMealResponse } from "@/lib/api";
import { confidenceLabelToNumeric, numericToConfidenceLabel, type EditableFood } from "@/lib/scoring";

// Extended response type that includes the meal log ID for corrections
export interface MealLogResult extends AnalyzeMealResponse {
    mealLogId?: string;
    /** Signed URL for the stored meal photo, when reopening a saved meal. */
    photoUrl?: string;
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
                  .eq("user_id", user.id)
                  .order("logged_at", { ascending: false });

          // `date` is a UTC calendar date (YYYY-MM-DD) — bound the query to
          // that day using UTC boundaries, matching how the daily_progress
          // trigger buckets `logged_at` (DATE() casts in the UTC session tz).
          if (date) {
                  const startOfDayUtc = `${date}T00:00:00.000Z`;
                  const nextDay = new Date(startOfDayUtc);
                  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
                  query = query.gte("logged_at", startOfDayUtc).lt("logged_at", nextDay.toISOString());
          }

          const { data, error } = await query;

          if (error) throw error;

          // photo_path is a storage path in a PRIVATE bucket, not a URL —
          // rendering it in an <img> yields a broken image. Sign all paths in
          // one batch call and map path → temporary URL.
          const photoPaths = (data || [])
                  .map((m) => m.photo_path)
                  .filter((p): p is string => !!p);
          const signedUrlByPath = new Map<string, string>();
          if (photoPaths.length > 0) {
                  const { data: signed } = await supabase.storage
                          .from("meal-photos")
                          .createSignedUrls(photoPaths, 3600);
                  for (const entry of signed ?? []) {
                          if (entry.signedUrl && entry.path) {
                                  signedUrlByPath.set(entry.path, entry.signedUrl);
                          }
                  }
          }

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
                    imageUrl: meal.photo_path ? signedUrlByPath.get(meal.photo_path) : undefined,
                    foods: meal.detected_foods || [],
                    feedback: (meal.scoring_result as { feedback?: string } | null)?.feedback || undefined,
          }));
        },
        enabled: !!user,
  });
}

export function useTodayMeals() {
    const today = new Date().toISOString().split("T")[0];
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
                    // Step 1: Upload photo to storage
                  const { path: photoPath, url: photoUrl } = await uploadMealPhoto(photoFile);

                  // Step 2: Call analyze-meal Edge Function
                  const analysisResult = await analyzeMeal({
                              imageUrl: photoUrl,
                              mealType,
                              userId: user.id,
                              planId,
                  });

                  // Step 3: Save to meal_logs table
                  const now = new Date().toISOString();
                  const { data: insertedMeal, error: dbError } = await supabase
                      .from("meal_logs")
                      .insert({
                                    user_id: user.id,
                                    plan_id: planId ?? null,
                                    meal_type: mealType,
                                    photo_path: photoPath,
                                    adherence_score: analysisResult.score,
                                    detected_foods: analysisResult.detectedFoods.map((f) => f.name),
                                    detection_confidence: confidenceLabelToNumeric(analysisResult.confidence),
                                    scoring_result: {
                                                    detectedFoods: analysisResult.detectedFoods,
                                                    feedback: analysisResult.feedback,
                                                    suggestedSwaps: analysisResult.suggestedSwaps,
                                                    missingRequired: analysisResult.missingRequired,
                                    },
                                    // "scored" is what the update_daily_progress DB trigger listens
                                    // for — any other status silently skips daily aggregation.
                                    status: "scored",
                                    scored_at: now,
                                    logged_at: now,
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
                // Invalidate meal queries to refresh the UI
          queryClient.invalidateQueries({ queryKey: ["meals"] });
        },
  });
}

/**
 * Fetch the stored analysis for a single meal log — used when opening a
 * previously saved meal (e.g. from Home/Progress) instead of arriving here
 * straight from the /log flow with the analysis already in memory.
 */
export function useMealLogDetail(mealLogId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["meal-log-detail", mealLogId],
    queryFn: async (): Promise<MealLogResult | null> => {
      if (!mealLogId) return null;

      const { data, error } = await supabase
        .from("meal_logs")
        .select("id, adherence_score, scoring_result, detection_confidence, user_corrections, photo_path")
        .eq("id", mealLogId)
        .single();

      if (error) throw error;

      const scoringResult = (data.scoring_result ?? {}) as {
        detectedFoods?: AnalyzeMealResponse["detectedFoods"];
        feedback?: string;
        suggestedSwaps?: AnalyzeMealResponse["suggestedSwaps"];
        missingRequired?: string[];
      };

      // adherence_score reflects user corrections (when any), but
      // scoring_result keeps the ORIGINAL AI detection as an audit record.
      // Prefer the corrected food list so the reopened meal shows the same
      // foods the corrected score was computed from.
      const corrections = (data.user_corrections as { corrections?: EditableFood[] } | null)
        ?.corrections;
      const detectedFoods = corrections?.length
        ? corrections
            .filter((f) => !f.isDeleted)
            .map((f) => ({
              name: f.name,
              matched: f.matched,
              matchType: f.matchType,
              category: f.category,
              confidence: 1, // user-confirmed
            }))
        : scoringResult.detectedFoods ?? [];

      let photoUrl: string | undefined;
      if (data.photo_path) {
        const { data: signed } = await supabase.storage
          .from("meal-photos")
          .createSignedUrl(data.photo_path, 3600);
        photoUrl = signed?.signedUrl;
      }

      return {
        mealLogId: data.id,
        score: data.adherence_score ?? 0,
        detectedFoods,
        missingRequired: scoringResult.missingRequired ?? [],
        feedback: scoringResult.feedback ?? "",
        confidence: numericToConfidenceLabel(data.detection_confidence),
        suggestedSwaps: scoringResult.suggestedSwaps ?? [],
        photoUrl,
      };
    },
    enabled: !!mealLogId && !isTestUser(user?.email),
  });
}
