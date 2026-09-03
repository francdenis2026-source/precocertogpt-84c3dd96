import { supabase } from "../lib/supabase";
import { fetchCatalog } from "./remoteCatalog";
import type { CatalogPayload, Product, StoreRow } from "./catalog";
import { businessGroups, groupForStore, type BusinessGroup } from "./businessTaxonomy";

/* Como um estabelecimento entra (ou não) em um grupo da navegação.
 *
 * O modelo antigo exigia DUAS condições ao mesmo tempo para uma loja aparecer
 * num grupo: (1) o tipo do negócio bater com uma lista de palavras e (2) os
 * PRODUTOS dela conterem certos termos no nome ou na categoria. A segunda
 * condição era o erro. O Ponto do Sanduba, por exemplo, cadastra os itens em
 * "Sanduíches", "Refrigerantes" e "Suco Natural"; como nenhuma dessas palavras
 * estava na lista de termos do grupo de alimentação, a lanchonete inteira
 * desaparecia da navegação mesmo tendo cardápio completo. O mesmo acontecia
 * com açougues (o código ainda exigia que carnes só aparecessem em lojas do
 * tipo "butcher", que por sua vez não existia em nenhum grupo — ou seja,
 * carne nunca aparecia em lugar nenhum).
 *
 * Agora vale a regra óbvia: uma padaria é uma padaria, um açougue é um
 * açougue. O grupo vem do TIPO DO NEGÓCIO (ver businessTaxonomy.ts) e os
 * produtos do grupo são simplesmente os produtos vendidos por essas lojas —
 * sem depender de como cada lojista escreveu a categoria do item.
 *
 * Exceção intencional: mercados podem operar também um açougue interno. Nesse
 * caso, os produtos de carne aparecem no catálogo de Açougues e a loja também
 * é listada ali como ponto de venda, sem mudar seu tipo principal de mercado. */

export type SectorRule = BusinessGroup | { id: string };

export const storeMatchesSector = (store: StoreRow, sector: SectorRule) => groupForStore(store).id === sector.id;

export const productStoreIds = (product: Product) =>
  new Set([String(product.establishmentId), ...(product.offers || []).map(offer => String(offer.establishmentId))]);

