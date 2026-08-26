import { useEffect, useMemo, useState } from "react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { buildFeatured, currentCycle, msUntilNextCycle } from "../data/featuredRotation";
import { BenefitsStrip } from "../components/home/BenefitsStrip";
import { CategoryBar } from "../components/home/CategoryBar";
import { BottomNav } from "../components/home/BottomNav";
import { Footer } from "../components/home/Footer";
import { Header } from "../components/home/Header";
import { HeroSection } from "../components/home/HeroSection";
import { ProductGrid } from "../components/home/ProductGrid";
import { useSiteTheme } from "../hooks/useSiteTheme";
import "./HomeNew2026.css";
import "./HomeVisuals2026.css";
import "./HomeModel2026.css";

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
    fetchCatalog().then(value => { if (active) setCatalog(value); }).catch(() => undefined).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setCycle(currentCycle()), msUntilNextCycle() + 250);
    return () => window.clearTimeout(timer);
  }, [cycle]);

  const products = useMemo(() => catalog.products.filter(product => product.minPrice > 0), [catalog.products]);
  const featured = useMemo<Product[]>(() => buildFeatured(products, cycle, 8), [products, cycle]);
  return <div className="pc26-home"><Header theme={theme} onToggleTheme={toggleTheme}/><main id="conteudo-principal"><HeroSection products={products} loading={loading} productCount={products.length} storeCount={catalog.metrics.stores} priceCount={catalog.metrics.prices}/><BenefitsStrip/><CategoryBar/><ProductGrid products={featured} loading={loading}/></main><Footer/><BottomNav/></div>;
}
