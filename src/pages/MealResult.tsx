import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, AlertCircle, Sparkles, Info, RefreshCw, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlignmentScore } from "@/components/AlignmentScore";
import { FoodItemEditor } from "@/components/FoodItemEditor";
import { AddFoodSheet } from "@/components/AddFoodSheet";
import { cn } from "@/lib/utils";
import { MealLogResult } from "@/hooks/use-meals";
import {
  getScoreBreakdown,
  generateFoodId,
  type EditableFood,
} from "@/lib/scoring";
import { useUpdateMealLog } from "@/hooks/use-update-meal-log";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser } from "@/lib/test-data";
import posthog from "@/lib/posthog";
import { useTranslation } from "react-i18next";

const mockResult = {
  score: 78,
  status: "Aligned" as const,
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const updateMealLog = useUpdateMealLog();

  const mealType = location.state?.mealType || "lunch";
  const analysisResult = location.state?.analysisResult as MealLogResult | undefined;
  const photoPreview = location.state?.photoPreview as string | undefined;
  const mealLogId = (location.state?.mealLogId || analysisResult?.mealLogId) as string | undefined;

  const result = analysisResult || mockResult;
  const missingRequired: string[] = analysisResult?.missingRequired ?? [];

  const [editableFoods, setEditableFoods] = useState<EditableFood[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);

  useEffect(() => {
    const initialFoods: EditableFood[] = (
      analysisResult?.detectedFoods || mockResult.detectedFoods
    ).map((food) => ({
      id: generateFoodId(),
      name: food.name,
      matched: food.matched,
      matchType: food.matchType,
      category: food.category || "Other",
    }));
    setEditableFoods(initialFoods);
  }, [analysisResult]);

  useEffect(() => {
    posthog.capture('meal result viewed', {
      meal_type: mealType,
      has_real_data: !!analysisResult,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const breakdown = getScoreBreakdown(editableFoods, missingRequired);
  const currentScore = breakdown.score;

  const handleFoodUpdate = (id: string, updates: Partial<EditableFood>) => {
    setEditableFoods((prev) =>
      prev.map((food) => {
        if (food.id !== id) return food;
        const merged = { ...food, ...updates };
        if ("matched" in updates && !("matchType" in updates)) {
          if (!updates.matched) {
            merged.matchType = "off_plan";
          } else if (food.matchType === "off_plan") {
            merged.matchType = "allowed";
          }
        }
        return merged;
      })
    );
    setHasChanges(true);
  };

  const handleFoodDelete = (id: string) => {
    setEditableFoods((prev) =>
      prev.map((food) => food.id === id ? { ...food, isDeleted: true } : food)
    );
    setHasChanges(true);
  };

  const handleFoodUndo = (id: string) => {
    setEditableFoods((prev) =>
      prev.map((food) => food.id === id ? { ...food, isDeleted: false } : food)
    );
  };

  const handleAddFood = (newFood: EditableFood) => {
    setEditableFoods((prev) => [...prev, newFood]);
    setHasChanges(true);
  };

  const suggestions = analysisResult
    ? analysisResult.suggestedSwaps.map((swap) => ({
        food: swap.original,
        replacement: Array.isArray(swap.suggested) ? swap.suggested.join(", ") : swap.suggested,
        reason: swap.reason,
      }))
    : mockResult.suggestions;

  const handleSave = async () => {
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
    posthog.capture('meal result saved', { meal_type: mealType, had_corrections: hasChanges });
    navigate("/");
  };

  const handleRetake = () => navigate("/log");

  const getStatusLabel = (score: number) => {
    if (score >= 70) return t("mealResult.aligned");
    if (score >= 40) return t("mealResult.needs_attention");
    return t("mealResult.not_aligned");
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case "high":   return { label: t("mealResult.confidence_high"),   color: "text-success" };
      case "medium": return { label: t("mealResult.confidence_medium"), color: "text-warning" };
      default:       return { label: t("mealResult.confidence_low"),    color: "text-muted-foreground" };
    }
  };

  const confidenceInfo = getConfidenceLabel(result.confidence);
  const activeFoodsCount = editableFoods.filter((f) => !f.isDeleted).length;

  return (
    <div className="min-h-screen bg-background pb-6 md:pb-0">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("mealResult.title")}</h1>
              <p className="text-sm text-muted-foreground capitalize">
                {mealType} • {t("mealResult.just_now")}
                {hasChanges && (
                  <span className="ml-2 text-primary">• {t("mealResult.edited")}</span>
                )}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRetake}>
              <RefreshCw className="w-4 h-4 mr-1" />
              {t("mealResult.retake")}
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Photo Preview */}
        {photoPreview && (
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden card-shadow">
            <img src={photoPreview} alt="Meal photo" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Score Section */}
        <div className="flex flex-col items-center pt-4">
          <AlignmentScore score={currentScore} size="lg" animated />
          <div className="mt-4 text-center">
            <p className={cn(
              "text-lg font-semibold",
              currentScore >= 70 ? "text-success" :
              currentScore >= 40 ? "text-warning" : "text-destructive"
            )}>
              {getStatusLabel(currentScore)}
            </p>
            <p className={cn("text-sm", confidenceInfo.color)}>{confidenceInfo.label}</p>
          </div>
        </div>

        {/* Score Breakdown */}
        <Card className="card-shadow">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">{t("mealResult.score_breakdown")}</h3>

            <div className="flex flex-wrap items-center gap-1.5 text-xs p-3 bg-muted/40 rounded-lg font-mono">
              <span className="text-foreground font-medium">100</span>
              {breakdown.missingPenalty > 0 && (
                <>
                  <span className="text-muted-foreground">−</span>
                  <span className="text-destructive font-medium">{breakdown.missingPenalty}</span>
                  <span className="text-muted-foreground">{t("mealResult.missing_penalty")}</span>
                </>
              )}
              {breakdown.offPlanPenalty > 0 && (
                <>
                  <span className="text-muted-foreground">−</span>
                  <span className="text-warning font-medium">{breakdown.offPlanPenalty}</span>
                  <span className="text-muted-foreground">{t("mealResult.off_plan_penalty")}</span>
                </>
              )}
              <span className="text-muted-foreground">=</span>
              <span className={cn(
                "font-bold text-sm",
                currentScore >= 70 ? "text-success" : currentScore >= 40 ? "text-warning" : "text-destructive"
              )}>
                {currentScore}
              </span>
            </div>

            {breakdown.requiredPresent.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                  {t("mealResult.required_on_plate")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {breakdown.requiredPresent.map((food) => (
                    <span key={food.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-medium">
                      <Check className="w-3 h-3" /> {food.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {breakdown.allowedPresent.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                  {t("mealResult.allowed_on_plate")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {breakdown.allowedPresent.map((food) => (
                    <span key={food.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-secondary-foreground border border-border rounded-full text-xs">
                      {food.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {breakdown.missingRequired.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                  {t("mealResult.required_missing")}
                  <span className="ml-1 text-destructive">(−{breakdown.missingPenalty} pts)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {breakdown.missingRequired.map((food, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full text-xs font-medium">
                      <X className="w-3 h-3" /> {food}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {breakdown.offPlan.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                  {t("mealResult.not_aligned_label")}
                  <span className="ml-1 text-warning">(−{breakdown.offPlanPenalty} pts)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {breakdown.offPlan.map((food) => (
                    <span key={food.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs">
                      <AlertCircle className="w-3 h-3" /> {food.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {breakdown.missingRequired.length === 0 && breakdown.offPlan.length === 0 && editableFoods.length > 0 && (
              <p className="text-xs text-success text-center py-1">{t("mealResult.all_matched")}</p>
            )}
          </CardContent>
        </Card>

        {/* Detected Foods - Editable */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>{t("mealResult.detected_foods")}</span>
              <span className="text-xs text-muted-foreground font-normal">
                {t("mealResult.items_count", { count: activeFoodsCount })}
              </span>
              <span className="text-xs text-primary font-normal ml-auto">
                {t("mealResult.tap_to_edit")}
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

            <Button variant="outline" className="w-full mt-4" onClick={() => setShowAddSheet(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("mealResult.add_food")}
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
                <h3 className="font-semibold mb-1">{t("mealResult.ai_feedback")}</h3>
                <p className="text-sm text-muted-foreground">{result.feedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Swaps */}
        {suggestions.length > 0 && (
          <Card className="card-shadow">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">{t("mealResult.suggested_swaps")}</h3>
              <div className="space-y-3">
                {suggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground line-through">{suggestion.food}</p>
                        <p className="text-xs text-muted-foreground">→</p>
                        <p className="text-sm font-medium text-primary">{suggestion.replacement}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-[120px] text-right">{suggestion.reason}</p>
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
            {t("mealResult.analysis_confidence", { confidence: result.confidence })}
          </p>
        </div>

        {/* Wellness disclaimer */}
        <div className="p-3 bg-muted/50 rounded-xl">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">{t("mealResult.wellness_disclaimer")}</p>
          </div>
        </div>
      </main>

      {/* Fixed bottom action */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-2xl mx-auto">
          <Button
            size="xl"
            className="w-full"
            onClick={handleSave}
            disabled={updateMealLog.isPending}
          >
            {updateMealLog.isPending ? t("mealResult.saving") : t("mealResult.save_meal")}
          </Button>
        </div>
      </div>

      <AddFoodSheet open={showAddSheet} onOpenChange={setShowAddSheet} onAddFood={handleAddFood} />
    </div>
  );
}
