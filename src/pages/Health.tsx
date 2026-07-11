import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { AdherenceScore, getScoreColor } from "@/components/AdherenceScore";
import { MetricCard } from "@/components/health/MetricCard";
import { HealthTrendChart } from "@/components/health/HealthTrendChart";
import { useHealthDaily, useHealthTrends, useIngestToken } from "@/hooks/use-health";
import { BASELINE_MIN_DAYS, type ScoreComponent } from "@/lib/health-scoring";
import { HeartPulse, Moon, Activity as ActivityIcon, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreDetail {
  recovery?: ScoreComponent[];
  sleep?: ScoreComponent[];
  strain?: ScoreComponent[];
}

function componentByKey(components: ScoreComponent[] | undefined, key: string) {
  return components?.find((c) => c.key === key);
}

const LABELS: Record<string, string> = {
  hrv: "HRV",
  resting_hr: "Resting HR",
  respiratoryRate: "Respiratory rate",
  wristTemp: "Wrist temperature",
  duration: "Duration",
  efficiency: "Efficiency",
  deep: "Deep sleep",
  rem: "REM sleep",
  consistency: "Bedtime consistency",
};

export default function Health() {
  const { data: healthDaily, isLoading: dailyLoading } = useHealthDaily();
  const { data: trends = [], isLoading: trendsLoading } = useHealthTrends(14);
  const { data: token } = useIngestToken();

  const isLoading = dailyLoading || trendsLoading;
  const daysSynced = trends.filter((d) => d.hrvMs != null || d.sleepDurationMin != null || d.steps != null).length;
  const isCalibrating = daysSynced < BASELINE_MIN_DAYS;
  const hasAnyData = daysSynced > 0;

  const detail = (healthDaily?.scoreDetail as ScoreDetail | null) ?? null;
  const last7 = trends.slice(-7);

  const trendSeries = (key: string) =>
    last7.map((d) => ({ date: d.date, value: (d as unknown as Record<string, number | null>)[key] ?? null }));

  const sparkline = (key: string) => last7.map((d) => (d as unknown as Record<string, number | null>)[key] ?? null);

  if (!isLoading && !token && !hasAnyData) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-card border-b border-border safe-top">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground">Health</h1>
            <p className="text-sm text-muted-foreground">Recovery, sleep and activity from your Apple Watch</p>
          </div>
        </header>
        <main className="px-4 py-6 max-w-2xl mx-auto">
          <Card className="card-shadow animate-fade-up">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartPulse className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect your Apple Watch</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Sync Apple Health data to see your recovery, sleep and activity scores alongside your nutrition.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link to="/settings">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Set up Health Sync
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  const recoveryRows: Array<{ key: string; labelKey: string; unit: string; precision: number }> = [
    { key: "hrv", labelKey: "hrv", unit: "ms", precision: 0 },
    { key: "restingHr", labelKey: "resting_hr", unit: "bpm", precision: 0 },
    { key: "respiratoryRate", labelKey: "respiratoryRate", unit: "brpm", precision: 1 },
    { key: "wristTemp", labelKey: "wristTemp", unit: "°C", precision: 1 },
  ];
  const sleepRows: Array<{ key: string; labelKey: string; unit: string; precision: number }> = [
    { key: "duration", labelKey: "duration", unit: "min", precision: 0 },
    { key: "efficiency", labelKey: "efficiency", unit: "", precision: 2 },
    { key: "deep", labelKey: "deep", unit: "min", precision: 0 },
    { key: "rem", labelKey: "rem", unit: "min", precision: 0 },
    { key: "consistency", labelKey: "consistency", unit: "min", precision: 0 },
  ];

  const renderComponentRow = (c: ScoreComponent | undefined, label: string, unit: string, precision: number) => {
    if (!c) return null;
    return (
      <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <span className="text-sm">{label}</span>
        <span className={cn("text-sm font-medium", getScoreColor(c.score))}>
          {c.value != null ? `${c.value.toFixed(precision)}${unit ? ` ${unit}` : ""}` : "–"}
          {c.baselineMean != null && (
            <span className="text-muted-foreground font-normal"> · {c.baselineMean.toFixed(precision)} baseline</span>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Health</h1>
          <p className="text-sm text-muted-foreground">Recovery, sleep and activity from your Apple Watch</p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4 max-w-2xl mx-auto">
        {isCalibrating && (
          <Card className="border-border bg-muted/30 animate-fade-up">
            <CardContent className="p-4 text-sm text-muted-foreground">
              Calibrating your baselines — {daysSynced} of {BASELINE_MIN_DAYS} days synced. Scores appear once we
              have enough history.
            </CardContent>
          </Card>
        )}

        {/* Recovery */}
        <Card className="card-shadow animate-fade-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-primary" />
              Recovery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <AdherenceScore score={healthDaily?.recoveryScore ?? 0} size="sm" showLabel={false} />
              <div className="flex-1">
                {healthDaily?.recoveryScore == null ? (
                  <p className="text-sm text-muted-foreground">Calibrating…</p>
                ) : (
                  <HealthTrendChart data={trendSeries("recoveryScore")} label="Recovery" colorVar="--success" />
                )}
              </div>
            </div>
            <div>
              {recoveryRows.map((r) =>
                renderComponentRow(componentByKey(detail?.recovery, r.key), LABELS[r.labelKey], r.unit, r.precision),
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card className="card-shadow animate-fade-up animate-delay-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Moon className="w-4 h-4 text-primary" />
              Sleep
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <AdherenceScore score={healthDaily?.sleepScore ?? 0} size="sm" showLabel={false} />
              <div className="flex-1">
                {healthDaily?.sleepScore == null ? (
                  <p className="text-sm text-muted-foreground">Calibrating…</p>
                ) : (
                  <HealthTrendChart data={trendSeries("sleepScore")} label="Sleep" colorVar="--primary" />
                )}
              </div>
            </div>
            <div>
              {sleepRows.map((r) =>
                renderComponentRow(componentByKey(detail?.sleep, r.key), LABELS[r.labelKey], r.unit, r.precision),
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="card-shadow animate-fade-up animate-delay-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-primary" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <AdherenceScore score={healthDaily?.strainScore ?? 0} size="sm" showLabel={false} />
              <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">{healthDaily?.steps ?? "–"}</p>
                  <p className="text-xs text-muted-foreground">Steps</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{healthDaily?.activeEnergyKcal ?? "–"}</p>
                  <p className="text-xs text-muted-foreground">Active energy</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{healthDaily?.exerciseMinutes ?? "–"}</p>
                  <p className="text-xs text-muted-foreground">Exercise min</p>
                </div>
              </div>
            </div>
            {healthDaily?.workouts && healthDaily.workouts.length > 0 && (
              <div className="space-y-2">
                {healthDaily.workouts.map((w, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-t border-border">
                    <span>{(w.name as string) ?? "Workout"}</span>
                    {typeof w.duration === "number" && (
                      <span className="text-muted-foreground">{w.duration} min</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trends */}
        <div className="animate-fade-up animate-delay-300">
          <h2 className="text-lg font-semibold mb-3">Trends</h2>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="HRV"
              value={healthDaily?.hrvMs ?? null}
              unit="ms"
              trend={sparkline("hrvMs")}
              baseline={componentByKey(detail?.recovery, "hrv")?.baselineMean}
            />
            <MetricCard
              label="Resting HR"
              value={healthDaily?.restingHr ?? null}
              unit="bpm"
              trend={sparkline("restingHr")}
              baseline={componentByKey(detail?.recovery, "restingHr")?.baselineMean}
            />
            <MetricCard label="Steps" value={healthDaily?.steps ?? null} trend={sparkline("steps")} />
            <MetricCard
              label="VO2 max"
              value={healthDaily?.vo2Max ?? null}
              precision={1}
              trend={sparkline("vo2Max")}
            />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
