import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { Upload, FileText, ChevronRight, Plus, Edit2, Image, File, Info, Loader2 } from "lucide-react";
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

type ViewState = "empty" | "importing" | "review" | "active";

export default function Plan() {
  const [viewState, setViewState] = useState<ViewState>("empty");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // For demo, we'll use a toggle to show different states
  const [hasPlan, setHasPlan] = useState(true);

  const handleImportStart = () => {
    setViewState("importing");
    // Simulate parsing
    setTimeout(() => {
      setViewState("review");
    }, 2000);
  };

  const handleConfirmPlan = () => {
    setViewState("active");
    setHasPlan(true);
  };

  const handleEditPlan = () => {
    toast.info("Plan editing coming soon");
  };

  const handleEditTemplate = () => {
    toast.info("Template editing coming soon");
  };

  const handleAddTemplate = () => {
    toast.info("Add template coming soon");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">My Plan</h1>
          <p className="text-sm text-muted-foreground">
            {hasPlan ? "Your personalized nutrition plan" : "Import your nutrition plan"}
          </p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Empty State */}
        {!hasPlan && viewState === "empty" && (
          <Card className="card-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No plan imported yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Upload your nutrition plan (PDF, Word, or image) and we'll parse it into meal templates.
              </p>
              
              <div className="space-y-3">
                <Button size="lg" className="w-full" onClick={handleImportStart}>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Plan
                </Button>
                
                <div className="flex gap-2 justify-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <File className="w-3 h-3" /> PDF
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="w-3 h-3" /> Word
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Image className="w-3 h-3" /> Image
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Importing State */}
        {viewState === "importing" && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Parsing your plan...</h3>
              <p className="text-muted-foreground">Extracting meal templates and guidelines</p>
            </div>
          </div>
        )}

        {/* Review State */}
        {viewState === "review" && (
          <>
            <Card className="card-shadow border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Plan parsed successfully!</h3>
                    <p className="text-sm text-muted-foreground">Review and confirm below</p>
                  </div>
                </div>
                
                <div className="p-3 bg-card rounded-lg">
                  <p className="text-sm font-medium">{mockPlan.name}</p>
                  <p className="text-xs text-muted-foreground">{mockPlan.source}</p>
                </div>
              </CardContent>
            </Card>

            {/* Templates to confirm */}
            <div className="space-y-3">
              {mockPlan.templates.map((template) => (
                <Card key={template.id} className="card-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.calories} cal • {template.protein} protein
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={handleEditTemplate}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button size="xl" className="w-full" onClick={handleConfirmPlan}>
              Confirm Plan
            </Button>
          </>
        )}

        {/* Active Plan State */}
        {hasPlan && viewState !== "importing" && viewState !== "review" && (
          <>
            {/* Current Plan Info */}
            <Card className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{mockPlan.name}</h3>
                      <p className="text-sm text-muted-foreground">{mockPlan.source}</p>
                      <p className="text-xs text-muted-foreground mt-1">Uploaded {mockPlan.uploadedAt}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleEditPlan}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Meal Templates */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Meal Templates</h2>
                <Button variant="ghost" size="sm" onClick={handleAddTemplate}>
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
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={() => { setHasPlan(false); setViewState("empty"); }}
            >
              <Upload className="w-5 h-5 mr-2" />
              Replace Plan
            </Button>

            {/* Trust note */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>Wellness support, not medical advice</span>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
