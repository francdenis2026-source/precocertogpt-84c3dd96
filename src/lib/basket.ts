import { supabase } from "./supabase";
import { requestAuthAction } from "./authActionPrompt";

// Cesta de compras — mesma chave usada em /produto/:identifier, no modal de
// visualização rápida e no modal de comparação da busca, para que um item
// adicionado em qualquer um deles apareça igual nos outros e na cesta final.
export const BASKET_KEY = "precocerto:active_basket_items";
export const PENDING_BASKET_KEY = "pc:pending_basket_item";

export type BasketEntry = { productId: string; quantity: number };

export function readBasket(): BasketEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(BASKET_KEY) || "[]") as BasketEntry[];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.productId && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function writeBasket(items: BasketEntry[]) {
  localStorage.setItem(BASKET_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("pc:basket-changed"));
}

export function isInBasket(productId: string | number): boolean {
  return readBasket().some((item) => item.productId === String(productId));
}

/** Adiciona 1 unidade do produto se ele ainda não estiver na cesta. */
export function addToBasket(productId: string | number): "added" | "exists" {
  const id = String(productId);
  const current = readBasket();
  if (current.some((item) => item.productId === id)) return "exists";
  writeBasket([...current, { productId: id, quantity: 1 }]);
  return "added";
}

/**
 * Mesma coisa, mas primeiro confere se há sessão — sem conta, a cesta local
 * não sincroniza com nada, então o produto era "perdido" na primeira troca
 * de aparelho. Em vez disso, guarda a intenção e manda para o convite de
 * login/cadastro (o mesmo usado por favoritos), retomando depois que a
 * pessoa entrar.
 */
export async function addToBasketWithAuthGuard(productId: string | number): Promise<"added" | "exists" | "auth-required"> {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!session?.user) {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    sessionStorage.setItem(PENDING_BASKET_KEY, JSON.stringify({ productId: String(productId), returnTo, createdAt: Date.now() }));
    requestAuthAction("basket", returnTo);
    return "auth-required";
  }
  return addToBasket(productId);
}
