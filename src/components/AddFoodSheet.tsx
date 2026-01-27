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

interface AddFoodSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFood: (food: EditableFood) => void;
}

export function AddFoodSheet({ open, onOpenChange, onAddFood }: AddFoodSheetProps) {
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
    
    // Reset form
    setName("");
    setCategory("Other");
    setMatched(true);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
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
          <SheetTitle>Add Food</SheetTitle>
          <SheetDescription>
            Add a food item that wasn't detected
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Food name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Grilled salmon"
              className="h-12"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
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
              <p className="font-medium text-sm">Matches plan</p>
              <p className="text-xs text-muted-foreground">
                Does this food fit your nutrition plan?
              </p>
            </div>
            <Switch checked={matched} onCheckedChange={setMatched} />
          </div>

          <Button
            size="lg"
            className="w-full mt-4"
            onClick={handleAdd}
            disabled={!name.trim()}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Food
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
