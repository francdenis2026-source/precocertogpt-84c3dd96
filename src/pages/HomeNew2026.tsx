import { useEffect, useMemo, useState } from "react";
import {
  buildCatalog,
  type CatalogPayload,
  type PlatformMetrics,
  type Product,
  verifiedDatasetMetrics,
} from "../data/catalog";
import { fetchSectorCatalog } from "../data/sectorCatalog";
import { supabase } from "../lib/supabase";
import {
  buildFeatured,
  currentCycle,
  msUntilNextCycle,
} from "../data/featuredRotation";
import { BottomNav } from "../components/home/BottomNav";
import { CategoryBar } from "../components/home/CategoryBar";
import { Footer } from "../components/home/Footer";
import { Header } from "../components/home/Header";
import { HeroUserImage2026 } from "../components/home/HeroUserImage2026";
import { ProductGrid } from "../components/home/ProductGrid";
import { PromoBands } from "../components/home/PromoBands";
import { SmartBasketSpotlight } from "../components/home/SmartBasketSpotlight";
import { StoreRail } from "../components/home/StoreRail";
import "./HomeProfessionalRedesign2026.css";

const initialCatalog = buildCatalog();

export function HomeNew2026() {
  const [catalog, setCatalog] = useState<CatalogPayload>({
    ...initialCatalog,
    metrics: verifiedDatasetMetrics,
  });
  const [liveMetrics, setLiveMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState(() => currentCycle());

  useEffect(() => {
    document.documentElement.classList.add("nx-home-active");
    return () => document.documentElement.classList.remove("nx-home-active");
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const value = await fetchSectorCatalog();
        if (!active) return;
        setCatalog(value);

        if (supabase) {
          const [productsResult, storesResult, pricesResult] = await Promise.all([
            supabase.from("products").select("id", { count: "exact", head: true }),
            supabase
              .from("establishments")
              .select("id", { count: "exact", head: true })
              .eq("is_demo", false),
            supabase.from("prices").select("id", { count: "exact", head: true }),
          ]);

          if (!active) return;
          setLiveMetrics({
            products: productsResult.count ?? value.metrics.products ?? value.products.length,
            stores: storesResult.count ?? value.stores.length,
            prices: pricesResult.count ?? value.metrics.prices ?? 0,
          });
        } else {
          setLiveMetrics({
            products: value.metrics.products || value.products.length,
            stores: value.stores.length,
            prices: value.metrics.prices || 0,
          });
        }
      } catch {
        // Mantém o fallback visual sem inventar contagens.
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

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

  const productCount = liveMetrics?.products ?? catalog.metrics.products ?? products.length;
  const storeCount = liveMetrics?.stores ?? catalog.stores.length;

  return (
    <div className="pcx-home">
      <Header />
      <main id="conteudo-principal">
        <HeroUserImage2026
          products={products}
          productCount={productCount}
          storeCount={storeCount}
          loading={loading}
          cycle={cycle}
        />
        <SmartBasketSpotlight />
        <ProductGrid products={featured} loading={loading} />
        <PromoBands />
        <CategoryBar />
        <StoreRail stores={catalog.stores} cycle={cycle} />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
