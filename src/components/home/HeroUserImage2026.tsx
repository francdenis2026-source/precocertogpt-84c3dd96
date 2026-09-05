import { ArrowRight, PackageSearch, RefreshCw, Search, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { LiveProductSearch } from "./LiveProductSearch";
import { ProductThumb } from "../catalog/ProductThumb";

import heroImg from "../../assets/home-2026/hero-supermercado-precocerto-2026.jpg";
import heroImgMobile from "../../assets/home-2026/hero-supermercado-precocerto-2026-mobile.jpg";
import heroBackdrop from "../../assets/home-2026/hero-backdrop-precocerto-2026.jpg";


const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const intBr = new Intl.NumberFormat("pt-BR");

type HeroUserImage2026Props = {
  products: Product[];
  productCount?: number;
  storeCount?: number;
  loading?: boolean;
  cycle?: number;
};

export function HeroUserImage2026({
  products,
  productCount,
  storeCount,
  loading = false,
  cycle = 0,
}: HeroUserImage2026Props) {
  const priced = products
    .filter((product) => product.minPrice > 0)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  // Roda a dupla exibida a cada ciclo (60 min, ver featuredRotation.ts) em vez
  // de fixar sempre os dois primeiros produtos do catálogo.
  const proofItems = priced.length
    ? Array.from({ length: Math.min(2, priced.length) }, (_, i) =>
        priced[(cycle * 2 + i) % priced.length],
      )
    : [];

  return (
    <section className="pcx-hero" aria-labelledby="pcx-hero-title">
      <div className="pcx-hero__inner">
        <div className="pcx-hero__copy">
          <h1 id="pcx-hero-title">
            Compare preços e <strong>compre melhor</strong> na sua cidade.
          </h1>
          <p className="pcx-hero__lead">
            Pesquise um produto e veja, em segundos, o menor preço e onde
            comprar, sem sair de casa.
          </p>

          <div className="pcx-hero__search">
            <LiveProductSearch id="price-search" products={products} loading={loading} />
          </div>

          <div className="pcx-hero__actions" aria-label="Ações principais">
            <Link className="pcx-btn pcx-btn--primary" to="/buscar">
              <Search aria-hidden="true" /> Comparar preços <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="pcx-btn pcx-btn--ghost" to="/estabelecimentos">
              <Store aria-hidden="true" /> Ver estabelecimentos
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
        </div>

        <div className="pcx-hero__visual">
          <picture>
            <source media="(max-width: 640px)" srcSet={heroImgMobile} />
            <img
              className="pcx-hero__image"
              src={heroImg}
              alt="Cliente comparando preços pelo celular em um supermercado"
              width="1280"
              height="720"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <aside className="pcx-hero__panel" aria-label="Exemplos reais de comparação de preços">
            <div className="pcx-hero__panel-head">
              <span>Preços no catálogo</span>
              <span className="pcx-hero__panel-live">
                <i aria-hidden="true" /> Atualizados
              </span>
            </div>
            {proofItems.length ? (
              <ul>
                {proofItems.map((product) => (
                  <li key={product.id}>
                    <ProductThumb product={product} size="sm" className="pcx-hero__panel-thumb" />
                    <div className="pcx-hero__panel-info">
                      <span className="pcx-hero__panel-name" title={product.name}>
                        {product.name}
                      </span>
                      <span className="pcx-hero__panel-store" title={product.establishment}>
                        <Store aria-hidden="true" /> {product.establishment || "Comércio local"}
                      </span>
                    </div>
                    <strong className="pcx-hero__panel-price">
                      {brl.format(product.minPrice)}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : (
              <ul>
                <li className="pcx-hero__panel-empty">
                  <div className="pcx-hero__panel-info">
                    <span className="pcx-hero__panel-name">Catálogo carregando…</span>
                    <span className="pcx-hero__panel-store">
                      <Store aria-hidden="true" /> Feijó, Acre
                    </span>
                  </div>
                </li>
              </ul>
            )}

            <div className="pcx-hero__panel-foot">
              <RefreshCw aria-hidden="true" /> Dados reais de Feijó
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
