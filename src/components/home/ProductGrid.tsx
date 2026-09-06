import { ArrowRight, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  return (
    <section className="pcx-section" aria-labelledby="offers-title">
      <div className="pcx-shell">
        <div className="pcx-section__head">
          <div>
            <h2 id="offers-title">Comparações em destaque</h2>
            <p>Preço, loja e economia reunidos para você decidir mais rápido.</p>
          </div>
          <Link className="pcx-section__link" to="/buscar">
            Explorar catálogo <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="pcx-products" aria-busy={loading} aria-live="polite">
          {loading
            ? Array.from({ length: 6 }, (_, index) => <div className="pcx-skeleton" key={index} aria-hidden="true" />)
            : products.length
              ? products.map((product, index) => <ProductCard featured={index === 0} key={product.id} product={product} />)
              : <div className="pcx-empty"><PackageSearch aria-hidden="true" /><strong>Os preços estão sendo atualizados.</strong><p>Pesquise o catálogo completo enquanto isso.</p><Link className="pcx-btn pcx-btn--primary" to="/buscar">Pesquisar produtos</Link></div>}
        </div>
      </div>
    </section>
  );
}
