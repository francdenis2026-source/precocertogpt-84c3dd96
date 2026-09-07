import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export type ShoppingListMode = "store" | "price" | "search";

export type ShoppingList = {
  id: string;
  name: string;
  mode: ShoppingListMode;
  targetEstablishmentId: string | null;
  budget: number | null;
  householdSize: number | null;
  source: "manual" | "ai";
  itemCount: number;
  updatedAt: string;
};

type ListRow = {
  id: string; name: string; mode: ShoppingListMode; target_establishment_id: string | null;
  budget: number | null; household_size: number | null; source: "manual" | "ai"; updated_at: string;
  shopping_list_items: { count: number }[];
};

function mapList(row: ListRow): ShoppingList {
  return {
    id: row.id,
    name: row.name,
    mode: row.mode,
    targetEstablishmentId: row.target_establishment_id,
    budget: row.budget,
    householdSize: row.household_size,
    source: row.source,
    itemCount: row.shopping_list_items?.[0]?.count ?? 0,
    updatedAt: row.updated_at,
  };
}

/** Lista todas as listas de compras do usuário logado. Só usada em telas já protegidas por RequireAuth. */
export function useShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    if (!userId) { setLists([]); setLoading(false); return; }

    const { data, error } = await supabase
      .from("shopping_lists")
      .select("id, name, mode, target_establishment_id, budget, household_size, source, updated_at, shopping_list_items(count)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    setLists(error || !data ? [] : (data as unknown as ListRow[]).map(mapList));
    setLoading(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const createList = useCallback(async (name: string, mode: ShoppingListMode) => {
    if (!supabase) return null;
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    if (!userId) return null;
    const { data, error } = await supabase
      .from("shopping_lists")
      .insert({ user_id: userId, name: name.trim() || "Minha lista", mode })
      .select("id")
      .single();
    if (error || !data) return null;
    await refresh();
    return data.id as string;
  }, [refresh]);

  const renameList = useCallback(async (id: string, name: string) => {
    await renameShoppingList(id, name);
    await refresh();
  }, [refresh]);

  const deleteList = useCallback(async (id: string) => {
    await deleteShoppingList(id);
    setLists(current => current.filter(list => list.id !== id));
  }, []);

  return { lists, loading, refresh, createList, renameList, deleteList };
}

/** Fora do hook: usadas tanto pela listagem quanto pela tela de detalhe da lista. */
export async function renameShoppingList(id: string, name: string) {
  if (!supabase || !name.trim()) return;
  await supabase.from("shopping_lists").update({ name: name.trim() }).eq("id", id);
}

export async function deleteShoppingList(id: string) {
  if (!supabase) return;
  await supabase.from("shopping_lists").delete().eq("id", id);
}
