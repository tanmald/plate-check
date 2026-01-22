import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { useNutritionPlan, useImportNutritionPlan, useConfirmNutritionPlan } from "@/hooks/use-nutrition-plan";
import { ParsePlanResponse } from "@/lib/api";
import { toast } from "sonner";
import { Upload, FileText, ChevronRight, Plus, Edit2, Image, File, Info, Loader2, AlertCircle, Clock, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewState = "empty" | "importing" | "review" | "active";

export default function Plan() {
  const { data: planData, isLoading } = useNutritionPlan();
  const [viewState, setViewState] = useState<ViewState>("empty");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [parsedPlan, setParsedPlan] = useState<ParsePlanResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importPlan = useImportNutritionPlan();
  const confirmPlan = useConfirmNutritionPlan();

  const hasPlan = planData?.hasPlan || false;
  const plan = planData?.plan;

  const handleImportStart = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (file: File) => {
    // Set importing state
    setViewState("importing");

    // Call import mutation
    importPlan.mutate(
      { file },
      {
        onSuccess: (result) => {
          // Store parsed plan
          setParsedPlan(result);
          // Move to review state
          setViewState("review");
        },
        onError: (error) => {
          console.error("Error importing plan:", error);
          toast.error("Failed to parse plan. Please try again.");
          // Reset to empty state
          setViewState("empty");
          setParsedPlan(null);
        },
      }
    );
  };

  const handleConfirmPlan = () => {
    if (!parsedPlan) {
      toast.error("No plan to confirm");
      return;
    }

    confirmPlan.mutate(parsedPlan, {
      onSuccess: () => {
        toast.success("Plan confirmed successfully!");
        setViewState("active");
        setParsedPlan(null);
      },
      onError: (error) => {
        console.error("Error confirming plan:", error);
        toast.error("Failed to save plan. Please try again.");
      },
    });
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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

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
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !hasPlan && viewState === "empty" ? (
          /* Empty State */
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
        ) : viewState === "importing" ? (
          /* Importing State */
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Parsing your plan...</h3>
              <p className="text-muted-foreground">Extracting meal templates and guidelines</p>
            </div>
          </div>
        ) : viewState === "review" && parsedPlan ? (
          /* Review State */
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

                <div className="p-3 bg-card rounded-lg space-y-2">
                  <div>
                    <p className="text-sm font-medium">{parsedPlan.planName}</p>
                    <p className="text-xs text-muted-foreground">Uploaded Plan</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={cn(
                      "px-2 py-1 rounded-full",
                      parsedPlan.confidence === "high" ? "bg-success/20 text-success" :
                      parsedPlan.confidence === "medium" ? "bg-warning/20 text-warning" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {parsedPlan.confidence} confidence
                    </span>
                    <span className="text-muted-foreground">
                      {parsedPlan.mealTemplates.length} templates
                    </span>
                  </div>
                </div>

                {/* Warnings */}
                {parsedPlan.warnings.length > 0 && (
                  <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                      <div className="space-y-1">
                        {parsedPlan.warnings.map((warning, idx) => (
                          <p key={idx} className="text-xs text-warning">{warning}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Templates to confirm */}
            <div className="space-y-3">
              {parsedPlan.mealTemplates.map((template) => (
                <Card key={template.id} className="card-shadow">
                  <CardContent className="p-4">
                    {/* Header with badges */}
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{template.name}</h3>
                          {template.isOptional && (
                            <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-full font-medium">
                              OPTIONAL
                            </span>
                          )}
                          {template.isPreWorkout && (
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-600 text-xs rounded-full font-medium flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              PRE-WORKOUT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {template.scheduledTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {template.scheduledTime}
                            </span>
                          )}
                          {template.calories && <span>{template.calories} cal</span>}
                          {template.protein && <span>• {template.protein} protein</span>}
                        </div>
                      </div>
                    </div>

                    {/* Reference to another meal */}
                    {template.referencesMeal && (
                      <div className="mb-3 p-2 bg-muted/50 rounded-lg flex items-center gap-2 text-sm">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Same rules as</span>
                        <span className="font-medium">{template.referencesMeal}</span>
                      </div>
                    )}

                    <div className="space-y-3 text-xs">
                      {/* Options section */}
                      {template.options && template.options.length > 0 && (
                        <div>
                          <p className="text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                            Choose 1 Option:
                          </p>
                          <div className="space-y-2">
                            {template.options.map((option) => (
                              <div key={option.number} className="p-3 border border-border rounded-lg bg-card">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                                    {option.number}
                                  </span>
                                  <span className="font-medium text-sm">{option.description}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 ml-7">
                                  {option.foods.map((food, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                                      {food}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Required foods */}
                      {template.requiredFoods.length > 0 && (
                        <div>
                          <p className="text-muted-foreground mb-1">Required:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.requiredFoods.map((food, idx) => (
                              <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded">
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Allowed foods */}
                      {template.allowedFoods.length > 0 && (
                        <div>
                          <p className="text-muted-foreground mb-1">Allowed:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.allowedFoods.slice(0, 5).map((food, idx) => (
                              <span key={idx} className="px-2 py-1 bg-secondary rounded">
                                {food}
                              </span>
                            ))}
                            {template.allowedFoods.length > 5 && (
                              <span className="px-2 py-1 text-muted-foreground">
                                +{template.allowedFoods.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Optional add-ons */}
                      {template.optionalAddons && template.optionalAddons.length > 0 && (
                        <div>
                          <p className="text-muted-foreground mb-1">Optional add-ons:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.optionalAddons.map((food, idx) => (
                              <span key={idx} className="px-2 py-1 bg-muted text-muted-foreground rounded border border-dashed border-muted-foreground/30">
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              size="xl"
              className="w-full"
              onClick={handleConfirmPlan}
              disabled={confirmPlan.isPending}
            >
              {confirmPlan.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm Plan"
              )}
            </Button>
          </>
        ) : hasPlan && plan ? (
          /* Active Plan State */
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
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.source}</p>
                      <p className="text-xs text-muted-foreground mt-1">Uploaded {plan.uploadedAt}</p>
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
                {plan.templates.map((template) => (
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
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl">{template.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{template.name}</h3>
                              {template.isOptional && (
                                <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-full font-medium">
                                  OPTIONAL
                                </span>
                              )}
                              {template.isPreWorkout && (
                                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-600 text-xs rounded-full font-medium flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  PRE-WORKOUT
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {template.scheduledTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {template.scheduledTime}
                                </span>
                              )}
                              {template.calories && <span>{template.calories} cal</span>}
                              {template.protein && <span>• {template.protein} protein</span>}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform",
                          selectedTemplate === template.id && "rotate-90"
                        )} />
                      </div>

                      {selectedTemplate === template.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          {/* Reference to another meal */}
                          {template.referencesMeal && (
                            <div className="p-2 bg-muted/50 rounded-lg flex items-center gap-2 text-sm">
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Same rules as</span>
                              <span className="font-medium">{template.referencesMeal}</span>
                            </div>
                          )}

                          {/* Options section */}
                          {template.options && template.options.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                Choose 1 Option
                              </p>
                              <div className="space-y-2">
                                {template.options.map((option) => (
                                  <div key={option.number} className="p-3 border border-border rounded-lg bg-card/50">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                                        {option.number}
                                      </span>
                                      <span className="font-medium text-sm">{option.description}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 ml-7">
                                      {option.foods.map((food, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                                          {food}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Required foods */}
                          {template.requiredFoods.length > 0 && (
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
                          )}

                          {/* Allowed foods */}
                          {template.allowedFoods.length > 0 && (
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
                          )}

                          {/* Optional add-ons */}
                          {template.optionalAddons && template.optionalAddons.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                Optional Add-ons
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {template.optionalAddons.map((food) => (
                                  <span
                                    key={food}
                                    className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full border border-dashed border-muted-foreground/30"
                                  >
                                    {food}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
              onClick={() => setViewState("empty")}
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
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}
