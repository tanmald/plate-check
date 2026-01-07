import { useNavigate, useLocation } from "react-router-dom";
import { Check, AlertCircle, Sparkles, Info, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdherenceScore } from "@/components/AdherenceScore";
import { BottomNav } from "@/components/BottomNav";
import { cn } from "@/lib/utils";

const mockResult = {
  score: 78,
  status: "On plan" as const,
  confidence: "high" as const,
  detectedFoods: [
    { name: "Grilled chicken breast", matched: true, category: "Protein" },
    { name: "Brown rice", matched: true, category: "Carbs" },
    { name: "Steamed broccoli", matched: true, category: "Vegetables" },
    { name: "Caesar dressing", matched: false, category: "Sauce" },
  ],
  feedback: "Great protein choice! The chicken and rice match your lunch template. Consider using olive oil instead of Caesar dressing for better plan adherence.",
  suggestions: [
    { food: "Caesar dressing", replacement: "Olive oil & lemon", reason: "Lower sodium, fits plan" },
  ],
};

export default function MealResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const mealType = location.state?.mealType || "lunch";

  const handleSave = () => {
    navigate("/");
  };

  const handleRetake = () => {
    navigate("/log");
  };

  const getStatusLabel = (score: number) => {
    if (score >= 70) return "On plan";
    if (score >= 40) return "Needs attention";
    return "Off plan";
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case "high": return { label: "High confidence", color: "text-success" };
      case "medium": return { label: "Medium confidence", color: "text-warning" };
      default: return { label: "Low confidence", color: "text-muted-foreground" };
    }
  };

  const confidenceInfo = getConfidenceLabel(mockResult.confidence);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Meal Analysis</h1>
              <p className="text-sm text-muted-foreground capitalize">{mealType} • Just now</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRetake}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Retake
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Score Section */}
        <div className="flex flex-col items-center pt-4">
          <AdherenceScore score={mockResult.score} size="lg" />
          <div className="mt-4 text-center">
            <p className={cn(
              "text-lg font-semibold",
              mockResult.score >= 70 ? "text-success" : 
              mockResult.score >= 40 ? "text-warning" : "text-destructive"
            )}>
              {getStatusLabel(mockResult.score)}
            </p>
            <p className={cn("text-sm", confidenceInfo.color)}>
              {confidenceInfo.label}
            </p>
          </div>
        </div>

        {/* Detected Foods */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>Detected Foods</span>
              <span className="text-xs text-muted-foreground font-normal">
                ({mockResult.detectedFoods.length} items)
              </span>
            </h3>
            <div className="space-y-2">
              {mockResult.detectedFoods.map((food, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl",
                    food.matched ? "bg-success/10" : "bg-warning/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {food.matched ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-warning" />
                    )}
                    <div>
                      <span className={cn(
                        "font-medium text-sm",
                        food.matched ? "text-success" : "text-warning"
                      )}>
                        {food.name}
                      </span>
                      <p className="text-xs text-muted-foreground">{food.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback */}
        <Card className="card-shadow border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI Feedback</h3>
                <p className="text-sm text-muted-foreground">{mockResult.feedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fix Foods Suggestions */}
        {mockResult.suggestions.length > 0 && (
          <Card className="card-shadow">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Suggested Swaps</h3>
              <div className="space-y-3">
                {mockResult.suggestions.map((suggestion, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground line-through">{suggestion.food}</p>
                        <p className="text-xs text-muted-foreground">→</p>
                        <p className="text-sm font-medium text-primary">{suggestion.replacement}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-[120px] text-right">
                      {suggestion.reason}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confidence Indicator */}
        <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-xl">
          <Info className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground text-center">
            Analysis confidence: {mockResult.confidence}. Results may vary based on photo quality.
          </p>
        </div>

        {/* Trust note */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3 h-3" />
          <span>Wellness support, not medical advice</span>
        </div>
      </main>

      {/* Fixed bottom action */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-lg mx-auto">
          <Button size="xl" className="w-full" onClick={handleSave}>
            Save Meal
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
