import { ArrowRight, ArrowUpRight, MapPin, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import type { StoreRow } from "../../data/catalog";
import { groupForStore } from "../../data/businessTaxonomy";
import { sectorHeroImage } from "../../data/sectorHeroImages";

export function StoreRail({
  stores,
  cycle,
  loading = false,
}: {
  stores: StoreRow[];
  cycle: number;
  loading?: boolean;
}) {
  const eligible = [...stores]
    .filter((store) => store.name && store.slug && (store.products || 0) > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  if (loading) {
    return (
      <section className="pcx-section" aria-labelledby="stores-title" aria-busy="true">
        <div className="pcx-shell">
          <div className="pcx-section__head">
            <div>
              <h2 id="stores-title">Comércios para comparar</h2>
              <p>
                Encontre catálogos ativos por bairro e veja os preços disponíveis.
              </p>
            </div>
          </div>
          <div className="pcx-stores">
            <div className="pcx-skeleton pcx-store-hero" aria-hidden="true" />
            <div className="pcx-store-list">
              {Array.from({ length: 3 }, (_, index) => (
                <div className="pcx-skeleton pcx-store-row" key={index} aria-hidden="true" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!eligible.length) return null;

  const leadIndex =
    ((cycle % eligible.length) + eligible.length) % eligible.length;
  const rotated = [
    ...eligible.slice(leadIndex),
    ...eligible.slice(0, leadIndex),
  ];
  const [lead, ...directory] = rotated.slice(0, 4);
  const initials = (name: string) =>
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  const leadGroup = groupForStore(lead);
  const kindLabel = leadGroup.shortLabel;
  const leadImg = sectorHeroImage(leadGroup.id);

  return (
    <section className="pcx-section" aria-labelledby="stores-title">
      <div className="pcx-shell">
        <div className="pcx-section__head">
          <div>
            <h2 id="stores-title">Comércios para comparar</h2>
            <p>
              Encontre catálogos ativos por bairro e veja os preços disponíveis.
            </p>
          </div>
          <Link className="pcx-section__link" to="/estabelecimentos">
            Todos os estabelecimentos <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="pcx-stores">
          <Link
            key={`${lead.id}-${cycle}`}
            className="pcx-store-hero"
            to={`/estabelecimento/${lead.slug}`}
            aria-label={`Abrir catálogo de ${lead.name}`}
          >
            <img
              key={leadImg}
              src={leadImg}
              alt=""
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
            />
            <div className="pcx-store-hero__content">
              <h3>{lead.name}</h3>
              <p>
                <MapPin aria-hidden="true" /> {kindLabel} ·{" "}
                {lead.neighborhood ? `${lead.neighborhood}, Feijó, Acre` : "Feijó, Acre"}
              </p>
              <span>
                Catálogo local para comparar preços antes de sair de casa.
              </span>
              <div className="pcx-store-hero__footer">
                <span>
                  <strong>{lead.products || 0}</strong>
                  <small>produtos no catálogo</small>
                </span>
                <b>
                  Ver catálogo <ArrowUpRight aria-hidden="true" />
                </b>
              </div>
            </div>
          </Link>

          <div className="pcx-store-list">
            {directory.map((store) => (
              <Link
                className="pcx-store-row"
                key={store.id}
                to={`/estabelecimento/${store.slug}`}
                style={{ "--store-accent": store.color } as CSSProperties}
              >
                <i aria-hidden="true">{initials(store.name)}</i>
                <span>
                  <strong>{store.name}</strong>
                  <small>
                    <MapPin aria-hidden="true" />{" "}
                    {store.neighborhood || "Feijó"}
                  </small>
                </span>
                <em>
                  <b>{store.products || 0}</b> itens
                </em>
                <ArrowUpRight
                  className="pcx-store-row__arrow"
                  aria-hidden="true"
                />
              </Link>
            ))}
            <Link className="pcx-store-list__all" to="/estabelecimentos">
              <Store aria-hidden="true" /> Ver diretório completo{" "}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
