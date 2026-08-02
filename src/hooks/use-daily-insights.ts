import { useMemo } from "react";
import { useTodayMeals, type Meal } from "@/hooks/use-meals";
import { useNutritionPlan } from "@/hooks/use-nutrition-plan";

export interface PendingMeal {
  type: string;
  name: string;
  icon: string;
  scheduledTime: string | null;
}

export type InsightTone = "positive" | "warning";

export interface DailyInsight {
  tone: InsightTone;
  /** i18n key under `progress.` */
  key: string;
  values: Record<string, string | number>;
}

/**
 * Derives the day's pending meals and insights from the user's actual plan and
 * logged meals. Replaces the previously hardcoded placeholder content, which
 * could contradict the meals the user had actually logged.
 */
export function useDailyInsights() {
  const { data: meals = [], isLoading: mealsLoading } = useTodayMeals();
  const { data: planData, isLoading: planLoading } = useNutritionPlan();

  const templates = useMemo(
    () => planData?.plan?.templates ?? [],
    [planData?.plan?.templates]
  );

  const pendingMeals = useMemo<PendingMeal[]>(() => {
    if (templates.length === 0) return [];

    const loggedTypes = new Set(meals.map((m) => m.type));

    return templates
      .filter((t) => !t.isOptional && !loggedTypes.has(t.type))
      .map((t) => ({
        type: t.type,
        name: t.name,
        icon: t.icon,
        scheduledTime: t.scheduledTime,
      }));
  }, [templates, meals]);

  const insights = useMemo<DailyInsight[]>(() => {
    if (meals.length === 0) return [];

    const result: DailyInsight[] = [];
    const sorted = [...meals].sort((a, b) => b.score - a.score);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    if (best && best.score >= 70) {
      result.push({
        tone: "positive",
        key: "insight_best_meal",
        values: {
          meal: best.type,
          score: best.score,
          foods: best.foods.slice(0, 3).join(", "),
        },
      });
    }

    // Only call out the worst meal when it is genuinely a different, weak one.
    if (worst && worst.score < 70 && worst.id !== best?.id) {
      result.push({
        tone: "warning",
        key: "insight_low_meal",
        values: { meal: worst.type, score: worst.score },
      });
    } else if (meals.length === 1 && meals[0].score < 70) {
      result.push({
        tone: "warning",
        key: "insight_low_meal",
        values: { meal: meals[0].type, score: meals[0].score },
      });
    }

    if (pendingMeals.length > 0) {
      result.push({
        tone: "warning",
        key: "insight_pending_meals",
        values: { count: pendingMeals.length },
      });
    }

    return result;
  }, [meals, pendingMeals]);

  return {
    meals: meals as Meal[],
    pendingMeals,
    insights,
    totalPlannedMeals: templates.filter((t) => !t.isOptional).length,
    isLoading: mealsLoading || planLoading,
  };
}
