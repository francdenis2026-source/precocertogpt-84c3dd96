import { ArrowRight, PackageSearch, Tags } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { ProductCard } from "./ProductCard";
export function ProductGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  return <section className="pc26-zone pc26-zone--products pc26-reference-offers" aria-labelledby="offers-title">
    <div className="pc26-products pc26-shell">
      <div className="pc26-section-heading pc26-products__heading">
        <div className="pc26-reference-section-title"><Tags aria-hidden="true" /><span><h2 id="offers-title">Preços em destaque</h2><p>Produtos com preços disponíveis agora nos comércios de Feijó.</p></span></div>
        <Link to="/buscar">Ver todos os produtos <ArrowRight aria-hidden="true" /></Link>
      </div>
      <div className="pc26-grid" aria-busy={loading} aria-live="polite">
        {loading && !products.length ? Array.from({ length: 5 }, (_, index) => <div className="pc26-skeleton" key={index} aria-hidden="true" />) : products.length ? products.map(product => <ProductCard key={product.id} product={product} />) : <div className="pc26-empty"><PackageSearch aria-hidden="true" /><strong>Os preços estão sendo atualizados.</strong><p>Você ainda pode pesquisar todo o catálogo.</p><Link className="pc26-button" to="/buscar">Pesquisar produtos</Link></div>}
      </div>
    </div>
  </section>;
}
