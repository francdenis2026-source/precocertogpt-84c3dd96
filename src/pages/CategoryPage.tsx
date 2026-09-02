import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
  ArrowLeft, Store, Clock, MapPin, Search,
  PackageSearch, Tag, Navigation, Building2,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { fetchSectorCatalog, sectorProducts, sectorStores } from "../data/sectorCatalog";
import type { CatalogPayload, Product } from "../data/catalog";
import { ProductThumb } from "../components/catalog/ProductThumb";
import { categoryHeroImage } from "../data/sectorHeroImages";
import { CategoryOffers } from "../components/offers/CategoryOffers";
import "./CategoryPage.css";

/** Grupo canônico da taxonomia usado por cada rota pública. */
const categoryGroup: Record<string, string> = {
  pizzaria: "food",
  lanchonete: "food",
  sorveteria: "food",
  conveniencia: "markets",
  padaria: "bakery",
  acougue: "butchers",
  farmacia: "pharmacies",
  mercantil: "markets",
  frutaria: "markets",
  papelaria: "books",
  desapego: "other",
  "moveis-imoveis": "other",
  hotelaria: "services",
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const categoryData: Record<string, { title: string; description: string; address: string; lat: number; lng: number }> = {
  pizzaria: { title: "Pizzarias", description: "Pizzarias cadastradas e seus preços em Feijó.", address: "Feijó - AC", lat: -8.1633, lng: -70.3533 },
  lanchonete: { title: "Lanchonetes", description: "Lanchonetes cadastradas, cardápios e preços reais.", address: "Feijó - AC", lat: -8.165, lng: -70.355 },
  sorveteria: { title: "Sorveterias", description: "Sorveterias cadastradas na plataforma.", address: "Feijó - AC", lat: -8.162, lng: -70.352 },
  conveniencia: { title: "Conveniência", description: "Lojas de conveniência e mercados cadastrados.", address: "Feijó - AC", lat: -8.161, lng: -70.351 },
  padaria: { title: "Padarias", description: "Padarias e panificadoras cadastradas na plataforma.", address: "Feijó - AC", lat: -8.164, lng: -70.354 },
  acougue: { title: "Açougues", description: "Açougues cadastrados e seus produtos com preço.", address: "Feijó - AC", lat: -8.166, lng: -70.356 },
  farmacia: { title: "Farmácias", description: "Farmácias cadastradas e produtos com preço.", address: "Feijó - AC", lat: -8.167, lng: -70.357 },
  mercantil: { title: "Mercantis", description: "Mercados, mercantis e mercearias cadastrados.", address: "Feijó - AC", lat: -8.168, lng: -70.358 },
  frutaria: { title: "Frutarias", description: "Frutarias, hortifrutis e comércios relacionados.", address: "Feijó - AC", lat: -8.169, lng: -70.359 },
  papelaria: { title: "Papelarias", description: "Papelarias e comércios de cultura cadastrados.", address: "Feijó - AC", lat: -8.17, lng: -70.36 },
  desapego: { title: "Desapego", description: "Anúncios e estabelecimentos classificados nesta área.", address: "Feijó - AC", lat: -8.171, lng: -70.361 },
  "moveis-imoveis": { title: "Móveis & Imóveis", description: "Negócios cadastrados nesta categoria.", address: "Feijó - AC", lat: -8.172, lng: -70.362 },
  hotelaria: { title: "Hotelaria & Pousadas", description: "Hotéis, pousadas e serviços cadastrados.", address: "Feijó - AC", lat: -8.173, lng: -70.363 },
};

export function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const data = categoryData[category || ""] || {
    title: "Categoria",
    description: "Explore os estabelecimentos cadastrados.",
    address: "Feijó - AC",
    lat: -8.1633,
    lng: -70.3533,
  };

  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [productQuery, setProductQuery] = useState("");

  useEffect(() => {
    let active = true;
    setLoadingCatalog(true);
    fetchSectorCatalog()
      .then(result => { if (active) setCatalog(result); })
      .catch(() => { if (active) setCatalog(null); })
      .finally(() => { if (active) setLoadingCatalog(false); });
    return () => { active = false; };
  }, []);

  const groupId = categoryGroup[category || ""] || "other";

  const establishments = useMemo(() => {
    if (!catalog) return [];
    return sectorStores(catalog, { id: groupId });
  }, [catalog, groupId]);

  const products = useMemo<Product[]>(() => {
    if (!catalog) return [];
    const term = productQuery.trim().toLocaleLowerCase("pt-BR");
    return sectorProducts(catalog, { id: groupId })
      .filter(product => !term || `${product.name} ${product.brand} ${product.establishment}`.toLocaleLowerCase("pt-BR").includes(term))
      .slice(0, 24);
  }, [catalog, groupId, productQuery]);

  const handleGetDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${data.lat},${data.lng}`, "_blank", "noopener,noreferrer");
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>{data.title} em Feijó | PreçoCerto</title>
        <meta name="description" content={`Confira estabelecimentos de ${data.title} realmente cadastrados no PreçoCerto em Feijó (AC).`} />
      </Helmet>

      <div className="category-page">
        <header className="category-header">
          <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft /> Voltar</button>
          <div className="category-search">
            <input
              type="text"
              placeholder="Buscar produto nesta categoria..."
              value={productQuery}
              onChange={event => setProductQuery(event.target.value)}
              aria-label="Buscar produto nesta categoria"
            />
            <Search size={16} />
          </div>
        </header>

        <main className="category-content">
          <section
            className="category-hero category-hero--band pc26-sector-hero"
            style={{ "--sector-hero": `url(${categoryHeroImage(category || data.title)})` } as CSSProperties}
          >
            <span className="category-hero__tag"><Tag size={14} /> {data.title} · Feijó, Acre</span>
            <h1>{data.title} em Feijó</h1>
            <p className="subtitle">{data.description}</p>
            <div className="info-grid">
              <div className="info-item"><Store size={20} /> <strong>Estabelecimentos:</strong> {loadingCatalog ? "carregando…" : establishments.length}</div>
              <div className="info-item"><PackageSearch size={20} /> <strong>Produtos:</strong> {loadingCatalog ? "carregando…" : products.length}</div>
              <div className="info-item"><MapPin size={20} /> <strong>Local:</strong> {data.address}</div>
            </div>
          </section>

          <CategoryOffers categorySlug={category || data.title} title={`Ofertas em ${data.title}`} />

          <section className="category-section category-products" aria-labelledby="category-establishments-title">
            <h3 id="category-establishments-title"><Building2 className="section-icon" /> Estabelecimentos cadastrados</h3>
            {loadingCatalog ? (
              <div className="category-products__grid">
                {[...Array(4)].map((_, i) => <div key={i} className="category-product-card is-loading" aria-hidden="true" />)}
              </div>
            ) : establishments.length ? (
              <div className="category-products__grid">
                {establishments.map(({ store, count }) => (
                  <Link key={String(store.id)} to={`/estabelecimento/${store.slug}`} className="category-product-card">
                    <span className="category-product-card__meta">{[store.neighborhood, store.city].filter(Boolean).join(" · ") || "Feijó - AC"}</span>
                    <strong className="category-product-card__name">{store.name}</strong>
                    {store.address && <span className="category-product-card__store"><MapPin size={14} /> {store.address}</span>}
                    {store.openingHours && <span className="category-product-card__store"><Clock size={14} /> {store.openingHours}</span>}
                    <span className="category-product-card__cta">{count} produto{count === 1 ? "" : "s"} com preço</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="category-products__empty">Nenhum estabelecimento cadastrado nesta categoria.</p>
            )}
          </section>

          <p className="category-city-link"><Link to="/cidades">Ver lojas e preços por cidade</Link></p>

          <section className="category-section category-products">
            <h3><PackageSearch className="section-icon" /> Produtos e preços desta categoria</h3>
            {loadingCatalog ? (
              <div className="category-products__grid">
                {[...Array(6)].map((_, i) => <div key={i} className="category-product-card is-loading" aria-hidden="true" />)}
              </div>
            ) : products.length ? (
              <div className="category-products__grid">
                {products.map(product => (
                  <Link key={product.id} to={`/produto/${product.slug || product.id}`} className="category-product-card">
                    <ProductThumb product={product} size="md" className="category-product-card__photo" />
                    <span className="category-product-card__meta">{[product.brand, product.size].filter(Boolean).join(" · ")}</span>
                    <strong className="category-product-card__name">{product.name}</strong>
                    <span className="category-product-card__store"><Store size={14} /> {product.establishment}</span>
                    <span className="category-product-card__price"><small>Menor preço</small><b>{money(product.minPrice)}</b></span>
                    <span className="category-product-card__cta">Comparar em {product.storeCount} loja{product.storeCount > 1 ? "s" : ""}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="category-products__empty">Nenhum produto cadastrado nesta categoria ainda.</p>
            )}
          </section>

          <section className="category-section map-section">
            <h3><MapPin className="section-icon" /> Localização</h3>
            <div className="map-placeholder">
              <div className="map-inner">
                <MapPin size={48} className="map-pin-anim" />
                <p>{data.address}</p>
                <button onClick={handleGetDirections} className="btn btn-directions"><Navigation size={18} /> Abrir Feijó no Google Maps</button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </HelmetProvider>
  );
}
