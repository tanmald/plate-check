// Health scoring: pure, deterministic functions shared between the
// ingest-health edge function (Deno) and the frontend (Vite re-exports this
// file via src/lib/health-scoring.ts). Keep this module free of imports and
// I/O so both runtimes and vitest can consume it directly.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One raw data point extracted from a Health Auto Export payload. */
export interface ParsedSample {
  metric: string;
  /** ISO 8601 timestamp with the device's original UTC offset. */
  recordedAt: string;
  /** YYYY-MM-DD in the device's timezone (never derived via UTC conversion). */
  localDate: string;
  qty: number | null;
  payload: Record<string, unknown> | null;
  units: string | null;
}

/** Aggregated values for a single local day. */
export interface DailyHealth {
  date: string;
  hrvMs?: number | null;
  restingHr?: number | null;
  respiratoryRate?: number | null;
  wristTemp?: number | null;
  spo2?: number | null;
  sleepStart?: string | null;
  sleepEnd?: string | null;
  sleepDurationMin?: number | null;
  sleepDeepMin?: number | null;
  sleepRemMin?: number | null;
  sleepCoreMin?: number | null;
  sleepAwakeMin?: number | null;
  sleepEfficiency?: number | null;
  steps?: number | null;
  activeEnergyKcal?: number | null;
  exerciseMinutes?: number | null;
  standHours?: number | null;
  vo2Max?: number | null;
  workouts?: Array<Record<string, unknown>>;
}

export interface Baseline {
  mean: number;
  std: number;
  n: number;
}

export interface Baselines {
  lnHrv?: Baseline;
  restingHr?: Baseline;
  respiratoryRate?: Baseline;
  wristTemp?: Baseline;
  /** Median bedtime expressed in minutes after noon (wraparound-safe). */
  bedtimeMinutes?: Baseline;
  activeEnergy?: Baseline;
}

export interface ScoreComponent {
  key: string;
  score: number;
  weight: number;
  value?: number | null;
  baselineMean?: number | null;
}

export interface ScoreResult {
  score: number | null;
  components: ScoreComponent[];
}

export interface WellnessBreakdownEntry {
  key: "nutrition" | "recovery" | "sleep" | "activity";
  score: number;
  weight: number;
}

export interface WellnessResult {
  score: number | null;
  breakdown: WellnessBreakdownEntry[];
}

// A component's baseline only activates after this many days of data, matching
// the ~2-week calibration period Bevel/WHOOP use.
export const BASELINE_MIN_DAYS = 14;
export const BASELINE_WINDOW_DAYS = 60;
export const DEFAULT_SLEEP_NEED_MIN = 480;

// ---------------------------------------------------------------------------
// Date helpers (Health Auto Export sends "2026-07-11 07:30:00 +0100")
// ---------------------------------------------------------------------------

const HAE_DATE_RE =
  /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\s*([+-]\d{2}):?(\d{2}))?/;

export interface ParsedHaeDate {
  iso: string;
  localDate: string;
  minutesOfDay: number;
}

/**
 * Parses a Health Auto Export date string, preserving the device-local day.
 * The local day must come from the raw string, not from a UTC conversion —
 * a 00:30 +0100 sample belongs to that local date even though it is the
 * previous day in UTC.
 */
export function parseHaeDate(raw: unknown): ParsedHaeDate | null {
  if (typeof raw !== "string") return null;
  const m = HAE_DATE_RE.exec(raw.trim());
  if (!m) return null;
  const [, date, hh, mm, ss, offH, offM] = m;
  const time = `${hh}:${mm}:${ss ?? "00"}`;
  const offset = offH ? `${offH}:${offM}` : "Z";
  return {
    iso: `${date}T${time}${offset}`,
    localDate: date,
    minutesOfDay: Number(hh) * 60 + Number(mm),
  };
}

/** Minutes after noon: keeps bedtimes around midnight numerically contiguous. */
export function bedtimeMinutesAfterNoon(raw: string): number | null {
  const parsed = parseHaeDate(raw);
  if (!parsed) return null;
  const m = parsed.minutesOfDay;
  return m >= 720 ? m - 720 : m + 720;
}

// ---------------------------------------------------------------------------
// Health Auto Export payload parsing
// ---------------------------------------------------------------------------

interface HaeMetric {
  name?: string;
  units?: string;
  data?: Array<Record<string, unknown>>;
}

