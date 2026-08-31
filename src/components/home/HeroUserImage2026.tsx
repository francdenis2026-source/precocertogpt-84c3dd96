import { Search, ShieldCheck, Tags } from "lucide-react";
import "./HeroUserImage2026.css";

const HERO_IMAGE = "/hero-preco-certo-nova-2026.webp";

const HERO_BENEFITS = [
  {
    icon: Tags,
    title: "Preços atualizados",
    description: "em tempo real",
  },
  {
    icon: ShieldCheck,
    title: "Ofertas reais",
    description: "de comércios locais",
  },
  {
    icon: Search,
    title: "Busca rápida",
    description: "e resultados precisos",
  },
] as const;

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-labelledby="pc26-campaign-title">
      <div className="pc26-user-hero__stage">
        <img
          className="pc26-user-hero__artwork"
          src={HERO_IMAGE}
          alt="Compare preços e economize sempre com o Preço Certo em Feijó-AC"
          width="1280"
          height="429"
          fetchPriority="high"
          decoding="async"
        />

        <div className="pc26-user-hero__mobile-content">
          <h1 id="pc26-campaign-title">Compare preços <em>e economize</em> sempre!</h1>
          <p>Encontre os menores preços nos principais mercados de <strong>Feijó-AC</strong> e aproveite as melhores ofertas.</p>

          <div className="pc26-user-hero__benefits" aria-label="Vantagens do Preço Certo">
            {HERO_BENEFITS.map(({ icon: Icon, title, description }) => (
              <div className="pc26-user-hero__benefit" key={title}>
                <span className="pc26-user-hero__benefit-icon" aria-hidden="true"><Icon /></span>
                <span className="pc26-user-hero__benefit-copy">
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
