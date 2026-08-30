import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import "./HeroUserImage2026.css";

const HERO_IMAGE = "/hero-preco-certo-comparacao-2026.webp";

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-labelledby="pc26-campaign-title">
      <h1 id="pc26-campaign-title" className="pc26-user-hero__sr-only">Compare preços e economize com o Preço Certo</h1>
      <div className="pc26-user-hero__frame">
        <img
          className="pc26-user-hero__artwork"
          src={HERO_IMAGE}
          alt="Mulher em supermercado usando o Preço Certo para comparar preços e economizar"
          width="1280"
          height="854"
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="pc26-user-hero__utility">
        <p>Pesquise produtos, compare lojas de Feijó e encontre o menor preço antes de comprar.</p>
        <Link to="/buscar" className="pc26-user-hero__primary"><Search aria-hidden="true" /> Buscar produtos</Link>
      </div>
    </section>
  );
}
