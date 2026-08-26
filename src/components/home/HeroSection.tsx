import { BadgeCheck, MapPin, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { LiveProductSearch } from "./LiveProductSearch";

export function HeroSection({ products, loading, productCount, storeCount, priceCount }: { products: Product[]; loading: boolean; productCount: number; storeCount: number; priceCount: number }) {
  return <section className="pc26-hero"><div className="pc26-shell pc26-hero__grid">
    <div className="pc26-hero__content">
      <span className="pc26-eyebrow"><BadgeCheck aria-hidden="true" />Preços locais, decisão mais segura</span>
      <h1>Antes de comprar, descubra <em>onde custa menos.</em></h1>
      <p>Compare preços do comércio de Feijó em poucos segundos e encontre a melhor opção antes de sair de casa.</p>
      <div className="pc26-hero__search-wrap">
        <span className="pc26-hero__search-label">Pesquise produtos e compare preços em tempo real</span>
        <LiveProductSearch id="price-search" products={products} loading={loading} />
      </div>
      <div className="pc26-hero__stats" aria-label="Cobertura do Preço Certo"><span><strong>{productCount || "—"}</strong><small>produtos</small></span><span><strong>{priceCount || "—"}</strong><small>preços registrados</small></span><span><strong>{storeCount || "—"}</strong><small>estabelecimentos</small></span></div>
    </div>
    <aside className="pc26-proof" aria-label="Como economizar com o Preço Certo"><div className="pc26-proof__head"><span><MapPin aria-hidden="true" />Feijó, Acre</span><strong>Roteiro de economia</strong></div><ol><li><span>01</span><div><strong>Pesquise o produto</strong><small>Encontre ofertas locais disponíveis.</small></div></li><li><span>02</span><div><strong>Compare os valores</strong><small>Veja a menor opção com clareza.</small></div></li><li><span>03</span><div><strong>Planeje sua compra</strong><small>Monte uma lista antes de sair.</small></div></li></ol><Link to="/cesta-inteligente"><ShoppingBasket aria-hidden="true" />Criar minha lista</Link></aside>
  </div></section>;
}
