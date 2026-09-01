import { supabase } from "./supabase";
import { loadSessionProfile } from "./roles";

/**
 * Ofertas promocionais da plataforma.
 *
 * Armazenamento: tabela dedicada `platform_offers` quando existir. Se ela ainda
 * não foi criada no banco do projeto, o módulo usa `platform_campaigns` com
 * `placement = 'category_offer'` (fora da barra superior, portanto sem efeito
 * colateral nas campanhas do topo). Assim a aba de Ofertas funciona sem exigir
 * migração manual.
 */

export type PlatformOffer = {
  id: string;
  title: string;
  productName: string;
  storeName: string | null;
  categorySlug: string | null;
  promoPrice: number | null;
  regularPrice: number | null;
  imageUrl: string | null;
  linkUrl: string;
  endsAt: string | null;
  startsAt: string | null;
  isActive: boolean;
  priority: number;
};

export type OfferInput = Omit<PlatformOffer, "id"> & { id?: string };

const OFFERS_TABLE = "platform_offers";
const FALLBACK_TABLE = "platform_campaigns";
const FALLBACK_PLACEMENT = "category_offer";

let useFallback: boolean | null = null;

function isMissingTable(message?: string | null) {
  const text = (message || "").toLowerCase();
  return text.includes("does not exist") || text.includes("could not find the table") || text.includes("schema cache");
}

/** Normaliza um número enviado pelo formulário (aceita "12,90"). */
export function parsePrice(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const value = typeof raw === "number" ? raw : Number(String(raw).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(value) && value >= 0 ? Number(value.toFixed(2)) : null;
}

export function offerSlug(value: string | null | undefined) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Extrai os campos estruturados guardados no fallback (`subtitle` em JSON). */
function decodeFallbackMeta(subtitle: unknown) {
  if (typeof subtitle !== "string" || !subtitle.trim().startsWith("{")) return {};
  try {
    return JSON.parse(subtitle) as Partial<PlatformOffer>;
  } catch {
    return {};
  }
}

function fromOffersRow(row: Record<string, unknown>): PlatformOffer {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    productName: String(row.product_name || row.title || ""),
    storeName: row.store_name ? String(row.store_name) : null,
    categorySlug: row.category_slug ? String(row.category_slug) : null,
    promoPrice: row.promo_price === null || row.promo_price === undefined ? null : Number(row.promo_price),
    regularPrice: row.regular_price === null || row.regular_price === undefined ? null : Number(row.regular_price),
    imageUrl: row.image_url ? String(row.image_url) : null,
    linkUrl: String(row.link_url || "/buscar"),
    startsAt: row.starts_at ? String(row.starts_at) : null,
    endsAt: row.ends_at ? String(row.ends_at) : null,
    isActive: row.is_active !== false,
    priority: Number(row.priority) || 0,
  };
}

function fromFallbackRow(row: Record<string, unknown>): PlatformOffer {
  const meta = decodeFallbackMeta(row.subtitle);
  return {
    id: String(row.id),
    title: String(row.title || ""),
    productName: meta.productName || String(row.title || ""),
    storeName: meta.storeName ?? null,
    categorySlug: meta.categorySlug ?? null,
    promoPrice: meta.promoPrice ?? null,
    regularPrice: meta.regularPrice ?? null,
    imageUrl: row.image_url ? String(row.image_url) : null,
    linkUrl: String(row.link_url || "/buscar"),
    startsAt: row.starts_at ? String(row.starts_at) : null,
    endsAt: row.ends_at ? String(row.ends_at) : null,
    isActive: row.is_active !== false,
    priority: Number(row.priority) || 0,
  };
}

function toOffersRow(value: OfferInput) {
  return {
    title: value.title.trim(),
    product_name: value.productName.trim(),
    store_name: value.storeName?.trim() || null,
    category_slug: value.categorySlug ? offerSlug(value.categorySlug) : null,
    promo_price: value.promoPrice,
    regular_price: value.regularPrice,
    image_url: value.imageUrl?.trim() || null,
    link_url: value.linkUrl.trim() || "/buscar",
    starts_at: value.startsAt || null,
    ends_at: value.endsAt || null,
    is_active: value.isActive,
    priority: value.priority,
  };
}

function toFallbackRow(value: OfferInput, userId: string) {
  return {
    kind: "advertisement",
    placement: FALLBACK_PLACEMENT,
    title: value.title.trim(),
    subtitle: JSON.stringify({
      productName: value.productName.trim(),
      storeName: value.storeName?.trim() || null,
      categorySlug: value.categorySlug ? offerSlug(value.categorySlug) : null,
      promoPrice: value.promoPrice,
      regularPrice: value.regularPrice,
    }),
    image_url: value.imageUrl?.trim() || null,
    link_url: value.linkUrl.trim() || "/buscar",
    link_label: "Ver oferta",
    theme: "emerald",
    priority: value.priority,
    is_active: value.isActive,
    is_dismissible: true,
    starts_at: value.startsAt || null,
    ends_at: value.endsAt || null,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };
}

