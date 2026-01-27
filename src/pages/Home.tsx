import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AdherenceScore, getScoreStatus } from "@/components/AdherenceScore";
import { MealCard } from "@/components/MealCard";
import { BottomNav } from "@/components/BottomNav";
import { HomePageSkeleton } from "@/components/PageSkeletons";
import { useAuth, useUserProfile } from "@/hooks/use-auth";
import { useTodayMeals } from "@/hooks/use-meals";
import { useNutritionPlan } from "@/hooks/use-nutrition-plan";
import { useDailyProgress } from "@/hooks/use-progress";
import { Flame, TrendingUp, Calendar, Camera, Info } from "lucide-react";

// Get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{getGreeting()},</p>
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
              <h3 className="text-lg font-semibold mb-2">Get started with your plan</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Import your nutrition plan to start tracking your meals and see how well you're sticking to it.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link to="/plan">Import Plan</Link>
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
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">Today's adherence</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="w-4 h-4" />
                          Sunday, Jan 5
                        </p>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2">
                          <Flame className="w-4 h-4 text-accent" />
                          <span className="text-sm font-semibold">{streak} days</span>
                        </div>
                        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold">{weeklyAverage}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <AdherenceScore score={dailyScore} size="md" />
                  </div>
                </div>
                
                {/* Meal progress */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Meals logged today</span>
                    <span className="text-sm text-muted-foreground">{mealsLogged} of {totalMeals}</span>
                  </div>
                  <Progress value={(mealsLogged / totalMeals) * 100} status={getScoreStatus(dailyScore)} />
                </div>
              </CardContent>
            </Card>

            {/* Primary CTA */}
            <Button asChild size="xl" className="w-full animate-fade-up animate-delay-100">
              <Link to="/log" className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Log Meal
              </Link>
            </Button>

            {/* Today's Meals */}
            {meals.length > 0 && (
              <div className="animate-fade-up animate-delay-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Today's Meals</h2>
                  <Link to="/progress" className="text-sm text-primary font-medium">View all</Link>
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
                    <h3 className="font-semibold text-sm">Dinner suggestion</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on your plan, consider grilled salmon with quinoa and roasted vegetables.
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
          <span>Wellness support, not medical advice</span>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
