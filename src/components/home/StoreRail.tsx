import { ArrowRight, ArrowUpRight, MapPin, PackageCheck, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import type { StoreRow } from "../../data/catalog";

export function StoreRail({ stores }: { stores: StoreRow[] }) {
  const featured = [...stores]
    .filter(store => store.name && store.slug)
    .sort((a, b) => (b.products || 0) - (a.products || 0))
    .slice(0, 4);
  if (!featured.length) return null;

  const [lead, ...directory] = featured;
  const initials = (name: string) => name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();

  return <section className="pc26-zone pc26-zone--stores pc26-reference-stores" aria-labelledby="stores-title">
    <div className="pc26-stores pc26-shell">
      <div className="pc26-stores-showcase__heading">
        <div><h2 id="stores-title">Comércios para comparar</h2><p>Encontre catálogos ativos por bairro e veja os preços disponíveis.</p></div>
        <Link to="/estabelecimentos">Todos os estabelecimentos <ArrowRight aria-hidden="true" /></Link>
      </div>

      <div className="pc26-store-showcase">
        <Link className="pc26-store-featured" to={`/estabelecimento/${lead.slug}`} style={{ "--store-accent": lead.color } as CSSProperties}>
          <div className="pc26-store-featured__top">
            <i aria-hidden="true">{initials(lead.name)}</i>
            <span><PackageCheck aria-hidden="true" /> Maior catálogo desta seleção</span>
          </div>
          <div className="pc26-store-featured__copy">
            <h3>{lead.name}</h3>
            <p><MapPin aria-hidden="true" /> {lead.neighborhood || "Feijó"}, Feijó</p>
          </div>
          <div className="pc26-store-featured__footer">
            <span><strong>{lead.products || 0}</strong><small>itens listados</small></span>
            <b>Abrir catálogo <ArrowUpRight aria-hidden="true" /></b>
          </div>
        </Link>

        <div className="pc26-store-directory">
          {directory.map(store => <Link className="pc26-store-row" key={store.id} to={`/estabelecimento/${store.slug}`} style={{ "--store-accent": store.color } as CSSProperties}>
            <i aria-hidden="true">{initials(store.name)}</i>
            <span><strong>{store.name}</strong><small><MapPin aria-hidden="true" /> {store.neighborhood || "Feijó"}</small></span>
            <em><b>{store.products || 0}</b> itens</em>
            <ArrowUpRight className="pc26-store-row__arrow" aria-hidden="true" />
          </Link>)}
          <Link className="pc26-store-directory__all" to="/estabelecimentos"><Store aria-hidden="true" /> Ver diretório completo <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </div>
  </section>;
}
