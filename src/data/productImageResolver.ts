import type { Product } from "./catalog";

type AssetMeta = {
  url?: string;
  original_filename?: string;
  content_type?: string;
};

const assetModules = import.meta.glob(
  "../assets/*.{png,jpg,jpeg,webp,avif}.asset.json",
  {
    eager: true,
    import: "default",
  },
) as Record<string, AssetMeta>;

const productImages = import.meta.glob(
  "../assets/products/*.{png,jpg,jpeg,webp,avif}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

// Recortes com fundo transparente, derivados das fotos originais removendo o
// branco ligado à borda. São preferidos porque a moldura do cartão é colorida:
// a foto original desenha um retângulo branco dentro dela.
const cutoutImages = import.meta.glob("../assets/products-cut/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.(png|jpe?g|webp|avif)$/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const localAssets = Object.entries(assetModules)
  .map(([path, meta]) => {
    if (!meta?.url) return null;
    const source =
      meta.original_filename ||
      path.replace(/^.*\//, "").replace(/\.asset\.json$/i, "");
    return { url: meta.url, key: normalize(source) };
  })
  .filter((item): item is { url: string; key: string } =>
    Boolean(item?.url && item.key),
  );

const productAssets = Object.entries(productImages).map(([path, url]) => ({
  url,
  key: normalize(path.replace(/^.*\//, "")),
}));

const cutoutAssets = Object.entries(cutoutImages).map(([path, url]) => ({
  url,
  key: normalize(path.replace(/^.*\//, "")),
}));

// Os recortes entram antes na lista, então vencem o empate por chave.
localAssets.unshift(...cutoutAssets);
localAssets.push(...productAssets);

const cutoutKeys = new Set(cutoutAssets.map((item) => item.key));

function cutoutKeyFor(product: Product): string | undefined {
  const candidates = [
    product.slug ? normalize(String(product.slug)) : "",
    normalize(product.name || ""),
    normalize(
      [product.name, product.brand, product.size].filter(Boolean).join(" "),
    ),
  ].filter((key) => key.length >= 8);

  for (const candidate of candidates) {
    if (cutoutKeys.has(candidate)) return candidate;
  }
  for (const candidate of candidates) {
    const key = [...cutoutKeys].find(
      (k) => k.includes(candidate) || candidate.includes(k),
    );
    if (key) return key;
  }
  return undefined;
}

/** Indica se o produto tem uma foto local recortada, sem fundo branco. */
export function hasCutout(product: Product) {
  return Boolean(cutoutKeyFor(product));
}

/** A imagem sem fundo branco do produto, quando existe uma. */
export function resolveCutoutImage(product: Product): string | undefined {
  const key = cutoutKeyFor(product);
  if (!key) return undefined;
  return cutoutAssets.find((item) => item.key === key)?.url;
}

// Alguns cadastros antigos receberam a URL de outro produto. Uma empada não
// deve herdar uma foto genérica/vermelha só porque existe uma URL no banco.
// Mantemos o estado neutro da interface até haver um arquivo identificável
// como empada, evitando informação visual enganosa para o consumidor.
function hasKnownImageMismatch(product: Product) {
  const productIdentity = normalize(
    [product.name, product.slug].filter(Boolean).join(" "),
  );
  if (!productIdentity.includes("empada")) return false;
  return Boolean(
    product.image_url && !normalize(product.image_url).includes("empada"),
  );
}

const NON_PRODUCT_IMAGE_MARKERS = [
  "placeholder",
  "fallback",
  "generic",
  "loremflickr",
  "picsum",
  "unsplash",
  "placehold",
  "category-",
  "categoria-",
  "product-default",
  "sem-imagem",
];

/**
 * Política visual pública: somente fotos vinculadas ao cadastro real do
 * produto. Imagens inferidas pelo nome, artes de categoria e placeholders não
 * são aceitos em nenhuma experiência de compra.
 */
export function hasProfessionalProductPhoto(product: Product) {
  const raw = product.image_url?.trim();
  if (!raw || hasKnownImageMismatch(product)) return false;
  const normalizedUrl = raw.toLowerCase();
  if (
    NON_PRODUCT_IMAGE_MARKERS.some((marker) => normalizedUrl.includes(marker))
  )
    return false;
  if (
    normalizedUrl.startsWith("data:image/svg") ||
    normalizedUrl.endsWith(".svg")
  )
    return false;

  try {
    const url = new URL(raw, "https://precocerto.local");
    const path = url.pathname.toLowerCase();
    return (
      /\.(avif|jpe?g|png|webp)$/i.test(path) ||
      url.origin !== "https://precocerto.local"
    );
  } catch {
    return false;
  }
}

export function resolveProductImage(product: Product): string | undefined {
  // Quando existe um recorte local e identificado, ele é a fonte preferida:
  // WebP leve, fundo transparente e sem depender de links externos.
  const cutout = resolveCutoutImage(product);
  if (cutout) return cutout;

  return hasProfessionalProductPhoto(product)
    ? product.image_url!.trim()
    : undefined;
}
