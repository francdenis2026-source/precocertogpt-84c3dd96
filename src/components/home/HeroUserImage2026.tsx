import "./HeroUserImage2026.css";

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-label="Apresentação do Preço Certo">
      <div className="pc26-user-hero__frame">
        <img
          src="/hero-home-2026.webp"
          alt="Preço Certo: compare preços e economize sempre em mercados de Feijó"
          width="480"
          height="320"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </section>
  );
}
