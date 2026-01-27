import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNutritionPlan } from "@/hooks/use-nutrition-plan";
import { useUpdateMealTemplate } from "@/hooks/use-update-meal-template";
import { toast } from "sonner";
import { ArrowLeft, Plus, X, Check, Loader2, Clock, Flame, Dumbbell, Zap, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type FoodCategory = "required" | "allowed" | "optional";

interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
}

export default function EditMealTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const { data: planData, isLoading: planLoading } = useNutritionPlan();
  const updateTemplate = useUpdateMealTemplate();

  // Form state
  const [name, setName] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [isOptional, setIsOptional] = useState(false);
  const [isPreWorkout, setIsPreWorkout] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodCategory, setNewFoodCategory] = useState<FoodCategory>("allowed");
  const [hasChanges, setHasChanges] = useState(false);

  // Find the template
  const template = planData?.plan?.templates.find(t => t.id === templateId);

  // Initialize form with template data
  useEffect(() => {
    if (template) {
      setName(template.name);
      setScheduledTime(template.scheduledTime || "");
      setCalories(template.calories || "");
      setProtein(template.protein || "");
      setIsOptional(template.isOptional);
      setIsPreWorkout(template.isPreWorkout);

      // Combine all foods into a single list with categories
      const allFoods: FoodItem[] = [
        ...template.requiredFoods.map((f, i) => ({ id: `req-${i}`, name: f, category: "required" as const })),
        ...template.allowedFoods.map((f, i) => ({ id: `all-${i}`, name: f, category: "allowed" as const })),
        ...(template.optionalAddons || []).map((f, i) => ({ id: `opt-${i}`, name: f, category: "optional" as const })),
      ];
      setFoods(allFoods);
    }
  }, [template]);

  // Track changes
  useEffect(() => {
    if (!template) return;

    const originalFoods = [
      ...template.requiredFoods.map(f => ({ name: f, category: "required" })),
      ...template.allowedFoods.map(f => ({ name: f, category: "allowed" })),
      ...(template.optionalAddons || []).map(f => ({ name: f, category: "optional" })),
    ];

    const currentFoods = foods.map(f => ({ name: f.name, category: f.category }));

    const changed =
      name !== template.name ||
      scheduledTime !== (template.scheduledTime || "") ||
      calories !== (template.calories || "") ||
      protein !== (template.protein || "") ||
      isOptional !== template.isOptional ||
      isPreWorkout !== template.isPreWorkout ||
      JSON.stringify(originalFoods) !== JSON.stringify(currentFoods);

    setHasChanges(changed);
  }, [name, scheduledTime, calories, protein, isOptional, isPreWorkout, foods, template]);

  const handleAddFood = () => {
    if (!newFoodName.trim()) return;

    setFoods([
      ...foods,
      {
        id: `new-${Date.now()}`,
        name: newFoodName.trim(),
        category: newFoodCategory,
      },
    ]);
    setNewFoodName("");
  };

  const handleRemoveFood = (id: string) => {
    setFoods(foods.filter(f => f.id !== id));
  };

  const handleChangeFoodCategory = (id: string, category: FoodCategory) => {
    setFoods(foods.map(f => f.id === id ? { ...f, category } : f));
  };

  const handleSave = () => {
    if (!templateId) return;

    const requiredFoods = foods.filter(f => f.category === "required").map(f => f.name);
    const allowedFoods = foods.filter(f => f.category === "allowed").map(f => f.name);
    const optionalAddons = foods.filter(f => f.category === "optional").map(f => f.name);

    updateTemplate.mutate(
      {
        templateId,
        updates: {
          name,
          scheduledTime: scheduledTime || null,
          calories,
          protein,
          isOptional,
          isPreWorkout,
          requiredFoods,
          allowedFoods,
          optionalAddons,
        },
      },
      {
        onSuccess: () => {
          toast.success("Template updated successfully");
          navigate("/plan");
        },
        onError: (error) => {
          console.error("Error updating template:", error);
          toast.error("Failed to update template");
        },
      }
    );
  };

  const handleBack = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Discard them?")) {
        navigate("/plan");
      }
    } else {
      navigate("/plan");
    }
  };

  if (planLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border safe-top">
          <div className="px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/plan")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Template Not Found</h1>
          </div>
        </header>
        <main className="px-4 py-6 text-center">
          <p className="text-muted-foreground">This template doesn't exist or has been deleted.</p>
          <Button className="mt-4" onClick={() => navigate("/plan")}>
            Back to Plan
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Edit Template</h1>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || updateTemplate.isPending}
          >
            {updateTemplate.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Template Icon & Name */}
        <Card className="card-shadow animate-fade-up">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                <span className="text-3xl">{template.icon}</span>
              </div>
              <div className="flex-1">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Breakfast"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timing & Macros */}
        <Card className="card-shadow animate-fade-up" style={{ animationDelay: "50ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Timing & Macros</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time" className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="calories" className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-accent" />
                  Calories
                </Label>
                <Input
                  id="calories"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="e.g., 400-500"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="protein" className="flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-primary" />
                Protein
              </Label>
              <Input
                id="protein"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="e.g., 30g"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card className="card-shadow animate-fade-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Options</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Optional Meal</span>
              </div>
              <Switch checked={isOptional} onCheckedChange={setIsOptional} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm">Pre-Workout</span>
              </div>
              <Switch checked={isPreWorkout} onCheckedChange={setIsPreWorkout} />
            </div>
          </CardContent>
        </Card>

        {/* Foods Section */}
        <Card className="card-shadow animate-fade-up" style={{ animationDelay: "150ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Foods</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {/* Category Legend */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-full">
                <Check className="w-3 h-3" /> Required
              </span>
              <span className="px-2 py-1 bg-secondary text-secondary-foreground border border-border rounded-full">
                Allowed
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 text-muted-foreground rounded-full border border-dashed border-muted-foreground/30">
                <Plus className="w-3 h-3" /> Optional
              </span>
            </div>

            {/* Food List */}
            <div className="space-y-2">
              {foods.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No foods added yet. Add some below.
                </p>
              ) : (
                foods.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg animate-fade-up"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                    <span className="flex-1 text-sm">{food.name}</span>

                    {/* Category Toggle */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleChangeFoodCategory(food.id, "required")}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          food.category === "required"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                        title="Required"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangeFoodCategory(food.id, "allowed")}
                        className={cn(
                          "p-1.5 rounded-md transition-colors text-xs font-medium",
                          food.category === "allowed"
                            ? "bg-secondary text-secondary-foreground border border-border"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                        title="Allowed"
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangeFoodCategory(food.id, "optional")}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          food.category === "optional"
                            ? "bg-accent/20 text-accent border border-accent/30"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                        title="Optional"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFood(food.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add New Food */}
            <div className="pt-2 border-t border-border space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Add Food</Label>
              <div className="flex gap-2">
                <Input
                  value={newFoodName}
                  onChange={(e) => setNewFoodName(e.target.value)}
                  placeholder="Food name..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFood();
                    }
                  }}
                />
                <select
                  value={newFoodCategory}
                  onChange={(e) => setNewFoodCategory(e.target.value as FoodCategory)}
                  className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
                >
                  <option value="required">Required</option>
                  <option value="allowed">Allowed</option>
                  <option value="optional">Optional</option>
                </select>
                <Button size="icon" onClick={handleAddFood} disabled={!newFoodName.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button (bottom sticky for mobile) */}
        <div className="pt-4">
          <Button
            size="lg"
            className="w-full"
            onClick={handleSave}
            disabled={!hasChanges || updateTemplate.isPending}
          >
            {updateTemplate.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
