import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ListChecks, Plus, Sparkles, Store, Trash2, Wallet } from "lucide-react";
import { AppDock, PublicFooter, PublicHeader } from "./PublicChrome";
import { useShoppingLists, type ShoppingListMode } from "../features/shoppingLists/useShoppingLists";
import "./ShoppingLists.css";

const MODES: { id: ShoppingListMode; label: string; hint: string; icon: typeof Store }[] = [
  { id: "search", label: "Busca em lojas distintas", hint: "cada item pelo melhor preço, loja a loja", icon: ListChecks },
  { id: "store", label: "Por estabelecimento", hint: "tudo em uma loja só, para comparar o total", icon: Store },
  { id: "price", label: "Por valor/orçamento", hint: "monta pensando no quanto você quer gastar", icon: Wallet },
];

export function ShoppingListsPage() {
  const { lists, loading, createList, renameList, deleteList } = useShoppingLists();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<ShoppingListMode>("search");
  const [busy, setBusy] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const id = await createList(name, mode);
    setBusy(false);
    if (id) navigate(`/lista/${id}`);
  }

  return <div className="ref-page pc-lists-page">
    <PublicHeader current="basket" />
    <main id="conteudo-principal" className="pc-lists-shell">
      <section className="pc-lists-hero">
        <div>
          <span><ListChecks aria-hidden="true" /> SUAS LISTAS</span>
          <h1>Minhas listas de compras</h1>
          <p>Monte quantas listas quiser à mão, de graça, ou peça para a IA montar uma lista otimizada pelo seu orçamento.</p>
        </div>
        <button type="button" className="pc-lists-new-btn" onClick={() => setCreating(true)}>
          <Plus aria-hidden="true" /> Nova lista
        </button>
      </section>

      {creating && <form className="pc-lists-create" onSubmit={handleCreate}>
        <div className="pc-lists-create__field">
          <label htmlFor="pc-list-name">Nome da lista</label>
          <input id="pc-list-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Compras do mês" autoFocus />
        </div>
        <fieldset className="pc-lists-create__modes">
          <legend>Como você quer montar?</legend>
          {MODES.map(item => {
            const Icon = item.icon;
            return <label key={item.id} className={mode === item.id ? "is-selected" : undefined}>
              <input type="radio" name="mode" checked={mode === item.id} onChange={() => setMode(item.id)} />
              <Icon aria-hidden="true" />
              <span><strong>{item.label}</strong><small>{item.hint}</small></span>
            </label>;
          })}
        </fieldset>
        <div className="pc-lists-create__actions">
          <button type="button" className="pc-lists-cancel" onClick={() => setCreating(false)}>Cancelar</button>
          <button type="submit" disabled={busy}>{busy ? "Criando…" : "Criar lista"}</button>
        </div>
      </form>}

      {loading ? <section className="pc-lists-loading"><span /><strong>Carregando suas listas…</strong></section>
        : !lists.length && !creating ? <section className="pc-lists-empty">
          <div className="pc-lists-empty__icon"><ListChecks aria-hidden="true" /></div>
          <h2>Você ainda não tem nenhuma lista.</h2>
          <p>Crie sua primeira lista manualmente ou deixe a IA montar uma otimizada pelo seu orçamento.</p>
          <div>
            <button type="button" onClick={() => setCreating(true)}><Plus aria-hidden="true" /> Criar minha primeira lista</button>
            <Link to="/cesta"><Sparkles aria-hidden="true" /> Ver cesta rápida</Link>
          </div>
        </section> : <section className="pc-lists-grid">
          {lists.map(list => <article key={list.id} className="pc-lists-card">
            <Link to={`/lista/${list.id}`} className="pc-lists-card__body">
              <span className="pc-lists-card__mode">{MODES.find(m => m.id === list.mode)?.label}{list.source === "ai" && <em><Sparkles aria-hidden="true" /> IA</em>}</span>
              {renamingId === list.id
                ? <input
                    className="pc-lists-card__rename"
                    defaultValue={list.name}
                    autoFocus
                    onClick={e => e.preventDefault()}
                    onBlur={e => { void renameList(list.id, e.target.value); setRenamingId(null); }}
                    onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                  />
                : <h2>{list.name}</h2>}
              <small>{list.itemCount} {list.itemCount === 1 ? "item" : "itens"} · atualizada {new Date(list.updatedAt).toLocaleDateString("pt-BR")}</small>
            </Link>
            <div className="pc-lists-card__actions">
              <button type="button" onClick={() => setRenamingId(list.id)}>Renomear</button>
              <button type="button" className="is-danger" onClick={() => { if (confirm(`Excluir a lista "${list.name}"?`)) void deleteList(list.id); }}><Trash2 aria-hidden="true" /></button>
              <Link to={`/lista/${list.id}`}>Abrir <ArrowRight aria-hidden="true" /></Link>
            </div>
          </article>)}
        </section>}
    </main>
    <AppDock current="basket" />
    <PublicFooter />
  </div>;
}
