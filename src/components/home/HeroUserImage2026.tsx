import "./HeroUserImage2026.css";

const HERO_IMAGE = "/hero-preco-certo-enviada-2026.webp";

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-label="Apresentação do Preço Certo">
      <div className="pc26-user-hero__frame">
        <img
          src={HERO_IMAGE}
          alt="Preço Certo: compare preços e economize sempre em mercados de Feijó"
          width="600"
          height="400"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </section>
  );
}
