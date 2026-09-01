import { useState } from "react";
import { ArrowUpRight, ImageOff, MapPin, Store, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { resolveProductImage } from "../../data/productImageResolver";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const image = resolveProductImage(product);
  const [failedSource, setFailedSource] = useState("");
  const previous = product.previousPrice && product.previousPrice > product.minPrice
    ? product.previousPrice
    : product.avgPrice > product.minPrice
      ? product.avgPrice
      : undefined;
  const saving = previous ? previous - product.minPrice : 0;
  const storeCount = product.storeCount || 1;

  return (
    <Link className={`pc26-product${featured ? " pc26-product--featured" : ""}`} to={`/produto/${product.slug || product.id}`} aria-label={`Comparar preços de ${product.name}`}>
      <div className="pc26-product__image">
        {saving > 0 && <span className="pc26-product__saving"><TrendingDown aria-hidden="true" /> Economize {brl.format(saving)}</span>}
        {image && failedSource !== image
          ? <img src={image} alt={product.name} width="220" height="220" loading="lazy" decoding="async" onError={() => setFailedSource(image)} />
          : <span className="pc26-product__no-photo" role="img" aria-label={`Foto de ${product.name} indisponível`}><ImageOff aria-hidden="true" /><small>Foto indisponível</small></span>}
      </div>

      <div className="pc26-product__body">
        <span className="pc26-product__category">{product.category || "Produto"}</span>
        <h3>{product.name}</h3>
        {product.size && <span className="pc26-product__meta">{product.size}</span>}

        <div className="pc26-product__store"><Store aria-hidden="true" /><span>{product.establishment || `${storeCount} ${storeCount === 1 ? "loja" : "lojas"} para comparar`}</span></div>

        <div className="pc26-prices">
          <span>Menor preço</span>
          <div>{previous && <del>{brl.format(previous)}</del>}<strong>{brl.format(product.minPrice)}</strong></div>
        </div>

        <div className="pc26-product__footer">
          <span><MapPin aria-hidden="true" /> Feijó, AC</span>
          <strong>Ver comparação <ArrowUpRight aria-hidden="true" /></strong>
        </div>
      </div>
    </Link>
  );
}
