import { useMemo } from "react";
import { ArrowRight, PackageSearch, Store, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product, ProductOffer } from "../../data/catalog";
import { resolveProductImage } from "../../data/productImageResolver";
import { LocationSwitcher } from "../LocationSwitcher";
import { LiveProductSearch } from "./LiveProductSearch";
import { PriceBadge } from "../catalog/PriceBadge";
import { freshnessText, priceFreshness } from "../../lib/pricing";

// Imagens responsivas existentes; decoração separada do conteúdo e da busca.
import heroPhotoWeb from "../../assets/home-2026/hero-profissional-precocerto-2026.jpg";
import heroPhotoMobile from "../../assets/home-2026/hero-profissional-precocerto-2026-mobile.jpg";

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
 *  junto à foto do herói. Não inventa loja nem economia: se nenhum
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
  // "AO VIVO" não dizia quando o preço foi conferido — o mesmo problema que
  // o selo "Atualizado" do card de produto já resolve com priceFreshness().
  // Reaproveita a mesma lógica aqui em vez de deixar uma alegação de
  // atualização sem nenhum dado por trás.
  const freshness = comparison ? priceFreshness(comparison.product.capturedAt, comparison.product.category) : null;
  const comparisonFreshnessText = freshness ? freshnessText(freshness) : null;

  return (
    <section
      className="pcx-intro"
      aria-labelledby="pcx-intro-title"
    >
      <div className="pcx-intro__inner">
        <div className="pcx-intro__copy">
          <LocationSwitcher />
          <p className="pcx-intro__eyebrow">Sua compra começa com uma boa escolha</p>
          <h1 id="pcx-intro-title">
            Compare preços. <strong>Economize de verdade.</strong>
          </h1>
          <p className="pcx-intro__lead">
            Veja onde cada produto está mais barato antes de sair de casa.
          </p>

          <div className="pcx-intro__search">
            <LiveProductSearch
              id="price-search"
              products={products}
              loading={loading}
              placeholder="O que você procura?"
            />
            <div className="pcx-intro__suggestions" aria-label="Buscas comuns">
              <span>Populares:</span>
              {SEARCH_SUGGESTIONS.map((term) => (
                <Link key={term} to={`/buscar?q=${encodeURIComponent(term)}`}>
                  {term}
                </Link>
              ))}
            </div>
          </div>

          <div className="pcx-intro__actions" aria-label="Ações principais">
            <Link className="pcx-intro__store-link" to="/estabelecimentos">
              <Store aria-hidden="true" /> Explorar lojas <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          {/* Enquanto carrega, o catálogo mostrado é o fallback manual (poucas
              lojas cadastradas à mão) — mostrar essa contagem pequena por um
              instante e depois trocar pelo número real (dezenas de vezes
              maior) criava um flash visível de estatística errada. Espera o
              carregamento terminar em vez de mostrar um número que não é o
              real. */}
          {!loading && (Boolean(productCount) || Boolean(storeCount)) && (
            <div className="pcx-intro__stats" aria-label="Números da plataforma">
              {Boolean(storeCount) && (
                <span className="pcx-intro__stat">
                  <Store aria-hidden="true" />
                  <strong>{intBr.format(storeCount!)}</strong> estabelecimentos cadastrados
                </span>
              )}
              {Boolean(productCount) && (
                <span className="pcx-intro__stat">
                  <PackageSearch aria-hidden="true" />
                  <strong>{intBr.format(productCount!)}</strong> produtos no catálogo
                </span>
              )}
            </div>
          )}

        </div>

        <div className="pcx-intro__visual">
          <picture className="pcx-intro__photo">
            <source media="(max-width: 760px)" srcSet={heroPhotoMobile} />
            <img src={heroPhotoWeb} alt="" width="960" height="720" fetchPriority="high" decoding="async" />
          </picture>
          {comparison && (
            <div className="pcx-intro__panel">
              <div className="pcx-intro__panel-head">
                <span>
                  COMPARAÇÃO REAL
                  <br />
                  <b className="pcx-intro__panel-title">{comparison.product.name}</b>
                </span>
                <span className="pcx-intro__panel-live">
                  <i aria-hidden="true" /> {comparisonFreshnessText}
                </span>
              </div>
              <ul>
                <li>
                  <span className="pcx-intro__panel-thumb">
                    {comparisonImage ? (
                      <img src={comparisonImage} alt="" width="44" height="44" loading="lazy" />
                    ) : (
                      <PackageSearch aria-hidden="true" />
                    )}
                  </span>
                  <span className="pcx-intro__panel-info">
                    <span className="pcx-intro__panel-name">
                      {comparison.cheap.establishment}
                      <PriceBadge />
                    </span>
                    <span className="pcx-intro__panel-store">
                      <Store aria-hidden="true" /> {comparison.cheap.neighborhood || "Feijó"}
                    </span>
                  </span>
                  <span className="pcx-intro__panel-price">{brl.format(comparison.cheap.value)}</span>
                </li>
                <li>
                  <span className="pcx-intro__panel-thumb pcx-intro__panel-thumb--muted">
                    <Store aria-hidden="true" />
                  </span>
                  <span className="pcx-intro__panel-info">
                    <span className="pcx-intro__panel-name">{comparison.other.establishment}</span>
                    <span className="pcx-intro__panel-store">
                      <Store aria-hidden="true" /> {comparison.other.neighborhood || "Feijó"}
                    </span>
                  </span>
                  <span className="pcx-intro__panel-price pcx-intro__panel-price--muted">
                    {brl.format(comparison.other.value)}
                  </span>
                </li>
              </ul>
              <div className="pcx-intro__panel-foot">
                <TrendingDown aria-hidden="true" /> Economize {brl.format(saving)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
