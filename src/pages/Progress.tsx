import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { WeeklyChart } from "@/components/WeeklyChart";
import { MealCard } from "@/components/MealCard";
import { ProgressPageSkeleton } from "@/components/PageSkeletons";
import { useDailyProgress, useWeeklyProgress, usePreviousWeekAverage } from "@/hooks/use-progress";
import { useDailyInsights } from "@/hooks/use-daily-insights";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function Progress() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const {
    meals: todayMeals,
    pendingMeals,
    insights,
    totalPlannedMeals,
    isLoading: insightsLoading,
  } = useDailyInsights();
  const { data: dailyStats, isLoading: dailyLoading } = useDailyProgress();
  const { data: weeklyData = [], isLoading: weeklyLoading } = useWeeklyProgress();
  const { data: lastWeekAverage } = usePreviousWeekAverage();

  const isLoading = insightsLoading || dailyLoading || weeklyLoading;

  // Only average days that actually have data, so unlogged days don't drag the
  // week down to a number the user never earned.
  const daysWithData = weeklyData.filter((d) => d.mealsLogged > 0);
  const weeklyAverage = daysWithData.length
    ? Math.round(daysWithData.reduce((acc, d) => acc + d.score, 0) / daysWithData.length)
    : 0;
  const onPlanDays = daysWithData.filter((d) => d.score >= 70).length;
  const offPlanPercentage = daysWithData.length
    ? Math.round(((daysWithData.length - onPlanDays) / daysWithData.length) * 100)
    : 0;
  const bestDay = daysWithData.reduce<(typeof daysWithData)[number] | null>(
    (best, d) => (best === null || d.score > best.score ? d : best),
    null
  );
  // Only show a trend when there is a real previous week to compare against.
  const trend =
    lastWeekAverage != null && daysWithData.length > 0
      ? weeklyAverage - lastWeekAverage
      : null;

  const handlePreviousDay = () => toast.info(t("common.coming_soon", "Previous day navigation coming soon"));
  const handlePreviousWeek = () => toast.info(t("common.coming_soon", "Previous week navigation coming soon"));

  const weekRangeLabel = (() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    const fmt = (d: Date) =>
      d.toLocaleDateString(i18n.language, { month: "short", day: "numeric" });
    return `${fmt(start)} – ${fmt(end)}`;
  })();

  const getScoreLabel = (score: number) => {
    if (score >= 70) return t("progress.aligned");
    if (score >= 40) return t("progress.needs_attention");
    return t("progress.not_aligned");
  };

  // Adherence per meal type, from the meals actually logged today.
  const adherenceByMeal = Object.values(
    todayMeals.reduce<Record<string, { meal: string; total: number; count: number; icon: string }>>(
      (acc, m) => {
        const icons: Record<string, string> = {
          breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎",
        };
        const entry = acc[m.type] ?? {
          meal: t(`mealCard.${m.type}`, m.type),
          total: 0,
          count: 0,
          icon: icons[m.type] ?? "🍽️",
        };
        entry.total += m.score;
        entry.count += 1;
        acc[m.type] = entry;
        return acc;
      },
      {}
    )
  ).map((e) => ({ meal: e.meal, icon: e.icon, adherence: Math.round(e.total / e.count) }));

  return (
    <div className="min-h-screen bg-background pb-6 md:pb-0">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">{t("progress.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("progress.subtitle")}</p>
        </div>
      </header>

      {/* Tab Toggle */}
      <div className="px-4 py-4 bg-card border-b border-border">
        <div className="flex gap-2 p-1 bg-secondary rounded-xl max-w-2xl mx-auto">
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

      <main className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {isLoading ? (
          <ProgressPageSkeleton />
        ) : activeTab === "daily" ? (
          <div className="animate-fade-in-slide">
            {/* Date Navigator */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="font-semibold">{t("progress.today")}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString(i18n.language, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Button variant="ghost" size="icon" disabled>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Daily Score */}
            <Card className="card-shadow animate-fade-up">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-primary">{dailyStats?.dailyScore || 0}%</span>
                </div>
                <p className={cn(
                  "text-lg font-semibold",
                  (dailyStats?.dailyScore || 0) >= 70 ? "text-success" :
                  (dailyStats?.dailyScore || 0) >= 40 ? "text-warning" : "text-destructive"
                )}>
                  {getScoreLabel(dailyStats?.dailyScore || 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("progress.meals_logged", {
                    logged: todayMeals.length,
                    total: totalPlannedMeals || todayMeals.length,
                  })}
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
                    state={{ mealType: meal.type, mealLogId: meal.id }}
                    className="block animate-fade-up"
                    style={{ animationDelay: `${(idx + 2) * 100}ms` }}
                  >
                    <MealCard meal={meal} />
                  </Link>
                ))}

                {/* Meals in the plan that haven't been logged yet */}
                {pendingMeals.map((pending) => (
                  <Card
                    key={pending.type}
                    className="card-shadow border-dashed border-2 animate-fade-up animate-delay-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <span className="text-2xl opacity-50">{pending.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-muted-foreground">{pending.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("progress.not_logged")}
                            {pending.scheduledTime && ` • ${pending.scheduledTime}`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Daily Insights — derived from the meals actually logged today */}
            <Card className="card-shadow animate-fade-up animate-delay-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("progress.todays_insights")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("progress.no_insights")}</p>
                ) : (
                  insights.map((insight, idx) => {
                    const values = {
                      ...insight.values,
                      meal: t(`mealCard.${insight.values.meal}`, String(insight.values.meal)),
                    };
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg",
                          insight.tone === "positive" ? "bg-success/10" : "bg-warning/10"
                        )}
                      >
                        {insight.tone === "positive" ? (
                          <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {t(`progress.${insight.key}_title`, values)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t(`progress.${insight.key}_desc`, values)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        ) : activeTab === "weekly" ? (
          <div className="animate-fade-in-slide space-y-6">
            {/* Week Navigator */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handlePreviousWeek}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="font-semibold">{t("progress.this_week")}</p>
                <p className="text-sm text-muted-foreground">{weekRangeLabel}</p>
              </div>
              <Button variant="ghost" size="icon" disabled>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Weekly Chart */}
            <Card className="card-shadow animate-fade-up">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t("progress.daily_adherence")}</CardTitle>
                  {trend !== null && (
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
                {adherenceByMeal.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("progress.no_meal_breakdown")}</p>
                )}
                {adherenceByMeal.map((item, idx) => (
                  <div
                    key={item.meal}
                    className="space-y-2 animate-fade-up"
                    style={{ animationDelay: `${(idx + 4) * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span className="font-medium text-sm">{item.meal}</span>
                      </div>
                      <span className={cn(
                        "text-sm font-semibold",
                        item.adherence >= 70 ? "text-success" : item.adherence >= 50 ? "text-warning" : "text-destructive"
                      )}>
                        {item.adherence}%
                      </span>
                    </div>
                    <ProgressBar
                      value={item.adherence}
                      status={item.adherence >= 70 ? "high" : item.adherence >= 50 ? "medium" : "low"}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Insights */}
            <Card className="card-shadow animate-fade-up animate-delay-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("progress.weekly_insights")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {daysWithData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("progress.no_insights")}</p>
                ) : (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">
                          {t("progress.insight_best_day_title", { day: bestDay?.day ?? "" })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("progress.insight_best_day_desc", { score: bestDay?.score ?? 0 })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">
                          {t("progress.insight_days_on_plan_title", {
                            onPlan: onPlanDays,
                            total: daysWithData.length,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("progress.insight_days_on_plan_desc")}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
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

    </div>
  );
}
