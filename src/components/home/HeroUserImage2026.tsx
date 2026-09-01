import { ArrowRight, BadgeCheck, MapPin, Search, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { LiveProductSearch } from "./LiveProductSearch";
import "./HeroUserImage2026.css";

const HERO_IMAGE = "/hero-supermercado-mulher-comparando-2026.webp";

type HeroUserImage2026Props = {
  products: Product[];
  loading?: boolean;
};

export function HeroUserImage2026({
  products,
  loading = false,
}: HeroUserImage2026Props) {
  const storeCount = new Set(
    products.map((product) => product.establishment).filter(Boolean),
  ).size;

  return (
    <section className="pc26-user-hero" aria-labelledby="pc26-campaign-title">
      <div className="pc26-user-hero__stage">
        <div className="pc26-user-hero__copy">
          <h1 id="pc26-campaign-title">
            Compare preços e <strong>compre melhor em Feijó.</strong>
          </h1>
          <p>
            Pesquise um produto e veja, em segundos, o menor preço e onde
            comprar.
          </p>

          <div className="pc26-user-hero__search">
            <span className="pc26-user-hero__search-label">
              Qual produto você procura?
            </span>
            <LiveProductSearch
              id="price-search"
              products={products}
              loading={loading}
            />
          </div>

          <nav className="pc26-user-hero__popular" aria-label="Buscas rápidas">
            <span>Busca rápida:</span>
            <Link to="/buscar?q=arroz">Arroz</Link>
            <Link to="/buscar?q=carne">Carne</Link>
            <Link to="/buscar?q=leite">Leite</Link>
            <Link to="/buscar?q=medicamento">Medicamentos</Link>
          </nav>

          <div
            className="pc26-user-hero__actions"
            aria-label="Ações principais"
          >
            <Link className="pc26-user-hero__primary" to="/buscar">
              <Search aria-hidden="true" />
              Comparar preços
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="pc26-user-hero__secondary" to="/estabelecimentos">
              <Store aria-hidden="true" />
              Ver lojas
            </Link>
          </div>

          <div
            className="pc26-user-hero__proof"
            aria-label="Informações do catálogo"
          >
            <span>
              <BadgeCheck aria-hidden="true" /> {products.length || "—"}{" "}
              produtos monitorados
            </span>
            <span>
              <Store aria-hidden="true" /> {storeCount || "—"} estabelecimentos
            </span>
            <span>
              <MapPin aria-hidden="true" /> Feijó, Acre
            </span>
          </div>
        </div>

        <div className="pc26-user-hero__media">
          <img
            className="pc26-user-hero__artwork"
            src={HERO_IMAGE}
            alt="Mulher comparando um produto e preços pelo celular em um supermercado"
            width={1536}
            height={1024}
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
