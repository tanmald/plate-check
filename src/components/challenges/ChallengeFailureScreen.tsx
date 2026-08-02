import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { RotateCcw, X } from "lucide-react";

interface ChallengeFailureScreenProps {
  dayFailed: number;
  reason: string | null;
  isRestarting: boolean;
  isAbandoning: boolean;
  onRestart: () => void;
  onAbandon: () => void;
}

export function ChallengeFailureScreen({
  dayFailed,
  reason,
  isRestarting,
  isAbandoning,
  onRestart,
  onAbandon,
}: ChallengeFailureScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-6 safe-top">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <X className="w-8 h-8 text-destructive" />
      </div>
      <div className="space-y-2 max-w-xs">
        <h1 className="text-xl font-bold">{t("challenges.failure_title", { day: dayFailed })}</h1>
        <p className="text-muted-foreground text-sm">
          {reason ? t("challenges.failure_reason", { reason }) : t("challenges.failure_generic")}
        </p>
        <p className="text-muted-foreground text-sm">{t("challenges.failure_rules_note")}</p>
        <p className="text-xs text-muted-foreground pt-2">{t("challenges.failure_keep_note")}</p>
      </div>
      <div className="w-full max-w-xs space-y-3">
        <Button className="w-full" size="lg" onClick={onRestart} disabled={isRestarting || isAbandoning}>
          <RotateCcw className="w-4 h-4 mr-2" />
          {isRestarting ? t("common.loading") : t("challenges.restart_tomorrow")}
        </Button>
        <Button variant="outline" className="w-full" onClick={onAbandon} disabled={isRestarting || isAbandoning}>
          {isAbandoning ? t("common.loading") : t("challenges.not_now")}
        </Button>
      </div>
    </div>
  );
}
