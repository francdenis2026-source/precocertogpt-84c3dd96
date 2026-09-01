import type { BusinessGroupId } from "./businessTaxonomy";

import markets from "../assets/sectors-2026/sector-markets.jpg";
import butchers from "../assets/sectors-2026/sector-butchers.jpg";
import bakery from "../assets/sectors-2026/sector-bakery.jpg";
import food from "../assets/sectors-2026/sector-food.jpg";
import pharmacies from "../assets/sectors-2026/sector-pharmacies.jpg";
import books from "../assets/sectors-2026/sector-books.jpg";
import services from "../assets/sectors-2026/sector-services.jpg";
import other from "../assets/sectors-2026/sector-other.jpg";

/**
 * Arte de hero por tipo de estabelecimento. Cada setor recebe uma fotografia
 * própria, evitando repetição de imagem entre as seções do site.
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
