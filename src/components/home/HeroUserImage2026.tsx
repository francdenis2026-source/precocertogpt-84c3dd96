import "./HeroUserImage2026.css";
import heroExactPart1 from "./hero-exact/heroExactPart1";
import heroExactPart2 from "./hero-exact/heroExactPart2";

const HERO_SRC = `data:image/webp;base64,${heroExactPart1}${heroExactPart2}`;
const HERO_WIDTH = 1535;
const HERO_HEIGHT = 1024;

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-label="Apresentação do Preço Certo">
      <div className="pc26-user-hero__frame">
        <img
          src={HERO_SRC}
          alt="Preço Certo: compare preços e economize sempre em mercados de Feijó"
          width={HERO_WIDTH}
          height={HERO_HEIGHT}
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </section>
  );
}