/** Metrics whose data points are structured objects rather than simple qty. */
const STRUCTURED_METRICS = new Set(["sleep_analysis"]);

export const WORKOUT_METRIC = "workouts";

/**
 * Flattens a Health Auto Export webhook payload
 * (`{ data: { metrics: [...], workouts: [...] } }`) into samples.
 *
 * Sleep sessions are attributed to the local date the session ENDS on, so a
 * night that starts at 23:10 on the 10th counts toward the 11th. Workouts are
 * attributed to the day they start.
 */
export function parseHealthAutoExportPayload(body: unknown): ParsedSample[] {
  const samples: ParsedSample[] = [];
  const data = (body as { data?: Record<string, unknown> })?.data;
  if (!data || typeof data !== "object") return samples;

  const metrics = Array.isArray((data as { metrics?: unknown }).metrics)
    ? ((data as { metrics: HaeMetric[] }).metrics)
    : [];

  for (const metric of metrics) {
    const name = typeof metric?.name === "string" ? metric.name : null;
    if (!name || !Array.isArray(metric.data)) continue;
    const units = typeof metric.units === "string" ? metric.units : null;
    const structured = STRUCTURED_METRICS.has(name);

    for (const point of metric.data) {
      if (!point || typeof point !== "object") continue;
      let anchor = parseHaeDate(point.date);
      let localDate = anchor?.localDate ?? null;

      if (name === "sleep_analysis") {
        // Attribute the session to the day it ends (the morning you wake up).
        const end = parseHaeDate(point.sleepEnd);
        const start = parseHaeDate(point.sleepStart);
        if (end) localDate = end.localDate;
        if (start) anchor = start;
      }

      if (!anchor || !localDate) continue;

      const qty = typeof point.qty === "number" && isFinite(point.qty)
        ? point.qty
        : null;

      samples.push({
        metric: name,
        recordedAt: anchor.iso,
        localDate,
        qty: structured ? null : qty,
        payload: structured ? (point as Record<string, unknown>) : null,
        units,
      });
    }
  }

  const workouts = Array.isArray((data as { workouts?: unknown }).workouts)
    ? ((data as { workouts: Array<Record<string, unknown>> }).workouts)
    : [];

  for (const workout of workouts) {
    if (!workout || typeof workout !== "object") continue;
    const start = parseHaeDate(workout.start ?? workout.date);
    if (!start) continue;
    samples.push({
      metric: WORKOUT_METRIC,
      recordedAt: start.iso,
      localDate: start.localDate,
      qty: null,
      payload: workout,
      units: null,
    });
  }

  return samples;
}

