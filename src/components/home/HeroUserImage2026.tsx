import { ArrowRight, RefreshCw, Search, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { LiveProductSearch } from "./LiveProductSearch";
import heroImg from "../../assets/home-2026/hero-mulher-app-precocerto.jpg";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type HeroUserImage2026Props = {
  products: Product[];
  productCount?: number;
  storeCount?: number;
  loading?: boolean;
};

export function HeroUserImage2026({
  products,
  loading = false,
}: HeroUserImage2026Props) {
  const proofItems = products.filter((product) => product.minPrice > 0).slice(0, 2);

  return (
    <section className="pcx-hero" aria-labelledby="pcx-hero-title">
      <div className="pcx-hero__inner">
        <div className="pcx-hero__copy">
          <h1 id="pcx-hero-title">
            Compare preços e <strong>compre melhor</strong> na sua cidade.
          </h1>
          <p className="pcx-hero__lead">
            Pesquise um produto e veja, em segundos, o menor preço e onde
            comprar — sem sair de casa.
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
        </div>

        <div className="pcx-hero__visual">
          <img
            className="pcx-hero__image"
            src={heroImg}
            alt="Cliente comparando preços pelo celular em um supermercado"
            width="1280"
            height="720"
            fetchPriority="high"
            decoding="async"
          />
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
                    <span className="pcx-hero__panel-name">{product.name}</span>
                    <span className="pcx-hero__panel-store">
                      <Store aria-hidden="true" /> {product.establishment || "Comércio local"}
                    </span>
                    <strong className="pcx-hero__panel-price">
                      {brl.format(product.minPrice)}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : (
              <ul>
                <li>
                  <span className="pcx-hero__panel-name">Catálogo carregando…</span>
                  <span className="pcx-hero__panel-store">
                    <Store aria-hidden="true" /> Feijó, Acre
                  </span>
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
