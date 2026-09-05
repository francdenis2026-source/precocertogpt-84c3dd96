import type { BusinessGroupId } from "./businessTaxonomy";

import markets from "../assets/sectors-2026/sector-markets.webp";
import butchers from "../assets/sectors-2026/sector-butchers.webp";
import bakery from "../assets/sectors-2026/sector-bakery.webp";
import food from "../assets/sectors-2026/sector-food.webp";
import pharmacies from "../assets/sectors-2026/sector-pharmacies-v2.jpg";
import books from "../assets/sectors-2026/sector-books.webp";
import services from "../assets/sectors-2026/sector-services.webp";
import other from "../assets/sectors-2026/sector-other.webp";

/**
 * Foto de hero por tipo de estabelecimento. Cada nicho tem a sua, então quando
 * a vitrine troca de estabelecimento a imagem acompanha o ramo, em vez de
 * mostrar sempre a mesma prateleira de mercado.
 *
 * Os oito arquivos são fotografia real. O conjunto anterior era gerado por IA e
 * se entregava: letreiros com texto ilegível, telas com palavras inventadas e,
 * em mercados, uma dominante verde-azulada que brigava com o dourado da marca.
 * Procedência e critério de escolha em assets/sectors-2026/CREDITOS.md.
 */
const SECTOR_HERO_IMAGES: Record<BusinessGroupId, string> = {
  markets,
  butchers,
  bakery,
  food,
  pharmacies,
  books,
  services,
  other,
};

export function sectorHeroImage(id: string | null | undefined): string {
  if (!id) return other;
  return SECTOR_HERO_IMAGES[id as BusinessGroupId] ?? other;
}

/** Mapeia slugs/nomes de categoria para o setor correspondente. */
export function categoryHeroImage(slug: string | null | undefined): string {
  const key = (slug || "").toLowerCase();
  if (/mercad|supermerc|mercearia|varej/.test(key)) return markets;
  if (/açougue|acougue|carn|frigor/.test(key)) return butchers;
  if (/padar|confeit|panific/.test(key)) return bakery;
  if (/lanch|restaur|pizzar|sanduí|sandui|burg|food/.test(key)) return food;
  if (/farmac|farmác|drogar|saude|saúde/.test(key)) return pharmacies;
  if (/livr|papelar|cultur/.test(key)) return books;
  if (/servic|serviç|oficin|manuten|assist/.test(key)) return services;
  return other;
}
