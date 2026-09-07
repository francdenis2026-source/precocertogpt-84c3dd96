import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ListChecks, LoaderCircle, Minus, PackageSearch, Plus, Search,
  Sparkles, Store, Trash2, Wallet, X,
} from "lucide-react";
import { fetchCatalog } from "../data/remoteCatalog";
import type { Product, StoreRow } from "../data/catalog";
import { resolveProductImage } from "../data/productImageResolver";
import { AppDock, PublicFooter, PublicHeader } from "./PublicChrome";
import { SubscriberGate } from "../components/access/SubscriberGate";
import { supabase } from "../lib/supabase";
import { useShoppingListItems } from "../features/shoppingLists/useShoppingListItems";
import type { ShoppingListMode } from "../features/shoppingLists/useShoppingLists";
import "./ShoppingLists.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const MODE_LABEL: Record<ShoppingListMode, string> = {
  search: "Busca em lojas distintas",
  store: "Por estabelecimento",
  price: "Por valor/orçamento",
};

function ProductThumb({ product }: { product: Product }) {
  const source = resolveProductImage(product);
  const [failed, setFailed] = useState(false);
  if (source && !failed) return <img src={source} alt={product.name} loading="lazy" onError={() => setFailed(true)} />;
  return <PackageSearch aria-hidden="true" />;
}

function ProductPicker({ products, onPick }: { products: Product[]; onPick: (id: string | number) => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 8);
  }, [query, products]);

  return <div className="pc-lists-picker">
    <div className="pc-lists-picker__input">
      <Search aria-hidden="true" />
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar produto para adicionar…" />
      {query && <button type="button" onClick={() => setQuery("")}><X aria-hidden="true" /></button>}
    </div>
    {results.length > 0 && <ul className="pc-lists-picker__results">
      {results.map(product => <li key={product.id}>
        <button type="button" onClick={() => { onPick(product.id); setQuery(""); }}>
          <ProductThumb product={product} />
          <span><strong>{product.name}</strong><small>{[product.brand, product.size].filter(Boolean).join(" · ") || product.category}</small></span>
          <em>{brl.format(product.minPrice)}</em>
        </button>
      </li>)}
    </ul>}
  </div>;
}

