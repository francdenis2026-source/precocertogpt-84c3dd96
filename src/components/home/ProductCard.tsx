import { ArrowRight, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { resolveCutoutImage, resolveProductImage } from "../../data/productImageResolver";
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export function ProductCard({ product }: { product: Product }) {
  const image = resolveCutoutImage(product) || resolveProductImage(product);
  const previous = product.previousPrice && product.previousPrice > product.minPrice ? product.previousPrice : product.avgPrice > product.minPrice ? product.avgPrice : undefined;
  return <Link className="pc-product" to={`/produto/${product.slug || product.id}`} aria-label={`Comparar preços de ${product.name}`}>
    <div className="pc-product__image">{image ? <img src={image} alt={product.name} loading="lazy" /> : <PackageSearch aria-hidden="true" />}</div>
    <div className="pc-product__body"><span className="pc-store-badge">{product.establishment || "Mercado parceiro"}</span><h3>{product.name}</h3><span className="pc-product__meta">{product.size || product.category || "Preço atualizado"}</span><div className="pc-prices">{previous && <del>{brl.format(previous)}</del>}<strong>{brl.format(product.minPrice)}</strong></div><span className="pc-compare">Comparar preços <ArrowRight /></span></div>
  </Link>;
}
