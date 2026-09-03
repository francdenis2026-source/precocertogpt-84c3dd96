import { useState } from "react";
import {
  ArrowUpRight,
  Clock3,
  ImageOff,
  Store,
  TrendingDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { resolveProductImage } from "../../data/productImageResolver";
import { priceFreshness } from "../../lib/pricing";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ProductCard({
  product,
  featured = false,
}: {
  product: Product;
  featured?: boolean;
}) {
  const image = resolveProductImage(product);
  const [failedSource, setFailedSource] = useState("");
  const previous =
    product.previousPrice && product.previousPrice > product.minPrice
      ? product.previousPrice
      : product.avgPrice > product.minPrice
        ? product.avgPrice
        : undefined;
  const saving = previous ? previous - product.minPrice : 0;
  const storeCount = product.storeCount || 1;
  const freshness = priceFreshness(product.capturedAt, product.category);
  const freshnessText =
    freshness.state === "expired"
      ? "Preço expirado"
      : freshness.state === "aging"
        ? "Atualização anterior"
        : freshness.days < 0
          ? freshness.label
          : freshness.days === 0
            ? "Atualizado hoje"
            : freshness.days === 1
              ? "Atualizado ontem"
              : `Atualizado há ${freshness.days} dias`;

  return (
    <Link
      className={`pcx-product${featured ? " pcx-product--featured" : ""}`}
      to={`/produto/${product.slug || product.id}`}
      aria-label={`Comparar preços de ${product.name}`}
    >
      <div className="pcx-product__image">
        {saving > 0 && (
          <span className="pcx-product__saving">
            <TrendingDown aria-hidden="true" /> Economize {brl.format(saving)}
          </span>
        )}
        {image && failedSource !== image ? (
          <img
            src={image}
            alt={product.name}
            width="220"
            height="220"
            loading="lazy"
            decoding="async"
            onError={() => setFailedSource(image)}
          />
        ) : (
          <span
            className="pcx-product__no-photo"
            role="img"
            aria-label={`Foto de ${product.name} indisponível`}
          >
            <ImageOff aria-hidden="true" />
            <small>Foto indisponível</small>
          </span>
        )}
      </div>

      <div className="pcx-product__body">
        <span className="pcx-product__category">
          {product.category || "Produto"}
        </span>
        <h3>{product.name}</h3>
        {product.size && (
          <span className="pcx-product__meta">{product.size}</span>
        )}

        <div className="pcx-product__store">
          <Store aria-hidden="true" />
          <span>
            {product.establishment ||
              `${storeCount} ${storeCount === 1 ? "loja" : "lojas"} para comparar`}
          </span>
        </div>

        <div className="pcx-prices">
          <span>Menor preço</span>
          <div>
            {previous && <del>{brl.format(previous)}</del>}
            <strong>{brl.format(product.minPrice)}</strong>
          </div>
        </div>

        <div className="pcx-product__footer">
          <time dateTime={product.capturedAt}>
            <Clock3 aria-hidden="true" /> {freshnessText}
          </time>
          <strong>
            Ver comparação <ArrowUpRight aria-hidden="true" />
          </strong>
        </div>
      </div>
    </Link>
  );
}
