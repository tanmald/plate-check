import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/BottomNav";
import { MealLogModal } from "@/components/MealLogModal";
import { WeeklyChart } from "@/components/WeeklyChart";
import { TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle2 } from "lucide-react";
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

export default function Weekly() {
  const [isMealLogOpen, setIsMealLogOpen] = useState(false);
  
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
          <h1 className="text-2xl font-bold text-foreground">Weekly Overview</h1>
          <p className="text-sm text-muted-foreground">Dec 30 - Jan 5, 2026</p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
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
              <p className="text-sm text-muted-foreground">Off-Plan Meals</p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Adherence Breakdown */}
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Plan Adherence by Meal</CardTitle>
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
                <Progress 
                  value={item.adherence} 
                  size="sm"
                  status={item.adherence >= 70 ? "high" : item.adherence >= 50 ? "medium" : "low"}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-sm">Strong breakfast routine</p>
                <p className="text-xs text-muted-foreground">You've been consistent with morning meals all week</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-sm">Friday dinner was off-plan</p>
                <p className="text-xs text-muted-foreground">Social dining - marked as exception</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav onCameraClick={() => setIsMealLogOpen(true)} />
      <MealLogModal isOpen={isMealLogOpen} onClose={() => setIsMealLogOpen(false)} />
    </div>
  );
}
