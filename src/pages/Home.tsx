import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AdherenceScore, getScoreStatus } from "@/components/AdherenceScore";
import { MealCard } from "@/components/MealCard";
import { BottomNav } from "@/components/BottomNav";
import { MealLogModal } from "@/components/MealLogModal";
import { Flame, TrendingUp, Calendar } from "lucide-react";

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
  {
    id: "3",
    type: "snack" as const,
    name: "Greek yogurt",
    time: "3:30 PM",
    score: 88,
    foods: ["Greek yogurt", "Granola"],
    feedback: "Great snack choice!",
  },
];

export default function Home() {
  const [isMealLogOpen, setIsMealLogOpen] = useState(false);
  
  const dailyScore = 85;
  const streak = 7;
  const weeklyAverage = 82;

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
                  
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2">
                      <Flame className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold">{streak} day streak</span>
                    </div>
                    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">{weeklyAverage}% weekly</span>
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
                <span className="text-sm text-muted-foreground">3 of 4</span>
              </div>
              <Progress value={75} status={getScoreStatus(75)} />
            </div>
          </CardContent>
        </Card>

        {/* Today's Meals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Meals</h2>
            <span className="text-sm text-muted-foreground">View all</span>
          </div>
          <div className="space-y-3">
            {mockMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </div>

        {/* Upcoming suggestion */}
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
      </main>

      <BottomNav onCameraClick={() => setIsMealLogOpen(true)} />
      <MealLogModal isOpen={isMealLogOpen} onClose={() => setIsMealLogOpen(false)} />
    </div>
  );
}