const normalizeText = (value: string | null | undefined) =>
  (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const isButcherProduct = (product: Product) => {
  const text = normalizeText(`${product.category || ""} ${product.name || ""}`);
  return /\b(carnes?|acougue|bovino|suino|porco|costela|picanha|alcatra|patinho|fraldinha|bisteca|file|peito|pescoco|canela|figado|coracao|lingua|cha de fora|cha de dentro|carne moida)\b/.test(text);
};

/** Um produto pertence ao grupo quando alguma loja que o vende pertence ao grupo.
 * Mercados com açougue interno também têm seus cortes exibidos em Açougues. */
export const productHasSectorOffer = (product: Product, catalog: CatalogPayload, sector: SectorRule) => {
  const ids = productStoreIds(product);
  if (sector.id === "butchers" && isButcherProduct(product)) {
    return catalog.stores.some(store => ids.has(String(store.id)));
  }
  return catalog.stores.some(store => ids.has(String(store.id)) && storeMatchesSector(store, sector));
};

export const sectorProducts = (catalog: CatalogPayload, sector: SectorRule) =>
  catalog.products.filter(product => productHasSectorOffer(product, catalog, sector));

/* Todos os estabelecimentos do grupo, com quantos itens cada um tem no
 * catálogo. Diferente da versão anterior, uma loja NÃO é escondida por ainda
 * não ter produtos cadastrados. Mercados que têm catálogo de carnes também
 * aparecem em Açougues, preservando sua classificação principal como mercado. */
export const sectorStores = (catalog: CatalogPayload, sector: SectorRule) => {
  const counts = new Map<string, number>();
  const butcherStoreIds = new Set<string>();

  for (const product of catalog.products) {
    const ids = productStoreIds(product);
    for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
    if (sector.id === "butchers" && isButcherProduct(product)) {
      for (const id of ids) butcherStoreIds.add(id);
    }
  }

  return catalog.stores
    .filter(store => storeMatchesSector(store, sector) || (sector.id === "butchers" && butcherStoreIds.has(String(store.id))))
    .map(store => {
      if (sector.id !== "butchers") {
        return { store, count: counts.get(String(store.id)) || Number(store.products) || 0 };
      }
      const meatCount = catalog.products.filter(product =>
        isButcherProduct(product) && productStoreIds(product).has(String(store.id)),
      ).length;
      return { store, count: meatCount };
    })
    .sort((a, b) => b.count - a.count || a.store.name.localeCompare(b.store.name, "pt-BR"));
};

export const withCatalog = <T extends { count: number }>(rows: T[]) => rows.filter(row => row.count > 0);

/** Quantos estabelecimentos existem em cada grupo — usado para montar a
 *  navegação sem mostrar grupo vazio como se fosse igual aos demais. */
export const groupCounts = (catalog: CatalogPayload) => {
  const totals = new Map<string, { stores: number; withCatalog: number }>();
  for (const group of businessGroups) totals.set(group.id, { stores: 0, withCatalog: 0 });
  for (const store of catalog.stores) {
    const id = groupForStore(store).id;
    const entry = totals.get(id);
    if (!entry) continue;
    entry.stores += 1;
    if ((Number(store.products) || 0) > 0) entry.withCatalog += 1;
  }

  const butcher = totals.get("butchers");
  if (butcher) {
    const storesWithMeat = new Set<string>();
    for (const product of catalog.products) {
      if (!isButcherProduct(product)) continue;
      for (const id of productStoreIds(product)) storesWithMeat.add(id);
    }
    butcher.stores = Math.max(butcher.stores, storesWithMeat.size);
    butcher.withCatalog = Math.max(butcher.withCatalog, storesWithMeat.size);
  }

  return totals;
};

type RealEstablishmentRow = {
  id: string | number;
  name?: string | null;
  neighborhood?: string | null;
  brand_color?: string | null;
  kind?: string | null;
  address?: string | Record<string, unknown> | null;
  logo_url?: string | null;
};

const normalizeName = (value: string | null | undefined) =>
  (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** Remove os estabelecimentos numéricos do catálogo local de demonstração.
 * Cadastros reais usam UUID; as inclusões manuais legítimas usam slugs. */
export function withoutDemoEstablishments(catalog: CatalogPayload): CatalogPayload {
  const stores = catalog.stores.filter(store => !/^\d+$/.test(String(store.id)));
  return { ...catalog, stores, metrics: { ...catalog.metrics, stores: stores.length } };
}

const slugifyStore = (name: string, id: string | number) => {
  const slug = normalizeName(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `estabelecimento-${String(id).slice(0, 8)}`;
};

const addressText = (value: RealEstablishmentRow["address"]) => {
  if (!value) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  const read = (key: string) => {
    const item = value[key];
    return typeof item === "string" ? item.trim() : "";
  };
  return [
    [read("street"), read("number")].filter(Boolean).join(", "),
    read("neighborhood"),
    read("city"),
  ].filter(Boolean).join(" · ") || undefined;
};

const addressCity = (value: RealEstablishmentRow["address"]) => {
  if (!value || typeof value === "string") return undefined;
  const city = value.city;
  return typeof city === "string" && city.trim() ? city.trim() : undefined;
};

/**
 * Garante que os estabelecimentos reais do Supabase continuem visíveis mesmo
 * quando products/prices estiverem vazios, bloqueados por RLS ou temporariamente
 * indisponíveis. O catálogo de preços pode falhar sem apagar a tabela de lojas.
 */
async function mergeRealEstablishments(catalog: CatalogPayload): Promise<CatalogPayload> {
  if (!supabase) return withoutDemoEstablishments(catalog);

  const { data, error } = await supabase
    .from("establishments")
    .select("id,name,neighborhood,brand_color,kind,address,logo_url")
    .order("name", { ascending: true })
    .limit(2000);

  if (error || !data?.length) return withoutDemoEstablishments(catalog);

  const productCounts = new Map<string, number>();
  for (const product of catalog.products) {
    for (const id of productStoreIds(product)) {
      productCounts.set(id, (productCounts.get(id) || 0) + 1);
    }
  }

  const realRows = data as RealEstablishmentRow[];
  const realIds = new Set(realRows.map(row => String(row.id)));
  const realNames = new Set(realRows.map(row => normalizeName(row.name)));

  const realStores: StoreRow[] = realRows.map(row => {
    const name = row.name?.trim() || "Estabelecimento";
    return {
      id: row.id,
      slug: slugifyStore(name, row.id),
      name,
      neighborhood: row.neighborhood?.trim() || "—",
      color: row.brand_color || "#1473E6",
      kind: row.kind || "",
      address: addressText(row.address),
      logoUrl: row.logo_url || undefined,
      city: addressCity(row.address),
      products: productCounts.get(String(row.id)) || 0,
    };
  });

  // Mantém apenas adições manuais que ainda não ganharam cadastro oficial.
  // Os 12 seeds numéricos do fallback local não podem reaparecer quando o
  // Supabase possui estabelecimentos reais.
  const manualOnly = catalog.stores.filter(store => {
    const id = String(store.id);
    const name = normalizeName(store.name);
    if (realIds.has(id) || realNames.has(name)) return false;
    return !/^\d+$/.test(id);
  });

  const stores = [...realStores, ...manualOnly].sort((a, b) =>
    Number(b.products || 0) - Number(a.products || 0) || a.name.localeCompare(b.name, "pt-BR"));

  return {
    ...catalog,
    stores,
    metrics: {
      ...catalog.metrics,
      stores: stores.length,
    },
  };
}

let enhancedCache: { value: CatalogPayload; expires: number } | null = null;
let pending: Promise<CatalogPayload> | null = null;

export async function fetchSectorCatalog(force = false): Promise<CatalogPayload> {
  if (!force && enhancedCache && enhancedCache.expires > Date.now()) return enhancedCache.value;
  if (!force && pending) return pending;

  pending = (async () => {
    const catalog = await fetchCatalog("", { force });
    const value = await mergeRealEstablishments(catalog);
    enhancedCache = { value, expires: Date.now() + 60_000 };
    return value;
  })();

  try { return await pending; } finally { pending = null; }
}

export function prefetchSectorCatalog() { void fetchSectorCatalog().catch(() => undefined); }
