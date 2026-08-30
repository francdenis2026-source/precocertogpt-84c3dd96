import "./HeroUserImage2026.css";

/**
 * Hero da homepage.
 *
 * NOTA DE ASSET: `public/hero-preco-certo-hq-2026.webp` está corrompido no
 * repositório (bytes sem cabeçalho RIFF/WEBP — não decodifica em nenhum
 * navegador), por isso o hero aparecia vazio/deformado. Enquanto o arquivo HQ
 * original não for reenviado, usamos a última fonte fiel válida já presente no
 * repositório (1536x1024), exibida com proporção intrínseca preservada.
 */
const HERO_SRC = "/hero-supermercado-mulher-comparando-2026.webp";
const HERO_WIDTH = 1536;
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
