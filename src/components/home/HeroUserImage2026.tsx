import type React from "react";
import { useMemo } from "react";
import { ArrowRight, PackageSearch, Search, ShoppingBasket, Store, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product, ProductOffer } from "../../data/catalog";
import { resolveProductImage } from "../../data/productImageResolver";
import { LocationSwitcher } from "../LocationSwitcher";
import { LiveProductSearch } from "./LiveProductSearch";
import { PriceBadge } from "../catalog/PriceBadge";

// Foto full-bleed do herói (identidade 2026-09). Fornecida pelo dono do
// produto como a foto definitiva do herói — sem nenhuma UI/dado desenhado
// em cima (diferente dos mockups de banco de fotos/precocerto_pacote_visual/,
// que são só referência de ESTILO e nunca viram asset final). Cliente com
// carrinho de hortifruti à direita, rio/ponte ao fundo à esquerda — onde o
// véu verde-floresta fica opaco, sob o texto.
import heroPhoto from "../../assets/home-2026/hero-cliente-carrinho-rio-2026.jpg";
import heroMobilePhoto from "../../assets/home-2026/hero-mobile-market-2026.webp";

const intBr = new Intl.NumberFormat("pt-BR");
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Sugestões de busca — apenas atalhos de digitação, não uma alegação de
 *  que o produto existe no catálogo (a busca em si já mostra o que há). */
const SEARCH_SUGGESTIONS = ["Arroz", "Café", "Leite", "Açúcar"];

type HeroUserImage2026Props = {
  products: Product[];
  productCount?: number;
  storeCount?: number;
  loading?: boolean;
  cycle?: number;
};

/** Escolhe, entre os produtos já carregados, o primeiro que tem preço em
 *  2+ estabelecimentos DIFERENTES — para montar o card de comparação real
 *  sobreposto à foto do herói. Não inventa loja nem economia: se nenhum
 *  produto do catálogo carregado atende, o painel simplesmente não aparece. */
function pickRealComparison(products: Product[]): { product: Product; cheap: ProductOffer; other: ProductOffer } | null {
  for (const product of products) {
    const offers = product.offers;
    if (!offers || offers.length < 2) continue;
    const sorted = [...offers].sort((a, b) => a.value - b.value);
    const cheap = sorted[0];
    const other = sorted.find((offer) => offer.establishmentId !== cheap.establishmentId);
    if (cheap && other && cheap.value > 0 && other.value > cheap.value) {
      return { product, cheap, other };
    }
  }
  return null;
}

