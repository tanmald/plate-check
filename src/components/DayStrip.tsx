import { cn } from "@/lib/utils";
import { WeeklyPlanEntry } from "@/hooks/use-weekly-plan";

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface DayStripProps {
  weekStartDate: string;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  entries: WeeklyPlanEntry[];
}

export function DayStrip({ weekStartDate, selectedDay, onSelectDay, entries }: DayStripProps) {
  const startDate = new Date(weekStartDate + "T00:00:00");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
      {DAY_LABELS.map((label, idx) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + idx);

        const isSelected = selectedDay === idx;
        const isToday = date.getTime() === today.getTime();
        const hasDinner = entries.some((e) => e.dayOfWeek === idx && e.mealType === "dinner");
        const hasAnyMeal = entries.some((e) => e.dayOfWeek === idx);

        return (
          <button
            key={idx}
            onClick={() => onSelectDay(idx)}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-2 rounded-xl min-w-[44px] transition-all",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
            <span className={cn("text-sm font-bold", isToday && !isSelected && "text-primary")}>
              {date.getDate()}
            </span>
            {/* Indicator dot */}
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                hasDinner
                  ? isSelected ? "bg-primary-foreground" : "bg-primary"
                  : hasAnyMeal
                  ? isSelected ? "bg-primary-foreground/60" : "bg-muted-foreground/40"
                  : "bg-transparent"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
