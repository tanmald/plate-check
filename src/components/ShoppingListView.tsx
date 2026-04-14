import { useState } from "react";
import { Share2, Plus, ShoppingCart, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShoppingListItemRow } from "@/components/ShoppingListItem";
import { ShareListSheet } from "@/components/ShareListSheet";
import {
  useShoppingList,
  useShoppingListRealtime,
  useToggleShoppingItem,
  useAddShoppingItem,
  useRemoveShoppingItem,
} from "@/hooks/use-shopping-list";
import { CATEGORY_ORDER, CATEGORY_ICONS } from "@/lib/ingredient-categories";
import type { IngredientCategory } from "@/lib/ingredient-categories";
import { useTranslation } from "react-i18next";

interface ShoppingListViewProps {
  weekStartDate: string;
}

export function ShoppingListView({ weekStartDate }: ShoppingListViewProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useShoppingList(weekStartDate);
  const [shareOpen, setShareOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleItem = useToggleShoppingItem();
  const addItem = useAddShoppingItem();
  const removeItem = useRemoveShoppingItem();

  useShoppingListRealtime(data?.list?.id);

  const list = data?.list ?? null;
  const items = data?.items ?? [];

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;

  const grouped = CATEGORY_ORDER.reduce<Record<string, typeof items>>((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  const otherItems = items.filter((i) => !CATEGORY_ORDER.includes(i.category as IngredientCategory));
  if (otherItems.length > 0) {
    grouped["Outros"] = [...(grouped["Outros"] ?? []), ...otherItems];
  }

  const handleToggle = (itemId: string, checked: boolean) => {
    toggleItem.mutate({ itemId, checked, weekStartDate });
  };

  const handleRemove = (itemId: string) => {
    removeItem.mutate({ itemId, weekStartDate });
  };

  const handleAddItem = () => {
    const name = newItemName.trim();
    if (!name || !list) return;

    addItem.mutate(
      { listId: list.id, name, category: "Outros", quantity: null, weekStartDate },
      {
        onSuccess: () => {
          setNewItemName("");
          toast.success(t("shopping.item_added"));
        },
        onError: () => toast.error(t("shopping.error_add")),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="font-medium">{t("shopping.empty_title")}</p>
        <p className="text-sm text-muted-foreground">{t("shopping.empty_desc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with progress and actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{list.name}</p>
          <p className="text-xs text-muted-foreground">
            {checkedCount}/{totalCount} {t("shopping.bought", { checked: checkedCount, total: totalCount, plural: checkedCount !== 1 ? "s" : "" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShareOpen(true)} className="gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {t("shopping.share")}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all"
            style={{ width: `${(checkedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* Grouped items */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, catItems]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-base">{CATEGORY_ICONS[category as IngredientCategory] ?? "🛒"}</span>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {category}
              </p>
              <span className="text-xs text-muted-foreground/60">
                ({catItems.filter((i) => !i.checked).length}/{catItems.length})
              </span>
            </div>
            <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
              {catItems.map((item) => (
                <ShoppingListItemRow
                  key={item.id}
                  item={item}
                  onToggle={(checked) => handleToggle(item.id, checked)}
                  onRemove={() => handleRemove(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add item */}
      {showAddForm ? (
        <div className="flex gap-2">
          <Input
            placeholder={t("shopping.add_item_placeholder")}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            autoFocus
          />
          <Button size="sm" onClick={handleAddItem} disabled={!newItemName.trim() || addItem.isPending}>
            {addItem.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setShowAddForm(false); setNewItemName(""); }}>
            {t("shopping.cancel")}
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          {t("shopping.add_item_btn")}
        </Button>
      )}

      {/* Realtime indicator */}
      {list.collaboratorIds.length > 0 && (
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
          {list.collaboratorIds.length === 1
            ? t("shopping.realtime_with", { count: list.collaboratorIds.length })
            : t("shopping.realtime_with_plural", { count: list.collaboratorIds.length })}
        </p>
      )}

      {list && (
        <ShareListSheet
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          shareCode={list.shareCode}
          listName={list.name}
        />
      )}
    </div>
  );
}
