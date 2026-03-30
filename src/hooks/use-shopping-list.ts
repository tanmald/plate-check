import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser, mockShoppingList, mockShoppingItems } from "@/lib/test-data";

export interface ShoppingListItem {
  id: string;
  listId: string;
  name: string;
  category: string;
  quantity: string | null;
  checked: boolean;
  sourceDays: string[];
  sortOrder: number;
}

export interface ShoppingList {
  id: string;
  weekStartDate: string;
  name: string;
  shareCode: string;
  collaboratorIds: string[];
}

// ─── Fetch shopping list + items ──────────────────────────────────────────────

export function useShoppingList(weekStartDate: string) {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["shopping-list", user?.id, weekStartDate],
    queryFn: async (): Promise<{ list: ShoppingList | null; items: ShoppingListItem[] }> => {
      if (isTestUser(user?.email)) {
        if (mockShoppingList.weekStartDate === weekStartDate) {
          return { list: mockShoppingList as ShoppingList, items: mockShoppingItems as ShoppingListItem[] };
        }
        return { list: null, items: [] };
      }

      if (!user?.id) return { list: null, items: [] };

      const { data: listData, error: listError } = await supabase
        .from("shopping_lists")
        .select("*")
        .or(`user_id.eq.${user.id},collaborator_ids.cs.{${user.id}}`)
        .eq("week_start_date", weekStartDate)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (listError) throw listError;
      if (!listData) return { list: null, items: [] };

      const { data: items, error: itemsError } = await supabase
        .from("shopping_list_items")
        .select("*")
        .eq("list_id", listData.id)
        .order("sort_order", { ascending: true });

      if (itemsError) throw itemsError;

      return {
        list: {
          id: listData.id,
          weekStartDate: listData.week_start_date,
          name: listData.name,
          shareCode: listData.share_code,
          collaboratorIds: listData.collaborator_ids || [],
        },
        items: (items || []).map((i) => ({
          id: i.id,
          listId: i.list_id,
          name: i.name,
          category: i.category,
          quantity: i.quantity,
          checked: i.checked,
          sourceDays: i.source_days || [],
          sortOrder: i.sort_order,
        })),
      };
    },
    enabled: !!user,
  });

  return query;
}

// ─── Realtime subscription for shopping list items ────────────────────────────

