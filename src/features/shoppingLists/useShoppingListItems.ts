import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { fetchCatalog } from "../../data/remoteCatalog";
import type { Product } from "../../data/catalog";
import type { ShoppingListMode } from "./useShoppingLists";

export type ShoppingListItemRow = { productId: string; quantity: number; establishmentId: string | null };

export type ResolvedItem = {
  product: Product;
  quantity: number;
  /** Preço/loja usados no total desta linha, já respeitando o modo da lista. */
  unitPrice: number | null;
  establishment: string | null;
  establishmentId: string | null;
  /** true quando o modo é "store" e o produto não tem oferta na loja escolhida. */
  unavailableAtStore: boolean;
};

type ListMeta = { id: string; name: string; mode: ShoppingListMode; targetEstablishmentId: string | null } | null;

function offerAtEstablishment(product: Product, establishmentId: string) {
  if (String(product.establishmentId) === establishmentId) {
    return { value: product.minPrice, establishment: product.establishment };
  }
  const offer = product.offers?.find(o => String(o.establishmentId) === establishmentId);
  return offer ? { value: offer.value, establishment: offer.establishment } : null;
}

export function useShoppingListItems(listId: string | undefined) {
  const [meta, setMeta] = useState<ListMeta>(null);
  const [rows, setRows] = useState<ShoppingListItemRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!supabase || !listId) { setLoading(false); return; }
    setLoading(true);
    const [{ data: list }, { data: items }, catalog] = await Promise.all([
      supabase.from("shopping_lists").select("id, name, mode, target_establishment_id").eq("id", listId).single(),
      supabase.from("shopping_list_items").select("product_id, quantity, establishment_id").eq("list_id", listId),
      fetchCatalog(),
    ]);
    setMeta(list ? { id: list.id, name: list.name, mode: list.mode, targetEstablishmentId: list.target_establishment_id } : null);
    setRows((items ?? []).map(row => ({ productId: String(row.product_id), quantity: row.quantity, establishmentId: row.establishment_id })));
    setProducts(catalog.products);
    setLoading(false);
  }, [listId]);

  useEffect(() => { void load(); }, [load]);

  const setListMode = useCallback(async (mode: ShoppingListMode, targetEstablishmentId?: string | null) => {
    if (!supabase || !listId) return;
    await supabase.from("shopping_lists").update({ mode, target_establishment_id: targetEstablishmentId ?? null }).eq("id", listId);
    setMeta(current => current ? { ...current, mode, targetEstablishmentId: targetEstablishmentId ?? null } : current);
  }, [listId]);

  const addItem = useCallback(async (productId: string | number, quantity = 1) => {
    if (!supabase || !listId) return;
    const id = String(productId);
    const existing = rows.find(row => row.productId === id);
    if (existing) {
      const nextQty = existing.quantity + quantity;
      await supabase.from("shopping_list_items").update({ quantity: nextQty }).eq("list_id", listId).eq("product_id", id);
      setRows(current => current.map(row => row.productId === id ? { ...row, quantity: nextQty } : row));
      return;
    }
    const { error } = await supabase.from("shopping_list_items").insert({ list_id: listId, product_id: id, quantity });
    if (!error) setRows(current => [...current, { productId: id, quantity, establishmentId: null }]);
  }, [listId, rows]);

  const setQuantity = useCallback(async (productId: string | number, quantity: number) => {
    if (!supabase || !listId) return;
    const id = String(productId);
    if (quantity <= 0) {
      await supabase.from("shopping_list_items").delete().eq("list_id", listId).eq("product_id", id);
      setRows(current => current.filter(row => row.productId !== id));
      return;
    }
    await supabase.from("shopping_list_items").update({ quantity }).eq("list_id", listId).eq("product_id", id);
    setRows(current => current.map(row => row.productId === id ? { ...row, quantity } : row));
  }, [listId]);

  const removeItem = useCallback(async (productId: string | number) => {
    await setQuantity(productId, 0);
  }, [setQuantity]);

  /** Aplica em lote os itens sugeridos pela IA (substitui o que já existir na lista). */
  const applyBulk = useCallback(async (items: { productId: string; quantity: number }[]) => {
    if (!supabase || !listId || !items.length) return;
    await supabase.from("shopping_list_items").delete().eq("list_id", listId);
    const payload = items.map(item => ({ list_id: listId, product_id: item.productId, quantity: Math.max(1, item.quantity) }));
    await supabase.from("shopping_list_items").insert(payload);
    await supabase.from("shopping_lists").update({ source: "ai" }).eq("id", listId);
    await load();
  }, [listId, load]);

  const resolved: ResolvedItem[] = useMemo(() => {
    const mode = meta?.mode ?? "search";
    const target = meta?.targetEstablishmentId ?? null;
    return rows
      .map(row => {
        const product = products.find(p => String(p.id) === row.productId);
        if (!product) return null;
        if (mode === "store" && target) {
          const offer = offerAtEstablishment(product, target);
          return {
            product, quantity: row.quantity,
            unitPrice: offer?.value ?? null,
            establishment: offer?.establishment ?? null,
            establishmentId: offer ? target : null,
            unavailableAtStore: !offer,
          };
        }
        return {
          product, quantity: row.quantity,
          unitPrice: product.minPrice,
          establishment: product.establishment,
          establishmentId: String(product.establishmentId),
          unavailableAtStore: false,
        };
      })
      .filter((row): row is ResolvedItem => Boolean(row));
  }, [rows, products, meta]);

  const total = resolved.reduce((sum, row) => sum + (row.unitPrice ?? 0) * row.quantity, 0);
  const itemCount = rows.reduce((sum, row) => sum + row.quantity, 0);
  const storeCount = new Set(resolved.map(row => row.establishmentId).filter(Boolean)).size;
  const missingAtStore = resolved.filter(row => row.unavailableAtStore).length;

  return { meta, resolved, loading, total, itemCount, storeCount, missingAtStore, addItem, setQuantity, removeItem, setListMode, applyBulk, refresh: load };
}