function AiPanel({ budget, people, catalog, onApplied }: {
  budget: number; people: number; catalog: Product[];
  onApplied: (items: { productId: string; quantity: number }[]) => Promise<void>;
}) {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState<{ items: { productId: string; quantity: number }[]; message: string } | null>(null);

  async function runAi() {
    if (!supabase) return;
    setBusy(true);
    setError("");
    setSuggestion(null);
    const catalogPayload = catalog.slice(0, 220).map(p => ({ id: String(p.id), name: p.name, category: p.category, minPrice: p.minPrice }));
    const { data, error: fnError } = await supabase.functions.invoke<{ items?: { productId: string; quantity: number }[]; message?: string; error?: string }>(
      "shopping-list-ai",
      { body: { budget, people, notes, catalog: catalogPayload } },
    );
    setBusy(false);
    if (fnError || !data || data.error || !data.items) {
      setError(data?.error || "Não foi possível montar a lista agora. Tente novamente.");
      return;
    }
    setSuggestion({ items: data.items, message: data.message || "" });
  }

  return <div className="pc-lists-ai">
    <p className="pc-lists-ai__intro"><Sparkles aria-hidden="true" /> Diga o que você precisa e a IA escolhe os produtos do catálogo que cabem no seu orçamento.</p>
    <textarea
      value={notes}
      onChange={e => setNotes(e.target.value)}
      placeholder="Ex.: quero itens de mercado básicos, sem carne, priorizando limpeza e higiene…"
      rows={3}
    />
    <button type="button" onClick={() => void runAi()} disabled={busy}>
      {busy ? <LoaderCircle className="spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />} {busy ? "Montando lista…" : "Montar lista com IA"}
    </button>
    {error && <p className="pc-lists-ai__error">{error}</p>}
    {suggestion && <div className="pc-lists-ai__result">
      <p>{suggestion.message}</p>
      <strong>{suggestion.items.length} produtos sugeridos</strong>
      <button type="button" onClick={() => void onApplied(suggestion.items)}>Aplicar esta lista</button>
    </div>}
  </div>;
}

export function ShoppingListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    meta, resolved, loading, total, itemCount, storeCount, missingAtStore,
    addItem, setQuantity, removeItem, setListMode, applyBulk,
  } = useShoppingListItems(id);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [showAi, setShowAi] = useState(false);
  const [budgetInput, setBudgetInput] = useState("150");
  const [peopleInput, setPeopleInput] = useState("3");

  useEffect(() => {
    let active = true;
    fetchCatalog().then(data => { if (active) { setCatalog(data.products); setStores(data.stores); } });
    return () => { active = false; };
  }, []);

  const mode = meta?.mode ?? "search";
  const targetStore = stores.find(s => String(s.id) === meta?.targetEstablishmentId);

  if (loading) return <main className="pc-lists-state"><LoaderCircle className="spin" aria-hidden="true" /><strong>Carregando sua lista…</strong></main>;
  if (!meta) return <main className="pc-lists-state"><strong>Lista não encontrada.</strong><Link to="/minhas-listas">Voltar para minhas listas</Link></main>;

  return <div className="ref-page pc-lists-page">
    <PublicHeader current="basket" />
    <main id="conteudo-principal" className="pc-lists-shell">
      <Link to="/minhas-listas" className="pc-lists-back"><ArrowLeft aria-hidden="true" /> Minhas listas</Link>

      <section className="pc-lists-hero pc-lists-hero--detail">
        <div>
          <span><ListChecks aria-hidden="true" /> {MODE_LABEL[mode]}</span>
          <h1>{meta.name}</h1>
        </div>
        <div className="pc-lists-kpis">
          <article><small>ITENS</small><strong>{itemCount}</strong></article>
          <article><small>TOTAL ESTIMADO</small><strong>{brl.format(total)}</strong></article>
          <article><small>ESTABELECIMENTOS</small><strong>{storeCount || "—"}</strong></article>
        </div>
      </section>

      <div className="pc-lists-mode-switch" role="group" aria-label="Modo de montagem">
        <button type="button" className={mode === "search" ? "is-active" : undefined} onClick={() => void setListMode("search")}>
          <ListChecks aria-hidden="true" /> Busca em lojas distintas
        </button>
        <button type="button" className={mode === "price" ? "is-active" : undefined} onClick={() => void setListMode("price")}>
          <Wallet aria-hidden="true" /> Por valor/orçamento
        </button>
        <button type="button" className={mode === "store" ? "is-active" : undefined} onClick={() => void setListMode("store", meta.targetEstablishmentId)}>
          <Store aria-hidden="true" /> Por estabelecimento
        </button>
      </div>

      {mode === "store" && <div className="pc-lists-store-picker">
        <label htmlFor="pc-lists-store-select">Comparar tudo nesta loja:</label>
        <select id="pc-lists-store-select" value={meta.targetEstablishmentId ?? ""} onChange={e => void setListMode("store", e.target.value || null)}>
          <option value="">Escolher estabelecimento…</option>
          {stores.map(store => <option key={store.id} value={String(store.id)}>{store.name}</option>)}
        </select>
        {missingAtStore > 0 && <small className="pc-lists-store-warning">{missingAtStore} {missingAtStore === 1 ? "item não está disponível" : "itens não estão disponíveis"} nesta loja.</small>}
      </div>}

      <ProductPicker products={catalog} onPick={id => void addItem(id)} />

      <section className="pc-lists-ai-toggle">
        <button type="button" onClick={() => setShowAi(v => !v)}><Sparkles aria-hidden="true" /> {showAi ? "Fechar montagem por IA" : "Montar (ou completar) esta lista com IA"}</button>
      </section>

      {showAi && <section className="pc-lists-ai-wrap">
        <SubscriberGate tool="A montagem de listas por IA" plan="cesta_inteligente">
          <div className="pc-lists-ai-inputs">
            <label>Orçamento <input type="number" min={1} value={budgetInput} onChange={e => setBudgetInput(e.target.value)} /></label>
            <label>Pessoas na casa <input type="number" min={1} value={peopleInput} onChange={e => setPeopleInput(e.target.value)} /></label>
          </div>
          <AiPanel
            budget={Number(budgetInput) || 0}
            people={Number(peopleInput) || 1}
            catalog={catalog}
            onApplied={async items => { await applyBulk(items); setShowAi(false); }}
          />
        </SubscriberGate>
      </section>}

      {!resolved.length ? <section className="pc-lists-empty">
        <div className="pc-lists-empty__icon"><ListChecks aria-hidden="true" /></div>
        <h2>Essa lista ainda está vazia.</h2>
        <p>Busque produtos acima ou peça para a IA montar uma lista pelo seu orçamento.</p>
      </section> : <section className="pc-lists-items">
        {resolved.map(row => <article key={String(row.product.id)} className={row.unavailableAtStore ? "pc-lists-item is-unavailable" : "pc-lists-item"}>
          <div className="pc-lists-item__product"><span className="pc-lists-thumb"><ProductThumb product={row.product} /></span>
            <span><small>{row.product.category}</small><strong>{row.product.name}</strong><em>{[row.product.brand, row.product.size].filter(Boolean).join(" · ")}</em></span>
          </div>
          <div className="pc-lists-item__qty">
            <button type="button" onClick={() => void setQuantity(row.product.id, row.quantity - 1)} aria-label={`Diminuir ${row.product.name}`}>{row.quantity === 1 ? <Trash2 aria-hidden="true" /> : <Minus aria-hidden="true" />}</button>
            <strong>{row.quantity}</strong>
            <button type="button" onClick={() => void setQuantity(row.product.id, row.quantity + 1)} aria-label={`Aumentar ${row.product.name}`}><Plus aria-hidden="true" /></button>
          </div>
          <div className="pc-lists-item__price">
            {row.unavailableAtStore ? <small>Não disponível em {targetStore?.name || "loja escolhida"}</small> : <><strong>{brl.format(row.unitPrice ?? 0)}</strong><small>{row.establishment || "Comércio local"}</small></>}
          </div>
          <div className="pc-lists-item__total"><strong>{row.unavailableAtStore ? "—" : brl.format((row.unitPrice ?? 0) * row.quantity)}</strong></div>
          <button className="pc-lists-item__remove" type="button" onClick={() => void removeItem(row.product.id)} aria-label={`Remover ${row.product.name}`}><Trash2 aria-hidden="true" /></button>
        </article>)}
      </section>}
    </main>
    <AppDock current="basket" />
    <PublicFooter />
  </div>;
}
