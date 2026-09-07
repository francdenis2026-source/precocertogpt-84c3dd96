import type { BusinessGroupId } from "./businessTaxonomy";
import { sectorHeroImage } from "./sectorHeroImages";

import bakeryImg from "../assets/sectors-2026/sector-banner-bakery.webp";
import butchersImg from "../assets/sectors-2026/sector-banner-butchers.webp";
import foodImg from "../assets/sectors-2026/sector-banner-food.webp";
import booksImg from "../assets/sectors-2026/sector-banner-books.webp";
import marketsImg from "../assets/sectors-2026/sector-banner-markets.webp";

/**
 * Foto do card de estabelecimento em destaque na home, trocando junto com
 * o negócio que a rotação exibe. Prioriza os banners próprios (com marca já
 * desenhada) para os setores que têm um; o resto cai nas fotos genéricas de
 * setorHeroImages.ts (farmácia, serviços, "outros").
 */
const DEDICATED_PHOTOS: Partial<Record<BusinessGroupId, string>> = {
  markets: marketsImg,
  butchers: butchersImg,
  bakery: bakeryImg,
  food: foodImg,
  books: booksImg,
};

export function sectorLeadPhoto(id: BusinessGroupId): string {
  return DEDICATED_PHOTOS[id] ?? sectorHeroImage(id);
}
