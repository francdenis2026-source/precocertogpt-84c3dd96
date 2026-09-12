import { Link } from "react-router-dom";
import type { BusinessGroupId } from "../data/businessTaxonomy";
import bakeryImg from "../assets/sectors-2026/sector-photo-bakery.webp";
import butchersImg from "../assets/sectors-2026/sector-photo-butchers.webp";
import foodImg from "../assets/sectors-2026/sector-photo-food.webp";
import booksImg from "../assets/sectors-2026/sector-photo-books.webp";
import marketsImg from "../assets/sectors-2026/sector-photo-markets.webp";
import pharmaciesImg from "../assets/sectors-2026/sector-photo-pharmacies.webp";
import servicesImg from "../assets/sectors-2026/sector-banner-services.webp";

/**
 * Banners próprios por setor (fornecidos prontos, com marca e texto já
 * desenhados na própria imagem) — por isso nenhum título/texto é sobreposto
 * aqui: a imagem já se explica sozinha, ao contrário do resto do site, que
 * sempre usa foto crua + overlay próprio. Só entram os setores com banner
 * disponível; o restante continua só nos cartões de ícone acima.
 */
const SECTOR_BANNERS: Partial<Record<BusinessGroupId, { image: string; alt: string; href: string }>> = {
  markets: { image: marketsImg, alt: "Mercantil — variedade e praticidade para o dia a dia", href: "/mercados" },
  butchers: { image: butchersImg, alt: "Açougue — carnes de qualidade para a sua mesa", href: "/acougues" },
  bakery: { image: bakeryImg, alt: "Padaria — pães fresquinhos todos os dias", href: "/padarias" },
  food: { image: foodImg, alt: "Lanchonete — sabor que combina com o seu dia", href: "/lanchonetes" },
  books: { image: booksImg, alt: "Livraria — mais que livros, novas histórias", href: "/livros" },
  pharmacies: { image: pharmaciesImg, alt: "Farmácia — saúde e bem-estar sempre com você", href: "/farmacias" },
  services: { image: servicesImg, alt: "Serviços — tudo o que você precisa em um só lugar", href: "/servicos" },
};

export function SectorPhotoBanners() {
  const entries = Object.entries(SECTOR_BANNERS) as [BusinessGroupId, { image: string; alt: string; href: string }][];
  return (
    <section className="sector-hub__banners" aria-labelledby="sector-banners-title">
      <h2 id="sector-banners-title" className="sr-only">Setores em destaque</h2>
      <div className="sector-hub__banners-row">
        {entries.map(([id, { image, alt, href }]) => (
          <Link key={id} to={href} className="sector-hub__banner">
            <img src={image} alt={alt} loading="lazy" decoding="async" width="1200" height="600" />
          <span className="sector-hub__banner-label">{alt.split(" — ")[0]}</span></Link>
        ))}
      </div>
      <p className="sector-hub__banners-hint" aria-hidden="true">Deslize para ver mais <span>→</span></p>
    </section>
  );
}
