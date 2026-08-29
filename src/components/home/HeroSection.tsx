import { BadgePercent, MapPin, ShieldCheck, Store, Tag } from "lucide-react";
import type { Product } from "../../data/catalog";
import { LiveProductSearch } from "./LiveProductSearch";

const heroBenefits = [
  { icon: ShieldCheck, title: "Preços reais", text: "e atualizados" },
  { icon: BadgePercent, title: "Ofertas", text: "imperdíveis" },
  { icon: Store, title: "Comércios", text: "da cidade" },
  { icon: Tag, title: "Compra mais segura", text: "e inteligente" },
];

export function HeroSection({ products, loading, productCount, storeCount, priceCount }: { products: Product[]; loading: boolean; productCount: number; storeCount: number; priceCount: number }) {
  return <section className="pc26-hero pc26-model-hero pc26-reference-hero" aria-labelledby="pc26-hero-title">
    <div className="pc26-shell pc26-model-hero__inner">
      <div className="pc26-model-hero__copy">
        <h1 id="pc26-hero-title">Compare preços <em>antes de comprar.</em></h1>
        <p>Encontre o menor preço nos estabelecimentos de Feijó e escolha onde comprar com mais segurança.</p>
        <div className="pc26-hero__search-wrap"><LiveProductSearch id="price-search" products={products} loading={loading} /></div>
        <div className="pc26-reference-hero__benefits">
          {heroBenefits.map(({ icon: Icon, title, text }) => <div key={title}><Icon aria-hidden="true" /><span><strong>{title}</strong><small>{text}</small></span></div>)}
        </div>
      </div>
      <div className="pc26-model-hero__media">
        <picture><img src="/hero-supermercado-mulher-comparando-2026.webp" alt="Mulher usando o celular para comparar preços em um supermercado" width="1536" height="1024" fetchPriority="high" decoding="async" /></picture>
        <div className="pc26-hero__media-note"><ShieldCheck aria-hidden="true" /><span><strong>+ Economia</strong><small>+ Segurança · + Feijó</small></span></div>
      </div>
    </div>
    <div className="pc26-shell pc26-hero__proof">
      <div className="pc26-hero__trust"><span><MapPin aria-hidden="true" /> Feijó, Acre</span><span><ShieldCheck aria-hidden="true" /> Informação local para comparar melhor</span></div>
      <div className="pc26-hero__stats" aria-label="Cobertura do Preço Certo"><span><strong>{productCount || "-"}</strong><small>produtos</small></span><span><strong>{priceCount || "-"}</strong><small>preços</small></span><span><strong>{storeCount || "-"}</strong><small>lojas</small></span></div>
    </div>
  </section>;
}
