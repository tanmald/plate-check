import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getScoreStatus, getScoreColor } from "./AlignmentScore";
import { useTranslation } from "react-i18next";

interface MealCardProps {
  meal: {
    id: string;
    type: "breakfast" | "lunch" | "dinner" | "snack";
    name: string;
    time: string;
    score: number;
    imageUrl?: string;
    foods: string[];
    feedback?: string;
  };
  onClick?: () => void;
}

const mealIcons = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

export function MealCard({ meal, onClick }: MealCardProps) {
  const { t } = useTranslation();
  const status = getScoreStatus(meal.score);

  const mealLabel = t(`mealCard.${meal.type}`);

  return (
    <Card
      className="card-shadow cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-4">
          {meal.imageUrl ? (
            <div className="w-24 h-24 flex-shrink-0">
              <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 flex-shrink-0 bg-secondary flex items-center justify-center text-4xl">
              {mealIcons[meal.type]}
            </div>
          )}

          <div className="flex-1 py-3 pr-4">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {mealLabel} • {meal.time}
                </p>
                <h3 className="font-semibold text-foreground">{meal.name}</h3>
              </div>
              <span className={cn("text-xl font-bold", getScoreColor(meal.score))}>
                {meal.score}
              </span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {meal.foods.join(", ")}
            </p>

            <Progress value={meal.score} size="sm" status={status} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
