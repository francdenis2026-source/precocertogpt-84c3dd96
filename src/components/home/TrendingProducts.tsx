import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import type { Product } from "../../data/catalog";
import { fetchTopProducts } from "../../lib/analytics";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "./SectionHeader";

/**
 * "Mais buscados da plataforma": ranking real de visualizações de produto,
 * de qualquer visitante (cadastrado ou não) — ver src/lib/analytics.ts.
 * Some sozinho se ainda não há dados suficientes (site novo, ou visitas
 * recentes ainda não somam nada relevante).
 */
export function TrendingProducts({ products }: { products: Product[] }) {
  const [trending, setTrending] = useState<Product[] | null>(null);

  useEffect(() => {
    let active = true;
    void fetchTopProducts(30, 6).then(rows => {
      if (!active) return;
      const byId = new Map(products.map(product => [String(product.id), product]));
      const resolved = rows
        .map(row => byId.get(row.product_id))
        .filter((product): product is Product => Boolean(product));
      setTrending(resolved);
    });
    return () => {
      active = false;
    };
  }, [products]);

  if (!trending || trending.length < 3) return null;

  return (
    <section className="pcx-section" aria-labelledby="trending-title">
      <div className="pcx-shell">
        <SectionHeader
          id="trending-title"
          title={<><Flame aria-hidden="true" className="pcx-trending__flame" /> Mais buscados da plataforma</>}
          description="Os produtos que mais gente comparou nos últimos 30 dias em Feijó."
        />
        <div className="pcx-products">
          {trending.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
