import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser, mockChallengeCatalog, mockActiveChallengeData, mockChallengeHistory } from "@/lib/test-data";
import { uploadChallengePhoto } from "@/lib/storage";
import type { Json } from "@/types/database.types";

export type ChallengeTaskType = "meal_adherence" | "counter" | "activity" | "photo";

export interface ChallengeTaskConfig {
  min_meal_score?: number;
  all_planned_meals_logged?: boolean;
  goal?: number;
  unit?: string;
  quick_add?: number[];
  min_minutes?: number;
  outdoor_required?: boolean;
}

export interface ChallengeTaskDef {
  key: string;
  type: ChallengeTaskType;
  label: string;
  config: ChallengeTaskConfig;
}

export interface ChallengeRules {
  fail_policy: "restart" | "lose_day";
  tasks: ChallengeTaskDef[];
}

export interface ChallengeCatalogEntry {
  id: string;
  slug: string;
  name: string;
  description: string;
  durationDays: number;
  rules: ChallengeRules;
}

export interface ChallengeTaskState {
  done: boolean;
  auto?: boolean;
  value?: number;
  minutes?: number;
  outdoor?: boolean;
  note?: string;
  book?: string;
  photo_path?: string;
  meals_scored?: number;
  meals_required?: number;
  min_score?: number;
  no_alcohol_confirmed?: boolean;
}

export interface ChallengeEnrollment {
  id: string;
  challengeId: string;
  status: "active" | "failed" | "completed" | "abandoned";
  startedAt: string;
  timezone: string;
  currentDay: number;
  restartCount: number;
  failedOnDay: number | null;
  failedReason: string | null;
  completedAt: string | null;
}

export interface ChallengeDailyLog {
  id: string;
  enrollmentId: string;
  restartCount: number;
  dayNumber: number;
  date: string;
  tasks: Record<string, ChallengeTaskState>;
  allComplete: boolean;
  completedAt: string | null;
  photoPath: string | null;
}

export interface ActiveChallengeData {
  enrollment: ChallengeEnrollment;
  challenge: ChallengeCatalogEntry;
  todayLog: ChallengeDailyLog | null;
}

// ─── Mapping helpers (DB row → app shape) ──────────────────────────────────

function mapChallenge(row: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  duration_days: number;
  rules: Json;
}): ChallengeCatalogEntry {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || "",
    durationDays: row.duration_days,
    rules: (row.rules as unknown as ChallengeRules) || { fail_policy: "restart", tasks: [] },
  };
}

function mapEnrollment(row: {
  id: string;
  challenge_id: string;
  status: string;
  started_at: string;
  timezone: string;
  current_day: number;
  restart_count: number;
  failed_on_day: number | null;
  failed_reason: string | null;
  completed_at: string | null;
}): ChallengeEnrollment {
  return {
    id: row.id,
    challengeId: row.challenge_id,
    status: row.status as ChallengeEnrollment["status"],
    startedAt: row.started_at,
    timezone: row.timezone,
    currentDay: row.current_day,
    restartCount: row.restart_count,
    failedOnDay: row.failed_on_day,
    failedReason: row.failed_reason,
    completedAt: row.completed_at,
  };
}

function mapDailyLog(row: {
  id: string;
  enrollment_id: string;
  restart_count: number;
  day_number: number;
  date: string;
  tasks: Json;
  all_complete: boolean;
  completed_at: string | null;
  photo_path: string | null;
}): ChallengeDailyLog {
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    restartCount: row.restart_count,
    dayNumber: row.day_number,
    date: row.date,
    tasks: (row.tasks as unknown as Record<string, ChallengeTaskState>) || {},
    allComplete: row.all_complete,
    completedAt: row.completed_at,
    photoPath: row.photo_path,
  };
}

// ─── Local-date / rollover helpers ─────────────────────────────────────────

