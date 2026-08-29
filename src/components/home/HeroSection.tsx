import { BadgePercent, ShieldCheck, Store, Tag } from "lucide-react";
import type { Product } from "../../data/catalog";
import { LiveProductSearch } from "./LiveProductSearch";

const heroBenefits = [
  { icon: ShieldCheck, title: "Preços locais", text: "para comparar melhor" },
  { icon: BadgePercent, title: "Menor preço", text: "em poucos segundos" },
  { icon: Store, title: "Lojas de Feijó", text: "em um só lugar" },
  { icon: Tag, title: "Compra inteligente", text: "antes de sair de casa" },
];

export function HeroSection({ products, loading, productCount: _productCount, storeCount: _storeCount, priceCount: _priceCount }: { products: Product[]; loading: boolean; productCount: number; storeCount: number; priceCount: number }) {
  return <section className="pc26-hero pc26-model-hero pc26-reference-hero" aria-labelledby="pc26-hero-title">
    <div className="pc26-shell pc26-model-hero__inner">
      <div className="pc26-model-hero__copy">
        <h1 id="pc26-hero-title">Compare preços <em>antes de comprar.</em></h1>
        <p>Pesquise um produto, compare os valores nos comércios de Feijó e escolha onde vale mais a pena comprar.</p>
        <div className="pc26-hero__search-wrap"><LiveProductSearch id="price-search" products={products} loading={loading} /></div>
        <div className="pc26-reference-hero__benefits">
          {heroBenefits.map(({ icon: Icon, title, text }) => <div key={title}><Icon aria-hidden="true" /><span><strong>{title}</strong><small>{text}</small></span></div>)}
        </div>
      </div>
      <div className="pc26-model-hero__media">
        <picture><img src="/hero-supermercado-mulher-comparando-2026.webp" alt="Mulher usando o celular para comparar preços em um supermercado" width="1536" height="1024" fetchPriority="high" decoding="async" /></picture>
      </div>
    </div>
  </section>;
}
