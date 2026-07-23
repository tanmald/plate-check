import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ParsePlanResponse } from "@/lib/api";
import { FileText, AlertCircle, Zap, Clock, ArrowRight, Check, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanReviewStateProps {
  parsedPlan: ParsePlanResponse;
  onConfirm: () => void;
  isConfirming: boolean;
}

export function PlanReviewState({ parsedPlan, onConfirm, isConfirming }: PlanReviewStateProps) {
  const { t } = useTranslation();

  return (
    <>
      <Card className="card-shadow border-2 border-primary/20 bg-primary/5 animate-fade-up">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">{t("plan.parsed_success")}</h3>
              <p className="text-sm text-muted-foreground">{t("plan.parsed_review")}</p>
            </div>
          </div>

          <div className="p-3 bg-card rounded-lg space-y-2">
            <div>
              <p className="text-sm font-medium">{parsedPlan.planName}</p>
              <p className="text-xs text-muted-foreground">{t("plan.uploaded_plan")}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={cn(
                "px-2 py-1 rounded-full",
                parsedPlan.confidence === "high" ? "bg-success/20 text-success" :
                parsedPlan.confidence === "medium" ? "bg-warning/20 text-warning" :
                "bg-muted text-muted-foreground"
              )}>
                {parsedPlan.confidence} {t("plan.confidence")}
              </span>
              <span className="text-muted-foreground">
                {t("plan.templates_count", { count: parsedPlan.mealTemplates.length })}
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

      {/* Templates to confirm - Review state with simpler card display */}
      <div className="space-y-3">
        {parsedPlan.mealTemplates.map((template, idx) => (
          <Card key={template.id} className="card-shadow animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <CardContent className="p-4">
              {/* Header with badges */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <span className="text-2xl">{template.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{template.name}</h3>
                    {template.isOptional && (
                      <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-full font-medium">
                        {t("plan.optional_badge")}
                      </span>
                    )}
                    {template.isPreWorkout && (
                      <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {t("plan.pre_workout_badge")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    {template.scheduledTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {template.scheduledTime}
                      </span>
                    )}
                    {template.calories && <span>{template.calories}</span>}
                    {template.protein && <span>• {template.protein}</span>}
                  </div>
                </div>
              </div>

              {/* Reference to another meal */}
              {template.referencesMeal && (
                <div className="mb-3 p-2 bg-muted/50 rounded-lg flex items-center gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t("plan.same_rules_as")}</span>
                  <span className="font-medium">{template.referencesMeal}</span>
                </div>
              )}

              <div className="space-y-3">
                {/* Options section */}
                {template.options && template.options.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                      {t("plan.option_label")}
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
                            {option.foods.map((food, foodIdx) => (
                              <span key={foodIdx} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
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
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">{t("plan.required_label")}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.requiredFoods.map((food, foodIdx) => (
                        <span key={foodIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                          <Check className="w-3 h-3" />
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allowed foods */}
                {template.allowedFoods.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">{t("plan.allowed_label")}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.allowedFoods.slice(0, 5).map((food, foodIdx) => (
                        <span key={foodIdx} className="px-2 py-1 bg-secondary text-secondary-foreground border border-border rounded-full text-xs">
                          {food}
                        </span>
                      ))}
                      {template.allowedFoods.length > 5 && (
                        <span className="px-2 py-1 text-muted-foreground text-xs">
                          {t("plan.more_items", { count: template.allowedFoods.length - 5 })}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Optional add-ons */}
                {template.optionalAddons && template.optionalAddons.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">{t("plan.optional_addons")}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.optionalAddons.map((food, foodIdx) => (
                        <span key={foodIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 text-muted-foreground rounded-full text-xs border border-dashed border-muted-foreground/30">
                          <Plus className="w-3 h-3" />
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
        onClick={onConfirm}
        disabled={isConfirming}
      >
        {isConfirming ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {t("plan.saving")}
          </>
        ) : (
          t("plan.confirm_plan")
        )}
      </Button>
    </>
  );
}
