import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";
import type { ChallengeCatalogEntry, ChallengeDailyLog, ChallengeEnrollment } from "@/hooks/use-challenges";

interface ChallengeCompletionScreenProps {
  enrollment: ChallengeEnrollment;
  challenge: ChallengeCatalogEntry;
  history: ChallengeDailyLog[];
  onDone: () => void;
}

export function ChallengeCompletionScreen({
  enrollment,
  challenge,
  history,
  onDone,
}: ChallengeCompletionScreenProps) {
  const { t } = useTranslation();

  const currentRunLogs = history.filter((log) => log.restartCount === enrollment.restartCount);
  const totalWaterL = currentRunLogs.reduce((sum, log) => sum + (log.tasks.water?.value ?? 0), 0) / 1000;
  const totalPages = currentRunLogs.reduce((sum, log) => sum + (log.tasks.reading?.value ?? 0), 0);
  const daysComplete = currentRunLogs.filter((log) => log.allComplete).length;

  // A strict run can only reach this screen unbroken, so "75 of 75" is a given.
  // A flexible one has a real number to report, and it deserves the headline.
  const isStrict = challenge.rules.fail_policy !== "none";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-6 safe-top">
      <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center animate-fade-up">
        <PartyPopper className="w-10 h-10 text-success" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("challenges.completion_title")}</h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          {isStrict
            ? t("challenges.completion_subtitle")
            : t("challenges.completion_subtitle_flexible", {
                complete: daysComplete,
                total: challenge.durationDays,
              })}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        <StatTile
          label={isStrict ? t("challenges.stat_restarts") : t("challenges.stat_days_complete")}
          value={isStrict ? String(enrollment.restartCount) : `${daysComplete}/${challenge.durationDays}`}
        />
        <StatTile label={t("challenges.stat_water")} value={`${totalWaterL.toFixed(0)}L`} />
        <StatTile label={t("challenges.stat_pages")} value={String(totalPages)} />
      </div>
      <Button className="w-full max-w-xs" size="lg" onClick={onDone}>
        {t("challenges.completion_done")}
      </Button>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