/** Today's calendar date (YYYY-MM-DD) in the given IANA timezone. */
export function localDateString(timezone: string, date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

function nextDayIso(date: string): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

function isTaskDone(tasks: Record<string, ChallengeTaskState>, key: string): boolean {
  return tasks[key]?.done === true;
}

function computeAllComplete(tasks: Record<string, ChallengeTaskState>, taskDefs: ChallengeTaskDef[]): boolean {
  return taskDefs.length > 0 && taskDefs.every((def) => isTaskDone(tasks, def.key));
}

function firstIncompleteLabel(tasks: Record<string, ChallengeTaskState>, taskDefs: ChallengeTaskDef[]): string {
  const missing = taskDefs.find((def) => !isTaskDone(tasks, def.key));
  return missing ? missing.label : "a task";
}

/** Non-fasting meal template count for the user's active plan — how many logged meals the diet task needs today. */
async function getRequiredMealCount(userId: string): Promise<number> {
  const { data: plan } = await supabase
    .from("nutrition_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan) return 1;

  const { data: templates } = await supabase
    .from("meal_templates")
    .select("type")
    .eq("plan_id", plan.id);

  const count = (templates || []).filter((t) => t.type !== "fasting").length;
  return count > 0 ? count : 1;
}

async function fetchDailyLogRow(enrollmentId: string, restartCount: number, dayNumber: number) {
  const { data, error } = await supabase
    .from("challenge_daily_logs")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .eq("restart_count", restartCount)
    .eq("day_number", dayNumber)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function ensureDailyLogRow(params: {
  enrollmentId: string;
  userId: string;
  restartCount: number;
  dayNumber: number;
  date: string;
}) {
  const existing = await fetchDailyLogRow(params.enrollmentId, params.restartCount, params.dayNumber);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("challenge_daily_logs")
    .insert({
      enrollment_id: params.enrollmentId,
      user_id: params.userId,
      restart_count: params.restartCount,
      day_number: params.dayNumber,
      date: params.date,
      tasks: {},
      all_complete: false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 * Recomputes the diet task from today's `meal_logs` (auto-verification —
 * the feature's differentiator) and refreshes `all_complete`. Degrades
 * gracefully without meal-slot awareness: requires N meals logged (N = the
 * plan's non-fasting template count) all scoring ≥ the task's min_score.
 */
async function syncDietTaskAndCompletion(
  log: NonNullable<Awaited<ReturnType<typeof fetchDailyLogRow>>>,
  taskDefs: ChallengeTaskDef[],
  userId: string
) {
  const tasks: Record<string, ChallengeTaskState> = { ...(log.tasks as unknown as Record<string, ChallengeTaskState>) };
  const dietDef = taskDefs.find((t) => t.type === "meal_adherence");

  if (dietDef) {
    const minScore = dietDef.config.min_meal_score ?? 70;
    const requiredCount = await getRequiredMealCount(userId);

    const { data: meals } = await supabase
      .from("meal_logs")
      .select("adherence_score")
      .eq("user_id", userId)
      .eq("status", "scored")
      .gte("logged_at", `${log.date}T00:00:00.000Z`)
      .lt("logged_at", nextDayIso(log.date));

    const scores = (meals || []).map((m) => m.adherence_score ?? 0);
    const mealsScored = scores.length;
    const allAboveMin = scores.length > 0 && scores.every((s) => s >= minScore);
    const noAlcoholConfirmed = tasks.diet?.no_alcohol_confirmed ?? false;

    tasks.diet = {
      done: mealsScored >= requiredCount && allAboveMin && noAlcoholConfirmed,
      auto: true,
      meals_scored: mealsScored,
      meals_required: requiredCount,
      min_score: minScore,
      no_alcohol_confirmed: noAlcoholConfirmed,
    };
  }

  const allComplete = computeAllComplete(tasks, taskDefs);
  const tasksChanged = JSON.stringify(tasks) !== JSON.stringify(log.tasks);

  if (!tasksChanged && allComplete === log.all_complete) {
    return log;
  }

  const { data: updated, error } = await supabase
    .from("challenge_daily_logs")
    .update({
      tasks: tasks as unknown as Json,
      all_complete: allComplete,
      completed_at: allComplete ? (log.completed_at ?? new Date().toISOString()) : null,
    })
    .eq("id", log.id)
    .select("*")
    .single();
  if (error) throw error;
  return updated;
}

/**
 * Client-side day-rollover judge (see docs/FEATURE_CHALLENGES.md §3
 * "Day evaluation mechanics"): on every load, evaluate any calendar days
 * that have fully elapsed in the enrollment's timezone since it was last
 * advanced. A day with any incomplete task at rollover fails the run;
 * clearing every elapsed day advances current_day (or completes the run).
 */
async function evaluateAndAdvance(
  enrollment: ChallengeEnrollment,
  challenge: ChallengeCatalogEntry,
  userId: string
): Promise<ChallengeEnrollment> {
  if (enrollment.status !== "active") return enrollment;

  const todayLocal = localDateString(enrollment.timezone);
  const expectedDay = daysBetween(enrollment.startedAt, todayLocal) + 1;
  if (expectedDay <= enrollment.currentDay) return enrollment;

  let day = enrollment.currentDay;
  while (day < expectedDay) {
    const log = await fetchDailyLogRow(enrollment.id, enrollment.restartCount, day);
    const tasks = (log?.tasks as unknown as Record<string, ChallengeTaskState>) || {};
    const complete = log?.all_complete ?? false;

    if (!complete) {
      const reason = `${firstIncompleteLabel(tasks, challenge.rules.tasks)} incomplete`;
      const { data: updated, error } = await supabase
        .from("challenge_enrollments")
        .update({ status: "failed", failed_on_day: day, failed_reason: reason })
        .eq("id", enrollment.id)
        .select("*")
        .single();
      if (error) throw error;
      return mapEnrollment(updated);
    }

    day++;
    if (day > challenge.durationDays) {
      const { data: updated, error } = await supabase
        .from("challenge_enrollments")
        .update({ status: "completed", completed_at: new Date().toISOString(), current_day: challenge.durationDays })
        .eq("id", enrollment.id)
        .select("*")
        .single();
      if (error) throw error;
      return mapEnrollment(updated);
    }
  }

  const { data: updated, error } = await supabase
    .from("challenge_enrollments")
    .update({ current_day: day })
    .eq("id", enrollment.id)
    .select("*")
    .single();
  if (error) throw error;
  return mapEnrollment(updated);
}

async function loadTodayLog(enrollment: ChallengeEnrollment, challenge: ChallengeCatalogEntry, userId: string): Promise<ChallengeDailyLog | null> {
  if (enrollment.status !== "active") return null;

  const todayLocal = localDateString(enrollment.timezone);
  let log = await ensureDailyLogRow({
    enrollmentId: enrollment.id,
    userId,
    restartCount: enrollment.restartCount,
    dayNumber: enrollment.currentDay,
    date: todayLocal,
  });
  log = await syncDietTaskAndCompletion(log, challenge.rules.tasks, userId);
  return mapDailyLog(log);
}

// ─── Public hooks ───────────────────────────────────────────────────────────

export function useChallengeCatalog() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["challenge-catalog"],
    queryFn: async (): Promise<ChallengeCatalogEntry[]> => {
      if (isTestUser(user?.email)) return mockChallengeCatalog;

      const { data, error } = await supabase.from("challenges").select("*").order("duration_days");
      if (error) throw error;
      return (data || []).map(mapChallenge);
    },
    enabled: !!user,
  });
}

/** The user's currently-active enrollment (if any), with today's task log kept in sync. */
export function useActiveChallenge() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["active-challenge", user?.id],
    queryFn: async (): Promise<ActiveChallengeData | null> => {
      if (isTestUser(user?.email)) return mockActiveChallengeData();
      if (!user?.id) return null;

      const { data: row, error } = await supabase
        .from("challenge_enrollments")
        .select("*, challenges(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      if (!row) return null;

      const { challenges: challengeRow, ...enrollmentRow } = row;
      const challenge = mapChallenge(challengeRow);
      const enrollment = await evaluateAndAdvance(mapEnrollment(enrollmentRow), challenge, user.id);
      const todayLog = await loadTodayLog(enrollment, challenge, user.id);

      return { enrollment, challenge, todayLog };
    },
    enabled: !!user,
  });
}

/** A specific enrollment by id — for the dashboard/history routes, including past (failed/completed/abandoned) runs. */
export function useChallengeEnrollment(enrollmentId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["challenge-enrollment", enrollmentId, user?.id],
    queryFn: async (): Promise<ActiveChallengeData | null> => {
      if (isTestUser(user?.email)) return mockActiveChallengeData();
      if (!enrollmentId || !user?.id) return null;

      const { data: row, error } = await supabase
        .from("challenge_enrollments")
        .select("*, challenges(*)")
        .eq("id", enrollmentId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (!row) return null;

      const { challenges: challengeRow, ...enrollmentRow } = row;
      const challenge = mapChallenge(challengeRow);
      let enrollment = mapEnrollment(enrollmentRow);
      if (enrollment.status === "active") {
        enrollment = await evaluateAndAdvance(enrollment, challenge, user.id);
      }
      const todayLog = await loadTodayLog(enrollment, challenge, user.id);

      return { enrollment, challenge, todayLog };
    },
    enabled: !!user && (isTestUser(user?.email) || !!enrollmentId),
  });
}

export function useChallengeHistory(enrollmentId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["challenge-history", enrollmentId],
    queryFn: async (): Promise<ChallengeDailyLog[]> => {
      if (isTestUser(user?.email)) return mockChallengeHistory;
      if (!enrollmentId) return [];

      const { data, error } = await supabase
        .from("challenge_daily_logs")
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .order("restart_count", { ascending: true })
        .order("day_number", { ascending: true });
      if (error) throw error;
      return (data || []).map(mapDailyLog);
    },
    enabled: !!enrollmentId || isTestUser(user?.email),
  });
}

