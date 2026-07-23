import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { WeeklyChart } from "@/components/WeeklyChart";
import { MealCard } from "@/components/MealCard";
import { ProgressPageSkeleton } from "@/components/PageSkeletons";
import { useTodayMeals } from "@/hooks/use-meals";
import { useDailyProgress, useWeeklyProgress, useAdherenceByMealType, usePreviousWeekAverage } from "@/hooks/use-progress";
import { useNutritionPlan, getUnloggedTemplates, getMealIcon, getLoggableMealCount } from "@/hooks/use-nutrition-plan";
import { getScoreStatus, getScoreColor, getScoreLabel } from "@/components/AdherenceScore";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const MEAL_TYPE_ORDER = ["breakfast", "lunch", "dinner", "snack"];

function formatDayLabel(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric" });
}

function formatWeekRangeLabel(locale: string): string {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  const fmt = (d: Date) => d.toLocaleDateString(locale, { month: "short", day: "numeric" });
  return `${fmt(startDate)} - ${fmt(endDate)}`;
}

export default function Progress() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const { data: todayMeals = [], isLoading: mealsLoading } = useTodayMeals();
  const { data: dailyStats, isLoading: dailyLoading } = useDailyProgress();
  const { data: weeklyData = [], isLoading: weeklyLoading } = useWeeklyProgress();
  const { data: planData } = useNutritionPlan();
  const { data: mealTypeAdherence = [], isLoading: mealTypeLoading } = useAdherenceByMealType();
  const { data: lastWeekAverage = null, isLoading: lastWeekLoading } = usePreviousWeekAverage();

  const isLoading = mealsLoading || dailyLoading || weeklyLoading || mealTypeLoading || lastWeekLoading;
  const dateLocale = i18n.language?.startsWith("pt") ? "pt-PT" : "en-US";

  const plan = planData?.plan;
  const totalMeals = getLoggableMealCount(plan) ?? dailyStats?.totalMeals ?? 4;
  const pendingTemplates = getUnloggedTemplates(plan, todayMeals);
  const sortedMealTypeAdherence = [...mealTypeAdherence].sort(
    (a, b) => MEAL_TYPE_ORDER.indexOf(a.type) - MEAL_TYPE_ORDER.indexOf(b.type)
  );

  const loggedWeekDays = weeklyData.filter((d) => d.mealsLogged > 0);
  const bestDay = loggedWeekDays.reduce<typeof loggedWeekDays[number] | undefined>(
    (best, d) => (!best || d.score > best.score ? d : best),
    undefined
  );
  const worstDay = loggedWeekDays.reduce<typeof loggedWeekDays[number] | undefined>(
    (worst, d) => (!worst || d.score < worst.score ? d : worst),
    undefined
  );

  const bestMeal = todayMeals.reduce<typeof todayMeals[number] | undefined>(
    (best, m) => (!best || m.score > best.score ? m : best),
    undefined
  );
  const worstMeal = todayMeals.reduce<typeof todayMeals[number] | undefined>(
    (worst, m) => (!worst || m.score < worst.score ? m : worst),
    undefined
  );

  const weeklyAverage = Math.round(weeklyData.reduce((acc, d) => acc + d.score, 0) / (weeklyData.length || 1));
  const onPlanDays = weeklyData.filter((d) => getScoreStatus(d.score) === "high").length;
  const offPlanPercentage = Math.round(((7 - onPlanDays) / 7) * 100);
  // null = no prior-week data — hide the trend chip rather than show a
  // meaningless "+X% vs last week" against a fabricated zero.
  const trend = lastWeekAverage == null ? null : weeklyAverage - lastWeekAverage;

  const handlePreviousDay = () => {
    toast.info(t("common.coming_soon"));
  };

  const handlePreviousWeek = () => {
    toast.info(t("common.coming_soon"));
  };

  const translateDayName = (day: string) => t(`common.day_${day.toLowerCase()}`, day);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">{t("progress.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("progress.subtitle")}</p>
        </div>
      </header>

      {/* Tab Toggle */}
      <div className="px-4 py-4 bg-card border-b border-border">
        <div className="flex gap-2 p-1 bg-secondary rounded-xl max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab("daily")}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
              activeTab === "daily"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("progress.tab_daily")}
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
              activeTab === "weekly"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("progress.tab_weekly")}
          </button>
        </div>
      </div>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {isLoading ? (
          <ProgressPageSkeleton />
        ) : activeTab === "daily" ? (
          <div className="animate-fade-in-slide">
            {/* Date Navigator */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={handlePreviousDay} aria-label={t("progress.previous_day")}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="font-semibold">{t("progress.today")}</p>
                <p className="text-sm text-muted-foreground">{formatDayLabel(new Date(), dateLocale)}</p>
              </div>
              <Button variant="ghost" size="icon" disabled aria-label={t("progress.next_day")}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Daily Score */}
            <Card className="card-shadow animate-fade-up">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-primary">{dailyStats?.dailyScore || 0}%</span>
                </div>
                <p className={cn("text-lg font-semibold", getScoreColor(dailyStats?.dailyScore || 0))}>
                  {getScoreLabel(dailyStats?.dailyScore || 0, t)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("progress.meals_logged", { logged: dailyStats?.mealsLogged || 0, total: totalMeals })}
                </p>
              </CardContent>
            </Card>

            {/* Today's Meals */}
            <div className="animate-fade-up animate-delay-100">
              <h2 className="text-lg font-semibold mb-4">{t("progress.todays_meals")}</h2>
              <div className="space-y-3">
                {todayMeals.map((meal, idx) => (
                  <Link
                    key={meal.id}
                    to="/meal-result"
                    state={{ mealLogId: meal.id, mealType: meal.type }}
                    className="block animate-fade-up"
                    style={{ animationDelay: `${(idx + 2) * 100}ms` }}
                  >
                    <MealCard meal={meal} />
                  </Link>
                ))}

                {/* Pending meals */}
                {pendingTemplates.map((template) => (
                  <Card key={template.id} className="card-shadow border-dashed border-2 animate-fade-up animate-delay-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <span className="text-2xl opacity-50">{template.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-muted-foreground">{template.name}</p>
                          <p className="text-sm text-muted-foreground">{t("progress.not_logged")}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Daily Insights */}
            {todayMeals.length > 0 && (
              <Card className="card-shadow animate-fade-up animate-delay-400">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("progress.todays_insights")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bestMeal && bestMeal.score >= 70 && (
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">
                          {t("progress.insight_meal_on_track", { name: bestMeal.name, score: bestMeal.score })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {bestMeal.feedback || t("progress.insight_default_positive")}
                        </p>
                      </div>
                    </div>
                  )}
                  {worstMeal && worstMeal.score < 70 && (
                    <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">
                          {t("progress.insight_meal_needs_attention", { name: worstMeal.name, score: worstMeal.score })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {worstMeal.feedback || t("progress.insight_default_negative")}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : activeTab === "weekly" ? (
          <div className="animate-fade-in-slide space-y-6">
            {/* Week Navigator */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handlePreviousWeek} aria-label={t("progress.previous_week")}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="font-semibold">{t("progress.this_week")}</p>
                <p className="text-sm text-muted-foreground">{formatWeekRangeLabel(dateLocale)}</p>
              </div>
              <Button variant="ghost" size="icon" disabled aria-label={t("progress.next_week")}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Weekly Chart */}
            <Card className="card-shadow animate-fade-up">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t("progress.daily_adherence")}</CardTitle>
                  {trend != null && (
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      trend >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {t("progress.vs_last_week", { sign: trend >= 0 ? "+" : "", diff: trend })}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <WeeklyChart data={weeklyData} />
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="card-shadow animate-fade-up animate-delay-100 hover-lift">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-primary">{weeklyAverage}%</p>
                  <p className="text-sm text-muted-foreground">{t("progress.weekly_average")}</p>
                </CardContent>
              </Card>

              <Card className="card-shadow animate-fade-up animate-delay-200 hover-lift">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="w-6 h-6 text-warning" />
                  </div>
                  <p className="text-3xl font-bold text-warning">{offPlanPercentage}%</p>
                  <p className="text-sm text-muted-foreground">{t("progress.off_plan_days")}</p>
                </CardContent>
              </Card>
            </div>

            {/* Plan Adherence Breakdown */}
            <Card className="card-shadow animate-fade-up animate-delay-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("progress.adherence_by_meal")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sortedMealTypeAdherence.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    {t("progress.adherence_by_meal_empty")}
                  </p>
                ) : (
                  sortedMealTypeAdherence.map((item, idx) => (
                    <div
                      key={item.type}
                      className="space-y-2 animate-fade-up"
                      style={{ animationDelay: `${(idx + 4) * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getMealIcon(item.type)}</span>
                          <span className="font-medium text-sm">{t(`log.${item.type}`)}</span>
                        </div>
                        <span className={cn("text-sm font-semibold", getScoreColor(item.averageScore))}>
                          {item.averageScore}%
                        </span>
                      </div>
                      <ProgressBar value={item.averageScore} status={getScoreStatus(item.averageScore)} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Weekly Insights */}
            {loggedWeekDays.length > 0 && (
              <Card className="card-shadow animate-fade-up animate-delay-400">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("progress.weekly_insights")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bestDay && bestDay.score >= 70 && (
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">
                          {t("progress.insight_best_day", { day: translateDayName(bestDay.day), score: bestDay.score })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("progress.meals_logged_count", { count: bestDay.mealsLogged })}
                        </p>
                      </div>
                    </div>
                  )}
                  {worstDay && worstDay.score < 70 && (
                    <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">
                          {t("progress.insight_worst_day", { day: translateDayName(worstDay.day), score: worstDay.score })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("progress.meals_logged_count", { count: worstDay.mealsLogged })}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        {/* Trust note */}
        {!isLoading && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>{t("common.wellness_note")}</span>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
