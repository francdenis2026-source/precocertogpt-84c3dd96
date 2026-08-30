import { Link } from "react-router-dom";
import "./HeroUserImage2026.css";

const HERO_IMAGE = "/hero-preco-certo-oficial.png?v=20260830";

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-labelledby="pc26-campaign-title">
      <h1 id="pc26-campaign-title" className="pc26-user-hero__sr-only">Compare preços e economize com o Preço Certo</h1>
      <div className="pc26-user-hero__frame">
        <img
          className="pc26-user-hero__artwork"
          src={HERO_IMAGE}
          alt="Mulher em supermercado usando o Preço Certo para comparar preços e economizar"
          width="1535"
          height="1024"
          fetchPriority="high"
          decoding="sync"
        />
        <Link className="pc26-user-hero__hotspot pc26-user-hero__hotspot--search" to="/buscar">
          <span className="pc26-user-hero__sr-only">Buscar produtos</span>
        </Link>
        <Link className="pc26-user-hero__hotspot pc26-user-hero__hotspot--stores" to="/estabelecimentos">
          <span className="pc26-user-hero__sr-only">Ver estabelecimentos</span>
        </Link>
      </div>
    </section>
  );
}
