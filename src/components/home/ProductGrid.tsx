import { ArrowRight, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { ProductCard } from "./ProductCard";
export function ProductGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  return <section className="pc26-zone pc26-zone--products" aria-labelledby="offers-title">
    <div className="pc26-products pc26-shell">
      <div className="pc26-section-heading pc26-products__heading">
        <div>
          <span className="pc26-section-kicker">Compare agora</span>
          <h2 id="offers-title">Preços que merecem atenção</h2>
          <p>Os menores valores encontrados agora, organizados para comparar sem perder tempo.</p>
        </div>
        <Link to="/buscar">Ver todos <ArrowRight aria-hidden="true" /></Link>
      </div>
      <div className="pc26-grid" aria-busy={loading} aria-live="polite">
        {loading && !products.length ? Array.from({ length: 4 }, (_, index) => <div className="pc26-skeleton" key={index} aria-hidden="true" />) : products.length ? products.map(product => <ProductCard key={product.id} product={product} />) : <div className="pc26-empty"><PackageSearch aria-hidden="true" /><strong>As ofertas estão sendo atualizadas.</strong><p>Enquanto isso, você pode pesquisar todo o catálogo.</p><Link className="pc26-button" to="/buscar">Pesquisar produtos</Link></div>}
      </div>
    </div>
  </section>;
}
