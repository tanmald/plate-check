import { useState } from "react";
import { Check, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FoodTagType = "required" | "allowed" | "optional";

interface FoodTagGroupProps {
  label: string;
  foods: string[];
  type: FoodTagType;
  maxVisible?: number;
  className?: string;
}

const tagStyles: Record<FoodTagType, string> = {
  required: "bg-primary text-primary-foreground shadow-sm",
  allowed: "bg-secondary text-secondary-foreground border border-border",
  optional: "bg-muted/50 text-muted-foreground border border-dashed border-muted-foreground/40",
};

const tagIcon: Record<FoodTagType, React.ReactNode> = {
  required: <Check className="w-3 h-3" />,
  allowed: null,
  optional: <Plus className="w-3 h-3" />,
};

export function FoodTagGroup({
  label,
  foods,
  type,
  maxVisible = 5,
  className,
}: FoodTagGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMore = foods.length > maxVisible;
  const visibleFoods = isExpanded ? foods : foods.slice(0, maxVisible);
  const hiddenCount = foods.length - maxVisible;

  return (
    <div className={cn("mb-4", className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {visibleFoods.map((food, idx) => (
          <span
            key={food}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all animate-pop-in",
              tagStyles[type]
            )}
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {tagIcon[type]}
            {food}
          </span>
        ))}
        
        {hasMore && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            +{hiddenCount} more
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
        
        {hasMore && isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Show less
            <ChevronDown className="w-3 h-3 rotate-180" />
          </button>
        )}
      </div>
    </div>
  );
}
