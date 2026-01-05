import { cn } from "@/lib/utils";

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

const getBarColor = (score: number) => {
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-warning";
  if (score > 0) return "bg-destructive";
  return "bg-muted";
};

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
