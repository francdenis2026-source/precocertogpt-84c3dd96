import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, LoaderCircle, RefreshCw, TrendingUp, Users, Wallet } from "lucide-react";
import { supabase } from "../lib/roles";
import "./AdminLicenseManager.css";
import "./AdminCustomersPage.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const fmt = (v: string | null) => (v ? dt.format(new Date(v)) : "—");

type FinanceSummary = {
  total_revenue: number; revenue_30d: number; revenue_7d: number;
  orders_approved_count: number; orders_pending_count: number;
  active_licenses_count: number; customers_count: number;
};
type CustomerRow = {
  user_id: string; email: string | null; display_name: string | null; created_at: string;
  total_spent: number; orders_count: number; last_order_at: string | null;
  active_plan: string | null; active_expires_at: string | null;
};

export function AdminCustomersPage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) return;
    setLoading(true);
    setError("");
    const [{ data: summaryData, error: summaryErr }, { data: customersData, error: customersErr }] = await Promise.all([
      supabase.rpc("admin_finance_summary"),
      supabase.rpc("admin_list_customers"),
    ]);
    setLoading(false);
    if (summaryErr || customersErr) {
      setError(summaryErr?.message || customersErr?.message || "Não foi possível carregar os dados.");
      return;
    }
    setSummary(summaryData as FinanceSummary);
    setCustomers((customersData as CustomerRow[]) || []);
  }

  useEffect(() => { void load(); }, []);

  return (
    <main className="adm-lic">
      <header className="adm-lic__head">
        <div>
          <span className="adm-lic__eyebrow"><Users aria-hidden="true" /> Clientes &amp; Financeiro</span>
          <h1>Clientes e arrecadação</h1>
          <p>Quem está com licença ativa, quanto já pagou, e o total arrecadado pela plataforma.</p>
        </div>
        <Link className="adm-lic__back" to="/admin">Voltar ao painel</Link>
      </header>

      {error && <p className="adm-lic__error">{error}</p>}

      <section className="adm-cust__finance">
        <article><TrendingUp aria-hidden="true" /><div><small>ARRECADADO NO TOTAL</small><strong>{summary ? brl.format(summary.total_revenue) : "—"}</strong></div></article>
        <article><Wallet aria-hidden="true" /><div><small>ÚLTIMOS 30 DIAS</small><strong>{summary ? brl.format(summary.revenue_30d) : "—"}</strong></div></article>
        <article><Wallet aria-hidden="true" /><div><small>ÚLTIMOS 7 DIAS</small><strong>{summary ? brl.format(summary.revenue_7d) : "—"}</strong></div></article>
        <article><BadgeCheck aria-hidden="true" /><div><small>LICENÇAS ATIVAS AGORA</small><strong>{summary?.active_licenses_count ?? "—"}</strong></div></article>
        <article><Users aria-hidden="true" /><div><small>CLIENTES QUE JÁ COMPRARAM</small><strong>{summary?.customers_count ?? "—"}</strong></div></article>
        <article><small className="adm-cust__pending">PENDENTES DE PAGAMENTO</small><strong>{summary?.orders_pending_count ?? "—"}</strong></article>
      </section>

      <div className="adm-lic__card">
        <h2>
          Clientes
          <button className="adm-lic__refresh" type="button" onClick={() => void load()} disabled={loading}>
            {loading ? <LoaderCircle className="spin" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />} Atualizar
          </button>
        </h2>
        {loading ? <p className="adm-lic__muted">Carregando…</p> : !customers.length ? <p className="adm-lic__muted">Nenhum cliente ainda.</p> : (
          <div className="adm-lic__table-wrap">
            <table className="adm-lic__table">
              <thead>
                <tr><th>Cliente</th><th>Total pago</th><th>Compras</th><th>Licença</th><th>Última compra</th></tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.user_id}>
                    <td>
                      <Link className="adm-cust__name-link" to={`/admin/clientes/${customer.user_id}`}>
                        <strong>{customer.display_name || customer.email || "Cliente"}</strong>
                        <small>{customer.email}</small>
                      </Link>
                    </td>
                    <td>{brl.format(customer.total_spent)}</td>
                    <td>{customer.orders_count}</td>
                    <td>
                      {customer.active_plan
                        ? <span className="adm-lic__status adm-lic__status--active">Ativa até {fmt(customer.active_expires_at)}</span>
                        : <span className="adm-cust__inactive">Sem licença ativa</span>}
                    </td>
                    <td>{fmt(customer.last_order_at)}</td>
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
