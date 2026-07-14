import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import {
  isTestUser,
  mockWeeklyData,
  mockDailyStats,
  mockAdherenceByMealType,
  mockPreviousWeekAverage,
} from "@/lib/test-data";

export interface DailyStats {
  dailyScore: number;
  streak: number;
  weeklyAverage: number;
  mealsLogged: number;
  totalMeals: number;
}

export interface WeeklyDataPoint {
  day: string;
  shortDay: string;
  score: number;
  mealsLogged: number;
  isToday?: boolean;
}

export interface MealTypeAdherence {
  type: "breakfast" | "lunch" | "dinner" | "snack" | string;
  averageScore: number;
  mealsLogged: number;
}

export function useDailyProgress(date?: string) {
  const { user } = useAuth();
  const today = date || new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["daily-progress", user?.id, today],
    queryFn: async () => {
      // Return mock data for test users
      if (isTestUser(user?.email)) {
        return mockDailyStats;
      }

      // Fetch real data from database
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
                        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          dailyScore: 0,
          streak: 0,
          weeklyAverage: 0,
          mealsLogged: 0,
          totalMeals: 4,
        };
      }

      return {
        dailyScore: data.average_score || 0,
        streak: await calculateStreak(user.id),
        weeklyAverage: await calculateWeeklyAverage(user.id),
        mealsLogged: data.meals_logged || 0,
        totalMeals: 4,
      };
    },
    enabled: !!user,
  });
}

export function useWeeklyProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["weekly-progress", user?.id],
    queryFn: async () => {
      // Return mock data for test users
      if (isTestUser(user?.email)) {
        return mockWeeklyData;
      }

      // Fetch real data from database
      if (!user?.id) return [];

      // Get last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);

      const { data, error } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (error) throw error;

      // Create array for all 7 days (fill missing days with 0)
      const weeklyData: WeeklyDataPoint[] = [];
      const todayStr = endDate.toISOString().split("T")[0];

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];

        const dayData = data?.find((d) => d.date === dateStr);
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        const shortDayName = date.toLocaleDateString("en-US", { weekday: "short" });

        weeklyData.push({
          day: dayName,
          shortDay: shortDayName,
          score: dayData?.average_score || 0,
          mealsLogged: dayData?.meals_logged || 0,
          isToday: dateStr === todayStr,
        });
      }

      return weeklyData;
    },
    enabled: !!user,
  });
}

async function calculateStreak(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("daily_progress")
    .select("date, average_score")
    .eq("user_id", userId)
    .gte("average_score", 70) // On plan threshold
    .order("date", { ascending: false })
    .limit(30);

  if (error || !data) return 0;

  let streak = 0;
  // `date` rows are UTC calendar dates written by the `update_daily_progress`
  // DB trigger (`DATE(logged_at)`, cast in the UTC session timezone).
  // Comparing plain date strings here — instead of re-parsing into local
  // Date objects — keeps the streak in the same day-boundary convention as
  // the trigger, avoiding off-by-one-day drift for non-UTC users.
  const todayUtc = new Date();

  for (const day of data) {
    const expectedDate = new Date(Date.UTC(
      todayUtc.getUTCFullYear(),
      todayUtc.getUTCMonth(),
      todayUtc.getUTCDate() - streak
    ));
    const expectedStr = expectedDate.toISOString().split("T")[0];

    if (day.date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

async function calculateWeeklyAverage(userId: string): Promise<number> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);

  const { data, error } = await supabase
    .from("daily_progress")
    .select("average_score")
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().split("T")[0])
    .lte("date", endDate.toISOString().split("T")[0]);

  if (error || !data || data.length === 0) return 0;

  const sum = data.reduce((acc, day) => acc + (day.average_score || 0), 0);
  return Math.round(sum / data.length);
}

/**
 * Per-meal-type average adherence over the last 7 days, for the "Adherence
 * by Meal" breakdown. Meal types with no logs in the window are omitted
 * rather than shown as a fabricated 0%.
 */
export function useAdherenceByMealType() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["adherence-by-meal-type", user?.id],
    queryFn: async (): Promise<MealTypeAdherence[]> => {
      if (isTestUser(user?.email)) {
        return mockAdherenceByMealType;
      }

      if (!user?.id) return [];

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);

      const { data, error } = await supabase
        .from("meal_logs")
        .select("meal_type, adherence_score")
        .eq("user_id", user.id)
        .gte("logged_at", `${startDate.toISOString().split("T")[0]}T00:00:00.000Z`)
        .lt("logged_at", `${endDate.toISOString().split("T")[0]}T23:59:59.999Z`);

      if (error || !data) return [];

      const buckets = new Map<string, { sum: number; count: number }>();
      for (const row of data) {
        const bucket = buckets.get(row.meal_type) ?? { sum: 0, count: 0 };
        bucket.sum += row.adherence_score || 0;
        bucket.count += 1;
        buckets.set(row.meal_type, bucket);
      }

      return Array.from(buckets.entries()).map(([type, { sum, count }]) => ({
        type,
        averageScore: Math.round(sum / count),
        mealsLogged: count,
      }));
    },
    enabled: !!user,
  });
}

/**
 * Average daily_progress score for the 7-day window before the current one.
 * Returns null when there is no prior-week data at all, so callers can hide
 * the "vs last week" trend instead of comparing against a fabricated 0.
 */
export function usePreviousWeekAverage() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["previous-week-average", user?.id],
    queryFn: async (): Promise<number | null> => {
      if (isTestUser(user?.email)) {
        return mockPreviousWeekAverage;
      }

      if (!user?.id) return null;
      return calculatePreviousWeekAverage(user.id);
    },
    enabled: !!user,
  });
}

async function calculatePreviousWeekAverage(userId: string): Promise<number | null> {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 7);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 13);

  const { data, error } = await supabase
    .from("daily_progress")
    .select("average_score")
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().split("T")[0])
    .lte("date", endDate.toISOString().split("T")[0]);

  if (error || !data || data.length === 0) return null;

  const sum = data.reduce((acc, day) => acc + (day.average_score || 0), 0);
  return Math.round(sum / data.length);
}
