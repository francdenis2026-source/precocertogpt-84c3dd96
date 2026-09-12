import { ArrowRight, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { LocationSwitcher } from "../LocationSwitcher";
import { LiveProductSearch } from "./LiveProductSearch";
import { CampaignBackdrop } from "../CampaignBackdrop";

const intBr = new Intl.NumberFormat("pt-BR");
const SEARCH_SUGGESTIONS = ["Arroz", "Café", "Leite", "Açúcar"];
type HeroUserImage2026Props = {
  products: Product[]; productCount?: number; storeCount?: number; loading?: boolean; cycle?: number;
};
export function HeroUserImage2026({ products, productCount, storeCount, loading = false }: HeroUserImage2026Props) {
  return <section className="pcx-intro pc-campaign pc-campaign--home" aria-labelledby="pcx-intro-title">
    <CampaignBackdrop scene="home-shopping" />
    <div className="pcx-intro__inner">
      <div className="pcx-intro__copy">
        <LocationSwitcher />
        <p className="pcx-intro__eyebrow">MAIS CLAREZA EM CADA COMPRA</p>
        <h1 id="pcx-intro-title">Sua próxima compra.<strong>Uma escolha melhor.</strong></h1>
        <p className="pcx-intro__lead">Compare preços do comércio de Feijó e descubra onde vale a pena comprar, antes de sair de casa.</p>
        <div className="pcx-intro__search">
          <LiveProductSearch id="price-search" products={products} loading={loading} placeholder="Qual produto você procura?" />
          <div className="pcx-intro__suggestions" aria-label="Buscas comuns">
            <span>Buscas rápidas:</span>
            {SEARCH_SUGGESTIONS.map(term => <Link key={term} to={`/buscar?q=${encodeURIComponent(term)}`}>{term}</Link>)}
          </div>
        </div>
        <div className="pcx-intro__actions">
          <Link className="pcx-intro__store-link" to="/estabelecimentos"><Store aria-hidden="true" /> Explorar lojas <ArrowRight aria-hidden="true" /></Link>
        </div>
        {!loading && (Boolean(productCount) || Boolean(storeCount)) && <div className="pcx-intro__stats" aria-label="Números da plataforma">
          {Boolean(storeCount) && <span className="pcx-intro__stat"><strong>{intBr.format(storeCount!)}</strong> estabelecimentos</span>}
          {Boolean(productCount) && <span className="pcx-intro__stat"><strong>{intBr.format(productCount!)}</strong> produtos no catálogo</span>}
        </div>}
      </div>
    </div>
  </section>;
}
