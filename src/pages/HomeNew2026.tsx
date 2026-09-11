import { useEffect, useMemo, useState } from "react";
import { WifiOff, X } from "lucide-react";
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

/** Contagens ao vivo (produtos/lojas/preços) não tinham cache: toda vez que
 *  a home remontava (ex.: voltando de outra página) refazia as 3 consultas
 *  ao Supabase do zero, mesmo com o catálogo já em cache — atraso e flash
 *  de skeleton evitáveis numa navegação de ida e volta. Mesma janela de
 *  60s usada pelo cache do catálogo em sectorCatalog.ts. */
let liveMetricsCache: { value: PlatformMetrics; expires: number } | null = null;

export function HomeNew2026() {
  const [cachedMetrics] = useState(() => liveMetricsCache && liveMetricsCache.expires > Date.now() ? liveMetricsCache.value : null);
  const [catalog, setCatalog] = useState<CatalogPayload>({
    ...initialCatalog,
    metrics: verifiedDatasetMetrics,
  });
  const [liveMetrics, setLiveMetrics] = useState<PlatformMetrics | null>(cachedMetrics);
  const [loading, setLoading] = useState(!cachedMetrics);
  const [cycle, setCycle] = useState(() => currentCycle());
  // As 3 tentativas de fetchSectorCatalog podiam falhar (rede instável,
  // exatamente o contexto de uso declarado do produto) e a página seguia
  // mostrando o catálogo antigo/fallback sem nenhum sinal — o usuário não
  // tinha como saber que o preço podia estar desatualizado.
  const [syncFailed, setSyncFailed] = useState(false);
  const [syncNoticeDismissed, setSyncNoticeDismissed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("nx-home-active");
    return () => document.documentElement.classList.remove("nx-home-active");
  }, []);

  useEffect(() => {
    let active = true;

    // Sem retry, uma falha/timeout passageiro na primeira consulta (rede
    // instável, cold start) deixava a home travada para sempre nos 2
    // estabelecimentos estáticos e "Catálogo carregando…", sem nenhuma
    // tentativa nova nem sinal de erro para o usuário.
    const loadWithRetry = async (attempt = 0): Promise<CatalogPayload> => {
      try {
        return await fetchSectorCatalog();
      } catch (error) {
        if (attempt >= 2) throw error;
        await new Promise(resolve => window.setTimeout(resolve, 1000 * 2 ** attempt));
        return loadWithRetry(attempt + 1);
      }
    };

    const load = async () => {
      setSyncFailed(false);
      try {
        const value = await loadWithRetry();
        if (!active) return;
        setCatalog(value);
        // O catálogo já está utilizável; estatísticas não devem bloquear a vitrine.
        setLoading(false);

        if (liveMetricsCache && liveMetricsCache.expires > Date.now()) {
          setLiveMetrics(liveMetricsCache.value);
        } else if (supabase) {
          const [productsResult, storesResult, pricesResult] = await Promise.all([
            supabase.from("products").select("id", { count: "exact", head: true }),
            supabase
              .from("establishments")
              .select("id", { count: "exact", head: true })
              .eq("is_demo", false),
            supabase.from("prices").select("id", { count: "exact", head: true }),
          ]);

          if (!active) return;
          const nextMetrics = {
            products: productsResult.count ?? value.metrics.products ?? value.products.length,
            stores: storesResult.count ?? value.stores.length,
            prices: pricesResult.count ?? value.metrics.prices ?? 0,
          };
          liveMetricsCache = { value: nextMetrics, expires: Date.now() + 60_000 };
          setLiveMetrics(nextMetrics);
        } else {
          setLiveMetrics({
            products: value.metrics.products || value.products.length,
            stores: value.stores.length,
            prices: value.metrics.prices || 0,
          });
        }
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

  const productCount = liveMetrics?.products ?? catalog.metrics.products ?? products.length;
  const storeCount = liveMetrics?.stores ?? catalog.stores.length;

  return (
    <div className="pcx-home">
      <FestivalAcaiBar />
      <Header products={products} />
      {syncFailed && !syncNoticeDismissed && (
        <div className="pcx-sync-notice" role="status" aria-live="polite">
          <WifiOff aria-hidden="true" />
          <span>Não foi possível confirmar preços mais recentes agora. Mostrando o último catálogo salvo.</span>
          <button type="button" className="pcx-sync-notice__retry" onClick={() => { setLoading(true); setSyncNoticeDismissed(false); setLoadAttempt(value => value + 1); }}>Tentar novamente</button>
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
