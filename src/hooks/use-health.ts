import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useDailyProgress } from "@/hooks/use-progress";
import { isTestUser, mockHealthDaily, mockHealthTrends, mockIngestToken } from "@/lib/test-data";
import { computeActivityScore, computeWellnessScore, type WellnessBreakdownEntry } from "@/lib/health-scoring";

export interface HealthDaily {
  date: string;
  recoveryScore: number | null;
  sleepScore: number | null;
  strainScore: number | null;
  hrvMs: number | null;
  restingHr: number | null;
  respiratoryRate: number | null;
  wristTemp: number | null;
  wristTempDelta: number | null;
  spo2: number | null;
  sleepStart: string | null;
  sleepEnd: string | null;
  sleepDurationMin: number | null;
  sleepDeepMin: number | null;
  sleepRemMin: number | null;
  sleepCoreMin: number | null;
  sleepAwakeMin: number | null;
  sleepEfficiency: number | null;
  steps: number | null;
  activeEnergyKcal: number | null;
  exerciseMinutes: number | null;
  standHours: number | null;
  vo2Max: number | null;
  workouts: Array<Record<string, unknown>>;
  scoreDetail: Record<string, unknown> | null;
}

export interface IngestToken {
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHealthDailyRow(row: any): HealthDaily {
  return {
    date: row.date,
    recoveryScore: row.recovery_score ?? null,
    sleepScore: row.sleep_score ?? null,
    strainScore: row.strain_score ?? null,
    hrvMs: row.hrv_ms ?? null,
    restingHr: row.resting_hr ?? null,
    respiratoryRate: row.respiratory_rate ?? null,
    wristTemp: row.wrist_temp ?? null,
    wristTempDelta: row.wrist_temp_delta ?? null,
    spo2: row.spo2 ?? null,
    sleepStart: row.sleep_start ?? null,
    sleepEnd: row.sleep_end ?? null,
    sleepDurationMin: row.sleep_duration_min ?? null,
    sleepDeepMin: row.sleep_deep_min ?? null,
    sleepRemMin: row.sleep_rem_min ?? null,
    sleepCoreMin: row.sleep_core_min ?? null,
    sleepAwakeMin: row.sleep_awake_min ?? null,
    sleepEfficiency: row.sleep_efficiency ?? null,
    steps: row.steps ?? null,
    activeEnergyKcal: row.active_energy_kcal ?? null,
    exerciseMinutes: row.exercise_minutes ?? null,
    standHours: row.stand_hours ?? null,
    vo2Max: row.vo2_max ?? null,
    workouts: row.workouts ?? [],
    scoreDetail: row.score_detail ?? null,
  };
}

/** Today's health metrics and scores. Test users always get today's mock, regardless of `date`. */
export function useHealthDaily(date?: string) {
  const { user } = useAuth();
  const day = date || new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["health-daily", user?.id, day],
    queryFn: async (): Promise<HealthDaily | null> => {
      if (isTestUser(user?.email)) {
        return mockHealthDaily;
      }
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("health_daily")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", day)
        .maybeSingle();

      if (error) throw error;
      return data ? mapHealthDailyRow(data) : null;
    },
    enabled: !!user,
  });
}

/** Last N days of health metrics, oldest first — for trend charts. */
export function useHealthTrends(days: number = 7) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["health-trends", user?.id, days],
    queryFn: async (): Promise<HealthDaily[]> => {
      if (isTestUser(user?.email)) {
        return mockHealthTrends.slice(-days);
      }
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("health_daily")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(days);

      if (error) throw error;
      return (data ?? []).map(mapHealthDailyRow).reverse();
    },
    enabled: !!user,
  });
}

export interface WellnessScore {
  score: number | null;
  breakdown: WellnessBreakdownEntry[];
  isLoading: boolean;
}

/** Combined wellness score: nutrition adherence + recovery + sleep + activity, renormalized for missing components. */
export function useWellnessScore(): WellnessScore {
  const { data: dailyStats, isLoading: nutritionLoading } = useDailyProgress();
  const { data: healthDaily, isLoading: healthLoading } = useHealthDaily();

  const activity = healthDaily ? computeActivityScore(healthDaily) : { score: null, components: [] };

  const { score, breakdown } = computeWellnessScore({
    nutrition: dailyStats?.dailyScore ?? null,
    recovery: healthDaily?.recoveryScore ?? null,
    sleep: healthDaily?.sleepScore ?? null,
    activity: activity.score,
  });

  return { score, breakdown, isLoading: nutritionLoading || healthLoading };
}

/** The user's Health Auto Export ingest token metadata (never the plaintext or hash). */
export function useIngestToken() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["health-ingest-token", user?.id],
    queryFn: async (): Promise<IngestToken | null> => {
      if (isTestUser(user?.email)) {
        return mockIngestToken;
      }
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("health_ingest_tokens")
        .select("token_prefix, created_at, last_used_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data
        ? { tokenPrefix: data.token_prefix, createdAt: data.created_at, lastUsedAt: data.last_used_at }
        : null;
    },
    enabled: !!user,
  });
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function generateTokenPair(): Promise<{ plaintext: string; hash: string; prefix: string }> {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const plaintext = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { plaintext, hash: await sha256Hex(plaintext), prefix: plaintext.slice(0, 8) };
}

/** Generates (or regenerates) the ingest token. The plaintext is only ever returned here, never stored. */
export function useGenerateIngestToken() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ plaintext: string; prefix: string }> => {
      if (!user) throw new Error("No user logged in");
      const { plaintext, hash, prefix } = await generateTokenPair();

      if (isTestUser(user.email)) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return { plaintext, prefix };
      }

      const { error } = await supabase
        .from("health_ingest_tokens")
        .upsert({ user_id: user.id, token_hash: hash, token_prefix: prefix }, { onConflict: "user_id" });
      if (error) throw error;

      return { plaintext, prefix };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-ingest-token", user?.id] });
    },
  });
}
