import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser, mockMeals, mockAnalysisResult } from "@/lib/test-data";
import { uploadMealPhoto } from "@/lib/storage";
import { analyzeMeal, AnalyzeMealResponse } from "@/lib/api";

// Extended response type that includes the meal log ID for corrections
export interface MealLogResult extends AnalyzeMealResponse {
  mealLogId?: string;
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

      const { data, error } = await supabase
        .from("meal_logs")
        .select(`
          id,
          meal_type,
          meal_name,
          logged_at,
          adherence_score,
          photo_url,
          detected_foods,
          ai_feedback
        `)
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false });

      if (error) throw error;

      // Transform database format to app format
      return (data || []).map((meal) => ({
        id: meal.id,
        type: meal.meal_type as "breakfast" | "lunch" | "dinner" | "snack",
        name: meal.meal_name || "Meal",
        time: new Date(meal.logged_at).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        score: meal.adherence_score || 0,
        imageUrl: meal.photo_url || undefined,
        foods: meal.detected_foods || [],
        feedback: meal.ai_feedback || undefined,
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
        const { data: insertedMeal, error: dbError } = await supabase
          .from("meal_logs")
          .insert({
            user_id: user.id,
            meal_type: mealType,
            meal_name: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
            photo_path: photoPath,
            photo_url: photoUrl,
            adherence_score: analysisResult.score,
            detected_foods: analysisResult.detectedFoods.map((f) => f.name),
            detection_confidence: analysisResult.confidence,
            scoring_result: {
              detectedFoods: analysisResult.detectedFoods,
              feedback: analysisResult.feedback,
              suggestedSwaps: analysisResult.suggestedSwaps,
            },
            ai_feedback: analysisResult.feedback,
            status: "completed",
            logged_at: new Date().toISOString(),
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
