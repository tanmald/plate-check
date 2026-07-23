import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AdherenceScore, getScoreStatus, getScoreColor } from "@/components/AdherenceScore";
import { MealCard } from "@/components/MealCard";
import { BottomNav } from "@/components/BottomNav";
import { HomePageSkeleton } from "@/components/PageSkeletons";
import { useAuth, useUserProfile } from "@/hooks/use-auth";
import { useTodayMeals } from "@/hooks/use-meals";
import { useNutritionPlan, getLoggableMealCount, getNextUnloggedTemplate } from "@/hooks/use-nutrition-plan";
import { useDailyProgress } from "@/hooks/use-progress";
import { useWellnessScore } from "@/hooks/use-health";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Flame,
  TrendingUp,
  Calendar,
  Camera,
  Info,
  Utensils,
  HeartPulse,
  Moon,
  Zap,
} from "lucide-react";

const WELLNESS_CHIPS: Array<{ key: "nutrition" | "recovery" | "sleep" | "activity"; icon: LucideIcon }> = [
  { key: "nutrition", icon: Utensils },
  { key: "recovery", icon: HeartPulse },
  { key: "sleep", icon: Moon },
  { key: "activity", icon: Zap },
];

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return t("home.greeting_morning");
  if (hour >= 12 && hour < 18) return t("home.greeting_afternoon");
  return t("home.greeting_evening");
}

function formatTodayLabel(locale: string): string {
  return new Date().toLocaleDateString(locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { data: meals = [], isLoading: mealsLoading } = useTodayMeals();
  const { data: planData, isLoading: planLoading } = useNutritionPlan();
  const { data: dailyStats, isLoading: statsLoading } = useDailyProgress();
  const wellness = useWellnessScore();

  const hasPlan = planData?.hasPlan || false;
  const plan = planData?.plan;
  const wellnessScore = wellness.score ?? 0;
  const streak = dailyStats?.streak || 0;
  const weeklyAverage = dailyStats?.weeklyAverage || 0;
  const mealsLogged = dailyStats?.mealsLogged || 0;
  const totalMeals = getLoggableMealCount(plan) ?? dailyStats?.totalMeals ?? 4;
  const nextMealSuggestion = getNextUnloggedTemplate(plan, meals);

  const isLoading = mealsLoading || planLoading || statsLoading || wellness.isLoading;

  const dateLocale = i18n.language?.startsWith("pt") ? "pt-PT" : "en-US";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{getGreeting(t)},</p>
              <h1 className="text-2xl font-bold text-foreground">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </h1>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">👋</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {isLoading ? (
          <HomePageSkeleton />
        ) : !hasPlan ? (
          /* Empty State - No plan */
          <Card className="card-shadow animate-fade-up">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("home.no_plan_title")}</h3>
              <p className="text-muted-foreground text-sm mb-6">
                {t("home.no_plan_desc")}
              </p>
              <Button asChild size="lg" className="w-full">
                <Link to="/plan">{t("home.import_plan")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Daily Score Card */}
            <Card className="card-shadow overflow-hidden animate-fade-up">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/5 to-secondary p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">{t("home.todays_adherence")}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="w-4 h-4" />
                          {formatTodayLabel(dateLocale)}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2">
                          <Flame className="w-4 h-4 text-accent" />
                          <span className="text-sm font-semibold">{t("home.days_streak", { count: streak })}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold">{weeklyAverage}%</span>
                        </div>
                      </div>
                    </div>

                    <AdherenceScore score={wellnessScore} size="md" />
                  </div>
                </div>

                {/* Wellness breakdown */}
                <div className="grid grid-cols-4 gap-1 px-2 py-3 border-t border-border">
                  {WELLNESS_CHIPS.map(({ key, icon: Icon }) => {
                    const entry = wellness.breakdown.find((b) => b.key === key);
                    const colorClass = entry ? getScoreColor(entry.score) : "text-muted-foreground";
                    return (
                      <Link
                        key={key}
                        to="/health"
                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Icon className={cn("w-4 h-4", colorClass)} />
                        <span className={cn("text-sm font-semibold", colorClass)}>{entry?.score ?? "–"}</span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">
                          {t(`home.wellness_${key}`)}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* Meal progress */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t("home.meals_logged")}</span>
                    <span className="text-sm text-muted-foreground">{t("home.meals_of", { logged: mealsLogged, total: totalMeals })}</span>
                  </div>
                  <Progress value={(mealsLogged / totalMeals) * 100} status={getScoreStatus(wellnessScore)} />
                </div>
              </CardContent>
            </Card>

            {/* Primary CTA */}
            <Button asChild size="xl" className="w-full animate-fade-up animate-delay-100">
              <Link to="/log" className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {t("home.log_meal")}
              </Link>
            </Button>

            {/* Today's Meals */}
            {meals.length > 0 && (
              <div className="animate-fade-up animate-delay-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{t("home.todays_meals")}</h2>
                  <Link to="/progress" className="text-sm text-primary font-medium">{t("home.view_all")}</Link>
                </div>
                <div className="space-y-3">
                  {meals.map((meal, idx) => (
                    <Link
                      key={meal.id}
                      to="/meal-result"
                      state={{ mealLogId: meal.id, mealType: meal.type }}
                      className="block animate-fade-up"
                      style={{ animationDelay: `${(idx + 3) * 100}ms` }}
                    >
                      <MealCard meal={meal} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Next meal suggestion */}
            {nextMealSuggestion && (
              <Card className="card-shadow border-l-4 border-l-accent animate-fade-up animate-delay-300 hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{nextMealSuggestion.icon}</div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        {t("home.next_meal_suggestion", { name: nextMealSuggestion.name })}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {nextMealSuggestion.allowedFoods.length > 0
                          ? t("home.next_meal_suggestion_allowed", {
                              foods: nextMealSuggestion.allowedFoods.slice(0, 3).join(", "),
                            })
                          : t("home.next_meal_suggestion_required", {
                              foods: nextMealSuggestion.requiredFoods.join(", "),
                            })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Trust note */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3 h-3" />
          <span>{t("common.wellness_note")}</span>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
