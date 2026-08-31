import "./HeroUserImage2026.css";

const HERO_IMAGE = "/hero-preco-certo-nova-2026.webp";

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
        </div>
      </div>
    </section>
  );
}
