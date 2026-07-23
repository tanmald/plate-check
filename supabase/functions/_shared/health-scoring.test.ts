import { describe, expect, it } from "vitest";
import {
  aggregateDay,
  BASELINE_MIN_DAYS,
  bedtimeMinutesAfterNoon,
  computeActivityScore,
  computeBaselines,
  computeRecoveryScore,
  computeSleepScore,
  computeStrainScore,
  computeWellnessScore,
  type DailyHealth,
  parseHaeDate,
  parseHealthAutoExportPayload,
} from "./health-scoring";

const isoDate = (i: number) => `2026-06-${String(i + 1).padStart(2, "0")}`;

/** Builds a steady history long enough to activate every baseline. */
function steadyHistory(days = BASELINE_MIN_DAYS, overrides: Partial<DailyHealth> = {}): DailyHealth[] {
  return Array.from({ length: days }, (_, i) => ({
    date: isoDate(i),
    hrvMs: 60,
    restingHr: 52,
    respiratoryRate: 14,
    wristTemp: 34.5,
    sleepStart: `${isoDate(i)}T23:00:00+01:00`,
    sleepDurationMin: 450,
    activeEnergyKcal: 500,
    ...overrides,
  }));
}

describe("parseHaeDate", () => {
  it("keeps the device-local day instead of converting to UTC", () => {
    const parsed = parseHaeDate("2026-07-11 00:30:00 +0100");
    expect(parsed?.localDate).toBe("2026-07-11"); // would be 2026-07-10 in UTC
    expect(parsed?.iso).toBe("2026-07-11T00:30:00+01:00");
  });

  it("rejects garbage", () => {
    expect(parseHaeDate("not a date")).toBeNull();
    expect(parseHaeDate(undefined)).toBeNull();
  });
});

describe("bedtimeMinutesAfterNoon", () => {
  it("keeps bedtimes around midnight contiguous", () => {
    const before = bedtimeMinutesAfterNoon("2026-07-10 23:30:00 +0100");
    const after = bedtimeMinutesAfterNoon("2026-07-11 00:30:00 +0100");
    expect(after! - before!).toBe(60);
  });
});

describe("parseHealthAutoExportPayload", () => {
  const payload = {
    data: {
      metrics: [
        {
          name: "heart_rate_variability",
          units: "ms",
          data: [
            { date: "2026-07-11 04:00:00 +0100", qty: 62 },
            { date: "2026-07-11 05:00:00 +0100", qty: 58 },
          ],
        },
        {
          name: "sleep_analysis",
          units: "hr",
          data: [
            {
              date: "2026-07-10 23:10:00 +0100",
              sleepStart: "2026-07-10 23:10:00 +0100",
              sleepEnd: "2026-07-11 07:05:00 +0100",
              asleep: 7.2,
              deep: 1.2,
              rem: 1.5,
              core: 4.5,
              awake: 0.4,
            },
          ],
        },
      ],
      workouts: [{ name: "Running", start: "2026-07-11 18:00:00 +0100", end: "2026-07-11 18:45:00 +0100" }],
    },
  };

  it("flattens metrics and preserves qty and units", () => {
    const samples = parseHealthAutoExportPayload(payload);
    const hrv = samples.filter((s) => s.metric === "heart_rate_variability");
    expect(hrv).toHaveLength(2);
    expect(hrv[0].qty).toBe(62);
    expect(hrv[0].units).toBe("ms");
    expect(hrv[0].localDate).toBe("2026-07-11");
  });

  it("attributes a midnight-crossing sleep session to the day it ends", () => {
    const samples = parseHealthAutoExportPayload(payload);
    const sleep = samples.find((s) => s.metric === "sleep_analysis");
    expect(sleep?.localDate).toBe("2026-07-11");
    expect(sleep?.payload?.asleep).toBe(7.2);
  });

  it("extracts workouts attributed to their start day", () => {
    const samples = parseHealthAutoExportPayload(payload);
    const workout = samples.find((s) => s.metric === "workouts");
    expect(workout?.localDate).toBe("2026-07-11");
  });

  it("returns empty for malformed bodies", () => {
    expect(parseHealthAutoExportPayload(null)).toEqual([]);
    expect(parseHealthAutoExportPayload({})).toEqual([]);
    expect(parseHealthAutoExportPayload({ data: { metrics: "nope" } })).toEqual([]);
  });
});

