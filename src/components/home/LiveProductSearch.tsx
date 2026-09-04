import {
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  PackageSearch,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { resolveProductImage } from "../../data/productImageResolver";
import { suggestProducts } from "../../lib/productSearch";
import { useFavorites } from "../../features/favorites/FavoritesProvider";
import { usePriceVisibility } from "../../hooks/usePriceVisibility";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const FREE_PREVIEW_LIMIT = 2;

type LiveProductSearchProps = {
  products: Product[];
  loading?: boolean;
  compact?: boolean;
  id: string;
};

export function LiveProductSearch({
  products,
  loading = false,
  compact = false,
  id,
}: LiveProductSearchProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useFavorites();
  const { allPricesVisible } = usePriceVisibility();
  const isGuest = !userId && !allPricesVisible;
  const listId = `${useId().replace(/:/g, "")}-${id}-results`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedQuery = query.trim();
  const suggestions = useMemo(
    () =>
      normalizedQuery.length >= 2
        ? suggestProducts(products, normalizedQuery, compact ? 5 : 6)
        : [],
    [compact, normalizedQuery, products],
  );
  const safeActiveIndex = activeIndex < suggestions.length ? activeIndex : -1;
  const showPanel = open && normalizedQuery.length >= 2;

  useEffect(() => {
    if (!compact) return;
    const focusSearch = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, [compact]);

  const searchAll = () => {
    const value = normalizedQuery;
    setOpen(false);
    setActiveIndex(-1);
    navigate(value ? `/buscar?q=${encodeURIComponent(value)}` : "/buscar");
  };
  const openProduct = (product: Product) => {
    setOpen(false);
    setActiveIndex(-1);
    navigate(`/produto/${product.slug || product.id}`);
  };
  const goToSignup = () => {
    setOpen(false);
    setActiveIndex(-1);
    navigate(`/cadastro?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    searchAll();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && showPanel) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!showPanel || !suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? suggestions.length - 1 : index - 1,
      );
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(suggestions.length - 1);
    } else if (event.key === "Enter" && safeActiveIndex >= 0) {
      event.preventDefault();
      openProduct(suggestions[safeActiveIndex]);
    }
  };

  return (
    <div
      className={`pc26-live-search${compact ? " pc26-live-search--compact" : ""}${showPanel ? " is-open" : ""}`}
    >
      <form
        className={compact ? "pc26-search" : "pc26-hero-search"}
        role="search"
        onSubmit={submit}
      >
        <Search className="pc26-live-search__icon" aria-hidden="true" />
        <label className="sr-only" htmlFor={id}>
          Produto para comparar
        </label>
        <input
          ref={inputRef}
          id={id}
          name="produto"
          role="combobox"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            compact
              ? "Busque produto, marca ou categoria"
              : "Buscar produto ou marca"
          }
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listId : undefined}
          aria-activedescendant={
            showPanel && safeActiveIndex >= 0
              ? `${listId}-${safeActiveIndex}`
              : undefined
          }
        />
        {!query && compact ? (
          <span className="pc26-search__shortcut" aria-hidden="true">
            Ctrl K
          </span>
        ) : null}
        {query && (
          <button
            className="pc26-live-search__clear"
            type="button"
            onClick={() => {
              setQuery("");
              setActiveIndex(-1);
              setOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Limpar busca"
          >
            <X aria-hidden="true" />
          </button>
        )}
        <button className="pc26-live-search__submit" type="submit">
          {compact ? "Buscar" : "Buscar preço"}
          <ArrowRight aria-hidden="true" />
        </button>
      </form>
      {showPanel && (
        <div
          id={listId}
          className="pc26-live-results"
          role="listbox"
          aria-label="Sugestões de produtos"
        >
          <div className="pc26-live-results__head">
            <span>Resultados ao vivo</span>
            <div className="pc26-live-results__head-actions">
              <small>
                {loading
                  ? "Atualizando catálogo…"
                  : `${suggestions.length} ${suggestions.length === 1 ? "produto" : "produtos"}`}
              </small>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setActiveIndex(-1);
                }}
                aria-label="Fechar resultados da busca"
              >
                <X aria-hidden="true" />
              </button>
            </div>
          </div>
          {loading && !products.length ? (
            <div className="pc26-live-results__state">
              <LoaderCircle
                className="pc26-live-results__loader"
                aria-hidden="true"
              />
              <span>Consultando preços locais…</span>
            </div>
          ) : suggestions.length ? (
            <div className="pc26-live-results__list">
              {suggestions.map((product, index) => {
                const image = resolveProductImage(product);
                const locked = isGuest && index >= FREE_PREVIEW_LIMIT;
                return (
                  <button
                    id={`${listId}-${index}`}
                    key={product.id}
                    type="button"
                    role="option"
                    aria-selected={index === safeActiveIndex}
                    className={`${index === safeActiveIndex ? "is-active" : ""}${locked ? " pc26-live-results__item--teaser" : ""}`}
                    onPointerMove={(event) => {
                      if (event.pointerType === "mouse") setActiveIndex(index);
                    }}
                    onClick={() => (locked ? goToSignup() : openProduct(product))}
                  >
                    <span className="pc26-live-results__thumb">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          width="52"
                          height="52"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <PackageSearch aria-hidden="true" />
                      )}
                    </span>
                    <span className="pc26-live-results__copy">
                      <strong>{product.name}</strong>
                      <small>
                        {[product.brand, product.size && product.size.trim() !== "-" ? product.size : product.category]
                          .filter(Boolean)
                          .join(" · ")}
                      </small>
                      <em
                        style={
                          {
                            "--pc26-store-accent":
                              product.storeColor || "#17623d",
                          } as CSSProperties
                        }
                      >
                        <i aria-hidden="true" />
                        {product.establishment || "Comércio local"}
                      </em>
                    </span>
                    {locked ? (
                      <span className="pc26-live-results__price pc26-live-results__price--blurred">
                        <small>a partir de</small>
                        <strong>{brl.format(product.minPrice)}</strong>
                      </span>
                    ) : (
                      <span className="pc26-live-results__price">
                        <small>a partir de</small>
                        <strong>{brl.format(product.minPrice)}</strong>
                      </span>
                    )}
                    {locked && (
                      <i className="pc26-live-results__lock">
                        <LockKeyhole aria-hidden="true" />
                      </i>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="pc26-live-results__state">
              <PackageSearch aria-hidden="true" />
              <span>
                <strong>Nenhum produto encontrado</strong>
                <small>Tente um nome mais curto ou outra marca.</small>
              </span>
            </div>
          )}
          {!loading && suggestions.length > 0 && (
            isGuest && suggestions.length > FREE_PREVIEW_LIMIT ? (
              <button
                className="pc26-live-results__all pc26-live-results__all--gate"
                type="button"
                onClick={goToSignup}
              >
                <UserPlus aria-hidden="true" />
                Criar conta grátis para ver todos os preços
              </button>
            ) : (
              <button
                className="pc26-live-results__all"
                type="button"
                onClick={searchAll}
              >
                Ver todos para “{normalizedQuery}”{" "}
                <ArrowRight aria-hidden="true" />
              </button>
            )
          )}
        </div>
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {showPanel && !loading
          ? `${suggestions.length} sugestões disponíveis`
          : ""}
      </span>
    </div>
  );
}
