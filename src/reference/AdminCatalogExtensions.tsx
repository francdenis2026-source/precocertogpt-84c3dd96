/**
 * Extensões do painel administrativo de catálogo:
 *  - Aba "Lojistas": cada estabelecimento com seus dados de vitrine, foto,
 *    preços e link direto para a página de cidade correspondente.
 *  - Ficha completa da loja (endereço, horário, foto, produtos).
 *  - Preços por estabelecimento dentro do cadastro do produto.
 *  - Carga de catálogo real (produtos com fotos + preço por loja).
 *
 * Todas as gravações reutilizam as RPCs administrativas existentes, portanto
 * respeitam RLS e o papel de admin. Nada aqui usa credencial de serviço.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2, CheckCircle2, Clock, ExternalLink, Eye, ImagePlus, MapPin,
  Pencil, Phone, Sparkles, Store, Tag, Trash2, Upload, X,
} from "lucide-react";
import { supabase } from "../lib/roles";
import {
  deleteAdminProductPrice, saveAdminEstablishmentDetails, setAdminProductPrice,
  uploadAdminStorePhoto,
} from "../lib/adminCatalog";
import { seedAdminCatalog, seedCategories, seedCatalog } from "../lib/adminSeedCatalog";
import { cityForNeighborhood } from "../data/cities";
import "./AdminCatalogExtensions.css";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Endereço pode chegar como texto puro ou JSONB do banco. */
export function readAddress(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    const row = value as Record<string, unknown>;
    return [row.street, row.number, row.district, row.city]
      .map(part => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean)
      .join(", ");
  }
  return "";
}

const storeCity = (store: Record<string, unknown>) => {
  const explicit = typeof store.city === "string" ? store.city.trim() : "";
  if (explicit) return cityForNeighborhood(explicit);
  return cityForNeighborhood(typeof store.neighborhood === "string" ? store.neighborhood : "");
};

/* ========================================================================
   Aba Lojistas — visão por estabelecimento com edição rápida da vitrine
   ======================================================================== */

export interface MerchantPanelProps {
  stores: any[];
  onOpenCatalog: (id: string) => void;
  onEditStore: (store: any) => void;
  onRefresh: () => Promise<void>;
  setError: (message: string) => void;
}

export function MerchantStoresPanel({ stores, onOpenCatalog, onEditStore, onRefresh, setError }: MerchantPanelProps) {
  const [editing, setEditing] = useState<any | null>(null);

  return (
    <>
      <section className="acw-section-head">
        <div>
          <small>ÁREA DO LOJISTA</small>
          <h2>Estabelecimentos e suas vitrines</h2>
          <p>Cada loja com endereço, horário, foto e preços próprios. As alterações aparecem na página da loja e na página da cidade.</p>
        </div>
        <Link to="/cidades" target="_blank" rel="noreferrer"><MapPin />Ver páginas de cidade</Link>
      </section>

      <div className="ace-merchant-grid">
        {stores.map(store => {
          const city = storeCity(store);
          const address = readAddress(store.address);
          const complete = Boolean(address && store.opening_hours && store.photo_url);
          return (
            <article key={store.id} className={complete ? "is-complete" : ""}>
              <div className="ace-merchant-photo">
                {store.photo_url ? <img src={store.photo_url} alt={store.name} loading="lazy" /> : <Store aria-hidden="true" />}
              </div>
              <div className="ace-merchant-body">
                <header>
                  <small>{store.kind || "comércio local"}</small>
                  <h3>{store.name}</h3>
                </header>
                <ul>
                  <li><MapPin aria-hidden="true" />{address || "Endereço não cadastrado"}</li>
                  <li><Building2 aria-hidden="true" />{store.neighborhood || "Bairro não informado"} · {city.name}</li>
                  <li><Clock aria-hidden="true" />{store.opening_hours || "Horário não cadastrado"}</li>
                  <li><Phone aria-hidden="true" />{store.whatsapp || "WhatsApp não cadastrado"}</li>
                </ul>
                <p className="ace-merchant-count"><Tag aria-hidden="true" />{store.product_count || 0} produtos com preço próprio</p>
              </div>
              <footer>
                <button type="button" onClick={() => setEditing(store)}><Pencil aria-hidden="true" />Vitrine</button>
                <button type="button" onClick={() => onOpenCatalog(store.id)}><Tag aria-hidden="true" />Preços</button>
                <button type="button" onClick={() => onEditStore(store)}><Store aria-hidden="true" />Cadastro</button>
                <a href={`/cidade/${city.slug}`} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" />Cidade</a>
              </footer>
            </article>
          );
        })}
      </div>
      {!stores.length && <p className="acw-empty">Nenhum estabelecimento cadastrado ainda.</p>}

      {editing && (
        <StoreShowcaseDialog
          store={editing}
          close={() => setEditing(null)}
          saved={async () => { setEditing(null); await onRefresh(); }}
          setError={setError}
        />
      )}
    </>
  );
}

