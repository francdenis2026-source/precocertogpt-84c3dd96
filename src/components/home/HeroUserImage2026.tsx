import { ArrowRight, MapPin, Search, Store } from "lucide-react";
import { Link } from "react-router-dom";
import "./HeroUserImage2026.css";

const HERO_IMAGE = "/hero-supermercado-mulher-comparando-2026.webp";

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-labelledby="pc26-campaign-title">
      <div className="pc26-user-hero__stage">
        <div className="pc26-user-hero__copy">
          <h1 id="pc26-campaign-title">
            Compare preços. <strong>Compre melhor em Feijó.</strong>
          </h1>
          <p>Descubra onde cada produto custa menos antes de sair de casa.</p>

          <div className="pc26-user-hero__actions" aria-label="Ações principais">
            <Link className="pc26-user-hero__primary" to="/buscar">
              <Search aria-hidden="true" />
              Comparar preços
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="pc26-user-hero__secondary" to="/estabelecimentos">
              <Store aria-hidden="true" />
              Ver lojas
            </Link>
          </div>

          <span className="pc26-user-hero__location">
            <MapPin aria-hidden="true" /> Ofertas e mercados de Feijó-AC
          </span>
        </div>

        <div className="pc26-user-hero__media">
          <img
            className="pc26-user-hero__artwork"
            src={HERO_IMAGE}
            alt="Mulher comparando um produto e preços pelo celular em um supermercado"
            width={1536}
            height={1024}
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
