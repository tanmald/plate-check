import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, AlertCircle, Sparkles, Info, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdherenceScore } from "@/components/AdherenceScore";
import { BottomNav } from "@/components/BottomNav";
import { FoodItemEditor } from "@/components/FoodItemEditor";
import { AddFoodSheet } from "@/components/AddFoodSheet";
import { cn } from "@/lib/utils";
import { MealLogResult } from "@/hooks/use-meals";

import {
  calculateAdherenceScore,
  generateFoodId,
  type EditableFood,
} from "@/lib/scoring";
import { useUpdateMealLog } from "@/hooks/use-update-meal-log";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser } from "@/lib/test-data";

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
  feedback:
    "Great protein choice! The chicken and rice match your lunch template. Consider using olive oil instead of Caesar dressing for better plan adherence.",
  suggestions: [
    {
      food: "Caesar dressing",
      replacement: "Olive oil & lemon",
      reason: "Lower sodium, fits plan",
    },
  ],
};

export default function MealResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const updateMealLog = useUpdateMealLog();

  const mealType = location.state?.mealType || "lunch";
  const analysisResult = location.state?.analysisResult as
    | MealLogResult
    | undefined;
  const photoPreview = location.state?.photoPreview as string | undefined;
  const mealLogId = (location.state?.mealLogId || analysisResult?.mealLogId) as string | undefined;

  // Use real data if available, otherwise fall back to mockResult
  const result = analysisResult || mockResult;

  // Initialize editable foods state
  const [editableFoods, setEditableFoods] = useState<EditableFood[]>([]);
  const [currentScore, setCurrentScore] = useState(result.score);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);

  // Initialize editable foods from detected foods
  useEffect(() => {
    const initialFoods: EditableFood[] = (
      analysisResult?.detectedFoods || mockResult.detectedFoods
    ).map((food, index) => ({
      id: generateFoodId(),
      name: food.name,
      matched: food.matched,
      category: food.category || "Other",
    }));
    setEditableFoods(initialFoods);
    setCurrentScore(result.score);
  }, [analysisResult, result.score]);

  // Recalculate score when foods change
  useEffect(() => {
    if (editableFoods.length > 0) {
      const newScore = calculateAdherenceScore(editableFoods);
      setCurrentScore(newScore);
    }
  }, [editableFoods]);

  const handleFoodUpdate = (id: string, updates: Partial<EditableFood>) => {
    setEditableFoods((prev) =>
      prev.map((food) => (food.id === id ? { ...food, ...updates } : food))
    );
    setHasChanges(true);
  };

  const handleFoodDelete = (id: string) => {
    setEditableFoods((prev) =>
      prev.map((food) =>
        food.id === id ? { ...food, isDeleted: true } : food
      )
    );
    setHasChanges(true);
  };

  const handleFoodUndo = (id: string) => {
    setEditableFoods((prev) =>
      prev.map((food) =>
        food.id === id ? { ...food, isDeleted: false } : food
      )
    );
  };

  const handleAddFood = (newFood: EditableFood) => {
    setEditableFoods((prev) => [...prev, newFood]);
    setHasChanges(true);
  };

  const suggestions = analysisResult
    ? analysisResult.suggestedSwaps.map((swap) => ({
        food: swap.original,
        replacement: swap.suggested,
        reason: swap.reason,
      }))
    : mockResult.suggestions;

  const handleSave = async () => {
    // If there are changes and we have a meal log ID, update the database
    if (hasChanges && mealLogId && !isTestUser(user?.email)) {
      try {
        await updateMealLog.mutateAsync({
          id: mealLogId,
          userCorrections: editableFoods,
          correctedScore: currentScore,
        });
      } catch (error) {
        console.error("Failed to save corrections:", error);
      }
    }
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
      case "high":
        return { label: "High confidence", color: "text-success" };
      case "medium":
        return { label: "Medium confidence", color: "text-warning" };
      default:
        return { label: "Low confidence", color: "text-muted-foreground" };
    }
  };

  const confidenceInfo = getConfidenceLabel(result.confidence);
  const activeFoodsCount = editableFoods.filter((f) => !f.isDeleted).length;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Meal Analysis
              </h1>
              <p className="text-sm text-muted-foreground capitalize">
                {mealType} • Just now
                {hasChanges && (
                  <span className="ml-2 text-primary">• Edited</span>
                )}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRetake}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Retake
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Photo Preview */}
        {photoPreview && (
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden card-shadow">
            <img
              src={photoPreview}
              alt="Meal photo"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Score Section */}
        <div className="flex flex-col items-center pt-4">
          <AdherenceScore score={currentScore} size="lg" animated />
          <div className="mt-4 text-center">
            <p
              className={cn(
                "text-lg font-semibold",
                currentScore >= 70
                  ? "text-success"
                  : currentScore >= 40
                  ? "text-warning"
                  : "text-destructive"
              )}
            >
              {getStatusLabel(currentScore)}
            </p>
            <p className={cn("text-sm", confidenceInfo.color)}>
              {confidenceInfo.label}
            </p>
          </div>
        </div>

        {/* Detected Foods - Editable */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>Detected Foods</span>
              <span className="text-xs text-muted-foreground font-normal">
                ({activeFoodsCount} items)
              </span>
              <span className="text-xs text-primary font-normal ml-auto">
                Tap to edit
              </span>
            </h3>
            <div className="space-y-2">
              {editableFoods.map((food) => (
                <FoodItemEditor
                  key={food.id}
                  food={food}
                  onUpdate={(updates) => handleFoodUpdate(food.id, updates)}
                  onDelete={() => handleFoodDelete(food.id)}
                  onUndo={() => handleFoodUndo(food.id)}
                />
              ))}
            </div>

            {/* Add Food Button */}
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setShowAddSheet(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Food
            </Button>
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
                <p className="text-sm text-muted-foreground">
                  {result.feedback}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Swaps */}
        {suggestions.length > 0 && (
          <Card className="card-shadow">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Suggested Swaps</h3>
              <div className="space-y-3">
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground line-through">
                          {suggestion.food}
                        </p>
                        <p className="text-xs text-muted-foreground">→</p>
                        <p className="text-sm font-medium text-primary">
                          {suggestion.replacement}
                        </p>
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
            Analysis confidence: {result.confidence}. Results may vary based on
            photo quality.
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
          <Button
            size="xl"
            className="w-full"
            onClick={handleSave}
            disabled={updateMealLog.isPending}
          >
            {updateMealLog.isPending ? "Saving..." : "Save Meal"}
          </Button>
        </div>
      </div>

      {/* Add Food Sheet */}
      <AddFoodSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        onAddFood={handleAddFood}
      />

      <BottomNav />
    </div>
  );
}
