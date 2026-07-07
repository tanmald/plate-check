import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlignmentScore, getScoreStatus } from "@/components/AlignmentScore";
import { MealCard } from "@/components/MealCard";
import { HomePageSkeleton } from "@/components/PageSkeletons";
import { useAuth, useUserProfile } from "@/hooks/use-auth";
import { useTodayMeals } from "@/hooks/use-meals";
import { useNutritionPlan } from "@/hooks/use-nutrition-plan";
import { useDailyProgress } from "@/hooks/use-progress";
import { Flame, TrendingUp, Calendar, Camera, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return t("home.greeting_morning");
  if (hour >= 12 && hour < 18) return t("home.greeting_afternoon");
  return t("home.greeting_evening");
}

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { data: meals = [], isLoading: mealsLoading } = useTodayMeals();
  const { data: planData, isLoading: planLoading } = useNutritionPlan();
  const { data: dailyStats, isLoading: statsLoading } = useDailyProgress();

  const hasPlan = planData?.hasPlan || false;
  const dailyScore = dailyStats?.dailyScore || 0;
  const streak = dailyStats?.streak || 0;
  const weeklyAverage = dailyStats?.weeklyAverage || 0;
  const mealsLogged = dailyStats?.mealsLogged || 0;
  const totalMeals = dailyStats?.totalMeals || 4;

  const isLoading = mealsLoading || planLoading || statsLoading;

  return (
    <div className="min-h-screen bg-background pb-6 md:pb-0">
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

      <main className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
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
                          Sunday, Jan 5
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

                    <AlignmentScore score={dailyScore} size="md" />
                  </div>
                </div>

                {/* Meal progress */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t("home.meals_logged")}</span>
                    <span className="text-sm text-muted-foreground">{t("home.meals_of", { logged: mealsLogged, total: totalMeals })}</span>
                  </div>
                  <Progress value={(mealsLogged / totalMeals) * 100} status={getScoreStatus(dailyScore)} />
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
                      state={{ mealType: meal.type }}
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
            <Card className="card-shadow border-l-4 border-l-accent animate-fade-up animate-delay-300 hover-lift">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🍽️</div>
                  <div>
                    <h3 className="font-semibold text-sm">{t("home.dinner_suggestion")}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("home.dinner_suggestion_desc")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Trust note */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3 h-3" />
          <span>{t("common.wellness_note")}</span>
        </div>
      </main>

    </div>
  );
}
