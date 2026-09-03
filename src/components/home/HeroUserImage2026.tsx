import { ArrowRight, BadgeCheck, MapPin, RefreshCw, Search, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { LiveProductSearch } from "./LiveProductSearch";
import "./HeroUserImage2026.css";
import heroImg from "../../assets/home-2026/hero-campanha-precocerto-pro.jpg";


type HeroUserImage2026Props = {
  products: Product[];
  productCount?: number;
  storeCount?: number;
  loading?: boolean;
};

export function HeroUserImage2026({
  products,
  productCount,
  storeCount,
  loading = false,
}: HeroUserImage2026Props) {
  const shownProductCount = productCount ?? products.length;
  const shownStoreCount = storeCount ?? new Set(
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
              Ver estabelecimentos
            </Link>
          </div>

          <div
            className="pc26-user-hero__proof"
            aria-label="Informações do catálogo"
          >
            <span>
              <BadgeCheck aria-hidden="true" /> {shownProductCount || "—"}{" "}
              produtos monitorados
            </span>
            <span>
              <Store aria-hidden="true" /> {shownStoreCount || "—"} estabelecimentos
            </span>
            <span>
              <MapPin aria-hidden="true" /> Feijó, Acre
            </span>
          </div>
        </div>

        <aside className="pc26-user-hero__media" aria-label="Como o PreçoCerto ajuda">
          <img
            className="pc26-user-hero__artwork"
            src={heroImg}
            alt="Cliente comparando o preço de um produto pelo celular dentro de um comércio de Feijó"
            width={1536}
            height={1024}
            fetchPriority="high"
            decoding="async"
          />
          <div className="pc26-hero-panel">
            <span className="pc26-hero-panel__tag">PreçoCerto · Feijó, Acre</span>
            <ul className="pc26-hero-panel__list">
              <li>
                <RefreshCw aria-hidden="true" />
                <span>
                  <strong>Preços atualizados</strong>
                  <small>Coletas verificadas nos comércios da cidade</small>
                </span>
              </li>
              <li>
                <Store aria-hidden="true" />
                <span>
                  <strong>Ofertas reais e locais</strong>
                  <small>Somente estabelecimentos de Feijó cadastrados</small>
                </span>
              </li>
              <li>
                <Search aria-hidden="true" />
                <span>
                  <strong>Busca rápida e precisa</strong>
                  <small>Compare o mesmo item em vários estabelecimentos</small>
                </span>
              </li>
            </ul>
            <div className="pc26-hero-panel__metrics">
              <span>
                <strong>{shownProductCount || "—"}</strong>
                <small>produtos</small>
              </span>
              <span>
                <strong>{shownStoreCount || "—"}</strong>
                <small>estabelecimentos</small>
              </span>
              <span>
                <strong>100%</strong>
                <small>gratuito</small>
              </span>
            </div>
          </div>
        </aside>

      </div>
    </section>
  );
}
