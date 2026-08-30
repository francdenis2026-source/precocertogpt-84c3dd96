import { BadgeCheck, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";
import "./HeroUserImage2026.css";

const HERO_IMAGE = "/hero-supermercado-comparando-precos-2026.webp";

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-labelledby="pc26-campaign-title">
      <div className="pc26-user-hero__stage">
        <img
          className="pc26-user-hero__artwork"
          src={HERO_IMAGE}
          alt="Mulher em supermercado comparando preços antes de comprar"
          width="1536"
          height="1024"
          fetchPriority="high"
          decoding="async"
        />
        <span className="pc26-user-hero__wash" aria-hidden="true" />

        <div className="pc26-user-hero__content">
          <span className="pc26-user-hero__trust"><BadgeCheck aria-hidden="true" /> O menor preço perto de você</span>
          <h1 id="pc26-campaign-title">Compare preços <em>e economize</em> sempre!</h1>
          <p>Encontre os menores preços nos principais mercados de <strong>Feijó-AC</strong> e aproveite as melhores ofertas.</p>
          <div className="pc26-user-hero__actions" aria-label="Ações principais">
            <Link to="/buscar" className="pc26-user-hero__action pc26-user-hero__action--primary"><Search aria-hidden="true" /> Buscar produtos</Link>
            <Link to="/estabelecimentos" className="pc26-user-hero__action pc26-user-hero__action--secondary"><MapPin aria-hidden="true" /> Ver lojas</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
