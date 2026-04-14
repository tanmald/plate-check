import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FOOD_CATEGORIES, generateFoodId, type EditableFood } from "@/lib/scoring";
import { useTranslation } from "react-i18next";

interface AddFoodSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFood: (food: EditableFood) => void;
}

export function AddFoodSheet({ open, onOpenChange, onAddFood }: AddFoodSheetProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [matched, setMatched] = useState(true);

  const handleAdd = () => {
    if (!name.trim()) return;

    const newFood: EditableFood = {
      id: generateFoodId(),
      name: name.trim(),
      category,
      matched,
      isNew: true,
    };

    onAddFood(newFood);
    setName("");
    setCategory("Other");
    setMatched(true);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("");
      setCategory("Other");
      setMatched(true);
    }
    onOpenChange(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>{t("addFood.title")}</SheetTitle>
          <SheetDescription>{t("addFood.desc")}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("addFood.food_name")}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("addFood.food_placeholder")}
              className="h-12"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("addFood.category")}</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOOD_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
            <div>
              <p className="font-medium text-sm">{t("addFood.matches_plan")}</p>
              <p className="text-xs text-muted-foreground">{t("addFood.matches_plan_desc")}</p>
            </div>
            <Switch checked={matched} onCheckedChange={setMatched} />
          </div>

          <Button size="lg" className="w-full mt-4" onClick={handleAdd} disabled={!name.trim()}>
            <Plus className="w-5 h-5 mr-2" />
            {t("addFood.add_button")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
