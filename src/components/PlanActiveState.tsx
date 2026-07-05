import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealTemplateCard } from "@/components/MealTemplateCard";
import { DailyTargetsCard } from "@/components/DailyTargetsCard";
import { NutritionPlan, getLoggableMealCount } from "@/hooks/use-nutrition-plan";
import { FileText, Edit2, Plus, Upload, Info } from "lucide-react";

interface PlanActiveStateProps {
  plan: NutritionPlan;
  dailyTargets: { calories: number; protein: number } | null;
  selectedTemplate: string | null;
  onToggleTemplate: (templateId: string) => void;
  onEditTemplate: (templateId: string) => void;
  onAddTemplate: () => void;
  onEditPlan: () => void;
  onReplacePlan: () => void;
}

export function PlanActiveState({
  plan,
  dailyTargets,
  selectedTemplate,
  onToggleTemplate,
  onEditTemplate,
  onAddTemplate,
  onEditPlan,
  onReplacePlan,
}: PlanActiveStateProps) {
  return (
    <>
      {/* Current Plan Info */}
      <Card className="card-shadow animate-fade-up">
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
            <Button variant="ghost" size="icon" onClick={onEditPlan} aria-label="Edit plan">
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meal Templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Meal Templates</h2>
          <Button variant="ghost" size="sm" onClick={onAddTemplate}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {plan.templates.map((template, idx) => (
            <MealTemplateCard
              key={template.id}
              template={template}
              isExpanded={selectedTemplate === template.id}
              onToggle={() => onToggleTemplate(template.id)}
              onEdit={() => onEditTemplate(template.id)}
              animationDelay={idx * 100}
            />
          ))}
        </div>
      </div>

      {/* Daily Targets */}
      <DailyTargetsCard
        calories={dailyTargets?.calories}
        protein={dailyTargets?.protein}
        meals={getLoggableMealCount(plan)}
        className="animate-fade-up animate-delay-400"
      />

      {/* Upload New Plan */}
      <Button
        variant="outline"
        size="lg"
        className="w-full animate-fade-up animate-delay-500"
        onClick={onReplacePlan}
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
  );
}
