import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser, mockWeeklyData, mockDailyStats } from "@/lib/test-data";

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
        dailyScore: data.daily_adherence_score || 0,
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
          score: dayData?.daily_adherence_score || 0,
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
    .select("date, daily_adherence_score")
    .eq("user_id", userId)
    .gte("daily_adherence_score", 70) // On plan threshold
    .order("date", { ascending: false })
    .limit(30);

  if (error || !data) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const day of data) {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - streak);

    if (dayDate.getTime() === expectedDate.getTime()) {
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
    .select("daily_adherence_score")
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().split("T")[0])
    .lte("date", endDate.toISOString().split("T")[0]);

  if (error || !data || data.length === 0) return 0;

  const sum = data.reduce((acc, day) => acc + (day.daily_adherence_score || 0), 0);
  return Math.round(sum / data.length);
}
