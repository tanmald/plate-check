import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Flame, Dumbbell, UtensilsCrossed } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DailyTargetsCardProps {
  calories?: number;
  protein?: number;
  meals?: number;
  className?: string;
}

export function DailyTargetsCard({
  calories = 1800,
  protein = 120,
  meals = 4,
  className,
}: DailyTargetsCardProps) {
  const { t } = useTranslation();

  return (
    <Card className={`card-shadow ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("dailyTargets.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Calories */}
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
              <Flame className="w-6 h-6 text-accent" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              <AnimatedNumber value={calories} duration={1200} />
            </p>
            <p className="text-xs text-muted-foreground">{t("dailyTargets.calories")}</p>
          </div>

          {/* Protein */}
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              <AnimatedNumber value={protein} duration={1200} suffix="g" />
            </p>
            <p className="text-xs text-muted-foreground">{t("dailyTargets.protein")}</p>
          </div>

          {/* Meals */}
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-success/10 flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              <AnimatedNumber value={meals} duration={800} />
            </p>
            <p className="text-xs text-muted-foreground">{t("dailyTargets.meals")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
