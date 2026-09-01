import { ArrowRight, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { ProductCard } from "./ProductCard";
import "./ProductGridPremium2026.css";

export function ProductGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  return (
    <section className="pc26-zone pc26-zone--products pc26-reference-offers" aria-labelledby="offers-title">
      <div className="pc26-products pc26-shell">
        <div className="pc26-products-premium__heading">
          <div>
            <h2 id="offers-title">Comparações em destaque</h2>
            <p>Preço, loja e economia reunidos para você decidir mais rápido.</p>
          </div>
          <div className="pc26-products-premium__heading-actions">
            <span>{products.length} produtos selecionados</span>
            <Link to="/buscar">Explorar catálogo <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>

        <div className="pc26-grid pc26-grid--featured-four pc26-products-premium__rail" aria-busy={loading} aria-live="polite">
          {loading && !products.length
            ? Array.from({ length: 4 }, (_, index) => <div className="pc26-skeleton" key={index} aria-hidden="true" />)
            : products.length
              ? products.map((product, index) => <ProductCard featured={index === 0} key={product.id} product={product} />)
              : <div className="pc26-empty"><PackageSearch aria-hidden="true" /><strong>Os preços estão sendo atualizados.</strong><p>Pesquise o catálogo completo enquanto isso.</p><Link className="pc26-button" to="/buscar">Pesquisar produtos</Link></div>}
        </div>
      </div>
    </section>
  );
}
