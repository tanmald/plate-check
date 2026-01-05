import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { MealLogModal } from "@/components/MealLogModal";
import { Upload, FileText, Check, ChevronRight, Plus, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

const mockPlan = {
  name: "Weight Management Plan",
  uploadedAt: "Dec 28, 2025",
  source: "Dr. Smith Nutrition Clinic",
  templates: [
    {
      id: "1",
      type: "breakfast",
      icon: "🌅",
      name: "Breakfast",
      requiredFoods: ["Whole grains", "Protein source", "Fruit"],
      allowedFoods: ["Oatmeal", "Eggs", "Greek yogurt", "Berries", "Whole wheat toast"],
      calories: "350-450",
      protein: "20-30g",
    },
    {
      id: "2",
      type: "lunch",
      icon: "☀️",
      name: "Lunch",
      requiredFoods: ["Lean protein", "Vegetables", "Complex carbs"],
      allowedFoods: ["Chicken", "Fish", "Salad greens", "Quinoa", "Brown rice"],
      calories: "450-550",
      protein: "30-40g",
    },
    {
      id: "3",
      type: "dinner",
      icon: "🌙",
      name: "Dinner",
      requiredFoods: ["Lean protein", "Vegetables"],
      allowedFoods: ["Salmon", "Chicken", "Tofu", "Broccoli", "Spinach"],
      calories: "400-500",
      protein: "25-35g",
    },
    {
      id: "4",
      type: "snack",
      icon: "🍎",
      name: "Snacks",
      requiredFoods: ["Protein or fruit"],
      allowedFoods: ["Greek yogurt", "Nuts", "Apple", "Protein bar"],
      calories: "150-200",
      protein: "10-15g",
    },
  ],
};

export default function Plan() {
  const [isMealLogOpen, setIsMealLogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const hasPlan = true;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">My Plan</h1>
          <p className="text-sm text-muted-foreground">Your personalized nutrition plan</p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {!hasPlan ? (
          /* Empty state - No plan uploaded */
          <Card className="card-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No plan uploaded yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Upload your nutrition plan (PDF, Word, or image) and our AI will structure it for you.
              </p>
              <Button size="lg" className="w-full">
                <Upload className="w-5 h-5 mr-2" />
                Upload Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Current Plan Info */}
            <Card className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{mockPlan.name}</h3>
                      <p className="text-sm text-muted-foreground">{mockPlan.source}</p>
                      <p className="text-xs text-muted-foreground mt-1">Uploaded {mockPlan.uploadedAt}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Meal Templates */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Meal Templates</h2>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-3">
                {mockPlan.templates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={cn(
                      "card-shadow cursor-pointer transition-all",
                      selectedTemplate === template.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedTemplate(
                      selectedTemplate === template.id ? null : template.id
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div>
                            <h3 className="font-semibold">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {template.calories} cal • {template.protein} protein
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform",
                          selectedTemplate === template.id && "rotate-90"
                        )} />
                      </div>

                      {selectedTemplate === template.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                              Required
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {template.requiredFoods.map((food) => (
                                <span 
                                  key={food}
                                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                                >
                                  {food}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                              Allowed Foods
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {template.allowedFoods.map((food) => (
                                <span 
                                  key={food}
                                  className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
                                >
                                  {food}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Daily Targets */}
            <Card className="card-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Daily Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">1800</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">120g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">4</p>
                    <p className="text-xs text-muted-foreground">Meals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload New Plan */}
            <Button variant="outline" size="lg" className="w-full">
              <Upload className="w-5 h-5 mr-2" />
              Upload New Plan
            </Button>
          </>
        )}
      </main>

      <BottomNav onCameraClick={() => setIsMealLogOpen(true)} />
      <MealLogModal isOpen={isMealLogOpen} onClose={() => setIsMealLogOpen(false)} />
    </div>
  );
}
