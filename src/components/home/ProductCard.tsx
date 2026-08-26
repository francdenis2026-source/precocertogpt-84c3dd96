import { ArrowRight, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { resolveCutoutImage, resolveProductImage } from "../../data/productImageResolver";
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export function ProductCard({ product }: { product: Product }) {
  const image = resolveCutoutImage(product) || resolveProductImage(product);
  const previous = product.previousPrice && product.previousPrice > product.minPrice ? product.previousPrice : product.avgPrice > product.minPrice ? product.avgPrice : undefined;
  return <Link className="pc26-product" to={`/produto/${product.slug || product.id}`} aria-label={`Comparar preços de ${product.name}`}>
    <div className="pc26-product__image">{image ? <img src={image} alt={product.name} width="180" height="180" loading="lazy" decoding="async" /> : <PackageSearch aria-hidden="true" />}</div>
    <div className="pc26-product__body"><span className="pc26-store-badge">Menor preço em {product.establishment || "loja parceira"}</span><h3>{product.name}</h3><span className="pc26-product__meta">{product.size || product.category || "Preço atualizado"}</span><div className="pc26-prices">{previous && <del>{brl.format(previous)}</del>}<strong>{brl.format(product.minPrice)}</strong></div><span className="pc26-compare">Comparar em {product.storeCount || 1} {product.storeCount === 1 ? "loja" : "lojas"} <ArrowRight aria-hidden="true" /></span></div>
  </Link>;
}