describe("aggregateDay", () => {
  it("averages recovery inputs, sums activity, converts sleep hours to minutes", () => {
    const samples = parseHealthAutoExportPayload({
      data: {
        metrics: [
          {
            name: "heart_rate_variability",
            units: "ms",
            data: [
              { date: "2026-07-11 04:00:00 +0100", qty: 60 },
              { date: "2026-07-11 05:00:00 +0100", qty: 70 },
            ],
          },
          {
            name: "step_count",
            units: "count",
            data: [
              { date: "2026-07-11 09:00:00 +0100", qty: 4000 },
              { date: "2026-07-11 15:00:00 +0100", qty: 6000 },
            ],
          },
          {
            name: "sleep_analysis",
            units: "hr",
            data: [
              {
                sleepStart: "2026-07-10 23:00:00 +0100",
                sleepEnd: "2026-07-11 07:00:00 +0100",
                asleep: 7.5,
                deep: 1.25,
                rem: 1.5,
                awake: 0.5,
              },
            ],
          },
        ],
      },
    });
    const day = aggregateDay("2026-07-11", samples);
    expect(day.hrvMs).toBe(65);
    expect(day.steps).toBe(10000);
    expect(day.sleepDurationMin).toBe(450);
    expect(day.sleepDeepMin).toBe(75);
    expect(day.sleepEfficiency).toBeCloseTo(7.5 / 8);
  });

  it("picks the longest sleep session when naps share the day", () => {
    const day = aggregateDay("2026-07-11", [
      {
        metric: "sleep_analysis",
        recordedAt: "2026-07-11T14:00:00+01:00",
        localDate: "2026-07-11",
        qty: null,
        payload: { asleep: 1, awake: 0.1, sleepStart: "2026-07-11 14:00:00 +0100", sleepEnd: "2026-07-11 15:00:00 +0100" },
        units: "hr",
      },
      {
        metric: "sleep_analysis",
        recordedAt: "2026-07-10T23:00:00+01:00",
        localDate: "2026-07-11",
        qty: null,
        payload: { asleep: 7, awake: 0.5, sleepStart: "2026-07-10 23:00:00 +0100", sleepEnd: "2026-07-11 06:30:00 +0100" },
        units: "hr",
      },
    ]);
    expect(day.sleepDurationMin).toBe(420);
  });
});

describe("computeBaselines", () => {
  it("stays inactive below the minimum day count", () => {
    const baselines = computeBaselines(steadyHistory(BASELINE_MIN_DAYS - 1));
    expect(baselines.lnHrv).toBeUndefined();
    expect(baselines.restingHr).toBeUndefined();
  });

  it("activates at the minimum day count, with HRV in ln-space", () => {
    const baselines = computeBaselines(steadyHistory());
    expect(baselines.lnHrv?.n).toBe(BASELINE_MIN_DAYS);
    expect(baselines.lnHrv?.mean).toBeCloseTo(Math.log(60));
    expect(baselines.restingHr?.mean).toBe(52);
    expect(baselines.bedtimeMinutes?.n).toBe(BASELINE_MIN_DAYS);
  });

  it("ignores days with missing values", () => {
    const history = [...steadyHistory(), ...Array.from({ length: 5 }, (_, i) => ({ date: isoDate(20 + i) }))];
    const baselines = computeBaselines(history);
    expect(baselines.lnHrv?.n).toBe(BASELINE_MIN_DAYS);
  });
});

