import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, KeyRound, Loader2, MessageCircle, RefreshCw, ShieldBan, Sparkles } from "lucide-react";
import { supabase } from "../lib/roles";
import { whatsappSalesLink } from "../lib/contact";
import "./AdminLicenseManager.css";

type LicenseRow = {
  license_key: string;
  status: string;
  user_email: string | null;
  activated_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string | null;
};

const dt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const fmt = (v: string | null) => (v ? dt.format(new Date(v)) : "—");

function whatsappLink(licenseKey: string) {
  return whatsappSalesLink(
    `Olá! Aqui está seu código de acesso à Cesta Inteligente do PreçoCerto: ${licenseKey}\n\nBasta colar esse código na tela de desbloqueio dentro do app. Qualquer dúvida, é só chamar por aqui. 🛒`
  );
}

export function AdminLicenseManager() {
  const [rows, setRows] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState("30");
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<{ key: string; expires: string | null } | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase.rpc("list_licenses", { _plan: "cesta_inteligente" });
    setLoading(false);
    if (err) {
      setError(err.message || "Não foi possível carregar as licenças.");
      return;
    }
    setRows((data as LicenseRow[]) || []);
  };

  useEffect(() => { void load(); }, []);

  async function generate(event: FormEvent) {
    event.preventDefault();
    if (!supabase || generating) return;
    setGenerating(true);
    setError("");
    const parsedDays = days.trim() ? Number(days) : null;
    const { data, error: err } = await supabase.rpc("generate_license_key", {
      _plan: "cesta_inteligente",
      _days: parsedDays && parsedDays > 0 ? parsedDays : null,
    });
    setGenerating(false);
    const result = data as { ok?: boolean; error?: string; license_key?: string; expires_at?: string | null } | null;
    if (err || !result?.ok) {
      setError(result?.error || err?.message || "Não foi possível gerar o código.");
      return;
    }
    setLastGenerated({ key: result.license_key!, expires: result.expires_at ?? null });
    await load();
  }

  async function revoke(licenseKey: string) {
    if (!supabase) return;
    setBusyKey(licenseKey);
    const { data, error: err } = await supabase.rpc("revoke_license_key", { _license_key: licenseKey });
    setBusyKey(null);
    const result = data as { ok?: boolean; error?: string } | null;
    if (err || !result?.ok) {
      setError(result?.error || err?.message || "Não foi possível revogar este código.");
      return;
    }
    await load();
  }

  return (
    <main className="adm-lic">
      <header className="adm-lic__head">
        <div>
          <span className="adm-lic__eyebrow"><Sparkles aria-hidden="true" /> Cesta Inteligente</span>
          <h1>Licenças e vendas por PIX</h1>
          <p>Gere um código, cobre por PIX e envie o código pelo WhatsApp. O cliente cola o código na tela de desbloqueio e o acesso libera na hora.</p>
        </div>
        <Link className="adm-lic__back" to="/admin">Voltar ao painel</Link>
      </header>

      <section className="adm-lic__card">
        <h2><KeyRound aria-hidden="true" /> Gerar novo código</h2>
        <form className="adm-lic__gen" onSubmit={generate}>
          <label htmlFor="adm-lic-days">Duração (dias, vazio = vitalício)</label>
          <div className="adm-lic__gen-row">
            <input
              id="adm-lic-days"
              type="number"
              min={1}
              inputMode="numeric"
              value={days}
              onChange={event => setDays(event.target.value)}
              placeholder="Ex.: 30"
            />
            <button type="submit" disabled={generating}>
              {generating ? <Loader2 className="spin" aria-hidden="true" /> : "Gerar código"}
            </button>
          </div>
        </form>

        {lastGenerated && (
          <div className="adm-lic__result">
            <span className="adm-lic__key">{lastGenerated.key}</span>
            <span className="adm-lic__expires">
              {lastGenerated.expires ? `Expira em ${fmt(lastGenerated.expires)}` : "Sem expiração"}
            </span>
            <div className="adm-lic__result-actions">
              <button type="button" onClick={() => navigator.clipboard?.writeText(lastGenerated.key)}>
                <Copy aria-hidden="true" /> Copiar
              </button>
              <a href={whatsappLink(lastGenerated.key)} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden="true" /> Enviar pelo WhatsApp
              </a>
            </div>
          </div>
        )}

        {error && <p className="adm-lic__error" role="alert">{error}</p>}
      </section>

      <section className="adm-lic__card">
        <h2>
          Códigos emitidos
          <button type="button" className="adm-lic__refresh" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={loading ? "spin" : ""} aria-hidden="true" /> Atualizar
          </button>
        </h2>

        {loading ? (
          <p className="adm-lic__muted">Carregando…</p>
        ) : rows.length === 0 ? (
          <p className="adm-lic__muted">Nenhum código gerado ainda.</p>
        ) : (
          <div className="adm-lic__table-wrap">
            <table className="adm-lic__table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Status</th>
                  <th>Usado por</th>
                  <th>Ativado em</th>
                  <th>Expira em</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.license_key}>
                    <td><code>{row.license_key}</code></td>
                    <td><span className={`adm-lic__status adm-lic__status--${row.status}`}>{row.status}</span></td>
                    <td>{row.user_email || "—"}</td>
                    <td>{fmt(row.activated_at)}</td>
                    <td>{fmt(row.expires_at)}</td>
                    <td>
                      {row.status === "active" && (
                        <button
                          type="button"
                          className="adm-lic__revoke"
                          disabled={busyKey === row.license_key}
                          onClick={() => void revoke(row.license_key)}
                        >
                          {busyKey === row.license_key ? <Loader2 className="spin" aria-hidden="true" /> : <ShieldBan aria-hidden="true" />}
                          Revogar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminLicenseManager;
