import { ArrowRight, PackageSearch, Tags } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { ProductCard } from "./ProductCard";
export function ProductGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  return <section className="pc26-zone pc26-zone--products pc26-reference-offers" aria-labelledby="offers-title">
    <div className="pc26-products pc26-shell">
      <div className="pc26-section-heading pc26-products__heading">
        <div className="pc26-reference-section-title"><Tags aria-hidden="true" /><span><h2 id="offers-title">Destaques de preço</h2><p>Quatro produtos para comparar rapidamente agora.</p></span></div>
        <Link to="/buscar">Ver catálogo <ArrowRight aria-hidden="true" /></Link>
      </div>
      <div className="pc26-grid pc26-grid--featured-four" aria-busy={loading} aria-live="polite">
        {loading && !products.length ? Array.from({ length: 4 }, (_, index) => <div className="pc26-skeleton" key={index} aria-hidden="true" />) : products.length ? products.map(product => <ProductCard key={product.id} product={product} />) : <div className="pc26-empty"><PackageSearch aria-hidden="true" /><strong>Os preços estão sendo atualizados.</strong><p>Pesquise o catálogo completo enquanto isso.</p><Link className="pc26-button" to="/buscar">Pesquisar produtos</Link></div>}
      </div>
    </div>
  </section>;
}
