import { useEffect, useMemo, useState } from "react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { buildFeatured, currentCycle, msUntilNextCycle } from "../data/featuredRotation";
import { BenefitsStrip } from "../components/home/BenefitsStrip";
import { BottomNav } from "../components/home/BottomNav";
import { CategoryBar } from "../components/home/CategoryBar";
import { Footer } from "../components/home/Footer";
import { Header } from "../components/home/Header";
import { HeroUserImage2026 } from "../components/home/HeroUserImage2026";
import { ProductGrid } from "../components/home/ProductGrid";
import { PromoBands } from "../components/home/PromoBands";
import { StoreRail } from "../components/home/StoreRail";
import { useSiteTheme } from "../hooks/useSiteTheme";
import "./HomeProfessional2026.css";
import "./HomeFooterCompact2026.css";
import "./HomeDensityPolish2026.css";
import "./HomeThemeContrast2026.css";
import "./HomeTaste2026.css";
import "./HomeManualPolish2026.css";
import "./HomeBelowHeroTaste2026.css";

const initialCatalog = buildCatalog();

export function HomeNew2026() {
  const [catalog, setCatalog] = useState<CatalogPayload>({ ...initialCatalog, metrics: verifiedDatasetMetrics });
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState(() => currentCycle());
  const { theme, toggleTheme } = useSiteTheme();

  useEffect(() => {
    document.documentElement.classList.add("nx-home-active");
    return () => document.documentElement.classList.remove("nx-home-active");
  }, []);

  useEffect(() => {
    let active = true;
    fetchCatalog()
      .then(value => { if (active) setCatalog(value); })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setCycle(currentCycle()), msUntilNextCycle() + 250);
    return () => window.clearTimeout(timer);
  }, [cycle]);

  const products = useMemo(() => catalog.products.filter(product => product.minPrice > 0), [catalog.products]);
  const featured = useMemo<Product[]>(() => buildFeatured(products, cycle, 4), [products, cycle]);

  return <div className="pc26-home pc26-home--recovered">
    <Header theme={theme} onToggleTheme={toggleTheme}/>
    <main id="conteudo-principal">
      <HeroUserImage2026/>
      <BenefitsStrip/>
      <CategoryBar/>
      <PromoBands/>
      <ProductGrid products={featured} loading={loading}/>
      <StoreRail stores={catalog.stores}/>
    </main>
    <Footer/>
    <BottomNav/>
  </div>;
}
