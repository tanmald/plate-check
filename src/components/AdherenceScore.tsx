import { cn } from "@/lib/utils";

interface AdherenceScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const getScoreStatus = (score: number) => {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
};

const getScoreColor = (score: number) => {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-destructive";
};

const getScoreStroke = (score: number) => {
  if (score >= 70) return "stroke-success";
  if (score >= 40) return "stroke-warning";
  return "stroke-destructive";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Great match!";
  if (score >= 70) return "On track";
  if (score >= 50) return "Needs attention";
  return "Off plan";
};

export function AdherenceScore({ 
  score, 
  size = "md", 
  showLabel = true,
  animated = true 
}: AdherenceScoreProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-3xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative", sizeClasses[size])}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={cn(
              getScoreStroke(score),
              animated && "animate-score-fill",
              "transition-all duration-500 ease-out"
            )}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              "--score-offset": strokeDashoffset,
            } as React.CSSProperties}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", textSizes[size], getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-sm font-medium", getScoreColor(score))}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}

export { getScoreStatus, getScoreColor, getScoreLabel };
