import { MapPin, Search, Store } from "lucide-react";
import { Link } from "react-router-dom";
import "./HeroUserImage2026.css";

const HERO_IMAGE = "/hero-preco-certo-oficial.png?v=20260830";

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-labelledby="pc26-campaign-title">
      <div className="pc26-user-hero__shell">
        <div className="pc26-user-hero__copy">
          <div className="pc26-user-hero__location"><MapPin aria-hidden="true" /> Feijó, Acre</div>
          <h1 id="pc26-campaign-title">Compare preços.<br /><em>Compre melhor.</em></h1>
          <p>Pesquise produtos e compare lojas antes de comprar. O Preço Certo deixa a decisão mais rápida, clara e local.</p>
          <div className="pc26-user-hero__actions" aria-label="Ações principais">
            <Link to="/buscar" className="pc26-user-hero__action pc26-user-hero__action--primary"><Search aria-hidden="true" /> Buscar produtos</Link>
            <Link to="/estabelecimentos" className="pc26-user-hero__action pc26-user-hero__action--secondary"><Store aria-hidden="true" /> Ver lojas</Link>
          </div>
          <div className="pc26-user-hero__note"><strong>Menores preços perto de você.</strong><span>Informação local para comparar com mais segurança.</span></div>
        </div>

        <div className="pc26-user-hero__media" aria-hidden="true">
          <img
            className="pc26-user-hero__artwork"
            src={HERO_IMAGE}
            alt=""
            width="1535"
            height="1024"
            fetchPriority="high"
            decoding="async"
          />
          <span className="pc26-user-hero__tone" />
        </div>
      </div>
    </section>
  );
}
