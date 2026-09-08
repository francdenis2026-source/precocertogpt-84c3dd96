import { useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import type { StoreRow } from "../../data/catalog";
import { getStoreLogoUrl } from "../../data/storeLogos";

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * Linha de estabelecimento usada no diretório resumido da home. Mostra a
 * foto/logo real do comércio quando existe (mesma fonte usada em
 * CityStoresPage e StoreDetailProfessional: photoUrl/logoUrl do Supabase,
 * com o mapeamento de marcas conhecidas de storeLogos.ts como último
 * recurso) — nunca inventa uma imagem. Sem nenhuma foto real disponível,
 * cai para as iniciais do nome, como antes.
 */
export function StoreCard({ store }: { store: StoreRow }) {
  const [failed, setFailed] = useState(false);
  const photo = store.photoUrl || store.logoUrl || getStoreLogoUrl(store.name);
  const showPhoto = Boolean(photo) && !failed;

  return (
    <Link
      className="pcx-store-row"
      to={`/estabelecimento/${store.slug}`}
      style={{ "--store-accent": store.color } as CSSProperties}
    >
      {showPhoto ? (
        <img
          className="pcx-store-row__photo"
          src={photo}
          alt=""
          width={44}
          height={44}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <i aria-hidden="true">{initialsFor(store.name)}</i>
      )}
      <span>
        <strong>{store.name}</strong>
        <small>
          <MapPin aria-hidden="true" /> {store.neighborhood || "Feijó"}
        </small>
      </span>
      <em>
        <b>{store.products || 0}</b> itens
      </em>
      <ArrowUpRight className="pcx-store-row__arrow" aria-hidden="true" />
    </Link>
  );
}