describe("computeRecoveryScore", () => {
  // Add mild variation so std reflects real day-to-day noise.
  const history = steadyHistory(30).map((d, i) => ({
    ...d,
    hrvMs: 60 + (i % 5) - 2,
    restingHr: 52 + (i % 3) - 1,
  }));
  const baselines = computeBaselines(history);

  it("is null without baselines", () => {
    const { score } = computeRecoveryScore(
      { date: "2026-07-11", hrvMs: 62, restingHr: 52 },
      computeBaselines([]),
    );
    expect(score).toBeNull();
  });

  it("rewards HRV above baseline and penalizes elevated resting HR", () => {
    const good = computeRecoveryScore(
      { date: "2026-07-11", hrvMs: 75, restingHr: 48, respiratoryRate: 14, wristTemp: 34.5 },
      baselines,
    );
    const bad = computeRecoveryScore(
      { date: "2026-07-11", hrvMs: 45, restingHr: 60, respiratoryRate: 14, wristTemp: 34.5 },
      baselines,
    );
    expect(good.score!).toBeGreaterThan(bad.score!);
    expect(good.components.find((c) => c.key === "hrv")!.score).toBeGreaterThan(50);
    expect(bad.components.find((c) => c.key === "restingHr")!.score).toBeLessThan(50);
  });

  it("renormalizes when only some components have data", () => {
    const { score, components } = computeRecoveryScore({ date: "2026-07-11", hrvMs: 60 }, baselines);
    expect(components).toHaveLength(1);
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThanOrEqual(0);
    expect(score!).toBeLessThanOrEqual(100);
  });

  it("clamps extreme deviations to the 0-100 range", () => {
    const { score } = computeRecoveryScore(
      { date: "2026-07-11", hrvMs: 5, restingHr: 120, respiratoryRate: 30, wristTemp: 38 },
      baselines,
    );
    expect(score).toBe(0);
  });
});

describe("computeSleepScore", () => {
  const baselines = computeBaselines(steadyHistory(30));

  it("scores a textbook night near 100", () => {
    const { score } = computeSleepScore(
      {
        date: "2026-07-11",
        sleepStart: "2026-07-10T23:05:00+01:00",
        sleepDurationMin: 480,
        sleepDeepMin: 480 * 0.18,
        sleepRemMin: 480 * 0.22,
        sleepAwakeMin: 10,
        sleepEfficiency: 0.97,
      },
      baselines,
    );
    expect(score!).toBeGreaterThanOrEqual(95);
  });

  it("penalizes short, fragmented, inconsistent sleep", () => {
    const { score } = computeSleepScore(
      {
        date: "2026-07-11",
        sleepStart: "2026-07-11T02:45:00+01:00", // ~3h45 later than the 23:00 baseline
        sleepDurationMin: 300,
        sleepDeepMin: 15,
        sleepRemMin: 20,
        sleepEfficiency: 0.75,
      },
      baselines,
    );
    expect(score!).toBeLessThan(60);
  });

  it("is null with no sleep data", () => {
    expect(computeSleepScore({ date: "2026-07-11" }, baselines).score).toBeNull();
  });
});

describe("computeStrainScore and computeActivityScore", () => {
  const baselines = computeBaselines(steadyHistory(30));

  it("scales strain against the personal energy baseline", () => {
    const rest = computeStrainScore(
      { date: "2026-07-11", activeEnergyKcal: 150, exerciseMinutes: 0, steps: 3000 },
      baselines,
    );
    const hard = computeStrainScore(
      { date: "2026-07-11", activeEnergyKcal: 900, exerciseMinutes: 75, steps: 15000 },
      baselines,
    );
    expect(hard.score!).toBeGreaterThan(rest.score!);
    expect(hard.score!).toBeLessThanOrEqual(100);
  });

  it("caps activity attainment at 100 so overshooting goals is not required", () => {
    const { score } = computeActivityScore({
      date: "2026-07-11",
      steps: 25000,
      exerciseMinutes: 120,
      activeEnergyKcal: 1500,
    });
    expect(score).toBe(100);
  });

  it("is null with no activity data", () => {
    expect(computeStrainScore({ date: "2026-07-11" }, baselines).score).toBeNull();
    expect(computeActivityScore({ date: "2026-07-11" }).score).toBeNull();
  });
});

describe("computeWellnessScore", () => {
  it("weights all four pillars 30/30/30/10", () => {
    const { score } = computeWellnessScore({ nutrition: 80, recovery: 60, sleep: 100, activity: 50 });
    expect(score).toBe(Math.round(80 * 0.3 + 60 * 0.3 + 100 * 0.3 + 50 * 0.1));
  });

  it("renormalizes when components are missing", () => {
    const { score, breakdown } = computeWellnessScore({ nutrition: 80, sleep: 60 });
    expect(score).toBe(70); // equal 0.3 weights renormalize to 50/50
    expect(breakdown.map((b) => b.key)).toEqual(["nutrition", "sleep"]);
  });

  it("falls back to nutrition alone before any watch data exists", () => {
    const { score } = computeWellnessScore({ nutrition: 85, recovery: null, sleep: null });
    expect(score).toBe(85);
  });

  it("is null when nothing is available", () => {
    expect(computeWellnessScore({}).score).toBeNull();
  });
});
