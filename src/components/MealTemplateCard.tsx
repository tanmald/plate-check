import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoodTagGroup } from "@/components/FoodTagGroup";
import { ChevronDown, Clock, Flame, Dumbbell, Zap, ArrowRight, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Meal type gradient themes
const mealGradients = {
  breakfast: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
  lunch: "from-yellow-50 to-lime-50 dark:from-yellow-950/30 dark:to-lime-950/30",
  dinner: "from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30",
  snack: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
  default: "from-secondary to-muted",
};

const getMealGradient = (mealName: string): string => {
  const name = mealName.toLowerCase();
  if (name.includes("breakfast") || name.includes("morning")) return mealGradients.breakfast;
  if (name.includes("lunch") || name.includes("midday")) return mealGradients.lunch;
  if (name.includes("dinner") || name.includes("evening")) return mealGradients.dinner;
  if (name.includes("snack")) return mealGradients.snack;
  return mealGradients.default;
};

interface MealOption {
  number: number;
  description: string;
  foods: string[];
}

interface MealTemplate {
  id: string;
  name: string;
  icon: string;
  scheduledTime?: string;
  calories?: string;
  protein?: string;
  isOptional?: boolean;
  isPreWorkout?: boolean;
  referencesMeal?: string;
  requiredFoods: string[];
  allowedFoods: string[];
  optionalAddons?: string[];
  options?: MealOption[];
}

interface MealTemplateCardProps {
  template: MealTemplate;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  animationDelay?: number;
}

export function MealTemplateCard({
  template,
  isExpanded,
  onToggle,
  onEdit,
  animationDelay = 0,
}: MealTemplateCardProps) {
  const gradientClass = getMealGradient(template.name);

  return (
    <Card
      className={cn(
        "card-shadow overflow-hidden transition-all duration-300 animate-fade-up",
        isExpanded && "ring-2 ring-primary/20"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Header with gradient */}
      <div
        className={cn(
          "bg-gradient-to-br cursor-pointer transition-colors",
          gradientClass
        )}
        onClick={onToggle}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3 flex-1">
              {/* Icon with background */}
              <div className="w-12 h-12 rounded-xl bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <span className="text-2xl">{template.icon}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Name and badges */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-foreground">{template.name}</h3>
                  {template.isOptional && (
                    <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-full font-medium">
                      OPTIONAL
                    </span>
                  )}
                  {template.isPreWorkout && (
                    <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      PRE-WORKOUT
                    </span>
                  )}
                </div>

                {/* Metrics pills */}
                <div className="flex flex-wrap gap-2">
                  {template.scheduledTime && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-card/80 backdrop-blur-sm rounded-lg text-xs font-medium text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {template.scheduledTime}
                    </span>
                  )}
                  {template.calories && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-card/80 backdrop-blur-sm rounded-lg text-xs font-medium text-muted-foreground">
                      <Flame className="w-3 h-3 text-accent" />
                      {template.calories}
                    </span>
                  )}
                  {template.protein && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-card/80 backdrop-blur-sm rounded-lg text-xs font-medium text-muted-foreground">
                      <Dumbbell className="w-3 h-3 text-primary" />
                      {template.protein}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chevron with rotation animation */}
            <ChevronDown
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0",
                isExpanded && "rotate-180"
              )}
            />
          </div>
        </CardContent>
      </div>

      {/* Expandable content with smooth animation */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="pt-4 border-t border-border">
              {/* Reference to another meal */}
              {template.referencesMeal && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Same rules as</span>
                  <span className="text-sm font-medium">{template.referencesMeal}</span>
                </div>
              )}

              {/* Options section */}
              {template.options && template.options.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Choose 1 Option
                  </p>
                  <div className="space-y-2">
                    {template.options.map((option, idx) => (
                      <div
                        key={option.number}
                        className="p-3 border-2 border-border rounded-xl bg-card/50 hover:border-primary/30 transition-colors animate-fade-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Radio-style indicator */}
                          <div className="w-6 h-6 rounded-full border-2 border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-primary">{option.number}</span>
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block mb-2">{option.description}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {option.foods.map((food, foodIdx) => (
                                <span
                                  key={foodIdx}
                                  className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium animate-pop-in"
                                  style={{ animationDelay: `${foodIdx * 30}ms` }}
                                >
                                  {food}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Food tag groups */}
              {template.requiredFoods.length > 0 && (
                <FoodTagGroup
                  label="Required"
                  foods={template.requiredFoods}
                  type="required"
                  maxVisible={6}
                />
              )}

              {template.allowedFoods.length > 0 && (
                <FoodTagGroup
                  label="Allowed Foods"
                  foods={template.allowedFoods}
                  type="allowed"
                  maxVisible={6}
                />
              )}

              {template.optionalAddons && template.optionalAddons.length > 0 && (
                <FoodTagGroup
                  label="Optional Add-ons"
                  foods={template.optionalAddons}
                  type="optional"
                  maxVisible={6}
                />
              )}

              {/* Edit button */}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Template
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
