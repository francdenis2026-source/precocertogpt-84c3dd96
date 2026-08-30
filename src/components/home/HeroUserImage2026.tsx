import { MapPin, Search, Store } from "lucide-react";
import { Link } from "react-router-dom";
import "./HeroUserImage2026.css";

const HERO_IMAGE = "/hero-preco-certo-oficial.png?v=20260830";

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-labelledby="pc26-campaign-title">
      <h1 id="pc26-campaign-title" className="pc26-user-hero__sr-only">Compare preços e economize com o Preço Certo</h1>

      <div className="pc26-user-hero__meta" aria-hidden="true">
        <span className="pc26-user-hero__eyebrow"><i /> Comparação local</span>
        <span className="pc26-user-hero__location"><MapPin /> Feijó, Acre</span>
      </div>

      <div className="pc26-user-hero__frame">
        <img
          className="pc26-user-hero__artwork"
          src={HERO_IMAGE}
          alt="Mulher em supermercado usando o Preço Certo para comparar preços e economizar"
          width="1535"
          height="1024"
          fetchPriority="high"
          decoding="async"
        />
        <span className="pc26-user-hero__tone" aria-hidden="true" />
        <Link className="pc26-user-hero__hotspot pc26-user-hero__hotspot--search" to="/buscar">
          <span className="pc26-user-hero__sr-only">Buscar produtos</span>
        </Link>
        <Link className="pc26-user-hero__hotspot pc26-user-hero__hotspot--stores" to="/estabelecimentos">
          <span className="pc26-user-hero__sr-only">Ver estabelecimentos</span>
        </Link>
      </div>

      <div className="pc26-user-hero__dock" aria-label="Ações principais">
        <p><strong>Compare antes de comprar.</strong><span>Preços e lojas locais em uma experiência rápida e direta.</span></p>
        <div className="pc26-user-hero__actions">
          <Link to="/buscar" className="pc26-user-hero__action pc26-user-hero__action--primary"><Search aria-hidden="true" /> Buscar produtos</Link>
          <Link to="/estabelecimentos" className="pc26-user-hero__action pc26-user-hero__action--secondary"><Store aria-hidden="true" /> Ver lojas</Link>
        </div>
      </div>
    </section>
  );
}
