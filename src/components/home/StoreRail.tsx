import { ArrowRight, ArrowUpRight, MapPin, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { StoreRow } from "../../data/catalog";
import { groupForStore } from "../../data/businessTaxonomy";
import { sectorLeadPhoto } from "../../data/sectorLeadPhotos";
import { SectionHeader } from "./SectionHeader";
import { StoreCard } from "./StoreCard";

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
          <SectionHeader
            id="stores-title"
            title="Comércio perto de você"
            description="Encontre catálogos ativos por bairro e veja os preços disponíveis."
          />
          <div className="pcx-stores">
            <div className="pcx-skeleton pcx-store-placeholder" aria-hidden="true" />
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
  const leadGroup = groupForStore(lead);
  const kindLabel = leadGroup.shortLabel;
  // Prioriza a foto/fachada real do estabelecimento (vinda do Supabase);
  // cai direto para a foto genérica do setor quando não há foto própria —
  // NUNCA para a logo. Este card ocupa ~640x300px; logos são arquivos
  // pequenos (o de "Comércio Bons Amigos", por ex., é 180x120) e esticados
  // via object-fit:cover nessa área viram uma imagem visivelmente borrada
  // e pixelizada, o oposto da identidade "editorial, evidência real" da
  // home. A logo continua sendo usada normalmente na miniatura pequena de
  // StoreCard.tsx, onde o tamanho reduzido não expõe esse problema.
  const leadImg = lead.photoUrl || sectorLeadPhoto(leadGroup.id);

  return (
    <section className="pcx-section" aria-labelledby="stores-title">
      <div className="pcx-shell">
        <SectionHeader
          id="stores-title"
          title="Comércio perto de você"
          description="Encontre catálogos ativos por bairro e veja os preços disponíveis."
          linkTo="/estabelecimentos"
          linkLabel="Todos os estabelecimentos"
          linkIcon={<ArrowRight aria-hidden="true" />}
        />

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
              width={1600}
              height={703}
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
                  Ver preços <ArrowUpRight aria-hidden="true" />
                </b>
              </div>
            </div>
          </Link>

          <div className="pcx-store-list">
            {directory.map((store) => (
              <StoreCard key={store.id} store={store} />
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
