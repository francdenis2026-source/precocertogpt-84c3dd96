import { Link } from "react-router-dom";
import heroAsset from "../../assets/hero-preco-certo-oficial.png.asset.json";
import "./HeroUserImage2026.css";

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-labelledby="pc26-campaign-title">
      <h1 id="pc26-campaign-title" className="pc26-user-hero__sr-only">Compare preços e economize com o Preço Certo</h1>
      <div className="pc26-user-hero__frame">
        <img
          className="pc26-user-hero__artwork"
          src={heroAsset.url}
          alt="Mulher em supermercado usando o Preço Certo para comparar preços e economizar"
          width="1152"
          height="768"
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
