import type { BusinessGroupId } from "./businessTaxonomy";
import { sectorHeroImage } from "./sectorHeroImages";

import butchersImg from "../assets/sectors-2026/sector-photo-butchers.webp";
import foodImg from "../assets/sectors-2026/sector-photo-food.webp";
import booksImg from "../assets/sectors-2026/sector-photo-books.webp";
import bakeryImg from "../assets/sectors-2026/sector-photo-bakery.webp";
import marketsImg from "../assets/sectors-2026/sector-photo-markets.webp";
import pharmaciesImg from "../assets/sectors-2026/sector-pharmacies-v2.jpg";
import servicesImg from "../assets/home-2026/comerciante-feijo-app.webp";

/**
 * Foto do card de estabelecimento em destaque na home, trocando junto com o
 * negócio que a rotação exibe. Diferente dos banners de "Setores em
 * destaque" (/explorar), essas são fotografia crua, sem nenhum texto
 * embutido — porque este card sobrepõe o nome do estabelecimento em cima da
 * foto, e um banner com texto próprio brigava com esse nome.
 */
const DEDICATED_PHOTOS: Partial<Record<BusinessGroupId, string>> = {
  markets: marketsImg,
  butchers: butchersImg,
  bakery: bakeryImg,
  food: foodImg,
  books: booksImg,
  pharmacies: pharmaciesImg,
  services: servicesImg,
};

export function sectorLeadPhoto(id: BusinessGroupId): string {
  return DEDICATED_PHOTOS[id] ?? sectorHeroImage(id);
}
