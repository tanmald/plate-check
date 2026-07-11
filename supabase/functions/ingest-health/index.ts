import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  aggregateDay,
  computeBaselines,
  computeRecoveryScore,
  computeSleepScore,
  computeStrainScore,
  type DailyHealth,
  type ParsedSample,
  parseHealthAutoExportPayload,
} from "../_shared/health-scoring.ts";

// Receives Health Auto Export webhook payloads. The iOS app cannot attach a
// Supabase JWT (verify_jwt is disabled in config.toml), so each request is
// authenticated by a per-user API key sent in the x-api-key header and stored
// hashed in health_ingest_tokens.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const MAX_BODY_BYTES = 5 * 1024 * 1024;
const SAMPLE_UPSERT_BATCH = 500;

// deno-lint-ignore no-explicit-any
type Db = ReturnType<typeof createClient<any>>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface SampleRow {
  user_id: string;
  metric: string;
  recorded_at: string;
  local_date: string;
  qty: number | null;
  payload: Record<string, unknown> | null;
  units: string | null;
}

function toSampleRow(userId: string, sample: ParsedSample): SampleRow {
  return {
    user_id: userId,
    metric: sample.metric,
    recorded_at: sample.recordedAt,
    local_date: sample.localDate,
    qty: sample.qty,
    payload: sample.payload,
    units: sample.units,
  };
}

function dbRowToSample(row: Record<string, unknown>): ParsedSample {
  return {
    metric: row.metric as string,
    recordedAt: row.recorded_at as string,
    localDate: row.local_date as string,
    qty: (row.qty as number | null) ?? null,
    payload: (row.payload as Record<string, unknown> | null) ?? null,
    units: (row.units as string | null) ?? null,
  };
}

function dbRowToDaily(row: Record<string, unknown>): DailyHealth {
  return {
    date: row.date as string,
    hrvMs: row.hrv_ms as number | null,
    restingHr: row.resting_hr as number | null,
    respiratoryRate: row.respiratory_rate as number | null,
    wristTemp: row.wrist_temp as number | null,
    spo2: row.spo2 as number | null,
    sleepStart: row.sleep_start as string | null,
    sleepEnd: row.sleep_end as string | null,
    sleepDurationMin: row.sleep_duration_min as number | null,
    sleepDeepMin: row.sleep_deep_min as number | null,
    sleepRemMin: row.sleep_rem_min as number | null,
    sleepCoreMin: row.sleep_core_min as number | null,
    sleepAwakeMin: row.sleep_awake_min as number | null,
    sleepEfficiency: row.sleep_efficiency as number | null,
    steps: row.steps as number | null,
    activeEnergyKcal: row.active_energy_kcal as number | null,
    exerciseMinutes: row.exercise_minutes as number | null,
    standHours: row.stand_hours as number | null,
    vo2Max: row.vo2_max as number | null,
  };
}

async function recomputeDay(supabase: Db, userId: string, date: string): Promise<void> {
  const { data: sampleRows, error: samplesError } = await supabase
    .from("health_samples")
    .select("metric, recorded_at, local_date, qty, payload, units")
    .eq("user_id", userId)
    .eq("local_date", date);
  if (samplesError) throw samplesError;

  const day = aggregateDay(date, (sampleRows ?? []).map(dbRowToSample));

  // Trailing history strictly before the scored day, oldest first.
  const { data: historyRows, error: historyError } = await supabase
    .from("health_daily")
    .select("*")
    .eq("user_id", userId)
    .lt("date", date)
    .order("date", { ascending: false })
    .limit(60);
  if (historyError) throw historyError;

  const history = (historyRows ?? []).map(dbRowToDaily).reverse();
  const baselines = computeBaselines(history);

  const recovery = computeRecoveryScore(day, baselines);
  const sleep = computeSleepScore(day, baselines);
  const strain = computeStrainScore(day, baselines);

  const wristTempDelta =
    typeof day.wristTemp === "number" && baselines.wristTemp
      ? day.wristTemp - baselines.wristTemp.mean
      : null;

  const { error: upsertError } = await supabase.from("health_daily").upsert(
    {
      user_id: userId,
      date,
      hrv_ms: day.hrvMs ?? null,
      resting_hr: day.restingHr ?? null,
      respiratory_rate: day.respiratoryRate ?? null,
      wrist_temp: day.wristTemp ?? null,
      wrist_temp_delta: wristTempDelta,
      spo2: day.spo2 ?? null,
      sleep_start: day.sleepStart ?? null,
      sleep_end: day.sleepEnd ?? null,
      sleep_duration_min: day.sleepDurationMin ?? null,
      sleep_deep_min: day.sleepDeepMin ?? null,
      sleep_rem_min: day.sleepRemMin ?? null,
      sleep_core_min: day.sleepCoreMin ?? null,
      sleep_awake_min: day.sleepAwakeMin ?? null,
      sleep_efficiency: day.sleepEfficiency ?? null,
      steps: day.steps ?? null,
      active_energy_kcal: day.activeEnergyKcal ?? null,
      exercise_minutes: day.exerciseMinutes ?? null,
      stand_hours: day.standHours ?? null,
      vo2_max: day.vo2Max ?? null,
      workouts: day.workouts ?? [],
      recovery_score: recovery.score,
      sleep_score: sleep.score,
      strain_score: strain.score,
      score_detail: {
        recovery: recovery.components,
        sleep: sleep.components,
        strain: strain.components,
      },
    },
    { onConflict: "user_id,date" },
  );
  if (upsertError) throw upsertError;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return jsonResponse({ error: "Missing x-api-key header" }, 401);
    }

    const bodyText = await req.text();
    if (bodyText.length > MAX_BODY_BYTES) {
      return jsonResponse({ error: "Payload too large" }, 413);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase: Db = createClient(supabaseUrl, supabaseServiceKey);

    const tokenHash = await sha256Hex(apiKey);
    const { data: token } = await supabase
      .from("health_ingest_tokens")
      .select("user_id")
      .eq("token_hash", tokenHash)
      .single();
    if (!token) {
      return jsonResponse({ error: "Invalid API key" }, 401);
    }
    const userId = token.user_id as string;

    await supabase
      .from("health_ingest_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("token_hash", tokenHash);

    let body: unknown;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const samples = parseHealthAutoExportPayload(body);
    if (samples.length === 0) {
      return jsonResponse({ samplesUpserted: 0, daysRecomputed: 0, dates: [] });
    }

    const rows = samples.map((s) => toSampleRow(userId, s));
    for (let i = 0; i < rows.length; i += SAMPLE_UPSERT_BATCH) {
      const { error } = await supabase
        .from("health_samples")
        .upsert(rows.slice(i, i + SAMPLE_UPSERT_BATCH), {
          onConflict: "user_id,metric,recorded_at",
        });
      if (error) throw error;
    }

    // Recompute affected days oldest-first so later days see fresh history.
    const dates = [...new Set(samples.map((s) => s.localDate))].sort();
    for (const date of dates) {
      await recomputeDay(supabase, userId, date);
    }

    console.log(
      `Ingested ${rows.length} samples for user ${userId}, recomputed ${dates.length} day(s)`,
    );
    return jsonResponse({
      samplesUpserted: rows.length,
      daysRecomputed: dates.length,
      dates,
    });
  } catch (error) {
    console.error("Error in ingest-health:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return jsonResponse({ error: message }, 500);
  }
});
