import "./HeroUserImage2026.css";
import heroSupermercado from "../../assets/hero-supermercado-mulher-comparando-2026.webp";

const HERO_WIDTH = 1536;
const HERO_HEIGHT = 1024;

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-label="Apresentação do Preço Certo">
      <div className="pc26-user-hero__frame">
        <img
          src={heroSupermercado}
          alt="Mulher usando o celular para comparar preços em um supermercado"
          width={HERO_WIDTH}
          height={HERO_HEIGHT}
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </section>
  );
}
