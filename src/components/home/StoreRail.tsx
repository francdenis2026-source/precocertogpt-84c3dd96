import { ArrowRight, ArrowUpRight, MapPin, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import type { StoreRow } from "../../data/catalog";
import "./StoreRail.css";

export function StoreRail({
  stores,
  cycle,
}: {
  stores: StoreRow[];
  cycle: number;
}) {
  const eligible = [...stores]
    .filter((store) => store.name && store.slug && (store.products || 0) > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
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
  const kindLabel =
    lead.kind === "pharmacy"
      ? "Farmácia"
      : lead.kind === "bakery"
        ? "Padaria"
        : "Comércio local";

  return (
    <section
      className="pc26-zone pc26-zone--stores pc26-reference-stores"
      aria-labelledby="stores-title"
    >
      <div className="pc26-stores pc26-shell">
        <div className="pc26-stores-showcase__heading">
          <div>
            <h2 id="stores-title">Comércios para comparar</h2>
            <p>
              Encontre catálogos ativos por bairro e veja os preços disponíveis.
            </p>
          </div>
          <Link to="/estabelecimentos">
            Todos os estabelecimentos <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="pc26-store-showcase">
          <Link
            key={`${lead.id}-${cycle}`}
            className="pc26-store-featured pc26-store-hero"
            to={`/estabelecimento/${lead.slug}`}
            style={{ "--store-accent": lead.color } as CSSProperties}
            aria-label={`Abrir catálogo de ${lead.name}`}
          >
            <div className="pc26-store-hero__content">
              <div className="pc26-store-featured__copy">
                <h3>{lead.name}</h3>
                <p>
                  <MapPin aria-hidden="true" /> {kindLabel} ·{" "}
                  {lead.neighborhood || "Feijó"}, Feijó — Acre
                </p>
                <span>
                  Catálogo local para comparar preços antes de sair de casa.
                </span>
              </div>
              <div className="pc26-store-featured__footer">
                <span>
                  <strong>{lead.products || 0}</strong>
                  <small>produtos no catálogo</small>
                </span>
                <b>
                  Ver catálogo <ArrowUpRight aria-hidden="true" />
                </b>
              </div>
            </div>
            <div className="pc26-store-hero__visual" aria-hidden="true">
              {/* Vite serves this optimized responsive hero directly from public/. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/home-editorial-2026/estabelecimento-comparador-hero-v2.webp"
                alt=""
                width="1600"
                height="1067"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Link>

          <div className="pc26-store-directory">
            {directory.map((store) => (
              <Link
                className="pc26-store-row"
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
                  className="pc26-store-row__arrow"
                  aria-hidden="true"
                />
              </Link>
            ))}
            <Link className="pc26-store-directory__all" to="/estabelecimentos">
              <Store aria-hidden="true" /> Ver diretório completo{" "}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
