import { cn } from "@/lib/utils";

interface ChallengeDayRingProps {
  day: number;
  totalDays: number;
  size?: "md" | "lg";
}

export function ChallengeDayRing({ day, totalDays, size = "lg" }: ChallengeDayRingProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(day / totalDays, 1);
  const strokeDashoffset = circumference - progress * circumference;

  const sizeClasses = { md: "w-20 h-20", lg: "w-28 h-28" };
  const textSizes = { md: "text-xl", lg: "text-2xl" };

  return (
    <div className={cn("relative shrink-0", sizeClasses[size])}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-primary transition-all duration-500 ease-out"
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold", textSizes[size])}>{day}</span>
        <span className="text-[10px] text-muted-foreground">/ {totalDays}</span>
      </div>
    </div>
  );
}
