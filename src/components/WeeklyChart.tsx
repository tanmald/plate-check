import { cn } from "@/lib/utils";
import { getScoreStatus } from "@/components/AdherenceScore";

interface DayData {
  day: string;
  shortDay: string;
  score: number;
  mealsLogged: number;
  isToday?: boolean;
}

interface WeeklyChartProps {
  data: DayData[];
}

const STATUS_BG_CLASS: Record<ReturnType<typeof getScoreStatus>, string> = {
  high: "bg-success",
  medium: "bg-warning",
  low: "bg-destructive",
};

// A 0 score means "no meals logged" here, not "very bad" — keep that
// distinct from the destructive-red low tier.
const getBarColor = (score: number) =>
  score > 0 ? STATUS_BG_CLASS[getScoreStatus(score)] : "bg-muted";

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxScore = 100;

  return (
    <div className="flex items-end justify-between gap-2 h-40 px-2">
      {data.map((day) => (
        <div key={day.day} className="flex flex-col items-center flex-1 gap-2">
          {/* Score label */}
          <span className="text-xs font-medium text-muted-foreground">
            {day.score > 0 ? day.score : "-"}
          </span>
          
          {/* Bar */}
          <div className="w-full h-24 bg-secondary rounded-lg overflow-hidden flex flex-col-reverse">
            <div
              className={cn(
                "w-full transition-all duration-500 rounded-lg",
                getBarColor(day.score)
              )}
              style={{ height: `${(day.score / maxScore) * 100}%` }}
            />
          </div>
          
          {/* Day label */}
          <div className="flex flex-col items-center">
            <span className={cn(
              "text-xs font-semibold",
              day.isToday ? "text-primary" : "text-foreground"
            )}>
              {day.shortDay}
            </span>
            {day.isToday && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
