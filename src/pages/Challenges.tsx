import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { ChallengeDayRing } from "@/components/challenges/ChallengeDayRing";
import { useChallengeCatalog, useActiveChallenge, useEnrollInChallenge } from "@/hooks/use-challenges";
import { useNutritionPlan } from "@/hooks/use-nutrition-plan";
import { AlertTriangle, BookOpen, Camera, Droplet, Dumbbell, Loader2, Trophy, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Challenges() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: catalog = [], isLoading: catalogLoading } = useChallengeCatalog();
  const { data: active, isLoading: activeLoading } = useActiveChallenge();
  const { data: planData } = useNutritionPlan();
  const enroll = useEnrollInChallenge();

  const hasPlan = planData?.hasPlan ?? false;
  const isLoading = catalogLoading || activeLoading;
  const hasActiveEnrollment = active?.enrollment.status === "active";

  const handleStart = (challengeId: string) => {
    if (!hasPlan) {
      toast.error(t("challenges.needs_plan"));
      return;
    }
    enroll.mutate(challengeId, {
      onSuccess: (result) => {
        toast.success(t("challenges.enrolled"));
        navigate(`/challenges/${result.id}`);
      },
      onError: () => toast.error(t("challenges.error_enroll")),
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent" />
            {t("challenges.title")}
          </h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {hasActiveEnrollment && active && (
              <Link to={`/challenges/${active.enrollment.id}`} className="block animate-fade-up">
                <Card className="card-shadow hover-lift">
                  <CardContent className="p-5 flex items-center gap-4">
                    <ChallengeDayRing day={active.enrollment.currentDay} totalDays={active.challenge.durationDays} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{active.challenge.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("challenges.tasks_done_today", {
                          done: Object.values(active.todayLog?.tasks ?? {}).filter((s) => s.done).length,
                          total: active.challenge.rules.tasks.length,
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            {!hasPlan && (
              <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {t("challenges.needs_plan")}
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">{t("challenges.catalog_title")}</h2>
              {catalog.map((challenge) => {
                const isActiveThis = hasActiveEnrollment && active?.challenge.id === challenge.id;
                const isStrict = challenge.rules.fail_policy !== "none";

                return (
                  <Card key={challenge.id} className="card-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{challenge.name}</p>
                          <span
                            className={cn(
                              "text-[10px] font-medium px-2 py-0.5 rounded-full",
                              isStrict
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            {isStrict ? t("challenges.mode_strict") : t("challenges.mode_flexible")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Utensils className="w-3 h-3" />
                          {t("challenges.rule_diet")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Droplet className="w-3 h-3" />
                          {t("challenges.rule_water")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Dumbbell className="w-3 h-3" />
                          {t("challenges.rule_workouts")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {t("challenges.rule_reading")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          {t("challenges.rule_photo")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isStrict ? t("challenges.restart_warning") : t("challenges.flexible_note")}
                      </p>
                      {isActiveThis && active ? (
                        <Button asChild variant="outline" className="w-full">
                          <Link to={`/challenges/${active.enrollment.id}`}>{t("challenges.view_dashboard")}</Link>
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          disabled={enroll.isPending || hasActiveEnrollment}
                          onClick={() => handleStart(challenge.id)}
                        >
                          {enroll.isPending ? t("common.loading") : t("challenges.start_cta", { name: challenge.name })}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
