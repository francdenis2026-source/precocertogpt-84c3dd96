import { MapPin, ShieldCheck } from "lucide-react";
import type { Product } from "../../data/catalog";
import { LiveProductSearch } from "./LiveProductSearch";

export function HeroSection({ products, loading, productCount, storeCount, priceCount }: { products: Product[]; loading: boolean; productCount: number; storeCount: number; priceCount: number }) {
  const popular = ["Arroz", "Café", "Leite", "Pão", "Açúcar", "Feijão"];
  const search = (value: string) => {
    const input = document.getElementById("price-search") as HTMLInputElement | null;
    if (!input) return;
    input.focus();
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return <section className="pc26-hero pc26-model-hero" aria-labelledby="pc26-hero-title">
    <div className="pc26-shell pc26-model-hero__inner">
      <div className="pc26-model-hero__copy">
        <h1 id="pc26-hero-title">Compare preços <em>antes de comprar.</em></h1>
        <p>Encontre o menor preço nos estabelecimentos de Feijó e escolha onde comprar com mais segurança.</p>
        <div className="pc26-hero__search-wrap"><LiveProductSearch id="price-search" products={products} loading={loading} /></div>
        <div className="pc26-popular-searches"><span>Mais buscados</span>{popular.map(item => <button type="button" key={item} onClick={() => search(item)}>{item}</button>)}</div>
      </div>
      <div className="pc26-model-hero__media">
        <picture>
          <img src="/hero-supermercado-mulher-comparando-2026.webp" alt="Mulher usando o celular para comparar preços em um supermercado" width="1536" height="1024" fetchPriority="high" decoding="async" />
        </picture>
        <div className="pc26-hero__media-note"><ShieldCheck aria-hidden="true" /><span><strong>Compare com clareza</strong><small>Preço e estabelecimento lado a lado.</small></span></div>
      </div>
    </div>
    <div className="pc26-shell pc26-hero__proof">
      <div className="pc26-hero__trust"><span><MapPin aria-hidden="true" /> Feijó, Acre</span><span><ShieldCheck aria-hidden="true" /> Informação local para comparar melhor</span></div>
      <div className="pc26-hero__stats" aria-label="Cobertura do Preço Certo"><span><strong>{productCount || "-"}</strong><small>produtos</small></span><span><strong>{priceCount || "-"}</strong><small>preços</small></span><span><strong>{storeCount || "-"}</strong><small>lojas</small></span></div>
    </div>
  </section>;
}