/** Formulário enxuto do que o lojista mantém: endereço, horário, foto, contato. */
function StoreShowcaseDialog({ store, close, saved, setError }: { store: any; close: () => void; saved: () => Promise<void>; setError: (m: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [photo, setPhoto] = useState<string>(store.photo_url || "");
  const [form, setForm] = useState({
    address: readAddress(store.address),
    city: store.city || storeCity(store).name,
    hours: store.opening_hours || "",
    whatsapp: store.whatsapp || "",
  });

  const upload = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    const result = await uploadAdminStorePhoto(file, String(store.slug || store.name || "loja"));
    setBusy(false);
    if (result.error) { setError(result.error); return; }
    setPhoto(result.url || "");
  };

  const submit = async () => {
    setBusy(true); setNotice("");
    const result = await saveAdminEstablishmentDetails(String(store.id), {
      address: form.address,
      city: form.city,
      openingHours: form.hours,
      photoUrl: photo,
      whatsapp: form.whatsapp,
    });
    setBusy(false);
    if (result.error) { setNotice(result.error); return; }
    await saved();
  };

  return (
    <div className="acw-modal" role="dialog" aria-modal="true" aria-label={`Vitrine de ${store.name}`}>
      <form onSubmit={event => { event.preventDefault(); void submit(); }}>
        <header>
          <div><small>ÁREA DO LOJISTA</small><h2>{store.name}</h2></div>
          <button type="button" onClick={close} aria-label="Fechar"><X /></button>
        </header>
        {notice && <p className="acw-inline-notice">{notice}</p>}
        <div className="acw-form-grid">
          <label className="wide">Endereço completo
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, referência" />
          </label>
          <label>Cidade
            <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Feijó" />
          </label>
          <label>Horário
            <input value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="Seg a sáb, 7h às 20h" />
          </label>
          <label>WhatsApp
            <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="(68) 90000-0000" />
          </label>
          <label className="wide acw-upload">
            <span>Foto da fachada</span>
            <div>
              {photo ? <img src={photo} alt="Prévia da loja" /> : <ImagePlus />}
              <span><Upload />Selecionar foto<small>JPG, PNG ou WebP · máximo 5 MB</small></span>
              <input type="file" accept="image/*" onChange={e => void upload(e.target.files?.[0])} />
            </div>
          </label>
        </div>
        <footer>
          <button type="button" className="ghost" onClick={close}>Cancelar</button>
          <button disabled={busy}>{busy ? "Salvando…" : "Salvar vitrine"}</button>
        </footer>
      </form>
    </div>
  );
}

/* ========================================================================
   Ficha da loja exibida acima do catálogo por estabelecimento
   ======================================================================== */

export function StoreProfileHeader({ store }: { store?: any }) {
  if (!store) return null;
  const city = storeCity(store);
  const address = readAddress(store.address);
  return (
    <section className="ace-store-profile">
      <div className="ace-store-profile__photo">
        {store.photo_url ? <img src={store.photo_url} alt={store.name} /> : <Store aria-hidden="true" />}
      </div>
      <div className="ace-store-profile__data">
        <small>{store.is_verified ? "ESTABELECIMENTO VERIFICADO" : "ESTABELECIMENTO CADASTRADO"}</small>
        <h3>{store.name}</h3>
        <ul>
          <li><MapPin aria-hidden="true" />{address || "Endereço não cadastrado"}</li>
          <li><Building2 aria-hidden="true" />{store.neighborhood || "Bairro não informado"} · {city.name} / {city.state}</li>
          <li><Clock aria-hidden="true" />{store.opening_hours || "Horário não cadastrado"}</li>
          <li><Phone aria-hidden="true" />{store.whatsapp || "WhatsApp não cadastrado"}</li>
        </ul>
      </div>
      <div className="ace-store-profile__links">
        <a href={`/estabelecimento/${store.slug || store.id}`} target="_blank" rel="noreferrer"><Eye aria-hidden="true" />Página da loja</a>
        <a href={`/cidade/${city.slug}`} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" />Página de {city.name}</a>
      </div>
    </section>
  );
}

/* ========================================================================
   Preços por estabelecimento dentro do cadastro do produto
   ======================================================================== */

type PriceRow = { establishment_id: string; value: number };

export function ProductStorePrices({ productId, stores, setError }: { productId?: string | null; stores: any[]; setError: (m: string) => void }) {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(Boolean(productId));
  const [busy, setBusy] = useState("");

  const load = async () => {
    if (!productId || !supabase) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("prices").select("establishment_id, value").eq("product_id", productId);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setRows((data || []) as PriceRow[]);
  };

  useEffect(() => { void load(); }, [productId]);

  const byStore = useMemo(() => new Map(rows.map(row => [String(row.establishment_id), Number(row.value)])), [rows]);

  if (!productId) {
    return <p className="ace-prices-hint">Salve o produto para liberar o cadastro de preços em cada estabelecimento.</p>;
  }

  const change = async (storeId: string, current?: number) => {
    const raw = prompt("Preço neste estabelecimento (R$):", current ? String(current) : "");
    if (raw === null) return;
    const value = Number(raw.replace(",", "."));
    if (!value || value <= 0) return;
    setBusy(storeId);
    const result = await setAdminProductPrice(productId, storeId, value);
    setBusy("");
    if (result.error) setError(result.error);
    else await load();
  };

  const remove = async (storeId: string) => {
    setBusy(storeId);
    const result = await deleteAdminProductPrice(productId, storeId);
    setBusy("");
    if (result.error) setError(result.error);
    else await load();
  };

  return (
    <div className="ace-prices">
      <header><strong>Preços por estabelecimento</strong><small>{byStore.size} de {stores.length} lojas com preço</small></header>
      {loading ? <p className="ace-prices-hint">Carregando preços…</p> : (
        <ul>
          {stores.map(store => {
            const value = byStore.get(String(store.id));
            return (
              <li key={store.id} className={value ? "has-price" : ""}>
                <span>{store.name}<small>{store.neighborhood || "Feijó"}</small></span>
                <b>{value ? money.format(value) : "sem preço"}</b>
                <button type="button" disabled={busy === store.id} onClick={() => void change(String(store.id), value)}>
                  <Tag aria-hidden="true" />{value ? "Alterar" : "Cadastrar"}
                </button>
                {value ? (
                  <button type="button" className="danger" disabled={busy === store.id} onClick={() => void remove(String(store.id))}>
                    <Trash2 aria-hidden="true" />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ========================================================================
   Carga de catálogo real
   ======================================================================== */

export function SeedCatalogDialog({ stores, close, done }: { stores: any[]; close: () => void; done: () => Promise<void> }) {
  const [selected, setSelected] = useState<string[]>(stores.slice(0, 2).map(store => String(store.id)));
  const [categories, setCategories] = useState<string[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0, label: "" });
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<{ created: number; prices: number; errors: string[] } | null>(null);

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter(item => item !== value) : [...list, value];

  const run = async () => {
    setRunning(true); setReport(null);
    const result = await seedAdminCatalog({
      storeIds: selected,
      categories,
      onProgress: (doneCount, total, label) => setProgress({ done: doneCount, total, label }),
    });
    setRunning(false);
    setReport(result);
    if (result.created) await done();
  };

  const total = categories.length ? seedCatalog.filter(item => categories.includes(item.category)).length : seedCatalog.length;

  return (
    <div className="acw-modal" role="dialog" aria-modal="true" aria-label="Popular catálogo com produtos reais">
      <form onSubmit={event => { event.preventDefault(); void run(); }}>
        <header>
          <div><small>CATÁLOGO REAL</small><h2>Popular produtos com fotos e preços</h2></div>
          <button type="button" onClick={close} aria-label="Fechar"><X /></button>
        </header>
        <p className="ace-seed-intro">
          {total} produtos com foto real serão cadastrados e receberão um preço em cada estabelecimento selecionado —
          preenchendo as listas de categoria e as páginas de cidade.
        </p>
        <div className="ace-seed-pick">
          <fieldset>
            <legend>Estabelecimentos que recebem os preços</legend>
            <div>
              {stores.map(store => (
                <label key={store.id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(String(store.id))}
                    onChange={() => setSelected(list => toggle(list, String(store.id)))}
                  />
                  {store.name}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Categorias (vazio = todas)</legend>
            <div>
              {seedCategories.map(category => (
                <label key={category}>
                  <input
                    type="checkbox"
                    checked={categories.includes(category)}
                    onChange={() => setCategories(list => toggle(list, category))}
                  />
                  {category}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {running && (
          <div className="ace-seed-progress" role="status" aria-live="polite">
            <span style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
            <small>{progress.done}/{progress.total} · {progress.label}</small>
          </div>
        )}

        {report && (
          <div className={report.errors.length ? "ace-seed-report has-errors" : "ace-seed-report"}>
            <p><CheckCircle2 aria-hidden="true" />{report.created} produtos e {report.prices} preços gravados.</p>
            {report.errors.length > 0 && (
              <ul>{report.errors.slice(0, 6).map((message, index) => <li key={index}>{message}</li>)}</ul>
            )}
          </div>
        )}

        <footer>
          <button type="button" className="ghost" onClick={close}>{report ? "Fechar" : "Cancelar"}</button>
          <button disabled={running || !selected.length}>
            <Sparkles aria-hidden="true" />{running ? "Cadastrando…" : "Cadastrar catálogo real"}
          </button>
        </footer>
      </form>
    </div>
  );
}
