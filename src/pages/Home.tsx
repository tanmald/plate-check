import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AdherenceScore, getScoreStatus } from "@/components/AdherenceScore";
import { MealCard } from "@/components/MealCard";
import { BottomNav } from "@/components/BottomNav";
import { Flame, TrendingUp, Calendar, Camera, Info } from "lucide-react";

const mockMeals = [
  {
    id: "1",
    type: "breakfast" as const,
    name: "Oatmeal with berries",
    time: "8:30 AM",
    score: 92,
    foods: ["Oats", "Blueberries", "Almonds", "Honey"],
    feedback: "Perfect match with your breakfast template!",
  },
  {
    id: "2",
    type: "lunch" as const,
    name: "Grilled chicken salad",
    time: "12:45 PM",
    score: 78,
    foods: ["Chicken breast", "Mixed greens", "Tomatoes", "Caesar dressing"],
    feedback: "Good protein choice. Consider olive oil instead of Caesar.",
  },
];

export default function Home() {
  const dailyScore = 85;
  const streak = 7;
  const weeklyAverage = 82;
  const hasPlan = true;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Good afternoon,</p>
              <h1 className="text-2xl font-bold text-foreground">Sarah</h1>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">👋</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {!hasPlan ? (
          /* Empty State - No plan */
          <Card className="card-shadow">
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
            <Card className="card-shadow overflow-hidden">
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
                    <span className="text-sm text-muted-foreground">2 of 4</span>
                  </div>
                  <Progress value={50} status={getScoreStatus(75)} />
                </div>
              </CardContent>
            </Card>

            {/* Primary CTA */}
            <Button asChild size="xl" className="w-full">
              <Link to="/log" className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Log Meal
              </Link>
            </Button>

            {/* Today's Meals */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Today's Meals</h2>
                <Link to="/progress" className="text-sm text-primary font-medium">View all</Link>
              </div>
              <div className="space-y-3">
                {mockMeals.map((meal) => (
                  <Link key={meal.id} to="/meal-result" state={{ mealType: meal.type }}>
                    <MealCard meal={meal} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Next meal suggestion */}
            <Card className="card-shadow border-l-4 border-l-accent">
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
