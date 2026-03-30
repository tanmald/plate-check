import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShoppingListItem as Item } from "@/hooks/use-shopping-list";

interface ShoppingListItemProps {
  item: Item;
  onToggle: (checked: boolean) => void;
  onRemove: () => void;
}

export function ShoppingListItemRow({ item, onToggle, onRemove }: ShoppingListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all",
        item.checked ? "opacity-50" : ""
      )}
    >
      {/* Custom checkbox */}
      <button
        onClick={() => onToggle(!item.checked)}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
          item.checked
            ? "bg-primary border-primary"
            : "border-muted-foreground/40 hover:border-primary"
        )}
      >
        {item.checked && (
          <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Name + quantity */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-sm font-medium",
            item.checked && "line-through text-muted-foreground"
          )}
        >
          {item.name}
        </span>
        {item.quantity && (
          <span className="text-xs text-muted-foreground ml-1.5">{item.quantity}</span>
        )}
        {item.sourceDays.length > 0 && (
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            {item.sourceDays.join(", ")}
          </p>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="p-1 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
