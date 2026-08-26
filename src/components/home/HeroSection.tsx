import { BadgeCheck } from "lucide-react";
import type { Product } from "../../data/catalog";
import { LiveProductSearch } from "./LiveProductSearch";

export function HeroSection({ products, loading, productCount, storeCount, priceCount }: { products: Product[]; loading: boolean; productCount: number; storeCount: number; priceCount: number }) {
  const popular = ["Arroz", "Café", "Leite", "Pão", "Açúcar", "Feijão"];
  const search = (value:string) => {
    const input=document.getElementById("price-search") as HTMLInputElement|null;
    if(!input)return;
    input.focus();
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value")?.set;
    setter?.call(input,value);
    input.dispatchEvent(new Event("input",{bubbles:true}));
  };
  return <section className="pc26-hero pc26-model-hero">
    <div className="pc26-model-hero__image" aria-hidden="true" />
    <div className="pc26-shell pc26-model-hero__inner">
      <div className="pc26-model-hero__copy">
        <span className="pc26-eyebrow"><BadgeCheck aria-hidden="true" />Feijó, Acre</span>
        <h1>Descubra onde está <em>mais barato!</em></h1>
        <p>Compare preços de produtos em mercados e estabelecimentos locais e economize todos os dias.</p>
        <div className="pc26-hero__search-wrap"><LiveProductSearch id="price-search" products={products} loading={loading} /></div>
        <div className="pc26-popular-searches"><span>Buscas populares:</span>{popular.map(item=><button type="button" key={item} onClick={()=>search(item)}>{item}</button>)}</div>
        <div className="pc26-hero__stats" aria-label="Cobertura do Preço Certo"><span><strong>{productCount || "—"}</strong><small>produtos</small></span><span><strong>{priceCount || "—"}</strong><small>preços</small></span><span><strong>{storeCount || "—"}</strong><small>lojas</small></span></div>
      </div>
    </div>
  </section>;
}
