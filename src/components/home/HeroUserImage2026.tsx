import type React from "react";
import { ArrowRight, PackageSearch, Search, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { LiveProductSearch } from "./LiveProductSearch";

import heroImg from "../../assets/home-2026/hero-cliente-comparando-precos-2026.webp";
import heroBackdrop from "../../assets/home-2026/hero-backdrop-precocerto-2026.jpg";

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
}: HeroUserImage2026Props) {
  return (
    <section
      className="pcx-hero"
      aria-labelledby="pcx-hero-title"
      // O CSS do hero usa esta variavel no ::after. Sem defini-la, a
      // declaracao background-image inteira era invalida: nem textura nem
      // veu de contraste eram pintados.
      style={{ "--pcx-hero-backdrop": `url(${heroBackdrop})` } as React.CSSProperties}
    >
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
          <img
            className="pcx-hero__image"
            src={heroImg}
            alt="Cliente comparando preços pelo celular em um supermercado"
            width="1400"
            height="933"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
