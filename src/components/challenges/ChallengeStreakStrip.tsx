import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChallengeDailyLog } from "@/hooks/use-challenges";

interface ChallengeStreakStripProps {
  logs: ChallengeDailyLog[];
  currentDay: number;
}

export function ChallengeStreakStrip({ logs, currentDay }: ChallengeStreakStripProps) {
  const byDay = new Map(logs.map((l) => [l.dayNumber, l]));
  const start = Math.max(1, currentDay - 6);
  const days = Array.from({ length: currentDay - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-between gap-1">
      {days.map((day) => {
        const log = byDay.get(day);
        const isToday = day === currentDay;
        const complete = log?.allComplete ?? false;

        return (
          <div key={day} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2",
                complete
                  ? "bg-success/15 border-success text-success"
                  : isToday
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
              )}
            >
              {complete ? (
                <Check className="w-4 h-4" />
              ) : isToday ? (
                <Minus className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{day}</span>
          </div>
        );
      })}
    </div>
  );
}
