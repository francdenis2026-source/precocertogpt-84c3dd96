import type { BusinessGroupId } from "./businessTaxonomy";
import { sectorHeroImage } from "./sectorHeroImages";

/**
 * Foto do card de estabelecimento em destaque na home, trocando junto com o
 * negócio que a rotação exibe.
 *
 * Os banners de "banco de fotos" (mercantil, açougue, padaria, lanchonete,
 * livraria, farmácia, serviços) são cartazes prontos, com texto/sinalização
 * espalhado pela imagem inteira — não só num canto que dê pra recortar fora.
 * Esse card sobrepõe o nome do estabelecimento em cima da foto (como todo
 * card com foto+overlay do site), então usar um cartaz já cheio de texto ali
 * sobrescrevia/competia com o nome. Fica só com fotografia limpa (sem texto
 * embutido); os cartazes completos aparecem inteiros, sem overlay nosso, na
 * vitrine "Setores em destaque" de /explorar.
 */
export function sectorLeadPhoto(id: BusinessGroupId): string {
  return sectorHeroImage(id);
}
