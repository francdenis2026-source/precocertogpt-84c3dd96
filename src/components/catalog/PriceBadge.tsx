import type { ReactNode } from "react";

/** Selo "Menor preço" (ou variante) em verde vivo — extraído do painel
 *  flutuante do hero e do card de produto para ser reutilizado em qualquer
 *  lugar que precise sinalizar o menor preço real entre estabelecimentos
 *  (detalhe do produto, busca — fases futuras). Nunca mostra dado inventado:
 *  quem chama decide SE mostra, com base no dado real (storeCount > 1 etc.). */
export function PriceBadge({
  children = "Menor preço",
  tone = "solid",
}: {
  children?: ReactNode;
  tone?: "solid" | "soft";
}) {
  return (
    <span className={`pc-price-badge pc-price-badge--${tone}`}>{children}</span>
  );
}
