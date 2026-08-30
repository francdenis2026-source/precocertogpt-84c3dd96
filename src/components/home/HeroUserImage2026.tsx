import "./HeroUserImage2026.css";
import { HERO_PART_1 } from "./hero-inline/heroPart1";
import { HERO_PART_2 } from "./hero-inline/heroPart2";
import { HERO_PART_3 } from "./hero-inline/heroPart3";
import { HERO_PART_4 } from "./hero-inline/heroPart4";

const HERO_IMAGE = `data:image/webp;base64,${HERO_PART_1}${HERO_PART_2}${HERO_PART_3}${HERO_PART_4}`;

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-label="Apresentação do Preço Certo">
      <div className="pc26-user-hero__frame">
        <img
          src={HERO_IMAGE}
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
