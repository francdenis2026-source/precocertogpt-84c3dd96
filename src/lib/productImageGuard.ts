const FALLBACK_BASENAMES = [
  "arroz-tio-joao-5kg",
  "ype-neutro",
  "frango-seara",
  "pinho-sol-floral",
  "alpes-lavanda",
  "alpes-limao",
  "alpes-maca",
  "minuano-marinha",
  "ype-limao",
  "biscoito-wafer-bauducco-sabores-70g",
  "biscoito-itamaraty-morango",
  "biscoito_escureto_35g",
  "molho-de-tomate-tarantella-tradicional-300g",
  "nissin_lamen_carne",
  "esponja_brilhus",
  "pao_cesta",
  "feijao-kicaldo-1kg",
  "oleo-liza-900ml",
];

const STOP_WORDS = new Set([
  "de", "da", "do", "das", "dos", "com", "sem", "para", "e", "em",
  "tradicional", "sabores", "un", "kg", "g", "ml", "l", "litro", "litros",
  "unidade", "unidades", "produto", "integral", "branco", "branca",
]);

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value: string) {
  return normalize(value)
    .split(/\s+/)
    .filter(token => token.length >= 3 && !STOP_WORDS.has(token) && !/^\d+$/.test(token));
}

function imagePath(img: HTMLImageElement) {
  const raw = img.getAttribute("src") || "";
  try {
    return decodeURIComponent(new URL(raw, window.location.origin).pathname).toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
}

function productName(img: HTMLImageElement) {
  return (img.alt || "").replace(/^embalagem de\s+/i, "").trim();
}

function hasMeaningfulMatch(name: string, path: string) {
  const nameTokens = tokens(name);
  const pathTokens = tokens(path.replace(/\.[a-z0-9]+$/i, ""));
  if (!nameTokens.length || !pathTokens.length) return false;
  return nameTokens.some(token => pathTokens.includes(token));
}

function isKnownFallback(path: string) {
  return FALLBACK_BASENAMES.some(name => path.includes(name));
}

function isRealProductImage(img: HTMLImageElement) {
  const raw = img.getAttribute("src") || "";
  if (!raw) return false;
  if (raw.startsWith("blob:")) return true;
  if (raw.startsWith("data:")) return !img.closest<HTMLElement>(".product-photo")?.dataset.imagePlaceholder;

  const path = imagePath(img);
  const name = productName(img);

  // Fotos armazenadas no Supabase/CDN são uploads reais do catálogo.
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin && !isKnownFallback(url.pathname.toLowerCase())) return true;
  } catch {}

  // Um arquivo local cujo nome combina com o produto é considerado foto real.
  if (hasMeaningfulMatch(name, path)) return true;

  // Os caminhos abaixo eram usados como fallback para produtos diferentes.
  if (isKnownFallback(path)) return false;

  // Outros arquivos locais em /products são imagens explicitamente mapeadas.
  return path.includes("/products/");
}

function categoryFromContext(photo: HTMLElement) {
  const scope = photo.closest<HTMLElement>(
    ".visual-product-card, .professional-result-card, .store-product-card, .optimized-item-card, .fav-menu-item, article, .hero-insight__item",
  );
  const tag = scope?.querySelector<HTMLElement>(".category-tag");
  const text = normalize(tag?.textContent || scope?.textContent || "");

  if (/limpeza|detergente|sabao|desinfetante|agua sanitaria|lava roupas/.test(text)) return ["cleaning", "Limpeza"];
  if (/carne|acougue|frango|bovina|suina|linguica|bisteca/.test(text)) return ["meat", "Carnes"];
  if (/bebida|refrigerante|suco|agua mineral|cerveja|energetico/.test(text)) return ["drink", "Bebidas"];
  if (/hortifruti|fruta|verdura|legume|cebola|alho|cenoura|batata/.test(text)) return ["produce", "Hortifruti"];
  if (/padaria|pao|bolo|salgado/.test(text)) return ["bakery", "Padaria"];
  if (/higiene|beleza|shampoo|condicionador|papel higienico|sabonete/.test(text)) return ["care", "Higiene"];
  if (/laticinio|leite|queijo|iogurte|margarina/.test(text)) return ["dairy", "Laticínios"];
  if (/biscoito|bolacha|doce|chocolate|cereal/.test(text)) return ["snack", "Biscoitos e doces"];
  if (/congelado|sorvete/.test(text)) return ["frozen", "Congelados"];
  if (/farmacia|medicamento/.test(text)) return ["pharmacy", "Farmácia"];
  return ["grocery", "Mercearia"];
}

function markPhoto(photo: HTMLElement) {
  const img = photo.querySelector<HTMLImageElement>(":scope > img");
  if (!img) return;

  if (photo.dataset.imagePlaceholder === "true" && (img.src.startsWith("data:") || img.src.startsWith("blob:"))) return;

  const real = isRealProductImage(img);
  if (real) {
    delete photo.dataset.imagePlaceholder;
    delete photo.dataset.imageCategory;
    delete photo.dataset.imageCategoryLabel;
    return;
  }

  const [category, label] = categoryFromContext(photo);
  photo.dataset.imagePlaceholder = "true";
  photo.dataset.imageCategory = category;
  photo.dataset.imageCategoryLabel = label;
}

function applyHomeRealImagePolicy() {
  if (window.location.pathname !== "/") return;

  document.querySelectorAll<HTMLElement>(".featured-products .visual-product-card").forEach(card => {
    const photo = card.querySelector<HTMLElement>(".product-photo");
    card.hidden = !photo || photo.dataset.imagePlaceholder === "true";
  });

  document.querySelectorAll<HTMLElement>(".hero-insight__item").forEach(item => {
    const photo = item.querySelector<HTMLElement>(".product-photo");
    item.hidden = !photo || photo.dataset.imagePlaceholder === "true";
  });
}

function scan() {
  document.querySelectorAll<HTMLElement>(".product-photo").forEach(markPhoto);
  applyHomeRealImagePolicy();
}

let scheduled = false;
function scheduleScan() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    scan();
  });
}

export function initializeProductImageGuard() {
  if (typeof document === "undefined") return;
  scheduleScan();
  const observer = new MutationObserver(scheduleScan);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src"],
  });
  window.addEventListener("popstate", scheduleScan);
}
