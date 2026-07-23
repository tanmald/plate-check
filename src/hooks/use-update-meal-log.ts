import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser } from "@/lib/test-data";
import type { EditableFood } from "@/lib/scoring";

interface UpdateMealLogParams {
  id: string;
  userCorrections: EditableFood[];
  correctedScore: number;
}

/**
 * Hook for updating a meal log with user corrections
 */
export function useUpdateMealLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      userCorrections,
      correctedScore,
    }: UpdateMealLogParams) => {
      // Skip database updates for test users
      if (isTestUser(user?.email)) {
        return { success: true };
      }

      const activeFoods = userCorrections.filter((f) => !f.isDeleted);

      const { error } = await supabase
        .from("meal_logs")
        .update({
          user_corrections: {
            corrections: userCorrections,
            correctedAt: new Date().toISOString(),
          },
          adherence_score: correctedScore,
          detected_foods: activeFoods.map((f) => f.name),
        })
        .eq("id", id);

      if (error) throw error;

      return { success: true };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      // The corrected score changes everything derived from this log: the
      // stored per-meal detail, the day/week aggregates, and the per-meal-type
      // breakdown. Invalidating only ["meals"] left all of those stale.
      queryClient.invalidateQueries({ queryKey: ["meal-log-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["daily-progress"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-progress"] });
      queryClient.invalidateQueries({ queryKey: ["adherence-by-meal-type"] });
      queryClient.invalidateQueries({ queryKey: ["previous-week-average"] });
    },
  });
}
