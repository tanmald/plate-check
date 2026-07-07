import { useState } from "react";
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

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

function formatWeekRangeLabel(): string {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(startDate)} - ${fmt(endDate)}`;
}

export default function Progress() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const { data: todayMeals = [], isLoading: mealsLoading } = useTodayMeals();
  const { data: dailyStats, isLoading: dailyLoading } = useDailyProgress();
  const { data: weeklyData = [], isLoading: weeklyLoading } = useWeeklyProgress();
  const { data: planData } = useNutritionPlan();
  const { data: mealTypeAdherence = [], isLoading: mealTypeLoading } = useAdherenceByMealType();
  const { data: lastWeekAverage = 0, isLoading: lastWeekLoading } = usePreviousWeekAverage();

  const isLoading = mealsLoading || dailyLoading || weeklyLoading || mealTypeLoading || lastWeekLoading;

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
  const trend = weeklyAverage - lastWeekAverage;

  const handlePreviousDay = () => {
    toast.info("Previous day navigation coming soon");
  };

  const handlePreviousWeek = () => {
    toast.info("Previous week navigation coming soon");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Progress</h1>
          <p className="text-sm text-muted-foreground">Track your nutrition adherence</p>
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
            Daily Summary
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
            Weekly View
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
              <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="font-semibold">Today</p>
                <p className="text-sm text-muted-foreground">{formatDayLabel(new Date())}</p>
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
                <p className={cn("text-lg font-semibold", getScoreColor(dailyStats?.dailyScore || 0))}>
                  {getScoreLabel(dailyStats?.dailyScore || 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {dailyStats?.mealsLogged || 0} of {totalMeals} meals logged
                </p>
              </CardContent>
            </Card>

            {/* Today's Meals */}
            <div className="animate-fade-up animate-delay-100">
              <h2 className="text-lg font-semibold mb-4">Today's Meals</h2>
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
                          <p className="text-sm text-muted-foreground">Not logged yet</p>
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
                  <CardTitle className="text-base">Today's Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bestMeal && bestMeal.score >= 70 && (
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{bestMeal.name} was on track ({bestMeal.score}%)</p>
                        <p className="text-xs text-muted-foreground">
                          {bestMeal.feedback || "Matched your plan well"}
                        </p>
                      </div>
                    </div>
                  )}
                  {worstMeal && worstMeal.score < 70 && (
                    <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{worstMeal.name} needs attention ({worstMeal.score}%)</p>
                        <p className="text-xs text-muted-foreground">
                          {worstMeal.feedback || "Check the breakdown for what threw off the score"}
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
              <Button variant="ghost" size="icon" onClick={handlePreviousWeek}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="font-semibold">This Week</p>
                <p className="text-sm text-muted-foreground">{formatWeekRangeLabel()}</p>
              </div>
              <Button variant="ghost" size="icon" disabled>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Weekly Chart */}
            <Card className="card-shadow animate-fade-up">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Daily Adherence</CardTitle>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    trend >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {trend >= 0 ? "+" : ""}{trend}% vs last week
                  </div>
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
                  <p className="text-sm text-muted-foreground">Weekly Average</p>
                </CardContent>
              </Card>
              
              <Card className="card-shadow animate-fade-up animate-delay-200 hover-lift">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="w-6 h-6 text-warning" />
                  </div>
                  <p className="text-3xl font-bold text-warning">{offPlanPercentage}%</p>
                  <p className="text-sm text-muted-foreground">Off-Plan Days</p>
                </CardContent>
              </Card>
            </div>

            {/* Plan Adherence Breakdown */}
            <Card className="card-shadow animate-fade-up animate-delay-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Adherence by Meal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sortedMealTypeAdherence.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Log meals this week to see your adherence by meal type.
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
                          <span className="font-medium text-sm capitalize">{item.type}</span>
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
                  <CardTitle className="text-base">Weekly Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bestDay && bestDay.score >= 70 && (
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Best day: {bestDay.day} ({bestDay.score}%)</p>
                        <p className="text-xs text-muted-foreground">{bestDay.mealsLogged} meals logged</p>
                      </div>
                    </div>
                  )}
                  {worstDay && worstDay.score < 70 && (
                    <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{worstDay.day} needs attention ({worstDay.score}%)</p>
                        <p className="text-xs text-muted-foreground">{worstDay.mealsLogged} meals logged</p>
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
            <span>Wellness support, not medical advice</span>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
