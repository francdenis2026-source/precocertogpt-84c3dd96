import "./HeroUserImage2026.css";
import hero01 from "./hero-fiel/heroFiel01.ts?raw";
import hero02 from "./hero-fiel/heroFiel02.ts?raw";
import hero03 from "./hero-fiel/heroFiel03.ts?raw";
import hero04 from "./hero-fiel/heroFiel04.ts?raw";
import hero05 from "./hero-fiel/heroFiel05.ts?raw";
import hero06 from "./hero-fiel/heroFiel06.ts?raw";
import hero07 from "./hero-fiel/heroFiel07.ts?raw";
import hero08 from "./hero-fiel/heroFiel08.ts?raw";
import hero09 from "./hero-fiel/heroFiel09.ts?raw";
import hero10 from "./hero-fiel/heroFiel10.ts?raw";
import hero11 from "./hero-fiel/heroFiel11.ts?raw";
import hero12 from "./hero-fiel/heroFiel12.ts?raw";
import hero13 from "./hero-fiel/heroFiel13.ts?raw";
import hero14 from "./hero-fiel/heroFiel14.ts?raw";
import hero15 from "./hero-fiel/heroFiel15.ts?raw";
import hero16 from "./hero-fiel/heroFiel16.ts?raw";
import hero17 from "./hero-fiel/heroFiel17.ts?raw";

const heroParts = [
  hero01, hero02, hero03, hero04, hero05, hero06, hero07, hero08, hero09,
  hero10, hero11, hero12, hero13, hero14, hero15, hero16, hero17,
];

function extractBase64(raw: string) {
  return Array.from(raw.matchAll(/["']([A-Za-z0-9+/=]{20,})["']/g), match => match[1]).join("");
}

const HERO_IMAGE = `data:image/webp;base64,${heroParts.map(extractBase64).join("")}`;

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-label="Apresentação do Preço Certo">
      <div className="pc26-user-hero__frame">
        <img
          src={HERO_IMAGE}
          alt="Preço Certo: compare preços e economize sempre em mercados de Feijó"
          width="1024"
          height="683"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </section>
  );
}
