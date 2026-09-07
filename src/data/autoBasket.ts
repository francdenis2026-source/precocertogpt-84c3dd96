import type { Product } from "./catalog";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

type Essential = { key: string; label: string; keywords: string[]; priority: number; quantity: (people: number) => number };

/** Mesma lista de itens essenciais usada pela Cesta Inteligente — sem IA,
 * só prioridade + regra de quantidade por pessoa. Reaproveitada aqui para
 * a montagem automática de listas, então as duas ferramentas escolhem os
 * mesmos itens do jeito esperado. */
const ESSENTIALS: Essential[] = [
  { key: "arroz", label: "Arroz", keywords: ["arroz"], priority: 1, quantity: p => Math.max(1, Math.ceil(p / 3)) },
  { key: "feijao", label: "Feijão", keywords: ["feijao"], priority: 2, quantity: p => Math.max(1, Math.ceil(p / 2)) },
  { key: "oleo", label: "Óleo", keywords: ["oleo de soja", "oleo"], priority: 3, quantity: p => Math.max(1, Math.ceil(p / 2)) },
  { key: "macarrao", label: "Macarrão", keywords: ["macarrao"], priority: 4, quantity: p => Math.max(1, Math.ceil(p * 1.5)) },
  { key: "leite", label: "Leite", keywords: ["leite integral", "leite"], priority: 5, quantity: p => Math.max(1, p * 2) },
  { key: "acucar", label: "Açúcar", keywords: ["acucar"], priority: 6, quantity: p => Math.max(1, Math.ceil(p / 2)) },
  { key: "cafe", label: "Café", keywords: ["cafe"], priority: 7, quantity: p => Math.max(1, Math.ceil(p / 2)) },
  { key: "farinha", label: "Farinha", keywords: ["farinha de trigo", "farinha"], priority: 8, quantity: () => 1 },
  { key: "sal", label: "Sal", keywords: ["sal refinado", "sal"], priority: 9, quantity: () => 1 },
  { key: "proteina", label: "Proteína", keywords: ["frango", "carne bovina", "carne"], priority: 10, quantity: p => Math.max(1, Math.ceil(p / 2)) },
  { key: "ovos", label: "Ovos", keywords: ["ovos", "ovo"], priority: 11, quantity: p => Math.max(1, Math.ceil(p / 3)) },
  { key: "detergente", label: "Detergente", keywords: ["detergente"], priority: 12, quantity: p => Math.max(1, Math.ceil(p / 2)) },
  { key: "sabao", label: "Sabão", keywords: ["sabao em po", "sabao"], priority: 13, quantity: () => 1 },
  { key: "papel", label: "Papel higiênico", keywords: ["papel higienico"], priority: 14, quantity: () => 1 },
];

function candidateFor(products: Product[], essential: Essential): Product | null {
  return products
    .filter(product => {
      const text = normalize(`${product.name} ${product.category} ${product.brand}`);
      return essential.keywords.some(k => text.includes(normalize(k))) && product.minPrice > 0;
    })
    .sort((a, b) => a.minPrice - b.minPrice || a.name.localeCompare(b.name, "pt-BR"))[0] || null;
}

function priceAtStore(product: Product, establishmentId: string): number | null {
  if (String(product.establishmentId) === establishmentId) return product.minPrice;
  return product.offers?.find(o => String(o.establishmentId) === establishmentId)?.value ?? null;
}

export type AutoBasketResult = { items: { productId: string; quantity: number }[]; missing: string[]; total: number };

/**
 * Monta automaticamente uma lista de compras a partir do orçamento e do
 * número de pessoas, sem nenhuma chamada externa: escolhe os itens
 * essenciais por prioridade, no menor preço disponível (ou no preço da loja
 * escolhida, se `targetEstablishmentId` for informado), até estourar o
 * orçamento.
 */
export function buildAutoBasket(products: Product[], budget: number, people: number, targetEstablishmentId?: string | null): AutoBasketResult {
  const items: { productId: string; quantity: number }[] = [];
  const missing: string[] = [];
  let total = 0;

  for (const essential of ESSENTIALS) {
    const product = candidateFor(products, essential);
    if (!product) { missing.push(essential.label); continue; }
    const unitPrice = targetEstablishmentId ? priceAtStore(product, targetEstablishmentId) : product.minPrice;
    if (unitPrice == null || unitPrice <= 0) { missing.push(essential.label); continue; }

    const desiredQty = essential.quantity(Math.max(1, people));
    let added = 0;
    for (let i = 0; i < desiredQty; i++) {
      if (total + unitPrice > budget) break;
      total += unitPrice;
      added++;
    }
    if (added > 0) items.push({ productId: String(product.id), quantity: added });
    else missing.push(essential.label);
  }

  return { items, missing, total };
}
