import { useEffect, useMemo, useState } from "react";
import { WifiOff, X } from "lucide-react";
import {
  buildCatalog,
  type CatalogPayload,
  type Product,
  verifiedDatasetMetrics,
} from "../data/catalog";
import { fetchSectorCatalog, getCachedSectorCatalog } from "../data/sectorCatalog";
import {
  buildFeatured,
  currentCycle,
  msUntilNextCycle,
} from "../data/featuredRotation";
import { FestivalAcaiBar } from "../components/FestivalAcaiBar";
import { AppDock } from "../reference/PublicChrome";
import { CategoryBar } from "../components/home/CategoryBar";
import { Footer } from "../components/home/Footer";
import { Header } from "../components/home/Header";
import { HeroUserImage2026 } from "../components/home/HeroUserImage2026";
import { TrustBar } from "../components/home/TrustBar";
import { LocalBanner } from "../components/home/LocalBanner";
import { ProductGrid } from "../components/home/ProductGrid";
import { TrendingProducts } from "../components/home/TrendingProducts";
import { SmartBasketSpotlight } from "../components/home/SmartBasketSpotlight";
import { StoreRail } from "../components/home/StoreRail";
import "./HomeProfessionalRedesign2026.css";

const initialCatalog = buildCatalog();

export function HomeNew2026() {
  const [snapshot] = useState(getCachedSectorCatalog);
  const [catalog, setCatalog] = useState<CatalogPayload>(() => snapshot ?? {
    ...initialCatalog,
    metrics: verifiedDatasetMetrics,
  });
  const [loading, setLoading] = useState(!snapshot);
  const [cycle, setCycle] = useState(() => currentCycle());
  // A failed refresh leaves the last catalogue visible with a retry notice.
  const [syncFailed, setSyncFailed] = useState(false);
  const [syncNoticeDismissed, setSyncNoticeDismissed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("nx-home-active");
    return () => document.documentElement.classList.remove("nx-home-active");
  }, []);

  useEffect(() => {
    let active = true;

    // Reuse fresh snapshots; refresh stale data without hiding the current view.
    const load = async () => {
      setSyncFailed(false);
      try {
        const value = await fetchSectorCatalog(loadAttempt > 0);
        if (!active) return;
        setCatalog(value);
      } catch {
        // Mantém o fallback visual sem inventar contagens, mas avisa que a
        // atualização falhou — em vez de deixar o usuário achar que o
        // catálogo exibido é o mais recente.
        if (active) setSyncFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setCycle(currentCycle()),
      msUntilNextCycle() + 250,
    );
    return () => window.clearTimeout(timer);
  }, [cycle]);

  const products = useMemo(
    () => catalog.products.filter((product) => product.minPrice > 0),
    [catalog.products],
  );
  const featured = useMemo<Product[]>(
    () => buildFeatured(products, cycle, 6),
    [products, cycle],
  );

  const productCount = catalog.metrics.products ?? products.length;
  const storeCount = catalog.stores.length;

  return (
    <div className="pcx-home">
      <FestivalAcaiBar />
      <Header products={products} />
      {syncFailed && !syncNoticeDismissed && (
        <div className="pcx-sync-notice" role="status" aria-live="polite">
          <WifiOff aria-hidden="true" />
          <span>Não foi possível confirmar preços mais recentes agora. Mostrando o último catálogo salvo.</span>
          <button type="button" className="pcx-sync-notice__retry" onClick={() => { setSyncNoticeDismissed(false); setLoadAttempt(value => value + 1); }}>Tentar novamente</button>
          <button type="button" className="pcx-sync-notice__dismiss" onClick={() => setSyncNoticeDismissed(true)} aria-label="Dispensar aviso">
            <X aria-hidden="true" />
          </button>
        </div>
      )}
      <main id="conteudo-principal">
        <HeroUserImage2026
          products={products}
          productCount={productCount}
          storeCount={storeCount}
          loading={loading}
          cycle={cycle}
        />
        <TrustBar />
        <CategoryBar stores={catalog.stores} />
        <ProductGrid products={featured} loading={loading} />
        <TrendingProducts products={products} />
        <SmartBasketSpotlight products={products} />
        <StoreRail stores={catalog.stores} cycle={cycle} loading={loading} />
        <LocalBanner />
      </main>
      <Footer />
      <AppDock current="home" />
    </div>
  );
}