export function HeroUserImage2026({
  products,
  productCount,
  storeCount,
  loading = false,
}: HeroUserImage2026Props) {
  const comparison = useMemo(() => pickRealComparison(products), [products]);
  const comparisonImage = comparison ? resolveProductImage(comparison.product) : null;
  const saving = comparison ? comparison.other.value - comparison.cheap.value : 0;

  return (
    <section
      className="pcx-hero"
      aria-labelledby="pcx-hero-title"
      // O CSS do hero usa esta variavel como background-image da secao.
      // Sem defini-la, a declaracao inteira era invalida: nem a foto nem o
      // veu de contraste eram pintados.
      style={{
        "--pcx-hero-photo": `url(${heroPhoto})`,
        "--pcx-hero-mobile-photo": `url(${heroMobilePhoto})`,
      } as React.CSSProperties}
    >
      {/* As fotos são de ambientação: o título, a busca e as ações já
          descrevem a função desta seção. Mantemos a imagem como background
          para o navegador baixar apenas a variante do breakpoint ativo. */}
      <div className="pcx-hero__inner">
        <div className="pcx-hero__copy">
          <LocationSwitcher />
          <h1 id="pcx-hero-title">
            Compare preços. <strong>Economize de verdade.</strong>
          </h1>
          <p className="pcx-hero__lead">
            Veja onde cada produto está mais barato antes de sair de casa.
          </p>

          <div className="pcx-hero__search">
            <LiveProductSearch
              id="price-search"
              products={products}
              loading={loading}
              placeholder="O que você procura?"
            />
            <div className="pcx-hero__suggestions" aria-label="Buscas comuns">
              <span>Populares:</span>
              {SEARCH_SUGGESTIONS.map((term) => (
                <Link key={term} to={`/buscar?q=${encodeURIComponent(term)}`}>
                  {term}
                </Link>
              ))}
            </div>
          </div>

          <div className="pcx-hero__actions" aria-label="Ações principais">
            <Link className="pcx-btn pcx-btn--primary" to="/buscar">
              <Search aria-hidden="true" /> Comparar preços <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="pcx-btn pcx-btn--ghost" to="/estabelecimentos">
              <Store aria-hidden="true" /> Explorar lojas
            </Link>
          </div>

          {(Boolean(productCount) || Boolean(storeCount)) && (
            <div className="pcx-hero__stats" aria-label="Números da plataforma">
              {Boolean(storeCount) && (
                <span className="pcx-hero__stat">
                  <Store aria-hidden="true" />
                  <strong>{intBr.format(storeCount!)}</strong> estabelecimentos cadastrados
                </span>
              )}
              {Boolean(productCount) && (
                <span className="pcx-hero__stat">
                  <PackageSearch aria-hidden="true" />
                  <strong>{intBr.format(productCount!)}</strong> produtos no catálogo
                </span>
              )}
            </div>
          )}

          {/* Faixa compacta só para o app: reforça a proposta de valor sem
              depender de nenhum dado — texto fixo, ilustrativo. */}
          <div className="pcx-hero__mobile-banner">
            <ShoppingBasket aria-hidden="true" />
            <div>
              <strong>Economize até encontrar o menor preço.</strong>
              <span>Compare em segundos e escolha onde comprar.</span>
            </div>
          </div>
        </div>

        <div className="pcx-hero__visual">
          {comparison && (
            <div className="pcx-hero__panel">
              <div className="pcx-hero__panel-head">
                <span>
                  COMPARAÇÃO REAL
                  <br />
                  <b className="pcx-hero__panel-title">{comparison.product.name}</b>
                </span>
                <span className="pcx-hero__panel-live">
                  <i aria-hidden="true" /> AO VIVO
                </span>
              </div>
              <ul>
                <li>
                  <span className="pcx-hero__panel-thumb">
                    {comparisonImage ? (
                      <img src={comparisonImage} alt="" width="44" height="44" loading="lazy" />
                    ) : (
                      <PackageSearch aria-hidden="true" />
                    )}
                  </span>
                  <span className="pcx-hero__panel-info">
                    <span className="pcx-hero__panel-name">
                      {comparison.cheap.establishment}
                      <PriceBadge />
                    </span>
                    <span className="pcx-hero__panel-store">
                      <Store aria-hidden="true" /> {comparison.cheap.neighborhood || "Feijó"}
                    </span>
                  </span>
                  <span className="pcx-hero__panel-price">{brl.format(comparison.cheap.value)}</span>
                </li>
                <li>
                  <span className="pcx-hero__panel-thumb pcx-hero__panel-thumb--muted">
                    <Store aria-hidden="true" />
                  </span>
                  <span className="pcx-hero__panel-info">
                    <span className="pcx-hero__panel-name">{comparison.other.establishment}</span>
                    <span className="pcx-hero__panel-store">
                      <Store aria-hidden="true" /> {comparison.other.neighborhood || "Feijó"}
                    </span>
                  </span>
                  <span className="pcx-hero__panel-price pcx-hero__panel-price--muted">
                    {brl.format(comparison.other.value)}
                  </span>
                </li>
              </ul>
              <div className="pcx-hero__panel-foot">
                <TrendingDown aria-hidden="true" /> Economize {brl.format(saving)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
