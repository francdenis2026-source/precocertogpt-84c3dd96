import type { BusinessGroupId } from "./businessTaxonomy";

import markets from "../assets/sectors-2026/sector-markets.webp";
import butchers from "../assets/sectors-2026/sector-butchers.jpg";
import bakery from "../assets/sectors-2026/sector-bakery.jpg";
import food from "../assets/sectors-2026/sector-food.jpg";
import pharmacies from "../assets/sectors-2026/sector-pharmacies.jpg";
import books from "../assets/sectors-2026/sector-books.jpg";
import services from "../assets/sectors-2026/sector-services.jpg";
import other from "../assets/sectors-2026/sector-other.webp";

/**
 * Foto de hero por tipo de estabelecimento. Cada nicho tem a sua, então quando
 * a vitrine troca de estabelecimento a imagem acompanha o ramo, em vez de
 * mostrar sempre a mesma prateleira de mercado.
 *
 * `markets` e `other` passaram a usar fotografia real do comércio de rua do
 * interior. As anteriores eram geradas por IA e se entregavam: dominante verde
 * -azulada brigando com o dourado da marca, corredores vazios de galpão e
 * letreiros com texto ilegível. `markets` é a que mais aparece, porque a maior
 * parte dos cadastros de Feijó é mercado, então era ela que as pessoas viam.
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
