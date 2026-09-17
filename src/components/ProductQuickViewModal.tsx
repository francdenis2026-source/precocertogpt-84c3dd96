import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Heart, PackageSearch, ShoppingBasket, ShoppingCart, Store, X } from "lucide-react";
import type { Product } from "../data/catalog";
import { resolveProductImage } from "../data/productImageResolver";
import { useFavorites } from "../features/favorites/FavoritesProvider";
import { addToBasketWithAuthGuard } from "../lib/basket";
import { useProductOnlineSales } from "../lib/onlineSalesAvailability";
import "./ProductQuickViewModal.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function QuickViewImage({ product }: { product: Product }) {
  const source = resolveProductImage(product);
  const [failedSource, setFailedSource] = useState("");
  if (source && failedSource !== source) return <img src={source} alt={product.name} loading="eager" onError={() => setFailedSource(source)} />;
  return <PackageSearch aria-hidden="true" />;
}

/**
 * Modal "visualização rápida" de produto — usado nas páginas dedicadas de
 * Kelly Burgueria e Ponto do Sanduba para permitir clicar em qualquer item
 * do cardápio, ver os detalhes num painel profissional, favoritar e
 * adicionar à cesta sem sair da página. Reaproveita os mesmos mecanismos de
 * favoritos (useFavorites) e cesta (localStorage + evento pc:basket-changed)
 * já usados em /produto/:identifier, então o item favoritado ou adicionado
 * aqui aparece normalmente no resto do site.
 *
 * Layout espelha o painel de comparação da busca (hero com foto + faixa de
 * preço fixa embaixo) para manter os dois modais de produto do site com a
 * mesma linguagem visual.
 */
export function ProductQuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const favorite = isFavorite(product.id);
  const { canBuyOnline, merchantId } = useProductOnlineSales(product.id, product.establishmentId, product.establishmentSlug);

  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = { position: body.style.position, top: body.style.top, left: body.style.left, right: body.style.right, width: body.style.width, overflow: body.style.overflow };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [onClose]);

  const handleAddToBasket = async () => {
    const result = await addToBasketWithAuthGuard(product.id);
    if (result === "auth-required") return;
    setMessage(result === "exists" ? "Já está na sua cesta." : "Adicionado à cesta.");
    window.setTimeout(() => setMessage(""), 2200);
  };

  return (
    <div className="pqv-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="pqv-dialog" role="dialog" aria-modal="true" aria-labelledby="pqv-title">
        <div className="pqv-hero">
          <div className="pqv-hero-top">
            {product.category && <span className="pqv-eyebrow">{product.category}</span>}
            <div className="pqv-hero-icons">
              <button type="button" className={`pqv-icon-btn${favorite ? " is-active" : ""}`} onClick={() => void toggleFavorite(product.id)} aria-pressed={favorite} aria-label={favorite ? "Remover dos favoritos" : "Favoritar produto"}>
                <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} />
              </button>
              <button ref={closeButtonRef} type="button" className="pqv-icon-btn" onClick={onClose} aria-label="Fechar detalhes do produto">
                <X aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="pqv-hero-main">
            <div className="pqv-hero-media"><QuickViewImage product={product} /></div>
            <div className="pqv-hero-copy">
              <h2 id="pqv-title">{product.name}</h2>
            </div>
          </div>
        </div>

        <div className="pqv-body">
          {product.size && <p className="pqv-description">{product.size}</p>}
          {canBuyOnline && merchantId && (
            <Link className="pqv-buy" to={`/loja/${merchantId}`} onClick={onClose}>
              <ShoppingCart aria-hidden="true" /> Comprar online nesta loja
            </Link>
          )}
          {message && <p className="pqv-message" role="status">{message}</p>}
          {product.storeCount > 1 ? (
            <Link className="pqv-compare" to={`/produto/${product.slug}`} onClick={onClose}>
              <span className="pqv-compare__icon"><Store aria-hidden="true" /></span>
              <span className="pqv-compare__copy">
                <strong>Ver preços em outros estabelecimentos</strong>
                <small>{product.storeCount} lojas · de {brl.format(product.minPrice)} a {brl.format(product.maxPrice)}</small>
              </span>
              <ChevronRight aria-hidden="true" className="pqv-compare__chevron" />
            </Link>
          ) : (
            <Link className="pqv-link" to={`/produto/${product.slug}`} onClick={onClose}>Ver página completa do produto</Link>
          )}
        </div>

        <footer className="pqv-footer">
          <div className="pqv-footer-price"><small>Preço</small><strong>{brl.format(product.minPrice)}</strong></div>
          <button type="button" className="pqv-footer-add" onClick={() => void handleAddToBasket()}>
            <ShoppingBasket aria-hidden="true" /> Adicionar à cesta
          </button>
        </footer>
      </section>
    </div>
  );
}
