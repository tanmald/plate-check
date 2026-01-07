import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { WeeklyChart } from "@/components/WeeklyChart";
import { MealCard } from "@/components/MealCard";
import { TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const weeklyData = [
  { day: "Monday", shortDay: "Mon", score: 88, mealsLogged: 4 },
  { day: "Tuesday", shortDay: "Tue", score: 75, mealsLogged: 4 },
  { day: "Wednesday", shortDay: "Wed", score: 92, mealsLogged: 4 },
  { day: "Thursday", shortDay: "Thu", score: 68, mealsLogged: 3 },
  { day: "Friday", shortDay: "Fri", score: 45, mealsLogged: 2 },
  { day: "Saturday", shortDay: "Sat", score: 82, mealsLogged: 4 },
  { day: "Sunday", shortDay: "Sun", score: 85, mealsLogged: 3, isToday: true },
];

const todayMeals = [
  {
    id: "1",
    type: "breakfast" as const,
    name: "Oatmeal with berries",
    time: "8:30 AM",
    score: 92,
    foods: ["Oats", "Blueberries", "Almonds"],
    feedback: "Perfect match!",
  },
  {
    id: "2",
    type: "lunch" as const,
    name: "Grilled chicken salad",
    time: "12:45 PM",
    score: 78,
    foods: ["Chicken", "Greens", "Tomatoes"],
    feedback: "Good protein choice.",
  },
  {
    id: "3",
    type: "snack" as const,
    name: "Greek yogurt",
    time: "3:30 PM",
    score: 88,
    foods: ["Greek yogurt", "Granola"],
    feedback: "Great snack!",
  },
];

export default function Progress() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  
  const weeklyAverage = Math.round(weeklyData.reduce((acc, d) => acc + d.score, 0) / weeklyData.length);
  const onPlanDays = weeklyData.filter(d => d.score >= 60).length;
  const offPlanPercentage = Math.round(((7 - onPlanDays) / 7) * 100);
  const lastWeekAverage = 78;
  const trend = weeklyAverage - lastWeekAverage;

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
        {activeTab === "daily" && (
          <>
            {/* Date Navigator */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="font-semibold">Today</p>
                <p className="text-sm text-muted-foreground">Sunday, Jan 5</p>
              </div>
              <Button variant="ghost" size="icon" disabled>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Daily Score */}
            <Card className="card-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-primary">85%</span>
                </div>
                <p className="text-lg font-semibold text-success">On plan</p>
                <p className="text-sm text-muted-foreground">3 of 4 meals logged</p>
              </CardContent>
            </Card>

            {/* Today's Meals */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Today's Meals</h2>
              <div className="space-y-3">
                {todayMeals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
                
                {/* Pending meal */}
                <Card className="card-shadow border-dashed border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <span className="text-2xl opacity-50">🌙</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-muted-foreground">Dinner</p>
                        <p className="text-sm text-muted-foreground">Not logged yet</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Daily Insights */}
            <Card className="card-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Today's Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Great breakfast choice</p>
                    <p className="text-xs text-muted-foreground">Matched all required food groups</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Lunch dressing swap suggested</p>
                    <p className="text-xs text-muted-foreground">Try olive oil instead of Caesar next time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "weekly" && (
          <>
            {/* Week Navigator */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="font-semibold">This Week</p>
                <p className="text-sm text-muted-foreground">Dec 30 - Jan 5</p>
              </div>
              <Button variant="ghost" size="icon" disabled>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Weekly Chart */}
            <Card className="card-shadow">
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
              <Card className="card-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-primary">{weeklyAverage}%</p>
                  <p className="text-sm text-muted-foreground">Weekly Average</p>
                </CardContent>
              </Card>
              
              <Card className="card-shadow">
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
            <Card className="card-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Adherence by Meal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { meal: "Breakfast", adherence: 92, icon: "🌅" },
                  { meal: "Lunch", adherence: 78, icon: "☀️" },
                  { meal: "Dinner", adherence: 71, icon: "🌙" },
                  { meal: "Snacks", adherence: 85, icon: "🍎" },
                ].map((item) => (
                  <div key={item.meal} className="space-y-2">
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
            <Card className="card-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Strong breakfast routine</p>
                    <p className="text-xs text-muted-foreground">Consistent morning meals all week</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Friday was off-plan</p>
                    <p className="text-xs text-muted-foreground">Social dining - marked as exception</p>
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
