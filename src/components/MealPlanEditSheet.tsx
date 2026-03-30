import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { MealType, WeeklyPlanEntry } from "@/hooks/use-weekly-plan";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser } from "@/lib/test-data";
import { guessCategory } from "@/lib/ingredient-categories";

const MEAL_LABELS: Record<MealType, string> = {
  dinner:    "Jantar",
  lunch:     "Almoço",
  breakfast: "Pequeno-almoço",
  snack:     "Lanche",
};

const MOCK_INGREDIENTS: Record<string, string[]> = {
  "salmão": ["salmão 200g", "quinoa 80g", "brócolos 150g", "azeite", "limão"],
  "frango": ["peito de frango 200g", "batata-doce 200g", "espinafres", "alho"],
  "bacalhau": ["bacalhau 200g", "grão de bico 150g", "cebola", "azeite", "coentros"],
};

interface MealPlanEditSheetProps {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  existingEntry: WeeklyPlanEntry | undefined;
  onSave: (mealName: string, ingredients: string[]) => void;
  isSaving: boolean;
}

export function MealPlanEditSheet({
  open,
  onClose,
  mealType,
  existingEntry,
  onSave,
  isSaving,
}: MealPlanEditSheetProps) {
  const { user } = useAuth();
  const [mealName, setMealName] = useState(existingEntry?.mealName ?? "");
  const [ingredients, setIngredients] = useState<string[]>(existingEntry?.ingredients ?? []);
  const [isExtracting, setIsExtracting] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");

  // Reset when opening with a different entry
  useEffect(() => {
    if (open) {
      setMealName(existingEntry?.mealName ?? "");
      setIngredients(existingEntry?.ingredients ?? []);
      setNewIngredient("");
    }
  }, [open, existingEntry]);

  const handleExtractIngredients = async () => {
    if (!mealName.trim()) {
      toast.error("Escreve o nome da refeição primeiro");
      return;
    }

    setIsExtracting(true);
    try {
      if (isTestUser(user?.email)) {
        // Mock extraction for test users
        await new Promise((r) => setTimeout(r, 1200));
        const lowerName = mealName.toLowerCase();
        let mockResult = ["ingrediente 1", "ingrediente 2", "azeite"];
        for (const [key, value] of Object.entries(MOCK_INGREDIENTS)) {
          if (lowerName.includes(key)) {
            mockResult = value;
            break;
          }
        }
        setIngredients(mockResult);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-ingredients`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              mealName: mealName.trim(),
              mealType,
            }),
          }
        );

        if (!res.ok) throw new Error("Erro ao extrair ingredientes");

        const data = await res.json();
        const extracted: string[] = data.ingredients.map((i: { name: string; quantity: string }) =>
          i.quantity ? `${i.name} ${i.quantity}` : i.name
        );
        setIngredients(extracted);
      }
    } catch (err) {
      toast.error("Não foi possível extrair os ingredientes. Adiciona manualmente.");
    } finally {
      setIsExtracting(false);
    }
  };

  const removeIngredient = (idx: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const addIngredient = () => {
    const trimmed = newIngredient.trim();
    if (!trimmed) return;
    setIngredients((prev) => [...prev, trimmed]);
    setNewIngredient("");
  };

  const handleSave = () => {
    if (!mealName.trim()) {
      toast.error("Escreve o nome da refeição");
      return;
    }
    onSave(mealName.trim(), ingredients);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{existingEntry ? "Editar" : "Adicionar"} {MEAL_LABELS[mealType]}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-6">
          {/* Meal name input */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Refeição</label>
            <Input
              placeholder={`Ex: Salmão grelhado com quinoa`}
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !ingredients.length && handleExtractIngredients()}
              autoFocus
            />
          </div>

          {/* AI extract button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExtractIngredients}
            disabled={isExtracting || !mealName.trim()}
            className="w-full"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A extrair ingredientes...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {ingredients.length > 0 ? "Regenerar ingredientes com IA" : "Extrair ingredientes com IA"}
              </>
            )}
          </Button>

          {/* Ingredients list */}
          {ingredients.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ingredientes</label>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {ing}
                    <button onClick={() => removeIngredient(idx)} className="hover:text-destructive transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Manual ingredient add */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              {ingredients.length > 0 ? "Adicionar ingrediente" : "Ou adiciona manualmente"}
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: alho"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addIngredient()}
              />
              <Button variant="outline" size="icon" onClick={addIngredient} disabled={!newIngredient.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Save */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSave}
            disabled={isSaving || !mealName.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A guardar...
              </>
            ) : (
              "Guardar refeição"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
