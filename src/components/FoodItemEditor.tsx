import { useState } from "react";
import { Check, AlertCircle, Pencil, Trash2, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type EditableFood, FOOD_CATEGORIES } from "@/lib/scoring";

interface FoodItemEditorProps {
  food: EditableFood;
  onUpdate: (updated: Partial<EditableFood>) => void;
  onDelete: () => void;
  onUndo?: () => void;
}

export function FoodItemEditor({
  food,
  onUpdate,
  onDelete,
  onUndo,
}: FoodItemEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(food.name);
  const [editCategory, setEditCategory] = useState(food.category);

  const handleSaveEdit = () => {
    onUpdate({
      name: editName,
      category: editCategory,
      originalName: food.originalName || food.name,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(food.name);
    setEditCategory(food.category);
    setIsEditing(false);
  };

  const handleMatchedToggle = (matched: boolean) => {
    onUpdate({ matched });
  };

  // Deleted state
  if (food.isDeleted) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 animate-fade-in">
        <span className="text-sm text-muted-foreground line-through">
          {food.name}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          className="text-primary h-8 px-3"
        >
          Undo
        </Button>
      </div>
    );
  }

  // Editing state
  if (isEditing) {
    return (
      <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3 animate-scale-in">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Food name
          </label>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Food name"
            className="h-10"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Category
          </label>
          <Select value={editCategory} onValueChange={setEditCategory}>
            <SelectTrigger className="h-10">
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

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={food.matched}
              onCheckedChange={handleMatchedToggle}
              id="matched-toggle"
            />
            <label
              htmlFor="matched-toggle"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Matches plan
            </label>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelEdit}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSaveEdit}
            className="flex-1"
            disabled={!editName.trim()}
          >
            <Check className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  // Default/display state - tappable to edit
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
        "hover:ring-2 hover:ring-primary/20 active:scale-[0.98]",
        food.matched ? "bg-success/10" : "bg-warning/10",
        food.isNew && "animate-slide-in-food"
      )}
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {food.matched ? (
          <Check className="w-5 h-5 text-success flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
        )}
        <div className="min-w-0">
          <span
            className={cn(
              "font-medium text-sm block truncate",
              food.matched ? "text-success" : "text-warning"
            )}
          >
            {food.name}
          </span>
          <p className="text-xs text-muted-foreground">{food.category}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
