import { useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DayStrip } from "@/components/DayStrip";
import { MealSlotCard } from "@/components/MealSlotCard";
import { MealPlanEditSheet } from "@/components/MealPlanEditSheet";
import {
  useWeeklyPlan,
  useUpsertWeeklyPlanEntry,
  useDeleteWeeklyPlanEntry,
  getWeekStartDate,
  MealType,
  WeeklyPlanEntry,
} from "@/hooks/use-weekly-plan";
import { useGenerateShoppingList } from "@/hooks/use-shopping-list";
import { cn } from "@/lib/utils";

// Displayed meal types per day in order (dinner first = priority)
const MEAL_TYPES: MealType[] = ["dinner", "lunch", "breakfast", "snack"];
const COLLAPSED_TYPES: MealType[] = ["snack"]; // hidden by default, shown on toggle

function getPreviousWeek(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() - 7);
  return d.toISOString().split("T")[0];
}

function getNextWeek(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

function formatWeekRange(weekStartDate: string): string {
  const start = new Date(weekStartDate + "T00:00:00");
  const end = new Date(weekStartDate + "T00:00:00");
  end.setDate(end.getDate() + 6);

  const startStr = start.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
  const endStr = end.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
  return `${startStr} – ${endStr}`;
}

interface EditState {
  mealType: MealType;
  entry: WeeklyPlanEntry | undefined;
}

interface WeeklyPlannerProps {
  onShoppingListGenerated?: () => void;
}

export function WeeklyPlanner({ onShoppingListGenerated }: WeeklyPlannerProps) {
  const today = new Date();
  const currentWeekStart = getWeekStartDate(today);

  const [weekStartDate, setWeekStartDate] = useState(currentWeekStart);
  const [selectedDay, setSelectedDay] = useState(() => {
    // Default to today's day-of-week (0=Mon), clamped to current week
    const day = today.getDay();
    return day === 0 ? 6 : day - 1; // convert JS Sunday=0 to Mon=0
  });
  const [editState, setEditState] = useState<EditState | null>(null);
  const [showSnacks, setShowSnacks] = useState(false);

  const { data: plan, isLoading } = useWeeklyPlan(weekStartDate);
  const upsertEntry = useUpsertWeeklyPlanEntry();
  const deleteEntry = useDeleteWeeklyPlanEntry();
  const generateList = useGenerateShoppingList();

  const entriesForDay = plan?.entries.filter((e) => e.dayOfWeek === selectedDay) ?? [];

  const getEntry = (mealType: MealType) =>
    entriesForDay.find((e) => e.mealType === mealType);

  const handleOpenEdit = (mealType: MealType, entry?: WeeklyPlanEntry) => {
    setEditState({ mealType, entry });
  };

  const handleSaveEntry = (mealName: string, ingredients: string[]) => {
    if (!editState) return;
    upsertEntry.mutate(
      {
        weekStartDate,
        dayOfWeek: selectedDay,
        mealType: editState.mealType,
        mealName,
        ingredients,
        entryId: editState.entry?.id,
      },
      {
        onSuccess: () => {
          toast.success("Refeição guardada");
          setEditState(null);
        },
        onError: () => toast.error("Erro ao guardar. Tenta de novo."),
      }
    );
  };

  const handleDeleteEntry = (entry: WeeklyPlanEntry) => {
    deleteEntry.mutate(
      { entryId: entry.id, weekStartDate },
      {
        onSuccess: () => toast.success("Refeição removida"),
        onError: () => toast.error("Erro ao remover"),
      }
    );
  };

  const handleGenerateShoppingList = () => {
    if (!plan || plan.entries.length === 0) {
      toast.error("Adiciona pelo menos uma refeição antes de gerar a lista");
      return;
    }

    generateList.mutate(
      {
        weekStartDate,
        weeklyPlanId: plan.id,
        entries: plan.entries,
      },
      {
        onSuccess: () => {
          toast.success("Lista de compras gerada!");
          onShoppingListGenerated?.();
        },
        onError: () => toast.error("Erro ao gerar a lista. Tenta de novo."),
      }
    );
  };

  const totalMeals = plan?.entries.length ?? 0;
  const totalDays = new Set(plan?.entries.map((e) => e.dayOfWeek)).size;

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekStartDate(getPreviousWeek(weekStartDate))}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium">{formatWeekRange(weekStartDate)}</p>
          {weekStartDate === currentWeekStart && (
            <p className="text-xs text-primary">Esta semana</p>
          )}
        </div>
        <button
          onClick={() => setWeekStartDate(getNextWeek(weekStartDate))}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day strip */}
      <DayStrip
        weekStartDate={weekStartDate}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        entries={plan?.entries ?? []}
      />

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {/* Dinner always first and prominent */}
          <MealSlotCard
            mealType="dinner"
            entry={getEntry("dinner")}
            onAdd={() => handleOpenEdit("dinner")}
            onEdit={() => handleOpenEdit("dinner", getEntry("dinner"))}
            onDelete={() => { const e = getEntry("dinner"); if (e) handleDeleteEntry(e); }}
          />

          {/* Lunch and breakfast */}
          {(["lunch", "breakfast"] as MealType[]).map((mt) => (
            <MealSlotCard
              key={mt}
              mealType={mt}
              entry={getEntry(mt)}
              onAdd={() => handleOpenEdit(mt)}
              onEdit={() => handleOpenEdit(mt, getEntry(mt))}
              onDelete={() => { const e = getEntry(mt); if (e) handleDeleteEntry(e); }}
            />
          ))}

          {/* Snack: collapsed by default */}
          {showSnacks ? (
            <div className="space-y-2">
              <MealSlotCard
                mealType="snack"
                entry={getEntry("snack")}
                onAdd={() => handleOpenEdit("snack")}
                onEdit={() => handleOpenEdit("snack", getEntry("snack"))}
                onDelete={() => { const e = getEntry("snack"); if (e) handleDeleteEntry(e); }}
              />
              <button
                onClick={() => setShowSnacks(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center py-1"
              >
                Ocultar lanches
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSnacks(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center py-1"
            >
              + Ver lanches
            </button>
          )}
        </div>
      )}

      {/* Summary + generate button */}
      {totalMeals > 0 && (
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">
              {totalMeals} {totalMeals === 1 ? "refeição" : "refeições"} em {totalDays} {totalDays === 1 ? "dia" : "dias"}
            </p>
          </div>
          <Button
            className="w-full"
            onClick={handleGenerateShoppingList}
            disabled={generateList.isPending}
          >
            {generateList.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A gerar lista...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Gerar lista de compras
              </>
            )}
          </Button>
        </div>
      )}

      {/* Edit sheet */}
      {editState && (
        <MealPlanEditSheet
          open={!!editState}
          onClose={() => setEditState(null)}
          mealType={editState.mealType}
          existingEntry={editState.entry}
          onSave={handleSaveEntry}
          isSaving={upsertEntry.isPending}
        />
      )}
    </div>
  );
}