export function isOfferCurrent(offer: PlatformOffer, now = Date.now()) {
  if (!offer.isActive) return false;
  if (offer.startsAt && new Date(offer.startsAt).getTime() > now) return false;
  if (offer.endsAt && new Date(offer.endsAt).getTime() <= now) return false;
  return true;
}

/** Ofertas visíveis no site (páginas de categoria e setor). */
export async function loadPublicOffers(): Promise<PlatformOffer[]> {
  if (!supabase) return [];
  if (useFallback !== true) {
    const { data, error } = await supabase.from(OFFERS_TABLE).select("*").eq("is_active", true).order("priority", { ascending: false }).limit(60);
    if (!error) {
      useFallback = false;
      return (data || []).map(fromOffersRow).filter(offer => isOfferCurrent(offer));
    }
    if (!isMissingTable(error.message)) return [];
    useFallback = true;
  }
  const { data, error } = await supabase
    .from(FALLBACK_TABLE)
    .select("*")
    .eq("placement", FALLBACK_PLACEMENT)
    .eq("is_active", true)
    .order("priority", { ascending: false })
    .limit(60);
  if (error) return [];
  return (data || []).map(fromFallbackRow).filter(offer => isOfferCurrent(offer));
}

/** Todas as ofertas (painel administrativo). */
export async function loadAdminOffers(): Promise<PlatformOffer[]> {
  if (!supabase) return [];
  if (useFallback !== true) {
    const { data, error } = await supabase.from(OFFERS_TABLE).select("*").order("priority", { ascending: false }).limit(200);
    if (!error) {
      useFallback = false;
      return (data || []).map(fromOffersRow);
    }
    if (!isMissingTable(error.message)) throw new Error(error.message);
    useFallback = true;
  }
  const { data, error } = await supabase
    .from(FALLBACK_TABLE)
    .select("*")
    .eq("placement", FALLBACK_PLACEMENT)
    .order("priority", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data || []).map(fromFallbackRow);
}

function validate(value: OfferInput): string | null {
  if (!value.title.trim() || value.title.trim().length > 120) return "Informe um título com até 120 caracteres.";
  if (!value.productName.trim() || value.productName.trim().length > 140) return "Informe o produto da oferta (até 140 caracteres).";
  if (value.promoPrice === null) return "Informe o preço promocional.";
  if (value.regularPrice !== null && value.promoPrice >= value.regularPrice) return "O preço promocional precisa ser menor que o preço normal.";
  if (!value.endsAt) return "Informe a validade da oferta.";
  if (value.startsAt && new Date(value.endsAt) <= new Date(value.startsAt)) return "A validade precisa ser depois do início.";
  if (value.linkUrl.trim().length > 300) return "O link está muito longo.";
  return null;
}

export async function saveOffer(value: OfferInput): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Banco não configurado." };
  const invalid = validate(value);
  if (invalid) return { error: invalid };
  const profile = await loadSessionProfile(true);
  if (!profile?.isAdmin) return { error: "Acesso administrativo necessário." };

  if (useFallback !== true) {
    const payload = toOffersRow(value);
    const request = value.id
      ? supabase.from(OFFERS_TABLE).update(payload).eq("id", value.id)
      : supabase.from(OFFERS_TABLE).insert(payload);
    const { error } = await request;
    if (!error) {
      useFallback = false;
      notifyOffersChanged();
      return { error: null };
    }
    if (!isMissingTable(error.message)) return { error: error.message };
    useFallback = true;
  }

  const payload = toFallbackRow(value, profile.userId);
  const request = value.id
    ? supabase.from(FALLBACK_TABLE).update(payload).eq("id", value.id)
    : supabase.from(FALLBACK_TABLE).insert({ ...payload, created_by: profile.userId });
  const { error } = await request;
  if (error) return { error: error.message };
  notifyOffersChanged();
  return { error: null };
}

export async function deleteOffer(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Banco não configurado." };
  const profile = await loadSessionProfile(true);
  if (!profile?.isAdmin) return { error: "Acesso administrativo necessário." };
  const table = useFallback ? FALLBACK_TABLE : OFFERS_TABLE;
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  notifyOffersChanged();
  return { error: null };
}

export async function uploadOfferImage(file: File): Promise<{ url: string | null; error: string | null }> {
  if (!supabase) return { url: null, error: "Banco não configurado." };
  if (!file.type.startsWith("image/")) return { url: null, error: "Escolha um arquivo de imagem." };
  if (file.size > 6 * 1024 * 1024) return { url: null, error: "A imagem deve ter no máximo 6 MB." };
  const ext = (file.name.split(".").pop() || "webp").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const path = `ofertas/${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("campaigns").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) return { url: null, error: error.message };
  return { url: supabase.storage.from("campaigns").getPublicUrl(path).data.publicUrl, error: null };
}

function notifyOffersChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("pc:offers-changed"));
}
