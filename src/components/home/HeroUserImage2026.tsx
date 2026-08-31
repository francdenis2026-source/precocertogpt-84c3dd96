import { RefreshCw, Search, Store } from "lucide-react";
import "./HeroUserImage2026.css";

const HERO_IMAGE = "/hero-supermercado-comparando-precos-2026.webp";

const PANEL_ITEMS = [
  { icon: RefreshCw, label: "Preços atualizados em tempo real" },
  { icon: Store, label: "Ofertas reais de comércios locais" },
  { icon: Search, label: "Busca rápida e resultados precisos" },
] as const;

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
          <h1 id="pc26-campaign-title">
            Compare preços <em>e economize</em> sempre!
          </h1>
          <p>
            Encontre os menores preços nos principais mercados de <strong>Feijó-AC</strong> e
            aproveite as melhores ofertas.
          </p>

          <div
            className="pc26-user-hero__panel"
            role="list"
            aria-label="Diferenciais do PreçoCerto"
          >
            {PANEL_ITEMS.map(({ icon: Icon, label }) => (
              <div className="pc26-user-hero__panel-item" key={label} role="listitem">
                <span className="pc26-user-hero__panel-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="pc26-user-hero__panel-text">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
