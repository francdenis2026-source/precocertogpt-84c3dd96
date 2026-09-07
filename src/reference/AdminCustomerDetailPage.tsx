import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CreditCard, KeyRound, LoaderCircle } from "lucide-react";
import { supabase } from "../lib/roles";
import "./AdminLicenseManager.css";
import "./AdminCustomersPage.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const fmt = (v: string | null) => (v ? dt.format(new Date(v)) : "—");

const roleLabel: Record<string, string> = {
  super_admin: "Superadministrador", admin: "Administrador", moderator: "Moderador",
  merchant_owner: "Responsável por estabelecimento", merchant_staff: "Equipe do estabelecimento", consumer: "Consumidor",
};
const STATUS_LABELS: Record<string, string> = { pending: "Pendente", approved: "Pago", rejected: "Recusado", cancelled: "Cancelado", active: "Ativa", revoked: "Revogada", expired: "Expirada" };

type Profile = { user_id: string; email: string | null; display_name: string | null; created_at: string; last_sign_in_at: string | null; roles: string[] };
type LicenseRow = { license_key: string; status: string; plan: string; activated_at: string | null; expires_at: string | null; revoked_at: string | null; created_at: string };
type OrderRow = { plan: string; plan_key: string; days: number; amount: number; status: string; created_at: string };

function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join("") || "?";
}

export function AdminCustomerDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase || !userId) return;
      setLoading(true);
      const { data, error: err } = await supabase.rpc("admin_customer_detail", { _user_id: userId });
      if (!active) return;
      setLoading(false);
      const result = data as { ok?: boolean; error?: string; profile?: Profile; licenses?: LicenseRow[]; orders?: OrderRow[] } | null;
      if (err || !result?.ok) {
        setError(result?.error || err?.message || "Não foi possível carregar este cliente.");
        return;
      }
      setProfile(result.profile ?? null);
      setLicenses(result.licenses ?? []);
      setOrders(result.orders ?? []);
    }
    void load();
    return () => { active = false; };
  }, [userId]);

  if (loading) return <main className="adm-lic"><p className="adm-lic__muted"><LoaderCircle className="spin" aria-hidden="true" /> Carregando cliente…</p></main>;
  if (error || !profile) return <main className="adm-lic"><p className="adm-lic__error">{error || "Cliente não encontrado."}</p><Link className="adm-lic__back" to="/admin/clientes">Voltar</Link></main>;

  const totalSpent = orders.filter(o => o.status === "approved").reduce((sum, o) => sum + o.amount, 0);

  return (
    <main className="adm-cust__detail">
      <Link className="adm-lic__back" to="/admin/clientes">Voltar aos clientes</Link>

      <section className="adm-cust__profile">
        <span className="adm-cust__avatar">{initials(profile.display_name || profile.email || "?")}</span>
        <div>
          <h1>{profile.display_name || "Cliente sem nome"}</h1>
          <p>{profile.email} · cadastrado em {fmt(profile.created_at)} · último acesso {fmt(profile.last_sign_in_at)}</p>
          <div className="adm-cust__profile__chips">
            {profile.roles.length ? profile.roles.map(r => <span key={r}>{roleLabel[r] || r}</span>) : <span>Consumidor</span>}
          </div>
        </div>
      </section>

      <section className="adm-cust__finance">
        <article><CreditCard aria-hidden="true" /><div><small>TOTAL PAGO</small><strong>{brl.format(totalSpent)}</strong></div></article>
        <article><KeyRound aria-hidden="true" /><div><small>LICENÇAS EMITIDAS</small><strong>{licenses.length}</strong></div></article>
      </section>

      <div className="adm-lic__card">
        <h2>Licenças</h2>
        {!licenses.length ? <p className="adm-lic__muted">Nenhuma licença gerada para este cliente.</p> : (
          <div className="adm-lic__table-wrap">
            <table className="adm-lic__table">
              <thead><tr><th>Código</th><th>Plano</th><th>Status</th><th>Ativada em</th><th>Expira em</th></tr></thead>
              <tbody>
                {licenses.map(license => (
                  <tr key={license.license_key}>
                    <td><code>{license.license_key}</code></td>
                    <td>{license.plan}</td>
                    <td><span className={license.status === "active" ? "adm-lic__status adm-lic__status--active" : "adm-lic__status adm-lic__status--revoked"}>{STATUS_LABELS[license.status] || license.status}</span></td>
                    <td>{fmt(license.activated_at)}</td>
                    <td>{fmt(license.expires_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="adm-lic__card">
        <h2>Histórico de pagamentos</h2>
        {!orders.length ? <p className="adm-lic__muted">Nenhum pedido registrado.</p> : (
          <div className="adm-lic__table-wrap">
            <table className="adm-lic__table">
              <thead><tr><th>Plano</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.plan} · {order.days} dias</td>
                    <td>{brl.format(order.amount)}</td>
                    <td><span className={order.status === "approved" ? "adm-lic__status adm-lic__status--active" : "adm-lic__status adm-lic__status--revoked"}>{STATUS_LABELS[order.status] || order.status}</span></td>
                    <td>{fmt(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
