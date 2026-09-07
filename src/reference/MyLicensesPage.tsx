import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Clock, CreditCard, KeyRound, LoaderCircle, ShieldOff, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import { AppDock, PublicFooter, PublicHeader } from "./PublicChrome";
import "./MyLicensesPage.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const fmt = (v: string | null) => (v ? dt.format(new Date(v)) : "—");

const PLAN_LABELS: Record<string, string> = { cesta_inteligente: "Cesta Inteligente" };
const STATUS_LABELS: Record<string, string> = { pending: "Aguardando pagamento", approved: "Pago", rejected: "Recusado", cancelled: "Cancelado" };

type LicenseRow = {
  id: string; license_key: string; status: string; plan: string;
  activated_at: string | null; expires_at: string | null; revoked_at: string | null; created_at: string;
};
type OrderRow = {
  id: string; plan: string; plan_key: string; days: number; amount: number;
  status: string; license_id: string | null; created_at: string;
};

export function MyLicensesPage() {
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;
      if (!userId) { setLoading(false); return; }

      const [{ data: licenseRows }, { data: orderRows }] = await Promise.all([
        supabase.from("licenses").select("id, license_key, status, plan, activated_at, expires_at, revoked_at, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("license_orders").select("id, plan, plan_key, days, amount, status, license_id, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      setLicenses(licenseRows ?? []);
      setOrders(orderRows ?? []);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const now = Date.now();
  const activeLicense = licenses.find(license =>
    license.status === "active" && (!license.expires_at || new Date(license.expires_at).getTime() > now)
  );

  if (loading) return <main className="my-lic-state"><LoaderCircle className="spin" aria-hidden="true" /><strong>Carregando suas licenças…</strong></main>;

  return <div className="ref-page my-lic-page">
    <PublicHeader current="basket" />
    <main id="conteudo-principal" className="my-lic-shell">
      <Link to="/minha-conta" className="my-lic-back"><ArrowLeft aria-hidden="true" /> Minha conta</Link>

      <section className="my-lic-hero">
        <span><KeyRound aria-hidden="true" /> ACESSO PAGO</span>
        <h1>Minhas licenças</h1>
        <p>Veja o status da sua licença ativa, o valor pago e o histórico completo de compras.</p>
      </section>

      <section className={activeLicense ? "my-lic-status is-active" : "my-lic-status is-empty"}>
        {activeLicense ? <>
          <span className="my-lic-status__icon"><BadgeCheck aria-hidden="true" /></span>
          <div>
            <strong>{PLAN_LABELS[activeLicense.plan] || activeLicense.plan} ativa</strong>
            <p>Código <code>{activeLicense.license_key}</code></p>
            <div className="my-lic-status__meta">
              <span><Clock aria-hidden="true" /> Válida até {activeLicense.expires_at ? fmt(activeLicense.expires_at) : "sem validade definida"}</span>
              <span>Ativada em {fmt(activeLicense.activated_at)}</span>
            </div>
          </div>
        </> : <>
          <span className="my-lic-status__icon"><ShieldOff aria-hidden="true" /></span>
          <div>
            <strong>Nenhuma licença ativa no momento</strong>
            <p>Compre um plano da Cesta Inteligente para liberar o acesso.</p>
            <Link className="my-lic-status__cta" to="/cesta-inteligente"><Sparkles aria-hidden="true" /> Ver planos</Link>
          </div>
        </>}
      </section>

      <section className="my-lic-history">
        <header><CreditCard aria-hidden="true" /> <h2>Histórico de compras</h2></header>
        {!orders.length ? <p className="my-lic-history__empty">Você ainda não fez nenhuma compra de licença.</p> : <div className="my-lic-history__list">
          {orders.map(order => {
            const license = order.license_id ? licenses.find(l => l.id === order.license_id) : null;
            return <article key={order.id} className="my-lic-row">
              <div>
                <strong>{PLAN_LABELS[order.plan] || order.plan}</strong>
                <small>{order.days} {order.days === 1 ? "dia" : "dias"} de acesso · comprado em {fmt(order.created_at)}</small>
              </div>
              <div className="my-lic-row__amount"><strong>{brl.format(order.amount)}</strong></div>
              <div className={`my-lic-row__status is-${order.status}`}>{STATUS_LABELS[order.status] || order.status}</div>
              <div className="my-lic-row__expiry">{license?.expires_at ? <span>Válido até {fmt(license.expires_at)}</span> : order.status === "approved" ? <span>—</span> : null}</div>
            </article>;
          })}
        </div>}
      </section>
    </main>
    <AppDock current="basket" />
    <PublicFooter />
  </div>;
}
