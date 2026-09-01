import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import {
  deleteOffer,
  loadAdminOffers,
  parsePrice,
  saveOffer,
  uploadOfferImage,
  type OfferInput,
  type PlatformOffer,
} from "../lib/offers";
import "./AdminOffersManager.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type FormState = {
  id?: string;
  title: string;
  productName: string;
  storeName: string;
  categorySlug: string;
  promoPrice: string;
  regularPrice: string;
  imageUrl: string;
  linkUrl: string;
  startsAt: string;
  endsAt: string;
  priority: string;
  isActive: boolean;
};

const EMPTY: FormState = {
  title: "",
  productName: "",
  storeName: "",
  categorySlug: "",
  promoPrice: "",
  regularPrice: "",
  imageUrl: "",
  linkUrl: "/buscar",
  startsAt: "",
  endsAt: "",
  priority: "10",
  isActive: true,
};

const toLocalInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");
const toIso = (local: string) => (local ? new Date(local).toISOString() : null);

/** Aba "Ofertas" do painel administrativo. */
export function AdminOffersManager({ onError }: { onError?: (message: string | null) => void }) {
  const [offers, setOffers] = useState<PlatformOffer[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      setOffers(await loadAdminOffers());
      onError?.(null);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Não foi possível carregar as ofertas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    const payload: OfferInput = {
      id: form.id,
      title: form.title.trim() || form.productName.trim(),
      productName: form.productName,
      storeName: form.storeName || null,
      categorySlug: form.categorySlug || null,
      promoPrice: parsePrice(form.promoPrice),
      regularPrice: parsePrice(form.regularPrice),
      imageUrl: form.imageUrl || null,
      linkUrl: form.linkUrl || "/buscar",
      startsAt: toIso(form.startsAt),
      endsAt: toIso(form.endsAt),
      isActive: form.isActive,
      priority: Number(form.priority) || 0,
    };
    const { error } = await saveOffer(payload);
    setSaving(false);
    if (error) {
      setNotice(error);
      return;
    }
    setForm(EMPTY);
    setNotice("Oferta publicada. As páginas de categoria já mostram o novo preço.");
    await refresh();
  };

  const edit = (offer: PlatformOffer) => {
    setForm({
      id: offer.id,
      title: offer.title,
      productName: offer.productName,
      storeName: offer.storeName ?? "",
      categorySlug: offer.categorySlug ?? "",
      promoPrice: offer.promoPrice !== null ? String(offer.promoPrice) : "",
      regularPrice: offer.regularPrice !== null ? String(offer.regularPrice) : "",
      imageUrl: offer.imageUrl ?? "",
      linkUrl: offer.linkUrl,
      startsAt: toLocalInput(offer.startsAt),
      endsAt: toLocalInput(offer.endsAt),
      priority: String(offer.priority),
      isActive: offer.isActive,
    });
    setNotice(null);
  };

  const remove = async (offer: PlatformOffer) => {
    if (!window.confirm(`Remover a oferta "${offer.productName}"?`)) return;
    const { error } = await deleteOffer(offer.id);
    if (error) setNotice(error);
    await refresh();
  };

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setSaving(true);
    const { url, error } = await uploadOfferImage(file);
    setSaving(false);
    if (error || !url) {
      setNotice(error || "Falha ao enviar a imagem.");
      return;
    }
    setForm(current => ({ ...current, imageUrl: url }));
  };

  return (
    <section className="aom">
      <header className="aom__head">
        <div>
          <h2>Ofertas</h2>
          <p>Preço promocional, validade, imagem e link. Publicado aqui, aparece nas páginas de categoria e setor.</p>
        </div>
        <button type="button" className="aom__ghost" onClick={() => void refresh()}>
          Atualizar lista
        </button>
      </header>

      {notice && <p className="aom__notice">{notice}</p>}

      <form className="aom__form" onSubmit={submit}>
        <label>
          Produto
          <input
            required
            maxLength={140}
            value={form.productName}
            onChange={event => setForm({ ...form, productName: event.target.value })}
            placeholder="Arroz branco 5 kg"
          />
        </label>
        <label>
          Título da oferta
          <input
            maxLength={120}
            value={form.title}
            onChange={event => setForm({ ...form, title: event.target.value })}
            placeholder="Oferta da semana"
          />
        </label>
        <label>
          Estabelecimento
          <input
            maxLength={120}
            value={form.storeName}
            onChange={event => setForm({ ...form, storeName: event.target.value })}
            placeholder="Comércio Bons Amigos"
          />
        </label>
        <label>
          Categoria (slug)
          <input
            maxLength={80}
            value={form.categorySlug}
            onChange={event => setForm({ ...form, categorySlug: event.target.value })}
            placeholder="mercados"
          />
        </label>
        <label>
          Preço promocional
          <input
            required
            inputMode="decimal"
            value={form.promoPrice}
            onChange={event => setForm({ ...form, promoPrice: event.target.value })}
            placeholder="24,90"
          />
        </label>
        <label>
          Preço normal
          <input
            inputMode="decimal"
            value={form.regularPrice}
            onChange={event => setForm({ ...form, regularPrice: event.target.value })}
            placeholder="29,90"
          />
        </label>
        <label>
          Início (opcional)
          <input type="datetime-local" value={form.startsAt} onChange={event => setForm({ ...form, startsAt: event.target.value })} />
        </label>
        <label>
          Validade
          <input required type="datetime-local" value={form.endsAt} onChange={event => setForm({ ...form, endsAt: event.target.value })} />
        </label>
        <label>
          Link
          <input
            maxLength={300}
            value={form.linkUrl}
            onChange={event => setForm({ ...form, linkUrl: event.target.value })}
            placeholder="/produto/arroz-branco-5kg"
          />
        </label>
        <label>
          Prioridade
          <input
            type="number"
            min={0}
            max={999}
            value={form.priority}
            onChange={event => setForm({ ...form, priority: event.target.value })}
          />
        </label>
        <label className="aom__image">
          Imagem
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={event => void pickImage(event.target.files?.[0])}
            />
            <button type="button" className="aom__ghost" onClick={() => fileRef.current?.click()}>
              <Upload aria-hidden="true" /> Enviar foto
            </button>
            {form.imageUrl && <img src={form.imageUrl} alt="Pré-visualização da oferta" />}
          </div>
        </label>
        <label className="aom__check">
          <input type="checkbox" checked={form.isActive} onChange={event => setForm({ ...form, isActive: event.target.checked })} />
          Oferta ativa
        </label>
        <div className="aom__actions">
          <button type="submit" className="aom__primary" disabled={saving}>
            {saving ? <Loader2 className="aom__spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {form.id ? "Salvar alterações" : "Publicar oferta"}
          </button>
          {form.id && (
            <button type="button" className="aom__ghost" onClick={() => setForm(EMPTY)}>
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <div className="aom__list">
        {loading && <p className="aom__empty">Carregando ofertas…</p>}
        {!loading && !offers.length && <p className="aom__empty">Nenhuma oferta cadastrada ainda.</p>}
        {offers.map(offer => (
          <article key={offer.id} className={`aom__card${offer.isActive ? "" : " is-off"}`}>
            {offer.imageUrl && <img src={offer.imageUrl} alt="" loading="lazy" />}
            <div>
              <strong>{offer.productName}</strong>
              <span>
                {offer.promoPrice !== null ? brl.format(offer.promoPrice) : "—"}
                {offer.regularPrice !== null && <s> {brl.format(offer.regularPrice)}</s>}
              </span>
              <small>
                {offer.storeName || "Todos os estabelecimentos"} · {offer.categorySlug || "todas as categorias"} ·
                {offer.endsAt ? ` até ${new Date(offer.endsAt).toLocaleString("pt-BR")}` : " sem validade"}
              </small>
            </div>
            <div className="aom__card-actions">
              <button type="button" className="aom__ghost" onClick={() => edit(offer)}>
                Editar
              </button>
              <button type="button" className="aom__danger" onClick={() => void remove(offer)} aria-label={`Remover ${offer.productName}`}>
                <Trash2 aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AdminOffersManager;
