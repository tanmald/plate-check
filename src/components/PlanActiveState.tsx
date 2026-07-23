import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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
                <p className="text-xs text-muted-foreground mt-1">{t("plan.uploaded_at", { date: plan.uploadedAt })}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onEditPlan} aria-label={t("plan.edit_plan_aria")}>
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meal Templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t("plan.meal_templates")}</h2>
          <Button variant="ghost" size="sm" onClick={onAddTemplate}>
            <Plus className="w-4 h-4 mr-1" />
            {t("common.add")}
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
        {t("plan.replace_plan")}
      </Button>

      {/* Trust note */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Info className="w-3 h-3" />
        <span>{t("common.wellness_note")}</span>
      </div>
    </>
  );
}
