import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { addDaysIso, buildWeekColumns, daysBetweenIso } from "@/lib/challenge-dates";
import { localDateString, type ChallengeDailyLog } from "@/hooks/use-challenges";

interface ChallengeHeatmapProps {
  /** Logs for the current run only — callers filter by `restartCount`. */
  logs: ChallengeDailyLog[];
  startedAt: string;
  durationDays: number;
  /** Denominator for a day's intensity: how many tasks the challenge asks for. */
  totalTasks: number;
  timezone: string;
  variant?: "compact" | "full";
}

/**
 * Five literal class names, not a template string — Tailwind only ships
 * classes it can see in the source. Index 0 doubles as "nothing recorded",
 * which is why it's neutral grey rather than the faintest green: a day you
 * never opened should read as absent, not as a bad day.
 */
const INTENSITY_CLASS = [
  "bg-muted",
  "bg-success/20",
  "bg-success/45",
  "bg-success/70",
  "bg-success",
];

/** Buckets a day into the ramp: 0 stays 0, a full day always hits the top shade. */
function intensityLevel(done: number, total: number): number {
  if (done <= 0 || total <= 0) return 0;
  if (done >= total) return INTENSITY_CLASS.length - 1;
  return Math.min(INTENSITY_CLASS.length - 2, 1 + Math.floor((done / total) * 3));
}

function countDone(log: ChallengeDailyLog | undefined): number {
  if (!log) return 0;
  return Object.values(log.tasks).filter((task) => task?.done).length;
}

// GitHub labels only alternate weekdays, which keeps the gutter legible at
// this cell size. Index matches the Monday-first row order.
const LABELLED_WEEKDAY_ROWS = [0, 2, 4];

/** An arbitrary Monday, used only to render localised weekday names for the gutter. */
const WEEKDAY_LABEL_MONDAY = "2026-08-03";

export function ChallengeHeatmap({
  logs,
  startedAt,
  durationDays,
  totalTasks,
  timezone,
  variant = "full",
}: ChallengeHeatmapProps) {
  const { t, i18n } = useTranslation();

  const locale = i18n.language?.startsWith("pt") ? "pt-PT" : "en-US";
  const today = localDateString(timezone);
  const endDate = addDaysIso(startedAt, durationDays - 1);
  const columns = buildWeekColumns(startedAt, endDate);
  const logsByDate = new Map(logs.map((log) => [log.date, log]));

  const isCompact = variant === "compact";
  const cellClass = isCompact ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
  const daysComplete = logs.filter((log) => log.allComplete).length;

  const monthLabels = columns.map((column, index) => {
    const firstDay = column.find((d): d is string => d !== null);
    if (!firstDay) return null;
    const month = firstDay.slice(0, 7);
    const previousDay = index > 0 ? columns[index - 1].find((d): d is string => d !== null) : undefined;
    if (previousDay && previousDay.slice(0, 7) === month) return null;
    return new Date(`${firstDay}T00:00:00.000Z`).toLocaleDateString(locale, {
      month: "short",
      timeZone: "UTC",
    });
  });

  return (
    <div
      className="space-y-2"
      role="img"
      aria-label={t("challenges.heatmap_summary", { complete: daysComplete, total: durationDays })}
    >
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {!isCompact && (
            <div className="grid grid-rows-7 gap-1 mr-1" aria-hidden="true">
              {Array.from({ length: 7 }, (_, row) => (
                <div key={row} className={cn("flex items-center", cellClass)}>
                  {LABELLED_WEEKDAY_ROWS.includes(row) && (
                    <span className="text-[8px] leading-none text-muted-foreground">
                      {new Date(`${addDaysIso(WEEKDAY_LABEL_MONDAY, row)}T00:00:00.000Z`).toLocaleDateString(
                        locale,
                        { weekday: "short", timeZone: "UTC" }
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-1">
              {!isCompact && (
                <span className="h-3 text-[9px] leading-none text-muted-foreground whitespace-nowrap">
                  {monthLabels[columnIndex]}
                </span>
              )}
              <div className="grid grid-rows-7 gap-1">
                {column.map((date, rowIndex) => {
                  if (!date) {
                    return <div key={rowIndex} className={cellClass} aria-hidden="true" />;
                  }

                  const isFuture = daysBetweenIso(today, date) > 0;
                  const log = logsByDate.get(date);
                  const done = countDone(log);
                  const label = t("challenges.heatmap_cell_label", {
                    date: new Date(`${date}T00:00:00.000Z`).toLocaleDateString(locale, {
                      day: "numeric",
                      month: "short",
                      timeZone: "UTC",
                    }),
                    done,
                    total: totalTasks,
                  });

                  return (
                    <div
                      key={rowIndex}
                      title={label}
                      aria-label={label}
                      className={cn(
                        "rounded-[2px]",
                        cellClass,
                        isFuture ? "bg-muted/40" : INTENSITY_CLASS[intensityLevel(done, totalTasks)],
                        date === today && "ring-1 ring-primary ring-offset-1 ring-offset-background"
                      )}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isCompact && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>{t("challenges.heatmap_less")}</span>
          {INTENSITY_CLASS.map((className) => (
            <span key={className} className={cn("w-2.5 h-2.5 rounded-[2px]", className)} />
          ))}
          <span>{t("challenges.heatmap_more")}</span>
        </div>
      )}
    </div>
  );
}
