import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BottomNav } from "@/components/BottomNav";
import { ChallengeHeatmap } from "@/components/challenges/ChallengeHeatmap";
import { useChallengeEnrollment, useChallengeHistory } from "@/hooks/use-challenges";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function ChallengeHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const { data, isLoading } = useChallengeEnrollment(enrollmentId);
  const { data: history = [] } = useChallengeHistory(enrollmentId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-muted-foreground">{t("challenges.not_found")}</p>
      </div>
    );
  }

  const { enrollment, challenge, todayLog } = data;
  const taskCount = challenge.rules.tasks.length;

  const currentRunLogs = history.filter((log) => log.restartCount === enrollment.restartCount);
  const logs =
    todayLog && !currentRunLogs.some((log) => log.date === todayLog.date)
      ? [...currentRunLogs, todayLog]
      : currentRunLogs.map((log) => (todayLog && log.date === todayLog.date ? todayLog : log));

  const daysComplete = logs.filter((log) => log.allComplete).length;
  const daysPartial = logs.filter(
    (log) => !log.allComplete && Object.values(log.tasks).some((task) => task?.done)
  ).length;

  // Highest day reached per previous run — not necessarily a failure, since a
  // run can also be abandoned or still in progress.
  const priorAttempts = Array.from(
    history.reduce((map, log) => {
      if (log.restartCount === enrollment.restartCount) return map;
      map.set(log.restartCount, Math.max(map.get(log.restartCount) ?? 0, log.dayNumber));
      return map;
    }, new Map<number, number>())
  ).sort(([a], [b]) => a - b);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground" aria-label={t("common.back")}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{t("challenges.history_title", { name: challenge.name })}</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <SummaryTile value={`${daysComplete}/${challenge.durationDays}`} label={t("challenges.stat_days_complete")} />
          <SummaryTile value={String(daysPartial)} label={t("challenges.stat_days_partial")} />
          <SummaryTile value={String(enrollment.currentDay)} label={t("challenges.stat_current_day")} />
        </div>

        <ChallengeHeatmap
          variant="full"
          logs={logs}
          startedAt={enrollment.startedAt}
          durationDays={challenge.durationDays}
          totalTasks={taskCount}
          timezone={enrollment.timezone}
        />

        {priorAttempts.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-sm font-medium">{t("challenges.prior_attempts_title")}</p>
            {priorAttempts.map(([restartCount, lastDay]) => (
              <p key={restartCount} className="text-xs text-muted-foreground">
                {t("challenges.prior_attempt_line", { attempt: restartCount + 1, day: lastDay })}
              </p>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function SummaryTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border p-3 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}
