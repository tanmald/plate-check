import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BottomNav } from "@/components/BottomNav";
import { useChallengeEnrollment, useChallengeHistory } from "@/hooks/use-challenges";
import { ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const { enrollment, challenge } = data;
  const currentRunLogs = history.filter((log) => log.restartCount === enrollment.restartCount);
  const logsByDay = new Map(currentRunLogs.map((log) => [log.dayNumber, log]));

  const priorAttempts = Array.from(
    history.reduce((map, log) => {
      if (log.restartCount === enrollment.restartCount) return map;
      map.set(log.restartCount, Math.max(map.get(log.restartCount) ?? 0, log.dayNumber));
      return map;
    }, new Map<number, number>())
  ).sort(([a], [b]) => a - b);

  const cells = Array.from({ length: challenge.durationDays }, (_, i) => {
    const dayNumber = i + 1;
    const log = logsByDay.get(dayNumber);
    const state = log
      ? log.allComplete
        ? "complete"
        : dayNumber === enrollment.currentDay
          ? "today"
          : "failed"
      : "pending";
    return { dayNumber, state };
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{t("challenges.history_title", { name: challenge.name })}</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
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

        <div className="grid grid-cols-10 gap-1.5">
          {cells.map(({ dayNumber, state }) => (
            <div
              key={dayNumber}
              title={`Day ${dayNumber}`}
              className={cn(
                "aspect-square rounded flex items-center justify-center text-[9px] font-medium",
                state === "complete" && "bg-success/20 text-success",
                state === "today" && "bg-primary/20 text-primary border border-primary",
                state === "failed" && "bg-destructive/20 text-destructive",
                state === "pending" && "bg-muted text-muted-foreground"
              )}
            >
              {dayNumber}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <LegendDot className="bg-success/20" label={t("challenges.legend_complete")} />
          <LegendDot className="bg-primary/20" label={t("challenges.legend_today")} />
          <LegendDot className="bg-destructive/20" label={t("challenges.legend_failed")} />
          <LegendDot className="bg-muted" label={t("challenges.legend_pending")} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("w-2.5 h-2.5 rounded-sm", className)} />
      {label}
    </span>
  );
}