export function useEnrollInChallenge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      if (isTestUser(user.email)) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { id: "mock-enrollment-id" };
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const startedAt = localDateString(timezone);

      const { data, error } = await supabase
        .from("challenge_enrollments")
        .insert({ user_id: user.id, challenge_id: challengeId, timezone, started_at: startedAt })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-challenge"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-enrollment"] });
    },
  });
}

/** Patches one task's state in today's log and recomputes all_complete. In test mode this updates the cache directly so the demo stays interactive without a backing database. */
export function useUpdateChallengeTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      logId,
      taskDefs,
      taskKey,
      patch,
    }: {
      logId: string;
      taskDefs: ChallengeTaskDef[];
      taskKey: string;
      patch: Partial<ChallengeTaskState>;
    }) => {
      if (isTestUser(user?.email)) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        return { taskKey, patch };
      }

      const { data: current, error: fetchError } = await supabase
        .from("challenge_daily_logs")
        .select("tasks, completed_at")
        .eq("id", logId)
        .single();
      if (fetchError) throw fetchError;

      const tasks: Record<string, ChallengeTaskState> = { ...(current.tasks as unknown as Record<string, ChallengeTaskState>) };
      tasks[taskKey] = { ...(tasks[taskKey] ?? { done: false }), ...patch };
      const allComplete = computeAllComplete(tasks, taskDefs);

      const { error } = await supabase
        .from("challenge_daily_logs")
        .update({
          tasks: tasks as unknown as Json,
          all_complete: allComplete,
          completed_at: allComplete ? (current.completed_at ?? new Date().toISOString()) : null,
        })
        .eq("id", logId);
      if (error) throw error;

      return { taskKey, patch };
    },
    onSuccess: (result, variables) => {
      if (isTestUser(user?.email)) {
        queryClient.setQueriesData<ActiveChallengeData | null>(
          { queryKey: ["active-challenge", user?.id] },
          (old) => mergeTaskIntoCache(old, variables.taskKey, variables.patch, variables.taskDefs)
        );
        queryClient.setQueriesData<ActiveChallengeData | null>(
          { queryKey: ["challenge-enrollment"] },
          (old) => mergeTaskIntoCache(old, variables.taskKey, variables.patch, variables.taskDefs)
        );
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["active-challenge"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-enrollment"] });
    },
  });
}