export function useShoppingListRealtime(listId: string | null | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!listId || isTestUser(user?.email)) return;

    const channel = supabase
      .channel(`shopping-list-items:${listId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_list_items",
          filter: `list_id=eq.${listId}`,
        },
        () => {
          // Invalidate all shopping-list queries so they refetch
          queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId, queryClient, user?.email]);
}

// ─── Generate shopping list from weekly plan entries ──────────────────────────

interface GenerateListInput {
  weekStartDate: string;
  weeklyPlanId: string;
  entries: Array<{ mealName: string; ingredients: string[]; dayOfWeek: number }>;
}

const DAY_NAMES = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export function useGenerateShoppingList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: GenerateListInput) => {
      if (isTestUser(user?.email)) {
        await new Promise((r) => setTimeout(r, 600));
        return { listId: mockShoppingList.id };
      }

      if (!user?.id) throw new Error("Not authenticated");

      // Consolidate all ingredients across the week
      const ingredientMap = new Map<string, { quantity: string | null; sourceDays: string[] }>();

      for (const entry of input.entries) {
        const dayName = DAY_NAMES[entry.dayOfWeek] ?? `Dia ${entry.dayOfWeek}`;
        for (const raw of entry.ingredients) {
          // Normalise: lowercase, trim
          const key = raw.toLowerCase().trim();
          if (!ingredientMap.has(key)) {
            ingredientMap.set(key, { quantity: null, sourceDays: [] });
          }
          const existing = ingredientMap.get(key)!;
          if (!existing.sourceDays.includes(dayName)) {
            existing.sourceDays.push(dayName);
          }
        }
      }

      // Create or replace the shopping list row
      const { data: list, error: listError } = await supabase
        .from("shopping_lists")
        .upsert(
          {
            user_id: user.id,
            weekly_plan_id: input.weeklyPlanId || null,
            week_start_date: input.weekStartDate,
            name: `Lista da semana de ${formatWeekDate(input.weekStartDate)}`,
          },
          { onConflict: "user_id,week_start_date" }
        )
        .select("id")
        .single();

      if (listError) throw listError;

      // Delete existing items and re-insert consolidated ones
      await supabase.from("shopping_list_items").delete().eq("list_id", list.id);

      const itemRows = Array.from(ingredientMap.entries()).map(([raw, meta], idx) => {
        // Parse "quinoa 80g" → { name: "quinoa", quantity: "80g" }
        const { name, quantity } = parseIngredient(raw);
        return {
          list_id: list.id,
          name,
          category: "Outros", // category will be set by the Edge Function; fallback here
          quantity: quantity || meta.quantity,
          source_days: meta.sourceDays,
          sort_order: idx,
        };
      });

      if (itemRows.length > 0) {
        const { error: insertError } = await supabase
          .from("shopping_list_items")
          .insert(itemRows);
        if (insertError) throw insertError;
      }

      return { listId: list.id };
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({
        queryKey: ["shopping-list", user?.id, input.weekStartDate],
      });
    },
  });
}

// ─── Toggle item checked state ────────────────────────────────────────────────

export function useToggleShoppingItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      checked,
      weekStartDate,
    }: {
      itemId: string;
      checked: boolean;
      weekStartDate: string;
    }) => {
      if (isTestUser(user?.email)) {
        await new Promise((r) => setTimeout(r, 150));
        return { itemId, checked, weekStartDate };
      }

      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("shopping_list_items")
        .update({ checked, checked_by: checked ? user.id : null })
        .eq("id", itemId);

      if (error) throw error;
      return { itemId, checked, weekStartDate };
    },
    // Optimistic update
    onMutate: async ({ itemId, checked, weekStartDate }) => {
      await queryClient.cancelQueries({ queryKey: ["shopping-list", user?.id, weekStartDate] });
      const previous = queryClient.getQueryData(["shopping-list", user?.id, weekStartDate]);

      queryClient.setQueryData(
        ["shopping-list", user?.id, weekStartDate],
        (old: { list: ShoppingList | null; items: ShoppingListItem[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === itemId ? { ...item, checked } : item
            ),
          };
        }
      );

      return { previous };
    },
    onError: (_err, { weekStartDate }, context: { previous: unknown } | undefined) => {
      queryClient.setQueryData(["shopping-list", user?.id, weekStartDate], context?.previous);
    },
  });
}

// ─── Add item manually ────────────────────────────────────────────────────────

export function useAddShoppingItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      name,
      category,
      quantity,
      weekStartDate,
    }: {
      listId: string;
      name: string;
      category: string;
      quantity: string | null;
      weekStartDate: string;
    }) => {
      if (isTestUser(user?.email)) {
        await new Promise((r) => setTimeout(r, 300));
        return { weekStartDate };
      }

      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase.from("shopping_list_items").insert({
        list_id: listId,
        name,
        category,
        quantity,
        sort_order: Date.now(), // append to end
      });

      if (error) throw error;
      return { weekStartDate };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["shopping-list", user?.id, result.weekStartDate],
      });
    },
  });
}

// ─── Remove item ──────────────────────────────────────────────────────────────

export function useRemoveShoppingItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, weekStartDate }: { itemId: string; weekStartDate: string }) => {
      if (isTestUser(user?.email)) {
        await new Promise((r) => setTimeout(r, 200));
        return { weekStartDate };
      }

      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("shopping_list_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      return { weekStartDate };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["shopping-list", user?.id, result.weekStartDate],
      });
    },
  });
}

// ─── Join a list via share code ───────────────────────────────────────────────

export function useJoinShoppingList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shareCode }: { shareCode: string }) => {
      if (isTestUser(user?.email)) {
        await new Promise((r) => setTimeout(r, 500));
        throw new Error("Partilha não disponível no modo de teste");
      }

      if (!user?.id) throw new Error("Not authenticated");

      const { data: list, error: findError } = await supabase
        .from("shopping_lists")
        .select("id, collaborator_ids")
        .eq("share_code", shareCode.toUpperCase())
        .maybeSingle();

      if (findError) throw findError;
      if (!list) throw new Error("Código inválido. Verifica e tenta de novo.");

      if (list.collaborator_ids?.includes(user.id)) {
        return { alreadyJoined: true };
      }

      const { error: updateError } = await supabase
        .from("shopping_lists")
        .update({ collaborator_ids: [...(list.collaborator_ids || []), user.id] })
        .eq("id", list.id);

      if (updateError) throw updateError;
      return { alreadyJoined: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseIngredient(raw: string): { name: string; quantity: string | null } {
  // Try to split "salmão 200g" → name="salmão", quantity="200g"
  const match = raw.match(/^(.+?)\s+(\d+\s*(?:g|kg|ml|l|un|un\.|unidade|colher|c\.s\.|cs)\.?)$/i);
  if (match) {
    return { name: match[1].trim(), quantity: match[2].trim() };
  }
  return { name: raw.trim(), quantity: null };
}

function formatWeekDate(weekStartDate: string): string {
  const date = new Date(weekStartDate + "T00:00:00");
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}
