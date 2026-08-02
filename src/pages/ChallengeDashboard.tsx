import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { CameraView } from "@/components/CameraView";
import { ChallengeDayRing } from "@/components/challenges/ChallengeDayRing";
import { ChallengeTaskRow } from "@/components/challenges/ChallengeTaskRow";
import { ChallengeHeatmap } from "@/components/challenges/ChallengeHeatmap";
import { ChallengeFailureScreen } from "@/components/challenges/ChallengeFailureScreen";
import { ChallengeCompletionScreen } from "@/components/challenges/ChallengeCompletionScreen";
import {
  useChallengeEnrollment,
  useChallengeHistory,
  useUpdateChallengeTask,
  useUploadChallengePhoto,
  useRestartChallenge,
  useAbandonChallenge,
  type ChallengeDailyLog,
  type ChallengeTaskState,
} from "@/hooks/use-challenges";
import { ChevronLeft, Flame, History, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ChallengeDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const [showCamera, setShowCamera] = useState(false);

  const { data, isLoading } = useChallengeEnrollment(enrollmentId);
  const { data: history = [] } = useChallengeHistory(enrollmentId);
  const updateTask = useUpdateChallengeTask();
  const uploadPhoto = useUploadChallengePhoto();
  const restart = useRestartChallenge();
  const abandon = useAbandonChallenge();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">{t("challenges.not_found")}</p>
        <Button onClick={() => navigate("/challenges")}>{t("common.back")}</Button>
      </div>
    );
  }

  const { enrollment, challenge, todayLog } = data;

  if (enrollment.status === "failed") {
    return (
      <ChallengeFailureScreen
        dayFailed={enrollment.failedOnDay ?? enrollment.currentDay}
        reason={enrollment.failedReason}
        isRestarting={restart.isPending}
        isAbandoning={abandon.isPending}
        onRestart={() =>
          restart.mutate(enrollment.id, {
            onSuccess: () => toast.success(t("challenges.restarted")),
            onError: () => toast.error(t("challenges.error_generic")),
          })
        }
        onAbandon={() =>
          abandon.mutate(enrollment.id, {
            onSuccess: () => navigate("/challenges"),
            onError: () => toast.error(t("challenges.error_generic")),
          })
        }
      />
    );
  }

  if (enrollment.status === "completed") {
    return (
      <ChallengeCompletionScreen
        enrollment={enrollment}
        challenge={challenge}
        history={history}
        onDone={() => navigate("/challenges")}
      />
    );
  }

  if (enrollment.status === "abandoned") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">{t("challenges.abandoned_note")}</p>
        <Button onClick={() => navigate("/challenges")}>{t("common.back")}</Button>
      </div>
    );
  }

  const taskDefs = challenge.rules.tasks;
  const tasks = todayLog?.tasks ?? {};
  const doneCount = taskDefs.filter((def) => tasks[def.key]?.done).length;
  const tasksLeft = taskDefs.length - doneCount;
  const failsOnMissedDay = challenge.rules.fail_policy !== "none";

  // Read the hour in the enrollment's timezone, the same clock the rollover
  // judge uses — otherwise a travelling user gets warned on the wrong evening.
  const localHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: enrollment.timezone,
      hour: "2-digit",
      hour12: false,
    }).format(new Date())
  );
  const atRisk = failsOnMissedDay && localHour >= 20 && tasksLeft > 0;

  // Today's row is already fresh on `todayLog`; overlay it so the heatmap
  // reflects a tick immediately even if the history query hasn't refetched.
  const currentRunHistory = mergeTodayLog(
    history.filter((log) => log.restartCount === enrollment.restartCount),
    todayLog
  );

  const handleTaskUpdate = (taskKey: string, patch: Partial<ChallengeTaskState>) => {
    if (!todayLog) return;
    updateTask.mutate(
      { logId: todayLog.id, taskDefs, taskKey, patch },
      { onError: () => toast.error(t("challenges.error_generic")) }
    );
  };

  const handlePhotoCapture = (file: File) => {
    if (!todayLog) return;
    setShowCamera(false);
    uploadPhoto.mutate(
      { logId: todayLog.id, taskDefs, file },
      {
        onSuccess: () => toast.success(t("challenges.photo_saved")),
        onError: () => toast.error(t("challenges.error_generic")),
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/challenges")} className="flex items-center gap-1 text-sm text-muted-foreground">
            <ChevronLeft className="w-4 h-4" />
            {t("common.back")}
          </button>
          <Link to={`/challenges/${enrollment.id}/history`} className="flex items-center gap-1 text-sm text-primary">
            <History className="w-4 h-4" />
            {t("challenges.history_link")}
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <Card className="card-shadow overflow-hidden animate-fade-up">
          <CardContent className="p-6 flex items-center gap-4">
            <ChallengeDayRing day={enrollment.currentDay} totalDays={challenge.durationDays} />
            <div className="flex-1 space-y-1 min-w-0">
              <p className="font-semibold text-lg">{challenge.name}</p>
              <p className="text-sm text-muted-foreground">
                {t("challenges.tasks_done_today", { done: doneCount, total: taskDefs.length })}
              </p>
              {enrollment.restartCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("challenges.restart_count", { count: enrollment.restartCount })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {atRisk ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive animate-fade-up">
            <Flame className="w-4 h-4 shrink-0" />
            {t("challenges.day_at_risk")}
          </div>
        ) : tasksLeft > 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("challenges.tasks_remaining_today", { count: tasksLeft })}
          </p>
        ) : null}

        <div className="space-y-3">
          {taskDefs.map((def) => (
            <ChallengeTaskRow
              key={def.key}
              taskDef={def}
              state={tasks[def.key]}
              disabled={
                (updateTask.isPending && updateTask.variables?.taskKey === def.key) ||
                (uploadPhoto.isPending && def.type === "photo")
              }
              onUpdate={(patch) => handleTaskUpdate(def.key, patch)}
              onPhotoCapture={() => setShowCamera(true)}
            />
          ))}
        </div>

        {currentRunHistory.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("challenges.heatmap_title")}</p>
            <ChallengeHeatmap
              variant="compact"
              logs={currentRunHistory}
              startedAt={enrollment.startedAt}
              durationDays={challenge.durationDays}
              totalTasks={taskDefs.length}
              timezone={enrollment.timezone}
            />
          </div>
        )}
      </main>

      {showCamera && <CameraView onCapture={handlePhotoCapture} onClose={() => setShowCamera(false)} />}

      <BottomNav />
    </div>
  );
}

/** Replaces (or appends) today's entry so the heatmap tracks live ticks. */
function mergeTodayLog(logs: ChallengeDailyLog[], todayLog: ChallengeDailyLog | null): ChallengeDailyLog[] {
  if (!todayLog) return logs;
  const withoutToday = logs.filter((log) => log.date !== todayLog.date);
  return [...withoutToday, todayLog];
}