function mergeTaskIntoCache(
  old: ActiveChallengeData | null | undefined,
  taskKey: string,
  patch: Partial<ChallengeTaskState>,
  taskDefs: ChallengeTaskDef[]
): ActiveChallengeData | null | undefined {
  if (!old?.todayLog) return old;
  const tasks = { ...old.todayLog.tasks, [taskKey]: { ...(old.todayLog.tasks[taskKey] ?? { done: false }), ...patch } };
  const allComplete = computeAllComplete(tasks, taskDefs);
  return { ...old, todayLog: { ...old.todayLog, tasks, allComplete } };
}

export function useUploadChallengePhoto() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      logId,
      taskDefs,
      file,
    }: {
      logId: string;
      taskDefs: ChallengeTaskDef[];
      file: File;
    }) => {
      if (isTestUser(user?.email)) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return { photoPath: "mock-photo-path" };
      }

      const { path } = await uploadChallengePhoto(file);

      const { data: current, error: fetchError } = await supabase
        .from("challenge_daily_logs")
        .select("tasks, completed_at")
        .eq("id", logId)
        .single();
      if (fetchError) throw fetchError;

      const tasks: Record<string, ChallengeTaskState> = { ...(current.tasks as unknown as Record<string, ChallengeTaskState>) };
      tasks.photo = { done: true, photo_path: path };
      const allComplete = computeAllComplete(tasks, taskDefs);

      const { error } = await supabase
        .from("challenge_daily_logs")
        .update({
          tasks: tasks as unknown as Json,
          photo_path: path,
          all_complete: allComplete,
          completed_at: allComplete ? (current.completed_at ?? new Date().toISOString()) : null,
        })
        .eq("id", logId);
      if (error) throw error;

      return { photoPath: path };
    },
    onSuccess: ({ photoPath }, variables) => {
      if (isTestUser(user?.email)) {
        queryClient.setQueriesData<ActiveChallengeData | null>(
          { queryKey: ["active-challenge", user?.id] },
          (old) => mergeTaskIntoCache(old, "photo", { done: true, photo_path: photoPath }, variables.taskDefs)
        );
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["active-challenge"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-enrollment"] });
    },
  });
}

export function useRestartChallenge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      if (isTestUser(user?.email)) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }

      const { data: current, error: fetchError } = await supabase
        .from("challenge_enrollments")
        .select("restart_count")
        .eq("id", enrollmentId)
        .single();
      if (fetchError) throw fetchError;

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const startedAt = localDateString(timezone);

      const { error } = await supabase
        .from("challenge_enrollments")
        .update({
          status: "active",
          started_at: startedAt,
          timezone,
          current_day: 1,
          restart_count: current.restart_count + 1,
          failed_on_day: null,
          failed_reason: null,
          completed_at: null,
        })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-challenge"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-enrollment"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-history"] });
    },
  });
}

export function useAbandonChallenge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      if (isTestUser(user?.email)) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return;
      }

      const { error } = await supabase
        .from("challenge_enrollments")
        .update({ status: "abandoned" })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-challenge"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-enrollment"] });
    },
  });
}
