import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WeeklyPlanEntry, MealType } from "@/hooks/use-weekly-plan";

const MEAL_CONFIG: Record<MealType, { icon: string; label: string; priority: "high" | "normal" | "low" }> = {
  dinner:    { icon: "🌙", label: "Jantar",           priority: "high" },
  lunch:     { icon: "☀️",  label: "Almoço",           priority: "normal" },
  breakfast: { icon: "🌅", label: "Pequeno-almoço",   priority: "normal" },
  snack:     { icon: "🍎", label: "Lanche",            priority: "low" },
};

interface MealSlotCardProps {
  mealType: MealType;
  entry: WeeklyPlanEntry | undefined;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MealSlotCard({ mealType, entry, onAdd, onEdit, onDelete }: MealSlotCardProps) {
  const config = MEAL_CONFIG[mealType];
  const isEmpty = !entry;
  const isHighPriority = config.priority === "high";

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        isHighPriority
          ? "border-primary/20 bg-primary/5"
          : "border-border bg-card",
        isEmpty && "border-dashed"
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("text-xl flex-shrink-0", isHighPriority ? "text-2xl" : "")}>{config.icon}</span>
            <div className="min-w-0">
              <p className={cn(
                "font-medium leading-tight",
                isHighPriority ? "text-base" : "text-sm text-muted-foreground"
              )}>
                {config.label}
              </p>
              {entry && (
                <p className="text-sm text-foreground font-medium mt-0.5 truncate">
                  {entry.mealName}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {isEmpty ? (
            <button
              onClick={onAdd}
              className={cn(
                "flex items-center gap-1 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors flex-shrink-0",
                isHighPriority
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar
            </button>
          ) : (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Ingredient tags */}
        {entry && entry.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 ml-8">
            {entry.ingredients.slice(0, 4).map((ing, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-background border border-border rounded text-[11px] text-muted-foreground"
              >
                {ing}
              </span>
            ))}
            {entry.ingredients.length > 4 && (
              <span className="px-2 py-0.5 text-[11px] text-muted-foreground">
                +{entry.ingredients.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
