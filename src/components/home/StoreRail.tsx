import { ArrowRight, MapPin, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import type { StoreRow } from "../../data/catalog";

export function StoreRail({ stores }: { stores: StoreRow[] }) {
  const featured = stores.filter(store => store.name && store.slug).slice(0, 4);
  if (!featured.length) return null;

  return <section className="pc26-zone pc26-zone--stores pc26-reference-stores" aria-labelledby="stores-title">
    <div className="pc26-stores pc26-shell">
      <div className="pc26-section-heading">
        <div className="pc26-reference-section-title"><Store aria-hidden="true" /><span><h2 id="stores-title">Comércios de Feijó</h2><p>Escolha uma loja para ver produtos e preços disponíveis.</p></span></div>
        <Link to="/estabelecimentos">Ver todos os estabelecimentos <ArrowRight aria-hidden="true" /></Link>
      </div>
      <div className="pc26-store-grid">
        {featured.map(store => <Link className="pc26-store" key={store.id} to={`/estabelecimento/${store.slug}`} style={{ "--store-accent": store.color } as CSSProperties}>
          <i><Store aria-hidden="true" /></i>
          <span><strong>{store.name}</strong><small><MapPin aria-hidden="true" />{store.neighborhood || "Feijó"}</small></span>
          <em>{store.products || 0} itens</em>
        </Link>)}
      </div>
    </div>
  </section>;
}