// ---------------------------------------------------------------------------
// Daily aggregation
// ---------------------------------------------------------------------------

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function sum(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function std(values: number[], mu: number): number {
  if (values.length < 2) return 0;
  const variance =
    values.reduce((acc, v) => acc + (v - mu) * (v - mu), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function qtys(samples: ParsedSample[], metric: string): number[] {
  return samples
    .filter((s) => s.metric === metric && typeof s.qty === "number")
    .map((s) => s.qty as number);
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && isFinite(value) ? value : null;
}

const HOURS_TO_MIN = 60;

/**
 * Reduces one local day's samples to a DailyHealth row. When several sleep
 * sessions end on the same day (naps), the longest one wins.
 */
export function aggregateDay(date: string, samples: ParsedSample[]): DailyHealth {
  const day: DailyHealth = { date };

  day.hrvMs = mean(qtys(samples, "heart_rate_variability"));
  day.restingHr = mean(qtys(samples, "resting_heart_rate"));
  day.respiratoryRate = mean(qtys(samples, "respiratory_rate"));
  day.spo2 = mean(qtys(samples, "blood_oxygen_saturation"));
  day.wristTemp = mean(qtys(samples, "apple_sleeping_wrist_temperature"));
  day.steps = sum(qtys(samples, "step_count"));
  day.activeEnergyKcal = sum(qtys(samples, "active_energy"));
  day.exerciseMinutes = sum(qtys(samples, "apple_exercise_time"));
  day.standHours = sum(qtys(samples, "apple_stand_hour"));

  const vo2 = qtys(samples, "vo2_max");
  day.vo2Max = vo2.length > 0 ? vo2[vo2.length - 1] : null;

  const sleepSessions = samples
    .filter((s) => s.metric === "sleep_analysis" && s.payload)
    .map((s) => s.payload as Record<string, unknown>);
  let best: Record<string, unknown> | null = null;
  let bestAsleep = -1;
  for (const session of sleepSessions) {
    const asleep = asNumber(session.asleep) ?? 0;
    if (asleep > bestAsleep) {
      bestAsleep = asleep;
      best = session;
    }
  }
  if (best) {
    const asleepH = asNumber(best.asleep);
    const deepH = asNumber(best.deep);
    const remH = asNumber(best.rem);
    const coreH = asNumber(best.core);
    const awakeH = asNumber(best.awake);
    day.sleepDurationMin = asleepH !== null ? asleepH * HOURS_TO_MIN : null;
    day.sleepDeepMin = deepH !== null ? deepH * HOURS_TO_MIN : null;
    day.sleepRemMin = remH !== null ? remH * HOURS_TO_MIN : null;
    day.sleepCoreMin = coreH !== null ? coreH * HOURS_TO_MIN : null;
    day.sleepAwakeMin = awakeH !== null ? awakeH * HOURS_TO_MIN : null;
    day.sleepStart = parseHaeDate(best.sleepStart)?.iso ?? null;
    day.sleepEnd = parseHaeDate(best.sleepEnd)?.iso ?? null;
    if (asleepH !== null && awakeH !== null && asleepH + awakeH > 0) {
      day.sleepEfficiency = asleepH / (asleepH + awakeH);
    }
  }

  day.workouts = samples
    .filter((s) => s.metric === WORKOUT_METRIC && s.payload)
    .map((s) => s.payload as Record<string, unknown>);

  return day;
}

// ---------------------------------------------------------------------------
// Baselines
// ---------------------------------------------------------------------------

const STD_EPSILON = 1e-6;

function buildBaseline(values: number[]): Baseline | undefined {
  if (values.length < BASELINE_MIN_DAYS) return undefined;
  const mu = mean(values) as number;
  return { mean: mu, std: Math.max(std(values, mu), STD_EPSILON), n: values.length };
}

function buildMedianBaseline(values: number[]): Baseline | undefined {
  if (values.length < BASELINE_MIN_DAYS) return undefined;
  const med = median(values) as number;
  return { mean: med, std: Math.max(std(values, med), STD_EPSILON), n: values.length };
}

function collect(history: DailyHealth[], pick: (d: DailyHealth) => number | null | undefined): number[] {
  const out: number[] = [];
  for (const day of history) {
    const v = pick(day);
    if (typeof v === "number" && isFinite(v)) out.push(v);
  }
  return out;
}

/**
 * Rolling personal baselines from trailing history (up to BASELINE_WINDOW_DAYS
 * days, EXCLUDING the day being scored). A component only activates once it
 * has BASELINE_MIN_DAYS days of data. HRV is baselined in ln-space because it
 * is log-normally distributed.
 */
export function computeBaselines(history: DailyHealth[]): Baselines {
  const window = history.slice(-BASELINE_WINDOW_DAYS);
  return {
    lnHrv: buildBaseline(
      collect(window, (d) => (d.hrvMs && d.hrvMs > 0 ? Math.log(d.hrvMs) : null)),
    ),
    restingHr: buildBaseline(collect(window, (d) => d.restingHr)),
    respiratoryRate: buildBaseline(collect(window, (d) => d.respiratoryRate)),
    wristTemp: buildBaseline(collect(window, (d) => d.wristTemp)),
    bedtimeMinutes: buildMedianBaseline(
      collect(window, (d) => (d.sleepStart ? bedtimeMinutesAfterNoon(d.sleepStart) : null)),
    ),
    activeEnergy: buildBaseline(collect(window, (d) => d.activeEnergyKcal)),
  };
}

// ---------------------------------------------------------------------------
// Scores
// ---------------------------------------------------------------------------

function clamp(value: number, lo = 0, hi = 100): number {
  return Math.min(hi, Math.max(lo, value));
}

/** Weighted mean over the components that exist, renormalizing their weights. */
function combine(components: ScoreComponent[]): number | null {
  const totalWeight = components.reduce((acc, c) => acc + c.weight, 0);
  if (totalWeight <= 0) return null;
  const weighted = components.reduce((acc, c) => acc + c.score * c.weight, 0);
  return Math.round(weighted / totalWeight);
}

/**
 * Recovery (Bevel/WHOOP style): how ready the body is today, from overnight
 * physiology vs personal baselines. Weights: HRV 0.40, RHR 0.25, wrist
 * temperature 0.20, respiratory rate 0.15 — renormalized over the components
 * that have both a value today and an active baseline.
 */
export function computeRecoveryScore(today: DailyHealth, baselines: Baselines): ScoreResult {
  const components: ScoreComponent[] = [];

  if (today.hrvMs && today.hrvMs > 0 && baselines.lnHrv) {
    const z = (Math.log(today.hrvMs) - baselines.lnHrv.mean) / baselines.lnHrv.std;
    components.push({
      key: "hrv",
      score: clamp(50 + 22 * z),
      weight: 0.4,
      value: today.hrvMs,
      baselineMean: Math.exp(baselines.lnHrv.mean),
    });
  }

  if (typeof today.restingHr === "number" && baselines.restingHr) {
    const z = (today.restingHr - baselines.restingHr.mean) / baselines.restingHr.std;
    components.push({
      key: "restingHr",
      score: clamp(50 - 22 * z),
      weight: 0.25,
      value: today.restingHr,
      baselineMean: baselines.restingHr.mean,
    });
  }

  if (typeof today.wristTemp === "number" && baselines.wristTemp) {
    const delta = Math.abs(today.wristTemp - baselines.wristTemp.mean);
    components.push({
      key: "wristTemp",
      score: clamp(100 - 45 * Math.max(0, delta - 0.2)),
      weight: 0.2,
      value: today.wristTemp,
      baselineMean: baselines.wristTemp.mean,
    });
  }

  if (typeof today.respiratoryRate === "number" && baselines.respiratoryRate) {
    const z = Math.abs(
      (today.respiratoryRate - baselines.respiratoryRate.mean) / baselines.respiratoryRate.std,
    );
    components.push({
      key: "respiratoryRate",
      score: clamp(100 - 25 * Math.max(0, z - 1)),
      weight: 0.15,
      value: today.respiratoryRate,
      baselineMean: baselines.respiratoryRate.mean,
    });
  }

  return { score: combine(components), components };
}

/**
 * Sleep quality: duration vs need 0.40, efficiency 0.20, deep 0.15, REM 0.15,
 * schedule consistency 0.10. Stage bands (deep 13–23%, REM 18–28% of asleep
 * time) score 100 inside the band with linear falloff outside.
 */
export function computeSleepScore(
  today: DailyHealth,
  baselines: Baselines,
  sleepNeedMin: number = DEFAULT_SLEEP_NEED_MIN,
): ScoreResult {
  const components: ScoreComponent[] = [];
  const duration = today.sleepDurationMin;

  if (typeof duration === "number" && duration > 0) {
    const ratio = duration / sleepNeedMin;
    // Full credit approaching 100% of need; mild penalty for heavy oversleep.
    const durationScore = ratio <= 1.1
      ? clamp(100 * Math.min(1, ratio))
      : clamp(100 - 30 * (ratio - 1.1));
    components.push({ key: "duration", score: durationScore, weight: 0.4, value: duration });

    if (typeof today.sleepEfficiency === "number") {
      const eff = today.sleepEfficiency;
      const effScore = eff >= 0.95 ? 100 : clamp(((eff - 0.7) / 0.25) * 100);
      components.push({ key: "efficiency", score: effScore, weight: 0.2, value: eff });
    }

    const bandScore = (minutes: number | null | undefined, lo: number, hi: number) => {
      if (typeof minutes !== "number") return null;
      const pct = minutes / duration;
      if (pct >= lo && pct <= hi) return 100;
      const dist = pct < lo ? lo - pct : pct - hi;
      return clamp(100 - (dist / 0.1) * 100);
    };

    const deep = bandScore(today.sleepDeepMin, 0.13, 0.23);
    if (deep !== null) {
      components.push({ key: "deep", score: deep, weight: 0.15, value: today.sleepDeepMin });
    }
    const rem = bandScore(today.sleepRemMin, 0.18, 0.28);
    if (rem !== null) {
      components.push({ key: "rem", score: rem, weight: 0.15, value: today.sleepRemMin });
    }

    if (today.sleepStart && baselines.bedtimeMinutes) {
      const bedtime = bedtimeMinutesAfterNoon(today.sleepStart);
      if (bedtime !== null) {
        const deviation = Math.abs(bedtime - baselines.bedtimeMinutes.mean);
        const consistency = deviation <= 30
          ? 100
          : deviation >= 120
            ? 0
            : clamp(100 - ((deviation - 30) / 90) * 100);
        components.push({ key: "consistency", score: consistency, weight: 0.1, value: deviation });
      }
    }
  }

  return { score: combine(components), components };
}

const STRAIN_ENERGY_FALLBACK_KCAL = 500;

/**
 * Strain: a neutral 0–100 effort gauge for the day (high is not "good" or
 * "bad" — it feeds the strain-vs-recovery narrative). Energy is scaled
 * against ~1.8× the personal daily baseline so an average day lands mid-gauge.
 */
export function computeStrainScore(today: DailyHealth, baselines: Baselines): ScoreResult {
  const components: ScoreComponent[] = [];
  const energyRef = Math.max(
    (baselines.activeEnergy?.mean ?? STRAIN_ENERGY_FALLBACK_KCAL) * 1.8,
    STD_EPSILON,
  );

  if (typeof today.activeEnergyKcal === "number") {
    components.push({
      key: "activeEnergy",
      score: clamp((today.activeEnergyKcal / energyRef) * 100),
      weight: 0.5,
      value: today.activeEnergyKcal,
      baselineMean: baselines.activeEnergy?.mean ?? null,
    });
  }
  if (typeof today.exerciseMinutes === "number") {
    components.push({
      key: "exerciseMinutes",
      score: clamp((today.exerciseMinutes / 60) * 100),
      weight: 0.3,
      value: today.exerciseMinutes,
    });
  }
  if (typeof today.steps === "number") {
    components.push({
      key: "steps",
      score: clamp((today.steps / 10000) * 100),
      weight: 0.2,
      value: today.steps,
    });
  }

  return { score: combine(components), components };
}

/**
 * Activity goal attainment (used by the wellness score instead of raw strain,
 * so a planned rest day doesn't read as poor wellness): average attainment of
 * daily movement targets, capped at 100.
 */
export function computeActivityScore(today: DailyHealth): ScoreResult {
  const components: ScoreComponent[] = [];
  if (typeof today.steps === "number") {
    components.push({
      key: "steps",
      score: clamp((today.steps / 10000) * 100),
      weight: 0.4,
      value: today.steps,
    });
  }
  if (typeof today.exerciseMinutes === "number") {
    components.push({
      key: "exerciseMinutes",
      score: clamp((today.exerciseMinutes / 30) * 100),
      weight: 0.4,
      value: today.exerciseMinutes,
    });
  }
  if (typeof today.activeEnergyKcal === "number") {
    components.push({
      key: "activeEnergy",
      score: clamp((today.activeEnergyKcal / STRAIN_ENERGY_FALLBACK_KCAL) * 100),
      weight: 0.2,
      value: today.activeEnergyKcal,
    });
  }
  return { score: combine(components), components };
}

const WELLNESS_WEIGHTS: Record<WellnessBreakdownEntry["key"], number> = {
  nutrition: 0.3,
  recovery: 0.3,
  sleep: 0.3,
  activity: 0.1,
};

/**
 * Combined wellness score. Missing components (null/undefined) drop out and
 * the remaining weights renormalize, so the score works from day one with
 * nutrition alone and gets richer as watch data accumulates.
 */
export function computeWellnessScore(parts: {
  nutrition?: number | null;
  recovery?: number | null;
  sleep?: number | null;
  activity?: number | null;
}): WellnessResult {
  const breakdown: WellnessBreakdownEntry[] = [];
  for (const key of Object.keys(WELLNESS_WEIGHTS) as WellnessBreakdownEntry["key"][]) {
    const value = parts[key];
    if (typeof value === "number" && isFinite(value)) {
      breakdown.push({ key, score: Math.round(clamp(value)), weight: WELLNESS_WEIGHTS[key] });
    }
  }
  const totalWeight = breakdown.reduce((acc, b) => acc + b.weight, 0);
  if (totalWeight <= 0) return { score: null, breakdown };
  const score = Math.round(
    breakdown.reduce((acc, b) => acc + b.score * b.weight, 0) / totalWeight,
  );
  return { score, breakdown };
}
