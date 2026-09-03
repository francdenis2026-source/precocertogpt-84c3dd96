import { ArrowRight, BadgeCheck, RefreshCw, Search, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { LiveProductSearch } from "./LiveProductSearch";
import heroImg from "../../assets/home-2026/hero-illustration-precocerto.svg";

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
  productCount,
  storeCount,
  loading = false,
}: HeroUserImage2026Props) {
  const shownProductCount = productCount ?? products.length;
  const shownStoreCount = storeCount ?? new Set(
    products.map((product) => product.establishment).filter(Boolean),
  ).size;
  const proofItems = products.filter((product) => product.minPrice > 0).slice(0, 3);

  return (
    <section className="pcx-hero" aria-labelledby="pcx-hero-title">
      <div className="pcx-hero__bg" aria-hidden="true">
        <img src={heroImg} alt="" fetchPriority="high" decoding="async" />
        <div className="pcx-hero__scrim" />
      </div>
      <div className="pcx-hero__inner">
        <div>
          <p className="pcx-hero__eyebrow">
            <BadgeCheck aria-hidden="true" /> Comparador oficial de Feijó, Acre
          </p>
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

          <nav className="pcx-hero__tags" aria-label="Buscas rápidas">
            <span>Buscas populares:</span>
            <Link to="/buscar?q=arroz">Arroz</Link>
            <Link to="/buscar?q=carne">Carne</Link>
            <Link to="/buscar?q=leite">Leite</Link>
            <Link to="/buscar?q=medicamento">Medicamentos</Link>
          </nav>

          <div className="pcx-hero__stats" aria-label="Informações do catálogo">
            <div>
              <strong>{shownProductCount || "—"}</strong>
              <span>produtos monitorados</span>
            </div>
            <div>
              <strong>{shownStoreCount || "—"}</strong>
              <span>estabelecimentos</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>grátis para usar</span>
            </div>
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

        <aside className="pcx-hero__panel" aria-label="Exemplos reais de comparação de preços">
          <div className="pcx-hero__panel-head">
            <span>Comparações reais</span>
            <span className="pcx-hero__panel-live">
              <i aria-hidden="true" /> Ao vivo
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
            <RefreshCw aria-hidden="true" /> Atualizado com dados reais da cidade
          </div>
        </aside>
      </div>
    </section>
  );
}
